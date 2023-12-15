const { powerStoragePoolRegionMap } = require("../client/src/lib/constants");
const powerImageMap = require("../client/src/lib/docs/power-image-map-legacy.json");

/**
 * get power images
 * @param {*} zones array of power vs zones
 * @param {*} controller
 * @returns object of zones and their images
 */
function powerImageFetch(zones, controller) {
  console.log("Getting Power VS Images:");
  let zoneImages = {};
  return new Promise((resolve, reject) => {
    function resolveWhenDone() {
      if (Object.keys(zoneImages).length === zones.length) {
        resolve(zoneImages);
      }
    }
    for (let i = 0; i < zones.length; i++) {
      let reqData = { region: zones[i], component: "images" };
      controller({ params: reqData }) // this await enures we wait until the API call is complete to populate the zoneImages object
        .then((res) => res.json())
        .then((data) => {
          zoneImages[zones[i]] = data;
          console.log(`- images fetched for ${zones[i]}`);
          resolveWhenDone();
        })
        .catch(() => {
          zoneImages[zones[i]] = powerImageMap[zones[i].toLowerCase()];
          console.log(`- images fetched for ${zones[i]}`);
          resolveWhenDone();
        });
    }
  });
}

/**
 * get power storage pools
 * @param {*} zones array of power vs zones
 * @param {*} controller
 * @returns object of zones and their storage pools
 */
function powerStoragePoolFetch(zones, controller) {
  console.log("\nGetting Power VS Storage Pools: ");
  let zonePools = {};
  return new Promise((resolve, reject) => {
    for (let i = 0; i < zones.length; i++) {
      function resolveWhenDone() {
        if (Object.keys(zonePools).length === zones.length) {
          resolve(zonePools);
        }
      }
      let reqData = { region: zones[i], component: "storage-pools" };
      controller({ params: reqData }) // this await enures we wait until the API call is complete to populate the zonePools object
        .then((res) => res.json())
        .then((data) => {
          zonePools[zones[i]] = data;
          console.log(`- storage pools fetched for ${zones[i]}`);
          resolveWhenDone();
        })
        .catch(() => {
          zonePools[zones[i]] =
            powerStoragePoolRegionMap[zones[i].toLowerCase()];
          console.log(`- storage pools fetched for ${zones[i]}`);
          resolveWhenDone();
        });
    }
  });
}

/**
 * for each zone fetch zone and pools
 * @returns object with two keys "images" and "pools"
 */
function getImagesAndStoragePools(zones, controller) {
  let images;
  let pools;
  return new Promise((resolve) => {
    function resolveWhenDone() {
      if (images && pools) {
        resolve({
          images,
          pools,
        });
      }
    }
    powerImageFetch(zones, controller).then((data) => {
      images = data;
      resolveWhenDone();
    });
    powerStoragePoolFetch(zones, controller).then((data) => {
      pools = data;
      resolveWhenDone();
    });
  });
}

module.exports = {
  powerImageFetch,
  powerStoragePoolFetch,
  getImagesAndStoragePools,
};
