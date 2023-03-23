function newDefaultKms() {
  return [
    {
      name: "kms",
      resource_group: "service-rg",
      use_hs_crypto: false,
      authorize_vpc_reader_role: true,
      use_data: false,
      keys: [
        {
          key_ring: "ring",
          name: "key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        },
        {
          key_ring: "ring",
          name: "atracker-key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        },
        {
          key_ring: "ring",
          name: "vsi-volume-key",
          root_key: true,
          force_delete: true,
          endpoint: "public",
          rotation: 12,
          dual_auth_delete: false
        }
      ]
    }
  ];
}

/**
 * create new default cos object
 */
function newDefaultCos() {
  return [
    {
      buckets: [
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "atracker-bucket",
          storage_class: "standard",
          use_random_suffix: true
        }
      ],
      keys: [
        {
          name: "cos-bind-key",
          role: "Writer",
          enable_hmac: false,
          use_random_suffix: true
        }
      ],
      name: "atracker-cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      use_random_suffix: true,
      kms: "kms"
    },
    {
      buckets: [
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "key",
          name: "management-bucket",
          storage_class: "standard",
          use_random_suffix: true
        },
        {
          endpoint: "public",
          force_delete: true,
          kms_key: "key",
          name: "workload-bucket",
          storage_class: "standard",
          use_random_suffix: true
        }
      ],
      use_random_suffix: true,
      keys: [],
      name: "cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      kms: "kms"
    }
  ];
}

function newDefaultVpcs() {
  return [
    {
      cos: "cos",
      bucket: "management-bucket",
      name: "management",
      resource_group: "management-rg",
      classic_access: false,
      manual_address_prefix_management: true,
      default_network_acl_name: null,
      default_security_group_name: null,
      default_routing_table_name: null,
      publicGateways: [],
      address_prefixes: [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1"
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2"
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.10.0/24",
          name: "vsi-zone-3"
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1"
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2"
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vpe-zone-3"
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1"
        }
      ],
      subnets: [
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.10.0/24",
          name: "vsi-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.30.0/24",
          name: "vpn-zone-1",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.10.0/24",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.10.0/24",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.10.20.0/24",
          name: "vpe-zone-1",
          resource_group: "management-rg",
          network_acl: "management",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.30.20.0/24",
          name: "vpe-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        }
      ],
      public_gateways: [],
      acls: [
        {
          resource_group: "management-rg",
          name: "management",
          vpc: "management",
          rules: [
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null
              },
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
              }
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null
              },
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
              }
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              acl: "management",
              vpc: "management",
              icmp: {
                type: null,
                code: null
              },
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
              }
            }
          ]
        }
      ]
    },
    {
      cos: "cos",
      bucket: "workload-bucket",
      name: "workload",
      resource_group: "workload-rg",
      classic_access: false,
      manual_address_prefix_management: true,
      default_network_acl_name: null,
      default_security_group_name: null,
      default_routing_table_name: null,
      publicGateways: [],
      address_prefixes: [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.10.0/24",
          name: "vsi-zone-1"
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.10.0/24",
          name: "vsi-zone-2"
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.10.0/24",
          name: "vsi-zone-3"
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.20.0/24",
          name: "vpe-zone-1"
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.20.0/24",
          name: "vpe-zone-2"
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.20.0/24",
          name: "vpe-zone-3"
        }
      ],
      subnets: [
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.10.0/24",
          name: "vsi-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.10.0/24",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.10.0/24",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.40.20.0/24",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.50.20.0/24",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.20.0/24",
          name: "vpe-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        }
      ],
      public_gateways: [],
      acls: [
        {
          resource_group: "workload-rg",
          name: "workload",
          vpc: "workload",
          rules: [
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-ibm-inbound",
              source: "161.26.0.0/16",
              acl: "workload",
              vpc: "workload",
              icmp: {
                type: null,
                code: null
              },
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
              }
            },
            {
              action: "allow",
              destination: "10.0.0.0/8",
              direction: "inbound",
              name: "allow-all-network-inbound",
              source: "10.0.0.0/8",
              acl: "workload",
              vpc: "workload",
              icmp: {
                type: null,
                code: null
              },
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
              }
            },
            {
              action: "allow",
              destination: "0.0.0.0/0",
              direction: "outbound",
              name: "allow-all-outbound",
              source: "0.0.0.0/0",
              acl: "workload",
              vpc: "workload",
              icmp: {
                type: null,
                code: null
              },
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
              }
            }
          ]
        }
      ]
    }
  ];
}

