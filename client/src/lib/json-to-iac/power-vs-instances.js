const { powerVsWorkspaceRef } = require("./power-vs");
const { jsonToTfPrint, tfBlock, timeouts, kebabName } = require("./utils");
const {
  snakeCase,
  isNullOrEmptyString,
  transpose,
  getObjectFromArray,
  revision,
  splatContains,
  contains,
} = require("lazy-z");

/**
 * get power vs instance data
 * @param {*} instance
 * @param {*} config
 * @returns {object} data object
 */
function powerVsInstanceData(instance, config) {
  let manualVsiNaming = config?._options?.manual_power_vsi_naming;
  let foundWorkspace = !config?.power
    ? true
    : splatContains(config.power, "name", instance.workspace);
  let piKeyPairUseData = !config?.power
    ? ""
    : (
        foundWorkspace
          ? new revision(config)
              .child("power", instance.workspace)
              .child("ssh_keys", instance.ssh_key).data?.use_data
          : false
      )
    ? "data."
    : "";
  let imageUseData = !config?.power
    ? ""
    : (
        foundWorkspace
          ? new revision(config)
              .child("power", instance.workspace)
              .child("images", instance.image).data?.use_data
          : false
      )
    ? "data."
    : "";
  let data = {
    provider: `\${ibm.power_vs${snakeCase("_" + instance.zone)}}`,
    pi_image_id: foundWorkspace
      ? `\${${imageUseData}ibm_pi_image.power_image_${snakeCase(
          instance.workspace
        )}_${snakeCase(instance.image)}.${imageUseData ? "id" : "image_id"}}`
      : "${ERROR: Unfound Ref}",
    pi_key_pair_name: foundWorkspace
      ? `\${${piKeyPairUseData}ibm_pi_key.power_vs_ssh_key_${snakeCase(
          instance.ssh_key
        )}.pi_key_name}`
      : "${ERROR: Unfound Ref}",
    pi_cloud_instance_id: foundWorkspace
      ? powerVsWorkspaceRef(
          instance.workspace,
          config?.power
            ? getObjectFromArray(config.power, "name", instance.workspace)
                .use_data
            : false
        )
      : "${ERROR: Unfound Ref}",
    pi_instance_name: (manualVsiNaming ? "" : "${var.prefix}-") + instance.name,
  };
  transpose(instance, data);
  delete data.index;
  if (data.pi_ibmi_css === false) {
    delete data.pi_ibmi_css;
  }

  if (data.pi_ibmi_pha === false) {
    delete data.pi_ibmi_pha;
  }

  if (isNullOrEmptyString(data.pi_ibmi_rds_users)) {
    delete data.pi_ibmi_rds_users;
  }

  if (isNullOrEmptyString(data.pi_pin_policy)) {
    delete data.pi_pin_policy;
  }

  if (!data.pi_license_repository_capacity) {
    delete data.pi_license_repository_capacity;
  }

  if (!data.pi_storage_pool) {
    delete data.pi_storage_pool;
  } else {
    data.pi_storage_pool = data.pi_storage_pool.replace(
      " (Replication Enabled)",
      ""
    );
  }

  // add pi network here to have the items at the bottom of the terraform code
  data.pi_network = [];
  instance.network.forEach((nw) => {
    let networkUseData = !config?.power
      ? ""
      : (
          foundWorkspace
            ? new revision(config)
                .child("power", instance.workspace)
                .child("network", nw.name).data.use_data
            : "${Error: Unfound Ref}"
        )
      ? "data."
      : "";
    let nwData = {
      network_id: foundWorkspace
        ? `\${${networkUseData}ibm_pi_network.power_network_${snakeCase(
            instance.workspace
          )}_${snakeCase(nw.name)}.${networkUseData ? "id" : "network_id"}}`
        : "${ERROR: Unfound Ref}",
    };
    if (!isNullOrEmptyString(nw.ip_address)) {
      nwData.ip_address = nw.ip_address;
    }
    data.pi_network.push(nwData);
  });

  if (
    contains([null, "", "None", undefined], instance.pi_shared_processor_pool)
  ) {
    delete data.pi_shared_processor_pool;
  } else {
    data.pi_shared_processor_pool = `\${ibm_pi_shared_processor_pool.${snakeCase(
      instance.workspace
    )}_workspace_${
      data.pi_shared_processor_pool
    }_processor_pool.shared_processor_pool_id}`;
  }

  if (contains([null, "", "None", undefined], instance.pi_placement_group_id)) {
    delete data.pi_placement_group_id;
  } else {
    data.pi_placement_group_id = `\${ibm_pi_placement_group.${snakeCase(
      instance.workspace
    )}_workspace_${snakeCase(
      data.pi_placement_group_id
    )}_placement_group.placement_group_id}`;
  }

  data.timeouts = timeouts("3h");

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
  if (data.sap_profile) {
    data.pi_sap_profile_id = data.sap_profile;
    delete data.pi_proc_type;
    delete data.pi_processors;
    delete data.pi_memory;
  }
  delete data.sap;
  delete data.sap_profile;
  delete data.primary_subnet;
  delete data.pi_user_data;
  if (!isNullOrEmptyString(instance.pi_user_data, true)) {
    data.pi_user_data = `\${<<USER_DATA\n${instance.pi_user_data}\n  USER_DATA}`;
  }
  return data;
}

