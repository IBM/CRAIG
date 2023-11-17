const { assert } = require("chai");
const {
  powerImageFetch,
  powerStoragePoolFetch,
} = require("../../client/src/lib/forms");

const powerImageMap = require("../../client/src/lib/docs/power-image-map.json");
const powerStoragePoolRegionMap = require("../../client/src/lib/constants");

/**
 * create a mock react fetch
 * @param {boolean} shouldReject function should reject
 * @param {*} data arbitrary data to return if shouldReject is false
 */
function mockFetch(shouldReject, data) {
  this.fetchPromise = function (url, options) {
    return new Promise((resolve, reject) => {
      if (shouldReject) {
        reject("This is an error!");
      } else {
        resolve({
          json: function () {
            return data;
          },
        });
      }
    });
  };
}

describe("power-utils", () => {
  describe("powerImageFetch", () => {
    it("should reject and return error", async () => {
      let reactFetch = new mockFetch(true, {});
      return powerImageFetch("DAL10", reactFetch.fetchPromise).catch((err) => {
        assert.deepEqual(
          err,
          "This is an error!",
          "should be the same error message"
        );
      });
    });
    it("should return correct data", () => {
      let reactFetch = new mockFetch(false, [
        {
          imageID: "e94dc1b3-b108-4fc5-b7d5-47d3bd686b6f",
          name: "7100-05-09",
          specifications: {
            architecture: "ppc64",
            containerFormat: "bare",
            diskFormat: "raw",
            endianness: "big-endian",
            hypervisorType: "phyp",
            operatingSystem: "aix",
          },
          state: "active",
          storagePool: "Tier3-Flash-1",
          storageType: "tier3",
        },
      ]);
      return powerImageFetch("DAL10", reactFetch.fetchPromise).then((data) => {
        assert.deepEqual(
          data,
          [
            {
              imageID: "e94dc1b3-b108-4fc5-b7d5-47d3bd686b6f",
              name: "7100-05-09",
              specifications: {
                architecture: "ppc64",
                containerFormat: "bare",
                diskFormat: "raw",
                endianness: "big-endian",
                hypervisorType: "phyp",
                operatingSystem: "aix",
              },
              state: "active",
              storagePool: "Tier3-Flash-1",
              storageType: "tier3",
            },
          ],
          "should be correct data"
        );
      });
    });
    it("should return correct hard-coded json", () => {
      let reactFetch = new mockFetch(false, powerImageMap["dal10"]);
      return powerImageFetch("DAL10", reactFetch.fetchPromise).then((data) => {
        assert.deepEqual(
          data,
          powerImageMap["dal10"],
          "should be correct data"
        );
      });
    });
  });
  describe("powerStoragePoolFetch", () => {
    it("should reject and return error", () => {
      let reactFetch = new mockFetch(true, {});
      return powerStoragePoolFetch("DAL10", reactFetch.fetchPromise).catch(
        (err) => {
          assert.deepEqual(
            err,
            "This is an error!",
            "should be the same error message"
          );
        }
      );
    });
    it("should return correct data", () => {
      let reactFetch = new mockFetch(false, ["foo1", "foo2", "foo3"]);
      return powerStoragePoolFetch("DAL10", reactFetch.fetchPromise).then(
        (data) => {
          assert.deepEqual(data, ["foo1", "foo2", "foo3"]);
        }
      );
    });
    it("should return correct hard-coded json", () => {
      let reactFetch = new mockFetch(false, powerStoragePoolRegionMap["dal10"]);
      return powerStoragePoolFetch("DAL10", reactFetch.fetchPromise).then(
        (data) => {
          assert.deepEqual(
            data,
            powerStoragePoolRegionMap["dal10"],
            "should be correct data"
          );
        }
      );
    });
  });
});
