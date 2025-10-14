import React from "react";
import { CraigFormHeading, CraigToggleForm, RenderForm } from "../../forms";
import { ScrollFormWrapper } from "./ScrollFormWrapper";
import { contains } from "lazy-z";
import PropTypes from "prop-types";

class ScrollForm extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const craig = this.props.craig;
    return (
      <ScrollFormWrapper>
        <CraigFormHeading
          icon={RenderForm(this.props.icon, {
            style: {
              marginRight: "0.5rem",
              marginTop: "0.4rem",
            },
          })}
          noMarginBottom
          name={this.props.composedName}
        />
        {!this.props.isVpcPage ? (
          <CraigToggleForm
            key={this.props.selectedItem + this.props.selectedIndex}
            tabPanel={{ hideAbout: true }}
            onSave={
              this.props.overrideSave ||
              this.props.craig[this.props.selectedItem].save
            }
            onDelete={
              this.props.overrideDelete ||
              this.props.craig[this.props.selectedItem].delete
            }
            noDeleteButton={this.props.selectedItem === "atracker"}
            hideChevron
            hideName
            hide={false}
            name={
              contains(
                ["logdna", "sysdig", "atracker", "cloud_logs"],
                this.props.selectedItem
              )
                ? this.props.craig.store.json[this.props.selectedItem].name
                : this.props.craig.store.json[this.props.selectedItem][
                    this.props.selectedIndex
                  ].name
            }
            submissionFieldName={this.props.selectedItem}
            innerFormProps={this.props.innerFormProps}
          />
        ) : (
          ""
        )}
        {this.props.children ? this.props.children : ""}
      </ScrollFormWrapper>
    );
  }
}

ScrollForm.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  composedName: PropTypes.string.isRequired,
  icon: PropTypes.object.isRequired,
  selectedItem: PropTypes.string.isRequired,
  selectedIndex: PropTypes.number.isRequired,
  innerFormProps: PropTypes.shape({}).isRequired,
  overrideSave: PropTypes.func,
  overrideDelete: PropTypes.func,
};

export default ScrollForm;
