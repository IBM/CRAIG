const { assert } = require("chai");
const sinon = require("sinon");
const controller = require("../../server/express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");
const { initRecursiveMockAxios } = require("../mocks/recursive-axios.mock");

describe("power api", () => {
  let spyFns;
  beforeEach(() => {
    res.send = new sinon.spy();
    spyFns = {
      getBearerToken: () => {
        return new Promise((resolve) => resolve("token"));
      },
      getPowerDetails: (guid) => {
        return new Promise((resolve) => resolve(guid));
      },
      getResourceInstance: (queryName) => {
        return new Promise((resolve) => resolve(queryName));
      },
    };
  });
  afterEach(() => {
    delete process.env.CRAIG_PROD;
    delete process.env.POWER_WORKSPACE_US_SOUTH;
  });
  describe("/api/power/us-south/images", () => {
    it("should respond with error", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let { axios } = initMockAxios(
        {
          images: ["first", "second", "third"],
        },
        true
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        testPowerController.getPowerDetails
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
          },
          res
        )
        .then(() => {
          assert.isTrue(testPowerController.getBearerToken.calledOnce);
          assert.isTrue(
            testPowerController.getPowerDetails.calledOnceWith("fooGuid")
          );
        });
    });
    it("should respond with a list of images", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let { axios } = initMockAxios(
        {
          resources: [
            {
              guid: "fooGuid",
              crn: "fooCrn",
            },
          ],
          images: [
            {
              name: "image1",
            },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        spyFns,
        "getPowerDetails"
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith([
              {
                name: "image1",
              },
            ]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getPowerDetails.calledOnceWith("fooGuid"),
            "should be true"
          );
        });
    });
    it("should respond with an error when unable to find workspace", () => {
      let { axios } = initMockAxios(
        {
          resources: [],
          images: [
            {
              name: "image1",
            },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getResourceInstance = new sinon.spy(
        testPowerController.getResourceInstance
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
            query: {
              name: "egg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(
              "Error: no power workspace found with name: egg"
            ),
            "it should send"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getResourceInstance.calledOnceWith("egg"),
            "should be true"
          );
        });
    });
    it("should respond with a list of images when using req", () => {
      let { axios } = initMockAxios(
        {
          resources: [
            {
              guid: "1234",
              crn: "fooCrn",
              id: "power-iaas",
            },
            {
              id: "no",
            },
          ],
          images: [
            {
              name: "image1",
            },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getResourceInstance = new sinon.spy(
        testPowerController.getResourceInstance
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
            query: {
              name: "egg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith([{ name: "image1", use_data: true }]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getResourceInstance.calledOnceWith("egg"),
            "should be true"
          );
        });
    });
    it("should respond with a list of images when using req and images are found within workspace", () => {
      function twoStepAxios(data, err) {
        let calls = -1;
        /**
         * moch axios promise
         * @returns {Promise} axios mock promise
         */
        function mockAxios() {
          calls++;
          return new Promise((resolve, reject) => {
            if (err) reject(data);
            else {
              console.log("calls", calls, data[calls]);
              resolve({ data: data[calls] });
            }
          });
        }

        function constructor() {
          this.axios = mockAxios;
        }
        return new constructor();
      }
      let { axios } = twoStepAxios([
        {
          resources: [
            {
              guid: "1234",
              crn: "fooCrn",
              id: "power-iaas",
            },
            {
              id: "no",
            },
          ],
          images: [
            {
              name: "image1",
            },
            {
              name: "image2",
            },
          ],
        },
        {
          resources: [
            {
              guid: "1234",
              crn: "fooCrn",
              id: "power-iaas",
            },
            {
              id: "no",
            },
          ],
          images: [
            {
              name: "image1",
            },

            {
              name: "image2",
            },
          ],
        },
        {
          images: [
            {
              name: "image1",
            },
            {
              name: "image3",
            },
          ],
        },
      ]);
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getResourceInstance = new sinon.spy(
        testPowerController.getResourceInstance
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
            query: {
              name: "egg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith([
              { name: "image2" },
              { name: "image1", use_data: true },
              { name: "image3", use_data: true },
            ]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getResourceInstance.calledOnceWith("egg"),
            "should be true"
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
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        spyFns,
        "getPowerDetails"
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "images" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(
              "Error: environment variable POWER_WORKSPACE_US_SOUTH has no value."
            )
          );
          assert.isTrue(testPowerController.getBearerToken.notCalled);
          assert.isTrue(testPowerController.getPowerDetails.notCalled);
        });
    });
  });
  describe("/api/power/us-south/storage-capacity/storage-pools", () => {
    it("should respond with a list of storage pools when using req", () => {
      let { axios } = initMockAxios(
        {
          resources: [
            {
              guid: "1234",
              crn: "fooCrn",
              id: "power-iaas",
            },
            {
              id: "no",
            },
          ],
          storagePoolsCapacity: [
            { poolName: "pool1", replicationEnabled: false },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getResourceInstance = new sinon.spy(
        testPowerController.getResourceInstance
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "" },
            query: {
              name: "egg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["pool1"]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getResourceInstance.calledOnceWith("egg"),
            "should be true"
          );
        });
    });
    it("should send storage pools", () => {
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
            { poolName: "Tier1-Flash-1", replicationEnabled: true },
            { poolName: "Tier1-Flash-2", replicationEnabled: true },
            { poolName: "Tier3-Flash-1", replicationEnabled: false },
            { poolName: "Tier1-Flash-2", replicationEnabled: false },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        spyFns,
        "getPowerDetails"
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "storage_pools" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith([
              "Tier1-Flash-1 (Replication Enabled)",
              "Tier1-Flash-2 (Replication Enabled)",
              "Tier3-Flash-1",
              "Tier1-Flash-2",
            ]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getPowerDetails.calledOnceWith("fooGuid"),
            "should be true"
          );
        });
    });
    it("should respond with error when powerWorkspaceData is undefined", () => {
      process.env.POWER_WORKSPACE_US_SOUTH = "fooGuid";
      let { axios } = initMockAxios(
        {
          resources: [undefined],
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
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        testPowerController.getPowerDetails
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "storage_pools" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(
              "Error: powerWorkspaceData is undefined. Make sure the guid for your power workspace environment variables exist and are correct."
            )
          );
          assert.isTrue(testPowerController.getBearerToken.calledOnce);
          assert.isTrue(
            testPowerController.getPowerDetails.calledOnceWith("fooGuid"),
            "should be true"
          );
        });
    });
  });
  describe("/api/power/us-south/storage-tiers", () => {
    it("should respond with a list of storage tiers when using req", () => {
      let { axios } = initRecursiveMockAxios(
        [
          {
            resources: [
              {
                guid: "1234",
                crn: "fooCrn",
                id: "power-iaas",
              },
              {
                id: "no",
              },
            ],
          },
          [{ name: "Tier1" }, { name: "Tier2" }],
        ],
        false,
        true
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getResourceInstance = new sinon.spy(
        testPowerController.getResourceInstance
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "storage_tiers" },
            query: {
              name: "egg",
            },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["Tier1", "Tier2"]),
            "it should be true"
          );
        });
    });
  });
  describe("/api/power/us-south/system-pools", () => {
    it("should send system pools", () => {
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
            { poolName: "Tier1-Flash-1", replicationEnabled: true },
            { poolName: "Tier1-Flash-2", replicationEnabled: true },
            { poolName: "Tier3-Flash-1", replicationEnabled: false },
            { poolName: "Tier1-Flash-2", replicationEnabled: false },
          ],
        },
        false
      );
      let testPowerController = new controller(axios);
      testPowerController.getBearerToken = new sinon.spy(
        spyFns,
        "getBearerToken"
      );
      testPowerController.getPowerDetails = new sinon.spy(
        spyFns,
        "getPowerDetails"
      );
      return testPowerController
        .getPowerComponent(
          {
            params: { zone: "us-south", component: "system_pools" },
          },
          res
        )
        .then(() => {
          assert.isTrue(
            res.send.calledOnceWith(["resources", "storagePoolsCapacity"]),
            "it should be true"
          );
          assert.isTrue(
            testPowerController.getBearerToken.calledOnce,
            "should be true"
          );
          assert.isTrue(
            testPowerController.getPowerDetails.calledOnceWith("fooGuid"),
            "should be true"
          );
        });
    });
  });
});
