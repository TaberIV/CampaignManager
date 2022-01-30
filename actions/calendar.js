const { commands, prefix } = require('../config/config');
const { MessageEmbed } = require('discord.js');
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

function getMoonFullness(dayOfYear, lunarLen) {
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

function getDayOfWeek(date) {
  const weekdays = calendarData.getWeekdays();
  const dayOfYear = getDayOfYear(date);

  return weekdays[(dayOfYear - 1) % weekdays.length]
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