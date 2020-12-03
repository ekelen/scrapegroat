import React from "react";

import { dateString } from "./util";

const Header = () => {
  return (
    <h1>
      Scraped Groat for <span className="date-string">{dateString}</span>
    </h1>
  );
};

export default Header;
