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

describe("dns", () => {
  describe("dns.init", () => {
    it("should initialize dns", () => {
      let state = newState();
      assert.deepEqual(state.store.json.dns, []);
    });
  });
  describe("dns crud operations", () => {
    let state;
    beforeEach(() => {
      state = new newState();
    });
    it("should create a dns instance", () => {
      state.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "stanard",
      });
      let expectedData = [
        {
          name: "dev",
          resource_group: "service-rg",
          plan: "stanard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        state.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should update a dns instance", () => {
      state.dns.create({
        name: "frog",
        resource_group: "service-rg",
        plan: "stanard",
      });
      state.dns.save(
        {
          name: "dev",
          resource_group: "service-rg",
          plan: "stanard",
        },
        {
          data: {
            name: "frog",
          },
        }
      );
      let expectedData = [
        {
          name: "dev",
          resource_group: "service-rg",
          plan: "stanard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        state.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should update a dns instance when resource group is not found", () => {
      state.dns.create({
        name: "frog",
        resource_group: "x",
        plan: "stanard",
      });
      state.dns.save(
        {
          name: "dev",
          resource_group: "x",
          plan: "stanard",
        },
        {
          data: {
            name: "frog",
          },
        }
      );
      let expectedData = [
        {
          name: "dev",
          resource_group: null,
          plan: "stanard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        state.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should delete a dns instance", () => {
      state.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "stanard",
      });
      state.dns.delete(
        {},
        {
          data: {
            name: "dev",
          },
        }
      );
      let expectedData = [];
      assert.deepEqual(
        state.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
  });
  describe("dns.zones", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "stanard",
      });
    });
    it("should create a new zone", () => {
      state.dns.zones.create(
        {
          name: "zone",
          permitted_networks: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      let expectedData = {
        name: "zone",
        permitted_networks: [],
      };
      assert.deepEqual(
        state.store.json.dns[0].zones[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should create a new zone and update permitted networks when vpcs are unfound", () => {
      state.dns.zones.create(
        {
          name: "zone",
          permitted_networks: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.save(
        {
          name: "zzzz",
          permitted_networks: ["frog", "toad", "moose"],
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
        permitted_networks: [],
      };
      assert.deepEqual(
        state.store.json.dns[0].zones[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a zone", () => {
      state.dns.zones.create(
        {
          name: "zone",
          permitted_networks: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        state.store.json.dns[0].zones,
        [],
        "it should delete zone"
      );
    });
  });
  describe("dns.records", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "stanard",
      });
    });
    it("should create a new record", () => {
      state.dns.records.create(
        {
          name: "zone",
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      let expectedData = {
        name: "zone",
      };
      assert.deepEqual(
        state.store.json.dns[0].records[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a record", () => {
      state.dns.records.create(
        {
          name: "zone",
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.records.save(
        {
          name: "zzzz",
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
      };
      assert.deepEqual(
        state.store.json.dns[0].records[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a record", () => {
      state.dns.records.create(
        {
          name: "zone",
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.records.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        state.store.json.dns[0].records,
        [],
        "it should add zone"
      );
    });
  });
  describe("dns.custom_resolvers", () => {
    let state;
    beforeEach(() => {
      state = new newState();
      state.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "stanard",
      });
    });
    it("should create a new custom_resolvers", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
          vpc: "management",
          subnets: ["vsi-zone-1"],
          zone: null
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      let expectedData = {
        name: "zone",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null
      };
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
          vpc: "management",
          subnets: ["vsi-zone-1"]
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.save(
        {
          name: "zzzz",
          vpc: "management",
          subnets: ["vsi-zone-1"]
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null
      };
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with unfound vpc", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
          vpc: "management",
          subnets: ["vsi-zone-1"]
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.save(
        {
          name: "zzzz",
          vpc: "bad",
          subnets: ["vsi-zone-1"],
          zone: null
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
        vpc: null,
        subnets: [],
        zone: null
      };
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with unfound subnet", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
          vpc: "management",
          subnets: ["vsi-zone-1"],
          zone: null
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.save(
        {
          name: "zzzz",
          vpc: "management",
          subnets: ["vsi-zone-1", "bad"]
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null
      };
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with found zone", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
          vpc: "management",
          subnets: ["vsi-zone-1"],
          zone: null
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.create(
        {
          name: "zone",
          permitted_networks: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.save(
        {
          name: "zzzz",
          vpc: "management",
          subnets: ["vsi-zone-1", "bad"],
          zone: "zone"
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        name: "zzzz",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: "zone"
      };
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a custom_resolvers", () => {
      state.dns.custom_resolvers.create(
        {
          name: "zone",
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        state.store.json.dns[0].custom_resolvers,
        [],
        "it should add zone"
      );
    });
  });
});
