const { revision, titleCase, isNullOrEmptyString } = require("lazy-z");

/**
 * get volume affinity name for display
 * @param {*} vol volume object
 * @returns {string} name to display
 */
function getAffinityName(vol, craig) {
  let isVolumeAffinity = isNullOrEmptyString(vol.pi_affinity_instance, true);
  let volumeAffinityData =
    vol[isVolumeAffinity ? "pi_affinity_volume" : "pi_affinity_instance"];
  let data = new revision(craig.store.json).child(
    isVolumeAffinity ? "power_volumes" : "power_instances",
    volumeAffinityData
  ).data;
  let titleName = titleCase(
    !data?.storage_option
      ? ""
      : isVolumeAffinity && data.storage_option === "Storage Type"
      ? data.pi_volume_type
      : isVolumeAffinity
      ? data.pi_volume_pool
      : data.storage_option === "Storage Type"
      ? data.pi_storage_type
      : data.pi_storage_pool
  );
  return `Affinity ${
    isVolumeAffinity ? "Volume" : "Instance"
  } ${volumeAffinityData} (${titleName})`;
}

/**
 * get volume affinity name for display
 * @param {*} vol volume object
 * @returns {string} name to display
 */
function getAntiAffinityName(vol, craig) {
  let isVolumeAffinity = isNullOrEmptyString(
    vol.pi_anti_affinity_instance,
    true
  );
  let volumeAffinityData =
    vol[
      isVolumeAffinity ? "pi_anti_affinity_volume" : "pi_anti_affinity_instance"
    ];
  let data = new revision(craig.store.json).child(
    isVolumeAffinity ? "power_volumes" : "power_instances",
    volumeAffinityData
  ).data;
  let titleName = titleCase(
    isVolumeAffinity && data.storage_option === "Storage Type"
      ? data.pi_volume_type
      : isVolumeAffinity
      ? data.pi_volume_pool
      : data.storage_option === "Storage Type"
      ? data.pi_storage_type
      : data.pi_storage_pool
  );
  return `Anti-Affinity ${
    isVolumeAffinity ? "Volume" : "Instance"
  } ${volumeAffinityData} (${titleName})`;
}

/**
 * get volume affinity name for display
 * @param {*} vol volume object
 * @param {*} craig craig object
 * @returns {string} name to display
 */
function getVolumeDisplayName(vol, craig) {
  return !vol?.storage_option || vol.storage_option === "Storage Type"
    ? titleCase(vol.pi_volume_type)
    : vol.storage_option === "Storage Pool"
    ? titleCase(vol.pi_volume_pool)
    : vol.storage_option === "Affinity"
    ? getAffinityName(vol, craig)
    : getAntiAffinityName(vol, craig);
}

module.exports = {
  getVolumeDisplayName,
};
