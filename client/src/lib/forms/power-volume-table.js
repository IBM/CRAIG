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
  let titleName =
    vol.pi_volume_type === "tier5k"
      ? "Fixed IOPs"
      : titleCase(vol.pi_volume_type);
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
    true,
  );
  let volumeAffinityData =
    vol[
      isVolumeAffinity ? "pi_anti_affinity_volume" : "pi_anti_affinity_instance"
    ];
  let titleName =
    vol.pi_volume_type === "tier5k"
      ? "Fixed IOPs"
      : titleCase(vol.pi_volume_type);
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
