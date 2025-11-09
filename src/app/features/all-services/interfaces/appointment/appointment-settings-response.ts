export interface AppointmentSettingsResponse {
  branchId: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  availableWeekdays: string[];
  disabledDates: { date: string; disabled: boolean }[];
  bookedSlots: { [date: string]: string[] };
  maxUpcomingAvailableDates: number;
}
