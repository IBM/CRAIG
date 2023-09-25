//simple backend express server which hosts production build version of slzgui, to test locally go to http://localhost:3000

const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const bodyParser = require("body-parser");
const guiBuild = path.join(__dirname, "build");
const clusterRoutes = require("./express-routes/cluster-api");
const vsiRoutes = require("./express-routes/vsi-api");
const schematicsRoutes = require("./express-routes/schematics-api");

app.use(express.static(guiBuild));
app.use(bodyParser.json());

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get("/express_backend", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO CRAIG" });
});

app.use("/api", clusterRoutes, schematicsRoutes, vsiRoutes);

app.get("*", (req, res) => {
  res.sendFile(path.join(guiBuild, "index.html"));
});
