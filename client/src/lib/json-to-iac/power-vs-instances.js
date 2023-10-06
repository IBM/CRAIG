const { powerVsWorkspaceRef } = require("./power-vs");
const { jsonToTfPrint, tfBlock } = require("./utils");
const { snakeCase, isNullOrEmptyString, transpose } = require("lazy-z");

/**
 * format power vs instance
 * @param {*} instance
 * @returns {string} terraform formatted json
 */
function formatPowerVsInstance(instance) {
  let data = {
    provider: `\${ibm.power_vs${snakeCase("_" + instance.zone)}}`,
    pi_image_id: `\${ibm_pi_image.power_image_${snakeCase(
      instance.workspace
    )}_${snakeCase(instance.image)}.image_id}`,
    pi_key_pair_name: `\${ibm_pi_key.power_vs_ssh_key_${snakeCase(
      instance.ssh_key
    )}.pi_key_name}`,
    pi_cloud_instance_id: powerVsWorkspaceRef(instance.workspace),
    pi_instance_name: "${var.prefix}-" + instance.name,
  };
  transpose(instance, data);
  // add pi network here to have the items at the bottom of the terraform code
  data.pi_network = [];
  instance.network.forEach((nw) => {
    let nwData = {
      network_id: `\${ibm_pi_network.power_network_${snakeCase(
        instance.workspace
      )}_${snakeCase(nw.name)}.network_id}`,
    };
    if (!isNullOrEmptyString(nw.ip_address)) {
      nwData.ip_address = nw.ip_address;
    }
    data.pi_network.push(nwData);
  });
  [
    "network",
    "zone",
    "workspace",
    "image",
    "ssh_key",
    "name",
    "storage_option",
  ].forEach((field) => {
    delete data[field];
  });
  if (data.pi_affinity_policy) {
    delete data.pi_storage_type;
    delete data.pi_storage_pool;
    if (data.pi_affinity_policy === "affinity") {
      delete data.pi_anti_affinity_instance;
      delete data.pi_anti_affinity_volume;
      if (data.affinity_type === "Instance") {
        // affinity instance
        delete data.pi_affinity_volume;
        data.pi_affinity_instance = `\${ibm_pi_instance.${snakeCase(
          `${instance.workspace}_workspace_instance_${instance.pi_affinity_instance}`
        )}.instance_id}`;
      } else {
        // affinity volume
        delete data.pi_affinity_instance;
        data.pi_affinity_volume = `\${ibm_pi_volume.${snakeCase(
          instance.workspace + " volume " + instance.pi_affinity_volume
        )}.volume_id}`;
      }
    } else {
      delete data.pi_affinity_instance;
      delete data.pi_affinity_volume;
      if (data.affinity_type === "Instance") {
        // anti affinity instance
        delete data.pi_anti_affinity_volume;
        data.pi_anti_affinity_instance = `\${ibm_pi_instance.${snakeCase(
          `${instance.workspace}_workspace_instance_${instance.pi_anti_affinity_instance}`
        )}.instance_id}`;
      } else {
        // anti affinity volume
        delete data.pi_anti_affinity_instance;
        data.pi_anti_affinity_volume = `\${ibm_pi_volume.${snakeCase(
          instance.workspace + " volume " + instance.pi_anti_affinity_volume
        )}.volume_id}`;
      }
    }
    delete data.affinity_type;
  } else {
    // remove extra fields for storage pool / type
    delete data.pi_affinity_policy;
    delete data.pi_affinity_volume;
    delete data.pi_affinity_instance;
    delete data.affinity_type;
    delete data.pi_anti_affinity_instance;
    delete data.pi_anti_affinity_volume;
    if (!data.pi_storage_type) {
      delete data.pi_storage_type;
    }
  }
  return jsonToTfPrint(
    "resource",
    "ibm_pi_instance",
    `${instance.workspace}_workspace_instance_${instance.name}`,
    data
  );
}

/**
 * create power instance tf
 * @param {*} config
 * @returns {string} terraform file
 */
function powerInstanceTf(config) {
  // for some reason i do not understand this code didn't work in config-to-files
  // after spending about 30 mins debugging i moved it here and now it works great
  let tf =
    config.power_instances && config.power_instances.length > 0 ? "" : null;
  (config.power_instances || []).forEach((instance) => {
    tf +=
      tfBlock(
        `${instance.name} Power Instance`,
        formatPowerVsInstance(instance)
      ) + "\n";
  });
  return tf ? tf.replace(/\n+$/g, "\n") : tf;
}

module.exports = {
  formatPowerVsInstance,
  powerInstanceTf,
};
