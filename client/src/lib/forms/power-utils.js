const powerStoragePoolRegionMap = require("../constants");
const powerImageMap = require("../docs/power-image-map.json");

/**
 * get power images for a single powervs zone
 * @param {*} zone string of zone for images to be fetched
 * @param {*} reactFetch fetch function
 * @returns array of images
 */
const powerImageFetch = (zone, reactFetch) => {
  return reactFetch(`/api/power/${zone}/images`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch(() => {
      return powerImageMap[zone.toLowerCase()];
    });
};

/**
 * get power storage pools for a single powervs zone
 * @param {*} zone
 * @param {*} reactFetch
 */
const powerStoragePoolFetch = (zone, reactFetch) => {
  return reactFetch(`/api/power/${zone}/storage_pools`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => res.json())
    .then((data) => {
      return data;
    })
    .catch(() => {
      return powerStoragePoolRegionMap[zone.toLowerCase()];
    });
};

module.exports = {
  powerImageFetch,
  powerStoragePoolFetch,
};
