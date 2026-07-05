const _ = require('lodash');
const JWT = require('jwt-simple');
const moment = require('moment-timezone');
const forge = require('node-forge');
const util = require('util');

export const clean = (obj: any) => {
  for (const propName in obj) {
    if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '' || obj[propName] === 'null' || obj[propName] == 'Invalid date') {
      delete obj[propName];
    }
    if (obj[propName] === 'NaN') {
      obj[propName] = 0;
    }
  }
  return obj;
};

export const cleanArray = (objArray: any[]) => {
  const cleaned = [];
  for (let i = 0; i < objArray.length; i++) {
    const obj = objArray[i];
    for (const propName in obj) {
      if (obj[propName] === null || obj[propName] === undefined || obj[propName] === '' || obj[propName] === 'null' || obj[propName] == 'Invalid date') {
        delete obj[propName];
      }
      if (obj[propName] === 'NaN') {
        obj[propName] = 0;
      }
    }
    cleaned.push(obj);
  }
  return cleaned;
};

export const sanitizeCSVString = (csvStringToClean: string) => {
  let resultCSVString = csvStringToClean;
  resultCSVString = resultCSVString.replace(/undefined/gi, '-');
  resultCSVString = resultCSVString.replace(/null/gi, '-');
  resultCSVString = resultCSVString.replace(/false/gi, '-');
  return resultCSVString;
};

export const salaryMonthDifference = (startDate: any, endDate: any, timezone: string) => {
  // try to parse range dates
  const { success: parseDateRangeSuccess, getFromDate, getToDate } = getDateRangeMoment(startDate, endDate, timezone);
  if (parseDateRangeSuccess) {
    try {
      const resReg = getToDate.diff(getFromDate, 'months', true);
      // return toFixedFloat(resReg, 2); // no longer calculating salary with partial months
      return Math.ceil(resReg); // only calc by full months
    } catch (ex) {
      console.log('ERROR! salaryMonthDifference - time formatting threw an exception', ex);
      // tslint:disable-next-line:no-null-keyword
      return 0.0;
    }
  } else {
    console.log('ERROR! salaryMonthDifference - getDateRangeMoment - time formatting failed!');
    return 0.0;
  }
};

export const createToken = (payload: any): string => {
  return JWT.encode(payload, process.env.APP_SECRET);
};

export const decodeToken = (payload: any) => {
  return JWT.decode(payload, process.env.APP_SECRET);
};

export const hashString = (toHash: string) => {
  const md = forge.md.sha512.create();
  md.update(toHash);
  return md.digest().toHex();
};

export const getDateRangeMomentOrCurrentMonth = (fromDate: string = 'defaultFromDate', toDate: string = 'defaultToDate', timezone: string) => {
  const getFromDate = moment().tz(timezone).startOf('month');
  const getToDate = moment().tz(timezone).endOf('month');
  const dateRange = {
    getFromDate,
    getToDate,
    isDefault: true
  };
  // try to parse range dates
  try {
    if (fromDate != 'defaultFromDate') {
      const fd = moment(fromDate).tz(timezone);
      if (!!fd && fd.isValid()) {
        dateRange.getFromDate = fd;
        dateRange.isDefault = false;
      }
    }
    if (toDate != 'defaultToDate') {
      const td = moment(toDate).tz(timezone);
      if (!!td && td.isValid()) {
        dateRange.getToDate = td;
        dateRange.isDefault = false;
      }
    }
  } catch (ex) {
    console.log('ERROR! getDateRangeMomentOrCurrentMonth - time formatting threw an exception', ex);
  }
  return dateRange;
};

export const getDateRangeMomentForCurrentYear = (timezone: string) => {
  const getFromDate = moment().tz(timezone).startOf('year');
  const getToDate = moment().tz(timezone).endOf('year');
  try {
    return { getFromDate, getToDate };
  } catch (ex) {
    console.log('ERROR! getDateRangeMomentForCurrentYear - time formatting threw an exception', ex);
  }
};

export const getDateRangeMoment = (fromDate: string, toDate: string, timezone: string) => {
  try {
    const getFromDate = moment(fromDate).tz(timezone);
    const getToDate = moment(toDate).tz(timezone);
    if (getFromDate == 'Invalid date'  || !getFromDate.isValid() || getToDate == 'Invalid date' || !getToDate.isValid()) {
      return {success: false};
    }
    return { success: true, getFromDate, getToDate };
  } catch (ex) {
    console.log('ERROR! getDateRangeMoment - time formatting threw an exception', ex);
    return {success: false};
  }
};

export const explodeStandardNameComponents = (name: string) => {
  let employeeFirstName = '';
  let employeeLastName = '';
  let employeeInitials = '';
  const arr = name ? name.split(' ') : [];
  if (arr.length > 1) {
    employeeFirstName = arr[0];
    employeeLastName = arr[1];
    employeeInitials = arr[0].substring(0, 1) + arr[1].substring(0, 1);
  } else if (arr.length === 1) {
    employeeFirstName = arr[0];
    employeeInitials = arr[0].substring(0, 1);
  }
  return ({firstName: employeeFirstName, lastName: employeeLastName, initials: employeeInitials});
};

export const toFixedString = (numberToFixed: any, afterDecimal: number = 3): string => {
  let keepAfterDecimal = afterDecimal;
  let numberString = String(numberToFixed);
  let decimalIndex = numberString.indexOf('.');
  if (decimalIndex == -1) {
    numberString += '.000';
    keepAfterDecimal = keepAfterDecimal > 3 ? 3 : keepAfterDecimal;
    decimalIndex = numberString.indexOf('.');
  }
  return numberString.substring(0, decimalIndex + keepAfterDecimal + 1);
};

export const toFixedFloat = (numberToFixed: any, afterDecimal: number = 3) => safeParseFloat(toFixedString(numberToFixed, afterDecimal));

export const safeParseFloat = (numberToParse: string, defaultValue: number = 0.0): number => {
  const parsed = parseFloat(numberToParse);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const safeParseInt = (numberToParse: string, defaultValue: number = 0): number => {
  const parsed = parseInt(numberToParse);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const roundHalf = (numberToRound: number) => {
  return Math.round(numberToRound * 2) / 2;
};

export const logInspect = (inspectInput: any = undefined, logInput: string = 'Log Inspect:') => {
  console.log(logInput);
  if (inspectInput) {
    // tslint:disable-next-line:no-null-keyword
    console.log(util.inspect(inspectInput, false, null, true));
  }
};

module.exports = {
  clean,
  cleanArray,
  sanitizeCSVString,
  salaryMonthDifference,
  createToken,
  decodeToken,
  hashString,
  getDateRangeMoment,
  getDateRangeMomentOrCurrentMonth,
  explodeStandardNameComponents,
  safeParseInt,
  safeParseFloat,
  toFixedString,
  toFixedFloat,
  roundHalf,
  logInspect
};
