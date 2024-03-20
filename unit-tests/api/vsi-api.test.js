const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const vsiInstanceProfilesRaw = require("../data-files/vsiInstanceProfilesRaw.json");
const vsiImagesRaw = require("../data-files/vsiImagesRaw.json");
const vsiImagesRawPage2 = require("../data-files/vsiImagesRawPage2.json");
const { initMockAxios } = require("lazy-z");

/**
 * initialize mock axios
 * @param {object} data arbitrary data to return
 * @param {boolean=} err reject data on error
 * @param {boolean} recursive true if axios is used in a recursive test
 * @returns {Promise} mock axios
 */
function initRecursiveMockAxios(data, err, recursive) {
  let timesCalled = -1;
  /**
   * moch axios promise
   * @returns {Promise} axios mock promise
   */
  function mockAxios() {
    timesCalled++;
    return new Promise((resolve, reject) => {
      if (err) reject(data);
      else resolve({ data: recursive ? data[timesCalled] : data });
    });
  }

  function constructor() {
    this.axios = mockAxios;
    this.axios.get = mockAxios;
    this.axios.post = mockAxios;
    this.axios.put = mockAxios;
    this.axios.patch = mockAxios;
    this.axios.delete = mockAxios;
  }
  return new constructor();
}

describe("vsi api", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });

  describe("vsiInstanceProfiles", () => {
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios(vsiInstanceProfilesRaw);
      let testController = new controller(axios);
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["bx2-2x8", "bx2-4x16", "bx2-8x32"])
          );
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(vsiInstanceProfilesRaw, true);
      let testController = new controller(axios);
      return testController
        .vsiInstanceProfiles({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
  describe("vsiImages", () => {
    let data;
    beforeEach(() => {
      data = [vsiImagesRaw, vsiImagesRawPage2];
    });
    it("should respond with the correct data", () => {
      let { axios } = initRecursiveMockAxios(data, false, true);
      let testController = new controller(axios);
      testController.getBearerToken = () => {
        return new Promise((resolve) => resolve("token"));
      };
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
          assert.deepEqual(
            res.send.lastCall.args,
            [
              [
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) 2 [debian-9-amd64]",
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) [debian-9-amd64]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) 2 [my-image]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) [my-image]",
                "Windows Server 2016 Standard Edition (amd64) 2 [windows-2016-amd64]",
                "Windows Server 2016 Standard Edition (amd64) [windows-2016-amd64]",
              ],
            ],
            "it should get images"
          );
        });
    });
    it("should respond with error", () => {
      let { axios } = initMockAxios(vsiImagesRaw, true);
      let testController = new controller(axios);
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
});
