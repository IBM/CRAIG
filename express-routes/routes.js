const { Router } = require("express");
const axios = require("axios");
const router = Router();
const jsutil = require("util"); // Utils to run child process
const exec = jsutil.promisify(require("child_process").exec); // Exec from child process
const apiController = require("../express-controllers/controller");
const cdktfController = require("../express-controllers/cdktf");
const controller = new apiController(axios);
const cdktf = new cdktfController(exec);

// vsi
router.get("/vsi/:region/instanceProfiles", controller.vsiInstanceProfiles);
router.get("/vsi/:region/images", controller.vsiImages);

// cluster
router.get("/cluster/:region/flavors", controller.clusterFlavors);
router.get("/cluster/versions", controller.clusterVersions);

// cdktf
router.post("/cdktf/convert/:language", cdktf.convertPost);

// tar
router.put("/schematics/:workspaceName", controller.uploadTar);

module.exports = router;
