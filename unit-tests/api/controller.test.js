const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const vsiInstanceProfilesRaw = require("../data-files/vsiInstanceProfilesRaw.json");
const vsiImagesRaw = require("../data-files/vsiImagesRaw.json");
const clusterFlavorsRaw = require("../data-files/clusterFlavorRaw.json");
const clusterVersionRaw = require("../data-files/clusterVersionRaw.json");
const { initMockAxios } = require("lazy-z");
const testJson = require("../data-files/craig-json.json");

describe("controller", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });
  describe("getBearerToken", () => {
    let requestConfig = {
      method: "post",
      url: `https://iam.cloud.ibm.com/identity/token?grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=***`,
      headers: {
        Accept: "application/json",
      },
    };
    it("should return a access token", () => {
      let { axios } = initMockAxios(
        { access_token: "token", expiration: 1 },
        false
      );
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
    it("should return a access token if a non expired token exists", () => {
      let { axios } = initMockAxios(
        {
          access_token: "token",
          expiration: Math.floor(Date.now() / 1000) + 100,
        },
        false
      );
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
    it("should reject on error", () => {
      let { axios } = initMockAxios({ stderr: "promise rejected" }, true);
      let testController = new controller(axios);
      return testController.getBearerToken(requestConfig).catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "promise rejected" },
          "it should return correct data"
        );
      });
    });
    it("should use existing token", () => {
      let { axios } = initMockAxios({});
      let testController = new controller(axios);
      testController.expiration = Math.floor(Date.now() / 1000) + 100;
      testController.token = "token";
      return testController.getBearerToken(requestConfig).then((data) => {
        assert.deepEqual(data, "token", "it should return correct data");
      });
    });
    it("should reject on no api key error", () => {
      let { axios } = initMockAxios({ stderr: "No API_KEY defined" }, true);
      let testController = new controller(axios);
      let API_KEY = process.env.API_KEY;
      delete process.env.API_KEY;
      return testController.getBearerToken(requestConfig).catch((data) => {
        assert.deepEqual(
          data,
          { stderr: "No API_KEY defined" },
          "it should return correct data"
        );

        process.env.API_KEY = API_KEY;
      });
    });
  });
});
