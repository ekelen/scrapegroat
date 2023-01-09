import React from "react";

const Groat = ({ groatData }) => {
  const { label, imgSrcObv, imgSrcRev, source } = groatData;
  return (
    <>
      <div className="groat-images">
        {imgSrcObv && <img src={imgSrcObv} alt={imgSrcObv} />}
        {imgSrcRev && <img src={imgSrcRev} alt={imgSrcObv} />}
      </div>
      <div className="groat-text">
        <p>
          You are given one <strong>{label}</strong>
        </p>
        <p>
          <a href={source} alt={`Source: ${source}`} className="external">
            Source
          </a>
        </p>
      </div>
    </>
  );
};

export default Groat;
