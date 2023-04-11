const { Router } = require("express");
const axios = require("axios");
const router = Router();
const apiController = require("../express-controllers/controller");
const controller = new apiController(axios);

// vsi
router.get("/vsi/:region/instanceProfiles", controller.vsiInstanceProfiles);
router.get("/vsi/:region/images", controller.vsiImages);

// cluster
router.get("/cluster/:region/flavors", controller.clusterFlavors);
router.get("/cluster/versions", controller.clusterVersions);

module.exports = router;
