const { kebabCase, contains, snakeCase } = require("lazy-z");

/**
 *
 * @param {*} zone string name of zone
 * @returns string of region for provided zone
 */

function getRegionFromZone(zone) {
  let region = "";
  const regionZoneMap = new Map([
    ["us-east", ["wdc06", "wdc07", "us-east"]],
    ["us-south", ["dal10", "dal12", "us-south"]],
    ["eu-de", ["eu-de-1", "eu-de-2"]],
    ["lon", ["lon04", "lon06"]],
    ["tor", ["tor01"]],
    ["syd", ["syd04", "syd05"]],
    ["tok", ["tok04"]],
    ["br-sao", ["sao01"]],
  ]);

  regionZoneMap.forEach((values, key) => {
    if (contains(values, zone)) region = key;
  });

  return region;
}

/**
 * return functions for powervs api
 * @param {*} axios initialized axios
 * @param {*} controller initialized controller
 * @returns {Promise}
 */
function powerRoutes(axios, controller) {
  /**
   * get power details for a specified powervs workspace guid using resource controller api
   * https://cloud.ibm.com/apidocs/resource-controller/resource-controller#list-resource-instances
   * @param {*} req
   * @param {*} res
   */
  controller.getPowerDetails = function (guid) {
    return new Promise((resolve, reject) => {
      let requestConfig = {
        method: "get",
        url: `https://resource-controller.cloud.ibm.com/v2/resource_instances?guid=${guid}`,
        headers: { Authorization: `Bearer ${controller.token}` },
      };

      return axios(requestConfig)
        .then((response) => {
          resolve(response.data.resources[0]);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  /**
   * get all powervs component type, either images or storage pools
   * powervs api for images: https://cloud.ibm.com/apidocs/power-cloud#pcloud-cloudinstances-images-getall
   * powervs api for storage pools: https://cloud.ibm.com/apidocs/power-cloud#pcloud-storagecapacity-pools-getall
   * @param {*} req
   * @param {*} res
   */
  controller.getPowerComponent = function (req, res) {
    let zone = req.params["region"];
    let componentType = kebabCase(req.params["component"]);
    let region = getRegionFromZone(zone);
    let guid = process.env[`POWER_WORKSPACE_${snakeCase(zone).toUpperCase()}`];

    return new Promise((resolve, reject) => {
      if (guid === undefined) {
        return reject(
          `Error: environment variable POWER_WORKSPACE_${snakeCase(
            zone
          ).toUpperCase()} has no value`
        );
      }
      return controller.getBearerToken().then(() => {
        return controller
          .getPowerDetails(guid)
          .then((powerWorkspaceData) => {
            let requestConfig = {
              method: "get",
              url:
                `https://${region}.power-iaas.cloud.ibm.com/pcloud/v1/cloud-instances/${powerWorkspaceData["guid"]}` +
                `${componentType === "images" ? "" : "/storage-capacity"}` +
                `/${componentType}`,
              headers: {
                Accept: "application/json",
                CRN: `${powerWorkspaceData["crn"]}`,
                Authorization: `Bearer ${controller.token}`,
              },
            };

            return axios(requestConfig);
          })
          .then((response) => {
            resolve(response);
          })
          .catch((error) => {
            reject(error);
          });
      });
    })
      .then((response) => {
        if (componentType === "images") res.send(response.data.images);
        else {
          let formattedStoragePools = [];
          response.data.storagePoolsCapacity.forEach((pool) => {
            formattedStoragePools.push(pool.poolName);
          });
          res.send(formattedStoragePools);
        }
      })
      .catch((error) => {
        console.error(error);
        res.send({ error });
      });
  };
}

module.exports = { powerRoutes };
