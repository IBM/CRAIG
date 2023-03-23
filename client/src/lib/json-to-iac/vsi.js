const {
  snakeCase,
  getObjectFromArray,
  distinct,
  splat,
  transpose,
  parseIntFromZone
} = require("lazy-z");
const {
  rgIdRef,
  jsonToIac,
  tfRef,
  vpcRef,
  composedZone,
  encryptionKeyRef,
  subnetRef,
  kebabName,
  tfBlock,
  tfDone,
  getTags
} = require("./utils");

/**
 * format vsi
 * @param {Object} vsi
 * @param {string} vsi.kms
 * @param {string} vsi.encryption_key
 * @param {string} vsi.image
 * @param {string} vsi.profile
 * @param {string} vsi.name
 * @param {Array<string>} vsi.security_groups
 * @param {Array<string>} vsi.ssh_keys
 * @param {string} vsi.subnet
 * @param {string} vsi.vpc
 * @param {number} vsi.index
 * @param {string} vsi.resource_group
 * @param {Object} config
 * @param {Object} config._options
 * @param {string} config._options.region
 * @param {string} config._options.prefix
 * @returns {string} terraform formatted vsi
 */
function formatVsi(vsi, config) {
  let zone = vsi.subnet.replace(/[^]+(?=\d$)/g, "");
  let vsiName = vsi.index
    ? `${config._options.prefix}-${snakeCase(vsi.vpc)}-${
        vsi.name
      }-vsi-zone-${zone}-${vsi.index}`
    : vsi.name;
  let allSgIds = [],
    allSshKeyIds = [],
    networkInterfaces = [];
  // add nework interfaces
  if (vsi.network_interfaces)
    vsi.network_interfaces.forEach(intf => {
      let nwInterface = {
        subnet: subnetRef(vsi.vpc, intf.subnet),
        allow_ip_spoofing: true,
        "*security_groups": []
      };
      intf.security_groups.forEach(group => {
        nwInterface["*security_groups"].push(
          tfRef(`ibm_is_security_group`, `${vsi.vpc} vpc ${group} sg`)
        );
      });
      networkInterfaces.push(nwInterface);
    });
  // add security groups
  vsi.security_groups.forEach(group => {
    allSgIds.push(tfRef(`ibm_is_security_group`, `${vsi.vpc} vpc ${group} sg`));
  });
  // add ssh keys
  vsi.ssh_keys.forEach(key => {
    allSshKeyIds.push(
      tfRef(
        `ibm_is_ssh_key`,
        key,
        "id",
        getObjectFromArray(config.ssh_keys, "name", key).use_data
      )
    );
  });
  let vsiValues = {
    name: `"${vsiName}"`,
    image: tfRef("ibm_is_image", vsi.image, "id", true),
    profile: `"${vsi.profile}"`,
    resource_group: rgIdRef(vsi.resource_group, config),
    vpc: vpcRef(vsi.vpc),
    zone: composedZone(config, zone),
    tags: getTags(config)
  };
  if (vsi.user_data) {
    vsiValues.user_data = vsi.user_data;
  }
  vsiValues["*keys"] = allSshKeyIds;
  vsiValues._primary_network_interface = {
    subnet: subnetRef(vsi.vpc, vsi.subnet),
    "*security_groups": allSgIds
  };
  if (networkInterfaces.length > 0) {
    vsiValues["-network_interfaces"] = networkInterfaces;
  }
  vsiValues._boot_volume = {
    encryption: encryptionKeyRef(vsi.kms, vsi.encryption_key, "crn")
  };
  vsiValues["*volumes"] = [];
  let storageVolumes = "";
  if (vsi.volumes) {
    vsi.volumes.forEach(volume => {
      let volumeData = {
        name: `"${vsiName + "-" + volume.name}"`,
        profile: `"${volume.profile}"`,
        zone: composedZone(config, zone),
        iops: volume.iops,
        capacity: volume.capacity,
        encryption_key: encryptionKeyRef(vsi.kms, volume.encryption_key),
        tags: getTags(config)
      };
      storageVolumes += jsonToIac(
        "ibm_is_volume",
        `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${vsi.index} ${volume.name}`,
        volumeData,
        config
      );

      vsiValues["*volumes"] = [
        tfRef(
          "ibm_is_volume",
          `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${vsi.index} ${volume.name}`
        )
      ];
    });
  }

  if (vsiValues["*volumes"].length === 0) {
    delete vsiValues["*volumes"];
  }

  return (
    jsonToIac(
      "ibm_is_instance",
      vsi.index
        ? `${vsi.vpc} vpc ${vsi.name} vsi ${zone} ${vsi.index}`
        : vsi.name,
      vsiValues,
      config
    ) + storageVolumes
  );
}