/**
 * format power vs instance
 * @param {*} instance
 * @returns {string} terraform formatted json
 */
function formatPowerVsInstance(instance, config) {
  return jsonToTfPrint(
    "resource",
    "ibm_pi_instance",
    `${instance.workspace}_workspace_instance_${instance.name}`,
    powerVsInstanceData(instance, config)
  );
}

/**
 * create flaconstor
 * @param {*} instance
 * @param {*} config craig json
 * @returns {string} terraform formatted json
 */
function formatFalconStorInstance(instance, config) {
  let data = powerVsInstanceData(instance, config);
  return jsonToTfPrint(
    "resource",
    "ibm_pi_instance",
    `${instance.workspace}_falconstor_vtl_${instance.name}`,
    data
  );
}

/**
 * create power vs shared processor pool
 * @param {*} pool
 * @returns {string} terraform
 */
function formatSharedProcessorPool(pool, config) {
  let foundWorkspace = !config?.power
    ? true
    : splatContains(config.power, "name", pool.workspace);
  return jsonToTfPrint(
    "resource",
    "ibm_pi_shared_processor_pool",
    `${pool.workspace} workspace ${pool.name} processor pool`,
    {
      provider: `\${ibm.power_vs${snakeCase("_" + pool.zone)}}`,
      pi_cloud_instance_id: foundWorkspace
        ? powerVsWorkspaceRef(
            pool.workspace,
            config?.power
              ? getObjectFromArray(config.power, "name", pool.workspace)
                  .use_data
              : false
          )
        : "${ERROR: Unfound Ref}",
      pi_shared_processor_pool_host_group:
        pool.pi_shared_processor_pool_host_group,
      pi_shared_processor_pool_reserved_cores:
        pool.pi_shared_processor_pool_reserved_cores,
      pi_shared_processor_pool_name: pool.name,
    }
  );
}

/**
 * create power vs placement group
 * @param {*} group
 * @returns {string} terraform
 */
function formatPlacementGroup(group, config) {
  let foundWorkspace = !config?.power
    ? true
    : splatContains(config.power, "name", group.workspace);
  return jsonToTfPrint(
    "resource",
    "ibm_pi_placement_group",
    `${group.workspace} workspace ${group.name} placement group`,
    {
      provider: `\${ibm.power_vs${snakeCase("_" + group.zone)}}`,
      pi_cloud_instance_id: foundWorkspace
        ? powerVsWorkspaceRef(
            group.workspace,
            config?.power
              ? getObjectFromArray(config.power, "name", group.workspace)
                  .use_data
              : false
          )
        : "${ERROR: Unfound Ref}",
      pi_placement_group_policy: group.pi_placement_group_policy,
      pi_placement_group_name: kebabName([group.name]),
    }
  );
}

/**
 * create power instance tf
 * @param {*} config
 * @returns {string} terraform file
 */
function powerInstanceTf(config) {
  let tf = "";
  (config.power_shared_processor_pools || []).forEach((pool) => {
    tf +=
      tfBlock(
        `${pool.name} Processor Pool`,
        formatSharedProcessorPool(pool, config)
      ) + "\n";
  });
  (config.power_placement_groups || []).forEach((pool) => {
    tf +=
      tfBlock(
        `${pool.name} Placement Group`,
        formatPlacementGroup(pool, config)
      ) + "\n";
  });
  (config.power_instances || []).forEach((instance) => {
    tf +=
      tfBlock(
        `${instance.name} Power Instance`,
        formatPowerVsInstance(instance, config)
      ) + "\n";
  });
  (config.vtl || []).forEach((instance) => {
    tf +=
      tfBlock(
        `${instance.name} FalconStor VTL`,
        formatFalconStorInstance(instance, config)
      ).replace("Falcon Stor", "FalconStor") + "\n";
  });
  return tf ? tf.replace(/\n+$/g, "\n") : tf;
}

module.exports = {
  formatPowerVsInstance,
  powerInstanceTf,
  formatFalconStorInstance,
  formatSharedProcessorPool,
  formatPlacementGroup,
};
