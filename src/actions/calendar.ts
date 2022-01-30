import calendarData from '../data/calendar';

const moonSymbols = ['🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖'];

type Date = {
  year: number;
  month: number;
  day: number;
}

function dateFromStr(dateStr: string): Date {
  const dateParts = dateStr.split('-');

  let year = 0;
  let month = 0;
  let day = 0;
  if (dateParts.length == 3) {
    year = parseInt(dateParts[0]);
    month = parseInt(dateParts[1]);
    day = parseInt(dateParts[2]);
  } else if (dateParts.length == 2) {
    year = calendarData.getYear();
    month = parseInt(dateParts[0]);
    day = parseInt(dateParts[1]);
  }

  return { year, month, day };
}

function getDayOfWeek(dateStr: string) {
  const date = dateFromStr(dateStr);
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(date);
  const offset = calendarData.getFirstDay() + (date.year - calendarData.getYear());

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

function getMoonPhase(dateStr: string) {
  const date = dateFromStr(dateStr);
  const cycleLen = calendarData.getLunarLen();
  const offset = cycleLen - calendarData.getLunarShift() + calendarData.getFirstDay();

  let days = getDayOfYear(date);
  if (date.year >= calendarData.getYear()) {
    days += calendarData.getYearLen() * (date.year - calendarData.getYear())
  }

  const moonIndex = getMoonIndex(
    days,
    offset,
    cycleLen
  );

  return moonSymbols[moonIndex];
}

function getMoonIndex(dayOfYear: number, offset: number, lunarCyc: number) {
  const day = (dayOfYear + offset - 0.39) % lunarCyc;
  return Math.floor(day / lunarCyc * moonSymbols.length);
}

export default { getMoonPhase, getDayOfYear, getDayOfWeek };