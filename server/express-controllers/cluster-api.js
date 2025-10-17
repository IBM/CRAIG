const tar = require("tar-stream");

/**
 * get a list of cluster flavors for a region
 * @param {object} req express request object
 * @param {object} res express resolve object
 */
function clusterRoutes(axios, controller) {
  controller.clusterFlavors = (req, res) => {
    // inherit context with anonymous function
    return controller.sendDataOnTokenValid(res, "flavors", () => {
      let region = req.params["region"];
      let requestConfig = {
        method: "get",
        url: `http://containers.cloud.ibm.com/global/v2/getFlavors?zone=${region}-1&provider=vpc-gen2`,
        headers: {
          Accept: "application/json",
        },
      };
      return axios(requestConfig)
        .then((response) => {
          // inherit context with anonymous function
          // iterate through response object and collect cluster flavors
          let flavors = [];
          response.data.forEach((element) => {
            flavors.push(element.name);
          });
          controller.flavors = flavors;
          res.send(flavors);
        })
        .catch((error) => {
          res.send(error.response);
        });
    });
  };

  controller.clusterVersions = (req, res) => {
    return controller.sendDataOnTokenValid(res, "versions", () => {
      // send request
      let requestConfig = {
        method: "get",
        url: "http://containers.cloud.ibm.com/global/v1/versions",
        headers: {
          Accept: "application/json",
        },
      };
      return axios(requestConfig)
        .then((response) => {
          // use anonymous function here to inherit constructor context
          let versions = [];
          /**
           * add element to versions
           * @param {object} element
           * @param {boolean=} openshift true if openshift
           */
          function addElementToVersions(element, openshift) {
            versions[element.default ? "unshift" : "push"](
              // add to front if default
              `${element.major}.${element.minor}.${element.patch}${
                openshift ? "_openshift" : "" // add type
              }${element.default ? " (Default)" : ""}`
            );
          }

          // collect kube versions
          response.data.kubernetes.forEach((element) => {
            addElementToVersions(element);
          });

          // collect openshift versions
          response.data.openshift.forEach((element) => {
            addElementToVersions(element, true);
          });

          controller.versions = versions;
          res.send(versions);
        })
        .catch((error) => {
          res.send(error.response);
        });
    });
  };
}

module.exports = {
  clusterRoutes,
};