function newDefaultVpeSecurityGroups() {
  return [
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
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vpe",
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vpe",
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        }
      ]
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
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "workload",
          sg: "workload-vpe",
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "workload",
          sg: "workload-vpe",
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "workload",
          sg: "workload-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "workload",
          sg: "workload-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "workload",
          sg: "workload-vpe",
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        }
      ]
    }
  ];
}

function newDefaultTg() {
  return {
    name: "transit-gateway",
    resource_group: "service-rg",
    global: false,
    connections: [
      {
        tgw: "transit-gateway",
        vpc: "management"
      },
      {
        tgw: "transit-gateway",
        vpc: "workload"
      }
    ]
  };
}

function newDefaultWorkloadCluster() {
  return {
    kms: "slz-kms",
    cos: "cos",
    entitlement: "cloud_pak",
    type: "openshift",
    kube_version: "default",
    flavor: "bx2.16x64",
    name: "workload-cluster",
    resource_group: "workload-rg",
    encryption_key: "roks-key",
    subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    update_all_workers: false,
    vpc: "workload",
    worker_pools: [
      {
        entitlement: "cloud_pak",
        cluster: "workload-cluster",
        flavor: "bx2.16x64",
        name: "logging-worker-pool",
        resource_group: "workload-rg",
        subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
        vpc: "workload",
        workers_per_subnet: 2
      }
    ],
    workers_per_subnet: 2,
    private_endpoint: true
  };
}

function newDefaultManagementServer() {
  return {
    kms: "kms",
    encryption_key: "vsi-volume-key",
    image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
    profile: "cx2-4x8",
    name: "management-server",
    security_groups: ["management-vsi"],
    ssh_keys: ["ssh-key"],
    subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
    vpc: "management",
    vsi_per_subnet: 2,
    resource_group: "management-rg",
    override_vsi_name: null,
    user_data: "",
    network_interfaces: [],
    volumes: []
  };
}

function newDefaultVpe() {
  return [
    {
      name: "management-cos",
      service: "cos",
      vpc: "management",
      resource_group: "management-rg",
      security_groups: ["management-vpe"],
      subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"]
    },
    {
      name: "workload-cos",
      service: "cos",
      vpc: "workload",
      resource_group: "workload-rg",
      security_groups: ["workload-vpe"],
      subnets: ["vpe-zone-1", "vpe-zone-2", "vpe-zone-3"]
    }
  ];
}

// tiers by zone use function to prevent update in place
const firewallTiers = {
  "full-tunnel": () => {
    return ["f5-bastion", "f5-external", "f5-management"];
  },
  waf: () => {
    return ["f5-external", "f5-management", "f5-workload"];
  },
  "vpn-and-waf": () => {
    return ["f5-bastion", "f5-external", "f5-management", "f5-workload"];
  }
};

function defaultSecurityGroups() {
  return [
    {
      name: "management-vpe",
      resource_group: "management-rg",
      rules: [
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "management-vpe",
          vpc: "management",
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ],
      vpc: "management"
    },
    {
      name: "workload-vpe",
      resource_group: "workload-rg",
      rules: [
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "inbound",
          name: "allow-ibm-inbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        },
        {
          sg: "workload-vpe",
          vpc: "workload",
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          icmp: {
            code: null,
            type: null
          },
          udp: {
            port_max: null,
            port_min: null
          }
        }
      ],
      vpc: "workload"
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
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vsi",
          direction: "inbound",
          name: "allow-vpc-inbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vsi",
          direction: "outbound",
          name: "allow-vpc-outbound",
          source: "10.0.0.0/8",
          tcp: {
            port_max: null,
            port_min: null
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vsi",
          direction: "outbound",
          name: "allow-ibm-tcp-53-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 53,
            port_min: 53
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vsi",
          direction: "outbound",
          name: "allow-ibm-tcp-80-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 80,
            port_min: 80
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        },
        {
          vpc: "management",
          sg: "management-vsi",
          direction: "outbound",
          name: "allow-ibm-tcp-443-outbound",
          source: "161.26.0.0/16",
          tcp: {
            port_max: 443,
            port_min: 443
          },
          udp: {
            port_max: null,
            port_min: null
          },
          icmp: {
            type: null,
            code: null
          }
        }
      ]
    }
  ];
}

