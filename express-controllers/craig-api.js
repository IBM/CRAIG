const { configToFilesJson } = require("../client/src/lib");
const { packTar } = require("../lib/tar-utils");
const fromScratch = require("../client/src/lib/docs/templates/from-scratch.json");
const oracleRac = require("../client/src/lib/docs/templates/oracle-rac.json");
const oracleSi = require("../client/src/lib/docs/templates/oracle-si.json");
const powerVsSapHana = require("../client/src/lib/docs/templates/power-sap-hana.json");
const quickStartPower = require("../client/src/lib/docs/templates/quick-start-power.json");
const slzMixed = require("../client/src/lib/docs/templates/slz-mixed.json");
const slzVsiEdge = require("../client/src/lib/docs/templates/slz-vsi-edge.json");
const slzVsi = require("../client/src/lib/docs/templates/slz-vsi.json");

const templateNameToJson = {
  "from-scratch": fromScratch,
  "oracle-rac": oracleRac,
  "oracle-si": oracleSi,
  "power-vs-sap-hana": powerVsSapHana,
  "quick-start-power": quickStartPower,
  mixed: slzMixed,
  "vsi-edge": slzVsiEdge,
  vsi: slzVsi,
};

/**
 * return functions for craig api
 * @param {*} controller initialized controller
 * @param {*} tar initialized tar package
 * @returns {Promise}
 */
function craigApi(controller, tar) {
  /**
   * create a craig tar
   * @param {*} req
   * @param {*} res
   */
  this.craigTar = function (req, res) {
    let craigJson = req.body;
    let pack = tar.pack();
    return new Promise((resolve, reject) => {
      // intention here is that one day this function can be moved
      // to pack-tar and referenced there
      try {
        let craigData = configToFilesJson(craigJson);
        let tarFile = "craig.tar";
        packTar(pack, tarFile.slice(0, tarFile.length - 4), craigData);
        pack.finalize();
        resolve(controller.createBlob(pack));
      } catch (err) {
        reject(err);
      }
    })
      .then((data) => {
        let dataFromBuffer = Buffer.from(data);
        res.type("tar");
        res.send(dataFromBuffer);
      })
      .catch((err) => {
        res.send(err.message);
      });
  };

  this.templateTar = function (req, res) {
    let template = req.params["template"];
    let pack = tar.pack();

    return new Promise((resolve, reject) => {
      if (!templateNameToJson[template]) {
        reject(`No template found with name ${template}`);
        return;
      }

      // no try catch needed here if json exists,
      // then template json should always be correct
      let craigData = configToFilesJson(
        templateNameToJson[template],
        false,
        true
      );
      let tarFile = `${template}.tar`;
      packTar(pack, tarFile.slice(0, tarFile.length - 4), craigData);
      pack.finalize();
      resolve(controller.createBlob(pack));
    })
      .then((data) => {
        let dataFromBuffer = Buffer.from(data);
        res.type("tar");
        res.send(dataFromBuffer);
      })
      .catch((err) => {
        res.status(404);
        res.send(err);
      });
  };
}

module.exports = {
  craigApi,
};
