const { assert } = require("chai");
const {
  primaryButtonClass,
  dynamicPrimaryButtonProps,
  dynamicSecondaryButtonProps,
  statelessWrapperProps,
  tabPanelProps,
} = require("../../../client/src/lib/components/toggle-form-components");

describe("toggle form component functions", () => {
  describe("primaryButtonClass", () => {
    it("should return className with no props", () => {
      assert.deepEqual(
        primaryButtonClass(),
        "forceTertiaryButtonStyles marginRightSmall tertiaryButtonColors ",
        "it should return correct props"
      );
    });
    it("should return className when no delete button", () => {
      assert.deepEqual(
        primaryButtonClass({ noDeleteButton: true }),
        "forceTertiaryButtonStyles tertiaryButtonColors ",
        "it should return correct props"
      );
    });
    it("should return className when no delete button and disabled", () => {
      assert.deepEqual(
        primaryButtonClass({ noDeleteButton: true, disabled: true }),
        "forceTertiaryButtonStyles pointerEventsNone ",
        "it should return correct props"
      );
    });
    it("should return className when no delete button and className", () => {
      assert.deepEqual(
        primaryButtonClass({ noDeleteButton: true, className: "test" }),
        "forceTertiaryButtonStyles tertiaryButtonColors test",
        "it should return correct props"
      );
    });
  });
  describe("dynamicPrimaryButtonProps", () => {
    it("should return correct object with default props", () => {
      assert.deepEqual(
        dynamicPrimaryButtonProps({
          type: "add",
          hoverText: "Save Changes",
          disabled: false,
          type: "add",
        }),
        {
          buttonProps: {
            className:
              "forceTertiaryButtonStyles marginRightSmall tertiaryButtonColors ",
            kind: "tertiary",
          },
          popoverProps: {
            className: " ",
            hoverText: "Add Resource",
          },
        },
        "it should return correct props"
      );
    });
    it("should return correct object with override hover text", () => {
      assert.deepEqual(
        dynamicPrimaryButtonProps({
          type: "save",
          hoverText: "override",
          disabled: false,
        }),
        {
          buttonProps: {
            className:
              "forceTertiaryButtonStyles marginRightSmall tertiaryButtonColors ",
            kind: "primary",
          },
          popoverProps: {
            className: " ",
            hoverText: "override",
          },
        },
        "it should return correct props"
      );
    });
    it("should return correct object with override hover text disabled and inline", () => {
      assert.deepEqual(
        dynamicPrimaryButtonProps({
          type: "save",
          hoverText: "override",
          disabled: true,
          inline: true,
        }),
        {
          buttonProps: {
            className:
              "forceTertiaryButtonStyles marginRightSmall pointerEventsNone ",
            kind: "primary",
          },
          popoverProps: {
            className:
              "inlineBlock cursorNotAllowed  alignItemsCenter marginTopLarge inLineFormButton",
            hoverText: "override",
          },
        },
        "it should return correct props"
      );
    });
  });
  describe("dynamicSecondaryButtonProps", () => {
    it("should return correct data with no props in CRAIG v2", () => {
      assert.deepEqual(
        dynamicSecondaryButtonProps(
          {
            name: "frog",
          },
          true
        ),
        {
          buttonClassName:
            "cds--btn--danger--tertiary forceTertiaryButtonStyles",
          iconClassName: "redFill",
          popoverProps: {
            className: "",
            hoverText: "Delete Resource",
          },
        },
        "it should return correct data"
      );
    });
    it("should return correct data with no props in Classic CRAIG", () => {
      assert.deepEqual(
        dynamicSecondaryButtonProps(
          {
            name: "frog",
          },
          false
        ),
        {
          buttonClassName:
            "cds--btn--danger--tertiary forceTertiaryButtonStyles",
          iconClassName: "redFill",
          popoverProps: {
            className: "",
            hoverText: "Delete frog",
          },
        },
        "it should return correct data"
      );
    });
    it("should return correct data when disabled", () => {
      assert.deepEqual(
        dynamicSecondaryButtonProps(
          {
            disabled: true,
            name: "Resource",
          },
          false
        ),
        {
          buttonClassName:
            "cds--btn--danger--tertiary forceTertiaryButtonStyles pointerEventsNone",
          iconClassName: "",
          popoverProps: {
            className: "inlineBlock cursorNotAllowed",
            hoverText: "Delete Resource",
          },
        },
        "it should return correct data"
      );
    });
    it("should return correct data when disabled and disabled delete message", () => {
      assert.deepEqual(
        dynamicSecondaryButtonProps(
          {
            disabled: true,
            disableDeleteMessage: "no",
          },
          false
        ),
        {
          buttonClassName:
            "cds--btn--danger--tertiary forceTertiaryButtonStyles pointerEventsNone",
          iconClassName: "",
          popoverProps: {
            className: "inlineBlock cursorNotAllowed",
            hoverText: "no",
          },
        },
        "it should return correct data"
      );
    });
  });
  describe("statelessWrapperProps", () => {
    it("should return props for defaults", () => {
      assert.deepEqual(
        statelessWrapperProps({}),
        {
          headerType: "heading",
          titleClassName:
            "displayFlex alignItemsCenter widthOneHundredPercent marginBottomSmall fieldWidth",
        },
        "it should return correct data"
      );
    });
    it("should return props for defaults when hidden", () => {
      assert.deepEqual(
        statelessWrapperProps({
          hide: true,
        }),
        {
          headerType: "heading",
          titleClassName:
            "displayFlex alignItemsCenter widthOneHundredPercent fieldWidth",
        },
        "it should return correct data"
      );
    });
    it("should return props for defaults when toggleFormTitle", () => {
      assert.deepEqual(
        statelessWrapperProps({
          toggleFormTitle: "hi",
        }),
        {
          headerType: "p",
          titleClassName:
            "displayFlex alignItemsCenter widthOneHundredPercent marginBottomSmall fieldWidth",
        },
        "it should return correct data"
      );
    });
    it("should return props for defaults when subHeading", () => {
      assert.deepEqual(
        statelessWrapperProps({
          subHeading: true,
        }),
        {
          headerType: "subHeading",
          titleClassName:
            "displayFlex alignItemsCenter widthOneHundredPercent marginBottomSmall fieldWidth",
        },
        "it should return correct data"
      );
    });
  });
  describe("tabPanelProps", () => {
    it("should pass subheading when subheading true", () => {
      let expectedData = {
        headingType: "subHeading",
        hideButtons: true,
        hideHeading: false,
        disableButton: false,
      };
      let actualData = tabPanelProps(
        { tabIndex: 1 },
        {
          subHeading: true,
          hideFormTitleButton: true,
          hasBuiltInHeading: false,
          name: "hi",
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should pass heading when not subheading", () => {
      let expectedData = {
        headingType: "heading",
        hideButtons: false,
        hideHeading: false,
        disableButton: true,
      };
      let actualData = tabPanelProps(
        { tabIndex: 0 },
        {
          subHeading: false,
          hideFormTitleButton: false,
          hasBuiltInHeading: false,
          name: "hi",
          onClick: () => {},
          shouldDisableSave: () => {
            return true;
          },
        }
      );
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
