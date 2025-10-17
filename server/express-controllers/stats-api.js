const { contains } = require("lazy-z");

function statsRoutes(axios, controller) {
  /**
   * Gets traffic stats object for CRAIG
   * For example output, see craig-stats.json
   * @param {object} req express request object
   * @param {object} res express resolve object
   */
  controller.getStats = function (req, res) {
    let stats = {
      views: {},
      clones: {},
      refs: {},
    };
    return new Promise((resolve, reject) => {
      let statsPromises = [];
      let requestConfig = {
        method: "get",
        url: "https://api.github.com/repos/IBM/CRAIG/git/trees/traffic?recursive=1",
        headers: {
          Accept: "application/json",
        },
      };
      axios(requestConfig)
        .then((response) => {
          const paths = [];
          response.data.tree.forEach((folder) => {
            if (contains(folder.path, "traffic-stats/")) {
              paths.push(folder.path);
            }
          });
          paths.forEach((path) => {
            statsPromises.push(
              axios.get(
                `https://raw.githubusercontent.com/IBM/CRAIG/traffic/${path}`
              )
            );
          });
          return Promise.all(statsPromises);
        })
        .then((responses) => {
          resolve(responses);
        })
        .catch((error) => {
          console.log("Error fetching CRAIG stats: ", error);
          reject(error);
        });
    }).then((responses) => {
      const statsData = responses.map((response) => response.data);
      statsData.forEach((stat) => {
        statsArray = stat.split(",");
        let type =
          statsArray[1] == "site"
            ? "ref"
            : statsArray[2] == "views"
            ? "views"
            : "clones";
        statsArray.splice(0, 4);
        statsArray.forEach((item, index) => {
          if (index % 3 == 0) {
            if (type == "views") {
              stats.views[item] = statsArray[index + 1];
            } else if (type == "clones") {
              stats.clones[item] = statsArray[index + 1];
            } else {
              let prevTotal = parseInt(stats.refs[item]) || 0;
              stats.refs[item] = prevTotal + parseInt(statsArray[index + 1]);
            }
          }
        });
      });
      res.send(stats);
    });
  };
}

module.exports = {
  statsRoutes,
};
