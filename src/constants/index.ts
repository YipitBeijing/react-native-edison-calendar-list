export const EventName = {
  IsMounted: "isMounted",
  HeightChange: "heightChange",
  Debugger: "debugger",
  Error: "error",
} as const;

export type WebProps = {
  year: number;
  isDarkMode?: boolean;
  selectDay?: {
    year: number;
    month: number;
    date: number;
  };
  monthDaysColor?: string;
  otherMonthDaysColor?: string;
  monthTitleColor?: string;
  weekTitleColor?: string;
  selectedWeekTitleColor?: string;
};
