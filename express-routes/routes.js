const { Router } = require("express");
const axios = require("axios");
const router = Router();
const tar = require("tar-stream");
const apiController = require("../express-controllers/controller");
const { craigApi } = require("../express-controllers/craig-api");
const controller = new apiController(axios);
const craigRoutes = new craigApi(controller, tar);
const swaggerUi = require("swagger-ui-express");
const yaml = require("js-yaml");
const fs = require("fs");
const apiSpec = yaml.load(
  fs.readFileSync("./client/src/lib/docs/api-spec.yaml", "utf8")
);

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
router.get("/craig/template-tar/:template", craigRoutes.templateTar);

//swagger api spec
router.use("/swagger", swaggerUi.serve);
router.get("/swagger", swaggerUi.setup(apiSpec));

module.exports = router;
