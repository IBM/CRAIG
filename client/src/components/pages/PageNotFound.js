import React from "react";
import craig404 from "../../images/craig404.png";

/**
 * Error Page not found Page
 */
export const PageNotFound = () => {
  return (
    <div className="underConstruction flexDirectionColumn">
      <img src={craig404} width="300" height="300" />
      <br />
      <h4>
        Unfortunately, we couldn’t find the page you were looking for, but here
        are some helpful places to start from:
      </h4>
      <br />
      <a href="http://localhost:3000/projects">Projects</a> <br />
      <a href="http://localhost:3000/docs/about">About</a> <br />
      <a href="http://localhost:3000/docs/tutorial">Tutorial</a>
    </div>
  );
};
