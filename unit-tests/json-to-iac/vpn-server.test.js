const { assert } = require("chai");
const slzNetwork = require("../data-files/slz-network.json");
const {
  ibmIsVpnServer,
  ibmIsVpnServerRoute,
  vpnServerTf,
} = require("../../client/src/lib/json-to-iac/vpn-server");

describe("vpn server", () => {
  describe("ibmIsVpnServer", () => {
    it("should return correct json object for vpn server using certificate", () => {
      let actualData = ibmIsVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = {
        name: "management_vpn_server_abc",
        data: {
          certificate_crn: "xyz",
          client_authentication: [
            {
              method: "certificate",
              client_ca_crn: "hij",
            },
          ],
          client_dns_server_ips: ["optional"],
          client_idle_timeout: 2000,
          client_ip_pool: "xyz",
          enable_split_tunneling: true,
          name: "slz-management-abc-server",
          port: 255,
          protocol: "udp",
          resource_group: "${ibm_resource_group.slz_management_rg.id}",
          subnets: ["${module.management_vpc.vsi_zone_1_id}"],
          security_groups: ["${module.management_vpc.management_vpe_sg_id}"],
        },
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct json object for vpn server using username", () => {
      let actualData = ibmIsVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "username",
          identity_provider: "iam",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = {
        name: "management_vpn_server_abc",
        data: {
          certificate_crn: "xyz",
          client_authentication: [
            {
              method: "username",
              identity_provider: "iam",
            },
          ],
          client_dns_server_ips: ["optional"],
          client_idle_timeout: 2000,
          client_ip_pool: "xyz",
          enable_split_tunneling: true,
          name: "slz-management-abc-server",
          port: 255,
          protocol: "udp",
          resource_group: "${ibm_resource_group.slz_management_rg.id}",
          subnets: ["${module.management_vpc.vsi_zone_1_id}"],
          security_groups: ["${module.management_vpc.management_vpe_sg_id}"],
        },
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct json object for vpn server using username with no optional fields", () => {
      let actualData = ibmIsVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "username",
          identity_provider: "iam",
          client_ip_pool: "xyz",
          client_dns_server_ips: "",
          client_idle_timeout: "",
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = {
        name: "management_vpn_server_abc",
        data: {
          certificate_crn: "xyz",
          client_authentication: [
            {
              method: "username",
              identity_provider: "iam",
            },
          ],
          client_dns_server_ips: null,
          client_idle_timeout: null,
          client_ip_pool: "xyz",
          enable_split_tunneling: true,
          name: "slz-management-abc-server",
          port: 255,
          protocol: "udp",
          resource_group: "${ibm_resource_group.slz_management_rg.id}",
          subnets: ["${module.management_vpc.vsi_zone_1_id}"],
          security_groups: ["${module.management_vpc.management_vpe_sg_id}"],
        },
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
  describe("ibmIsVpnServerRoute", () => {
    it("should return correct json object for vpn server route", () => {
      let actualData = ibmIsVpnServerRoute(
        {
          name: "abc",
          vpc: "management",
          routes: [
            {
              name: "qwe",
              action: "translate",
              destination: "172.16.0.0/16",
            },
          ],
        },
        {
          name: "qwe",
          action: "translate",
          destination: "172.16.0.0/16",
        },
        slzNetwork
      );
      let expectedData = {
        name: "management_vpn_server_route_qwe",
        data: {
          name: "slz-management-qwe-route",
          action: "translate",
          destination: "172.16.0.0/16",
          vpn_server: "${ibm_is_vpn_server.management_vpn_server_abc.id}",
        },
      };
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
  describe("vpnServerTf", () => {
    it("should return correct data when no servers", () => {
      assert.deepEqual(
        vpnServerTf({ vpn_servers: [] }),
        "",
        "it should return empty string"
      );
    });
  });
});
