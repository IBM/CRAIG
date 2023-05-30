const { assert } = require("chai");
const { leftNavItemClassName } = require("../../client/src/lib/forms");
let window = {
  location: {
    pathname: "frog",
  },
};

describe("class names", () => {
  describe("leftNavItemClassName", () => {
    it("should return correct classname for path when not expanded or invalid", () => {
      let actualData = leftNavItemClassName(window, "test");
      assert.deepEqual(actualData, "rail ", "it should return classname");
    });
    it("should return correct classname for path when not expanded or invalid and on path", () => {
      let actualData = leftNavItemClassName(window, "frog");
      assert.deepEqual(
        actualData,
        "blueTileRail whiteFill rail ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when expanded and not current path", () => {
      let actualData = leftNavItemClassName(window, "test", true);
      assert.deepEqual(actualData, "expanded ", "it should return classname");
    });
    it("should return correct classname for path when expanded and current path", () => {
      let actualData = leftNavItemClassName(window, "frog", true);
      assert.deepEqual(
        actualData,
        "blueTileExpanded whiteFill expanded ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when expanded and not current path and invalid and not hovering", () => {
      let actualData = leftNavItemClassName(window, "test", true, true);
      assert.deepEqual(
        actualData,
        "invalid-form-left-nav whiteFill expanded ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when expanded and current path and invalid", () => {
      let actualData = leftNavItemClassName(window, "frog", true, true);
      assert.deepEqual(
        actualData,
        "invalid-form-left-nav whiteFill expanded ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when not expanded and not current path and invalid", () => {
      let actualData = leftNavItemClassName(window, "test", false, true);
      assert.deepEqual(
        actualData,
        "invalid-form-left-nav whiteFill rail ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when not expanded and not current path and invalid and is hovering", () => {
      let actualData = leftNavItemClassName(window, "test", false, true, true);
      assert.deepEqual(
        actualData,
        "invalid-form-left-nav rail ",
        "it should return classname"
      );
    });
    it("should return correct classname for path when not expanded and current path and invalid", () => {
      let actualData = leftNavItemClassName(window, "frog", false, true);
      assert.deepEqual(
        actualData,
        "invalid-form-left-nav whiteFill rail ",
        "it should return classname"
      );
    });
  });
});
