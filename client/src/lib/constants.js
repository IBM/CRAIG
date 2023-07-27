const { RegexButWithWords } = require("regex-but-with-words");

module.exports = {
  varDotRegion: "${var.region}",
  varDotPrefix: "${var.prefix}",
  lastCommaExp: new RegexButWithWords()
    .literal(",")
    .look.ahead((exp) => exp.stringEnd())
    .done("i"),
  reservedSubnetNameExp: new RegexButWithWords()
    .stringBegin()
    .group((exp) => {
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
    .group((exp) => {
      exp
        .group((exp) => exp.set("a-z0-9-").or().literal("\\").any())
        .anyNumber()
        .set("a-z0-9");
    })
    .anyNumber()
    .stringEnd()
    .done("s"),
  dnsZoneNameExp: new RegexButWithWords()
    .stringBegin()
    .set("A-z")
    .group((exp) => {
      exp
        .group((exp) => exp.set("a-z0-9-.").or().literal("\\").any())
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
    .group((exp) => {
      exp.set("=", 0, 3).group((exp) => {
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
    .negativeLook.ahead((exp) => exp.whitespace().literal("null"))
    .whitespace()
    .group((exp) => {
      exp
        .group((exp) =>
          exp.literal('"').negatedSet('"').oneOrMore().look.ahead('"')
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
    .group((exp) => {
      exp.group((exp) => {
        exp
          .wordBoundary()
          .group((exp) => {
            exp
              .group((exp) => {
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
          .group((exp) => {
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
          .group((exp) => {
            exp.group((exp) => {
              exp.literal("/").group((exp) => {
                exp.literal("3").set("0-2").or().set("012").lazy().digit();
              });
            });
          })
          .lazy();
      });
    })
    .anyNumber()
    .group((exp) => {
      exp
        .literal(",")
        .whitespace()
        .anyNumber()
        .wordBoundary()
        .group((exp) => {
          exp
            .group((exp) => {
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
        .group((exp) => {
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
        .group((exp) => {
          exp.group((exp) => {
            exp.literal("/").group((exp) => {
              exp.literal("3").set("0-2").or().set("012").lazy().digit();
            });
          });
        })
        .lazy();
    })
    .anyNumber()
    .stringEnd()
    .done("gm"),
  urlValidationExp: new RegexButWithWords()
    .group((exp) => {
      exp.literal("ftp").or().literal("http").literal("s").lazy();
    })
    .literal("://")
    .group("www.")
    .lazy()
    .group((exp) => {
      exp.negatedSet('"\\/').oneOrMore().literal(".");
    })
    .group((exp) => {
      exp.negatedSet('"\\/').oneOrMore().literal(".");
    })
    .oneOrMore()
    .negatedSet('"\\/.')
    .oneOrMore()
    .literal("/")
    .negatedSet(' "')
    .anyNumber()
    .stringEnd()
    .done("g"),
  crnRegex: new RegexButWithWords()
    .stringBegin()
    .group((exp) => {
      exp
        .group((exp) => {
          exp
            .group((exp) => {
              exp
                .literal("crn:v1:bluemix:")
                .group((exp) => {
                  exp
                    .literal("public")
                    .or()
                    .literal("dedicated")
                    .or()
                    .literal("local");
                })
                .literal(":");
            })
            .set("A-z-:/0-9")
            .oneOrMore();
        })
        .or()
        .literal("CHEATER");
    })
    .stringEnd()
    .done("s"),
  projectDescriptionRegex: new RegexButWithWords()
    .stringBegin()
    .set("A-z0-9\\s_().,;", 0, 100)
    .stringEnd()
    .done("g"),
  ipRangeExpression: new RegexButWithWords()
    .wordBoundary()
    .group((exp) => {
      exp
        .group((exp) => {
          exp
            .group((exp) => {
              exp.literal("2").set("1-5").set("0-6");
            })
            .or()
            .group((exp) => {
              exp.literal("1").digit(2);
            })
            .or()
            .group((exp) => {
              exp.digit(1, 2);
            });
        })
        .literal(".");
    }, 3)
    .group((exp) => {
      exp
        .group((exp) => {
          exp.literal("2").set("1-5").set("0-6");
        })
        .or()
        .group((exp) => {
          exp.literal("1").digit(2);
        })
        .or()
        .group((exp) => {
          exp.digit(1, 2);
        });
    })
    .literal("-")
    .group((exp) => {
      exp
        .group((exp) => {
          exp
            .group((exp) => {
              exp.literal("2").set("1-5").set("0-6");
            })
            .or()
            .group((exp) => {
              exp.literal("1").digit(2);
            })
            .or()
            .group((exp) => {
              exp.digit(1, 2);
            });
        })
        .literal(".");
    }, 3)
    .group((exp) => {
      exp
        .group((exp) => {
          exp.literal("2").set("1-5").set("0-6");
        })
        .or()
        .group((exp) => {
          exp.literal("1").digit(2);
        })
        .or()
        .group((exp) => {
          exp.digit(1, 2);
        });
    })
    .wordBoundary()
    .done("g"),
  sccScopeDescriptionValidation: new RegexButWithWords()
    .stringBegin()
    .set("A-z")
    .set((exp) => {
      exp.literal("a-zA-Z0-9-._,").whitespace();
    })
    .anyNumber()
    .stringEnd()
    .done("i"),
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
        source_port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        source_port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        source_port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        source_port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        port_max: 32767,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        port_max: 443,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
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
        port_max: null,
      },
      udp: {
        port_min: null,
        port_max: null,
        source_port_min: null,
        source_port_max: null,
      },
      icmp: { code: null, type: null },
    },
  ],
  arrayFormPages: ["subnets"],
  toggleFormPages: [
    "activityTracker",
    "securityComplianceCenter",
    "iamAccountSettings",
    "f5",
  ],
  // required fields for json objects
  // these are used to add null values for optional fields on objects that are passed in
  // from a raw json document to ensure that all values are present on all objects in a list
  // to ensure that terraform will be able to compile the values
  requiredOptionalFields: {
    // first level array components
    shallowComponents: {
      key_management: {
        setToFalse: ["use_data", "authorize_vpc_reader_role", "use_hs_crypto"],
      },
      // empty cos object to enable nested search inside existing search
      object_storage: {
        setToFalse: ["use_random_suffix", "use_data"],
      },
      // clusters
      clusters: {
        setToNull: ["kube_version", "entitlement", "cos", "update_all_workers"],
        setToEmptyList: ["worker_pools"],
        setToValue: {
          encryption_key: null,
          private_endpoint: true,
        },
      },
      // resource groups
      resource_groups: {
        setToFalse: ["use_prefix", "use_data"],
      },
      // security groups
      security_groups: {
        setToNull: ["resource_group"],
      },
      // ssh keys
      ssh_keys: {
        setToNull: ["resource_group", "public_key"],
        setToFalse: ["use_data"],
      },
      // appid
      appid: {
        setToFalse: ["use_data"],
      },
      //vpe
      virtual_private_endpoints: {
        setToNull: ["resource_group", "vpc", "service"],
        setToEmptyList: ["security_groups", "subnets"],
      },
      //vpn
      vpn_gateways: {
        setToNull: ["resource_group", "subnet", "vpc"],
      },
      // vsi
      vsi: {
        setToNull: ["user_data", "resource_group", "encryption_key"],
        setToEmptyList: ["security_groups"],
      },
      // vpc
      vpcs: {
        setToNull: [
          "default_network_acl_name",
          "default_routing_table_name",
          "default_security_group_name",
        ],
        setToFalse: ["classic_access"],
        setToEmptyList: ["address_prefixes", "public_gateways"],
      },
    },
    // nested components
    nestedComponents: {
      key_management: {
        keys: {
          setToFalse: ["force_delete", "dual_auth_delete", "root_key"],
        },
      },
      // first key is parent
      object_storage: {
        // child arrays
        keys: {
          setToFalse: ["enable_hmac"],
          setToNull: ["role"],
        },
        buckets: {
          setToFalse: ["force_delete"],
          setToNull: ["kms_key", "storage_class", "endpoint"],
        },
      },
      vpcs: {
        subnets: {
          setToFalse: ["public_gateway", "has_prefix"],
          setToNull: ["cidr"],
        },
      },
      // clusters
      clusters: {
        worker_pools: {
          setToNull: ["flavor", "entitlement", "workers_per_subnet"],
        },
      },
    },
  },
};
