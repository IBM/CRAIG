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

describe("vpn_servers", () => {
  describe("vpn_servers.init", () => {
    it("should initialize vpn_servers", () => {
      let state = new newState();
      assert.deepEqual(state.store.json.vpn_servers, []);
    });
  });
  describe("vpn_servers on store update", () => {
    it("should set fields to null or [] if vpc is invalid", () => {
      let state = new newState();
      state.vpn_servers.create({
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1"],
        vpc: "blah",
      });
      let expectedData = {
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: [],
        subnets: [],
        vpc: null,
        routes: [],
      };
      assert.deepEqual(state.store.json.vpn_servers[0], expectedData);
    });
    it("should delete unfound items", () => {
      let state = new newState();
      state.vpn_servers.create({
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1", "extra-subnet"],
        vpc: "management",
        routes: [],
      });
      let expectedData = {
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
      };
      assert.deepEqual(state.store.json.vpn_servers[0], expectedData);
    });
  });
  describe("vpn_servers crud operations", () => {
    let state;
    beforeEach(() => {
      state = new newState();
    });
    it("should create a vpn server", () => {
      state.vpn_servers.create({
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
      });
      let expectedData = [
        {
          name: "vpn-server",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "xyz",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "management-rg",
          security_groups: ["management-vpe"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
      ];
      assert.deepEqual(state.store.json.vpn_servers, expectedData);
    });
    it("should save a vpn server", () => {
      state.store.json._options.dynamic_subnets = false;
      state.vpn_servers.create({
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
      });
      state.vpn_servers.save(
        {
          name: "new-vpn-server",
          certificate_crn: "xyz",
          method: "username",
          client_ca_crn: "xyz",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2001,
          enable_split_tunneling: true,
          port: 256,
          protocol: "udp",
          resource_group: "management-rg",
          security_groups: ["management-vpe", "management-vsi"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        {
          data: {
            name: "vpn-server",
          },
        }
      );
      let expectedData = {
        name: "new-vpn-server",
        certificate_crn: "xyz",
        method: "username",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2001,
        enable_split_tunneling: true,
        port: 256,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe", "management-vsi"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
      };
      assert.deepEqual(state.store.json.vpn_servers[0], expectedData);
    });
    it("should delete vpn server", () => {
      state.vpn_servers.create({
        name: "vpn-server",
        certificate_crn: "xyz",
        method: "certificate",
        client_ca_crn: "xyz",
        client_ip_pool: "xyz",
        client_dns_server_ips: "optional",
        client_idle_timeout: 2000,
        enable_split_tunneling: true,
        port: 255,
        protocol: "udp",
        resource_group: "management-rg",
        security_groups: ["management-vpe"],
        subnets: ["vsi-zone-1"],
        vpc: "management",
        routes: [],
      });
      state.vpn_servers.delete(
        {},
        {
          data: {
            name: "vpn-server",
          },
        }
      );
      assert.deepEqual(state.store.json.vpn_servers, []);
    });
    describe("vpn server routes crud", () => {
      let state;
      beforeEach(() => {
        state = new newState();
        state.vpn_servers.create({
          name: "vpn-server",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "xyz",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "management-rg",
          security_groups: ["management-vpe"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        });
      });
      it("should create a route", () => {
        state.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: state.store.json.vpn_servers[0].routes,
          }
        );
        assert.deepEqual(state.store.json.vpn_servers[0].routes[0], {
          name: "route",
          action: "deliver",
          destination: "2.2.2.2",
        });
      });
      it("should update a route", () => {
        state.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: state.store.json.vpn_servers[0].routes,
          }
        );
        state.vpn_servers.routes.save(
          { name: "route-new", action: "drop", destination: "" },
          {
            arrayParentName: "vpn-server",
            data: { name: "route" },
          }
        );
        assert.deepEqual(state.store.json.vpn_servers[0].routes[0], {
          name: "route-new",
          action: "drop",
          destination: "",
        });
      });
      it("should delete a route", () => {
        state.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: state.store.json.vpn_servers[0].routes,
          }
        );
        state.vpn_servers.routes.delete(
          {},
          { arrayParentName: "vpn-server", data: { name: "route" } }
        );
        assert.deepEqual(state.store.json.vpn_servers[0].routes, []);
      });
    });
  });
});
