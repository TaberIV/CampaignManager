import { getAutomaticTypeDirectiveNames } from "typescript";
import calendarData from "../data/calendar";

const moonSymbols = ["🌗", "🌘", "🌑", "🌒", "🌓", "🌔", "🌕", "🌖"];

const peakSymbols = { "🌘": "🌜", "🌑": "🌚", "🌒": "🌛", "🌕": "🌝" };

export type GameDate = {
  year: number;
  month: number;
  day: number;
};

export const DateError = new Error("InvalidDate");

function createDate(
  month: number,
  day: number,
  year?: number | null
): GameDate | undefined {
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

  const date = valid
    ? { year: year ? year : calendarData.getYear(), month, day }
    : undefined;

  return date;
}

function formatDate(date: GameDate, moon?: boolean): string {
  const moonStr = moon ? ` ${getMoonPhase(date)}` : "";
  return `${calendarData.getMonth(date.month)} ${date.day}, ${
    date.year
  }${moonStr}`;
}

function formatDateRange(date1: GameDate, date2: GameDate, moon?: boolean) {
  const compare = compareDates(date1, date2);
  if (compare === 0) {
    const moonStr = moon ? ` ${getMoonPhase(date1)}` : "";
    return `${calendarData.getMonth(date1.month)} ${date1.day}, ${
      date1.year
    }${moonStr}`;
  } else if (compare === 1) {
    let dates = "";
    if (date1.year !== date2.year) {
      dates = formatDate(date1) + " - " + formatDate(date2);
    } else if (date1.month !== date2.month) {
      dates = `${calendarData.getMonth(date1.month)} ${
        date1.day
      } - ${calendarData.getMonth(date1.month)} ${date1.day}, ${date1.year}`;
    } else {
      dates = `${calendarData.getMonth(date1.month)} ${date1.day} - ${
        date2.day
      }, ${date1.year}`;
    }
    return dates;
  } else {
    return "dates in wrong order";
  }
}

function stringToDate(dateStr: string): GameDate | null {
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

function getDayOfWeek(date: GameDate) {
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(date);
  const offset =
    calendarData.getFirstDay() + (date.year - calendarData.getYear());

  return weekdays[(dayOfYear - 1 + offset) % weekdays.length];
}

function getDayOfYear(date: GameDate): number {
  const { month, day } = date;
  const monthsLen = Object.values(calendarData.getMonthsLen());
  monthsLen.splice(month - 1);

  let dayOfYear = day;
  monthsLen.forEach((days) => {
    dayOfYear += days;
  });

  return dayOfYear;
}

function getMoonPhase(date: GameDate): string | null {
  const moons = calendarData.getMoons();
  if (date.year < calendarData.getYear() || moons.length == 0) {
    return null;
  } else {
    let days = getDayOfYear(date);
    days += calendarData.getYearLen() * (date.year - calendarData.getYear());

    const cycleLen = calendarData.getLunarLen();
    const offset =
      cycleLen - calendarData.getLunarShift() + calendarData.getFirstDay();

    const day = (days + offset - 0.39) % cycleLen;
    const moonVal = (day / cycleLen) * moonSymbols.length;
    const moonIndex = Math.floor(moonVal);

    const phaseProg = moonVal - moonIndex;

    let symbol = moonSymbols[moonIndex];

    const isPeak =
      Math.abs(0.5 - phaseProg) < moonSymbols.length / 2 / cycleLen;

    if (isPeak && symbol in peakSymbols) {
      symbol =
        peakSymbols[
          symbol as
            | "\uD83C\uDF18"
            | "\uD83C\uDF11"
            | "\uD83C\uDF12"
            | "\uD83C\uDF15"
        ];
    }

    return symbol;
  }
}

function compareDates(date1: GameDate, date2: GameDate) {
  if (date1.year !== date2.year) {
    return date1.year > date2.year ? -1 : 1;
  } else {
    const day1 = getDayOfYear(date1);
    const day2 = getDayOfYear(date2);
    return day1 === day2 ? 0 : day1 > day2 ? -1 : 1;
  }
}

export default {
  createDate,
  getMoonPhase,
  getDayOfYear,
  getDayOfWeek,
  formatDate,
  formatDateRange,
  stringToDate,
  compareDates
};
