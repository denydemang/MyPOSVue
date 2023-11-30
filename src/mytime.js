import moment from 'moment-timezone';
const now = moment().tz('Asia/Jakarta');

export const dateNow = () => {
  const now = moment().tz('Asia/Jakarta');
  return now.format('YYYY-MM-DD');
};
export const firstDateOfMonth = () => {
  const getfirst = now.clone().startOf('month');
  return getfirst.format('YYYY-MM-DD');
};
export const lastDateOfMonth = () => {
  const lastDateOfMonth = now.clone().endOf('month');
  return lastDateOfMonth.format('YYYY-MM-DD');
};