/**
 * format vsi image data block
 * @param {string} imageName
 * @returns {string} terraform formatted code
 */
function formatVsiImage(imageName) {
  return jsonToIac(
    "ibm_is_image",
    imageName,
    {
      name: `"${imageName}"`
    },
    {},
    true
  );
}

/**
 * format load balancer for vsi deployment
 * @param {Object} deployment
 * @param {string} deployment.name
 * @param {string} deployment.type can be public or private
 * @param {string} deployment.resource_group
 * @param {string} deployment.algorithm  Supported values are round_robin, weighted_round_robin, or least_connections
 * @param {string} deployment.protocol pool protocol Enumeration type: http, https, tcp, udp are supported.
 * @param {number} deployment.health_delay The health check interval in seconds. Interval must be greater than timeout value.
 * @param {number} deployment.health_retries The health check max retries.
 * @param {number} deployment.health_timeout The health check timeout in seconds.
 * @param {string} deployment.health_type  Enumeration type: http, https, tcp are supported.
 * @param {string} deployment.session_persistence_type the session persistence type, Enumeration type: source_ip, app_cookie, http_cookie
 * @param {string} deployment.session_persistence_app_cookie_name Session persistence app cookie name. This is applicable only to app_cookie type.
 * @param {Array<string>} deployment.security_groups
 * @param {Array<string>} deployment.subnets
 * @param {Array<string>} deployment.target_vsi
 * @param {number} deployment.port pool member port
 * @param {number} deployment.listener_port
 * @param {string} deployment.listener_protocol  Enumeration type are http, tcp, https and udp. Network load balancer supports only tcp and udp protocol.
 * @param {number} deployment.connection_limit
 * @param {Object} config
 * @returns {string} terraform formatted string
 */
