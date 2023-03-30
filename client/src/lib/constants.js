const { RegexButWithWords } = require("regex-but-with-words");

module.exports = {
  lastCommaExp: new RegexButWithWords()
    .literal(",")
    .look.ahead(exp => exp.stringEnd())
    .done("i"),
  reservedSubnetNameExp: new RegexButWithWords()
    .stringBegin()
    .group(exp => {
      exp
        .literal("f5-external")
        .or()
        .literal("f5-workload")
        .or()
        .literal("f5-management")
        .or()
        .literal("f5-bastion")
        .or()
        .literal("vpn-1")
        .or()
        .literal("vpn-2")
        .or()
        .any()
        .anyNumber()
        .literal("zone")
        .any()
        .anyNumber();
    })
    .stringEnd()
    .done("g"),
  newResourceNameExp: new RegexButWithWords()
    .stringBegin()
    .set("A-z")
    .group(exp => {
      exp
        .group(exp =>
          exp
            .set("a-z0-9-")
            .or()
            .literal("\\")
            .any()
        )
        .anyNumber()
        .set("a-z0-9");
    })
    .anyNumber()
    .stringEnd()
    .done("s"),
  sshKeyValidationExp: new RegexButWithWords()
    .stringBegin()
    .literal("ssh-rsa AAAA")
    .set("0-9A-Za-z+/")
    .oneOrMore()
    .group(exp => {
      exp.set("=", 0, 3).group(exp => {
        exp
          .negatedSet("@")
          .oneOrMore()
          .literal("@")
          .negatedSet("@")
          .oneOrMore();
      });
    })
    .lazy()
    .stringEnd()
    .done("g"),
  maskFieldsExpStep1ReplacePublicKey: new RegexButWithWords()
    .literal("public_key")
    .done("g"),
  maskFieldsExpStep2ReplaceTmosAdminPassword: new RegexButWithWords()
    .literal("tmos_admin_password")
    .done("g"),
  maskFieldsExpStep3ReplaceLicensePassword: new RegexButWithWords()
    .literal("license_password")
    .done("g"),
  maskFieldsExpStep4HideValue: new RegexButWithWords()
    .literal('%%%%":')
    .negativeLook.ahead(exp => exp.whitespace().literal("null"))
    .whitespace()
    .group(exp => {
      exp
        .group(exp =>
          exp
            .literal('"')
            .negatedSet('"')
            .oneOrMore()
            .look.ahead('"')
        )
        .or()
        .literal("null")
        .or()
        .literal('""');
    })
    .done("g"),
  maskFieldsExpStep5CleanUp: new RegexButWithWords()
    .literal("public_key%%%%")
    .done("g"),
  commaSeparatedIpListExp: new RegexButWithWords()
    .stringBegin()
    .group(exp => {
      exp.group(exp => {
        exp
          .wordBoundary()
          .group(exp => {
            exp
              .group(exp => {
                exp
                  .literal("25")
                  .set("0-5")
                  .or()
                  .literal("2")
                  .set("0-4")
                  .digit()
                  .or()
                  .set("01")
                  .lazy()
                  .digit(1, 2);
              })
              .literal(".");
          }, 3)
          .group(exp => {
            exp
              .literal("25")
              .set("0-5")
              .or()
              .literal("2")
              .set("0-4")
              .digit()
              .or()
              .set("01")
              .lazy()
              .digit(1, 2);
          })
          .wordBoundary()
          .group(exp => {
            exp.group(exp => {
              exp.literal("/").group(exp => {
                exp
                  .literal("3")
                  .set("0-2")
                  .or()
                  .set("012")
                  .lazy()
                  .digit();
              });
            });
          })
          .lazy();
      });
    })
    .anyNumber()
    .group(exp => {
      exp
        .literal(",")
        .whitespace()
        .anyNumber()
        .wordBoundary()
        .group(exp => {
          exp
            .group(exp => {
              exp
                .literal("25")
                .set("0-5")
                .or()
                .literal("2")
                .set("0-4")
                .digit()
                .or()
                .set("01")
                .lazy()
                .digit(1, 2);
            })
            .literal(".");
        }, 3)
        .group(exp => {
          exp
            .literal("25")
            .set("0-5")
            .or()
            .literal("2")
            .set("0-4")
            .digit()
            .or()
            .set("01")
            .lazy()
            .digit(1, 2);
        })
        .wordBoundary()
        .group(exp => {
          exp.group(exp => {
            exp.literal("/").group(exp => {
              exp
                .literal("3")
                .set("0-2")
                .or()
                .set("012")
                .lazy()
                .digit();
            });
          });
        })
        .lazy();
    })
    .anyNumber()
    .stringEnd()
    .done("gm"),
  clusterRules: [
    {
      name: "roks-create-worker-nodes-inbound",
      action: "allow",
      source: "161.26.0.0/16",
      destination: "0.0.0.0/0",
      direction: "inbound",
      tcp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "roks-create-worker-nodes-outbound",
      action: "allow",
      destination: "161.26.0.0/16",
      source: "0.0.0.0/0",
      direction: "outbound",
      tcp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "roks-nodes-to-service-inbound",
      action: "allow",
      source: "166.8.0.0/14",
      destination: "0.0.0.0/0",
      direction: "inbound",
      tcp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "roks-nodes-to-service-outbound",
      action: "allow",
      destination: "166.8.0.0/14",
      source: "0.0.0.0/0",
      direction: "outbound",
      tcp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "allow-app-incoming-traffic-requests",
      action: "allow",
      source: "0.0.0.0/0",
      destination: "0.0.0.0/0",
      direction: "inbound",
      tcp: {
        source_port_min: 30000,
        source_port_max: 32767,
        port_min: null,
        port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "allow-app-outgoing-traffic-requests",
      action: "allow",
      source: "0.0.0.0/0",
      destination: "0.0.0.0/0",
      direction: "outbound",
      tcp: {
        source_port_min: null,
        source_port_max: null,
        port_min: 30000,
        port_max: 32767
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "allow-lb-incoming-traffic-requests",
      action: "allow",
      source: "0.0.0.0/0",
      destination: "0.0.0.0/0",
      direction: "inbound",
      tcp: {
        source_port_min: null,
        source_port_max: null,
        port_min: 443,
        port_max: 443
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    },
    {
      name: "allow-lb-outgoing-traffic-requests",
      action: "allow",
      source: "0.0.0.0/0",
      destination: "0.0.0.0/0",
      direction: "outbound",
      tcp: {
        source_port_min: 443,
        source_port_max: 443,
        port_min: null,
        port_max: null
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null
      },
      icmp: { code: null, type: null }
    }
  ],
  arrayFormPages: [
    "resourceGroups",
    "keyManagement",
    "objectStorage",
    "secretsManager",
    "appID",
    "vpcs",
    "sshKeys",
    "transitGateways",
    "nacls",
    "vpn",
    "subnets",
    "securityGroups",
    "clusters",
    "eventStreams"
  ],
  toggleFormPages: [
    "activityTracker",
    "securityComplianceCenter",
    "iamAccountSettings"
  ]
};
