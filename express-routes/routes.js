const { Router } = require("express");
const axios = require("axios");
const router = Router();
const tar = require("tar-stream");
const apiController = require("../express-controllers/controller");
const { craigApi } = require("../express-controllers/craig-api");
const controller = new apiController(axios);
const craigRoutes = new craigApi(controller, tar);

// vsi
router.get("/vsi/:region/instanceProfiles", controller.vsiInstanceProfiles);
router.get("/vsi/:region/images", controller.vsiImages);

// cluster
router.get("/cluster/:region/flavors", controller.clusterFlavors);
router.get("/cluster/versions", controller.clusterVersions);

// schematics
router.put("/schematics/tar/:workspaceName", controller.uploadTar);
router.post(
  "/schematics/:workspaceName/:region?/:resourceGroup?",
  controller.createWorkspace
);

// power
router.get("/power/:region/:component", controller.getPowerComponent);

// craig
router.post("/craig/tar", craigRoutes.craigTar);

module.exports = router;
