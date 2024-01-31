import "./diagrams.css";

export const ScrollFormWrapper = (props) => {
  return (
    <div className="scrollFormWrapper">
      <div className="overflow-auto">{props.children}</div>
    </div>
  );
};
