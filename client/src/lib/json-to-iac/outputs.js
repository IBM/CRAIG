const { jsonToTf } = require("json-to-tf");
const { tfBlock } = require("./utils");
const { snakeCase } = require("lazy-z");

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
  });
  return tf;
}

module.exports = {
  outputsTf,
};
