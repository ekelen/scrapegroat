import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import Footer from "./Footer.jsx";
import Groat from "./Groat.jsx";
import Header from "./Header.jsx";
import Spinner from "./Spinner.jsx";

const GROAT_ENDPOINT = "https://www.ersk.me/groats";

const App = () => {
  const [groatLoading, setGroatLoading] = useState(false);
  const [groat, setGroat] = useState(null);
  const [groatError, setGroatError] = useState(null);

  useEffect(() => {
    if (!groat && !groatError && !groatLoading) {
      setGroatLoading(true);
      fetch(GROAT_ENDPOINT)
        .then((result) => result.json())
        .then(({ coin, error }) => {
          setGroatError(error);
          setGroat(coin);
        })
        .catch((error) => {
          setGroatError(error);
          setGroat(null);
        })
        .finally(() => {
          setGroatLoading(false);
        });
    }
  }, [groat, groatLoading, groatError]);

  return (
    <React.StrictMode>
      <main>
        <Header />
        {!!groat && <Groat groatData={groat} />}
        {!!groatError && (
          <div className="dynamic-content">
            Sorry, no groats today. Reason: <em>{groatError.toString()}</em>
          </div>
        )}
        {groatLoading && (
          <div className="dynamic-content loading">
            <Spinner />
          </div>
        )}
      </main>
      <Footer />
    </React.StrictMode>
  );
};
render(React.createElement(App), document.getElementById("root"));
