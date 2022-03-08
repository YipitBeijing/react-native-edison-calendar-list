import React, { FunctionComponent } from "react";
import { generateSvg } from "../utils/MonthSvg";
import { WebProps } from "../../constants";

type Props = WebProps & {
  month: number;
};

export const MonthCalendar: FunctionComponent<Props> = ({
  year,
  month,
  selectDay,
  monthDaysColor,
  otherMonthDaysColor,
  monthTitleColor,
  weekTitleColor,
  selectedWeekTitleColor,
}: Props) => {
  const selectedDate =
    selectDay?.year === year && selectDay?.month === month
      ? selectDay?.date
      : undefined;
  const svgString = generateSvg({
    year,
    month,
    selectDay: selectedDate,
    fontFamily: "Helvetica Neue",
    activeTextColor: monthDaysColor,
    inactiveTextColor: otherMonthDaysColor,
    monthTitleColor: monthTitleColor,
    weekTitleColor: weekTitleColor,
    selectedWeekTitleColor: selectedWeekTitleColor,
  });
  return (
    <div className="monthBox" dangerouslySetInnerHTML={{ __html: svgString }} />
  );
};

export default MonthCalendar;
