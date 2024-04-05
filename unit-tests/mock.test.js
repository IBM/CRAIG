const { assert } = require("chai");
const { send } = require("./mocks/response.mock");
const { initRecursiveMockAxios } = require("./mocks/recursive-axios.mock");
describe("res", () => {
  it("should return data it was given", () => {
    let testData = ["1", "2", "3"];
    let actualData = send(testData);
    assert.deepEqual(actualData, testData, "should be the same data");
  });
});
describe("recursive axios", () => {
  it("should return first element in data array when recursive", () => {
    let axios = initRecursiveMockAxios(["hello", "world"], false, true);
    return axios.axios().then((response) => {
      assert.deepEqual(response, { data: "hello" }, "should be equal");
    });
  });
  it("should return all of data when not recursive", () => {
    let axios = initRecursiveMockAxios(["hello", "world"], false, false);
    return axios.axios().then((response) => {
      assert.deepEqual(
        response,
        { data: ["hello", "world"] },
        "should be equal"
      );
    });
  });
  it("should reject when err is true", () => {
    let axios = initRecursiveMockAxios(["hello", "world"], true, true);
    return axios.axios().catch((response) => {
      assert.deepEqual(response, ["hello", "world"], "should reject with data");
    });
  });
});
