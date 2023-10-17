const { assert } = require("chai");
const {
  disableSave,
  invalidPort,
  forceShowForm,
  disableSshKeyDelete,
  invalidCidrBlock,
} = require("../../client/src/lib");

describe("disableSave", () => {
  it("should otherwise return false", () => {
    assert.isFalse(disableSave("pretend_field", {}, {}), "it should be false");
  });
  describe("invalidPort", () => {
    it("should return false if rule protocol all", () => {
      assert.isFalse(
        invalidPort({
          ruleProtocol: "all",
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is icmp and invalid field", () => {
      assert.isTrue(
        invalidPort({
          ruleProtocol: "icmp",
          rule: {
            code: 10000,
          },
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is not icmp and invalid field", () => {
      assert.isTrue(
        invalidPort({
          ruleProtocol: "udp",
          rule: {
            port_min: 1000000,
          },
        }),
        "it should be false"
      );
    });
    it("should return true if rule protocol is not icmp and invalid field and security group", () => {
      assert.isTrue(
        invalidPort(
          {
            ruleProtocol: "udp",
            rule: {
              port_min: 1000000,
            },
          },
          true
        ),
        "it should be false"
      );
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
            },
          }
        ),
        "it should be true"
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
          }
        ),
        "it should be false"
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
            },
          }
        ),
        "it should be true"
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
          }
        )
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
        })
      );
    });
  });
  describe("invalidCidrBlock", () => {
    it("should return true for null", () => {
      assert.isTrue(invalidCidrBlock(null), "it should be true");
    });
  });
});
