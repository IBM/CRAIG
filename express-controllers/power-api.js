const { kebabCase, contains, snakeCase, titleCase } = require("lazy-z");
const powerImageMap = require("../client/src/lib/docs/power-image-map.json");
const { powerStoragePoolRegionMap } = require("../client/src/lib/constants");
const { response } = require("express");

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
    ["eu-es", []],
    ["eu-gb", ["lon04", "lon06"]],
    ["tor", ["tor01"]],
    ["syd", ["syd04", "syd05"]],
    ["tok", ["tok04"]],
    ["br-sao", ["sao01", "sao04"]],
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
  controller.getResourceInstance = function (name) {
    return new Promise((resolve, reject) => {
      let requestConfig = {
        method: "get",
        url: `https://resource-controller.cloud.ibm.com/v2/resource_instances?name=${name}`,
        headers: { Authorization: `Bearer ${controller.token}` },
      };
      console.log("> Fetching data for workspace: " + name + "...");
      return axios(requestConfig).then((response) => {
        let resources = response.data.resources;
        let foundResource;
        resources.forEach((item) => {
          if (contains(item.id, "power-iaas")) {
            foundResource = item;
          }
        });
        if (foundResource) {
          console.log("> Success! Workspace " + name + " found");
          resolve(foundResource);
        } else reject("Error: no power workspace found with name: " + name);
      });
    });
  };

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
    let zone = req.params["zone"];
    let componentType = kebabCase(req.params["component"]);
    let region = getRegionFromZone(zone);
    let guid = req?.query?.name
      ? false
      : process.env[`POWER_WORKSPACE_${snakeCase(zone).toUpperCase()}`];
    let workspaceData;
    return new Promise((resolve, reject) => {
      if (guid === undefined) {
        return reject(
          `Error: environment variable POWER_WORKSPACE_${snakeCase(
            zone
          ).toUpperCase()} has no value.`
        );
      }
      console.log(
        `\n${titleCase(componentType)} request for workspace ${
          guid ? guid : req.query.name
        }...`
      );
      return controller.getBearerToken().then(() => {
        // when getting one by name, use get power details and guid otherwise
        // get resource instance using query name
        // an additional issue will be needed to add this option to the CRAIG api
        // swagger
        return controller[guid ? "getPowerDetails" : "getResourceInstance"](
          guid || req.query.name
        )
          .then((powerWorkspaceData) => {
            workspaceData = powerWorkspaceData;
            if (powerWorkspaceData === undefined) {
              return reject(
                `Error: powerWorkspaceData is undefined. Make sure the guid for your power workspace environment variables exist and are correct.`
              );
            }

            let specificEndpoint = "";
            if (componentType === "images")
              specificEndpoint = `stock-images?sap=true&vtl=true`;
            else specificEndpoint = `storage-capacity/${componentType}`;

            let requestConfig = {
              method: "get",
              url: `https://${region}.power-iaas.cloud.ibm.com/pcloud/v1/cloud-instances/${powerWorkspaceData["guid"]}/${specificEndpoint}`,
              headers: {
                Accept: "application/json",
                CRN: `${powerWorkspaceData["crn"]}`,
                Authorization: `Bearer ${controller.token}`,
              },
            };
            console.log(`> Fetching images...`);
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
        if (componentType === "images") {
          console.log(`Success! Found ${response.data.images.length} images.`);
          if (guid) {
            console.log("Sending images...");
            // if using GUID send list of images
            res.send(response.data.images);
          } else {
            // if looking up by name, search for custom images and add to list
            let requestConfig = {
              method: "get",
              url: `https://${region}.power-iaas.cloud.ibm.com/pcloud/v1/cloud-instances/${workspaceData["guid"]}/images`,
              headers: {
                Accept: "application/json",
                CRN: `${workspaceData["crn"]}`,
                Authorization: `Bearer ${controller.token}`,
              },
            };
            console.log("> Fetching Custom Images...");
            axios(requestConfig).then((imageResponse) => {
              console.log(
                `Success! Found ${imageResponse.data.images.length} custom images.`
              );
              console.log("Sending images...");
              res.send(
                response.data.images.concat(
                  imageResponse.data.images.filter((image) => {
                    image.use_data = true;
                    return image;
                  })
                )
              );
            });
          }
        } else {
          let formattedStoragePools = [];
          response.data.storagePoolsCapacity.forEach((pool) => {
            formattedStoragePools.push(pool.poolName);
          });
          res.send(formattedStoragePools);
        }
      })
      .catch((error) => {
        if (typeof error === "string" && contains(error, ": ")) {
          res.send(error);
        }
        console.error(error + "... Sending hardcoded zone data.");
        if (componentType === "images") {
          return powerImageMap[zone];
        } else {
          return powerStoragePoolRegionMap[zone];
        }
      });
  };
}

module.exports = { powerRoutes };
