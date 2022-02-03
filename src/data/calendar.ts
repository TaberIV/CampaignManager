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

function getMonth(month: number) {
  return data.months[month - 1];
}

function getMonthsLen(): { [key: string]: number } {
  return data.month_len;
}

function getWeekdays() {
  return data.weekdays;
}

function getMoons(): string[] {
  return data.moons;
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

function getNotes(): { [key: string]: string } {
  return data.notes;
}

export default {
  getYearLen,
  getNumMonths,
  getMonths,
  getMonth,
  getMonthsLen,
  getWeekdays,
  getMoons,
  getLunarLen,
  getLunarShift,
  getYear,
  getFirstDay,
  getNotes
};
