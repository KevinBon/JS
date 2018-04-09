import { isDate } from 'lodash';
import { differenceInHours } from 'date-fns';

const resetTime = (date, { h = 0, m = 0, s = 0 } = {}) => {
  const newDate = isDate(date) ? date : new Date(date);
  newDate.setHours(h);
  newDate.setMinutes(m);
  newDate.setSeconds(s);
  return newDate;
};

const differenceInDays = (from, to) =>
  Math.ceil(differenceInHours(resetTime(from), resetTime(to, { m: 1 })) / 24);
  
export default differenceInDays;
  
