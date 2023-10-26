const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");

const powerImageJson = require("../../client/src/lib/docs/power-image-map.json");

describe("controller", () => {
  beforeEach(() => {
    res.send = new sinon.spy();
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
    delete process.env.POWER_WORKSPACE_US_SOUTH;
  });

  describe("getPowerImages", () => {
    it("should respond with error", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let { axios } = initMockAxios(
        {
          images: ["first", "second", "third"],
        },
        true
      );
      let testPowerController = new controller(axios);
      return testPowerController
        .getPowerComponent(
          {
            params: { region: "us-south", component: "images" },
          },
          res
        )
        .catch(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
    it("should respond with a list of images", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let usSouthImages = powerImageJson["us-south"];
      let { axios } = initMockAxios(
        {
          resources: [
            {
              guid: "fooGuid",
              crn: "fooCrn",
            },
          ],
          images: usSouthImages,
        },
        false
      );
      let testPowerController = new controller(axios);
      return testPowerController
        .getPowerComponent(
          {
            params: { region: "us-south", component: "images" },
          },
          res
        )
        .then(() => {
          assert.isTrue(res.send.calledOnceWith(usSouthImages));
        });
    });
    it("should respond with correct storage pools", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let { axios } = initMockAxios(
        {
          resources: [
            {
              guid: "fooGuid",
              crn: "fooCrn",
            },
          ],
          storagePoolsCapacity: [
            { poolName: "Tier1-Flash-1" },
            { poolName: "Tier1-Flash-2" },
            { poolName: "Tier3-Flash-1" },
            { poolName: "Tier1-Flash-2" },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      return testPowerController
        .getPowerComponent(
          {
            params: { region: "us-south", component: "storage_pools" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith([
              "Tier1-Flash-1",
              "Tier1-Flash-2",
              "Tier3-Flash-1",
              "Tier1-Flash-2",
            ])
          );
        });
    });
    it("should respond with error when no environment variable is present", () => {
      let { axios } = initMockAxios(
        {
          images: ["first", "second", "third"],
        },
        true
      );
      let testPowerController = new controller(axios);
      return testPowerController
        .getPowerComponent(
          {
            params: { region: "us-south", component: "images" },
          },
          res
        )
        .catch(() => {
          assert.isTrue(res.send.calledOnce);
        });
    });
  });
});
