require("dotenv").config(); // import env
const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const guiBuild = path.join(__dirname, "build");
const routes = require("./express-routes/routes");
const { snakeCase } = require("lazy-z");

const defaultZones = [
  "wdc06",
  "wdc07",
  "us-east",
  "dal10",
  "dal12",
  "us-south",
  "eu-de-1",
  "eu-de-2",
  "mad02",
  "mad04",
  "lon04",
  "lon06",
  "tor01",
  "syd04",
  "syd05",
  "tok04",
  "sao01",
  "osa21",
  // "sao04",
];

function startServer() {
  if (process.env.PRE_COMMIT !== "true") {
    // check env vars to see which power workspaces are set
    let foundZones = [];
    defaultZones.forEach((zone) => {
      if (process.env[`POWER_WORKSPACE_${snakeCase(zone).toUpperCase()}`]) {
        foundZones.push(zone);
      }
    });
    try {
      app.use(bodyParser.json({ limit: "50mb" }));
      app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
      app.use(express.static(guiBuild));

      // create a GET route
      app.get("/express_backend", (req, res) => {
        res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO CRAIG" });
      });

      app.use("/api", routes);

      app.get(/(.*)/, (req, res) => {
        res.sendFile(path.join(guiBuild, "index.html"));
      });

      // This displays message that the server running and listening to specified port
      if (process.env.PRE_COMMIT !== "true")
        app.listen(port, () => console.log(`Listening on port ${port}`));
    } catch (err) {
      console.error(err);
    }
  }
}

startServer();
