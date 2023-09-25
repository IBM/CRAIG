const { azsort, prettyJSON } = require("lazy-z");
const tar = require("tar-stream");

function vsiRoutes(axios, controller) {
  /**
   * get a list of instance profiles for vsi within a region
   * @param {object} req express request object
   * @param {object} res express resolve object
   */

  controller.vsiInstanceProfiles = (req, res) => {
    // inherit context with anonymous function
    return controller.sendDataOnTokenValid(res, "instanceProfiles", () => {
      return controller
        .getBearerToken()
        .then(() => {
          let region = req.params["region"];
          let requestConfig = {
            method: "get",
            url: `http://${region}.iaas.cloud.ibm.com/v1/instance/profiles?version=2022-11-15&generation=2`,
            headers: {
              "Accept-Encoding": "application/json",
            },
          };
          requestConfig.headers.Authorization = `Bearer ${controller.token}`;
          return axios(requestConfig);
        })
        .then((response) => {
          // iterate through the response object and collect the instance profile names
          // format: plaintext name (id)
          let instanceProfiles = [];
          response.data.profiles.forEach((element) => {
            instanceProfiles.push(element.name);
          });
          controller.instanceProfiles = instanceProfiles.sort(azsort);
          res.send(instanceProfiles);
        })
        .catch((error) => {
          res.send(error.response);
        });
    });
  };

  /**
   * get a list of images for vsi in a region
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  controller.vsiImages = (req, res) => {
    // inherit context with anonymous function
    return controller.sendDataOnTokenValid(res, "images", () => {
      // get token and use to get vsi images
      return controller
        .getBearerToken()
        .then(() => {
          let region = req.params["region"];
          let requestConfig = {
            method: "get",
            url: `http://${region}.iaas.cloud.ibm.com/v1/images?version=2022-11-15&generation=2`,
            headers: {
              "Accept-Encoding": "application/json",
            },
          };
          requestConfig.headers.Authorization = `Bearer ${controller.token}`;
          return axios(requestConfig);
        })
        .then((response) => {
          // iterate through the response object and collect image names
          let images = [];
          response.data.images.forEach((element) => {
            images.push(
              element.operating_system.display_name + ` [${element.name}]`
            );
          });
          controller.images = images.sort(azsort);
          res.send(images);
        })
        .catch((error) => {
          res.send(error.data);
        });
    });
  };
}

module.exports = {
  vsiRoutes,
};
