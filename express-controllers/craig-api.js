const { configToFilesJson } = require("../client/src/lib");
const { packTar } = require("../lib/tar-utils");

/**
 * return functions for craig api
 * @param {*} controller intialized controller
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
        res.send(dataFromBuffer);
      })
      .catch((err) => {
        res.send(err.message);
      });
  };
}

module.exports = {
  craigApi,
};
