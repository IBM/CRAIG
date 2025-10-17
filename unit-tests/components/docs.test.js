const { assert } = require("chai");
const { docTextFieldParams } = require("../../client/src/lib");

describe("docs functions", () => {
  describe("docTextFieldPsrams", () => {
    it("should return correct data when text is _default_includes", () => {
      let expectedData = {
        className: "marginBottomSmall",
        text: "The default configuration includes:",
      };
      let actualData = docTextFieldParams({
        text: "_default_includes",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data",
      );
    });
    it("should return correct data when text is not _default_includes", () => {
      let expectedData = {
        className: "marginBottomSmall",
        text: "hello",
      };
      let actualData = docTextFieldParams({
        text: "hello",
        className: "marginBottomSmall",
      });
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data",
      );
    });
  });
});