function formatLoadBalancer(deployment, config) {
  let lbName = `${deployment.name} load balancer`;
  let lbValues = {
      name: kebabName(config, [deployment.name, "lb"]),
      type: `"${deployment.type}"`,
      resource_group: rgIdRef(deployment.resource_group, config),
      tags: getTags(config)
    },
    poolValues = {
      lb: tfRef("ibm_is_lb", lbName),
      name: kebabName(config, [deployment.name, "lb", "pool"]),
      algorithm: `"${deployment.algorithm}"`,
      protocol: `"${deployment.protocol}"`,
      health_delay: deployment.health_delay,
      health_retries: deployment.health_retries,
      health_timeout: deployment.health_timeout,
      health_type: `"${deployment.health_type}"`,
      proxy_protocol: `"${deployment.proxy_protocol}"`,
      session_persistence_type: `"${deployment.session_persistence_type}"`,
      session_persistence_app_cookie_name: `"${deployment.session_persistence_app_cookie_name}"`
    },
    allSgIds = [];
  if (deployment.session_persistence_type !== "app_cookie") {
    delete poolValues.session_persistence_app_cookie_name;
  }
  deployment.security_groups.forEach(group => {
    allSgIds.push(
      tfRef(`ibm_is_security_group`, `${deployment.vpc} vpc ${group} sg`)
    );
  });
  lbValues["*security_groups"] = allSgIds;
  lbValues["*subnets"] = [];
  deployment.subnets.forEach(subnet => {
    lbValues["*subnets"].push(subnetRef(deployment.vpc, subnet));
  });

  let poolTf = "";
  let poolMemberRefs = [];
  deployment.target_vsi.forEach(vsi => {
    // fetch vsi
    let vsiDeployment = getObjectFromArray(config.vsi, "name", vsi);
    // for each subnet vsi
    for (let subnet = 0; subnet < vsiDeployment.subnets.length; subnet++) {
      // for each vsi per subnet
      for (let count = 0; count < vsiDeployment.vsi_per_subnet; count++) {
        let vsiAddress = `${deployment.vpc} vpc ${
          vsiDeployment.name
        } vsi ${parseIntFromZone(vsiDeployment.subnets[subnet])} ${count + 1}`;
        let poolMemberAddress = `${deployment.name} ${vsiDeployment.name} ${vsiAddress} pool member`;
        // save ref to add dependencies to listener
        poolMemberRefs.push(
          "ibm_is_lb_pool_member." + snakeCase(poolMemberAddress)
        );
        poolTf += jsonToIac("ibm_is_lb_pool_member", poolMemberAddress, {
          port: deployment.port,
          lb: tfRef("ibm_is_lb", lbName),
          pool: `element(split("/", ${tfRef(
            "ibm_is_lb_pool",
            `${deployment.name} load balancer pool`
          )}), 1)`,
          target_address: tfRef(
            "ibm_is_instance",
            vsiAddress,
            "primary_network_interface.0.primary_ip.0.address"
          )
        });
      }
    }
  });

  return (
    jsonToIac("ibm_is_lb", lbName, lbValues, config) +
    jsonToIac(
      "ibm_is_lb_pool",
      `${deployment.name} load balancer pool`,
      poolValues
    ) +
    poolTf +
    jsonToIac("ibm_is_lb_listener", `${deployment.name} listener`, {
      lb: tfRef("ibm_is_lb", lbName),
      default_pool: tfRef(
        "ibm_is_lb_pool",
        `${deployment.name} load balancer pool`
      ),
      port: deployment.listener_port,
      protocol: `"${deployment.listener_protocol}"`,
      connection_limit: deployment.connection_limit,
      "*depends_on": poolMemberRefs
    })
  );
}

/**
 * vsi terraform
 * @param {Object} config
 * @param {Array<Object>} config.vsi
 * @returns {string} terraform string
 */
function vsiTf(config) {
  let tf = "",
    imageTf = "";
  let allImagesNames = distinct(splat(config.vsi, "image"));
  allImagesNames.forEach(name => {
    imageTf += formatVsiImage(name);
  });
  tf += tfBlock("image data sources", imageTf) + "\n";
  config.vsi.forEach(deployment => {
    let blockData = "";
    deployment.subnets.forEach(subnet => {
      for (let i = 0; i < deployment.vsi_per_subnet; i++) {
        let instance = {};
        transpose(deployment, instance);
        instance.subnet = subnet;
        instance.index = i + 1;
        blockData += formatVsi(instance, config);
      }
    });
    tf += tfBlock(
      `${deployment.vpc} vpc ${deployment.name} deployment`,
      blockData
    );
  });
  return tfDone(tf);
}

/**
 * vsi terraform
 * @param {Object} config
 * @param {Array<Object>} config.load_balancers
 * @returns {string} terraform string
 */
function lbTf(config) {
  let tf = "";
  config.load_balancers.forEach(lb => {
    tf += tfBlock(lb.name + " load balancer", formatLoadBalancer(lb, config));
  });
  return tf;
}

module.exports = {
  formatVsi,
  formatVsiImage,
  formatLoadBalancer,
  vsiTf,
  lbTf
};
