const { JSDOM } = require("jsdom");
const got = require("got");
const SeedRandom = require("seedrandom");

const getValidCoinIdFromString = (str = "") =>
  str.match(/[0-9]+\.[0-9]+\.[0-9]+/g);

const NUMISMATIC_CATALOG_URL =
  "http://numismatics.org/search/results?q=%28denomination_facet%3A%22groat%22+OR+denomination_facet%3A%22gros%22+OR+denomination_facet%3A%22gros+tournois%22+OR+denomination_facet%3A%22groschen%22+OR+denomination_facet%3A%22grosso%22+OR+denomination_facet%3A%22grosso+tornese%22+OR+denomination_facet%3A%22groten%22+OR+denomination_facet%3A%22tournosgroschen%22%29+AND+department_facet%3A%22Medieval%22+AND+imagesavailable%3Atrue&lang=en";

const getToday = () => {
  const date = new Date();
  console.info(`Date: ${date.toLocaleString()}`);
  date.setHours(0, 0, 0, 0);
  return date;
};
const dateCreated = () => getToday().toISOString();

const getFromRange = (max, random) => {
  return Math.floor(random * Math.floor(max));
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
    const hitsPattern =
      /Displaying records (?<skip>[0-9]+) to (?<pageLimit>[0-9]+) of (?<total>[0-9]+) total results/;
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
  let id = "";
  let imgSrcObv = "";
  let imgSrcRev = "";
  let source = "";
  let label = "";

  let fullNameNode = null;
  label =
    (fullNameNode = coinNode.querySelector("h4", "a")) !== null &&
    fullNameNode.textContent;
  const idMatch = getValidCoinIdFromString(label) || [];
  id = idMatch[0] || "";

  // Should have maybe? used the JSON manifest available at https://numismatics.org/search/manifest/{id}
  // const jsonSource = `https://numismatics.org/search/manifest/${id}?lang=en`;
  source = `http://numismatics.org/collection/${id && id + "?lang=en"}`;

  label = (label || "").slice(0, (id.length + 1) * -1);
  const [obv = "", rev = ""] = Object.values(
    coinNode.querySelectorAll(".side-thumbnail")
  ).map((c) => c.attributes["src"]["nodeValue"]);
  imgSrcObv = obv;
  imgSrcRev = rev;

  const payload = {
    label,
    imgSrcObv,
    imgSrcRev,
    source,
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
 * @returns {Promise} – resolved Promise in Netlify serverless function-friendly format
 */
exports.handler = async () => {
  try {
    const result = await firstPass();
    const {
      payload: { total, pageSize },
    } = result;
    const random = new SeedRandom(dateCreated());
    const seededRandom = getFromRange(total, random());

    const payload = await getCoin(seededRandom, pageSize);
    const coinResult = {
      statusCode: 200,
      body: JSON.stringify({
        coin: {
          ...payload,
          dateCreated: dateCreated(),
          numismaticsTotalForDay: total,
          seededRandom,
        },
      }),
    };
    return coinResult;
  } catch (error) {
    console.error(error);
    return {
      statusCode: error?.statusCode || 500,
      body: JSON.stringify({ error: error?.message || "Unknown error ☹️" }),
    };
  }
};
