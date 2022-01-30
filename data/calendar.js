const {
  year_len,
  n_months,
  months,
  month_len,
  week_len,
  weekdays,
  n_moons,
  moons,
  lunar_cyc,
  lunar_shf,
  year,
  first_day,
  notes
} = require('./sample-calendar.json');

function getYearLen() {
  return year_len;
}

function getNumMonths() {
  return n_months;
}

function getMonths() {
  return months;
}

function getMonthsLen() {
  return month_len;
}

function getWeekdays() {
  return weekdays;
}

function getLunarLen(moon = moons[0]) {
  return lunar_cyc[moon];
}

function getLunarShift() {
  return lunar_shf;
}

function getYear() {
  return year;
}

module.exports = {
  getYearLen,
  getNumMonths,
  getMonths,
  getMonthsLen,
  getWeekdays,
  getLunarLen,
  getYear
};