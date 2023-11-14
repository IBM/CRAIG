const { RegexButWithWords } = require("regex-but-with-words");

// sap calculations based on EPX arch
// https://github.com/terraform-ibm-modules/terraform-ibm-powervs-sap/tree/main

/**
 * use a profile to calculate sap hana size
 * @param {string} profile
 * @returns {number} memory size
 */
function calculateSapHanaMemory(profile) {
  let memory = parseInt(
    profile.replace(
      new RegexButWithWords()
        .negatedSet("x")
        .anyNumber()
        .literal("x")
        .done("g"),
      ""
    )
  );
  if (memory < 256) {
    // all volume sizes must be at least 256 regardless of memory
    return 256;
  } else return memory;
}

/**
 * calculate sap data volume size
 * @param {string} profile
 * @returns {number} size for data volume
 */
function calculateSapDataVolumeSize(profile) {
  // create four volumes to match minimum size based on memory
  // for supported SAP configurations
  let memory = calculateSapHanaMemory(profile);
  return Math.floor((memory * 1.1) / 4) + 1;
}

/**
 * calculate sap log volume size
 * @param {string} profile
 * @returns {number} size for data volume
 */
function calculateSapLogVolumeSize(profile) {
  // create four volumes to match minimum size based on memory
  // for supported SAP configurations
  let memory = calculateSapHanaMemory(profile);
  let memoryFloor = Math.floor((memory * 0.5) / 4) + 1;
  return memoryFloor > 512 ? 512 : memoryFloor;
}

/**
 * calculate sap shared volume size
 * @param {string} profile
 * @returns {number} size for data volume
 */
function calculateSapSharedVolumeSize(profile) {
  // max shared size is 1TB, otherwise based on memory
  let memory = calculateSapHanaMemory(profile);
  return memory > 1024 ? 1024 : memory;
}

/**
 * get a list of sap volumes based on desired profile
 * @param {*} profile
 * @param {string=} workspace
 * @param {string=} instanceName
 * @returns {Array<object>}
 */
function getSapVolumeList(profile, workspace, instanceName, zone) {
  let volumes = [];
  ["data", "log", "shared"].forEach((type) => {
    let size =
      type === "data"
        ? calculateSapDataVolumeSize(profile)
        : type === "log"
        ? calculateSapLogVolumeSize(profile)
        : calculateSapSharedVolumeSize(profile);
    let isShared = type === "shared";
    for (let i = 0; i < (isShared ? 1 : 4); i++) {
      volumes.push({
        name: `${instanceName ? instanceName + "-sap-" : ""}${type}${
          isShared ? "" : "-" + (i + 1)
        }`,
        mount: `/hana/${type}`,
        pi_volume_size: size,
        pi_volume_type: isShared ? "tier3" : "tier1",
        workspace: workspace,
        sap: true,
        attachments: instanceName ? [instanceName] : [],
        zone: zone,
        storage_option: "Storage Type",
        affinity_type: null,
      });
    }
  });
  return volumes;
}

module.exports = {
  calculateSapHanaMemory,
  calculateSapDataVolumeSize,
  calculateSapLogVolumeSize,
  calculateSapSharedVolumeSize,
  getSapVolumeList,
};
