const { assert } = require("chai");
const { state } = require("../../client/src/lib/state");
/**
 * initialize store
 * @param {boolean=} legacy
 * @returns {lazyZState} state store
 */
function newState(legacy) {
  let store = new state(legacy);
  store.setUpdateCallback(() => {});
  return store;
}

describe("fortigate state store", () => {
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  it("should initialize store", () => {
    assert.deepEqual(
      craig.store.json.fortigate_vnf,
      [],
      "it should initialize",
    );
  });
  it("should create a fortigate", () => {
    craig.fortigate_vnf.create({
      name: "fortigate",
      primary_subnet: "vsi-zone-1",
      secondary_subnet: "vsi-zone-2",
      security_groups: ["management-vpe-sg"],
      vpc: "egg",
      resource_group: "slz-management-rg",
      profile: "cx2-4x8",
      ssh_keys: ["slz-ssh-key"],
      zone: "1",
    });
    assert.deepEqual(
      craig.store.json.fortigate_vnf,
      [
        {
          name: "fortigate",
          primary_subnet: null,
          secondary_subnet: null,
          security_groups: [],
          vpc: null,
          resource_group: null,
          profile: "cx2-4x8",
          ssh_keys: [],
          zone: "1",
        },
      ],
      "it should have correct data",
    );
  });
  it("should create a fortigate with correct params", () => {
    craig.fortigate_vnf.create({
      name: "fortigate",
      primary_subnet: "vsi-zone-1",
      secondary_subnet: "vsi-zone-2",
      security_groups: ["management-vpe-sg"],
      vpc: "management",
      resource_group: "management-rg",
      profile: "cx2-4x8",
      ssh_keys: ["ssh-key"],
      zone: "1",
    });
    assert.deepEqual(
      craig.store.json.fortigate_vnf,
      [
        {
          name: "fortigate",
          primary_subnet: "vsi-zone-1",
          secondary_subnet: "vsi-zone-2",
          security_groups: ["management-vpe-sg"],
          vpc: "management",
          resource_group: "management-rg",
          profile: "cx2-4x8",
          ssh_keys: ["ssh-key"],
          zone: "1",
        },
      ],
      "it should have correct data",
    );
  });
  it("should update a fortigate", () => {
    craig.fortigate_vnf.create({
      name: "fortigate",
      primary_subnet: "vsi-zone-1",
      secondary_subnet: "vsi-zone-2",
      security_groups: ["management-vpe-sg"],
      vpc: "management",
      resource_group: "management-rg",
      profile: "cx2-4x8",
      ssh_keys: ["ssh-key"],
      zone: "1",
    });
    craig.fortigate_vnf.save(
      {
        name: "fortigate2",
        primary_subnet: "vsi-zone-1",
        secondary_subnet: "vsi-zone-2",
        security_groups: ["management-vpe-sg"],
        vpc: "management",
        resource_group: "management-rg",
        profile: "cx2-4x8",
        ssh_keys: ["ssh-key"],
        zone: "1",
      },
      {
        craig: craig,
        data: {
          name: "fortigate",
        },
      },
    );
    assert.deepEqual(
      craig.store.json.fortigate_vnf,
      [
        {
          name: "fortigate2",
          primary_subnet: "vsi-zone-1",
          secondary_subnet: "vsi-zone-2",
          security_groups: ["management-vpe-sg"],
          vpc: "management",
          resource_group: "management-rg",
          profile: "cx2-4x8",
          ssh_keys: ["ssh-key"],
          zone: "1",
        },
      ],
      "it should have correct data",
    );
  });
  it("should delete a fortigate", () => {
    craig.fortigate_vnf.create({
      name: "fortigate",
      primary_subnet: "vsi-zone-1",
      secondary_subnet: "vsi-zone-2",
      security_groups: ["management-vpe-sg"],
      vpc: "management",
      resource_group: "management-rg",
      profile: "cx2-4x8",
      ssh_keys: ["ssh-key"],
      zone: "1",
    });
    craig.fortigate_vnf.delete(
      {
        name: "fortigate2",
        primary_subnet: "vsi-zone-1",
        secondary_subnet: "vsi-zone-2",
        security_groups: ["management-vpe-sg"],
        vpc: "management",
        resource_group: "management-rg",
        profile: "cx2-4x8",
        ssh_keys: ["ssh-key"],
        zone: "1",
      },
      {
        craig: craig,
        data: {
          name: "fortigate",
        },
      },
    );
    assert.deepEqual(
      craig.store.json.fortigate_vnf,
      [],
      "it should have correct data",
    );
  });
  describe("schema", () => {
    it("should reset values for state on vpc change", () => {
      let data = {
        vpc: "frog",
      };
      let response = craig.fortigate_vnf.vpc.onInputChange(data);
      assert.deepEqual(response, "frog", "it should return data");
      assert.deepEqual(
        data,
        {
          security_groups: [],
          primary_subnet: null,
          secondary_subnet: null,
          zone: null,
          vpc: "frog",
        },
        "it should set other values",
      );
    });
    it("should return subnet groups", () => {
      assert.deepEqual(
        craig.fortigate_vnf.primary_subnet.groups({}),
        [],
        "it should return empty array when no vpc",
      );
      assert.deepEqual(
        craig.fortigate_vnf.primary_subnet.groups(
          { vpc: "management" },
          { craig: craig },
        ),
        [
          "vsi-zone-1",
          "vpn-zone-1",
          "vsi-zone-2",
          "vsi-zone-3",
          "vpe-zone-1",
          "vpe-zone-2",
          "vpe-zone-3",
        ],
        "it should return subnets when no zone",
      );
      assert.deepEqual(
        craig.fortigate_vnf.primary_subnet.groups(
          { vpc: "management", zone: "1" },
          { craig: craig },
        ),
        ["vsi-zone-1", "vpn-zone-1", "vpe-zone-1"],
        "it should return subnets when zone",
      );
    });
    it("should set zone on subnet state change", () => {
      let data = {
        vpc: "management",
        primary_subnet: "",
      };
      craig.fortigate_vnf.primary_subnet.onStateChange(
        data,
        { craig: craig },
        "vsi-zone-1",
      );
      assert.deepEqual(
        data,
        {
          vpc: "management",
          primary_subnet: "vsi-zone-1",
          zone: 1,
        },
        "it should set data",
      );
    });
    it("should set not zone on subnet state change when zone", () => {
      let data = {
        vpc: "management",
        primary_subnet: "",
        zone: 1,
      };
      craig.fortigate_vnf.primary_subnet.onStateChange(
        data,
        { craig: craig },
        "vsi-zone-1",
      );
      assert.deepEqual(
        data,
        {
          vpc: "management",
          primary_subnet: "vsi-zone-1",
          zone: 1,
        },
        "it should set data",
      );
    });
    it("should return api endpoint for profile with region", () => {
      assert.deepEqual(
        craig.fortigate_vnf.profile.apiEndpoint({}, { craig: craig }),
        "/api/vsi/us-south/instanceProfiles",
        "it should return api endpoint",
      );
    });
  });
});
