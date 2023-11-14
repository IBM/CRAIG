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

describe("load_balancers", () => {
  describe("load_balancers.init", () => {
    it("should initialize with default load balancers", () => {
      let state = new newState();
      assert.deepEqual(
        state.store.json.load_balancers,
        [],
        "it should return data"
      );
    });
  });
  describe("load_balancers.onStoreUpdate", () => {
    let state;
    beforeEach(() => {
      state = newState();
      state.store.json.load_balancers = [
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe"],
          resource_group: "management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
      ];
    });
    it("should remove a vpc and subnets after deletion", () => {
      let expectedData = {
        name: "lb-1",
        vpc: null,
        type: "public",
        subnets: [],
        vsi_per_subnet: 2,
        security_groups: [],
        resource_group: "management-rg",
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: null,
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: ["management-server"],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      };
      state.store.json.vpcs.shift();
      state.store.json.load_balancers[0].proxy_protocol = "";
      state.update();
      assert.deepEqual(
        state.store.json.load_balancers[0],
        expectedData,
        "it should return data"
      );
    });
    it("should remove a unfound subnets after deletion", () => {
      let expectedData = {
        name: "lb-1",
        vpc: "management",
        type: "public",
        subnets: ["vsi-zone-3"],
        vsi_per_subnet: 2,
        security_groups: ["management-vpe"],
        resource_group: "management-rg",
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: "v1",
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: ["management-server"],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      };
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vsi-zone-1",
          },
        }
      );
      state.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vsi-zone-2",
          },
        }
      );
      state.update();
      assert.deepEqual(
        state.store.json.load_balancers[0],
        expectedData,
        "it should return data"
      );
    });
    it("should remove a unfound security and resource groups after deletion", () => {
      let expectedData = {
        name: "lb-1",
        vpc: "management",
        type: "public",
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vsi_per_subnet: 2,
        security_groups: [],
        resource_group: null,
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: "v1",
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: ["management-server"],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      };
      state.resource_groups.delete({}, { data: { name: "management-rg" } });
      state.security_groups.delete({}, { data: { name: "management-vpe" } });
      state.update();
      assert.deepEqual(
        state.store.json.load_balancers[0],
        expectedData,
        "it should return data"
      );
    });
    it("should remove a unfound target vsi and subnets after deletion", () => {
      let expectedData = {
        name: "lb-1",
        vpc: "management",
        type: "public",
        subnets: [],
        vsi_per_subnet: 2,
        security_groups: ["management-vpe"],
        resource_group: "management-rg",
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: "v1",
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: [],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      };
      state.vsi.delete(
        {},
        {
          data: {
            name: "management-server",
          },
        }
      );
      state.update();
      assert.deepEqual(
        state.store.json.load_balancers[0],
        expectedData,
        "it should return data"
      );
    });
  });
  describe("load_balancers.delete", () => {
    let state;
    beforeEach(() => {
      state = newState();
      state.store.json.load_balancers = [
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe"],
          resource_group: "management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
      ];
    });
    it("should delete a load_balancer", () => {
      state.load_balancers.delete({}, { data: { name: "lb-1" } });
      assert.deepEqual(state.store.json.load_balancers, [], "it should delete");
    });
  });
  describe("load_balancers.save", () => {
    let state;
    beforeEach(() => {
      state = newState();
      state.store.json.load_balancers = [
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe"],
          resource_group: "management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
      ];
    });
    it("should update a load balancer", () => {
      let expectedData = [
        {
          name: "todd",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe"],
          resource_group: "management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
      ];
      state.load_balancers.save(
        {
          name: "todd",
        },
        {
          data: {
            name: "lb-1",
          },
        }
      );
      assert.deepEqual(
        state.store.json.load_balancers,
        expectedData,
        "it should return data"
      );
    });
  });
  describe("load_balancers.create", () => {
    it("should create a load balancer", () => {
      let state = newState();
      let expectedData = {
        name: "lb-1",
        vpc: "management",
        type: "public",
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vsi_per_subnet: 2,
        security_groups: ["management-vpe"],
        resource_group: "management-rg",
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: "v1",
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: ["management-server"],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      };
      state.load_balancers.create({
        name: "lb-1",
        vpc: "management",
        type: "public",
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vsi_per_subnet: 2,
        security_groups: ["management-vpe"],
        resource_group: "management-rg",
        algorithm: "round_robin",
        protocol: "tcp",
        health_delay: 60,
        health_retries: 5,
        health_timeout: 30,
        health_type: "https",
        proxy_protocol: "v1",
        session_persistence_type: "app_cookie",
        session_persistence_app_cookie_name: "cookie1",
        port: 80,
        target_vsi: ["management-server"],
        listener_port: 443,
        listener_protocol: "https",
        connection_limit: 2,
      });
      assert.deepEqual(
        state.store.json.load_balancers[0],
        expectedData,
        "it should return data"
      );
    });
  });
});
