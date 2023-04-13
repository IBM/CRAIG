const {
  rgIdRef,
  subnetRef,
  kebabName,
  vpcRef,
  tfRef,
  tfBlock,
  tfDone,
  getTags,
  jsonToTfPrint
} = require("./utils");

const serviceToEndpointMap = {
  kms:
    "crn:v1:bluemix:public:kms:$REGION:::endpoint:${var.service_endpoints}.$REGION.kms.cloud.ibm.com",
  hpcs:
    "crn:v1:bluemix:public:hs-crypto:$REGION:::endpoint:api.${var.service_endpoints}.$REGION.hs-crypto.cloud.ibm.com",
  cos:
    "crn:v1:bluemix:public:cloud-object-storage:global:::endpoint:s3.direct.$REGION.cloud-object-storage.appdomain.cloud",
  icr:
    "crn:v1:bluemix:public:container-registry:$REGION:::endpoint:vpe.$REGION.container-registry.cloud.ibm.com"
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
      subnet: subnetRef(vpcName, subnetName)
    }
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
 * @param {string} vpe.service can be icr, cos, kms, or hpcse
 * @param {string} vpe.resource_group
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
      name: kebabName(config, [vpe.vpc, vpe.service, "vpe-gw"]),
      vpc: vpcRef(vpe.vpc),
      resource_group: rgIdRef(vpe.resource_group, config),
      tags: getTags(config),
      security_groups: [],
      target: [
        {
          crn: serviceToEndpointMap[vpe.service].replace(
            /\$REGION/g,
            config._options.region
          ),
          resource_type: "provider_cloud_service"
        }
      ]
    }
  };
  vpe.security_groups.forEach(group => {
    data.data.security_groups.push(
      tfRef(`ibm_is_security_group`, `${vpe.vpc} vpc ${group} sg`)
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
      )
    }
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
  config.virtual_private_endpoints.forEach(vpe => {
    let blockData = "";
    vpe.subnets.forEach(
      subnet => (blockData += formatReservedIp(vpe.vpc, subnet))
    );
    blockData += fortmatVpeGateway(vpe, config);
    vpe.subnets.forEach(
      subnet => (blockData += fortmatVpeGatewayIp(vpe, subnet))
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
  ibmIsSubnetReservedIp
};
