import React from "react";
import { Button, ProgressIndicator, ProgressStep } from "@carbon/react";
import "./tutorial.css";
import { ChevronLeft, ChevronRight } from "@carbon/icons-react";
import SplashPage from "../SplashPage";
import save from "../../../images/save.png";
import create from "../../../images/create.png";
import disabledsave from "../../../images/disabledsave.png";
import deletebutton from "../../../images/delete.png";
import download from "../../../images/download.png";
import invalid from "../../../images/invalid.png";
import PropTypes from "prop-types";

// animations for changing progress
const mountedStyle = { animation: "inAnimation 250ms ease-in" };
const unmountedStyle = {
  animation: "outAnimation 270ms ease-out",
  animationFillMode: "forwards",
};

class Tutorial extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      index: 0,
    };

    this.changeIndex = this.changeIndex.bind(this);
  }

  /**
   * increment/decrement the index by one
   * @param {String} direction
   */
  changeIndex(direction) {
    let index = this.state.index;
    let changeBy = direction === "forward" ? 1 : -1;
    if (index === 2 && direction === "forward") {
      window.location.pathname = "/";
    } else if (this.state.index >= 0 && this.state.index <= 2) {
      this.setState({
        index: index + changeBy,
      });
    }
  }

  render() {
    return (
      <div className="tutorial-page">
        {this.state.index === 0 && (
          <div style={this.state.index === 0 ? mountedStyle : unmountedStyle}>
            <SplashPage className="splash-tutorial" />
          </div>
        )}
        {this.state.index === 1 && (
          <div
            className="tile-container"
            style={this.state.index === 1 ? mountedStyle : unmountedStyle}
          >
            <TutorialTile
              image={create}
              title="Create Resources"
              description="Choose any resource by clicking on it within the hamburger menu, and create a new instance by pressing the add icon, located in the top right of the form."
            />
            <TutorialTile
              image={save}
              title="Update Resources"
              description="Edit form fields to customize the resource to your needs, then press the blue save button to save changes and update Terraform code."
            />
            <TutorialTile
              image={deletebutton}
              title="Delete Resources"
              description="The delete button allows you to delete any resource previously created. After confirming, the Terraform code will automatically update."
            />
          </div>
        )}
        {this.state.index === 2 && (
          <div
            className="tile-container"
            style={this.state.index === 2 ? mountedStyle : unmountedStyle}
          >
            <TutorialTile
              image={disabledsave}
              title="Disabled Save"
              description="Save will be automatically disabled if there is an error in the form's content or no changes have been made to ensure functioning Terraform code. If you are unable to save a form, check for errors."
            />
            <TutorialTile
              image={invalid}
              title="Invalid Pages"
              description="Invalid pages will be shown as red in the navigation menu. Fix errors in these pages to export your Terraform code."
            />
            <TutorialTile
              image={download}
              title="Download Configuration"
              description="After creating a valid configuration, you can download your terraform files with the download button in the top right of any page."
            />
          </div>
        )}
        {/* controls */}
        <ControlBar index={this.state.index} onIndexChange={this.changeIndex} />
      </div>
    );
  }
}

export default Tutorial;

const ControlBar = (props) => {
  return (
    <div className="control-box-container">
      <div className="controls-container">
        <div className="controls">
          <Button
            renderIcon={ChevronLeft}
            disabled={props.index === 0}
            kind="primary"
            hasIconOnly
            iconDescription="Back"
            onClick={() => props.onIndexChange("back")}
          />
          <Button
            renderIcon={ChevronRight}
            disabled={props.index > 2}
            kind="primary"
            hasIconOnly
            iconDescription={props.index < 2 ? "Next" : "Home"}
            onClick={() => props.onIndexChange("forward")}
          />
        </div>
      </div>
      <ProgressIndicator
        spaceEqually
        currentIndex={props.index}
        className="progress-indicator"
      >
        <ProgressStep label="Introduction" />
        <ProgressStep label="Managing Resources" />
        <ProgressStep label="Configuration" />
      </ProgressIndicator>
    </div>
  );
};

ControlBar.propTypes = {
  index: PropTypes.number.isRequired,
  onIndexChange: PropTypes.func.isRequired,
};

const TutorialTile = (props) => {
  return (
    <div className="tutorial-tile-container">
      <div className="tutorial-tile">
        <div className="image-container">
          <img className="fit-images" src={props.image} />
        </div>
        <p className="bold center">{props.title}</p>
        <hr />
        <p className="justify">{props.description}</p>
      </div>
    </div>
  );
};

TutorialTile.propTypes = {
  image: PropTypes.string.isRequired, // string for name of src
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
};
