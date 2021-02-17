import React from "react";

const Groat = ({ groatData }) => {
  const { name, region, date, source, imgSrcObv, imgSrcRev } = groatData;
  return (
    <div className="dynamic-content">
      <div className="groat-images">
        {imgSrcObv && <img src={imgSrcObv} alt={imgSrcObv} />}
        {imgSrcRev && <img src={imgSrcRev} alt={imgSrcObv} />}
      </div>
      <div className="groat-text">
        <p>
          You are given one <strong>{name + " "}</strong>
          in the region of <strong>{region}</strong> sometime between the years
          of <strong>{date}</strong>.
        </p>
        <p>
          <a href={source} alt={`Source: ${source}`} className="external">
            Source
          </a>
        </p>
      </div>
    </div>
  );
};

export default Groat;
