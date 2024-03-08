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

/**
 * create a security group
 * @param {slzStore} slz slz state store
 */
function lazyAddSg(slz) {
  slz.security_groups.create({
    name: "frog",
    vpc: "management",
  });
}

describe("security groups", () => {
  describe("security_groups.init", () => {
    it("should initialize security groups", () => {
      let store = newState();
      let expectedData = [
        {
          vpc: "management",
          name: "management-vpe",
          resource_group: "management-rg",
          rules: [
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "inbound",
              name: "allow-vpc-inbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "outbound",
              name: "allow-vpc-outbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-53-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 53,
                port_min: 53,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-80-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 80,
                port_min: 80,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "management",
              sg: "management-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-443-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 443,
                port_min: 443,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ],
        },
        {
          vpc: "workload",
          name: "workload-vpe",
          resource_group: "workload-rg",
          rules: [
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "inbound",
              name: "allow-vpc-inbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "outbound",
              name: "allow-vpc-outbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-53-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 53,
                port_min: 53,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-80-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 80,
                port_min: 80,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "workload",
              sg: "workload-vpe",
              direction: "outbound",
              name: "allow-ibm-tcp-443-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 443,
                port_min: 443,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ],
        },
        {
          vpc: "management",
          name: "management-vsi",
          resource_group: "management-rg",
          rules: [
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "inbound",
              name: "allow-vpc-inbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "outbound",
              name: "allow-vpc-outbound",
              source: "10.0.0.0/8",
              tcp: {
                port_max: null,
                port_min: null,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "outbound",
              name: "allow-ibm-tcp-53-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 53,
                port_min: 53,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "outbound",
              name: "allow-ibm-tcp-80-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 80,
                port_min: 80,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
            {
              vpc: "management",
              sg: "management-vsi",
              direction: "outbound",
              name: "allow-ibm-tcp-443-outbound",
              source: "161.26.0.0/16",
              tcp: {
                port_max: 443,
                port_min: 443,
              },
              udp: {
                port_max: null,
                port_min: null,
              },
              icmp: {
                type: null,
                code: null,
              },
              port_min: null,
              port_max: null,
              type: null,
              code: null,
              ruleProtocol: "tcp",
            },
          ],
        },
      ];
      store.update();
      assert.deepEqual(
        store.store.json.security_groups,
        expectedData,
        "it should return default security groups"
      );
    });
  });
  describe("security_groups.onStoreUpdate", () => {
    it("should set securityGroups on update", () => {
      let slz = new newState();
      slz.update();
      assert.deepEqual(
        {
          management: ["management-vpe", "management-vsi"],
          workload: ["workload-vpe"],
        },
        slz.store.securityGroups,
        "it should add groups"
      );
    });
    it("should set vpc name to null when a vpc a security group is attached to is deleted", () => {
      let slz = new newState();
      slz.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        slz.store.json.security_groups[0].vpc,
        null,
        "it should set to null"
      );
    });
    it("should set vpc name in a security group rule to null when a vpc a security group is attached to is deleted", () => {
      let slz = new newState();
      slz.vpcs.delete({}, { data: { name: "management" } });
      assert.deepEqual(
        slz.store.json.security_groups[0].rules[0].vpc,
        null,
        "it should set to null"
      );
    });
    it("should set resource group to null when a resource group a security group is attached to is deleted", () => {
      let slz = new newState();
      slz.resource_groups.delete({}, { data: { name: "management-rg" } });
      assert.deepEqual(
        slz.store.json.security_groups[0].resource_group,
        null,
        "it should set to null"
      );
    });
  });
  describe("security_groups.create", () => {
    it("should create a new security group", () => {
      let slz = new newState();
      slz.security_groups.create({
        name: "frog",
        vpc: "management",
        resource_group: null,
        rules: [],
      });
      assert.deepEqual(
        slz.store.json.security_groups[3],
        {
          name: "frog",
          vpc: "management",
          resource_group: null,
          rules: [],
        },
        "it should create the group"
      );
    });
  });
  describe("security_groups.save", () => {
    it("should update a security group", () => {
      let slz = new newState();
      slz.security_groups.save(
        { name: "todd" },
        { data: { name: "management-vpe", rules: [] } }
      );
      assert.deepEqual(
        slz.store.json.security_groups[0].name,
        "todd",
        "it should update the group"
      );
    });
    it("should update a security group with same name", () => {
      let slz = new newState();
      slz.security_groups.save(
        { name: "management-vpe" },
        { data: { name: "management-vpe", rules: [] } }
      );
      assert.deepEqual(
        slz.store.json.security_groups[0].name,
        "management-vpe",
        "it should update the group"
      );
    });
    it("should update a security group with a new vpc and sg name", () => {
      let slz = new newState();
      slz.security_groups.save(
        { name: "todd", vpc: "workload" },
        {
          data: {
            name: "management-vpe",
            rules: [
              {
                name: "test-rule",
                vpc: "management",
                sg: "management-vpe",
                tcp: {},
                udp: {},
                icmp: {},
              },
            ],
          },
        }
      );
      assert.deepEqual(
        slz.store.json.security_groups[0].rules[0].vpc,
        "workload",
        "it should update the group"
      );
      assert.deepEqual(
        slz.store.json.security_groups[0].rules[0].sg,
        "todd",
        "it should update the group"
      );
    });
  });
  describe("security_groups.delete", () => {
    it("should delete a security group", () => {
      let slz = new newState();
      slz.security_groups.delete({}, { data: { name: "management-vpe" } });
      assert.deepEqual(
        slz.store.json.security_groups.length,
        2,
        "it should delete the group"
      );
    });
  });
  describe("security_groups.schema", () => {
    let craig;
    beforeEach(() => {
      craig = newState();
    });
    it("should hide use_data", () => {
      assert.isTrue(
        craig.security_groups.use_data.hideWhen({}, { craig: craig }),
        "it should hide when in modal"
      );
      assert.isTrue(
        craig.security_groups.use_data.hideWhen(
          { vpc: "management" },
          { craig: craig }
        ),
        "it should hide when vpc does not use data"
      );
      craig.store.json.vpcs.push({
        name: "data",
        use_data: true,
      });
      assert.isFalse(
        craig.security_groups.use_data.hideWhen(
          { vpc: "data" },
          { craig: craig }
        ),
        "it should be shown"
      );
    });
    it("should disable vpc when using data for security group", () => {
      assert.isFalse(
        craig.security_groups.vpc.disabled({ use_data: true, vpc: "" }),
        "it should not be disabled"
      );
      assert.isTrue(
        craig.security_groups.vpc.disabled({ use_data: true, vpc: "frog" }),
        "it should be disabled"
      );
    });
  });
  describe("security_group.rules", () => {
    describe("security_groups.rules.create", () => {
      it("should add a new rule", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
            direction: "inbound",
          },
          { parent_name: "frog" }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              sg: "frog",
              vpc: "management",
              name: "test-rule",
              direction: "inbound",
              icmp: { type: null, code: null },
              tcp: { port_min: null, port_max: null },
              udp: { port_min: null, port_max: null },
              source: "8.8.8.8",
              port_max: null,
              port_min: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ],
          "it should create rule"
        );
      });
    });
    describe("security_groups.rules.save", () => {
      it("should update a rule in place", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
          },
          { parent_name: "frog" }
        );
        slz.security_groups.rules.save(
          {
            inbound: true,
            name: "test-rule",
          },
          {
            parent_name: "frog",
            data: { name: "test-rule" },
            isSecurityGroup: true,
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              name: "test-rule",
              direction: "inbound",
              icmp: { type: null, code: null },
              tcp: { port_min: null, port_max: null },
              udp: { port_min: null, port_max: null },
              source: "8.8.8.8",
              sg: "frog",
              vpc: "management",
              port_max: null,
              port_min: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ],
          "it should update rule"
        );
      });
      it("should update a rule in place with protocol", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
            ruleProtocol: "tcp",
            port_max: null,
            port_min: null,
            rule: {
              port_max: null,
              port_min: null,
            },
            tcp: {
              port_min: 8080,
              port_max: 8080,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
          },
          {
            parent_name: "frog",
          }
        );
        slz.security_groups.rules.save(
          {
            name: "test-rule",
            inbound: true,
            ruleProtocol: "tcp",
            port_min: 8080,
            port_max: 8080,
            rule: {
              port_min: 8080,
              port_max: 8080,
            },
            tcp: {
              port_min: 8080,
              port_max: 8080,
            },
            udp: {
              port_max: null,
              port_min: null,
            },
            icmp: {
              code: null,
              type: null,
            },
          },
          {
            parent_name: "frog",
            data: { name: "test-rule" },
            isSecurityGroup: true,
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              name: "test-rule",
              direction: "inbound",
              icmp: { type: null, code: null },
              tcp: { port_min: 8080, port_max: 8080 },
              udp: { port_min: null, port_max: null },
              source: "8.8.8.8",
              sg: "frog",
              vpc: "management",
              type: null,
              code: null,
              ruleProtocol: "tcp",
              port_min: 8080,
              port_max: 8080,
            },
          ],
          "it should update rule"
        );
      });
      it("should update a rule in place with icmp protocol", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            code: 8080,
            type: 8080,
            rule: {
              code: 8080,
              type: 8080,
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
            },
          },
          {
            parent_name: "frog",
          }
        );
        slz.security_groups.rules.save(
          {
            name: "test-rule",
            inbound: true,
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            code: null,
            type: null,
            rule: {
              code: 8080,
              type: 8080,
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
            },
            showDeleteModal: true,
          },
          {
            parent_name: "frog",
            data: { name: "test-rule" },
            isSecurityGroup: true,
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              name: "test-rule",
              direction: "inbound",
              icmp: { type: 8080, code: 8080 },
              tcp: { port_min: null, port_max: null },
              udp: { port_min: null, port_max: null },
              source: "1.2.3.4",
              sg: "frog",
              vpc: "management",
              port_max: null,
              port_min: null,
              type: null,
              code: null,
              ruleProtocol: "icmp",
            },
          ],
          "it should update rule"
        );
      });
      it("should update a rule in place with icmp protocol", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            code: 8080,
            type: 8080,
            rule: {
              code: 8080,
              type: 8080,
              port_min: null,
              port_max: null,
              source_port_min: null,
              source_port_max: null,
            },
          },
          {
            parent_name: "frog",
          }
        );
        slz.security_groups.rules.save(
          {
            name: "test-rule",
            inbound: true,
            ruleProtocol: "icmp",
            source: "1.2.3.4",
            code: null,
            type: null,
            code: 8080,
            type: 8080,
            showDeleteModal: true,
          },
          {
            parent_name: "frog",
            data: { name: "test-rule" },
            isSecurityGroup: true,
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              name: "test-rule",
              direction: "inbound",
              icmp: { type: 8080, code: 8080 },
              tcp: { port_min: null, port_max: null },
              udp: { port_min: null, port_max: null },
              source: "1.2.3.4",
              sg: "frog",
              vpc: "management",
              port_max: null,
              port_min: null,
              type: 8080,
              code: 8080,
              ruleProtocol: "icmp",
            },
          ],
          "it should update rule"
        );
      });
      it("should update a rule in place with all protocol", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
          },
          { parent_name: "frog" }
        );
        slz.security_groups.rules.save(
          {
            inbound: true,
            ruleProtocol: "all",
            name: "test-rule",
          },
          {
            parent_name: "frog",
            data: { name: "test-rule" },
            isSecurityGroup: true,
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [
            {
              name: "test-rule",
              direction: "inbound",
              icmp: { type: null, code: null },
              tcp: { port_min: null, port_max: null },
              udp: { port_min: null, port_max: null },
              source: "8.8.8.8",
              vpc: "management",
              sg: "frog",
              port_max: null,
              port_min: null,
              type: null,
              code: null,
              ruleProtocol: "all",
            },
          ],
          "it should update rule"
        );
      });
    });
    describe("security_groups.rules.delete", () => {
      it("should delete a rule", () => {
        let slz = new newState();
        lazyAddSg(slz);
        slz.security_groups.rules.create(
          {
            name: "test-rule",
            source: "8.8.8.8",
          },
          {
            parent_name: "frog",
          }
        );
        slz.security_groups.rules.delete(
          {},
          {
            parent_name: "frog",
            data: { name: "test-rule" },
          }
        );
        assert.deepEqual(
          slz.store.json.security_groups[3].rules,
          [],
          "it should delete rule"
        );
      });
    });
    describe("security_groups.rules.schema", () => {
      let craig = new newState();
      it("should set data when changing rule protocol", () => {
        let data = { ruleProtocol: "all" };
        craig.security_groups.rules.ruleProtocol.onInputChange(data);
        assert.deepEqual(
          data,
          {
            rule: {
              port_max: null,
              port_min: null,
              type: null,
              source_port_max: null,
              source_port_min: null,
              code: null,
            },
            ruleProtocol: "all",
            tcp: {
              port_min: null,
              port_max: null,
            },
            udp: {
              port_min: null,
              port_max: null,
            },
            icmp: {
              type: null,
              code: null,
            },
          },
          "it should return data"
        );
      });
      it("should return true if icmp type is not a number", () => {
        assert.isTrue(
          craig.security_groups.rules.type.invalid({
            ruleProtocol: "icmp",
            type: "asdf",
          }),
          "it should be invalid"
        );
      });
      it("should return true if no source", () => {
        assert.isTrue(
          craig.security_groups.rules.source.invalid({}),
          "it should be invalid and not crash"
        );
      });
      it("should return generic name callback when an invalid name is passed", () => {
        assert.deepEqual(
          craig.security_groups.rules.name.invalidText(
            { name: "@@@" },
            { rules: [], data: { name: "" } }
          ),
          "Name must follow the regex pattern: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
          "it should return error text"
        );
      });
      it("should return generic name callback when an invalid duplicate name is passed", () => {
        assert.deepEqual(
          craig.security_groups.rules.name.invalidText(
            { name: "aaa" },
            { rules: [{ name: "aaa" }], data: { name: "" } }
          ),
          'Name "aaa" already in use',
          "it should return error text"
        );
      });
    });
  });
});
