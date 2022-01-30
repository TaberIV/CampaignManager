import calendarData from '../data/calendar.js';

const moonSymbols = ['🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖'];

function dateFromStr(dateStr) {
  const dateParts = dateStr.split('-');

  let date;
  if (dateParts.length == 3) {
    date = {
      year: parseInt(dateParts[0]),
      month: parseInt(dateParts[1]),
      day: parseInt(dateParts[2])
    };
  } else if (dateParts.length == 2) {
    date = {
      year: calendarData.getYear(),
      month: parseInt(dateParts[0]),
      day: parseInt(dateParts[1])
    };
  }

  return date;
}

function getDayOfWeek(dateStr) {
  const { year, _month, _day } = dateFromStr(dateStr);
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(date);
  const offset = calendarData.getFirstDay() + (year - calendarData.getYear());

  return weekdays[(dayOfYear - 1 + offset) % weekdays.length];
}

function getDayOfYear(date) {
  const { _, month, day } = date;
  const monthsLen = Object.values(calendarData.getMonthsLen());
  monthsLen.splice(month - 1);

  let dayOfYear = day;
  monthsLen.forEach((days) => {
    dayOfYear += days;
  });

  return dayOfYear;
}

function getMoonPhase(dateStr, moon = null) {
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

function getMoonIndex(dayOfYear, offset, lunarCyc) {
  const full = (dayOfYear + offset - 0.39) % lunarCyc;
  return Math.floor(full / lunarCyc * moonSymbols.length);
}

export default { getMoonPhase, getDayOfYear, getDayOfWeek };