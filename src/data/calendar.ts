import data from "./sample-calendar.json";

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

function getLunarLen() {
  return data.lunar_cyc.Luna;
}

function getLunarShift() {
  return data.lunar_shf.Luna;
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
