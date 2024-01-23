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
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zone",
        vpcs: [],
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
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.save(
        {
          name: "zzzz",
          vpcs: ["frog", "toad", "moose"],
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zzzz",
        vpcs: [],
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
          vpcs: [],
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
    it("should disable save when zone name duplicate in modal", () => {
      state.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.create(
        {
          name: "zone2",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      assert.isTrue(
        state.dns.zones.name.invalid(
          { name: "zone" },
          { isModal: true, craig: state }
        ),
        "it should be invalid"
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
    describe("dns.records.schema", () => {
      it("should return correct groups for zones", () => {
        assert.deepEqual(
          state.dns.records.dns_zone.groups(
            {},
            {
              arrayParentName: "dev",
              craig: state,
            }
          ),
          [],
          "it should return correct groups"
        );
      });
      it("should hide preference when type is not MX", () => {
        assert.isTrue(
          state.dns.records.preference.hideWhen({ type: "A" }),
          "it should be hidden"
        );
      });
      it("should hide port when type is not SRV", () => {
        assert.isTrue(
          state.dns.records.port.hideWhen({ type: "A" }),
          "it should be hidden"
        );
      });
      it("should have invalid ttl when not a whole number", () => {
        assert.isTrue(
          state.dns.records.ttl.invalid({ ttl: "1.2" }),
          "it should be invalid"
        );
      });
      it("should have invalid ttl when not in range", () => {
        assert.isTrue(
          state.dns.records.ttl.invalid({ ttl: "2" }),
          "it should be invalid"
        );
      });
      it("should return false for vpc invalid if not using vsi", () => {
        assert.deepEqual(
          state.dns.records.vpc.invalid({}),
          false,
          "it should be false"
        );
      });
      it("should return true for vpc invalid if using vsi and no vpc selected", () => {
        assert.deepEqual(
          state.dns.records.vpc.invalid({ use_vsi: true, vpc: "" }),
          true,
          "it should be true"
        );
      });
      it("should return true for vsi invalid if using vsi and no vsi selected", () => {
        assert.deepEqual(
          state.dns.records.vsi.invalid({ use_vsi: true, vsi: "" }),
          true,
          "it should be true"
        );
      });
      it("should return false for vsi invalid if using vsi and no vpc selected", () => {
        assert.deepEqual(
          state.dns.records.vsi.invalid({ use_vsi: false, vsi: "" }),
          false,
          "it should be true"
        );
      });
      it("should return a list of vsi based on vpc", () => {
        assert.deepEqual(
          state.dns.records.vsi.groups({ vpc: "management" }, { craig: state }),
          [
            "management-server-1-1",
            "management-server-1-2",
            "management-server-2-1",
            "management-server-2-2",
            "management-server-3-1",
            "management-server-3-2",
          ],
          "it should return list of vsi"
        );
      });
      it("should return a list of vsi based on vpc when none selected", () => {
        assert.deepEqual(
          state.dns.records.vsi.groups({ vpc: "" }, { craig: state }),
          [],
          "it should return list of vsi"
        );
      });
      it("should hide rdata when using vsi", () => {
        assert.isTrue(
          state.dns.records.rdata.hideWhen({ use_vsi: true }),
          "it should be hidden"
        );
      });
      it("should hide vsi when not using vsi", () => {
        assert.isTrue(
          state.dns.records.vsi.hideWhen({ use_vsi: false }),
          "it should be hidden"
        );
      });
    });
    describe("dns.zones.schema", () => {
      let craig;
      beforeEach(() => {
        craig = new newState();
        craig.dns.create({
          name: "dev",
          resource_group: "service-rg",
          plan: "stanard",
        });
      });
      it("should return if string is not valid", () => {
        assert.isTrue(
          craig.dns.zones.name.invalid(
            { name: null },
            {
              data: { name: "" },
              craig: {
                store: {
                  json: {
                    dns: [{ name: "hi", zones: [{ name: "hi" }] }],
                  },
                },
              },
            }
          )
        );
      });
      it("should allow periods within the name", () => {
        assert.isFalse(
          craig.dns.zones.name.invalid(
            { name: "example.com" },
            {
              data: { name: "" },
              craig: {
                store: {
                  json: {
                    dns: [{ name: "hi", zones: [{ name: "hi" }] }],
                  },
                },
              },
            }
          )
        );
      });
      it("should not allow periods at the end of the name", () => {
        assert.isTrue(
          craig.dns.zones.name.invalid(
            { name: "example.com." },
            {
              data: { name: "" },
              craig: {
                store: {
                  json: {
                    dns: [{ name: "hi", zones: [{ name: "hi" }] }],
                  },
                },
              },
            }
          )
        );
      });
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
          zone: null,
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zone",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null,
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
          subnets: ["vsi-zone-1"],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.custom_resolvers.save(
        {
          name: "zzzz",
          vpc: "management",
          subnets: ["vsi-zone-1"],
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zzzz",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null,
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
          subnets: ["vsi-zone-1"],
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
          zone: null,
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zzzz",
        vpc: null,
        subnets: [],
        zone: null,
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
          zone: null,
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
        zone: null,
        instance: "dev",
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
          zone: null,
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      state.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
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
          zone: "zone",
        },
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      let expectedData = {
        instance: "dev",
        name: "zzzz",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: "zone",
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
