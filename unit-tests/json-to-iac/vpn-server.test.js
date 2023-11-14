const { assert } = require("chai");
const slzNetwork = require("../data-files/slz-network.json");
const {
  vpnServerTf,
  formatVpnServer,
  formatVpnServerRoute,
} = require("../../client/src/lib/json-to-iac/vpn-server");

describe("vpn server", () => {
  describe("ibmIsVpnServer", () => {
    it("should return correct tf for vpn server using certificate", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method        = "certificate"
    client_ca_crn = "hij"
  }
  client_dns_server_ips = [
    "optional"
  ]
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using certificate with additional address prefixes", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
          additional_prefixes: ["127.0.0.1"],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method        = "certificate"
    client_ca_crn = "hij"
  }
  client_dns_server_ips = [
    "optional"
  ]
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using certificate and no port", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: "",
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method        = "certificate"
    client_ca_crn = "hij"
  }
  client_dns_server_ips = [
    "optional"
  ]
  port                   = null
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using username", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "username",
          identity_provider: "iam",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method            = "username"
    identity_provider = "iam"
  }
  client_dns_server_ips = [
    "optional"
  ]
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using username with no optional fields", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "username",
          identity_provider: "iam",
          client_ip_pool: "xyz",
          client_dns_server_ips: "",
          client_idle_timeout: "",
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method            = "username"
    identity_provider = "iam"
  }
  client_dns_server_ips  = null
  client_idle_timeout    = null
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using bring your own certificate", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
          bring_your_own_cert: true,
          secrets_manager: "secrets-manager",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_sm_imported_certificate" "management_vpn_server_abc_imported_certificate" {
  instance_id  = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region       = var.region
  name         = "\${var.prefix}-management-abc-server-cert"
  description  = "Secret for \${var.prefix} Management Abc Server authentication"
  certificate  = var.management_vpn_server_abc_cert_pem
  private_key  = var.management_vpn_server_abc_private_key_pem
  intermediate = var.management_vpn_server_abc_intermediate_pem
}

resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = ibm_sm_imported_certificate.management_vpn_server_abc_imported_certificate.crn
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method        = "certificate"
    client_ca_crn = ibm_sm_imported_certificate.management_vpn_server_abc_imported_certificate.crn
  }
  client_dns_server_ips = [
    "optional"
  ]
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
    it("should return correct tf for vpn server using developer certificate", () => {
      let actualData = formatVpnServer(
        {
          name: "abc",
          certificate_crn: "xyz",
          method: "certificate",
          client_ca_crn: "hij",
          client_ip_pool: "xyz",
          client_dns_server_ips: "optional",
          client_idle_timeout: 2000,
          enable_split_tunneling: true,
          port: 255,
          protocol: "udp",
          resource_group: "slz-management-rg",
          security_groups: ["management-vpe-sg"],
          subnets: ["vsi-zone-1"],
          vpc: "management",
          routes: [],
          DANGER_developer_certificate: true,
          secrets_manager: "secrets-manager",
        },
        slzNetwork
      );
      let expectedData = `##############################################################################
# DANGER ZONE - DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION
##############################################################################

resource "tls_private_key" "DANGER_management_vpn_abc_ca_key" {
  algorithm = "RSA"
}

resource "tls_private_key" "DANGER_management_vpn_abc_client_key" {
  algorithm = "RSA"
}

resource "tls_private_key" "DANGER_management_vpn_abc_server_key" {
  algorithm = "RSA"
}

resource "tls_self_signed_cert" "DANGER_management_vpn_abc_ca_cert" {
  is_ca_certificate     = true
  private_key_pem       = tls_private_key.DANGER_management_vpn_abc_ca_key.private_key_pem
  validity_period_hours = 3 * 365 * 24
  subject {
    common_name  = "My Cert Authority"
    organization = "My, Inc"
  }
  allowed_uses = [
    "cert_signing",
    "crl_signing"
  ]
}

resource "tls_cert_request" "DANGER_management_vpn_abc_client_request" {
  private_key_pem = tls_private_key.DANGER_management_vpn_abc_client_key.private_key_pem
  subject {
    common_name  = "my.vpn.client"
    organization = "My, Inc"
  }
}

resource "tls_cert_request" "DANGER_management_vpn_abc_server_request" {
  private_key_pem = tls_private_key.DANGER_management_vpn_abc_server_key.private_key_pem
  subject {
    common_name  = "my.vpn.server"
    organization = "My, Inc"
  }
}

resource "tls_locally_signed_cert" "DANGER_management_vpn_abc_client_cert" {
  cert_request_pem      = tls_cert_request.DANGER_management_vpn_abc_client_request.cert_request_pem
  ca_private_key_pem    = tls_private_key.DANGER_management_vpn_abc_ca_key.private_key_pem
  ca_cert_pem           = tls_self_signed_cert.DANGER_management_vpn_abc_ca_cert.cert_pem
  validity_period_hours = 3 * 365 * 24
  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "client_auth"
  ]
}

resource "tls_locally_signed_cert" "DANGER_management_vpn_abc_server_cert" {
  cert_request_pem      = tls_cert_request.DANGER_management_vpn_abc_server_request.cert_request_pem
  ca_private_key_pem    = tls_private_key.DANGER_management_vpn_abc_ca_key.private_key_pem
  ca_cert_pem           = tls_self_signed_cert.DANGER_management_vpn_abc_ca_cert.cert_pem
  validity_period_hours = 3 * 365 * 24
  allowed_uses = [
    "key_encipherment",
    "digital_signature",
    "server_auth"
  ]
}

resource "ibm_sm_imported_certificate" "DANGER_management_vpn_server_abc_dev_cert" {
  instance_id  = ibm_resource_instance.secrets_manager_secrets_manager.guid
  region       = var.region
  name         = "\${var.prefix}-management-abc-server-dev-cert"
  description  = "DANGER - INSECURE - FOR DEVELOPMENT USE ONLY - Secret for \${var.prefix} Management Abc Server authentication"
  certificate  = tls_locally_signed_cert.DANGER_management_vpn_abc_server_cert.cert_pem
  private_key  = tls_private_key.DANGER_management_vpn_abc_server_key.private_key_pem
  intermediate = tls_self_signed_cert.DANGER_management_vpn_abc_ca_cert.cert_pem
}

##############################################################################

resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = ibm_sm_imported_certificate.DANGER_management_vpn_server_abc_dev_cert.crn
  client_idle_timeout    = 2000
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method        = "certificate"
    client_ca_crn = ibm_sm_imported_certificate.DANGER_management_vpn_server_abc_dev_cert.crn
  }
  client_dns_server_ips = [
    "optional"
  ]
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
  describe("ibmIsVpnServerRoute", () => {
    it("should return correct tf for vpn server route", () => {
      let actualData = formatVpnServerRoute(
        {
          name: "abc",
          vpc: "management",
          routes: [
            {
              name: "qwe",
              action: "translate",
              destination: "172.16.0.0/16",
            },
          ],
        },
        {
          name: "qwe",
          action: "translate",
          destination: "172.16.0.0/16",
        },
        slzNetwork
      );
      let expectedData = `
resource "ibm_is_vpn_server_route" "management_vpn_server_route_qwe" {
  name        = "\${var.prefix}-management-qwe-route"
  action      = "translate"
  destination = "172.16.0.0/16"
  vpn_server  = ibm_is_vpn_server.management_vpn_server_abc.id
}
`;
      assert.deepEqual(actualData, expectedData, "should return correct data");
    });
  });
  describe("vpnServerTf", () => {
    it("should return correct data when no servers", () => {
      assert.deepEqual(
        vpnServerTf({ vpn_servers: [] }),
        "",
        "it should return empty string"
      );
    });
    it("should return correct data when servers are present", () => {
      let expectedData = `##############################################################################
# VPN Servers
##############################################################################

resource "ibm_iam_authorization_policy" "vpn_to_secrets_manager_policy" {
  source_service_name  = "is"
  source_resource_type = "vpn-server"
  description          = "Allow VPN Server instance to read from Secrets Manager"
  target_service_name  = "secrets-manager"
  roles = [
    "SecretsReader"
  ]
}

resource "ibm_is_vpn_server" "management_vpn_server_abc" {
  certificate_crn        = "xyz"
  client_ip_pool         = "xyz"
  enable_split_tunneling = true
  name                   = "\${var.prefix}-management-abc-server"
  port                   = 255
  protocol               = "udp"
  resource_group         = ibm_resource_group.slz_management_rg.id
  client_authentication {
    method            = "username"
    identity_provider = "iam"
  }
  client_dns_server_ips  = null
  client_idle_timeout    = null
  subnets = [
    module.management_vpc.vsi_zone_1_id
  ]
  security_groups = [
    module.management_vpc.management_vpe_sg_id
  ]
}

resource "ibm_is_vpc_address_prefix" "management_vpn_abc_on_prem_127_0_0_1_5_prefix" {
  name = "\${var.prefix}-management-vpn-abc-on-prem-127-0-0-1-5"
  vpc  = module.management_vpc.id
  zone = "\${var.region}-1"
  cidr = "127.0.0.1/5"
}

##############################################################################
`;
      assert.deepEqual(
        vpnServerTf({
          vpn_servers: [
            {
              name: "abc",
              certificate_crn: "xyz",
              method: "username",
              identity_provider: "iam",
              client_ip_pool: "xyz",
              client_dns_server_ips: "",
              client_idle_timeout: "",
              enable_split_tunneling: true,
              zone: 1,
              port: 255,
              protocol: "udp",
              resource_group: "slz-management-rg",
              security_groups: ["management-vpe-sg"],
              subnets: ["vsi-zone-1"],
              vpc: "management",
              routes: [],
              additional_prefixes: ["127.0.0.1/5"],
            },
          ],
          _options: {
            prefix: "iac",
          },
          resource_groups: [
            {
              name: "slz-management-rg",
              use_prefix: false,
            },
          ],
        }),
        expectedData,
        "it should return empty string"
      );
    });
  });
});
