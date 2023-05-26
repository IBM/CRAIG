const { assert } = require("chai");
const { prettyJSON } = require("lazy-z");
const {
  formatConfig,
  copyAclModalContent,
  copySgModalContent,
} = require("../../client/src/lib/forms");
const { state } = require("../../client/src/lib/state");
const { copyRuleCodeMirrorData } = require("../../client/src/lib");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("formatJson", () => {
  describe("formatConfig", () => {
    let testJson = { craig1: { craig: "test1" }, craig2: { craig: "test2" } };
    it("should return formatted json when isCopy is false", () => {
      assert.deepEqual(
        formatConfig(testJson, false),
        prettyJSON(testJson),
        "it should return formatted json when isCopy is false"
      );
    });

    it("should return stringified json when isCopy is true", () => {
      assert.deepEqual(
        formatConfig(testJson, true),
        JSON.stringify(testJson),
        "it should return stringified json when isCopy is true"
      );
    });
  });
  describe("copyRuleCodeMirrorData", () => {
    it("should return correct acl rule data", () => {
      let actualData = copyRuleCodeMirrorData(
        {
          ruleSource: "management",
          ruleCopyName: "allow-ibm-inbound",
        },
        {
          isAclForm: true,
          data: {
            name: "management",
          },
          craig: newState(),
        }
      );
      let expectedData = `{
  "action": "allow",
  "destination": "10.0.0.0/8",
  "direction": "inbound",
  "name": "allow-ibm-inbound",
  "source": "161.26.0.0/16",
  "icmp": {
    "type": null,
    "code": null
  },
  "tcp": {
    "port_min": null,
    "port_max": null,
    "source_port_min": null,
    "source_port_max": null
  },
  "udp": {
    "port_min": null,
    "port_max": null,
    "source_port_min": null,
    "source_port_max": null
  }
}`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should return correct security group rule data", () => {
      let actualData = copyRuleCodeMirrorData(
        {
          ruleSource: "management-vpe",
          ruleCopyName: "allow-ibm-inbound",
        },
        {
          isAclForm: false,
          craig: newState(),
        }
      );
      let expectedData = `{
  "direction": "inbound",
  "name": "allow-ibm-inbound",
  "source": "161.26.0.0/16",
  "tcp": {
    "port_max": null,
    "port_min": null
  },
  "udp": {
    "port_max": null,
    "port_min": null
  },
  "icmp": {
    "type": null,
    "code": null
  }
}`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("copyAclModalContent", () => {
    it("should return correct content", () => {
      let actualData = copyAclModalContent({
        craig: newState(),
        data: {
          name: "management",
        },
        sourceAcl: "management",
        destinationVpc: "workload",
      });
      let expectedData = `{
  "resource_group": "management-rg",
  "name": "management-copy",
  "vpc": "workload",
  "rules": [
    {
      "action": "allow",
      "destination": "10.0.0.0/8",
      "direction": "inbound",
      "name": "allow-ibm-inbound",
      "source": "161.26.0.0/16",
      "icmp": {
        "type": null,
        "code": null
      },
      "tcp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      },
      "udp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      }
    },
    {
      "action": "allow",
      "source": "10.0.0.0/8",
      "direction": "outbound",
      "name": "allow-ibm-outbound",
      "destination": "161.26.0.0/16",
      "icmp": {
        "type": null,
        "code": null
      },
      "tcp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      },
      "udp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      }
    },
    {
      "action": "allow",
      "destination": "10.0.0.0/8",
      "direction": "inbound",
      "name": "allow-all-network-inbound",
      "source": "10.0.0.0/8",
      "icmp": {
        "type": null,
        "code": null
      },
      "tcp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      },
      "udp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      }
    },
    {
      "action": "allow",
      "destination": "10.0.0.0/8",
      "direction": "outbound",
      "name": "allow-all-network-outbound",
      "source": "10.0.0.0/8",
      "icmp": {
        "type": null,
        "code": null
      },
      "tcp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      },
      "udp": {
        "port_min": null,
        "port_max": null,
        "source_port_min": null,
        "source_port_max": null
      }
    }
  ]
}`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("copySgModalContent", () => {
    it("should return correct content", () => {
      let actualData = copySgModalContent({
        craig: newState(),
        source: "management-vpe",
        destinationVpc: "workload",
      });
      let expectedData = `{
  "vpc": "workload",
  "name": "management-vpe-copy",
  "resource_group": "management-rg",
  "rules": [
    {
      "direction": "inbound",
      "name": "allow-ibm-inbound",
      "source": "161.26.0.0/16",
      "tcp": {
        "port_max": null,
        "port_min": null
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    },
    {
      "direction": "inbound",
      "name": "allow-vpc-inbound",
      "source": "10.0.0.0/8",
      "tcp": {
        "port_max": null,
        "port_min": null
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    },
    {
      "direction": "outbound",
      "name": "allow-vpc-outbound",
      "source": "10.0.0.0/8",
      "tcp": {
        "port_max": null,
        "port_min": null
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    },
    {
      "direction": "outbound",
      "name": "allow-ibm-tcp-53-outbound",
      "source": "161.26.0.0/16",
      "tcp": {
        "port_max": 53,
        "port_min": 53
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    },
    {
      "direction": "outbound",
      "name": "allow-ibm-tcp-80-outbound",
      "source": "161.26.0.0/16",
      "tcp": {
        "port_max": 80,
        "port_min": 80
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    },
    {
      "direction": "outbound",
      "name": "allow-ibm-tcp-443-outbound",
      "source": "161.26.0.0/16",
      "tcp": {
        "port_max": 443,
        "port_min": 443
      },
      "udp": {
        "port_max": null,
        "port_min": null
      },
      "icmp": {
        "type": null,
        "code": null
      }
    }
  ]
}`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
