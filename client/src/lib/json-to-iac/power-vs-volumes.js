const { snakeCase } = require("lazy-z");
const { jsonToTfPrint, tfBlock } = require("./utils");
const { powerVsWorkspaceRef } = require("./power-vs");

/**
 * format power vs volume
 * @param {*} volume
 * @returns {string} terraform formatted string
 */
function formatPowerVsVolume(volume) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_volume",
    `${snakeCase(volume.workspace)} volume ${snakeCase(volume.name)}`,
    {
      provider: `\${ibm.power_vs${snakeCase("_" + volume.zone)}}`,
      pi_cloud_instance_id: powerVsWorkspaceRef(volume.workspace),
      pi_volume_type: volume.pi_volume_type,
      pi_volume_size: volume.pi_volume_size,
      pi_volume_name: `\${var.prefix}-${snakeCase(volume.workspace)}-${
        volume.name
      }`,
      pi_volume_shareable: volume.pi_volume_shareable,
      pi_replication_enabled: volume.pi_replication_enabled,
    }
  );
}

/**
 * create volume attachment terraform
 * @param {*} volume
 * @param {string} instance plaintext instance name
 * @returns {string} terraform formatted string
 */
function formatPowerVsVolumeAttachment(volume, instance) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_volume_attach",
    `${volume.workspace} attach ${volume.name} to ${instance} instance`,
    {
      provider: `\${ibm.power_vs${snakeCase("_" + volume.zone)}}`,
      pi_cloud_instance_id: powerVsWorkspaceRef(volume.workspace),
      pi_volume_id: `\${ibm_pi_volume.${snakeCase(
        volume.workspace + " volume " + volume.name
      )}.volume_id}`,
      pi_instance_id: `\${ibm_pi_instance.${snakeCase(
        `${volume.workspace}_workspace_instance_${instance}`
      )}.instance_id}`,
    }
  );
}

/**
 * create power terraform file
 * @param {*} config
 */
function powerVsVolumeTf(config) {
  let tf = config.power_volumes && config.power_volumes.length > 0 ? "" : null;
  (config.power_volumes || []).forEach((volume) => {
    let volumeTf = formatPowerVsVolume(volume);
    volume.attachments.forEach((instance) => {
      volumeTf += formatPowerVsVolumeAttachment(volume, instance);
    });
    tf += tfBlock(`Power VS Volume ${volume.name}`, volumeTf) + "\n";
  });
  return tf ? tf.replace(/\n+$/g, "\n") : tf;
}

module.exports = {
  formatPowerVsVolume,
  formatPowerVsVolumeAttachment,
  powerVsVolumeTf,
};
