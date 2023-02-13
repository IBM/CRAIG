const { Router } = require("express");
const axios = require("axios");
const router = Router();
const apiController = require("../express-controllers/controller");
const controller = new apiController(axios);

// vsi
router.get("/vsi/instanceProfiles", controller.vsiInstanceProfiles);
router.get("/vsi/images", controller.vsiImages);

// cluster
router.get("/cluster/flavors", controller.clusterFlavors);
router.get("/cluster/versions", controller.clusterVersions);

module.exports = router;
