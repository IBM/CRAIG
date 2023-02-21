const { assert } = require("chai");
const {
  formatVsi,
  formatVsiImage,
  vsiTf,
  formatLoadBalancer,
  lbTf,
} = require("../../client/src/lib/json-to-iac/vsi");
const slzNetwork = require("../data-files/slz-network.json");

describe("virtual server", () => {
  describe("formatVsi", () => {
    it("should correctly format vsi", () => {
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format vsi with user data", () => {
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
          user_data: '"test-user-data"',
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]
  user_data      = "test-user-data"

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format vsi with user data and storage volume", () => {
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg"],
          ssh_keys: ["slz-ssh-key"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
          user_data: '"test-user-data"',
          volumes: [
            {
              name: "block-storage-1",
              zone: 1,
              profile: "custom",
              capacity: 200,
              iops: 1000,
              encryption_key: "slz-vsi-volume-key",
            },
          ],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]
  user_data      = "test-user-data"

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }

  volumes = [
    ibm_is_volume.management_vpc_management_server_vsi_1_1_block_storage_1.id
  ]
}

resource "ibm_is_volume" "management_vpc_management_server_vsi_1_1_block_storage_1" {
  name           = "slz-management-management-server-vsi-zone-1-1-block-storage-1"
  profile        = "custom"
  zone           = "us-south-1"
  iops           = 1000
  capacity       = 200
  encryption_key = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  tags           = ["slz","landing-zone"]
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format vsi with multiple keys and security groups and ssh key from data", () => {
      slzNetwork.ssh_keys.push({
        name: "slz-ssh-key2",
        use_data: true,
      });
      let actualData = formatVsi(
        {
          kms: "slz-kms",
          encryption_key: "slz-vsi-volume-key",
          image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
          profile: "cx2-4x8",
          name: "management-server",
          security_groups: ["management-vpe-sg", "management-vpe-sg2"],
          ssh_keys: ["slz-ssh-key", "slz-ssh-key2"],
          subnet: "vsi-zone-1",
          vpc: "management",
          index: 1,
          resource_group: "slz-management-rg",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id,
    data.ibm_is_ssh_key.slz_ssh_key2.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id,
      ibm_is_security_group.management_vpc_management_vpe_sg2_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatVsiImage", () => {
    it("it should create a vsi image data block", () => {
      let actualData = formatVsiImage("ibm-ubuntu-18-04-6-minimal-amd64-2");
      let expectedData = `
data "ibm_is_image" "ibm_ubuntu_18_04_6_minimal_amd64_2" {
  name = "ibm-ubuntu-18-04-6-minimal-amd64-2"
}
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("formatLoadBalancer", () => {
    it("should correctly format load balancer", () => {
      let actualData = formatLoadBalancer(
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe-sg"],
          resource_group: "slz-management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "app_cookie",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
        {
          _options: {
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_prefix: true,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
          vsi: [
            {
              kms: "slz-kms",
              encryption_key: "slz-vsi-volume-key",
              image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
              profile: "cx2-4x8",
              name: "management-server",
              security_groups: ["management-vpe-sg"],
              ssh_keys: ["slz-ssh-key"],
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "management",
              vsi_per_subnet: 2,
              resource_group: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData =
        `
resource "ibm_is_lb" "lb_1_load_balancer" {
  name            = "iac-lb-1-lb"
  type            = "public"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]

  security_groups = [
    ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  ]

  subnets = [
    ibm_is_subnet.management_vsi_zone_1.id,
    ibm_is_subnet.management_vsi_zone_2.id,
    ibm_is_subnet.management_vsi_zone_3.id
  ]
}` +
        `

resource "ibm_is_lb_pool" "lb_1_load_balancer_pool" {
  lb                                  = ibm_is_lb.lb_1_load_balancer.id
  name                                = "iac-lb-1-lb-pool"
  algorithm                           = "round_robin"
  protocol                            = "tcp"
  health_delay                        = 60
  health_retries                      = 5
  health_timeout                      = 30
  health_type                         = "https"
  proxy_protocol                      = "v1"
  session_persistence_type            = "app_cookie"
  session_persistence_app_cookie_name = "cookie1"
}
` +
        `
resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_listener" "lb_1_listener" {
  lb               = ibm_is_lb.lb_1_load_balancer.id
  default_pool     = ibm_is_lb_pool.lb_1_load_balancer_pool.id
  port             = 443
  protocol         = "https"
  connection_limit = 2

  depends_on = [
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member.id
  ]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
    it("should correctly format load balancer without app_cookie", () => {
      let actualData = formatLoadBalancer(
        {
          name: "lb-1",
          vpc: "management",
          type: "public",
          subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
          vsi_per_subnet: 2,
          security_groups: ["management-vpe-sg"],
          resource_group: "slz-management-rg",
          algorithm: "round_robin",
          protocol: "tcp",
          health_delay: 60,
          health_retries: 5,
          health_timeout: 30,
          health_type: "https",
          proxy_protocol: "v1",
          session_persistence_type: "source_ip",
          session_persistence_app_cookie_name: "cookie1",
          port: 80,
          target_vsi: ["management-server"],
          listener_port: 443,
          listener_protocol: "https",
          connection_limit: 2,
        },
        {
          _options: {
            tags: ["hello", "world"],
            prefix: "iac",
          },
          resource_groups: [
            {
              use_prefix: true,
              name: "slz-service-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-management-rg",
              use_data: false,
            },
            {
              use_prefix: true,
              name: "slz-workload-rg",
              use_data: false,
            },
          ],
          vsi: [
            {
              kms: "slz-kms",
              encryption_key: "slz-vsi-volume-key",
              image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
              profile: "cx2-4x8",
              name: "management-server",
              security_groups: ["management-vpe-sg"],
              ssh_keys: ["slz-ssh-key"],
              subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
              vpc: "management",
              vsi_per_subnet: 2,
              resource_group: "slz-management-rg",
            },
          ],
        }
      );
      let expectedData =
        `
resource "ibm_is_lb" "lb_1_load_balancer" {
  name            = "iac-lb-1-lb"
  type            = "public"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]

  security_groups = [
    ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  ]

  subnets = [
    ibm_is_subnet.management_vsi_zone_1.id,
    ibm_is_subnet.management_vsi_zone_2.id,
    ibm_is_subnet.management_vsi_zone_3.id
  ]
}` +
        `

resource "ibm_is_lb_pool" "lb_1_load_balancer_pool" {
  lb                       = ibm_is_lb.lb_1_load_balancer.id
  name                     = "iac-lb-1-lb-pool"
  algorithm                = "round_robin"
  protocol                 = "tcp"
  health_delay             = 60
  health_retries           = 5
  health_timeout           = 30
  health_type              = "https"
  proxy_protocol           = "v1"
  session_persistence_type = "source_ip"
}
` +
        `
resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_listener" "lb_1_listener" {
  lb               = ibm_is_lb.lb_1_load_balancer.id
  default_pool     = ibm_is_lb_pool.lb_1_load_balancer_pool.id
  port             = 443
  protocol         = "https"
  connection_limit = 2

  depends_on = [
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member.id
  ]
}
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("lbTf", () => {
    it("should create load balancer terraform", () => {
      let actualData = lbTf({
        _options: {
          tags: ["hello", "world"],
          prefix: "iac",
        },
        resource_groups: [
          {
            use_prefix: true,
            name: "slz-service-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "slz-management-rg",
            use_data: false,
          },
          {
            use_prefix: true,
            name: "slz-workload-rg",
            use_data: false,
          },
        ],
        vsi: [
          {
            kms: "slz-kms",
            encryption_key: "slz-vsi-volume-key",
            image: "ibm-ubuntu-18-04-6-minimal-amd64-2",
            profile: "cx2-4x8",
            name: "management-server",
            security_groups: ["management-vpe-sg"],
            ssh_keys: ["slz-ssh-key"],
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vpc: "management",
            vsi_per_subnet: 2,
            resource_group: "slz-management-rg",
          },
        ],
        load_balancers: [
          {
            name: "lb-1",
            vpc: "management",
            type: "public",
            subnets: ["vsi-zone-1", "vsi-zone-2", "vsi-zone-3"],
            vsi_per_subnet: 2,
            security_groups: ["management-vpe-sg"],
            resource_group: "slz-management-rg",
            algorithm: "round_robin",
            protocol: "tcp",
            health_delay: 60,
            health_retries: 5,
            health_timeout: 30,
            health_type: "https",
            proxy_protocol: "v1",
            session_persistence_type: "app_cookie",
            session_persistence_app_cookie_name: "cookie1",
            port: 80,
            target_vsi: ["management-server"],
            listener_port: 443,
            listener_protocol: "https",
            connection_limit: 2,
          },
        ],
      });
let expectedData =
        `##############################################################################
# Lb 1 Load Balancer
##############################################################################

resource "ibm_is_lb" "lb_1_load_balancer" {
  name            = "iac-lb-1-lb"
  type            = "public"
  resource_group  = ibm_resource_group.slz_management_rg.id
  tags            = ["hello","world"]

  security_groups = [
    ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
  ]

  subnets = [
    ibm_is_subnet.management_vsi_zone_1.id,
    ibm_is_subnet.management_vsi_zone_2.id,
    ibm_is_subnet.management_vsi_zone_3.id
  ]
}` +
        `

resource "ibm_is_lb_pool" "lb_1_load_balancer_pool" {
  lb                                  = ibm_is_lb.lb_1_load_balancer.id
  name                                = "iac-lb-1-lb-pool"
  algorithm                           = "round_robin"
  protocol                            = "tcp"
  health_delay                        = 60
  health_retries                      = 5
  health_timeout                      = 30
  health_type                         = "https"
  proxy_protocol                      = "v1"
  session_persistence_type            = "app_cookie"
  session_persistence_app_cookie_name = "cookie1"
}
` +
        `
resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_1_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_2_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_1.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_pool_member" "lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member" {
  port           = 80
  lb             = ibm_is_lb.lb_1_load_balancer.id
  pool           = element(split("/", ibm_is_lb_pool.lb_1_load_balancer_pool.id), 1)
  target_address = ibm_is_instance.management_vpc_management_server_vsi_3_2.primary_network_interface.0.primary_ipv4_address
}

resource "ibm_is_lb_listener" "lb_1_listener" {
  lb               = ibm_is_lb.lb_1_load_balancer.id
  default_pool     = ibm_is_lb_pool.lb_1_load_balancer_pool.id
  port             = 443
  protocol         = "https"
  connection_limit = 2

  depends_on = [
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_1_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_2_2_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_1_pool_member.id,
    ibm_is_lb_pool_member.lb_1_management_server_management_vpc_management_server_vsi_3_2_pool_member.id
  ]
}

##############################################################################
`;

      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
  describe("vsiTf", () => {
    it("should create vsi terraform", () => {
      let actualData = vsiTf(slzNetwork);
      let expectedData = `##############################################################################
# Image Data Sources
##############################################################################

data "ibm_is_image" "ibm_ubuntu_18_04_6_minimal_amd64_2" {
  name = "ibm-ubuntu-18-04-6-minimal-amd64-2"
}

##############################################################################

##############################################################################
# Management VPC Management Server Deployment
##############################################################################

resource "ibm_is_instance" "management_vpc_management_server_vsi_1_1" {
  name           = "slz-management-management-server-vsi-zone-1-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_1_2" {
  name           = "slz-management-management-server-vsi-zone-1-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-1"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_1.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_2_1" {
  name           = "slz-management-management-server-vsi-zone-2-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-2"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_2.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_2_2" {
  name           = "slz-management-management-server-vsi-zone-2-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-2"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_2.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_3_1" {
  name           = "slz-management-management-server-vsi-zone-3-1"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-3"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_3.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

resource "ibm_is_instance" "management_vpc_management_server_vsi_3_2" {
  name           = "slz-management-management-server-vsi-zone-3-2"
  image          = data.ibm_is_image.ibm_ubuntu_18_04_6_minimal_amd64_2.id
  profile        = "cx2-4x8"
  resource_group = ibm_resource_group.slz_management_rg.id
  vpc            = ibm_is_vpc.management_vpc.id
  zone           = "us-south-3"
  tags           = ["slz","landing-zone"]

  keys = [
    ibm_is_ssh_key.slz_ssh_key.id
  ]

  primary_network_interface {
    subnet          = ibm_is_subnet.management_vsi_zone_3.id
    security_groups = [
      ibm_is_security_group.management_vpc_management_vpe_sg_sg.id
    ]
  }

  boot_volume {
    encryption = ibm_kms_key.slz_kms_slz_vsi_volume_key_key.key_id
  }
}

##############################################################################
`;
      assert.deepEqual(
        actualData,
        expectedData,
        "it should return correct data"
      );
    });
  });
});
