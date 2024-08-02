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
  let craig;
  beforeEach(() => {
    craig = newState();
  });
  describe("vpn_servers.init", () => {
    it("should initialize vpn_servers", () => {
      assert.deepEqual(craig.store.json.vpn_servers, []);
    });
  });
  describe("vpn_servers on store update", () => {
    it("should set fields to null or [] if vpc is invalid", () => {
      craig.vpn_servers.create({
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
        additional_prefixes: [""],
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
        additional_prefixes: [],
      };
      assert.deepEqual(craig.store.json.vpn_servers[0], expectedData);
    });
    it("should delete unfound items", () => {
      craig.vpn_servers.create({
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
      assert.deepEqual(
        craig.store.json.vpn_servers[0].subnets,
        ["vsi-zone-1"],
        "it should delete unfound subnet"
      );
      assert.deepEqual(
        craig.store.json.vpn_servers[0].additional_prefixes,
        [],
        "it should set additional prefixes"
      );
    });
  });
  describe("vpn_servers crud operations", () => {
    it("should create a vpn server", () => {
      craig.vpn_servers.create({
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
      assert.deepEqual(
        craig.store.json.vpn_servers[0],
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
          additional_prefixes: [],
        },
        "it should create server"
      );
    });
    it("should save a vpn server", () => {
      craig.store.json._options.dynamic_subnets = false;
      craig.vpn_servers.create({
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
      craig.vpn_servers.save(
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
        additional_prefixes: [],
      };
      assert.deepEqual(craig.store.json.vpn_servers[0], expectedData);
    });
    it("should delete vpn server", () => {
      craig.vpn_servers.create({
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
      craig.vpn_servers.delete(
        {},
        {
          data: {
            name: "vpn-server",
          },
        }
      );
      assert.deepEqual(craig.store.json.vpn_servers, []);
    });
    describe("vpn server routes crud", () => {
      beforeEach(() => {
        craig.vpn_servers.create({
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
        craig.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: craig.store.json.vpn_servers[0].routes,
          }
        );
        assert.deepEqual(craig.store.json.vpn_servers[0].routes[0], {
          name: "route",
          action: "deliver",
          destination: "2.2.2.2",
        });
      });
      it("should update a route", () => {
        craig.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: craig.store.json.vpn_servers[0].routes,
          }
        );
        craig.vpn_servers.routes.save(
          { name: "route-new", action: "drop", destination: "" },
          {
            arrayParentName: "vpn-server",
            data: { name: "route" },
          }
        );
        assert.deepEqual(craig.store.json.vpn_servers[0].routes[0], {
          name: "route-new",
          action: "drop",
          destination: "",
        });
      });
      it("should delete a route", () => {
        craig.vpn_servers.routes.create(
          { name: "route", action: "deliver", destination: "2.2.2.2" },
          {
            innerFormProps: { arrayParentName: "vpn-server" },
            arrayData: craig.store.json.vpn_servers[0].routes,
          }
        );
        craig.vpn_servers.routes.delete(
          {},
          { arrayParentName: "vpn-server", data: { name: "route" } }
        );
        assert.deepEqual(craig.store.json.vpn_servers[0].routes, []);
      });
    });
  });
  describe("vpn_servers schema", () => {
    it("should return protocol on render", () => {
      assert.deepEqual(
        craig.vpn_servers.protocol.onRender({ protocol: "tcp" }),
        "TCP",
        "it should render correctly"
      );
    });
    it("should return protocol on input change", () => {
      assert.deepEqual(
        craig.vpn_servers.protocol.onInputChange({ protocol: "TCP" }),
        "tcp",
        "it should render correctly"
      );
    });
    it("should return protocol null on render", () => {
      assert.deepEqual(
        craig.vpn_servers.protocol.onRender({}),
        "",
        "it should render correctly"
      );
    });
    describe("vpnServersWorkspaceHelperText", () => {
      it("should return correct helper text", () => {
        assert.deepEqual(
          craig.vpn_servers.name.helperText(
            { name: "frog" },
            {
              craig: {
                store: {
                  json: {
                    _options: {
                      prefix: "toad",
                    },
                  },
                },
              },
            }
          ),
          "toad-vpn-server-frog",
          "it should return correct helper text"
        );
      });
    });
    it("should set subnets and sgs on vpc change", () => {
      let data = {
        vpc: "frog",
      };
      assert.deepEqual(
        craig.vpn_servers.vpc.onInputChange(data),
        "frog",
        "it should return vpc"
      );
      assert.deepEqual(
        data,
        {
          vpc: "frog",
          security_groups: [],
          subnets: [],
        },
        "it should set vpc values"
      );
    });
    it("should render method correctly", () => {
      assert.deepEqual(
        craig.vpn_servers.method.onRender({ method: "INSECURE" }),
        "INSECURE - Developer Certificate",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onRender({ method: "both" }),
        "Username and Certificate",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onRender({ method: "byo" }),
        "Bring Your Own Certificate",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onRender({ method: "username" }),
        "Username",
        "it should return correct method"
      );
    });
    it("should handle method input change correctly", () => {
      assert.deepEqual(
        craig.vpn_servers.method.onInputChange({
          method: "INSECURE - Developer Certificate",
        }),
        "INSECURE",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onInputChange({
          method: "Username and Certificate",
        }),
        "both",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onInputChange({
          method: "Bring Your Own Certificate",
        }),
        "byo",
        "it should return correct method"
      );
      assert.deepEqual(
        craig.vpn_servers.method.onInputChange({ method: "Username" }),
        "username",
        "it should return correct method"
      );
    });
    it("should not have invalid secrets manager when method is certificate", () => {
      assert.isFalse(
        craig.vpn_servers.secrets_manager.invalid({ method: "certificate" }),
        "it should be valid"
      );
    });
    it("should have invalid secrets manager when method is byo and none selected", () => {
      assert.isTrue(
        craig.vpn_servers.secrets_manager.invalid({ method: "byo" }),
        "it should be invalid"
      );
    });
    it("should hide secrets manager when no method", () => {
      assert.isTrue(
        craig.vpn_servers.secrets_manager.hideWhen({ method: "" }),
        "it should be hidden"
      );
    });
    it("should hide secrets manager when method and not byo", () => {
      assert.isTrue(
        craig.vpn_servers.secrets_manager.hideWhen({ method: "certificate" }),
        "it should be hidden"
      );
    });
    it("should return addition prefix as string on render", () => {
      assert.deepEqual(
        craig.vpn_servers.additional_prefixes.onRender({
          additional_prefixes: [],
        }),
        "",
        "it should return string"
      );
    });
    it("should only check match if dns ips undefined", () => {
      assert.isFalse(
        craig.vpn_servers.client_dns_server_ips.invalid({}),
        "it should be false"
      );
    });
    it("should return array on input change", () => {
      assert.deepEqual(
        craig.vpn_servers.additional_prefixes.onInputChange({
          additional_prefixes: "",
        }),
        [""],
        "it should return string"
      );
      assert.deepEqual(
        craig.vpn_servers.additional_prefixes.onInputChange({
          additional_prefixes: "1.2.3.4/5,",
        }),
        ["1.2.3.4/5", ""],
        "it should return string"
      );
    });
    it("should get groups for secrets manager", () => {
      assert.deepEqual(
        craig.vpn_servers.secrets_manager.groups({}, { craig: craig }),
        [],
        "it should return groups"
      );
    });
  });
});
