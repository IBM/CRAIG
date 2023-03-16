const { assert } = require("chai");
const { propsMatchState } = require("../../client/src/lib/forms");

describe("propsMatchState", () => {
  it("should return true if stateData and componentProps.data are the same", () => {
    assert.isTrue(
      propsMatchState(
        "resource_groups",
        { name: "test" },
        { data: { name: "test" } }
      ),
      "it should be true"
    );
  });
  it("should return true if vpc and default_network_acl_name is empty string", () =>{
    assert.isTrue(
      propsMatchState(
        "vpcs",
        {
          name: "test",
          default_network_acl_name: ""
        },
        { data: { name: "test", default_network_acl_name: null } }
      ),
      "it should be true"
    )
  })
});
