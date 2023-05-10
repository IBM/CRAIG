const { assert } = require("chai");
let slzNetwork = { ...require("../data-files/slz-network.json") };
const slzNetworkFiles = require("../data-files/config-to-files/modules-slz-network-files.json");
const f5Network = require("../data-files/f5-nw.json");
const f5NetworkFiles = require("../data-files/f5-nw-files.json");
const {
  configToFilesJson,
} = require("../../client/src/lib/json-to-iac/config-to-files-json");
const { transpose } = require("lazy-z");

describe("configToFilesJson", () => {
  describe("files", () => {
    it("should return correct main.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["main.tf"],
        slzNetworkFiles["main.tf"],
        "it should return correct data"
      );
    });
    it("should return correct flow_logs.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["flow_logs.tf"],
        slzNetworkFiles["flow_logs.tf"],
        "it should return correct data"
      );
    });
    it("should return correct clusters.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["clusters.tf"],
        slzNetworkFiles["clusters.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        slzNetworkFiles["transit_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct transit_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.transit_gateways = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["transit_gateways.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        slzNetworkFiles["vpn_gateways.tf"],
        "it should create file"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.vpn_gateways = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["vpn_gateways.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct vpn_gateways.tf", () => {
      let nw = { ...slzNetwork };
      nw.vsi = [];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["virtual_servers.tf"],
        null,
        "it should be null"
      );
    });
    it("should return correct virtual_private_endpoints.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["virtual_private_endpoints.tf"],
        slzNetworkFiles["virtual_private_endpoints.tf"],
        "it should create file"
      );
    });
    it("should return correct versions.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["versions.tf"],
        slzNetworkFiles["versions.tf"],
        "it should create file"
      );
    });
    it("should return correct secrets_manager.tf", () => {
      let secretsManagerNw = { ...slzNetwork };
      secretsManagerNw.secrets_manager = [
        {
          name: "secrets-manager",
          resource_group: "slz-service-rg",
          kms: "slz-kms",
          encryption_key: "slz-slz-key",
        },
      ];
      let actualData = configToFilesJson(secretsManagerNw);
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        '##############################################################################\n# Key Management Authorizations\n##############################################################################\n\nresource "ibm_iam_authorization_policy" "secrets_manager_to_slz_kms_kms_policy" {\n  source_service_name         = "secrets-manager"\n  description                 = "Allow Secets Manager instance to read from KMS instance"\n  target_service_name         = "kms"\n  target_resource_instance_id = ibm_resource_instance.slz_kms.guid\n  roles = [\n    "Reader"\n  ]\n}\n\n##############################################################################\n\n##############################################################################\n# Secrets Manager Instances\n##############################################################################\n\nresource "ibm_resource_instance" "secrets_manager_secrets_manager" {\n  name              = "${var.prefix}-secrets-manager"\n  location          = var.region\n  plan              = "standard"\n  service           = "secrets-manager"\n  resource_group_id = ibm_resource_group.slz_service_rg.id\n  parameters = {\n    kms_key = ibm_kms_key.slz_kms_slz_slz_key_key.crn\n  }\n  timeouts {\n    create = "1h"\n    delete = "1h"\n  }\n  tags = [\n    "slz",\n    "landing-zone"\n  ]\n  depends_on = [\n    ibm_iam_authorization_policy.secrets_manager_to_slz_kms_kms_policy\n  ]\n}\n\n##############################################################################\n',
        "it should create file"
      );
    });
    it("should return correct secrets_manager.tf when no instances present", () => {
      let noSecretsManagerNw = { ...slzNetwork };
      noSecretsManagerNw.secrets_manager = [];
      let actualData = configToFilesJson(noSecretsManagerNw);
      assert.deepEqual(
        actualData["secrets_manager.tf"],
        null,
        "it should create file"
      );
    });
    it("should return correct variables.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"],
        "it should create file"
      );
    });
    it("should return correct object_storage.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["object_storage.tf"],
        slzNetworkFiles["object_storage.tf"],
        "it should create file"
      );
    });
    it("should return correct key_management.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["key_management.tf"],
        slzNetworkFiles["key_management.tf"],
        "it should create file"
      );
    });
    it("should return correct resource_groups.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["resource_groups.tf"],
        slzNetworkFiles["resource_groups.tf"],
        "it should create file"
      );
    });
    it("should return correct ssh_keys.tf", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["ssh_keys.tf"],
        slzNetworkFiles["ssh_keys.tf"],
        "it should create file"
      );
    });
    it("should return correct variables.tf when no ssh keys are present", () => {
      let noSshNw = { ...slzNetwork };
      noSshNw.ssh_keys = [];
      let actualData = configToFilesJson(noSshNw);
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"].replace(/variable\s"slz_ssh[^#]+/, ""),
        "it should create file"
      );
    });
    it("should return correct variables.tf without ssh key variable when it's using data", () => {
      let dataSshNw = { ...slzNetwork };
      dataSshNw.ssh_keys = [
        {
          "name": "slz-ssh-key",
          "use_data": true
        }
      ];
      let actualData = configToFilesJson(dataSshNw);
      assert.deepEqual(
        actualData["variables.tf"],
        slzNetworkFiles["variables.tf"].replace(/variable\s"slz_ssh[^#]+/, ""),
        "it should create file without ssh key variable"
      );
    });
    it("should return correct craig.json", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData["craig.json"],
        slzNetworkFiles["craig.json"],
        "it should create file"
      );
    });
    it("should return correct appid.tf", () => {
      let nw = { ...slzNetwork };
      nw.appid = [
        {
          name: "test-appid",
          use_data: false,
          resource_group: "slz-service-rg",
          keys: [
            {
              appid: "test-appid",
              name: "test-key",
            },
            {
              appid: "test-appid",
              name: "test-key-2",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["appid.tf"],
        slzNetworkFiles["appid.tf"],
        "it should create file"
      );
    });
    it("should return correct scc.tf", () => {
      let nw = { ...slzNetwork };
      nw.scc = {
        enable: true,
        credential_description: "scc posture credential description",
        id: "scc_group_id",
        passphrase: "scc_group_passphrase",
        name: "scc-posture-credential",
        location: "us",
        collector_description: "scc collector",
        is_public: true,
        scope_description: "scc scope",
      };
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["scc.tf"],
        slzNetworkFiles["scc.tf"],
        "it should create file"
      );
    });
    it("should return correct event_streams.tf", () => {
      let nw = { ...slzNetwork };
      nw.event_streams = [
        {
          name: "event-streams",
          plan: "enterprise-3nodes-2tb",
          resource_group: "slz-service-rg",
          endpoints: "private",
          private_ip_allowlist: ["10.0.0.0/32", "10.0.0.1/32"],
          throughput: "150MB/s",
          storage_size: "2TB",
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["event_streams.tf"],
        slzNetworkFiles["event_streams.tf"],
        "it should create file"
      );
    });
    it("should return correct load_balancers.tf", () => {
      let nw = { ...slzNetwork };
      nw.load_balancers = [
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe-sg"],
          resource_group: "slz-management-rg",
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
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["load_balancers.tf"],
        slzNetworkFiles["load_balancers.tf"],
        "it should create file"
      );
    });
    it("should return correct dns.tf", () => {
      let nw = { ...slzNetwork };
      nw.dns = [
        {
          name: "test",
          plan: "standard-dns",
          resource_group: "service-rg",
          zones: [
            {
              name: "test.com",
              instance: "test",
              description: "test description",
              label: "test",
              permitted_networks: ["management"],
            },
          ],
          records: [
            {
              instance: "test",
              dns_zone: "test.com",
              type: "A",
              name: "testA",
              rdata: "test.com",
            },
            {
              instance: "test",
              dns_zone: "fake-zone", // pretend zone for unit test coverage
              type: "A",
              name: "testA",
              rdata: "test.com",
            },
          ],
          custom_resolvers: [
            {
              name: "dev-res",
              instance: "test",
              description: "new resolve",
              high_availability: true,
              enabled: true,
              vpc: "management",
              subnets: [
                {
                  name: "vsi-zone-1",
                  enabled: true,
                },
                {
                  name: "vsi-zone-2",
                  enabled: true,
                },
                {
                  name: "vsi-zone-3",
                  enabled: true,
                },
              ],
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["dns.tf"],
        slzNetworkFiles["dns.tf"],
        "it should create file"
      );
    })
    it("should return correct cbr.tf", () => {
      let nw = { ...slzNetwork };
      nw.cbr_zones = [
        {
          name: "foo-cbr-name",
          account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
          description: "this is a cbr zone description",
          addresses: [
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              type: "ipAddress",
              value: "169.23.56.234",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
            {
              account_id: "12ab34cd56ef78ab90cd12ef34ab56cd",
              type: "ipRange",
              value: "169.23.22.0-169.23.22.255",
              location: "us-south",
              service_instance: "fake-service-instance",
              service_name: "frog-service-name",
              service_type: "frog-service",
            },
          ],
          exclusions: [
            {
              type: "ipAddress",
              value: "169.23.22.11",
            },
            {
              type: "ipAddress",
              value: "169.23.22.10",
            },
          ],
        },
      ];
      nw.cbr_rules = [
        {
          description: "test cbr rule description",
          enforcement_mode: "enabled",
          api_type_id: "api_type_id",
          contexts: [
            {
              name: "networkZoneId",
              value:
                "559052eb8f43302824e7ae490c0281eb, bf823d4f45b64ceaa4671bee0479346e",
            },
            {
              name: "endpointType",
              value: "private",
            },
          ],
          resource_attributes: [
            {
              name: "accountId",
              value: "12ab34cd56ef78ab90cd12ef34ab56cd",
            },
            {
              name: "serviceName",
              value: "network-policy-enabled",
            },
          ],
          tags: [
            {
              name: "tag_name",
              value: "tag_value",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(nw);
      assert.deepEqual(
        actualData["cbr.tf"],
        slzNetworkFiles["cbr.tf"],
        "it should create file"
      );
    });
  });
  describe("vpc module", () => {
    it("should return correct management vpc main", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["main.tf"],
        slzNetworkFiles.management_vpc["main.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management vpc variables", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["variables.tf"],
        slzNetworkFiles.management_vpc["variables.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management vpc outputs", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["outputs.tf"],
        slzNetworkFiles.management_vpc["outputs.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management acl", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["acl_management_management.tf"],
        slzNetworkFiles.management_vpc["acl_management_management.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management sg", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["sg_management_vpe_sg.tf"],
        slzNetworkFiles.management_vpc["sg_management_vpe_sg.tf"],
        "it should return correct data"
      );
    });
    it("should return correct management rg", () => {
      let cloneNetwork = { ...slzNetwork };
      cloneNetwork.routing_tables = [
        {
          vpc: "management",
          name: "routing-table",
          route_direct_link_ingress: true,
          route_transit_gateway_ingress: true,
          route_vpc_zone_ingress: true,
          routes: [
            {
              vpc: "management",
              routing_table: "routing-table",
              name: "test-route",
              zone: 1,
              destination: "1.2.3.4/5",
              action: "delegate",
            },
          ],
        },
      ];
      let actualData = configToFilesJson(cloneNetwork);
      assert.deepEqual(
        actualData.management_vpc["rt_routing_table.tf"],
        slzNetworkFiles.management_vpc["rt_routing_table.tf"],
        "it should return correct data"
      );
    });
    it("should return correct versions", () => {
      let actualData = configToFilesJson({ ...slzNetwork });
      assert.deepEqual(
        actualData.management_vpc["versions.tf"],
        slzNetworkFiles.management_vpc["versions.tf"],
        "it should return correct data"
      );
    });
    describe("edge vpc module cases", () => {
      it("should return correct management vpc main when using public gateways", () => {
        let nw = { ...slzNetwork };
        let pgwNw = {};
        transpose(nw, pgwNw);
        pgwNw.vpcs[0].public_gateways = [
          {
            vpc: "management",
            zone: 1,
          },
          {
            vpc: "management",
            zone: 2,
          },
          {
            vpc: "management",
            zone: 3,
          },
        ];
        let actualData = configToFilesJson(pgwNw);
        assert.deepEqual(
          actualData.management_vpc["main.tf"],
          '##############################################################################\n# Management VPC\n##############################################################################\n\nresource "ibm_is_vpc" "management_vpc" {\n  name                        = "${var.prefix}-management-vpc"\n  resource_group              = var.slz_management_rg_id\n  tags                        = var.tags\n  address_prefix_management   = "manual"\n  default_network_acl_name    = null\n  default_security_group_name = null\n  default_routing_table_name  = null\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_1_prefix" {\n  name = "${var.prefix}-management-vsi-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.10.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_2_prefix" {\n  name = "${var.prefix}-management-vsi-zone-2"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.10.20.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vsi_zone_3_prefix" {\n  name = "${var.prefix}-management-vsi-zone-3"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-3"\n  cidr = "10.10.30.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_1_prefix" {\n  name = "${var.prefix}-management-vpe-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.20.10.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_2_prefix" {\n  name = "${var.prefix}-management-vpe-zone-2"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-2"\n  cidr = "10.20.20.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpe_zone_3_prefix" {\n  name = "${var.prefix}-management-vpe-zone-3"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-3"\n  cidr = "10.20.30.0/24"\n}\n\nresource "ibm_is_vpc_address_prefix" "management_vpn_zone_1_prefix" {\n  name = "${var.prefix}-management-vpn-zone-1"\n  vpc  = ibm_is_vpc.management_vpc.id\n  zone = "${var.region}-1"\n  cidr = "10.30.10.0/24"\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_1" {\n  name           = "${var.prefix}-management-gateway-zone-1"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-1"\n  tags           = var.tags\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_2" {\n  name           = "${var.prefix}-management-gateway-zone-2"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-2"\n  tags           = var.tags\n}\n\nresource "ibm_is_public_gateway" "management_gateway_zone_3" {\n  name           = "${var.prefix}-management-gateway-zone-3"\n  vpc            = ibm_is_vpc.management_vpc.id\n  resource_group = var._id\n  zone           = "${var.region}-3"\n  tags           = var.tags\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpn_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpn-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpn_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_2" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_2_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vsi_zone_3" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vsi-zone-3"\n  zone            = "${var.region}-3"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vsi_zone_3_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_1" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-1"\n  zone            = "${var.region}-1"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_1_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_2" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-2"\n  zone            = "${var.region}-2"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_2_prefix.cidr\n}\n\nresource "ibm_is_subnet" "management_vpe_zone_3" {\n  vpc             = ibm_is_vpc.management_vpc.id\n  name            = "${var.prefix}-management-vpe-zone-3"\n  zone            = "${var.region}-3"\n  resource_group  = var.slz_management_rg_id\n  tags            = var.tags\n  network_acl     = ibm_is_network_acl.management_management_acl.id\n  ipv4_cidr_block = ibm_is_vpc_address_prefix.management_vpe_zone_3_prefix.cidr\n}\n\n##############################################################################\n',
          "it should return correct data"
        );
      });
      it("should return correct management vpc variables when subnets are in more than one resource group", () => {
        let nw = { ...slzNetwork };
        let subnetNw = {};
        transpose(nw, subnetNw);
        subnetNw.vpcs[0].subnets[0].resource_group = "edge";
        let actualData = configToFilesJson({ ...subnetNw });
        assert.deepEqual(
          actualData.management_vpc["variables.tf"],
          '##############################################################################\n# Management VPC Variables\n##############################################################################\n\nvariable "tags" {\n  description = "List of tags"\n  type        = list(string)\n}\n\nvariable "region" {\n  description = "IBM Cloud Region where resources will be provisioned"\n  type        = string\n}\n\nvariable "prefix" {\n  description = "Name prefix that will be prepended to named resources"\n  type        = string\n}\n\nvariable "slz_management_rg_id" {\n  description = "ID for the resource group slz-management-rg"\n  type        = string\n}\n\nvariable "edge_id" {\n  description = "ID for the resource group edge"\n  type        = string\n}\n\n##############################################################################\n',
          "it should return correct data"
        );
      });
    });
  });
  describe("f5-nw", () => {
    let actualData = configToFilesJson(f5Network);
    it("should return correct f5_big_ip.tf", () => {
      assert.deepEqual(
        actualData["f5_big_ip.tf"],
        f5NetworkFiles["f5_big_ip.tf"],
        "it should create file"
      );
    });
    it("should return correct f5_user_data.yaml", () => {
      assert.deepEqual(
        actualData["f5_user_data.yaml"],
        f5NetworkFiles["f5_user_data.yaml"],
        "it should create file"
      );
    });
    it("should add tmos admin password variable", () => {
      let variables = `##############################################################################
# Variables
##############################################################################

variable "ibmcloud_api_key" {
  description = "The IBM Cloud platform API key needed to deploy IAM enabled resources."
  type        = string
  sensitive   = true
}

variable \"region\" {\n  description = \"IBM Cloud Region where resources will be provisioned\"\n  type        = string\n  default     = \"us-south\"\n}

variable \"prefix\" {\n  description = \"Name prefix that will be prepended to named resources\"\n  type        = string\n  default     = \"slz\"\n}

variable "slz_ssh_key_public_key" {
  description = "Public SSH Key Value for Slz SSH Key"
  type        = string
  sensitive   = true
  default     = "public-key"
}

variable "tmos_admin_password" {
  description = "F5 TMOS Admin Password"
  type        = string
  sensitive   = true
  default     = "Goodpassword1234!"
}

##############################################################################
`;

      assert.deepEqual(
        actualData["variables.tf"],
        variables,
        "it should create file"
      );
    });
  });
  it("should throw when error", () => {
    let task = () => configToFilesJson();
    assert.throws(
      task,
      "TypeError: Cannot read properties of undefined (reading 'f5_vsi'"
    );
  });
});
