export const EventName = {
  IsMounted: "isMounted",
  HeightChange: "heightChange",
  SelectMonth: "selectMonth",
  Debugger: "debugger",
  Render: "render",
  Error: "error",
} as const;

export type WebProps = {
  year: number;
  backgroundColor?: string;
  selectDay?: {
    year: number;
    month: number;
    date: number;
  };
  today?: {
    year: number;
    month: number;
    date: number;
  };
  fontFamily?: string;
  selectedTextColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  monthTitleColor?: string;
  weekTitleColor?: string;
};
