
export enum DayType {
  REGULAR = 'Regular',
  SUNDAY = 'Sunday',
  HOLIDAY = 'Holiday',
  EXEMPT = 'Exempt'
}

export interface Personnel {
  id: string;
  name: string;
  active: boolean;
  dutyCount: number;
}

export interface AbsenceRecord {
  id: string;
  personnelId: string;
  startDate: string; // ISO format
  endDate: string;
  type: 'LEAVE' | 'EXCUSE';
  reason?: string;
}

export interface Holiday {
  date: string; // ISO format
  name: string;
}

export interface RosterDay {
  date: string; // ISO format
  type: DayType;
  requiredPersonnel: number;
  assignedPersonnelIds: string[];
  manualOverride: boolean;
  notes?: string;
}

export interface AppState {
  personnel: Personnel[];
  absences: AbsenceRecord[];
  holidays: Holiday[];
  exemptDates: string[]; // List of ISO date strings (YYYY-MM-DD)
  roster: RosterDay[];
}
