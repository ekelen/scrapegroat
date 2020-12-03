const now = new Date();
const year = now.getFullYear();
const dateStartValue = new Date(year, now.getMonth(), now.getDate(), 0, 0, 0);
const dateString = `${dateStartValue}`.slice(
  0,
  `${dateStartValue}`.indexOf(`${year}`) + `${year}`.length
);

const positions = { [-1]: -1 };

const getRandomPositionFromTotal = (total = -1) => {
  if (typeof positions[total] === "undefined") {
    const seededRandom = new Math.seedrandom(dateString + `${total}`);
    positions[total] = Math.floor(seededRandom() * Math.floor(total));
  }
  return positions[total];
};

export { dateString, positions, getRandomPositionFromTotal };
