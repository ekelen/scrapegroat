import React, { Fragment } from "react";
import img from "./svg/coins.svg";

const Spinner = () => {
  return (
    <Fragment>
      <div className="loader"></div>
      <img src={img} alt="coin spinner" className="coins" />
    </Fragment>
  );
};

export default Spinner;
