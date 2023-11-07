const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const vsiInstanceProfilesRaw = require("../data-files/vsiInstanceProfilesRaw.json");
const vsiImagesRaw = require("../data-files/vsiImagesRaw.json");
const { initMockAxios } = require("lazy-z");

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
    it("should respond with the correct data", () => {
      let { axios } = initMockAxios(vsiImagesRaw);
      let testController = new controller(axios);
      return testController
        .vsiImages({ params: { region: "us-south" } }, res)
        .then(() => {
          assert.isTrue(res.send.calledOnce);
          assert.deepEqual(
            res.send.lastCall.args,
            [
              [
                "Debian GNU/Linux 9.x Stretch/Stable - Minimal Install (amd64) [debian-9-amd64]",
                "Ubuntu Linux 16.04 LTS Xenial Xerus Minimal Install (amd64) [my-image]",
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
