const now = new Date();
const year = now.getFullYear();
const dateStartValue = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0);
module.exports.dateString = `${dateStartValue}`.slice(
  0,
  `${dateStartValue}`.indexOf(`${year}`) + `${year}`.length
);
