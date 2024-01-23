import moment from 'moment';

class MyDate {
  // Set timezone offset   for Jakarta (UTC+7)
  timeZoneOffset = 7 * 60;

  // Inisiasi Current Time dengan timezone jakarta
  NOW = moment().utcOffset(this.timeZoneOffset);

  getfirstdate(formatDate = 'DD/MM/YYYY') {
    const firstDayOfMonth = this.NOW.startOf('month').format(formatDate);
    return firstDayOfMonth;
  }
  getlastdate(formatDate = 'DD/MM/YYYY') {
    const lastDayOfMonth = this.NOW.endOf('month').format(formatDate);
    return lastDayOfMonth;
  }
  changeformat(dateString, firstFormatDate = 'DD/MM/YYYY', convertedFormatDate = 'YYYY-MM-DD') {
    return moment(dateString, firstFormatDate).format(convertedFormatDate);
  }
  getCurrentDate(formatDate = 'YYYY-MM-DD') {
    return this.NOW.format(formatDate);
  }
}

export default MyDate;
