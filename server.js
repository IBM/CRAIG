//simple backend express server which hosts production build version of slzgui, to test locally go to http://localhost:3000

const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;
const guiBuild = path.join(__dirname, "build");
const routes = require("./express-routes/routes");

app.use(express.static(guiBuild));

// This displays message that the server running and listening to specified port
app.listen(port, () => console.log(`Listening on port ${port}`));

// create a GET route
app.get("/express_backend", (req, res) => {
  res.send({ express: "YOUR EXPRESS BACKEND IS CONNECTED TO SLZGUI" });
});

app.use("/api", routes);

app.get("*", (req, res) => {
  res.sendFile(path.join(guiBuild, "index.html"));
});
