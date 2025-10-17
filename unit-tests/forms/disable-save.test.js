const { assert } = require("chai");
const {
  disableSave,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
  state,
} = require("../../client/src/lib");

describe("disableSave", () => {
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
  describe("clusters", () => {
    it("should return true if a cluster worker pool has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "worker_pools",
          {
            name: "a--",
          },
          {
            craig: state(),
            data: {
              name: "mm",
            },
          },
        ),
        "it should be true",
      );
    });
    it("should return true if a secrets group is an invalid duplicate name", () => {
      let tempCraig = state();
      tempCraig.store = {
        json: {
          clusters: [
            {
              name: "frog",
              opaque_secrets: [
                {
                  name: "a",
                  secrets_group: "duplicate",
                },
              ],
            },
          ],
        },
      };

      assert.isTrue(
        disableSave(
          "opaque_secrets",
          {
            name: "frog",
            secrets_group: "duplicate",
          },
          {
            craig: tempCraig,
            data: {
              name: "mm",
            },
          },
        ),
        "it should be true",
      );
    });
  });
  describe("security groups", () => {
    describe("rules", () => {
      it("should return true if security group rule has invalid name", () => {
        assert.isTrue(
          disableSave(
            "sg_rules",
            {
              name: "@@@",
            },
            { rules: [], data: { name: "" }, craig: state() },
          ),
        );
      });
    });
  });
  describe("object storage", () => {
    it("should return true if a object storage instance has an invalid resource group", () => {
      assert.isTrue(
        disableSave(
          "object_storage",
          { name: "aaa", use_data: false, resource_group: null },
          {
            craig: state(),
            data: {
              name: "test",
            },
          },
        ),
        "it should be false",
      );
    });
    it("should return true if an object storage bucket has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "buckets",
          { name: "@@@", use_data: false },
          {
            craig: state(),
            data: {
              name: "test",
            },
          },
        ),
        "it should be false",
      );
    });
    it("should return true if an object storage key has an invalid name", () => {
      assert.isTrue(
        disableSave(
          "cos_keys",
          { name: "@@@", use_data: false },
          {
            craig: state(),
            data: {
              name: "test",
            },
            formName: "Service Credentials",
          },
        ),
        "it should be false",
      );
    });
  });
  describe("f5_vsi_template", () => {
    const example_template = {
      app_id: "null",
      as3_declaration_url: "http://www.test.com/",
      default_route_gateway_cidr: "10.10.10.10/24",
      do_declaration_url: "http://www.test.com/",
      domain: "local",
      hostname: "f5-ve-01",
      license_host: "null",
      license_password: "null",
      license_pool: "null",
      license_sku_keyword_1: "null",
      license_sku_keyword_2: "null",
      license_type: "none",
      license_username: "null",
      phone_home_url: "http://www.test.com/",
      template_version: "20210201",
      tgactive_url: "http://www.test.com/",
      tgrefresh_url: "http://www.test.com/",
      tgstandby_url: "http://www.test.com/",
      tmos_admin_password: "1GoodVeryPassword!",
      ts_declaration_url: "http://www.test.com/",
      vpc: "edge",
      zone: 1,
      template_source: "test",
    };
    it("should return true if any fields are empty, based on license_type none", () => {
      let template = Object.assign({}, example_template);
      template.template_version = "";
      template.template_source = "";
      assert.isTrue(
        disableSave("f5_vsi_template", template, { craig: state() }),
        "it should be true",
      );
    });
  });
  describe("power", () => {
    describe("cloud_connections", () => {
      it("should be disabled when invalid duplicate power connection name", () => {
        let tempCraig = state();
        tempCraig.store = {
          json: {
            power: [
              {
                name: "workspace",
                cloud_connections: [
                  {
                    name: "frog",
                  },
                  {
                    name: "horse",
                  },
                ],
              },
            ],
          },
        };
        let actualData = disableSave(
          "cloud_connections",
          {
            name: "frog",
          },
          {
            arrayParentName: "workspace",
            data: {
              name: "toad",
            },
            craig: tempCraig,
          },
        );
        assert.isTrue(actualData, "it should be disabled");
      });
    });
  });
  describe("f5_vsi", () => {
    it("should return true if ssh keys empty", () => {
      assert.isTrue(
        disableSave("f5_vsi", { ssh_keys: [] }, { craig: state() }),
        "it should be disabled",
      );
    });
    it("should return true if no ssh keys", () => {
      assert.isTrue(
        disableSave("f5_vsi", {}, { craig: state() }),
        "it should be disabled",
      );
    });
  });
  describe("key management", () => {
    describe("keys", () => {
      it("should return true if an encryption key has an invalid name", () => {
        assert.isTrue(
          disableSave(
            "encryption_keys",
            { name: "@@@", use_data: false },
            {
              craig: state(),
              data: {
                name: "test",
              },
            },
          ),
          "it should be false",
        );
      });
    });
  });
  describe("tgw", () => {
    describe("gre tunnels", () => {
      it("should return true if no local_tunnel_ip", () => {
        assert.isTrue(
          disableSave(
            "gre_tunnels",
            {
              gateway: "",
              remote_tunnel_ip: "",
              local_tunnel_ip: "",
              zone: "",
            },
            { craig: state() },
          ),
          "it should be disabled",
        );
      });
    });
  });
  describe("acls", () => {
    describe("acl rules", () => {
      it("should return false if a acl rule is valid", () => {
        assert.isFalse(
          disableSave(
            "acl_rules",
            {
              name: "aaa",
              source: "1.2.3.4",
              destination: "1.2.3.4",
              ruleProtocol: "udp",
              rule: {
                port_min: 80,
                port_max: 80,
                source_port_min: 80,
                source_port_max: 80,
              },
            },
            {
              innerFormProps: {
                craig: state(),
              },
              data: {
                name: "frog",
              },
              parent_name: "frog",
            },
          ),
          "it should be true",
        );
      });
      it("should return false if a acl rule is valid in modal", () => {
        assert.isFalse(
          disableSave(
            "acl_rules",
            {
              name: "aaa",
              source: "1.2.3.4",
              destination: "1.2.3.4",
              ruleProtocol: "udp",
              rule: {
                port_min: 80,
                port_max: 80,
                source_port_min: 80,
                source_port_max: 80,
              },
            },
            {
              innerFormProps: {
                craig: new state(),
              },
              craig: new state(),
              data: {
                name: "frog",
              },
              parent_name: "frog",
              isModal: true,
            },
          ),
          "it should be true",
        );
      });
    });
  });
  describe("forceShowForm", () => {
    it("should force forms open if save is disabled and data does not have field of enable", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "vpcs",
            innerFormProps: {
              data: {
                name: "management",
                bucket: null,
              },
              craig: state(),
            },
          },
        ),
        "it should be true",
      );
    });
    it("should not force forms open if it is not enabled", () => {
      assert.isFalse(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: false,
              },
            },
          },
        ),
        "it should be false",
      );
    });
    it("should force forms open if save is disabled and it is enabled", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "iam_account_settings",
            innerFormProps: {
              data: {
                enable: true,
                max_sessions_per_identity: null,
              },
              craig: state(),
            },
          },
        ),
        "it should be true",
      );
    });
    it("should force a vpn gateway form open when a connection has an invalid peer address", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "vpn_gateways",
            innerFormProps: {
              data: {
                name: "vpn-gw",
                connections: [
                  {
                    name: "hi",
                  },
                ],
              },
            },
          },
        ),
      );
    });
    it("should not force a vpn gateway form open when a connection has a valid peer address", () => {
      assert.isFalse(
        forceShowForm(
          {
            resource_group: "yes",
          },
          {
            submissionFieldName: "vpn_gateways",
            innerFormProps: {
              data: {
                name: "vpn-gw",
                resource_group: "frog",
                connections: [
                  {
                    name: "hi",
                    peer_address: "yes",
                  },
                ],
              },
              craig: new state(),
            },
          },
        ),
      );
    });
    it("should force a power vs form open when an ssh key is invalid", () => {
      assert.isTrue(
        forceShowForm(
          {},
          {
            submissionFieldName: "power",
            innerFormProps: {
              data: {
                name: "oracle-template",
                resource_group: "power-rg",
                zone: "dal12",
                ssh_keys: [
                  {
                    name: "power-ssh-2∂",
                    public_key:
                      "ssh-rsAAAAB3NzaC1yc2thisisaninvalidsshkey... test@fakeemail.com",
                    use_data: false,
                    resource_group: "management-rg",
                    workspace: "oracle-template",
                    zone: "dal12",
                  },
                  {
                    name: "power-ssh",
                    public_key: "",
                    use_data: false,
                    resource_group: "management-rg",
                    workspace: "oracle-template",
                    zone: "dal12",
                  },
                ],
                network: [
                  {
                    name: "oracle-public",
                    pi_network_type: "pub-vlan",
                    pi_cidr: "172.40.10.0/24",
                    pi_dns: ["127.0.0.1"],
                    pi_network_jumbo: false,
                    workspace: "oracle-template",
                    zone: "dal12",
                  },
                  {
                    name: "oracle-private-1",
                    pi_network_type: "vlan",
                    pi_cidr: "10.80.10.0/28",
                    pi_dns: ["127.0.0.1"],
                    pi_network_jumbo: false,
                    workspace: "oracle-template",
                    zone: "dal12",
                    depends_on: [
                      "${ibm_pi_network.power_network_oracle_template_oracle_public}",
                    ],
                  },
                  {
                    name: "oracle-private-2",
                    pi_network_type: "vlan",
                    pi_cidr: "10.90.10.0/28",
                    pi_dns: ["127.0.0.1"],
                    pi_network_jumbo: false,
                    workspace: "oracle-template",
                    zone: "dal12",
                    depends_on: [
                      "${ibm_pi_network.power_network_oracle_template_oracle_private_1}",
                    ],
                  },
                ],
                cloud_connections: [
                  {
                    name: "oracle-connection",
                    pi_cloud_connection_speed: "50",
                    pi_cloud_connection_global_routing: false,
                    pi_cloud_connection_metered: false,
                    pi_cloud_connection_transit_enabled: true,
                    transit_gateways: ["transit-gateway"],
                    workspace: "oracle-template",
                    zone: "dal12",
                  },
                ],
                images: [
                  {
                    name: "7300-00-01",
                    workspace: "oracle-template",
                    zone: "dal12",
                    pi_image_id: "2cf98f53-433d-4c7a-bc46-1f2dfcc04066",
                  },
                ],
                attachments: [
                  {
                    network: "oracle-public",
                    workspace: "oracle-template",
                    zone: "dal12",
                    connections: ["oracle-connection"],
                  },
                  {
                    network: "oracle-private-1",
                    workspace: "oracle-template",
                    zone: "dal12",
                    connections: ["oracle-connection"],
                  },
                  {
                    network: "oracle-private-2",
                    workspace: "oracle-template",
                    zone: "dal12",
                    connections: ["oracle-connection"],
                  },
                ],
                imageNames: ["7300-00-01"],
              },
              craig: {
                store: {
                  json: {
                    power: [],
                  },
                },
              },
            },
          },
        ),
      );
    });
  });

  describe("disableSshKeyDelete", () => {
    it("should return true if ssh key is in use", () => {
      assert.isTrue(
        disableSshKeyDelete({
          craig: {
            store: {
              json: {
                vsi: [
                  {
                    ssh_keys: ["key"],
                  },
                ],
                teleport_vsi: [],
                f5_vsi: [],
              },
            },
          },
          innerFormProps: {
            data: {
              name: "key",
            },
          },
        }),
      );
    });
  });
  describe("invalidCidrBlock", () => {
    it("should return true for null", () => {
      assert.isTrue(invalidCidrBlock(null), "it should be true");
    });
  });
});
