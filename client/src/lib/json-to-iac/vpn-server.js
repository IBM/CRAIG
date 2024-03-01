const {
  snakeCase,
  kebabCase,
  isNullOrEmptyString,
  titleCase,
  contains,
} = require("lazy-z");
const { rgIdRef, tfBlock, jsonToTfPrint, kebabName } = require("./utils");
const { formatAddressPrefix } = require("./vpc");
const { varDotRegion } = require("../constants");
/**
 * format vpn server
 * @param {Object} server
 * @param {string} server.name
 * @param {string} server.certificate_crn
 * @param {string} server.method
 * @param {string} server.client_ca_crn
 * @param {string} server.client_ip_pool
 * @param {string} server.client_dns_server_ips
 * @param {number} server.client_idle_timeout
 * @param {boolean} server.enable_split_tunneling
 * @param {number} server.port
 * @param {string} server.protocol
 * @param {string} server.resource_group
 * @param {Array<string>} server.security_groups
 * @param {Array<string>} server.subnets
 * @param {string} server.vpc
 * @param {Object} craig
 * @param {string} craig._options.prefix
 * @returns {Object} terraform formatted server
 */

function ibmIsVpnServer(server, craig) {
  let overrideCert =
    server.bring_your_own_cert || server.method === "byo"
      ? // reference for BYO certificate
        `\${ibm_sm_imported_certificate.${snakeCase(
          `${server.vpc} vpn server ${server.name}`
        )}_imported_certificate.crn}`
      : server.DANGER_developer_certificate || server.method === "INSECURE"
      ? // reference for auto generated developer certificate
        `\${ibm_sm_imported_certificate.DANGER_${snakeCase(
          `${server.vpc} vpn server ${server.name} dev cert`
        )}.crn}`
      : false;

  // vpn server data
  let serverData = {
    certificate_crn: overrideCert || server.certificate_crn,
    client_authentication: [
      {
        method: contains(["byo", "INSECURE"], server.method)
          ? "certificate"
          : server.method,
      },
    ],
    client_dns_server_ips: isNullOrEmptyString(server.client_dns_server_ips)
      ? null
      : server.client_dns_server_ips.split(","),
    client_idle_timeout: isNullOrEmptyString(server.client_idle_timeout)
      ? null
      : server.client_idle_timeout,
    client_ip_pool: server.client_ip_pool,
    enable_split_tunneling: server.enable_split_tunneling,
    name: kebabName([server.vpc, server.name, "server"]),
    port: isNullOrEmptyString(server.port) ? null : server.port,
    protocol: server.protocol,
    resource_group: rgIdRef(server.resource_group, craig),
    subnets: [],
    security_groups: [],
  };
  server.subnets.forEach((subnet) => {
    serverData["subnets"].push(
      `\${module.${snakeCase(server.vpc)}_vpc.${snakeCase(subnet)}_id}`
    );
  });
  server.security_groups.forEach((group) => {
    serverData["security_groups"].push(
      `\${module.${snakeCase(server.vpc)}_vpc.${snakeCase(group)}_id}`
    );
  });
  if (
    server.method === "certificate" ||
    contains(["byo", "INSECURE"], server.method)
  ) {
    serverData.client_authentication[0].client_ca_crn =
      overrideCert || server.client_ca_crn;
  } else {
    serverData.client_authentication[0].identity_provider = "iam";
  }
  return {
    name: snakeCase(`${server.vpc} vpn server ${server.name}`),
    data: serverData,
  };
}

/**
 * format vpn server
 * @param {Object} server
 * @param {string} server.name
 * @param {Object} route
 * @param {string} route.name
 * @param {string} route.action
 * @param {string} route.destination
 * @param {string} server.vpc
 * @returns {Object} terraform formatted server
 */
