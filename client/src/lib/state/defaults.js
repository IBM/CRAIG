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
          endpoint_type: "public",
          force_delete: true,
          kms_key: "atracker-key",
          name: "atracker-bucket",
          storage_class: "standard"
        }
      ],
      keys: [
        {
          name: "cos-bind-key",
          role: "Writer",
          enable_HMAC: false
        }
      ],
      name: "atracker-cos",
      plan: "standard",
      resource_group: "service-rg",
      use_data: false,
      random_suffix: true,
      kms: "kms"
    },
    {
      buckets: [
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "key",
          name: "management-bucket",
          storage_class: "standard"
        },
        {
          endpoint_type: "public",
          force_delete: true,
          kms_key: "key",
          name: "workload-bucket",
          storage_class: "standard"
        }
      ],
      random_suffix: true,
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
          cidr: "10.10.20.0/24",
          name: "vsi-zone-2"
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.10.30.0/24",
          name: "vsi-zone-3"
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.20.10.0/24",
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
          cidr: "10.20.30.0/24",
          name: "vpe-zone-3"
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.30.10.0/24",
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
          cidr: "10.10.20.0/24",
          name: "vsi-zone-2",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 3,
          cidr: "10.10.30.0/24",
          name: "vsi-zone-3",
          network_acl: "management",
          resource_group: "management-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "management",
          zone: 1,
          cidr: "10.20.10.0/24",
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
          cidr: "10.20.30.0/24",
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
          cidr: "10.50.20.0/24",
          name: "vsi-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.60.30.0/24",
          name: "vsi-zone-3",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 1,
          cidr: "10.20.10.0/24",
          name: "vpe-zone-1",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 2,
          cidr: "10.20.20.0/24",
          name: "vpe-zone-2",
          network_acl: "workload",
          resource_group: "workload-rg",
          public_gateway: false,
          has_prefix: true
        },
        {
          vpc: "workload",
          zone: 3,
          cidr: "10.20.30.0/24",
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

function newVpc() {
  return {
    cos: null,
    bucket: null,
    name: null,
    resource_group: null,
    classic_access: false,
    manual_address_prefix_management: false,
    default_network_acl_name: null,
    default_security_group_name: null,
    default_routing_table_name: null,
    address_prefixes: [
      {
        vpc: null,
        zone: 1,
        cidr: "10.10.10.0/24",
        name: "vsi-zone-1"
      },
      {
        vpc: null,
        zone: 2,
        cidr: "10.10.20.0/24",
        name: "vsi-zone-2"
      },
      {
        vpc: null,
        zone: 3,
        cidr: "10.10.30.0/24",
        name: "vsi-zone-3"
      },
      {
        vpc: null,
        zone: 1,
        cidr: "10.20.10.0/24",
        name: "vpe-zone-1"
      },
      {
        vpc: null,
        zone: 2,
        cidr: "10.20.20.0/24",
        name: "vpe-zone-2"
      },
      {
        vpc: null,
        zone: 3,
        cidr: "10.20.30.0/24",
        name: "vpe-zone-3"
      },
      {
        vpc: null,
        zone: 1,
        cidr: "10.30.10.0/24",
        name: "vpn-zone-1"
      }
    ],
    subnets: [
      {
        vpc: null,
        zone: 1,
        cidr: "10.10.10.0/24",
        name: "vsi-zone-1",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 1,
        cidr: "10.10.30.0/24",
        name: "vpn-zone-1",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 2,
        cidr: "10.10.20.0/24",
        name: "vsi-zone-2",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 3,
        cidr: "10.10.30.0/24",
        name: "vsi-zone-3",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 1,
        cidr: "10.20.10.0/24",
        name: "vpe-zone-1",
        resource_group: "management-rg",
        network_acl: null,
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 2,
        cidr: "10.20.20.0/24",
        name: "vpe-zone-2",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      },
      {
        vpc: null,
        zone: 3,
        cidr: "10.20.30.0/24",
        name: "vpe-zone-3",
        network_acl: null,
        resource_group: "management-rg",
        public_gateway: false,
        has_prefix: true
      }
    ],
    public_gateways: [],
    acls: [
      {
        resource_group: "management-rg",
        name: null,
        vpc: null,
        rules: [
          {
            action: "allow",
            destination: "10.0.0.0/8",
            direction: "inbound",
            name: "allow-ibm-inbound",
            source: "161.26.0.0/16",
            acl: null,
            vpc: null,
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
            acl: null,
            vpc: null,
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
            acl: null,
            vpc: null,
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
  };
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

module.exports = {
  newDefaultKms,
  newDefaultCos,
  newDefaultVpcs,
  newVpc,
  newDefaultVpeSecurityGroups
};
