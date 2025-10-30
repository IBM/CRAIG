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
        name: `${agent.name} Schematics Agent`
    };

    let agentData = {
        agent_infrastructure: [ 
            {
                infra_type: "ibm_openshift",
                cluster_id: agent.cluster.id, // ibm_container_vpc_cluster.schematics_vpc_vpc_schematics_agent_cluster.id
                cluster_resource_group: agent.cluster.resource_group_id, // ibm_resource_group.schematics_rg.id
                cos_instance_name: agent.cos.name, // ibm_resource_instance.cos.name
                cos_bucket_name: agent.cos.bucket, //ibm_cos_bucket.agent_bucket.bucket_name
                cos_bucket_region: varDotRegion
            }
        ],
        agent_location: varDotRegion,
        agent_metadata: [ 
            {
                name: "purpose",
                value: ["git", "terraform", "ansible"]
            }
        ],
        description: `${agent.name} Schematics agent`,
        name: kebabName([agent.name, "schematics-agent"]),
        resource_group: rgIdRef(agent.resource_group, config),
        schematics_location: varDotRegion,
        tags: ["schematics-agent"],
        version: "1.4.0",
        run_destroy_resources: 1
    }
}