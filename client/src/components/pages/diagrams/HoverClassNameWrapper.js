import React from "react";
import PropTypes from "prop-types";

class HoverClassNameWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false,
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }

  /**
   * handle mouse over
   */
  handleMouseOver() {
    if (!this.props.static) this.setState({ isHovering: true });
  }

  /**
   * handle mouse out
   */
  handleMouseOut() {
    if (!this.props.static) this.setState({ isHovering: false });
  }

  render() {
    return (
      <div
        className={
          this.props.className +
          (this.state.isHovering ? " " + this.props.hoverClassName : "")
        }
        onMouseEnter={this.handleMouseOver}
        onMouseLeave={this.handleMouseOut}
        onClick={this.props.onClick ? this.props.onClick : () => {}}
      >
        {this.props.children}
      </div>
    );
  }
}

HoverClassNameWrapper.defaultProps = {
  static: false,
  hoverClassName: "",
  className: "",
};

HoverClassNameWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  style: PropTypes.shape({}),
  hoverClassName: PropTypes.string.isRequired,
  static: PropTypes.bool.isRequired,
  onClick: PropTypes.func,
};

export default HoverClassNameWrapper;
