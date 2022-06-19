import React, { useEffect, useState } from "react";
import { render } from "react-dom";

import Footer from "./Footer.jsx";
import Groat from "./Groat.jsx";
import Header from "./Header.jsx";
import Spinner from "./Spinner.jsx";

const GROAT_ENDPOINT = ".netlify/functions/get-coin";

const App = () => {
  const [groatLoading, setGroatLoading] = useState(false);
  const [groat, setGroat] = useState(null);
  const [groatError, setGroatError] = useState("");

  useEffect(() => {
    if (!groat && !groatError && !groatLoading) {
      setGroatLoading(true);
      fetch(GROAT_ENDPOINT)
        .then((result) => {
          return result.json();
        })
        .then((result) => {
          if (result.error) {
            setGroatError(result.error);
            return;
          }
          setGroat(result.coin.payload);
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
        <div className="content-main">
          <div className="content-box">
            {groat && <Groat groatData={groat} />}
            {groatError && (
              <p>
                Sorry, no groats today. Reason:{" "}
                <em>{groatError ? groatError.toString() : "Unknown..."}</em>
              </p>
            )}
            {groatLoading && <Spinner />}
          </div>
        </div>
      </main>
      <Footer />
    </React.StrictMode>
  );
};
render(React.createElement(App), document.getElementById("root"));
