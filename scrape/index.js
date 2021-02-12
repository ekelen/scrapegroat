const got = require("got");
const seedRandom = require("seedrandom");
const { JSDOM } = require("jsdom");

const getValidCoinIdFromString = (str = "") =>
  str.match(/[0-9]+\.[0-9]+\.[0-9]+/g);

const NUMISMATIC_CATALOG_URL =
  "http://numismatics.org/search/results?q=%28denomination_facet%3A%22groat%22+OR+denomination_facet%3A%22gros%22+OR+denomination_facet%3A%22gros+tournois%22+OR+denomination_facet%3A%22groschen%22+OR+denomination_facet%3A%22grosso%22+OR+denomination_facet%3A%22grosso+tornese%22+OR+denomination_facet%3A%22groten%22+OR+denomination_facet%3A%22tournosgroschen%22%29+AND+department_facet%3A%22Medieval%22+AND+imagesavailable%3Atrue&lang=en";

const getToday = () => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
};
const dateCreated = getToday().toISOString();

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

/**
 * Gets total number of hits from Numismatic catalog query
 *
 * @return {Object} - payload with n total hits and how many hits per page
 */
const firstPass = () => {
  return got(NUMISMATIC_CATALOG_URL).then((response) => {
    const dom = new JSDOM(response.body);
    const totalHitsDiv = dom.window.document.querySelector(".paging_div");
    const { textContent = "" } = totalHitsDiv;
    const hitsPattern = /Displaying records (?<skip>[0-9]+) to (?<pageLimit>[0-9]+) of (?<total>[0-9]+) total results/;
    const {
      groups: { total, skip, pageLimit },
    } = textContent.match(hitsPattern);
    const pageSize = +pageLimit - +skip;
    return { payload: { total: +total, pageSize } };
  });
};

/**
 * @param {HTMLDivElement} coinNode
 *
 * @throws various errors sometimes
 *
 * @returns {Promise} - Promise with coin data payload
 */
const parseCoinNode = (coinNode) => {
  let name = "";
  let id = "";
  let date = "";
  let imgSrcObv = "";
  let imgSrcRev = "";
  let denomination = "";
  let source = "";
  let region = "";
  let fullName = "";

  let fullNameNode = null;
  fullName =
    (fullNameNode = coinNode.querySelector("h4", "a")) !== null &&
    fullNameNode.textContent;
  const idMatch = getValidCoinIdFromString(fullName) || [];
  id = idMatch[0] || "";
  source = `http://numismatics.org/collection/${id && id + "?lang=en"}`;

  name =
    fullName && id ? fullName.slice(0, (id.length + 1) * -1) : fullName || id;
  const [obv = "", rev = ""] = Object.values(
    coinNode.querySelectorAll(".side-thumbnail")
  ).map((c) => c.attributes["src"]["nodeValue"]);
  imgSrcObv = obv;
  imgSrcRev = rev;
  const cellSelectorResults = [...coinNode.querySelectorAll("dt")];
  const dateSibling =
    cellSelectorResults.find((el) => el.textContent === "Date") || {};
  const {
    nextSibling: { textContent: dateText = "" } = { textContent: "" },
  } = dateSibling;
  const denominationSibling =
    cellSelectorResults.find((el) => el.textContent === "Denomination") || {};
  const {
    nextSibling: { textContent: denominationText = "" } = { textContent: "" },
  } = denominationSibling;
  date = dateText;
  denomination = denominationText;
  name = !date ? name : name.slice(0, name.indexOf(date) - 2);
  region = name.slice(name.lastIndexOf(",")).slice(2);
  name = !region ? name : name.slice(0, name.indexOf(region) - 2);
  const payload = {
    name,
    id,
    date,
    denomination,
    imgSrcObv,
    imgSrcRev,
    source,
    region,
    fullName,
  };
  return { payload };
};

/**
 * @param  {Number} position
 * @param  {Number} pageSize
 *
 * @throws various errors sometimes
 *
 * @returns {Promise} - Promise with coin data as payload
 */
const getCoin = (position, pageSize) => {
  const idx = position % pageSize;
  const page = Math.floor(position / pageSize);
  return got(`${NUMISMATIC_CATALOG_URL}&start=${page}`).then((response) => {
    const dom = new JSDOM(response.body);
    const coins = [...dom.window.document.querySelectorAll(".result-doc")];
    const coin = coins[idx];
    return parseCoinNode(coin, dom);
  });
};

/**
 * @returns {Promise} – resolved Promise with value with keys "error", "coin"
 */
module.exports.main = async () => {
  return firstPass()
    .then((result) => {
      const {
        payload: { total, pageSize },
      } = result;
      seedRandom(dateCreated, { global: true });
      const seededRandom = getRandomInt(total);
      return getCoin(seededRandom, pageSize).then(({ payload }) => {
        return {
          coin: {
            ...payload,
            dateCreated,
            numismaticsTotalForDay: total,
            seededRandom,
          },
          error: null,
        };
      });
    })
    .catch((error) => {
      return { error: error.message, coin: null };
    });
};
