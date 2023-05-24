const { varDotRegion } = require("../constants");
const {
  rgIdRef,
  subnetRef,
  kebabName,
  vpcRef,
  tfRef,
  tfBlock,
  tfDone,
  getTags,
  jsonToTfPrint,
} = require("./utils");
const { snakeCase } = require("lazy-z");

const serviceToEndpointMap = {
  kms: "crn:v1:bluemix:public:kms:$REGION:::endpoint:${var.service_endpoints}.$REGION.kms.cloud.ibm.com",
  hpcs: "crn:v1:bluemix:public:hs-crypto:$REGION:::endpoint:api.${var.service_endpoints}.$REGION.hs-crypto.cloud.ibm.com",
  cos: "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.$REGION.cloud-object-storage.appdomain.cloud",
  icr: "crn:v1:bluemix:public:container-registry:$REGION:::endpoint:vpe.$REGION.container-registry.cloud.ibm.com",
  "secrets-manager":
    "crn:v1:bluemix:public:secrets-manager:$REGION:a/$ACCOUNT_ID:${ibm_resource_instance.$SNAKE_NAME.guid}::",
};

/**
 * format reserved ip
 * @param {string} vpcName
 * @param {string} subnetName
 * @returns {string} terraform formatted code
 */

function ibmIsSubnetReservedIp(vpcName, subnetName) {
  return {
    name: `${vpcName} vpc ${subnetName} subnet vpe ip`,
    data: {
      subnet: `\${module.${snakeCase(vpcName)}_vpc.${snakeCase(
        subnetName
      )}_id}`,
    },
  };
}

/**
 * format reserved ip
 * @param {string} vpcName
 * @param {string} subnetName
 * @returns {string} terraform formatted code
 */
function formatReservedIp(vpcName, subnetName) {
  let ip = ibmIsSubnetReservedIp(vpcName, subnetName);
  return jsonToTfPrint(
    "resource",
    "ibm_is_subnet_reserved_ip",
    ip.name,
    ip.data
  );
}

/**
 * format vpe gw
 * @param {Object} vpe
 * @param {string} vpe.vpc
 * @param {string} vpe.service can be icr, secrets manager, cos, kms, or hpcse
 * @param {string} vpe.resource_group
 * @param {string=} vpe.instance name of instance, used only for secrets manager
 * @param {string=} vpe.account_id used for secrets manager crn
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {object} terraform gateway string
 */

function ibmIsVirtualEndpointGateway(vpe, config) {
  let data = {
    name: `${vpe.vpc} vpc ${vpe.service} vpe gateway`,
    data: {
      name: kebabName([
        vpe.vpc,
        vpe.instance ? vpe.instance : vpe.service,
        "vpe-gw",
      ]),
      vpc: vpcRef(vpe.vpc, "id", true),
      resource_group: rgIdRef(vpe.resource_group, config),
      tags: getTags(config),
      security_groups: [],
      target: [],
    },
  };
  let target = {
    crn: serviceToEndpointMap[vpe.service].replace(/\$REGION/g, varDotRegion),
    resource_type: "provider_cloud_service",
  };
  if (vpe.service === "secrets-manager") {
    target.crn = target.crn
      .replace("$ACCOUNT_ID", "${var.account_id}")
      .replace("$SNAKE_NAME", "secrets_manager_" + snakeCase(vpe.instance));
  }
  data.data.target.push(target);
  vpe.security_groups.forEach((group) => {
    data.data.security_groups.push(
      `\${module.${vpe.vpc}_vpc.${snakeCase(group)}_id}`
    );
  });
  return data;
}

/**
 * format vpe gw
 * @param {Object} vpe
 * @param {Object} config
 * @returns {string} terraform gateway string
 */
function fortmatVpeGateway(vpe, config) {
  let vpeData = ibmIsVirtualEndpointGateway(vpe, config);
  return jsonToTfPrint(
    "resource",
    "ibm_is_virtual_endpoint_gateway",
    vpeData.name,
    vpeData.data
  ).replace(/\[\n\s+\]/g, "[]");
}

/**
 * create gateway ip for vpe
 * @param {Object} vpe
 * @param {string} vpe.vpc
 * @param {string} vpe.service can be icr, cos, kms, or hpcse
 * @param {string} vpe.resource_group
 * @param {string} subnetName
 * @returns {object} terraform formatted gateway ip
 */

function ibmIsVirtualEndpointGatewayIp(vpe, subnetName) {
  return {
    name: `${vpe.vpc} vpc ${vpe.service} gw ${subnetName} gateway ip`,
    data: {
      gateway: tfRef(
        "ibm_is_virtual_endpoint_gateway",
        `${vpe.vpc} vpc ${vpe.service} vpe gateway`
      ),
      reserved_ip: tfRef(
        "ibm_is_subnet_reserved_ip",
        `${vpe.vpc} vpc ${subnetName} subnet vpe ip`,
        "reserved_ip"
      ),
    },
  };
}

/**
 * create gateway ip for vpe
 * @param {Object} vpe
 * @param {string} subnetName
 * @returns {string} terraform formatted gateway ip
 */
function fortmatVpeGatewayIp(vpe, subnetName) {
  let data = ibmIsVirtualEndpointGatewayIp(vpe, subnetName);
  return jsonToTfPrint(
    "resource",
    "ibm_is_virtual_endpoint_gateway_ip",
    data.name,
    data.data
  );
}

/**
 * create terraform filedata for vpe
 * @param {Object} config
 * @returns {string} terraform string
 */
function vpeTf(config) {
  let tf = "";
  config.virtual_private_endpoints.forEach((vpe) => {
    let blockData = "";
    vpe.subnets.forEach(
      (subnet) => (blockData += formatReservedIp(vpe.vpc, subnet))
    );
    blockData += fortmatVpeGateway(vpe, config);
    vpe.subnets.forEach(
      (subnet) => (blockData += fortmatVpeGatewayIp(vpe, subnet))
    );
    tf += tfBlock(vpe.vpc + " vpe resources", blockData) + "\n";
  });
  return tfDone(tf);
}

module.exports = {
  formatReservedIp,
  fortmatVpeGateway,
  fortmatVpeGatewayIp,
  vpeTf,
  ibmIsVirtualEndpointGatewayIp,
  ibmIsVirtualEndpointGateway,
  ibmIsSubnetReservedIp,
};
