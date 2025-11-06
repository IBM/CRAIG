const {
  getObjectFromArray,
  snakeCase,
  distinct,
  revision,
  splatContains,
  isEmpty,
} = require("lazy-z");
const {
  rgIdRef,
  getKmsInstanceData,
  subnetZone,
  composedZone,
  kebabName,
  vpcRef,
  resourceRef,
  encryptionKeyRef,
  tfRef,
  tfDone,
  tfBlock,
  jsonToTfPrint,
  timeouts,
  cdktfRef,
} = require("./utils");
const { varDotRegion } = require("../constants");

function ibmSchematicsAgent(agent, config) {
  let data = {
    name: `${snakeCase(agent.name)} Schematics Agent`,
  };

  let agentData = {
    agent_infrastructure: [
      {
        infra_type: "ibm_openshift",
        cluster_id: `\${ibm_container_vpc_cluster.${snakeCase(agent.cluster)}.id}`, // ibm_container_vpc_cluster.schematics_vpc_vpc_schematics_agent_cluster.id
        cluster_resource_group: `\${ibm_resource_group.${snakeCase(agent.cluster_resource_group)}.id}`, // ibm_resource_group.schematics_rg.id
        cos_instance_name: `\${ibm_resource_instance.${snakeCase(agent.cos)}.name}`, // ibm_resource_instance.cos.name
        cos_bucket_name: `\${ibm_cos_bucket.${snakeCase(agent.bucket)}.bucket_name}`, //ibm_cos_bucket.agent_bucket.bucket_name
        cos_bucket_region: varDotRegion,
      },
    ],
    agent_location: varDotRegion,
    agent_metadata: [
      {
        name: "purpose",
        value: ["git", "terraform", "ansible"],
      },
    ],
    description: `${agent.name} Schematics Agent`,
    name: kebabName([agent.name, "schematics-agent"]),
    resource_group: rgIdRef(agent.resource_group, config),
    schematics_location: varDotRegion,
    tags: ["schematics-agent"],
    version: "1.4.0",
    run_destroy_resources: 1,
  };

  return {
    name: `${agent.name} schematics agent`,
    data: agentData,
  };
}

function ibmSchematicsAgentDeploy(deploy, agent) {
  let data = {
    name: `${snakeCase(agent.name)} Schematics Agent Deploy`,
  };

  let deployData = {
    agent_id: `\${ibm_schematics_agent.${snakeCase(agent.name)}_schematics_agent.id}`,
  };

  return {
    name: `${agent.name} agent deploy`,
    data: deployData,
  };
}

function ibmSchematicsAgentPolicy(policy, agent, config) {
  let policyData = {
    description: `Policy to allow execution of actions on ${agent.name}-schematics-agent`,
    name: kebabName([agent.name, "agent-policy"]),
    kind: "agent_assignment_policy",
    location: varDotRegion,
    parameter: [
      {
        agent_assignment_policy_parameter: [
          {
            selector_scope: [
              {
                kind: "action",
                tags: ["schematics-agent"],
                resource_groups: [rgIdRef(policy.resource_group, config)],
                locations: [`${varDotRegion}`],
              },
            ],
          },
        ],
      },
    ],
    resource_group: rgIdRef(policy.resource_group, config),
    target: [
      {
        selector_kind: "action",
        selector_ids: [
          `\${ibm_schematics_agent.${snakeCase(agent.name)}_schematics_agent.id}`,
        ],
      },
    ],
    depends_on: [
      `\${ibm_schematics_agent_deploy.${snakeCase(agent.name)}_agent_deploy}`,
    ],
  };

  return {
    name: `${agent.name} agent policy`,
    data: policyData,
  };
}

function formatAgent(agent, config) {
  let tf = ibmSchematicsAgent(agent, config);
  return jsonToTfPrint("resource", "ibm_schematics_agent", tf.name, tf.data);
}

function formatAgentDeploy(deploy, agent) {
  let tf = ibmSchematicsAgentDeploy(deploy, agent);
  return jsonToTfPrint(
    "resource",
    "ibm_schematics_agent_deploy",
    tf.name,
    tf.data,
  );
}

function formatAgentPolicy(policy, agent, config) {
  let tf = ibmSchematicsAgentPolicy(policy, agent, config);
  return jsonToTfPrint("resource", "ibm_schematics_policy", tf.name, tf.data);
}

function agentTf(config) {
  let tf = "";
  config.agents.forEach((agent, index) => {
    let blockData = formatAgent(agent, config);
    blockData += formatAgentDeploy(agent.deploy, agent);
    blockData += formatAgentPolicy(agent.policy, agent, config);

    tf += tfBlock(agent.name + " Schematics Agent", blockData);
    if (index !== config.agents.length - 1) {
      tf += "\n";
    }
  });
  return tfDone(tf);
}

module.exports = {
  formatAgent,
  formatAgentDeploy,
  formatAgentPolicy,
  agentTf,
  ibmSchematicsAgent,
  ibmSchematicsAgentDeploy,
  ibmSchematicsAgentPolicy,
};
