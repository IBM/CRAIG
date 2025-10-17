const {
  snakeCase,
  contains,
  getObjectFromArray,
  splatContains,
} = require("lazy-z");
const { jsonToTfPrint, tfBlock, kebabName } = require("./utils");
const { powerVsWorkspaceRef } = require("./power-vs");

/**
 * format power vs volume
 * @param {*} volume
 * @param {*} config
 * @returns {string} terraform formatted string
 */
function formatPowerVsVolume(volume, config) {
  let foundWorkspace = !config?.power
    ? true
    : splatContains(config.power, "name", volume.workspace);
  let data = {
    provider: volume.zone
      ? `\${ibm.power_vs${snakeCase("_" + volume.zone)}}`
      : `\${ibm.power_vs_${snakeCase(
          getObjectFromArray(config.power, "name", volume.workspace).zone,
        )}}`,
    pi_cloud_instance_id: foundWorkspace
      ? powerVsWorkspaceRef(
          volume.workspace,
          config?.power
            ? getObjectFromArray(config.power, "name", volume.workspace)
                .use_data
            : false,
        )
      : "ERROR: Unfound Ref",
    pi_volume_size: Number(volume.pi_volume_size),
    pi_volume_name: kebabName([volume.workspace, volume.name]),
    pi_volume_shareable: volume.pi_volume_shareable,
    pi_replication_enabled: volume.pi_replication_enabled,
  };
  data.pi_volume_type = volume.pi_volume_type;
  if (volume.storage_option !== "None") {
    if (contains(["Affinity", "Anti-Affinity"], volume.storage_option)) {
      data.pi_affinity_policy = volume.pi_affinity_policy;
      // field will be some combination of pi [anti_affinity|affinity] [volume|instance]
      let affinityField = snakeCase(
        `pi ${volume.pi_affinity_policy} ${volume.affinity_type}`,
      );
      if (volume.affinity_type === "Instance") {
        data[affinityField] = `\${ibm_pi_instance.${snakeCase(
          `${volume.workspace}_workspace_instance_${volume[affinityField]}`,
        )}.instance_id}`;
      } else {
        data[affinityField] = `\${ibm_pi_volume.${snakeCase(
          volume.workspace + " volume " + volume[affinityField],
        )}.volume_id}`;
      }
    } else {
      data.pi_volume_pool = volume.pi_volume_pool?.replace(
        " (Replication Enabled)",
        "",
      );
    }
  }
  delete data.index;
  if (volume.count) {
    let volumeTf = "";
    for (let i = 1; i <= Number(volume.count); i++) {
      let volumeData = { ...data }; // create copy
      // add volume number to name
      volumeData.pi_volume_name += "-" + i;
      volumeTf += jsonToTfPrint(
        "resource",
        "ibm_pi_volume",
        `${snakeCase(volume.workspace)} volume ${snakeCase(volume.name)} ${i}`,
        volumeData,
      );
    }
    return volumeTf;
  } else
    return jsonToTfPrint(
      "resource",
      "ibm_pi_volume",
      `${snakeCase(volume.workspace)} volume ${snakeCase(volume.name)}`,
      data,
    );
}

/**
 * create volume attachment terraform
 * @param {*} volume
 * @param {string} instance plaintext instance name
 * @param {string=} lastAttachment previous volume attchment for reference
 * @returns {string} terraform formatted string
 */
function formatPowerVsVolumeAttachment(
  volume,
  instance,
  lastAttachment,
  config,
  count,
) {
  let volumeData = {
    provider: volume.zone
      ? `\${ibm.power_vs${snakeCase("_" + volume.zone)}}`
      : `\${ibm.power_vs_${snakeCase(
          getObjectFromArray(config.power, "name", volume.workspace).zone,
        )}}`,
    pi_cloud_instance_id: powerVsWorkspaceRef(
      volume.workspace,
      config?.power
        ? getObjectFromArray(config.power, "name", volume.workspace).use_data
        : false,
    ),
    pi_volume_id: `\${ibm_pi_volume.${snakeCase(
      volume.workspace + " volume " + volume.name,
    )}${count ? "_" + count : ""}.volume_id}`,
    pi_instance_id: contains(instance, "VTL")
      ? `\${ibm_pi_instance.${snakeCase(
          volume.workspace +
            " falconstor vtl " +
            instance.replace(/\s\(VTL\)/, ""),
        )}.instance_id}`
      : `\${ibm_pi_instance.${snakeCase(
          `${volume.workspace}_workspace_instance_${instance}`,
        )}.instance_id}`,
    lifecycle: [
      {
        ignore_changes: ["${pi_cloud_instance_id}", "${pi_volume_id}"],
      },
    ],
  };
  if (lastAttachment) {
    volumeData.depends_on = [lastAttachment];
  }
  return jsonToTfPrint(
    "resource",
    "ibm_pi_volume_attach",
    `${volume.workspace} attach ${
      volume.name + (count ? "-" + count : "")
    } to ${
      instance.replace(/\s\(VTL\)/, "") +
      (contains(instance, "(") ? "_vtl" : "")
    } instance`,
    volumeData,
  );
}

/**
 * create power terraform file
 * @param {*} config
 */
function powerVsVolumeTf(config) {
  let tf = config.power_volumes && config.power_volumes.length > 0 ? "" : null;
  let lastAttachmentAddress;
  (config.power_volumes || []).forEach((volume) => {
    let volumeTf = formatPowerVsVolume(volume, config);
    volume.attachments.forEach((instance) => {
      let count = volume.count;
      for (let i = 0; count ? i < volume.count : i < 1; i++) {
        volumeTf += formatPowerVsVolumeAttachment(
          volume,
          instance,
          lastAttachmentAddress,
          config,
          count ? i + 1 : undefined,
        );
        lastAttachmentAddress = `\${ibm_pi_volume_attach.${snakeCase(
          `${volume.workspace} attach ${volume.name}${
            count ? "_" + (i + 1) : ""
          } to ${instance.replace(/\s\(VTL\)/, "_vtl")} instance`,
        )}}`;
      }
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
