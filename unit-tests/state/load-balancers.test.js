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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("load_balancers.init", () => {
    it("should initialize with default load balancers", () => {
      assert.deepEqual(
        craig.store.json.load_balancers,
        [],
        "it should return data",
      );
    });
  });
  describe("load_balancers.onStoreUpdate", () => {
    beforeEach(() => {
      craig.store.json.load_balancers = [
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
      craig.store.json.vpcs.shift();
      craig.store.json.load_balancers[0].proxy_protocol = "";
      craig.update();
      assert.deepEqual(
        craig.store.json.load_balancers[0],
        expectedData,
        "it should return data",
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
      craig.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vsi-zone-1",
          },
        },
      );
      craig.vpcs.subnets.delete(
        {},
        {
          name: "management",
          data: {
            name: "vsi-zone-2",
          },
        },
      );
      craig.update();
      assert.deepEqual(
        craig.store.json.load_balancers[0],
        expectedData,
        "it should return data",
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
      craig.resource_groups.delete({}, { data: { name: "management-rg" } });
      craig.security_groups.delete({}, { data: { name: "management-vpe" } });
      craig.update();
      assert.deepEqual(
        craig.store.json.load_balancers[0],
        expectedData,
        "it should return data",
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
      craig.vsi.delete(
        {},
        {
          data: {
            name: "management-server",
          },
        },
      );
      craig.update();
      assert.deepEqual(
        craig.store.json.load_balancers[0],
        expectedData,
        "it should return data",
      );
    });
  });
  describe("load_balancers.delete", () => {
    it("should delete a load_balancer", () => {
      craig.store.json.load_balancers = [
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
      craig.load_balancers.delete({}, { data: { name: "lb-1" } });
      assert.deepEqual(craig.store.json.load_balancers, [], "it should delete");
    });
  });
  describe("load_balancers.save", () => {
    beforeEach(() => {
      craig.store.json.load_balancers = [
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
      craig.load_balancers.save(
        {
          name: "todd",
        },
        {
          data: {
            name: "lb-1",
          },
        },
      );
      assert.deepEqual(
        craig.store.json.load_balancers,
        expectedData,
        "it should return data",
      );
    });
  });
  describe("load_balancers.create", () => {
    it("should create a load balancer", () => {
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
      craig.load_balancers.create({
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
        craig.store.json.load_balancers[0],
        expectedData,
        "it should return data",
      );
    });
  });
  describe("load balancer schema", () => {
    it("should have invalid load balancer port when not in range", () => {
      assert.isTrue(
        craig.load_balancers.port.invalid({
          port: "",
        }),
        "it should be invalid",
      );
      assert.isTrue(
        craig.load_balancers.port.invalid({
          port: "1.2",
        }),
        "it should be invalid",
      );
      assert.isTrue(
        craig.load_balancers.port.invalid({
          port: "-1",
        }),
        "it should be invalid",
      );
    });
    it("should hide persistance cookie name when session_persistence_type is not app_cookie", () => {
      assert.isTrue(
        craig.load_balancers.session_persistence_app_cookie_name.hideWhen({}),
        "it should be hidden",
      );
    });
    it("should not hide persistance cookie name when session_persistence_type is app_cookie", () => {
      assert.isFalse(
        craig.load_balancers.session_persistence_app_cookie_name.hideWhen({
          session_persistence_type: "app_cookie",
        }),
        "it should be hidden",
      );
    });
    it("should correctly handle session persistance type on input change", () => {
      assert.deepEqual(
        craig.load_balancers.session_persistence_type.onInputChange({
          session_persistence_type: "HTTP Cookie",
        }),
        "http_cookie",
        "it should change on input change",
      );
    });
    it("should return correct render for session_persistence_type", () => {
      assert.deepEqual(
        craig.load_balancers.session_persistence_type.onRender({
          session_persistence_type: "source_ip",
        }),
        "Source IP",
        "it should return correct text",
      );
      assert.deepEqual(
        craig.load_balancers.session_persistence_type.onRender({
          session_persistence_type: "http_cookie",
        }),
        "HTTP Cookie",
        "it should return correct text",
      );
      assert.deepEqual(
        craig.load_balancers.session_persistence_type.onRender({
          session_persistence_type: "",
        }),
        "",
        "it should return correct text",
      );
    });
    it("should not have session_persistence_type as invalid", () => {
      assert.isFalse(
        craig.load_balancers.session_persistence_type.invalid(),
        "it should be false",
      );
    });
    it("should render proxy_protocol correctly", () => {
      assert.deepEqual(
        craig.load_balancers.proxy_protocol.onInputChange({
          proxy_protocol: "V2",
        }),
        "v2",
        "it should return correct data",
      );
      assert.deepEqual(
        craig.load_balancers.proxy_protocol.onInputChange({}),
        "",
        "it should return correct data",
      );
      assert.deepEqual(
        craig.load_balancers.proxy_protocol.onRender({
          proxy_protocol: "disabled",
        }),
        "Disabled",
        "it should render correctly",
      );
      assert.deepEqual(
        craig.load_balancers.proxy_protocol.onRender({
          proxy_protocol: "disabled",
        }),
        "Disabled",
        "it should render correctly",
      );
      assert.deepEqual(
        craig.load_balancers.proxy_protocol.onRender({ proxy_protocol: "v1" }),
        "V1",
        "it should render correctly",
      );
    });
    it("should return correct invalid text for health delay", () => {
      assert.deepEqual(
        craig.load_balancers.health_delay.invalidText({
          health_delay: "5",
          health_timeout: "5",
        }),
        "Must be greater than Health Timeout value",
        "it should return correct invalid text",
      );
      assert.deepEqual(
        craig.load_balancers.health_delay.invalidText({
          health_delay: "5.6",
          health_timeout: "5",
        }),
        "Must be a whole number between 5 and 3000",
        "it should return correct invalid text",
      );
    });
    it("should render listener protocol", () => {
      assert.deepEqual(
        craig.load_balancers.listener_protocol.onRender({
          listener_protocol: "https",
        }),
        "HTTPS",
        "it should return correct value",
      );
      assert.deepEqual(
        craig.load_balancers.listener_protocol.onRender({}),
        "",
        "it should return correct value",
      );
    });
    it("should handle algoritm on input change", () => {
      assert.deepEqual(
        craig.load_balancers.algorithm.onInputChange({
          algorithm: "Round Robin",
        }),
        "round_robin",
        "it should return correct value",
      );
    });
    it("should have invalid target_vsi if none selected", () => {
      assert.isTrue(
        craig.load_balancers.target_vsi.invalid({
          target_vsi: [],
        }),
        "it should be invalid",
      );
    });
    it("should return correct groups for target vsi", () => {
      assert.deepEqual(
        craig.load_balancers.target_vsi.groups({}),
        [],
        "it should be empty",
      );
      assert.deepEqual(
        craig.load_balancers.target_vsi.groups(
          { vpc: "workload" },
          { craig: craig },
        ),
        [],
        "it should be empty",
      );
      assert.deepEqual(
        craig.load_balancers.target_vsi.groups(
          { vpc: "management" },
          { craig: craig },
        ),
        ["management-server"],
        "it should have server",
      );
    });
    it("should return type on render", () => {
      assert.deepEqual(
        craig.load_balancers.type.onRender({ type: "" }),
        "",
        "it should return correct data",
      );
      assert.deepEqual(
        craig.load_balancers.type.onRender({ type: "private" }),
        "Private (NLB)",
        "it should return correct data",
      );
      assert.deepEqual(
        craig.load_balancers.type.onRender({ type: "public" }),
        "Public (ALB)",
        "it should return correct data",
      );
    });
    it("should return type on input change", () => {
      assert.deepEqual(
        craig.load_balancers.type.onInputChange({ type: "Public (ALB)" }),
        "public",
        "it should return correct data",
      );
    });
    it("should set subnets and security groups on vpc change", () => {
      let data = {};
      (craig.load_balancers.vpc.onStateChange(data, {}, "vpc"),
        assert.deepEqual(
          data,
          {
            security_groups: [],
            subnets: [],
            vpc: "vpc",
          },
          "it should set values",
        ));
    });
    it("should add subnets for vsi deployment", () => {
      let actualData = {};
      craig.load_balancers.target_vsi.onStateChange(
        actualData,
        { craig: craig },
        ["management-server"],
      );
      assert.deepEqual(
        actualData,
        {
          target_vsi: ["management-server"],
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        },
        "it should return correct data",
      );
    });
    it("should return correct invalid values for connection_limit", () => {
      assert.isFalse(
        craig.load_balancers.connection_limit.invalid({}),
        "it should be valid when no connection limit",
      );
      assert.isTrue(
        craig.load_balancers.connection_limit.invalid({
          connection_limit: "-12",
        }),
        "it should be invalid when not in range",
      );
    });
    it("should return correct invalid values for health_delay", () => {
      assert.isTrue(
        craig.load_balancers.health_delay.invalid({}),
        "it should be invalid when unfound",
      );
      assert.isTrue(
        craig.load_balancers.health_delay.invalid({
          health_delay: "5.5",
        }),
        "it should be invalid when not whole number",
      );
      assert.isTrue(
        craig.load_balancers.health_delay.invalid({
          health_delay: "-12",
        }),
        "it should be invalid when not in range",
      );
      assert.isTrue(
        craig.load_balancers.health_delay.invalid({
          health_delay: "12",
          health_timeout: "12",
        }),
        "it should be invalid when in range and less or equal to than health_timeout",
      );
    });
  });
});
