const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const { snakeCase, azsort } = require("lazy-z");

/**
 * outputs
 * @param {*} config
 * @returns {string} terraform output file
 */
function outputsTf(config) {
  let tf = "";
  config.vpcs.forEach((vpc) => {
    let outputs = {};

    // vpc outputs
    ["name", "id", "crn"].forEach((field) => {
      outputs[snakeCase(vpc.name) + "_vpc_" + field] = {
        value: `\${module.${snakeCase(vpc.name + " vpc")}.${field}}`,
      };
    });

    // subnet outputs
    vpc.subnets.forEach((subnet) => {
      ["name", "id", "crn"].forEach((field) => {
        outputs[
          snakeCase(vpc.name + " vpc subnet " + subnet.name + " " + field)
        ] = {
          value: `\${module.${snakeCase(vpc.name + " vpc")}.${snakeCase(
            subnet.name + " " + field
          )}}`,
        };
      });
    });

    config.security_groups.forEach((sg) => {
      ["name", "id"].forEach((field) => {
        if (sg.vpc === vpc.name) {
          outputs[
            snakeCase(vpc.name + " vpc security group " + sg.name + " " + field)
          ] = {
            value: `\${module.${snakeCase(vpc.name + " vpc")}.${snakeCase(
              sg.name
            )}_${field}}`,
          };
        }
      });
    });

    tf += tfBlock(
      vpc.name + " VPC outputs",
      "\n" +
        jsonToTf(
          JSON.stringify({
            output: outputs,
          })
        ) +
        "\n"
    );

    config.vsi.forEach((deployment) => {
      let deploymentOutputs = {};
      deployment.subnets.sort(azsort).forEach((subnet, subnetIndex) => {
        for (let i = 0; i < deployment.vsi_per_subnet; i++) {
          deploymentOutputs[
            snakeCase(
              `${deployment.vpc} vpc ${deployment.name} vsi ${
                subnetIndex + 1
              } ${i + 1} primary ip address`
            )
          ] = {
            value: `\${ibm_is_instance.${snakeCase(
              `${deployment.vpc} vpc ${deployment.name} vsi ${
                subnetIndex + 1
              } ${i + 1}`
            )}.primary_network_interface[0].primary_ipv4_address}`,
          };
          if (deployment.enable_floating_ip) {
            deploymentOutputs[
              snakeCase(
                `${deployment.vpc} vpc ${deployment.name} vsi ${
                  subnetIndex + 1
                } ${i + 1} floating ip address`
              )
            ] = {
              value: `\${ibm_is_floating_ip.${snakeCase(
                `${deployment.vpc} vpc ${deployment.name} vsi ${
                  subnetIndex + 1
                } ${i + 1} fip`
              )}.address}`,
            };
          }
        }
      });
      tf +=
        "\n" +
        tfBlock(
          `${deployment.vpc} vpc ${deployment.name} deployment outputs`,
          "\n" +
            jsonToTf(
              JSON.stringify({
                output: deploymentOutputs,
              })
            ) +
            "\n"
        );
    });
  });
  return tf;
}

module.exports = {
  outputsTf,
};
