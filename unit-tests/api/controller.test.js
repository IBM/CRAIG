const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");

describe("controller", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
    process.env.API_KEY = "1234"; //set arbitrary API Key value for testing
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
  });
  describe("sendDataOnTokenValid", () => {
    it("should use callback when invalid token", () => {
      let axios = initMockAxios({});
      let testController = new controller(axios);
      let callback = () => {
        assert.isTrue(true, "it should be true");
      };
      return testController.sendDataOnTokenValid({}, "field", callback);
    });
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
