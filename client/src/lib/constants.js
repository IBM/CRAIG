const { RegexButWithWords } = require("regex-but-with-words");
const mixedTemplate = require("./docs/templates/slz-mixed.json");
const vsiTemplate = require("./docs/templates/slz-vsi.json");
const vsiEdgeTemplate = require("./docs/templates/slz-vsi-edge.json");
const powerTemplate = require("./docs/templates/power-sap-hana.json");
const oracleRac = require("./docs/templates/oracle-rac.json");
const emptyProject = require("./docs/templates/from-scratch.json");
const powerVsQuickStart = require("./docs/templates/quick-start-power.json");
const oracleSi = require("./docs/templates/oracle-si.json");
const vpnaas = require("./docs/templates/vpn-as-a-service.json");
const powerVsPocQuickStart = require("./docs/templates/power-poc-quick-start.json");
const { azsort } = require("lazy-z");

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
          .lazy()
          .negatedSet("@")
          .oneOrMore()
          .lazy();
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
  domainValidationExp: new RegexButWithWords()
    .group("www.")
    .lazy()
    .group((exp) => {
      exp
        .set("A-z0-9")
        .set("A-z0-9_-")
        .anyNumber()
        .set("A-z0-9")
        .oneOrMore()
        .literal(".");
    })
    .oneOrMore()
    .set("A-z0-9")
    .set("A-z0-9_-")
    .anyNumber()
    .set("A-z0-9")
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
  commaSeparatedCidrListExp: new RegexButWithWords()
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
          });
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
        });
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
  edgeRouterEnabledZones: [
    "dal10",
    "wdc06",
    "wdc07",
    "eu-de-1",
    "eu-de-2",
    "mad02",
    "mad04",
    "sao04",
  ],
  cosPlans: [
    "standard",
    "lite",
    "cos-one-rate-plan",
    "cos-satellite-12tb-plan",
    "cos-satellite-24tb-plan",
    "cos-satellite-48tb-plan",
    "cos-satellite-96tb-plan",
  ],
  powerStoragePoolRegionMap: {
    syd04: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
    syd05: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
    "eu-de-1": [
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-3",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
    ],
    "eu-de-2": [
      "Tier1-Flash-4",
      "Tier1-Flash-3",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
    ],
    "mad02": [],
    "mad04": [],
    sao01: [],
    sao04: [],
    lon04: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
    lon06: [
      "Tier3-Flash-2",
      "Tier3-Flash-1",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-3",
    ],
    "us-east": [
      "Tier1-Flash-8",
      "Tier1-Flash-7",
      "Tier1-Flash-6",
      "Tier1-Flash-5",
      "Tier1-Flash-4",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-5",
      "Tier3-Flash-2",
      "Tier3-Flash-4",
      "Tier3-Flash-3",
      "Tier3-Flash-1",
    ],
    wdc06: [
      "Tier1-Flash-1",
      "Tier1-Flash-3",
      "Tier1-Flash-2",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
      "Tier3-Flash-3",
    ],
    "us-south": [
      "Tier1-Flash-6",
      "Tier1-Flash-5",
      "Tier1-Flash-4",
      "Tier1-Flash-3",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-5",
      "Tier3-Flash-4",
      "Tier3-Flash-3",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
    ],
    dal10: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
    dal12: [
      "Tier1-Flash-6",
      "Tier1-Flash-5",
      "Tier1-Flash-3",
      "Tier1-Flash-4",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier3-Flash-5",
      "Tier3-Flash-4",
      "Tier3-Flash-3",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
    ],
    tok04: [
      "Tier3-Flash-3",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
    ],
    sao01: [
      "Tier3-Flash-4",
      "Tier3-Flash-3",
      "Tier3-Flash-2",
      "Tier3-Flash-1",
      "Tier1-Flash-2",
      "Tier1-Flash-1",
      "Tier1-Flash-3",
    ],
    tor01: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
    wdc07: ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
  },
  replicationEnabledStoragePoolMap: {
    "us-east": ["Tier1-Flash-8"],
    wdc06: ["Tier1-Flash-1", "Tier3-Flash-2", "Tier3-Flash-1"],
    "us-south": ["Tier1-Flash-6"],
    dal12: ["Tier1-Flash-3", "Tier3-Flash-4", "Tier3-Flash-3"],
  },
  template_dropdown_map: {
    Mixed: {
      template: mixedTemplate,
      name: "Landing Zone Mixed Pattern",
      patternDocText:
        "This template initializes an environment with resources based on the IBM Landing Zone Mixed Pattern. This is the default pattern for CRAIG.",
      includes: [
        "A resource group for cloud services and for each VPC",
        "A management and workload VPC connected by a transit gateway",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "All necessary networking rules to allow communication",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "A Red Hat OpenShift cluster in the workload VPC",
        "An example Virtual Server instance deployment in the management VPC",
        "A VPN Gateway in the Management VPC",
      ],
    },
    VSI: {
      template: vsiTemplate,
      name: "Landing Zone VSI Pattern",
      patternDocText:
        "Based on the IBM Landing Zone VSI Pattern, this template initializes an environment with an example application server deployment in both the Management and Workload VPC.",
      includes: [
        "A resource group for cloud services and for each VPC",
        "A management and workload VPC connected by a transit gateway",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "All necessary networking rules to allow communication",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "An example Virtual Server deployment in the management VPC",
        "An example Virtual Server deployment in the workload VPC",
        "A VPN Gateway in the Management VPC",
      ],
    },
    "VSI Edge": {
      template: vsiEdgeTemplate,
      name: "Landing Zone VSI Edge Pattern",
      patternDocText:
        "Based on the IBM Landing Zone VSI Edge Pattern, this template initializes an environment with an Edge VPC, an F5 Big IP Virtual Server and the required networking components.",
      includes: [
        "A resource group for cloud services and for each VPC",
        "A management and workload VPC connected by a transit gateway",
        "An Edge VPC with F5 Big IP and needed network interfaces",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "All necessary networking rules to allow communication",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "An example Virtual Server deployment in the management VPC",
        "An example Virtual Server deployment in the workload VPC",
        "A VPN Gateway in the Management VPC",
      ],
    },
    "Power VS SAP Hana": {
      template: powerTemplate,
      name: "Power VS SAP Hana Pattern",
      patternDocText:
        "Based on existing SAP Hana solutions, this template initializes an environment with the base infrastructure for a SAP system landscape that leverages the services from the VPC landing zone as well as the needed components to get started with a Power VS Virtual Server environment.",
      includes: [
        "A resource group for cloud services and for each VPC",
        "A management and workload VPC connected by a transit gateway",
        "An Edge VPC with F5 Big IP and needed network interfaces",
        "Power VS Instances for SAP Hana, SAP Netweaver, and Secure File Share.",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "All necessary networking rules to allow communication",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "An example Virtual Server instance deployment in the management VPC",
        "A VPN Gateway in the Management VPC",
      ],
    },
    "Power VS Oracle Ready": {
      template: oracleRac,
      name: "Power VS AIX Oracle Ready",
      patternDocText:
        "This template initializes an environment with VPC and Power VS resources to allow users to create Oracle Real Application Clusters (Oracle RAC) on IBM Cloud.",
      includes: [
        "A resource group for cloud services and for each VPC, and Power Virtual Servers",
        "A management and workload VPC connected by a transit gateway",
        "One public and two private network interfaces for Power VS with cloud connections to a transit gateway",
        "Two AIX Power Virtual Server instances and needed volumes for Oracle RAC implemententation",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "An example Virtual Server instance deployment in the management and workload VPCs",
        "A VPN Gateway in the Management VPC",
      ],
    },
    "Power VS Oracle Single Instance": {
      template: oracleSi,
      name: "Power VS AIX Oracle Single Instance",
      patternDocText:
        "This template initializes an environment with VPC and Power VS resources to allow users to create Oracle Real Application Clusters (Oracle RAC) on IBM Cloud.",
      includes: [
        "A resource group for cloud services and for each VPC, and Power Virtual Servers",
        "A management and workload VPC connected by a transit gateway",
        "One network interface for Power VS with cloud connections to a transit gateway",
        "One AIX Power Virtual Server instances and needed volumes for Oracle instance implemententation",
        "A flow log collector for each VPC",
        "Object storage instances for flow logs and activity tracker",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "Virtual Private endpoints for Cloud Object storage in each VPC",
        "An example Virtual Server instance deployment in the management and workload VPCs",
        "A VPN Gateway in the Management VPC",
      ],
    },
    "Power VS Quick Start": {
      template: powerVsQuickStart,
      name: "Power VS Quick Start",
      patternDocText:
        "This template initializes an environment with one VPC and a Power VS workspace to get started with using Power VS on IBM Cloud.",
      includes: [
        "A resource group for cloud services and for infrastructure management",
        "A management VPC and a transit gateway",
        "A VPC flow log collector",
        "A VPN Gateway in the Management VPC",
        "An example Virtual Server instance deployment in the management VPC",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "Object storage instances for flow logs and Activity Tracker",
        "A Flow Logs collector for VPC",
        "Virtual Private endpoints for Cloud Object storage in the management VPC",
        "An empty Power VS workspace",
      ],
    },
    "Power VS POC Quick Start": {
      template: powerVsPocQuickStart,
      name: "Power VS POC Quick Start",
      patternDocText:
        "This template initializes an environment with one VPC and a Power VS workspace to get started with using Power VS on IBM Cloud,",
      includes: [
        "A resource group for cloud services and for infrastructure management",
        "A management VPC and a transit gateway",
        "A VPC flow log collector",
        "A VPN Gateway in the Management VPC",
        "An example Virtual Server instance deployment in the management VPC",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "A Cloud Object Storage Instance",
        "A Flow Logs collector for VPC",
        "Virtual Private endpoints for Cloud Object storage in the management VPC",
        "An Power VS workspace with an example AIX and IBMi instance",
      ],
    },
    "VPN as a Service": {
      template: vpnaas,
      name: "VPN as a Service",
      patternDocText:
        "This template creates a basic environment with required services to set up a VPN connection from VPC to Power VS on IBM Cloud.",
      includes: [
        "A resource group for cloud services and infrastructure management",
        "Encryption keys in either a Key Protect or Hyper Protect Crypto Services instance",
        "A Cloud Object Storage instance for Flow Logs",
        "A Secrets Manager instance",
        "A VPC and a transit gateway",
        "A VPC flow log collector",
        "A Power VS workspace with a cloud connection to the Transit Gateway",
        "A site-to-site VPN Gateway in the VPC",
        "A client-to-site VPN Server in the VPC",
      ],
    },
    "Empty Project": {
      template: emptyProject,
      name: "Empty Project",
      patternDocText:
        "This template allows users to start from scratch and create a fully customized environment with no presets.",
      includes: ["A resource group for CRAIG generated resources"],
    },
  },
  systemTypes: ["e880", "e980", "s922", "s1022"],
  sapProfiles: [
    "ush1-4x128",
    "ush1-4x256",
    "ush1-4x384",
    "ush1-4x512",
    "ush1-4x768",
    "bh1-16x1600",
    "bh1-20x2000",
    "bh1-22x2200",
    "bh1-25x2500",
    "bh1-30x3000",
    "bh1-35x3500",
    "bh1-40x4000",
    "bh1-50x5000",
    "bh1-60x6000",
    "bh1-70x7000",
    "bh1-80x8000",
    "bh1-100x10000",
    "bh1-120x12000",
    "bh1-140x14000",
    "ch1-60x3000",
    "ch1-70x3500",
    "ch1-80x4000",
    "ch1-100x5000",
    "ch1-120x6000",
    "ch1-140x7000",
    "mh1-8x1440",
    "mh1-10x1800",
    "mh1-12x2160",
    "mh1-16x2880",
    "mh1-20x3600",
    "mh1-22x3960",
    "mh1-25x4500",
    "mh1-30x5400",
    "mh1-35x6300",
    "mh1-40x7200",
    "mh1-50x9000",
    "mh1-60x10800",
    "mh1-70x12600",
    "mh1-80x14400",
    "umh-4x960",
    "umh-6x1440",
    "umh-8x1920",
    "umh-10x2400",
    "umh-12x2880",
    "umh-16x3840",
    "umh-20x4800",
    "umh-22x5280",
    "umh-25x6000",
    "umh-30x7200",
    "umh-35x8400",
    "umh-40x9600",
    "umh-50x12000",
    "umh-60x14400",
  ],
  datacenters: [
    "syd04",
    "syd05",
    "eu-de-1",
    "eu-de-2",
    "lon04",
    "lon06",
    "us-east",
    "wdc06",
    "us-south",
    "dal10",
    "dal12",
    "tok04",
    "sao01",
    "tor01",
    "wdc07",
  ].sort(azsort),
};
