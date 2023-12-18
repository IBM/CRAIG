//simple backend express server which hosts production build version of slzgui, to test locally go to http://localhost:3000
require("dotenv").config(); // import env
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const guiBuild = path.join(__dirname, "build");
const routes = require("./express-routes/routes");
const { getImagesAndStoragePools } = require("./lib/power-utils");
const fs = require("fs");
const { snakeCase } = require("lazy-z");
const axios = require("axios");
const apiController = require("./express-controllers/controller");
const controller = new apiController(axios);

const defaultZones = [
  "wdc06",
  "wdc07",
  "us-east",
  "dal10",
  "dal12",
  // "us-south", this isn't working for some reason, need to investigate
  "eu-de-1",
  "eu-de-2",
  "lon04",
  "lon06",
  "tor01",
  "syd04",
  "syd05",
  "tok04",
  // "sao01",
];

function startSever() {
  if (process.env.PRE_COMMIT !== "true") {
    // check env vars to see which power workspaces are set
    let foundZones = [];
    defaultZones.forEach((zone) => {
      if (process.env[`POWER_WORKSPACE_${snakeCase(zone).toUpperCase()}`]) {
        foundZones.push(zone);
      }
    });

    getImagesAndStoragePools(foundZones, controller.getPowerComponent).then(
      (data) => {
        try {
          fs.writeFileSync(
            "./client/src/lib/docs/power-image-map.json",
            JSON.stringify(data.images, null, 2)
          );
          fs.writeFileSync(
            "./client/src/lib/docs/power-storage-pool-map.json",
            JSON.stringify(data.pools, null, 2)
          );
          console.log("\nPower VS images and storage pools fetched");

          app.use(express.static(guiBuild));
          app.use(bodyParser.json());

          // create a GET route
          app.get("/express_backend", (req, res) => {
            res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO CRAIG" });
          });

          app.use("/api", routes);

          app.get("*", (req, res) => {
            res.sendFile(path.join(guiBuild, "index.html"));
          });

          // This displays message that the server running and listening to specified port
          if (process.env.PRE_COMMIT !== "true")
            app.listen(port, () => console.log(`Listening on port ${port}`));
        } catch (err) {
          console.error(err);
        }
      }
    );
  }
}

startSever();
