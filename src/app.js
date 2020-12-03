import React, { useCallback, useEffect, useState } from "react";
import { render } from "react-dom";

import { getRandomPositionFromTotal } from "./util";

import { getTotalResults, scrape } from "./useGetGroatData.js";

import Groat from "./Groat.jsx";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

const App = () => {
  const [groatLoading, setGroatLoading] = useState(false);
  const [groat, setGroat] = useState(null);
  const [groatError, setGroatError] = useState(null);

  const [positionLoading, setPositionLoading] = useState(false);
  const [position, setPosition] = useState(-1);

  const createValidPosition = useCallback(() => {
    setPositionLoading(true);
    getTotalResults()
      .then((n) => {
        if (n === 0) {
          throw new Error("No results found from external source.");
        }
        const pos = getRandomPositionFromTotal(n);
        setPosition(pos);
      })
      .catch((e) => {
        setGroatError(e);
      })
      .finally(() => setPositionLoading(false));
  }, []);

  const getGroatData = useCallback(() => {
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
  }, [position, setGroat, setGroatLoading, setGroatError, groat, groatError]);

  useEffect(() => {
    createValidPosition();
  }, [createValidPosition]);

  useEffect(() => {
    getGroatData();
  }, [getGroatData]);

  return (
    <React.StrictMode>
      <main>
        <Header />
        {!!groat && <Groat groatData={groat} />}
        {!!groatError && (
          <div>
            Sorry, no groats today. Reason: <em>{groatError.toString()}</em>
          </div>
        )}
        {(positionLoading || groatLoading) && <div>Loading...</div>}
      </main>
      <Footer />
    </React.StrictMode>
  );
};
render(React.createElement(App), document.getElementById("root"));
