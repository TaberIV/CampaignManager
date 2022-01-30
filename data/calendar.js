import { readFile } from "fs/promises";

const data = JSON.parse(await readFile('data/sample-calendar.json'));

function getYearLen() {
  return data.year_len;
}

function getNumMonths() {
  return data.n_months;
}

function getMonths() {
  return data.months;
}

function getMonthsLen() {
  return data.month_len;
}

function getWeekdays() {
  return data.weekdays;
}

function getLunarLen(moon = data.moons[0]) {
  return data.lunar_cyc[moon];
}

function getLunarShift(moon = data.moons[0]) {
  return data.lunar_shf[moon];
}

function getYear() {
  return data.year;
}

function getFirstDay() {
  return data.first_day;
}

function getNotes() {
  return data.notes;
}

export default {
  getYearLen,
  getNumMonths,
  getMonths,
  getMonthsLen,
  getWeekdays,
  getLunarLen,
  getLunarShift,
  getYear,
  getFirstDay,
  getNotes
};
