const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const {
  snakeCase,
  titleCase,
  isNullOrEmptyString,
  capitalize,
} = require("lazy-z");

function variablesDotTf(config, useF5) {
  let variables = {
    ibmcloud_api_key: {
      description:
        "The IBM Cloud platform API key needed to deploy IAM enabled resources.",
      type: "${string}",
      sensitive: true,
    },
  };
  if (config._options.classic) {
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
    validation: [
      {
        error_message: "Region must be in a supported IBM VPC region.",
        condition: `\${contains(["us-south", "us-east", "br-sao", "ca-tor", "eu-gb", "eu-de", "jp-tok", "jp-osa", "au-syd"], var.region)}`,
      },
    ],
  };
  variables.prefix = {
    description: "Name prefix that will be prepended to named resources",
    type: "${string}",
    default: config._options.prefix,
    validation: [
      {
        error_message:
          "Prefix must begin with a lowercase letter and contain only lowercase letters, numbers, and - characters. Prefixes must end with a lowercase letter or number and be 16 or fewer characters.",
        condition:
          '${can(regex("^([a-z]|[a-z][-a-z0-9]*[a-z0-9])$", var.prefix)) && length(var.prefix) <= 16}',
      },
    ],
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
      default: key.public_key,
      validation: [
        {
          error_message: "Public SSH Key must be a valid ssh rsa public key.",
          condition: `\${var.${snakeKeyName} == null || can(regex("ssh-rsa AAAA[0-9A-Za-z+/]+[=]{0,3} ?([^@]+@[^@]+)?", var.${snakeKeyName}))}`,
        },
      ],
    };
  });
  // add f5 tmos admin password
  if (useF5) {
    variables.tmos_admin_password = {
      description: "F5 TMOS Admin Password",
      type: "${string}",
      sensitive: true,
      default: config.f5_vsi[0].template.tmos_admin_password,
      validation: [
        {
          error_message:
            "Value for tmos_password must be at least 15 characters, contain one numeric, one uppercase, and one lowercase character.",
          condition:
            '${var.tmos_admin_password == null ? true : (length(var.tmos_admin_password) >= 15 && can(regex("[A-Z]", var.tmos_admin_password)) && can(regex("[a-z]", var.tmos_admin_password)) && can(regex("[0-9]", var.tmos_admin_password)))}',
        },
      ],
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
      variables[snakeCase(`power ${workspace.name} ${key.name} key`)] = {
        description: capitalize(
          titleCase(
            `${workspace.name} ${key.name} public key value`
          ).toLowerCase()
        ),
        type: "${string}",
        default: key.public_key,
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
      default: sshKey.public_key,
    };
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
