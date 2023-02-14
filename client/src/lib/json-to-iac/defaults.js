function newDefaultEdgeAcl() {
  return {
    "name": "edge-acl",
    "resource_group": "slz-edge-rg",
    "vpc": "edge",
    "rules": [
      {
        "acl": "edge-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
      {
        "acl": "edge-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-all-network-inbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
      {
        "acl": "edge-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "0.0.0.0/0",
        "direction": "outbound",
        "name": "allow-all-outbound",
        "source": "0.0.0.0/0",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
    ],
  };
}

function newDefaultF5ExternalAcl() {
  return {
    "name": "f5-external-acl",
    "vpc": "edge",
    "resource_group": "slz-edge-rg",
    "rules": [
      {
        "acl": "f5-external-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
      {
        "acl": "f5-external-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-all-network-inbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
      {
        "acl": "f5-external-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "0.0.0.0/0",
        "direction": "outbound",
        "name": "allow-all-outbound",
        "source": "0.0.0.0/0",
        "tcp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
      {
        "acl": "f5-external-acl",
        "vpc": "edge",
        "action": "allow",
        "destination": "10.0.0.0/8",
        "direction": "inbound",
        "name": "allow-f5-external-443-inbound",
        "source": "0.0.0.0/0",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
          "source_port_min": null,
          "source_port_max": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
          "source_port_min": null,
          "source_port_max": null,
        },
      },
    ],
  };
}

function newF5ManagementSg() {
  return {
    "vpc": "edge",
    "name": "f5-management-sg",
    "resource_group": "slz-edge-rg",
    "rules": [
      {
        "vpc": "edge",
        "sg": "f5-management-sg",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "direction": "inbound",
        "name": "allow-vpc-inbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-management-sg",
        "direction": "outbound",
        "name": "allow-vpc-outbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-management-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-53-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 53,
          "port_min": 53,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-management-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-80-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 80,
          "port_min": 80,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-management-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-443-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
    ],
  };
}

function newF5ExternalSg() {
  return {
    "name": "f5-external-sg",
    "resource_group": "slz-edge-rg",
    "vpc": "edge",
    "rules": [
      {
        "vpc": "edge",
        "sg": "f5-external-sg",
        "direction": "inbound",
        "name": "allow-inbound-443",
        "source": "0.0.0.0/0",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
    ],
  };
}

function newF5WorkloadSg() {
  return {
    "name": "f5-workload-sg",
    "resource_group": "slz-edge-rg",
    "vpc": "edge",
    "rules": [
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-1",
        "source": "10.10.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-2",
        "source": "10.20.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-3",
        "source": "10.30.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-4",
        "source": "10.40.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-5",
        "source": "10.50.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-workload-subnet-6",
        "source": "10.60.10.0/24",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "inbound",
        "name": "allow-vpc-inbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "outbound",
        "name": "allow-vpc-outbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-53-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 53,
          "port_min": 53,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-80-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 80,
          "port_min": 80,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-workload-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-443-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
    ],
  };
}

function newF5BastionSg() {
  return {
    "name": "f5-bastion-sg",
    "resource_group": "slz-edge-rg",
    "vpc": "edge",
    "rules": [
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "1-inbound-3023",
        "source": "10.5.80.0/24",
        "tcp": {
          "port_max": 3025,
          "port_min": 3023,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "1-inbound-3080",
        "source": "10.5.80.0/24",
        "tcp": {
          "port_max": 3080,
          "port_min": 3080,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "2-inbound-3023",
        "source": "10.6.80.0/24",
        "tcp": {
          "port_max": 3025,
          "port_min": 3023,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "2-inbound-3080",
        "source": "10.6.80.0/24",
        "tcp": {
          "port_max": 3080,
          "port_min": 3080,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "3-inbound-3023",
        "source": "10.7.80.0/24",
        "tcp": {
          "port_max": 3025,
          "port_min": 3023,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "f5-bastion-sg",
        "direction": "inbound",
        "name": "3-inbound-3080",
        "source": "10.7.80.0/24",
        "tcp": {
          "port_max": 3080,
          "port_min": 3080,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
    ],
  };
}

function newF5VpeSg() {
  return {
    "name": "edge-vpe-sg",
    "resource_group": "slz-edge-rg",
    "vpc": "edge",
    "rules": [
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "inbound",
        "name": "allow-ibm-inbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "inbound",
        "name": "allow-vpc-inbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "outbound",
        "name": "allow-vpc-outbound",
        "source": "10.0.0.0/8",
        "tcp": {
          "port_max": null,
          "port_min": null,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-53-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 53,
          "port_min": 53,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-80-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 80,
          "port_min": 80,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
      {
        "vpc": "edge",
        "sg": "edge-vpe-sg",
        "direction": "outbound",
        "name": "allow-ibm-tcp-443-outbound",
        "source": "161.26.0.0/16",
        "tcp": {
          "port_max": 443,
          "port_min": 443,
        },
        "icmp": {
          "code": null,
          "type": null,
        },
        "udp": {
          "port_max": null,
          "port_min": null,
        },
      },
    ],
  };
}

module.exports = {
  newDefaultEdgeAcl,
  newDefaultF5ExternalAcl,
  newF5BastionSg,
  newF5ExternalSg,
  newF5ManagementSg,
  newF5WorkloadSg,
  newF5VpeSg,
};
