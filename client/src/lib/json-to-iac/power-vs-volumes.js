const { snakeCase } = require("lazy-z");
const { jsonToTfPrint } = require("./utils");
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
 * @param {*} attachment
 * @returns {string} terraform formatted string
 */
function formatPowerVsVolumeAttachment(attachment) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_volume_attach",
    `${attachment.workspace} attach ${attachment.volume} to ${attachment.instance} instance`,
    {
      provider: `\${ibm.power_vs${snakeCase("_" + attachment.zone)}}`,
      pi_cloud_instance_id: powerVsWorkspaceRef(attachment.workspace),
      pi_volume_id: `\${ibm_pi_volume.${snakeCase(
        attachment.workspace + " volume " + attachment.volume
      )}.volume_id}`,
      pi_instance_id: `\${ibm_pi_instance.${snakeCase(
        `${attachment.workspace}_workspace_instance_${attachment.instance}`
      )}.instance_id}`,
    }
  );
}

module.exports = {
  formatPowerVsVolume,
  formatPowerVsVolumeAttachment,
};