function ibmIsVpnServerRoute(server, route) {
  let routeData = {
    name: kebabName([server.vpc, route.name, "route"]),
    action: route.action,
    destination: route.destination,
    vpn_server: `\${ibm_is_vpn_server.${snakeCase(
      server.vpc
    )}_vpn_server_${snakeCase(server.name)}.id}`,
  };
  return {
    name: snakeCase(`${server.vpc} vpn server route ${route.name}`),
    data: routeData,
  };
}

/**
 * create and import an RSA certificate for developer mode. This function is
 * prefixed with DANGER to alert developers and users that this mode is not
 * intended to be secure, nor does it follow best practices. Creation of this
 * certificate is intended for developer use only
 * @param {*} server
 * @returns {string} Terraform code
 */
function DANGER_formatDevRsaCertificate(server) {
  let dangerCertTf = "";
  ["ca_key", "client_key", "server_key"].forEach((key) => {
    dangerCertTf += jsonToTfPrint(
      "resource",
      "tls_private_key",
      `danger ${server.vpc} vpn ${server.name} ${key}`,
      {
        algorithm: "RSA",
      }
    );
  });
  dangerCertTf += jsonToTfPrint(
    "resource",
    "tls_self_signed_cert",
    `danger ${server.vpc} vpn ${server.name} ca cert`,
    {
      is_ca_certificate: true,
      private_key_pem: `\${tls_private_key.DANGER_${snakeCase(
        `${server.vpc} vpn ${server.name} ca key`
      )}.private_key_pem}`,
      validity_period_hours: `\${3 * 365 * 24}`,
      subject: [
        {
          common_name: "My Cert Authority",
          organization: "My, Inc",
        },
      ],
      allowed_uses: ["cert_signing", "crl_signing"],
    }
  );

  ["client", "server"].forEach((certRequest) => {
    dangerCertTf += jsonToTfPrint(
      "resource",
      "tls_cert_request",
      `danger ${server.vpc} vpn ${server.name} ${certRequest} request`,
      {
        private_key_pem: `\${tls_private_key.DANGER_${snakeCase(
          `${server.vpc} vpn ${server.name} ${certRequest} key`
        )}.private_key_pem}`,
        subject: [
          {
            common_name: "my.vpn." + certRequest,
            organization: "My, Inc",
          },
        ],
      }
    );
  });

  ["client", "server"].forEach((signedCert) => {
    dangerCertTf += jsonToTfPrint(
      "resource",
      "tls_locally_signed_cert",
      `danger ${server.vpc} vpn ${server.name} ${signedCert} cert`,
      {
        cert_request_pem: `\${tls_cert_request.${snakeCase(
          `danger ${server.vpc} vpn ${server.name} ${signedCert} request`
        )}.cert_request_pem}`,
        ca_private_key_pem: `\${tls_private_key.${snakeCase(
          `danger ${server.vpc} vpn ${server.name} ca key`
        )}.private_key_pem}`,
        ca_cert_pem: `\${tls_self_signed_cert.${snakeCase(
          `danger ${server.vpc} vpn ${server.name} ca cert`
        )}.cert_pem}`,
        validity_period_hours: `\${3 * 365 * 24}`,
        allowed_uses: [
          "key_encipherment",
          "digital_signature",
          signedCert + "_auth",
        ],
      }
    );
  });

  dangerCertTf += jsonToTfPrint(
    "resource",
    "ibm_sm_imported_certificate",
    `danger ${server.vpc} vpn server ${server.name} dev cert`,
    {
      instance_id: `\${ibm_resource_instance.${snakeCase(
        server.secrets_manager
      )}_secrets_manager.guid}`,
      region: varDotRegion,
      name: kebabName([server.vpc, server.name, "server", "dev", "cert"]),
      description: `DANGER - INSECURE - FOR DEVELOPMENT USE ONLY - Secret for \${var.prefix} ${titleCase(
        `${server.vpc} ${server.name} server`
      )} authentication`,
      certificate: `\${tls_locally_signed_cert.${snakeCase(
        `danger ${server.vpc} vpn ${server.name} server cert`
      )}.cert_pem}`,
      private_key: `\${tls_private_key.${snakeCase(
        `danger ${server.vpc} vpn ${server.name} server key`
      )}.private_key_pem}`,
      intermediate: `\${tls_self_signed_cert.${snakeCase(
        `danger ${server.vpc} vpn ${server.name} ca cert`
      )}.cert_pem}`,
    }
  );

  return tfBlock(
    "danger-zone-dev-only",
    dangerCertTf.replace(/danger/g, "DANGER")
  ).replace(
    "Danger Zone Dev Only",
    "DANGER ZONE - DEVELOPMENT ONLY - DO NOT USE IN PRODUCTION"
  );
}