function newF5ManagementSg() {
  return {
    name: "f5-management-sg",
    resource_group: "edge-rg",
    rules: [
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-management-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc: "edge"
  };
}

function newF5ExternalSg() {
  return {
    name: "f5-external-sg",
    resource_group: "edge-rg",
    rules: [
      {
        sg: "f5-external-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-inbound-443",
        source: "0.0.0.0/0",

        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc: "edge"
  };
}

function newF5WorkloadSg() {
  return {
    name: "f5-workload-sg",
    resource_group: "edge-rg",
    rules: [
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-1",
        source: "10.10.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-2",
        source: "10.20.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-3",
        source: "10.30.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-4",
        source: "10.40.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-5",
        source: "10.50.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-workload-subnet-6",
        source: "10.60.10.0/24",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-workload-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc: "edge"
  };
}

function newF5BastionSg() {
  return {
    name: "f5-bastion-sg",
    resource_group: "edge-rg",
    rules: [
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "1-inbound-3023",
        source: "10.5.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "1-inbound-3080",
        source: "10.5.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "2-inbound-3023",
        source: "10.6.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "2-inbound-3080",
        source: "10.6.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "3-inbound-3023",
        source: "10.7.80.0/24",
        tcp: {
          port_max: 3025,
          port_min: 3023
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "f5-bastion-sg",
        vpc: "edge",
        direction: "inbound",
        name: "3-inbound-3080",
        source: "10.7.80.0/24",
        tcp: {
          port_max: 3080,
          port_min: 3080
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc: "edge"
  };
}

function newF5VpeSg() {
  return {
    name: "edge-vpe-sg",
    resource_group: "edge-rg",
    rules: [
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "inbound",
        name: "allow-vpc-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-vpc-outbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-53-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 53,
          port_min: 53
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-80-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 80,
          port_min: 80
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      },
      {
        sg: "edge-vpe-sg",
        vpc: "edge",
        direction: "outbound",
        name: "allow-ibm-tcp-443-outbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: 443,
          port_min: 443
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null
        }
      }
    ],
    vpc: "edge"
  };
}

function newDefaultF5ExternalAcl() {
  return {
    name: "f5-external-acl",
    vpc: "edge",
    resource_group: "edge-rg",
    rules: [
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        acl: "f5-external-acl",
        vpc: "edge",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
        acl: "f5-external-acl",
        vpc: "edge",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        acl: "f5-external-acl",
        vpc: "edge",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-f5-external-443-inbound",
        source: "0.0.0.0/0",
        acl: "f5-external-acl",
        vpc: "edge",
        tcp: {
          port_max: 443,
          port_min: 443,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    ]
  };
}
function newDefaultF5ExternalAclManagement() {
  return {
    name: "f5-external-acl",
    vpc: "management",
    resource_group: "management-rg",
    rules: [
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        acl: "f5-external-acl",
        vpc: "management",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
        acl: "f5-external-acl",
        vpc: "management",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        acl: "f5-external-acl",
        vpc: "management",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-f5-external-443-inbound",
        source: "0.0.0.0/0",
        acl: "f5-external-acl",
        vpc: "management",
        tcp: {
          port_max: 443,
          port_min: 443,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    ]
  };
}

function newDefaultEdgeAcl() {
  return {
    name: "edge-acl",
    vpc: "edge",
    resource_group: "edge-rg",
    rules: [
      {
        acl: "edge-acl",
        vpc: "edge",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-ibm-inbound",
        source: "161.26.0.0/16",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        acl: "edge-acl",
        vpc: "edge",
        action: "allow",
        destination: "10.0.0.0/8",
        direction: "inbound",
        name: "allow-all-network-inbound",
        source: "10.0.0.0/8",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      },
      {
        acl: "edge-acl",
        vpc: "edge",
        action: "allow",
        destination: "0.0.0.0/0",
        direction: "outbound",
        name: "allow-all-outbound",
        source: "0.0.0.0/0",
        tcp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        },
        icmp: {
          code: null,
          type: null
        },
        udp: {
          port_max: null,
          port_min: null,
          source_port_min: null,
          source_port_max: null
        }
      }
    ]
  };
}

module.exports = {
  newDefaultKms,
  newDefaultCos,
  newDefaultVpcs,
  newDefaultVpeSecurityGroups,
  newDefaultTg,
  newDefaultWorkloadCluster,
  newDefaultVpe,
  newDefaultManagementServer,
  newDefaultEdgeAcl,
  newDefaultF5ExternalAcl,
  newDefaultF5ExternalAclManagement,
  newF5BastionSg,
  newF5ExternalSg,
  newF5VpeSg,
  newF5ManagementSg,
  newF5WorkloadSg,
  firewallTiers,
  defaultSecurityGroups
};
