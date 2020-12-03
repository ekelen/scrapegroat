import { useEffect, useState } from "react";
import { scrapeForTotal, scrapeGroats } from "./scraping";

const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max));
};

export const validResponse = (parseFn) => (response) => {
  if (!response || response.status !== 200) {
    console.warn(response);
    throw new Error(
      `Trouble at the groat mine: ${response.status} ${response.statusText}`
    );
  }
  return parseFn(response);
};

export const scrape = (position) => {
  let offset = 0;
  let localCoinData = null;
  const idx = position % 20;
  const page = Math.floor(position / 20);

  const processText = ({ decoder, reader }) => ({ done, value }) => {
    if (done) {
      return localCoinData;
    }
    const { groatData, resultsProcessed } = scrapeGroats({ idx, offset })({
      decoder,
      value,
    });
    if (groatData) {
      localCoinData = groatData;
    }
    offset += resultsProcessed;
    return reader.read().then(processText({ decoder, reader }));
  };

  return fetch(
    `http://numismatics.org/search/results?q=%28denomination_facet%3A%22groat%22+OR+denomination_facet%3A%22gros%22+OR+denomination_facet%3A%22gros+tournois%22+OR+denomination_facet%3A%22groschen%22+OR+denomination_facet%3A%22grosso%22+OR+denomination_facet%3A%22grosso+tornese%22+OR+denomination_facet%3A%22groten%22+OR+denomination_facet%3A%22tournosgroschen%22%29+AND+department_facet%3A%22Medieval%22+AND+imagesavailable%3Atrue&lang=en&start=${page}`
  ).then(
    validResponse((response) => {
      const decoder = new TextDecoder("utf-8");
      const reader = response.body.getReader();
      return reader.read().then(processText({ decoder, reader }));
    })
  );
};

export const getTotalResults = () => {
  let hits = 0;

  const processText = ({ decoder, reader }) => ({ done, value }) => {
    if (done) {
      return hits;
    }
    const hitsFound = scrapeForTotal({ decoder, value });
    if (hitsFound) hits = hitsFound;
    return reader.read().then(processText({ decoder, reader }));
  };

  return fetch(
    `http://numismatics.org/search/results?q=%28denomination_facet%3A%22groat%22+OR+denomination_facet%3A%22gros%22+OR+denomination_facet%3A%22gros+tournois%22+OR+denomination_facet%3A%22groschen%22+OR+denomination_facet%3A%22grosso%22+OR+denomination_facet%3A%22grosso+tornese%22+OR+denomination_facet%3A%22groten%22+OR+denomination_facet%3A%22tournosgroschen%22%29+AND+department_facet%3A%22Medieval%22+AND+imagesavailable%3Atrue&lang=en`
  ).then(
    validResponse((response) => {
      const decoder = new TextDecoder("utf-8");
      const reader = response.body.getReader();
      return reader.read().then(processText({ decoder, reader }));
    })
  );
};

export const useGetPosition = (groat) => {
  const [position, setPosition] = useState(-1);
  const [positionError, setPositionError] = useState(null);

  const validatePosition = (n) => {
    const validPosition = n > 0 ? getRandomInt(n) : -1;
    return validPosition;
  };

  useEffect(() => {
    if (!groat) {
      getTotalResults()
        .then(validatePosition)
        .then(setPosition)
        .catch(setPositionError);
    }
  }, [groat]);
  return { positionError, position };
};

export const useScrapeGroat = null;
