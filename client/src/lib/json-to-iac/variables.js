const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const {
  snakeCase,
  titleCase,
  isNullOrEmptyString,
  capitalize,
} = require("lazy-z");

/**
 * create variables dot tf
 * @param {*} config
 * @param {*} useF5
 * @param {boolean=} templateTarMode delete ssh key defaults for tar packages of default templates
 * @returns {string} terraform template string
 */
function variablesDotTf(config, useF5, templateTarMode) {
  let variables = {
    ibmcloud_api_key: {
      description:
        "The IBM Cloud platform API key needed to deploy IAM enabled resources.",
      type: "${string}",
      sensitive: true,
    },
  };
  if (config._options.enable_classic) {
    variables.iaas_classic_username = {
      description:
        "The IBM Cloud username for the creation of classic resources.",
      type: "${string}",
      sensitive: true,
    };
    variables.iaas_classic_api_key = {
      description:
        "The IBM Cloud API Key for the creation of classic resources.",
      type: "${string}",
      sensitive: true,
    };
  }
  variables.region = {
    description: "IBM Cloud Region where resources will be provisioned",
    type: "${string}",
    default: config._options.region,
  };
  variables.prefix = {
    description: "Name prefix that will be prepended to named resources",
    type: "${string}",
    default: config._options.prefix,
  };
  let useAccountId = false;
  // only add account id when in use
  ["virtual_private_endpoints", "cbr_zones"].forEach((field) => {
    config[field].forEach((item) => {
      if (item.account_id && !isNullOrEmptyString(item.account_id)) {
        useAccountId = true;
      }
    });
  });
  if (useAccountId)
    variables.account_id = {
      description: "IBM Account ID where resources will be provisioned",
      type: "${string}",
      default: config._options.account_id,
    };

  let newSshKeys = config.ssh_keys.filter((key) => !key.use_data);
  // add ssh keys not from data
  newSshKeys.forEach((key) => {
    let snakeKeyName = snakeCase(key.name + " public key");
    variables[snakeKeyName] = {
      description: `Public SSH Key Value for ${titleCase(key.name).replace(
        /Ssh/g,
        "SSH"
      )}`,
      type: "${string}",
      sensitive: true,
      default: templateTarMode ? undefined : key.public_key,
    };
  });
  // add f5 tmos admin password
  if (useF5) {
    variables.tmos_admin_password = {
      description: "F5 TMOS Admin Password",
      type: "${string}",
      sensitive: true,
      default: config.f5_vsi[0].template.tmos_admin_password,
    };
  }
  // add imported certs
  if (config.secrets_manager.length > 0) {
    config.secrets_manager.forEach((instance) => {
      if (instance.secrets)
        instance.secrets.forEach((secret) => {
          if (secret.type === "imported") {
            variables[snakeCase(instance.name + " " + secret.name + " data")] =
              {
                description:
                  "PEM encoded contents of your imported certificate",
                type: "${string}",
                sensitive: true,
              };
          }
        });
    });
  }

  // add preshared key
  config.vpn_gateways.forEach((gateway) => {
    if (gateway.connections) {
      gateway.connections.forEach((connection) => {
        variables[
          snakeCase(gateway.name + " " + connection.name + " preshared_key")
        ] = {
          description: `Preshared key for VPN Gateway ${gateway.name} connection ${connection.name}`,
          type: "${string}",
          sensitive: true,
        };
      });
    }
  });

  config.clusters.forEach((cluster) => {
    if (cluster.opaque_secrets) {
      cluster.opaque_secrets.forEach((secret) => {
        variables[
          snakeCase(
            `${secret.secrets_manager} ${secret.name} secret arbitrary_secret_data`
          )
        ] = {
          description: `Data for ${secret.name} secret arbitrary secret data`,
          type: "${string}",
          sensitive: true,
          default: secret.arbitrary_secret_data,
        };
        variables[
          snakeCase(`${secret.secrets_manager} ${secret.name} secret username`)
        ] = {
          description: `${capitalize(secret.name)} secret username`,
          type: "${string}",
          sensitive: true,
          default: secret.username_password_secret_username,
        };
        variables[
          snakeCase(`${secret.secrets_manager} ${secret.name} secret password`)
        ] = {
          description: `${capitalize(secret.name)} secret password`,
          type: "${string}",
          sensitive: true,
          default: secret.username_password_secret_password,
        };
      });
    }
  });

  config.power.forEach((workspace) => {
    workspace.ssh_keys.forEach((key) => {
      if (!key.use_data)
        variables[snakeCase(`power ${workspace.name} ${key.name} key`)] = {
          description: capitalize(
            titleCase(
              `${workspace.name} ${key.name} public key value`
            ).toLowerCase()
          ),
          type: "${string}",
          default: templateTarMode ? undefined : key.public_key,
        };
    });
  });

  (config.classic_ssh_keys || []).forEach((sshKey) => {
    variables[snakeCase(`classic ${sshKey.name} public key`)] = {
      description: `Public SSH Key Value for classic SSH Key ${sshKey.name.replace(
        /-/g,
        " "
      )}`,
      type: "${string}",
      default: templateTarMode ? undefined : sshKey.public_key,
    };
  });

  config.vpn_servers.forEach((server) => {
    if (server.bring_your_own_cert) {
      [
        "cert_pem",
        "private_key_pem",
        "intermediate_pem",
        "client_ca_cert_pem",
        "client_ca_private_key_pem",
      ].forEach((certVar) => {
        variables[
          snakeCase(`${server.vpc} vpn_server ${server.name} ${certVar}`)
        ] = {
          description:
            "Imported certificate " +
            titleCase(certVar)
              .toLowerCase()
              .replace("pem", "PEM")
              .replace("cert PEM", "PEM") +
            " for " +
            titleCase(`${server.vpc} vpn server ${server.name}.`) +
            " Certificate will be stored in Secrets Manager",
          type: "${string}",
          sensitive: "${true}",
        };
      });
    }
  });

  return tfBlock(
    "variables",
    "\n" +
      jsonToTf(
        JSON.stringify({
          variable: variables,
        })
      ) +
      "\n"
  );
}

module.exports = {
  variablesDotTf,
};
