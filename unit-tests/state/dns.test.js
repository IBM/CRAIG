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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("dns.init", () => {
    it("should initialize dns", () => {
      assert.deepEqual(craig.store.json.dns, []);
    });
  });
  describe("dns crud operations", () => {
    beforeEach(() => {
      craig.dns.create({
        name: "frog",
        resource_group: "service-rg",
        plan: "standard",
      });
    });
    it("should create a dns instance", () => {
      let expectedData = [
        {
          name: "frog",
          resource_group: "service-rg",
          plan: "standard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        craig.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should update a dns instance", () => {
      craig.dns.save(
        {
          name: "dev",
          resource_group: "service-rg",
          plan: "standard",
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
          plan: "standard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        craig.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should update a dns instance when resource group is not found", () => {
      craig.dns.save(
        {
          name: "dev",
          resource_group: "x",
          plan: "standard",
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
          plan: "standard",
          zones: [],
          records: [],
          custom_resolvers: [],
        },
      ];
      assert.deepEqual(
        craig.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
    it("should delete a dns instance", () => {
      craig.dns.delete(
        {},
        {
          data: {
            name: "frog",
          },
        }
      );
      let expectedData = [];
      assert.deepEqual(
        craig.store.json.dns,
        expectedData,
        "it should create correct dns instance"
      );
    });
  });
  describe("dns.zones", () => {
    beforeEach(() => {
      craig.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "standard",
      });
    });
    it("should create a new zone", () => {
      craig.dns.zones.create(
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
        craig.store.json.dns[0].zones[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should create a new zone and update permitted networks when vpcs are unfound", () => {
      craig.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      craig.dns.zones.save(
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
        craig.store.json.dns[0].zones[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a zone", () => {
      craig.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      craig.dns.zones.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        craig.store.json.dns[0].zones,
        [],
        "it should delete zone"
      );
    });
    it("should disable save when zone name duplicate in modal", () => {
      craig.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      craig.dns.zones.create(
        {
          name: "zone2",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      assert.isTrue(
        craig.dns.zones.name.invalid(
          { name: "zone" },
          { isModal: true, craig: craig }
        ),
        "it should be invalid"
      );
    });
  });
  describe("dns.records", () => {
    beforeEach(() => {
      craig.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "standard",
      });
      craig.dns.records.create(
        {
          name: "zone",
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
    });
    it("should create a new record", () => {
      let expectedData = {
        name: "zone",
        instance: "dev",
      };
      assert.deepEqual(
        craig.store.json.dns[0].records[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a record", () => {
      craig.dns.records.save(
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
        instance: "dev",
      };
      assert.deepEqual(
        craig.store.json.dns[0].records[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a record", () => {
      craig.dns.records.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        craig.store.json.dns[0].records,
        [],
        "it should add zone"
      );
    });
    describe("dns.records.schema", () => {
      it("should have a valid preference when type is not mx", () => {
        assert.isFalse(
          craig.dns.records.preference.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have an valid preference when type is mx and is not in range", () => {
        assert.isTrue(
          craig.dns.records.preference.invalid({ type: "MX", preference: -10 }),
          "it should be invalid"
        );
      });
      it("should have a valid port when type is not srv", () => {
        assert.isFalse(
          craig.dns.records.port.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have an valid port when type is srv and is not in range", () => {
        assert.isTrue(
          craig.dns.records.port.invalid({ type: "SRV", port: -10 }),
          "it should be invalid"
        );
      });
      it("should have a valid protocol when type is not srv", () => {
        assert.isFalse(
          craig.dns.records.protocol.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have an valid protocol when type is srv and no value", () => {
        assert.isTrue(
          craig.dns.records.protocol.invalid({ type: "SRV" }),
          "it should be invalid"
        );
      });
      it("should have a valid priority when type is not srv", () => {
        assert.isFalse(
          craig.dns.records.priority.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have an valid priority when type is srv and is not in range", () => {
        assert.isTrue(
          craig.dns.records.priority.invalid({ type: "SRV", priority: -12 }),
          "it should be invalid"
        );
      });
      it("should have a valid service when type is not srv", () => {
        assert.isFalse(
          craig.dns.records.service.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have invalid service", () => {
        assert.isTrue(
          craig.dns.records.service.invalid({ type: "SRV" }),
          "it should be valid"
        );
        assert.isTrue(
          craig.dns.records.service.invalid({ type: "SRV", service: "mmm" }),
          "it should be valid"
        );
      });
      it("should have a valid weight when type is not srv", () => {
        assert.isFalse(
          craig.dns.records.weight.invalid({ type: "AAAA" }),
          "it should be valid"
        );
      });
      it("should have invalid weight", () => {
        assert.isTrue(
          craig.dns.records.weight.invalid({ type: "SRV" }),
          "it should be valid"
        );
        assert.isTrue(
          craig.dns.records.weight.invalid({ type: "SRV", weight: "mmm" }),
          "it should be valid"
        );
      });
      it("should return correct groups for zones", () => {
        assert.deepEqual(
          craig.dns.records.dns_zone.groups(
            {},
            {
              arrayParentName: "dev",
              craig: craig,
            }
          ),
          [],
          "it should return correct groups"
        );
      });
      it("should hide preference when type is not MX", () => {
        assert.isTrue(
          craig.dns.records.preference.hideWhen({ type: "A" }),
          "it should be hidden"
        );
      });
      it("should hide port when type is not SRV", () => {
        assert.isTrue(
          craig.dns.records.port.hideWhen({ type: "A" }),
          "it should be hidden"
        );
      });
      it("should have invalid ttl when not a whole number", () => {
        assert.isTrue(
          craig.dns.records.ttl.invalid({ ttl: "1.2" }),
          "it should be invalid"
        );
      });
      it("should have invalid ttl when not in range", () => {
        assert.isTrue(
          craig.dns.records.ttl.invalid({ ttl: "2" }),
          "it should be invalid"
        );
      });
      it("should have a small ttl", () => {
        assert.deepEqual(
          craig.dns.records.ttl.size,
          "small",
          "it should be small"
        );
      });
      it("should return false for vpc invalid if not using vsi", () => {
        assert.deepEqual(
          craig.dns.records.vpc.invalid({}),
          false,
          "it should be false"
        );
      });
      it("should return true for vpc invalid if using vsi and no vpc selected", () => {
        assert.deepEqual(
          craig.dns.records.vpc.invalid({ use_vsi: true, vpc: "" }),
          true,
          "it should be true"
        );
      });
      it("should return true for vsi invalid if using vsi and no vsi selected", () => {
        assert.deepEqual(
          craig.dns.records.vsi.invalid({ use_vsi: true, vsi: "" }),
          true,
          "it should be true"
        );
      });
      it("should return false for vsi invalid if using vsi and no vpc selected", () => {
        assert.deepEqual(
          craig.dns.records.vsi.invalid({ use_vsi: false, vsi: "" }),
          false,
          "it should be true"
        );
      });
      it("should return a list of vsi based on vpc", () => {
        assert.deepEqual(
          craig.dns.records.vsi.groups({ vpc: "management" }, { craig: craig }),
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
          craig.dns.records.vsi.groups({ vpc: "" }, { craig: craig }),
          [],
          "it should return list of vsi"
        );
      });
      it("should hide rdata when using vsi", () => {
        assert.isTrue(
          craig.dns.records.rdata.hideWhen({ use_vsi: true }),
          "it should be hidden"
        );
      });
      it("should hide vsi when not using vsi", () => {
        assert.isTrue(
          craig.dns.records.vsi.hideWhen({ use_vsi: false }),
          "it should be hidden"
        );
      });
      it("should handle rdata invalid", () => {
        assert.isFalse(
          craig.dns.records.rdata.invalid({ use_vsi: true }),
          "it should have a valid rdata field when undefined and using VSI"
        );
        assert.isFalse(
          craig.dns.records.rdata.invalid({}),
          "it should have an invalid rdata field when undefined and not using VSI"
        );
      });
    });
    describe("dns.zones.schema", () => {
      beforeEach(() => {
        craig.dns.create({
          name: "dev",
          resource_group: "service-rg",
          plan: "standard",
        });
      });
      it("should return invalid when invalid description", () => {
        assert.isTrue(
          craig.dns.zones.description.invalid({ description: "@@@" }),
          "it should be invalid"
        );
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
    beforeEach(() => {
      craig.dns.create({
        name: "dev",
        resource_group: "service-rg",
        plan: "standard",
      });
      craig.dns.custom_resolvers.create(
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
    });
    it("should create a new custom_resolvers", () => {
      let expectedData = {
        instance: "dev",
        name: "zone",
        vpc: "management",
        subnets: ["vsi-zone-1"],
        zone: null,
      };
      assert.deepEqual(
        craig.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers", () => {
      craig.dns.custom_resolvers.save(
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
        craig.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with unfound vpc", () => {
      craig.dns.custom_resolvers.save(
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
        craig.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with unfound subnet", () => {
      craig.dns.custom_resolvers.save(
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
        craig.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should update a custom_resolvers with found zone", () => {
      craig.dns.zones.create(
        {
          name: "zone",
          vpcs: [],
        },
        {
          innerFormProps: { arrayParentName: "dev" },
        }
      );
      craig.dns.custom_resolvers.save(
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
        craig.store.json.dns[0].custom_resolvers[0],
        expectedData,
        "it should add zone"
      );
    });
    it("should delete a custom_resolvers", () => {
      craig.dns.custom_resolvers.delete(
        {},
        {
          data: { name: "zone" },
          arrayParentName: "dev",
        }
      );
      assert.deepEqual(
        craig.store.json.dns[0].custom_resolvers,
        [],
        "it should add zone"
      );
    });
    describe("custom resolver schema", () => {
      it("should be invalid when more than three subnets are selected", () => {
        assert.isTrue(
          craig.dns.custom_resolvers.subnets.invalid({ subnets: [1, 2, 3, 4] }),
          "it should be invalid"
        );
      });
      it("should be invalid when description is invalid", () => {
        assert.isTrue(
          craig.dns.custom_resolvers.description.invalid({
            description: "[1, 2, 3, 4]",
          }),
          "it should be invalid"
        );
      });
    });
  });
});
