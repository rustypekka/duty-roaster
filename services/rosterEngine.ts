
import { Personnel, AbsenceRecord, Holiday, RosterDay, DayType } from '../types.ts';
import { isSameDate, isWithinRange } from '../utils/dateUtils.ts';

export const generateDailyRoster = (
  date: string,
  personnel: Personnel[],
  absences: AbsenceRecord[],
  holidays: Holiday[],
  exemptDates: string[],
  previousAssignments: string[], // Personnel IDs assigned in the last few days to avoid repeats
  requiredCount: number = 2
): RosterDay => {
  // Determine Day Type
  const d = new Date(date);
  let type = DayType.REGULAR;
  if (d.getDay() === 0) type = DayType.SUNDAY;
  if (holidays.some(h => isSameDate(h.date, date))) type = DayType.HOLIDAY;
  
  // Check for exemption
  const isExempt = exemptDates.some(ed => isSameDate(ed, date));
  if (isExempt) {
    return {
      date,
      type: DayType.EXEMPT,
      requiredPersonnel: 0,
      assignedPersonnelIds: [],
      manualOverride: false,
      notes: 'Duty Exempt'
    };
  }

  // Filter available personnel
  const available = personnel.filter(p => {
    if (!p.active) return false;
    
    // Check if on leave or excused
    const isAbsent = absences.some(a => isWithinRange(date, a.startDate, a.endDate));
    if (isAbsent) return false;

    // Avoid assigning if they were on duty yesterday
    if (previousAssignments.includes(p.id)) return false;

    return true;
  });

  // Sort by duty count (Fair rotation)
  // Those with fewer duties are picked first. 
  // We also use name as a secondary sort to maintain consistent order when counts are equal.
  const sorted = [...available].sort((a, b) => {
    if (a.dutyCount !== b.dutyCount) {
      return a.dutyCount - b.dutyCount;
    }
    return a.name.localeCompare(b.name);
  });

  // Select top N
  const selectedIds = sorted.slice(0, requiredCount).map(p => p.id);

  return {
    date,
    type,
    requiredPersonnel: requiredCount,
    assignedPersonnelIds: selectedIds,
    manualOverride: false,
    notes: type !== DayType.REGULAR ? (type === DayType.SUNDAY ? 'Sunday Roster' : 'Holiday Roster') : ''
  };
};

export const generateRoster = (
  dates: string[],
  personnel: Personnel[],
  absences: AbsenceRecord[],
  holidays: Holiday[],
  exemptDates: string[],
  config: { regular: number; special: number } = { regular: 2, special: 2 }
): RosterDay[] => {
  const roster: RosterDay[] = [];
  let rollingRecentAssignments: string[] = [];
  
  // We create a local copy of personnel to track simulated duty counts 
  // during the generation process so that the rotation is fair.
  let simulatedPersonnel = personnel.map(p => ({ ...p }));

  dates.forEach((date) => {
    const d = new Date(date);
    const isSpecial = d.getDay() === 0 || holidays.some(h => isSameDate(h.date, date));
    const requiredCount = isSpecial ? config.special : config.regular;

    const dayRoster = generateDailyRoster(
      date, 
      simulatedPersonnel, 
      absences, 
      holidays, 
      exemptDates,
      rollingRecentAssignments,
      requiredCount
    );
    
    roster.push(dayRoster);
    
    // Update simulated duty counts for the next day's calculation
    if (dayRoster.assignedPersonnelIds.length > 0) {
      dayRoster.assignedPersonnelIds.forEach(id => {
        const pIndex = simulatedPersonnel.findIndex(p => p.id === id);
        if (pIndex !== -1) {
          simulatedPersonnel[pIndex].dutyCount += 1;
        }
      });
      rollingRecentAssignments = dayRoster.assignedPersonnelIds;
    } else {
      rollingRecentAssignments = []; // Reset if a day had no duty
    }
  });

  return roster;
};
