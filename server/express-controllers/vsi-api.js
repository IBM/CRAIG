const { azsort } = require("lazy-z");

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
            url: `http://${region}.iaas.cloud.ibm.com/v1/instance/profiles?version=2022-11-15&generation=2&limit=100&status=available`,
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
   * recursive call to get images for vsi
   * @param {object} req express request object
   * @param {object} res express resolve object
   * @param {string} sToken token to retrieve next page of images
   * @returns
   */
  controller.imageGet = (req, res, sToken) => {
    return controller.getBearerToken().then(() => {
      let region = req.params["region"];
      let requestConfig = {
        method: "get",
        url: sToken
          ? `http://${region}.iaas.cloud.ibm.com/v1/images?version=2024-03-12&generation=2&limit=100&status=available&start=${sToken}`
          : `http://${region}.iaas.cloud.ibm.com/v1/images?version=2024-03-12&generation=2&limit=100&status=available`,
        headers: {
          "Accept-Encoding": "application/json",
        },
      };
      requestConfig.headers.Authorization = `Bearer ${controller.token}`;
      return axios(requestConfig)
        .then((response) => {
          response.data.images.forEach((element) => {
            controller.images.push(
              element.operating_system.display_name + ` [${element.name}]`,
            );
          });
          if (response.data.total_count > 100) {
            let start_token = response.data.next.href.match(
              /(?<=start=)[A-Za-z0-9]*/gm,
            );
            controller.imageGet(req, res, start_token);
          } else {
            controller.images = controller.images.sort(azsort);
            res.send(controller.images);
          }
        })
        .catch((error) => {
          res.send(error.data);
        });
    });
  };

  /**
   * get a list of images for vsi in a region
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  controller.vsiImages = (req, res) => {
    controller.images = [];
    // inherit context with anonymous function
    return controller.sendDataOnTokenValid(res, "images", () => {
      // get token and use to get vsi images
      return controller.imageGet(req, res);
    });
  };

  /**
   * route for getting vsi snapshots
   * @param {*} req
   * @param {*} res
   * @returns {Promise} get promise
   */
  controller.vsiSnapShots = (req, res) => {
    return controller
      .getBearerToken()
      .then(() => {
        let region = req.params["region"];
        let requestConfig = {
          method: "get",
          url: `https://${region}.iaas.cloud.ibm.com/v1/snapshots?version=2024-03-19&generation=2`,
          headers: {
            "Accept-Encoding": "application/json",
            Authorization: `Bearer ${controller.token}`,
          },
        };
        return axios(requestConfig);
      })
      .then((response) => {
        let snapshots = [];
        response.data.snapshots.forEach((item) => {
          snapshots.push(item.name);
        });
        res.send(snapshots);
      })
      .catch((err) => {
        res.send(err.data);
      });
  };
}

module.exports = {
  vsiRoutes,
};
