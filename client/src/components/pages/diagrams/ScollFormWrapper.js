import "./diagrams.css";

export const ScrollFormWrapper = (props) => {
  return (
    <div className="scrollFormWrapper">
      <div>{props.children}</div>
    </div>
  );
};
