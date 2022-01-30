const calendarData = require('../data/calendar.js')

const moonSymbols = ['🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔'];

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

function getMoonFullness(dayOfYear, lunarCyc) {
  return dayOfYear % lunarCyc / lunarCyc;
}

function getDayOfYear(dateStr) {
  const date = dateFromStr(dateStr);
  const { _, month, day } = date;
  const monthsLen = Object.values(calendarData.getMonthsLen());
  monthsLen.splice(month - 1);

  let dayOfYear = day;
  monthsLen.forEach((days) => {
    dayOfYear += days;
  });

  return dayOfYear;
}

function getDayOfWeek(dateStr) {
  const { year, _month, _day } = dateFromStr(dateStr);
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(dateStr);
  const offset = calendarData.getFirstDay() + (year - calendarData.getYear());

  return weekdays[(dayOfYear - 1 + offset) % weekdays.length];
}

function getMoonPhase(dateStr, moon = null) {
  const date = dateFromStr(dateStr);

  const moonIndex = getMoonFullness(
    calendarData.getDayOfYear(date),
    calendarData.getLunarLen()
  );

  return moonSymbols[moonIndex];
}

module.exports = { getMoonPhase, getDayOfYear, getDayOfWeek };