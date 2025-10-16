const {
  powerVsInstanceSchema,
} = require("./power-vs-instances/power-instances-schema");
const {
  powerVsInstanceInit,
  powerVsInstanceCreate,
  powerVsInstanceOnStoreUpdate,
  powerVsInstanceSave,
  powerVsInstanceDelete,
} = require("./power-vs-instances/power-vs-instances");
const { shouldDisableComponentSave } = require("./utils");

/**
 * init vtl store
 * @param {*} store
 */
function initVtlStore(store) {
  store.newField("vtl", {
    init: powerVsInstanceInit(true),
    create: powerVsInstanceCreate(true),
    save: powerVsInstanceSave(true),
    onStoreUpdate: powerVsInstanceOnStoreUpdate(true),
    delete: powerVsInstanceDelete(true),
    schema: powerVsInstanceSchema(true),
    shouldDisableSave: shouldDisableComponentSave(
      [
        "name",
        "workspace",
        "network",
        "primary_subnet",
        "ssh_key",
        "image",
        "pi_sys_type",
        "pi_proc_type",
        "pi_processors",
        "pi_memory",
        "pi_storage_type",
        "pi_storage_pool",
        "pi_affinity_volume",
        "pi_affinity_instance",
        "pi_anti_affinity_instance",
        "pi_anti_affinity_volume",
        "pi_license_repository_capacity",
        "storage_option",
      ],
      "vtl",
    ),
  });
}

module.exports = {
  initVtlStore,
};
