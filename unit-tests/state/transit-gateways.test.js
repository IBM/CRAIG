const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("transit_gateways", () => {
  describe("transit_gateways.init", () => {
    it("should initialize default transit gateway as an array", () => {
      let state = new newState();
      let expectedData = [
        {
          name: "transit-gateway",
          resource_group: "service-rg",
          global: false,
          connections: [
            {
              tgw: "transit-gateway",
              vpc: "management",
            },
            {
              tgw: "transit-gateway",
              vpc: "workload",
            },
          ],
        },
      ];
      assert.deepEqual(
        state.store.json.transit_gateways,
        expectedData,
        "it should be equal"
      );
    });
  });
  describe("transit_gateways.onStoreUpdate", () => {
    it("should remove a connection when a vpc is deleted", () => {
      let state = new newState();
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [{ tgw: "transit-gateway", vpc: "workload" }],
        "it should only have one connection"
      );
    });
    it("should remove a connection when a power vs workspace is deleted", () => {
      let state = new newState();
      state.store.json._options.power_vs_zones = ["dal10", "dal12"];
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.transit_gateways.save(
        {
          connections: [
            { tgw: "todd", vpc: "management" },
            { tgw: "todd", vpc: "workload" },
            { tgw: "transit-gateway", power: "toad" },
          ],
        },
        {
          data: {
            name: "transit-gateway",
          },
        }
      );
      state.power.delete(
        {},
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", vpc: "management" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have correct connections"
      );
    });
    it("should remove a connection when a power vs workspace is not in an edge enabled zone", () => {
      let state = new newState();
      state.store.json._options.power_vs_zones = ["dal10", "dal12"];
      state.power.create({
        name: "toad",
        imageNames: ["7100-05-09"],
        zone: "dal10",
      });
      state.transit_gateways.save(
        {
          connections: [
            { tgw: "todd", vpc: "management" },
            { tgw: "todd", vpc: "workload" },
            { tgw: "transit-gateway", power: "toad" },
          ],
        },
        {
          data: {
            name: "transit-gateway",
          },
        }
      );
      state.power.save(
        {
          name: "toad",
          imageNames: ["7100-05-09"],
          zone: "dal12",
        },
        {
          data: {
            name: "toad",
          },
        }
      );
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", vpc: "management" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have correct connections"
      );
    });
    it("should add a connection when crns is provided", () => {
      let state = new newState();
      state.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );

      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
        ],
        "it should have a crn connection"
      );
    });
    it("should add a connection when crns is provided and adding a second one", () => {
      let state = new newState();
      state.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );
      state.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn", "crn2"],
        },
        { data: { name: "todd" } }
      );

      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
          { tgw: "todd", crn: "crn2" },
        ],
        "it should have a crn connection"
      );
    });
    it("should remove a crn connection when a crn is removed", () => {
      let state = new newState();
      state.transit_gateways.save(
        { name: "todd", resource_group: "management-rg", crns: ["crn"] },
        { data: { name: "transit-gateway" } }
      );
      state.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn", "crn2"],
        },
        { data: { name: "todd" } }
      );

      state.transit_gateways.save(
        {
          name: "todd",
          resource_group: "management-rg",
          crns: ["crn"],
        },
        { data: { name: "todd" } }
      );

      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "todd", vpc: "management" },
          { tgw: "todd", vpc: "workload" },
          { tgw: "todd", crn: "crn" },
        ],
        "it should have a crn connection"
      );
    });
    it("should not remove crn connections", () => {
      let state = new newState();
      state.store.json.transit_gateways[0].connections[0].crn = "crn";
      delete state.store.json.transit_gateways[0].connections[0].vpc;
      state.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].connections,
        [
          { tgw: "transit-gateway", crn: "crn" },
          { tgw: "transit-gateway", vpc: "workload" },
        ],
        "it should only have one connection"
      );
    });
    it("should set resource group to null if deleted", () => {
      let state = new newState();
      state.resource_groups.delete({}, { data: { name: "service-rg" } });
      assert.deepEqual(
        state.store.json.transit_gateways[0].resource_group,
        null,
        "it should be null"
      );
    });
  });
  describe("transit_gateways.create", () => {
    it("should create a new transit gateway", () => {
      let state = new newState();
      state.transit_gateways.create({
        use_data: true,
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tgw: "tg-test", vpc: "management" }],
      });
      let expectedData = {
        use_data: true,
        name: "tg-test",
        resource_group: "management-rg",
        global: false,
        connections: [{ tgw: "tg-test", vpc: "management" }],
      };
      assert.deepEqual(
        state.store.json.transit_gateways[1],
        expectedData,
        "it should be second tg"
      );
    });
  });
  describe("transit_gateways.save", () => {
    it("should update transit gateway", () => {
      let state = new newState();
      state.transit_gateways.save(
        { name: "todd", resource_group: "management-rg" },
        { data: { name: "transit-gateway" } }
      );
      let expectedData = [
        {
          use_data: false,
          name: "todd",
          resource_group: "management-rg",
          global: false,
          connections: [
            {
              tgw: "todd",
              vpc: "management",
            },
            {
              tgw: "todd",
              vpc: "workload",
            },
          ],
        },
      ];
      assert.deepEqual(
        state.store.json.transit_gateways,
        expectedData,
        "it should change name and rg"
      );
    });
  });
  describe("transit_gateways.delete", () => {
    it("should delete transit gateway", () => {
      let state = new newState();
      state.transit_gateways.delete({}, { data: { name: "transit-gateway" } });
      assert.deepEqual(
        state.store.json.transit_gateways,
        [],
        "it should be empty"
      );
    });
  });
  describe("transit_gateways.schema", () => {
    describe("resource_groups", () => {
      describe("groups", () => {
        it("should return resource groups", () => {
          let state = newState();
          assert.deepEqual(
            state.transit_gateways.resource_group.groups({}, { craig: state }),
            ["service-rg", "management-rg", "workload-rg"],
            "it should return correct data"
          );
        });
      });
      describe("hideWhen", () => {
        it("should return resource groups", () => {
          let state = newState();
          assert.isTrue(
            state.transit_gateways.resource_group.hideWhen(
              { use_data: true },
              { craig: state }
            ),
            "it should return correct data"
          );
        });
      });
    });
    describe("vpc_connections", () => {
      describe("groups", () => {
        it("should return groups", () => {
          let craig = newState();
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups({}, { craig: craig }),
            ["management", "workload"],
            "it should return correct groups"
          );
        });
        it("should return groups when tgw is local and management is already attached to a different local transit gateway", () => {
          let craig = newState();
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                vpc: "management",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups(
              {
                global: false,
                connections: [],
              },
              {
                craig: craig,
                data: {
                  name: "transit-gateway",
                },
              }
            ),
            ["workload"],
            "it should return correct groups"
          );
        });
        it("should return groups when tgw is local and management is already attached to a different local transit gateway in modal", () => {
          let craig = newState();
          craig.transit_gateways.save(
            {
              connections: [
                {
                  tgw: "tranist-gateway",
                  vpc: "management",
                },
              ],
            },
            { data: { name: "transit-gateway" } }
          );
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.groups(
              {
                global: false,
                connections: [],
              },
              {
                craig: craig,
                isModal: true,
              }
            ),
            ["workload"],
            "it should return correct groups"
          );
        });
      });
      describe("onRender", () => {
        it("should return string list of vpc values", () => {
          let craig = newState();
          assert.deepEqual(
            craig.transit_gateways.vpc_connections.onRender(
              {
                connections: [
                  {
                    tgw: "hi",
                    vpc: "toad",
                  },
                  {
                    tgw: "hi",
                    power: "yeah",
                  },
                ],
              },
              {
                craig: craig,
              }
            ),
            ["toad"],
            "it should return correct list"
          );
        });
      });
      describe("onStateChange", () => {
        it("should return correct data on state change", () => {
          let stateData = {
            name: "tgw",
            connections: [
              {
                tgw: "tgw",
                power: "power",
              },
            ],
            vpc_connections: ["frog"],
          };
          let craig = newState();
          craig.transit_gateways.vpc_connections.onStateChange(stateData);
          assert.deepEqual(
            stateData,
            {
              connections: [
                { power: "power", tgw: "tgw" },
                {
                  vpc: "frog",
                  tgw: "tgw",
                },
              ],
              name: "tgw",
            },
            "it should return correct data"
          );
        });
      });
    });
    describe("power_connections", () => {
      describe("groups", () => {
        it("should return groups", () => {
          let craig = newState();
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal12",
            images: [],
            imageNames: [],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              {},
              { craig: craig }
            ),
            ["power"],
            "it should return correct groups"
          );
        });
        it("should return groups when one power workspace is attached to a different transit gateway with the same global setting in modal", () => {
          let craig = newState();
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                power: "power-also",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              { global: false },
              { craig: craig, isModal: true }
            ),
            ["power"],
            "it should return correct groups"
          );
        });
        it("should return groups when one power workspace is attached to a different transit gateway with the same global setting as form", () => {
          let craig = newState();
          craig.store.json._options.power_vs_zones = ["dal10", "dal12"];
          craig.power.create({
            name: "power",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.power.create({
            name: "power-also",
            zone: "dal10",
            images: [],
            imageNames: [],
          });
          craig.transit_gateways.create({
            name: "transit-gateway2",
            resource_group: "service-rg",
            global: false,
            connections: [
              {
                tgw: "transit-gateway",
                power: "power-also",
              },
            ],
          });
          assert.deepEqual(
            craig.transit_gateways.power_connections.groups(
              { global: false },
              {
                craig: craig,
                data: {
                  name: "transit-gateway",
                },
              }
            ),
            ["power"],
            "it should return correct groups"
          );
        });
      });
      describe("onRender", () => {
        it("should return string list of vpc values", () => {
          let craig = newState();
          assert.deepEqual(
            craig.transit_gateways.power_connections.onRender({
              connections: [
                {
                  tgw: "hi",
                  power: "toad",
                },
                {
                  tgw: "hi",
                  vpc: "frog",
                },
              ],
            }),
            ["toad"],
            "it should return correct list"
          );
        });
      });
      describe("onStateChange", () => {
        it("should return correct data on state change", () => {
          let stateData = {
            name: "tgw",
            connections: [
              {
                tgw: "tgw",
                vpc: "frog",
              },
              {
                tgw: "tgw",
                power: "power-also",
              },
            ],
            power_connections: ["power", "power-also"],
          };
          let craig = newState();
          craig.transit_gateways.power_connections.onStateChange(stateData);
          assert.deepEqual(
            stateData,
            {
              connections: [
                {
                  vpc: "frog",
                  tgw: "tgw",
                },
                { power: "power", tgw: "tgw" },
                {
                  tgw: "tgw",
                  power: "power-also",
                },
              ],
              name: "tgw",
            },
            "it should return correct data"
          );
        });
      });
    });
    describe("crns", () => {
      describe("invalidText", () => {
        it("should return true when invalid crn in list", () => {
          let state = new newState();
          assert.isTrue(
            state.transit_gateways.crns.invalidText({
              crns: ["crn:v1:bluemix:public:abcdf", "mooseeeeeeeeeeeeeeeeee"],
            })
          );
        });
      });
    });
  });
});
