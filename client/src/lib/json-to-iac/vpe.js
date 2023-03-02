const {
  rgIdRef,
  jsonToTf,
  subnetRef,
  kebabName,
  vpcRef,
  tfRef,
  tfBlock,
  tfDone
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
function formatReservedIp(vpcName, subnetName) {
  return jsonToTf(
    "ibm_is_subnet_reserved_ip",
    `${vpcName} vpc ${subnetName} subnet vpe ip`,
    {
      subnet: subnetRef(vpcName, subnetName)
    }
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
 * @returns {string} terraform gateway string
 */
function fortmatVpeGateway(vpe, config) {
  let allSgIds = [];
  vpe.security_groups.forEach(group => {
    allSgIds.push(tfRef(`ibm_is_security_group`, `${vpe.vpc} vpc ${group} sg`));
  });
  return jsonToTf(
    "ibm_is_virtual_endpoint_gateway",
    `${vpe.vpc} vpc ${vpe.service} vpe gateway`,
    {
      name: kebabName(config, [vpe.vpc, vpe.service, "vpe-gw"]),
      vpc: vpcRef(vpe.vpc),
      resource_group: rgIdRef(vpe.resource_group, config),
      tags: true,
      security_groups:
        vpe.security_groups.length === 0
          ? `[]`
          : `[\n    ` + allSgIds.join(",").replace(/,|(?=$)/i, "\n  ]"),
      _target: {
        crn: `"${serviceToEndpointMap[vpe.service].replace(
          /\$REGION/g,
          config._options.region
        )}"`,

        resource_type: '"provider_cloud_service"'
      }
    },
    config
  );
}

/**
 * create gateway ip for vpe
 * @param {Object} vpe
 * @param {string} vpe.vpc
 * @param {string} vpe.service can be icr, cos, kms, or hpcse
 * @param {string} vpe.resource_group
 * @param {string} subnetName
 * @returns {string} terraform formatted gateway ip
 */
function fortmatVpeGatewayIp(vpe, subnetName) {
  return jsonToTf(
    "ibm_is_virtual_endpoint_gateway_ip",
    `${vpe.vpc} vpc ${vpe.service} gw ${subnetName} gateway ip`,
    {
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
  vpeTf
};
