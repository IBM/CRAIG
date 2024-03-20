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

  config.vpcs.forEach((vpc, index) => {
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

    tf +=
      tfBlock(
        vpc.name + " VPC outputs",
        "\n" +
          jsonToTf(
            JSON.stringify({
              output: outputs,
            })
          ) +
          "\n"
      ) + (config.vpcs[index + 1] ? "\n" : "");
  });

  // vsi outputs
  config.vsi.forEach((deployment) => {
    let deploymentOutputs = {};
    deployment.subnets.sort(azsort).forEach((subnet, subnetIndex) => {
      for (let i = 0; i < deployment.vsi_per_subnet; i++) {
        deploymentOutputs[
          snakeCase(
            `${deployment.vpc} vpc ${deployment.name} vsi ${subnetIndex + 1} ${
              i + 1
            } primary ip address`
          )
        ] = {
          value: `\${ibm_is_instance.${snakeCase(
            `${deployment.vpc} vpc ${deployment.name} vsi ${subnetIndex + 1} ${
              i + 1
            }`
          )}.primary_network_interface[0].primary_ip[0].address}`,
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

  // power workspaces
  config.power.forEach((workspace, index) => {
    let outputs = {};
    // power workspace outputs
    ["name", "guid", "crn"].forEach((field) => {
      outputs["power_vs_workspace_" + snakeCase(workspace.name) + "_" + field] =
        {
          value: `\${${
            workspace.use_data ? "data." : ""
          }ibm_resource_instance.power_vs_workspace_${snakeCase(
            workspace.name
          )}.${field}}`,
        };
    });

    workspace.network.forEach((nw) => {
      ["name", "id"].forEach((field) => {
        outputs[
          snakeCase(
            `power vs workspace ${nw.workspace} network ${nw.name} ${field}`
          )
        ] = {
          value: `\${${nw.use_data ? "data." : ""}ibm_pi_network.${snakeCase(
            `power network ${nw.workspace} ${nw.name}`
          )}.${field}}`,
        };
      });
    });

    tf +=
      (tf.length > 0 && index < 1 ? "\n" : "") +
      tfBlock(
        workspace.name + " Power Workspace outputs",
        "\n" +
          jsonToTf(
            JSON.stringify({
              output: outputs,
            })
          ) +
          "\n"
      ) +
      (config.power[index + 1] ? "\n" : "");
  });

  let powerInstanceOutputs = {};
  // power instances
  if (config.power_instances)
    config.power_instances.forEach((instance, index) => {
      let vsiRef = `${snakeCase(
        instance.workspace
      )}_workspace_instance_${snakeCase(instance.name)}`;
      powerInstanceOutputs[vsiRef + "_primary_ip"] = {
        value: `\${ibm_pi_instance.${vsiRef}.pi_network[0].ip_address}`,
      };
    });
  if (Object.keys(powerInstanceOutputs).length > 0)
    tf +=
      "\n" +
      tfBlock(
        "Power VS Instance Outputs",
        "\n" + jsonToTf(JSON.stringify({ output: powerInstanceOutputs })) + "\n"
      );

  return tf;
}

module.exports = {
  outputsTf,
};
