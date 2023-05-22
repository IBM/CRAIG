import { ToastNotification } from "@carbon/react";
import PropTypes from "prop-types";

export const Notification = (props) => {
  return (
    <ToastNotification
      lowContrast
      className="notification-item"
      kind={props.kind}
      title={props.title}
      subtitle={props.text}
      timeout={props.timeout}
    />
  );
};

Notification.defaultProps = {
  kind: "error",
  title: "An error occurred",
  timeout: 3000,
};

Notification.propTypes = {
  kind: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  timeout: PropTypes.number.isRequired,
};
