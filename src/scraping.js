const getValidCoinIdFromString = (str = "") =>
  str.match(/[0-9]+\.[0-9]+\.[0-9]+/g);

export const scrapeForTotal = ({ decoder, value }) => {
  let parser = new DOMParser();
  const decoded = decoder.decode(value);
  const document = parser.parseFromString(decoded, "text/html");
  const hitsDiv = document.querySelector(".paging_div");
  if (!hitsDiv) {
    return 0;
  } else {
    try {
      const nHitsMessage = hitsDiv.firstChild.innerText;
      const nHitsMatch = nHitsMessage
        ? nHitsMessage.match(/[0-9]+ total results/)[0].match(/[0-9]+/)[0]
        : 0;
      return parseInt(nHitsMatch, 10);
    } catch (e) {
      console.log(`HTML parse error while getting total results: `, e);
      return 0;
    }
  }
};

export const parseGroatNode = (coin) => {
  let name = "";
  let id = "";
  let date = "";
  let imgSrcObv = "";
  let imgSrcRev = "";
  let denomination = "";
  let source = "";
  let region = "";

  if (!(coin && coin.nodeType === Node.ELEMENT_NODE)) {
    console.warn('Missing or invalid HTML node "coin" given: ', coin);
  } else {
    // console.log(`coin:`, coin);
    const fullName = coin.querySelector("h4", "a")?.innerText || "";
    const idMatch = getValidCoinIdFromString(fullName) || [];
    id = idMatch[0] || "";
    source = `http://numismatics.org/collection/${id && id + "?lang=en"}`;

    name =
      fullName && id ? fullName.slice(0, (id.length + 1) * -1) : fullName || id;
    // console.log(`id.length:`, id.length);
    // console.log(`name:`, name);
    const [obv = "", rev = ""] = Object.values(
      coin.querySelectorAll(".side-thumbnail")
    ).map((c) => c.attributes["src"]["nodeValue"]);
    imgSrcObv = obv;
    imgSrcRev = rev;
    const cellSelectorResults = Array.from(coin.querySelectorAll("dt"));
    date =
      cellSelectorResults.find((el) => el.innerText === "Date")?.nextSibling
        ?.innerText || "";
    denomination =
      cellSelectorResults.find((el) => el.innerText === "Denomination")
        ?.nextSibling?.innerText || "";
    name = !date ? name : name.slice(0, name.indexOf(date) - 2);
    region = name.slice(name.lastIndexOf(",")).slice(2);
    name = !region ? name : name.slice(0, name.indexOf(region) - 2);
  }
  return { name, id, date, denomination, imgSrcObv, imgSrcRev, source, region };
};

export const scrapeGroats = ({ idx, offset }) => ({ decoder, value }) => {
  let groatData = null;
  let resultsProcessed = offset;

  try {
    let parser = new DOMParser();
    const decoded = decoder.decode(value);
    const document = parser.parseFromString(decoded, "text/html");
    const coins = document.querySelectorAll(".result-doc");
    const coin = coins[idx - offset];
    if (coin) {
      groatData = parseGroatNode(coin);
    }
    resultsProcessed += coins.length;
  } catch (e) {
    console.warn("HTML parse error while scraping list of groat nodes", e);
  }
  return { groatData, resultsProcessed };
};
