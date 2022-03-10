export const SvgWidth = 161;
export const SvgHeight = 180;

const singleDayTemplate = ({
  x,
  y,
  day,
  fontFamily,
  color,
}: {
  x: number;
  y: number;
  day: number;
  fontFamily: string;
  color: string;
}) => {
  const xPoint = 11.5 + x * 23;
  const yPoint = 65 + y * 22;
  return `
  <text font-family="${fontFamily}" font-size="12" x="${xPoint}" y="${yPoint}" fill="${color}" style="text-anchor:middle;">${day}</text>`;
};

const monthTitleTemplate = ({
  monthText,
  fontFamily,
  color,
}: {
  monthText: string;
  fontFamily: string;
  color: string;
}) => {
  return `
  <text font-weight="bold" text-anchor="start" font-family="${fontFamily}" font-size="16" y="16" x="0" fill="${color}">${monthText}</text>`;
};

const weekTitleTemplate = ({
  selected,
  fontFamily,
  color,
  activeColor,
}: {
  selected: number;
  fontFamily: string;
  color: string;
  activeColor: string;
}) => {
  let str = "";
  const weeks = ["S", "M", "T", "W", "T", "F", "S"];
  weeks.forEach((item, idx) => {
    const xPoint = 11.5 + idx * 23;
    const textColor = selected === idx ? activeColor : color;

    str =
      str +
      `
  <text font-weight="bold" font-family="${fontFamily}" font-size="9" x="${xPoint}" y="39.5" fill="${textColor}" style="text-anchor:middle;">${item}</text>`;
  });
  return str;
};

const selectDay = ({
  color,
  fontFamily,
  selectDayPoint,
}: {
  color: string;
  fontFamily: string;
  selectDayPoint: { x: number; y: number; day: number } | null;
}) => {
  if (!selectDayPoint) {
    return "";
  }
  const xPoint = 11.5 + selectDayPoint.x * 23;
  const yPoint = 65 + selectDayPoint.y * 22;
  const xPointForRect = xPoint - 12;
  const yPointForRect = yPoint - 16;
  const dayText = selectDayPoint.day;
  return `
  <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
    <feOffset result="offOut" in="SourceGraphic" dx="0" dy="4" />
    <feColorMatrix result="matrixOut" in="offOut" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.16 0" />
    <feGaussianBlur result="blurOut" in="matrixOut" stdDeviation="8" />
    <feBlend in="SourceGraphic" in2="blurOut" mode="normal" />
  </filter>
  <rect x="${xPointForRect}" y="${yPointForRect}" width="24" height="24" fill="${color}" filter="url(#dropShadow)"/>
  <text font-family="${fontFamily}" font-size="12" x="${xPoint}" y="${yPoint}" fill="#ffffff" style="text-anchor:middle;">${dayText}</text>
  <circle cx="${xPoint}" cy="${yPoint + 4}" r="1" fill="#ffffff"
  `;
};

const svgTemplate = ({
  daysText,
  monthText,
  selectWeek,
  selectDayPoint,
  fontFamily,
  selectedTextColor,
  monthTitleColor,
  weekTitleColor,
}: {
  daysText: string;
  monthText: string;
  selectWeek: number;
  selectDayPoint: { x: number; y: number; day: number } | null;
  fontFamily: string;
  selectedTextColor: string;
  monthTitleColor: string;
  weekTitleColor: string;
}) => `
<svg width="${SvgWidth}" height="${SvgHeight}" viewBox="0 0 ${SvgWidth} ${SvgHeight}">
  ${monthTitleTemplate({ monthText, fontFamily, color: monthTitleColor })}
  ${weekTitleTemplate({
    selected: selectWeek,
    fontFamily,
    color: weekTitleColor,
    activeColor: selectedTextColor,
  })}
  ${daysText}
  ${selectDay({ color: selectedTextColor, fontFamily, selectDayPoint })}
</svg>`;

const Month31Day = [0, 2, 4, 6, 7, 9, 11];
const MonthName = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getMonthDayCount(year: number, month: number) {
  if (month !== 1) {
    return Month31Day.includes(month) ? 31 : 30;
  }
  if ((year % 4 == 0 && year % 100 != 0) || year % 400 == 0) {
    return 29;
  }
  return 28;
}

// The 1st day of the month is not a Sunday,
// the last week of the previous month needs to be displayed to complement view
const preMonthDaysJson = require("./MonthSvgAsset.json");

const preMonthDaysTemplate = [
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
] as const;

function calcShowPreMonthDays(year: number, month: number) {
  const date = new Date(year, month, 1, 0, 0, 0);
  const preMonthdate = new Date(year, month - 1, 1, 0, 0, 0);
  const preMonthDayShowCount = date.getDay();
  const preMonthDayCount = getMonthDayCount(
    preMonthdate.getFullYear(),
    preMonthdate.getMonth()
  );
  return preMonthDaysTemplate.slice(
    preMonthDayCount - preMonthDayShowCount - 20,
    preMonthDayCount - 20
  );
}

function getShowPreMonthDays(year: number, month: number): number[] {
  if (preMonthDaysJson[year] && preMonthDaysJson[year][month]) {
    return preMonthDaysJson[year][month];
  }
  return calcShowPreMonthDays(year, month);
}

type GenerateSvgParams = {
  year: number;
  month: number;
  selectDay?: number;
  today?: number;
  fontFamily?: string;
  selectedTextColor?: string;
  activeTextColor?: string;
  inactiveTextColor?: string;
  monthTitleColor?: string;
  weekTitleColor?: string;
};

export function generateSvg({
  year,
  month,
  selectDay,
  today,
  fontFamily = "",
  activeTextColor = "#000001",
  inactiveTextColor = "#a3a3a3",
  monthTitleColor = "#000000",
  weekTitleColor = "#999999",
  selectedTextColor = "#136aee",
}: GenerateSvgParams) {
  const preMonthDays = getShowPreMonthDays(year, month);
  const preMonthDayCount = preMonthDays.length;
  const thisMonthDayCount = getMonthDayCount(year, month);
  let str = "";
  let selectDayPoint: { x: number; y: number; day: number } | null = null;
  let selectWeek: number = -1;

  for (let i = 0; i < 42; i++) {
    const x = i % 7;
    const y = Math.floor(i / 7);
    if (i < preMonthDayCount) {
      str += singleDayTemplate({
        x,
        y,
        day: preMonthDays[i],
        color: inactiveTextColor,
        fontFamily,
      });
    } else if (
      i >= preMonthDayCount &&
      i < preMonthDayCount + thisMonthDayCount
    ) {
      const thisday = i - preMonthDayCount + 1;
      if (selectDay === thisday) {
        selectDayPoint = { x, y, day: thisday };
      }
      if (today === thisday) {
        selectWeek = x;
      }
      str += singleDayTemplate({
        x,
        y,
        day: thisday,
        color: today === thisday ? selectedTextColor : activeTextColor,
        fontFamily,
      });
    } else {
      str += singleDayTemplate({
        x,
        y,
        day: i - preMonthDayCount - thisMonthDayCount + 1,
        color: inactiveTextColor,
        fontFamily,
      });
    }
  }
  return svgTemplate({
    daysText: str,
    monthText: MonthName[month],
    selectWeek,
    selectDayPoint,
    fontFamily,
    selectedTextColor,
    monthTitleColor,
    weekTitleColor,
  });
}
