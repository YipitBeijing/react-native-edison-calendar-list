import React, { FunctionComponent } from "react";
import { generateSvg } from "../utils/MonthSvg";
import { WebProps } from "../../constants";

type Props = WebProps & {
  month: number;
  onSelectMonth: (year: number, month: number) => void;
};

export const MonthCalendar: FunctionComponent<Props> = ({
  year,
  month,
  selectDay,
  today,
  onSelectMonth,
  ...otherProps
}: Props) => {
  const selectedDate =
    selectDay?.year === year && selectDay?.month === month
      ? selectDay?.date
      : undefined;
  const todayDate =
    today?.year === year && today?.month === month ? today?.date : undefined;
  const svgString = generateSvg({
    ...otherProps,
    year,
    month,
    selectDay: selectedDate,
    today: todayDate,
  });
  return (
    <div
      className="monthBox"
      dangerouslySetInnerHTML={{ __html: svgString }}
      onClick={() => {
        onSelectMonth(year, month);
      }}
    />
  );
};

export default MonthCalendar;
