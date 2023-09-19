const { azsort, prettyJSON } = require("lazy-z");
const tar = require("tar-stream");
const { packTar } = require("../lib/tar-utils");
const FormData = require("form-data");
const { configToFilesJson } = require("../client/src/lib");
const blobStream = require("blob-stream");

/**
 * controller constructor
 * @param {*} axios initialized axios package
 */
function controller(axios) {
  this.token = null; // access token
  this.expiration = null; // token expiration
  this.versions = []; // list of kube versions
  this.flavors = []; // list of kube flavors
  this.instanceProfiles = []; // list of vsi instance profiles
  this.images = []; // list of vsi images
  this.uploadResponse = null;

  /**
   * check if a token is expired
   * @returns {boolean} true if expired
   */
  this.tokenIsExpired = () => {
    return !this.expiration || !this.token
      ? true
      : this.expiration <= Math.floor(Date.now() / 1000);
  };

  /**
   * send data from constructor when a valid token and data are found
   * by using this we can cut down on the number of needed api calls by
   * storing the data locally for a small period of time
   * @param {*} res express resolve object
   * @param {string} field name of local data store
   * @param {Promise} callback promise to return
   * @returns {Promise} promise to return data
   */
  this.sendDataOnTokenValid = (res, field, callback) => {
    if (this.tokenIsExpired() === false && this[field].length > 0) {
      return this.passThroughPromise(res, this[field]);
    } else {
      return callback();
    }
  };

  /**
   * pass through promise function to resolve when no api call needed
   * @param {*} res express resolve
   * @param {*} value arbitrary value
   * @returns {Promise}
   */
  this.passThroughPromise = (res, value) => {
    return new Promise((resolve, reject) => {
      resolve();
    }).then(() => {
      res.send(value);
    });
  };

  /**
   * get authorization token to use ibmcloud api
   * @return {string} returns an access token
   */
  this.getBearerToken = () => {
    return new Promise((resolve, reject) => {
      if (this.tokenIsExpired()) {
        // send request to IBM Cloud IAM endpoint to get access token if no token present or if expired
        let requestConfig = {
          method: "post",
          url: `https://iam.cloud.ibm.com/identity/token?grant_type=urn:ibm:params:oauth:grant-type:apikey&apikey=${process.env.API_KEY}`,
          headers: {
            Accept: "application/json",
          },
        };
        axios(requestConfig)
          .then((response) => {
            this.token = response.data.access_token;
            this.expiration = response.data.expiration;
            resolve(response.data.access_token);
          })
          .catch((error) => {
            this.expiration = undefined;
            reject(error);
          });
      } else {
        // token present and not expired
        resolve(this.token);
      }
    });
  };

  /**
   * get a list of instance profiles for vsi within a region
   * @param {object} req express request object
   * @param {object} res express resolve object
   */

  this.vsiInstanceProfiles = (req, res) => {
    // inherit context with anonymous function
    return this.sendDataOnTokenValid(res, "instanceProfiles", () => {
      return this.getBearerToken()
        .then(() => {
          let region = req.params["region"];
          let requestConfig = {
            method: "get",
            url: `http://${region}.iaas.cloud.ibm.com/v1/instance/profiles?version=2022-11-15&generation=2`,
            headers: {
              "Accept-Encoding": "application/json",
            },
          };
          requestConfig.headers.Authorization = `Bearer ${this.token}`;
          return axios(requestConfig);
        })
        .then((response) => {
          // iterate through the response object and collect the instance profile names
          // format: plaintext name (id)
          let instanceProfiles = [];
          response.data.profiles.forEach((element) => {
            instanceProfiles.push(element.name);
          });
          this.instanceProfiles = instanceProfiles.sort(azsort);
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
  this.vsiImages = (req, res) => {
    // inherit context with anonymous function
    return this.sendDataOnTokenValid(res, "images", () => {
      // get token and use to get vsi images
      return this.getBearerToken()
        .then(() => {
          let region = req.params["region"];
          let requestConfig = {
            method: "get",
            url: `http://${region}.iaas.cloud.ibm.com/v1/images?version=2022-11-15&generation=2`,
            headers: {
              "Accept-Encoding": "application/json",
            },
          };
          requestConfig.headers.Authorization = `Bearer ${this.token}`;
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
          this.images = images.sort(azsort);
          res.send(images);
        })
        .catch((error) => {
          res.send(error.data);
        });
    });
  };

  /**
   * get a list of cluster flavors for a region
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  this.clusterFlavors = (req, res) => {
    // inherit context with anonymous function
    return this.sendDataOnTokenValid(res, "flavors", () => {
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
          this.flavors = flavors;
          res.send(flavors);
        })
        .catch((error) => {
          res.send(error.response);
        });
    });
  };

  /**
   * clusterVersions
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  this.clusterVersions = (req, res) => {
    return this.sendDataOnTokenValid(res, "versions", () => {
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

          this.versions = versions;
          res.send(versions);
        })
        .catch((error) => {
          res.send(error.response);
        });
    });
  };

  /**
   * get details about provided workspace
   * @param {string} workspaceName
   * @returns {Promise}
   */
  this.getWorkspaceData = function (workspaceName) {
    return new Promise((resolve, reject) => {
      return this.getBearerToken()
        .then(() => {
          let requestConfig = {
            method: "get",
            url: "https://schematics.cloud.ibm.com/v1/workspaces",
            headers: {
              Accept: "application/json",
              Authorization: this.token,
            },
          };

          return axios(requestConfig);
        })
        .then((response) => {
          let workspaces = response.data.workspaces;
          let data = { w_id: "", t_id: "" };
          workspaces.forEach((workspace) => {
            if (workspace.name === workspaceName) {
              data.w_id = workspace.id;
              data.t_id = workspace.template_data[0].id;
            }
          });
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  };

  /**
   * pipes the tar content to an in memory Blob which is then used to return a promise of an ArrayBuffer
   * @param {*} pack tar stream pack object
   * @returns {Promise}
   */
  this.createBlob = function (pack) {
    return new Promise((resolve) => {
      pack.pipe(blobStream()).on("finish", function () {
        resolve(this.toBlob("application/x-tar").arrayBuffer());
      });
    });
  };

  /**
   * uploads given file to specified workspace, see https://cloud.ibm.com/apidocs/schematics/schematics#template-repo-upload
   * @param {object} req express request object
   * @param {object} res express resolve object
   * @returns {Promise}
   */
  this.uploadTar = (req, res) => {
    let workspaceName = req.params["workspaceName"];
    let craigJson = req.body;
    let tarFile = "craig.tar";
    let forceTarPackFail = req.params?.forceFail;
    let workspaceData;
    let internalCall = req.params["internalCall"];
    return new Promise((resolve, reject) => {
      this.getWorkspaceData(workspaceName)
        .then((wsData) => {
          workspaceData = wsData;
          return this.getBearerToken();
        })
        .then(() => {
          let fileMap = configToFilesJson(craigJson, true);
          if (fileMap) {
            // create tar
            let pack = tar.pack();
            try {
              if (forceTarPackFail) {
                fileMap = 5;
              }
              packTar(pack, tarFile.slice(0, tarFile.length - 4), fileMap);
              pack.finalize();
              // call create blob to get ArrayBuffer for Blob
              return this.createBlob(pack);
            } catch (err) {
              reject("Error: failed to pack tar file");
            }
          } else {
            reject("Error: failed to parse CRAIG data");
          }
        })
        .then((blob) => {
          // create FormData from blob ArrayBuffer
          let data = new FormData();
          data.append("file", Buffer.from(blob), {
            filename: tarFile,
          });

          let requestConfig = {
            method: "put",
            url: `https://schematics.cloud.ibm.com/v1/workspaces/${workspaceData.w_id}/template_data/${workspaceData.t_id}/template_repo_upload`,
            headers: {
              Authorization: this.token,
              "Content-Type": "multipart/form-data",
            },
            data: data,
          };
          return axios(requestConfig);
        })
        .then((response) => {
          let respData = response.data;
          if (respData.has_received_file !== true) {
            respData = Error(
              `${workspaceName} has not received file. In uploadTar response data, has_received_file is false`
            );
          }
          this.uploadResponse = response.data;
          resolve(respData);
        });
    })
      .then((data) => {
        if (!internalCall) res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  };

  /**
   * creates schematics workspace https://cloud.ibm.com/apidocs/schematics/schematics#create-workspace
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  this.createWorkspace = (req, res) => {
    let workspaceName = req.params["workspaceName"];
    let region = req.params["region"];
    let resourceGroup = req.params["resourceGroup"];
    let internalCall = req.params["internalCall"];
    return new Promise((resolve, reject) => {
      return this.getBearerToken()
        .then(() => {
          let data = prettyJSON({
            name: workspaceName,
            resource_group: resourceGroup,
            type: ["terraform_v1.3"],
            location: region,
            description: "Schematics Workspace for craig.tar uploads",
            tags: ["craig"],
            template_data: [{ type: "terraform_v1.3" }],
          });

          let requestConfig = {
            method: "post",
            url: "https://schematics.cloud.ibm.com/v1/workspaces",
            headers: {
              Accept: "application/json",
              Authorization: this.token,
            },
            data: data,
          };
          return axios(requestConfig);
        })
        .then((response) => {
          if (!internalCall) res.send(response.data);
          resolve(response.data);
        })
        .catch((err) => {
          res.send(err);
          resolve(err);
        });
    });
  };

  /**
   * creates schematics workspace and uploads tar file of CRAIG data
   * req.body must contain all needed data for createWorkspace and uploadTar functions
   * @param {*} req express request object
   * @param {*} res express resolve object
   * @returns
   */
  this.newWorkspaceUpload = (req, res) => {
    return new Promise((resolve, reject) => {
      if (process.env.CRAIG_PROD === "TRUE") {
        reject("CRAIG_PROD is true");
        return;
      }
      // createWorkspace req
      let createWorkspaceReq = {
        params: {
          workspaceName: req.body["workspaceName"],
          region: req.body["region"],
          resourceGroup: req.body["resourceGroup"],
          internalCall: true,
        },
      };
      return this.createWorkspace(createWorkspaceReq, res).then(
        (createData) => {
          // uploadTar req
          let uploadTarReq = {
            params: {
              workspaceName: req.body["workspaceName"],
              internalCall: true,
            },
            body: req.body["craigJson"],
          };
          return this.uploadTar(uploadTarReq, res).then(() => {
            console.log(
              `Upload successful to workspace with id: ${createData.id}`
            );
            resolve({
              workspaceId: createData.id,
              schematicsUrl: `https://cloud.ibm.com/schematics/workspaces/${createData.id}`,
            });
          });
        }
      );
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  };
}

module.exports = controller;