/**
 * format vpn server
 * @param {Object} server
 * @param {Object} config
 * @returns {string} terraform formatted vsi
 */
function formatVpnServer(server, config) {
  let data = ibmIsVpnServer(server, config);

  // bring your own cert needs to be added when not directly referring to
  // secrets manager CRN
  let certData =
    server.bring_your_own_cert || server.method === "byo"
      ? jsonToTfPrint(
          "resource",
          "ibm_sm_imported_certificate",
          data.name + "_imported_certificate",
          {
            instance_id: `\${ibm_resource_instance.${snakeCase(
              server.secrets_manager
            )}_secrets_manager.guid}`,
            region: varDotRegion,
            name: kebabName([server.vpc, server.name, "server", "cert"]),
            description: `Secret for \${var.prefix} ${titleCase(
              server.vpc + " " + server.name
            )} Server authentication`,
            certificate: `\${var.${data.name}_cert_pem}`,
            private_key: `\${var.${data.name}_private_key_pem}`,
            intermediate: `\${var.${data.name}_intermediate_pem}`,
          }
        )
      : server.DANGER_developer_certificate || server.method === "INSECURE"
      ? DANGER_formatDevRsaCertificate(server)
      : "";

  return (
    certData +
    jsonToTfPrint("resource", "ibm_is_vpn_server", data.name, data.data)
  );
}

/**
 * format vpn server route
 * @param {Object} server
 * @param {Object} config
 * @param {Object} route
 * @returns {string} terraform formatted vsi
 */
function formatVpnServerRoute(server, route, config) {
  let data = ibmIsVpnServerRoute(server, route, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_vpn_server_route",
    data.name,
    data.data
  );
}

/**
 * build vpn server tf
 * @param {Object} config
 * @param {Array<Object>} config.vpn_servers
 * @returns {string} terraform formatted vpn server code
 */
function vpnServerTf(config) {
  let tf = "";
  if (
    config.vpn_servers.length > 0 &&
    !config._options.no_vpn_secrets_manager_auth
  ) {
    tf += jsonToTfPrint(
      "resource",
      "ibm_iam_authorization_policy",
      "vpn_to_secrets_manager_policy",
      {
        source_service_name: "is",
        source_resource_type: "vpn-server",
        description: "Allow VPN Server instance to read from Secrets Manager",
        target_service_name: "secrets-manager",
        roles: ["SecretsReader"],
      }
    );
  }
  config.vpn_servers.forEach((server) => {
    tf += formatVpnServer(server, config);
    if (server.additional_prefixes) {
      server.additional_prefixes.forEach((prefix) => {
        tf += formatAddressPrefix(
          {
            vpc: server.vpc,
            zone: server.zone,
            cidr: prefix,
            name: `vpn-${kebabCase(server.name)}-on-prem-${prefix.replace(
              /\.|\//g,
              "-"
            )}`,
          },
          config,
          true
        );
      });
    }
    server.routes.forEach((route) => {
      tf += formatVpnServerRoute(server, route, config);
    });
  });
  return tf === "" ? "" : tfBlock("VPN servers", tf);
}

module.exports = {
  formatVpnServer,
  formatVpnServerRoute,
  vpnServerTf,
  ibmIsVpnServer,
  ibmIsVpnServerRoute,
};
