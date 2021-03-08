import React from "react";
import img from "./svg/coins.svg";

const Spinner = () => {
  return (
    <div className="wrapper">
      <div className="loader"></div>
      <img src={img} alt="coin spinner" className="coins" />
    </div>
  );
};

export default Spinner;
