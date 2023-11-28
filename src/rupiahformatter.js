// export const formatter = new Intl.NumberFormat('id-ID', {
//   style: 'currency',
//   currency: 'IDR'
// });
export const formatRupiah = (money) => {
  if (isNaN(money)) {
    money = 0;
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(money);
};
