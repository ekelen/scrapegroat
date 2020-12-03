import React, { useCallback, useEffect, useState } from "react";
import { render } from "react-dom";

import { dateString, getRandomPositionFromTotal } from "./util";
import Groat from "./Groat.jsx";
import { getTotalResults, scrape } from "./useGetGroatData.js";

const App = () => {
  const [groatLoading, setGroatLoading] = useState(false);
  const [groat, setGroat] = useState(null);
  const [groatError, setGroatError] = useState(null);

  const [positionLoading, setPositionLoading] = useState(false);
  const [position, setPosition] = useState(-1);
  // const [positionError, setPositionError] = useState(null);

  const createValidPosition = useCallback(() => {
    setPositionLoading(true);
    getTotalResults()
      .then((n) => {
        if (n === 0) {
          throw new Error("No results found from external source.");
        }
        setGroatError(null);
        const pos = getRandomPositionFromTotal(n);
        setPosition(pos);
      })
      .catch((e) => {
        setPosition(-1);
        setGroatError(e);
      })
      .finally(() => setPositionLoading(false));
  }, []);

  const getGroatData = useCallback(() => {
    // if (position === -1) {
    //   console.warn("No position so no groat");
    //   return;
    // }
    // if (groat) {
    //   console.warn("Already have a groat.");
    //   return;
    // }
    // if (positionError) {
    //   console.warn("No valid groat index created.");
    //   setGroatError(positionError);
    //   return;
    // }
    // if (groatError) {
    //   console.warn("Already had an error getting groat.");
    //   return;
    // }
    if (!groatError && !groat && position >= 0) {
      setGroatLoading(true);

      return scrape(position)
        .then((data) => {
          if (!data) {
            setGroat(null);
            throw new Error("Could not get data from the groat mint.");
          }
          setGroatError(null);
          setGroat(data);
        })
        .catch(setGroatError)
        .finally(() => setGroatLoading(false));
    }
  }, [
    position,
    // groatLoading,
    // positionError,
    setGroat,
    setGroatLoading,
    setGroatError,
    groat,
    groatError,
  ]);

  useEffect(() => {
    createValidPosition();
  }, [createValidPosition]);

  useEffect(() => {
    getGroatData();
  }, [getGroatData]);

  return (
    <React.StrictMode>
      <main>
        <h1>Scraped Groat for {dateString}</h1>
        {!!groat && <Groat groatData={groat} />}
        {!!groatError && (
          <div>
            Sorry, no groats today. Reason: <em>{groatError.toString()}</em>
          </div>
        )}
        {(positionLoading || groatLoading) && <div>Loading...</div>}
      </main>
      <footer>
        The <strong>groat</strong> is the traditional name of a defunct English
        and Irish silver coin worth four pence, and also a Scottish coin which
        was originally worth fourpence, with later issues being valued at
        eightpence and one shilling. The name has also been applied to{" "}
        <strong>any thick or large coin</strong>, such as the{" "}
        <strong>Groschen (grosso)</strong>, a silver coin issued by Tyrol in
        1271 and Venice in the 13th century, which was the first of this general
        size to circulate in the Holy Roman Empire and other parts of Europe.
        The immediate ancestor to the groat was the French{" "}
        <strong>gros tournois</strong> or <strong>groat of Tours</strong>, which
        was known as the <strong>groot</strong> (Dutch for <em>great</em> or{" "}
        <em>large</em>) in the Netherlands.
        <a
          href="https://en.wikipedia.org/wiki/Groat_(coin)"
          className="external"
        >
          wikipedia
        </a>
      </footer>
    </React.StrictMode>
  );
};
render(React.createElement(App), document.getElementById("root"));
