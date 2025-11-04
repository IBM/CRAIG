const { assert } = require("chai");
const controller = require("../../server/express-controllers/controller");
const res = require("../mocks/response.mock");
const { initMockAxios } = require("lazy-z");

describe("getStats", () => {
  it("should respond with the an error", () => {
    let { axios } = initMockAxios({}, true);
    let testController = new controller(axios);
    testController.getStats({}, res).catch(() => {
      assert.isTrue(res.send.calledOnce);
    });
  });
  it("should respond with the correct reference stats", () => {
    let { axios } = initMockAxios(
      {
        tree: [
          {
            path: "2024-01-10-traffic-stats/2024-01-10-20h-36m-clone-stats.csv",
          },
        ],
      },
      false,
    );
    axios.get = () => {
      return {
        data:
          "repository_name,site,views,unique_visitors/cloners" +
          "CRAIG,github.com,416,7" +
          "CRAIG,ibm.webex.com,57,16" +
          "CRAIG,ibm.seismic.com,43,5",
      };
    };
    let testController = new controller(axios);
    return testController.getStats({}, res).then(() => {
      assert.deepEqual(res.send.lastCall.args, [
        {
          views: {},
          clones: {},
          refs: {
            "github.com": 416,
            "ibm.webex.com": 57,
            "ibm.seismic.com": 43,
          },
        },
      ]);
    });
  });
  it("should respond with the correct clone stats", () => {
    let { axios } = initMockAxios(
      {
        tree: [
          {
            path: "2024-01-10-traffic-stats/2024-01-10-20h-36m-clone-stats.csv",
          },
        ],
      },
      false,
    );
    axios.get = () => {
      return {
        data:
          "repository_name,date,clones,unique_visitors/cloners\r\n" +
          "CRAIG,2024-02-02,7,5\r\n" +
          "CRAIG,2024-02-03,3,3\r\n" +
          "CRAIG,2024-02-04,2,2\r\n" +
          "CRAIG,2024-02-05,4,4\r\n" +
          "CRAIG,2024-02-06,15,12\r\n",
      };
    };
    let testController = new controller(axios);
    return testController.getStats({}, res).then(() => {
      assert.deepEqual(res.send.lastCall.args, [
        {
          views: {},
          clones: {
            "2024-02-02": "7",
            "2024-02-03": "3",
            "2024-02-04": "2",
            "2024-02-05": "4",
            "2024-02-06": "15",
          },
          refs: {},
        },
      ]);
    });
  });
  it("should respond with the correct view stats", () => {
    let { axios } = initMockAxios(
      {
        tree: [
          {
            path: "2024-01-10-traffic-stats/2024-01-10-20h-36m-clone-stats.csv",
          },
        ],
      },
      false,
    );
    axios.get = () => {
      return {
        data:
          "repository_name,date,views,unique_visitors/cloners\r\n" +
          "CRAIG,2024-02-02,7,5\r\n" +
          "CRAIG,2024-02-03,3,3\r\n" +
          "CRAIG,2024-02-04,2,2\r\n" +
          "CRAIG,2024-02-05,4,4\r\n" +
          "CRAIG,2024-02-06,15,12\r\n",
      };
    };
    let testController = new controller(axios);
    return testController.getStats({}, res).then(() => {
      assert.deepEqual(res.send.lastCall.args, [
        {
          views: {
            "2024-02-02": "7",
            "2024-02-03": "3",
            "2024-02-04": "2",
            "2024-02-05": "4",
            "2024-02-06": "15",
          },
          clones: {},
          refs: {},
        },
      ]);
    });
  });
  it("should ignore non stats paths", () => {
    let { axios } = initMockAxios(
      {
        tree: [
          {
            path: "ignore/this/path",
          },
        ],
      },
      false,
    );
    let testController = new controller(axios);
    return testController.getStats({}, res).then(() => {
      assert.deepEqual(res.send.lastCall.args, [
        {
          views: {},
          clones: {},
          refs: {},
        },
      ]);
    });
  });
});
