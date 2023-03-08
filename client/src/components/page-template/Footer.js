import { CaretLeft, CaretRight, Close, ChevronUp } from "@carbon/icons-react";
import { Button } from "@carbon/react";
import React from "react";
import PropTypes from "prop-types";
import "./footer.scss";

/**
 * div for footer components
 */
class FooterHighlight extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isHovering: false
    };
    this.handleMouseOver = this.handleMouseOver.bind(this);
    this.handleMouseOut = this.handleMouseOut.bind(this);
  }
  /**
   * handle mouse over
   */
  handleMouseOver() {
    this.setState({ isHovering: true });
  }

  /**
   * handle mouse out
   */
  handleMouseOut() {
    this.setState({ isHovering: false });
  }

  render() {
    return (
      <a className="cursorPointer" onClick={() => this.props.onClick()}>
        <div
          className={
            "displayFlex alignItemsCenter justifyContent " +
            (this.props.backButton ? "backButton" : "floatRight nextButton") +
            (this.state.isHovering ? " highlight" : "")
          }
          onMouseEnter={this.handleMouseOver}
          onMouseLeave={this.handleMouseOut}
        >
          {this.props.children}
        </div>
      </a>
    );
  }
}

FooterHighlight.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired
};

const Footer = props => {
  let next = props.navigate();
  let previous = props.navigate(true);
  return (
    <div className="footerButton pointerEventsNone">
      <div className="buttonRight">
        {/* 
        popover wrapper commented out until react assets published
        <PopoverWrapper
          hoverText={
            props.hideFooter ? "Show Navigation Bar" : "Dismiss Navigation Bar"
          }
          contentClassName="footerPopover"
          align="left"
        > */}
        <Button
          kind="primary"
          size="sm"
          id="footer-open-close"
          onClick={() => {
            props.toggleFooter();
          }}
          className={
            "forceTertiaryButtonStyles pointerEventsAuto" +
            (!props.hideFooter ? " buttonCollapsed" : "")
          }
        >
          {props.hideFooter ? <ChevronUp /> : <Close />}
        </Button>
        {/* </PopoverWrapper> */}
      </div>
      {props.hideFooter === false && (
        <div className="footer pointerEventsAuto">
          {previous.onClick && (
            <FooterHighlight backButton onClick={previous.onClick}>
              <CaretLeft size="24" />
              <div className="caretMargin leftTextAlign">
                <div className="smallerTextFooter">
                  Return to previous section
                </div>
                <div className="smallerText">{previous.title}</div>
              </div>
            </FooterHighlight>
          )}
          {next.onClick && (
            <FooterHighlight onClick={next.onClick}>
              <div className="caretMargin rightTextAlign">
                {window.location.pathname === "/" ? (
                  <div>Begin Customization</div>
                ) : (
                  <>
                    <div className="smallerTextFooter">
                      Continue on to next section
                    </div>
                    <div className="smallerText">{next.title}</div>
                  </>
                )}
              </div>
              <CaretRight size="24" />
            </FooterHighlight>
          )}
        </div>
      )}
    </div>
  );
};

Footer.propTypes = {
  hideFooter: PropTypes.bool.isRequired,
  navigate: PropTypes.func.isRequired,
  toggleFooter: PropTypes.func.isRequired
};

export default Footer;
