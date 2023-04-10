const { assert } = require("chai");
const { forceShowForm } = require("../../client/src/lib/forms");

describe("forceShowForm", () => {
  it("should force forms open if save is disabled", () => {
    assert.isTrue(
      forceShowForm(
        {},
        {
          submissionFieldName: "vpcs",
          innerFormProps: {
            data: {
              name: "management",
              bucket: null,
            },
          },
        }
      ),
      "it should be true"
    );
  });
});
