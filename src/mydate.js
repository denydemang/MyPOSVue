import moment from 'moment';

class MyDate {
  getfirstdate(format = 'DD/MM/YYYY') {
    const firstDayOfMonth = moment().startOf('month').format(format);
    return firstDayOfMonth;
  }
  getlastdate(format = 'DD/MM/YYYY') {
    const lastDayOfMonth = moment().endOf('month').format(format);
    return lastDayOfMonth;
  }
  changeformat(dateString, firstformat = 'DD/MM/YYYY', convertedFormat = 'YYYY-MM-DD') {
    return moment(dateString, firstformat).format(convertedFormat);
  }
}

export default MyDate;
