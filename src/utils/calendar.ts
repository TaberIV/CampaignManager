import calendarData from "../data/calendar";

const moonSymbols = ["🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖"];

type Date = {
  year: number;
  month: number;
  day: number;
};

function createDate(month: number, day: number, year: number | null): Date {
  const monthsLen = calendarData.getMonthsLen();
  const months = calendarData.getMonths();
  const valid =
    Number.isInteger(month) &&
    Number.isInteger(day) &&
    (!year || Number.isInteger(year)) &&
    month > 0 &&
    month <= months.length &&
    day > 0 &&
    day <= monthsLen[months[month - 1]];

  if (!valid) {
    throw new Error("InvalidDate");
  }

  return { year: year ? year : calendarData.getYear(), month, day };
}

function formatDate(date: Date, moon?: boolean): string {
  const moonStr = moon ? ` ${getMoonPhase(date)}` : "";
  return `${calendarData.getMonth(date.month)} ${date.day}, ${
    date.year
  }${moonStr}`;
}

function dateToString({ year, month, day }: Date): string {
  return `${year}-${month}-${day}`;
}

function stringToDate(dateStr: string): Date | null {
  const dateParts = dateStr.split("-");

  if (dateParts.length == 3) {
    const [yearStr, monthStr, dayStr] = dateParts;
    const year = Number(yearStr);
    const month = Number(monthStr);
    const day = Number(dayStr);

    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return { year, month, day };
    }
  }

  return null;
}

function getDayOfWeek(date: Date) {
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(date);
  const offset =
    calendarData.getFirstDay() + (date.year - calendarData.getYear());

  return weekdays[(dayOfYear - 1 + offset) % weekdays.length];
}

function getDayOfYear(date: Date): number {
  const { month, day } = date;
  const monthsLen = Object.values(calendarData.getMonthsLen());
  monthsLen.splice(month - 1);

  let dayOfYear = day;
  monthsLen.forEach((days) => {
    dayOfYear += days;
  });

  return dayOfYear;
}

function getMoonPhase(date: Date): string | null {
  const moons = calendarData.getMoons();
  if (date.year < calendarData.getYear() || moons.length == 0) {
    return null;
  } else {
    let days = getDayOfYear(date);
    days += calendarData.getYearLen() * (date.year - calendarData.getYear());

    const cycleLen = calendarData.getLunarLen();
    const offset =
      cycleLen - calendarData.getLunarShift() + calendarData.getFirstDay();

    const moonIndex = getMoonIndex(days, offset, cycleLen);
    return moonSymbols[moonIndex];
  }
}

function getMoonIndex(dayOfYear: number, offset: number, lunarCyc: number) {
  const day = (dayOfYear + offset - 0.39) % lunarCyc;
  return Math.floor((day / lunarCyc) * moonSymbols.length);
}

export default {
  createDate,
  getMoonPhase,
  getDayOfYear,
  getDayOfWeek,
  formatDate,
  dateToString,
  stringToDate
};
