import React, { FunctionComponent } from "react";
import Month from "./Month";
import { WebProps } from "../../constants";

type Props = WebProps;

const MonthList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const YearCalendar: FunctionComponent<Props> = ({
  year,
  selectDay,
  monthDaysColor,
  otherMonthDaysColor,
  monthTitleColor,
  weekTitleColor,
  selectedWeekTitleColor,
}: Props) => {
  return (
    <div className="yearBox">
      {[
        MonthList.map((m) => {
          return (
            <Month
              key={`${year}-${m}`}
              year={year}
              month={m}
              selectDay={selectDay}
              monthDaysColor={monthDaysColor}
              otherMonthDaysColor={otherMonthDaysColor}
              monthTitleColor={monthTitleColor}
              weekTitleColor={weekTitleColor}
              selectedWeekTitleColor={selectedWeekTitleColor}
            />
          );
        }),
      ]}
    </div>
  );
};

export default YearCalendar;
