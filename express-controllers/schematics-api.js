const { prettyJSON } = require("lazy-z");
const tar = require("tar-stream");
const { packTar } = require("../lib/tar-utils");
const FormData = require("form-data");
const { configToFilesJson } = require("../client/src/lib");
const blobStream = require("blob-stream");
const axios = require("axios");

function schematicsRoutes(axios, controller) {
  /**
   * get details about provided workspace
   * @param {string} workspaceName
   * @returns {Promise}
   */
  controller.getWorkspaceData = function (workspaceName) {
    return new Promise((resolve, reject) => {
      return controller
        .getBearerToken()
        .then(() => {
          let requestConfig = {
            method: "get",
            url: "https://schematics.cloud.ibm.com/v1/workspaces",
            headers: {
              Accept: "application/json",
              Authorization: controller.token,
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
  controller.createBlob = function (pack) {
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
  controller.uploadTar = function (req, res) {
    let workspaceName = req.params["workspaceName"];
    let craigJson = req.body;
    let tarFile = "craig.tar";
    let forceTarPackFail = req.params?.forceFail;
    let workspaceData;
    let internalCall = req.params["internalCall"];
    return new Promise((resolve, reject) => {
      controller
        .getWorkspaceData(workspaceName)
        .then((wsData) => {
          workspaceData = wsData;
          return controller.getBearerToken();
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
              return controller.createBlob(pack);
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
              Authorization: controller.token,
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
          controller.uploadResponse = response.data;
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
  controller.createWorkspace = function (req, res) {
    let workspaceName = req.params["workspaceName"];
    let region = req.params["region"];
    let resourceGroup = req.params["resourceGroup"];
    let internalCall = req.params["internalCall"];
    return new Promise((resolve, reject) => {
      return controller
        .getBearerToken()
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
              Authorization: controller.token,
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
  controller.newWorkspaceUpload = function (req, res) {
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
      return controller
        .createWorkspace(createWorkspaceReq, res)
        .then((createData) => {
          // uploadTar req
          let uploadTarReq = {
            params: {
              workspaceName: req.body["workspaceName"],
              internalCall: true,
            },
            body: req.body["craigJson"],
          };
          return controller.uploadTar(uploadTarReq, res).then(() => {
            console.log(
              `Upload successful to workspace with id: ${createData.id}`
            );
            resolve({
              workspaceId: createData.id,
              schematicsUrl: `https://cloud.ibm.com/schematics/workspaces/${createData.id}`,
            });
          });
        });
    })
      .then((data) => {
        res.send(data);
      })
      .catch((err) => {
        res.send(err);
      });
  };
}

module.exports = {
  schematicsRoutes,
};
