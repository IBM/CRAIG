const { assert } = require("chai");
const {
  powerImageFetch,
  powerStoragePoolFetch,
  getImagesAndStoragePools,
} = require("../../lib//power-utils");

const powerImageMap = require("../../client/src/lib/docs/power-image-map-legacy.json");
const { powerStoragePoolRegionMap } = require("../../client/src/lib/constants");

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
      return powerImageFetch(["dal10", "dal12"], reactFetch.fetchPromise).catch(
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
      return powerImageFetch(["dal10"], reactFetch.fetchPromise).then(
        (data) => {
          assert.deepEqual(
            data["dal10"],
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
        }
      );
    });
    it("should return correct hard-coded json", () => {
      let reactFetch = new mockFetch(false, powerImageMap["dal10"]);
      return powerImageFetch(["dal10"], reactFetch.fetchPromise).then(
        (data) => {
          assert.deepEqual(
            data["dal10"],
            powerImageMap["dal10"],
            "should be correct data"
          );
        }
      );
    });
  });
  describe("powerStoragePoolFetch", () => {
    it("should reject and return error", () => {
      let reactFetch = new mockFetch(true, {});
      return powerStoragePoolFetch(["dal10"], reactFetch.fetchPromise).catch(
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
      return powerStoragePoolFetch(
        ["dal10", "dal12"],
        reactFetch.fetchPromise
      ).then((data) => {
        assert.deepEqual(data["dal10"], ["foo1", "foo2", "foo3"]);
      });
    });
    it("should return correct hard-coded json", () => {
      let reactFetch = new mockFetch(false, powerStoragePoolRegionMap["dal10"]);
      return powerStoragePoolFetch(["dal10"], reactFetch.fetchPromise).then(
        (data) => {
          assert.deepEqual(
            data["dal10"],
            powerStoragePoolRegionMap["dal10"],
            "should be correct data"
          );
        }
      );
    });
  });
  describe("getImagesAndStoragePools", () => {
    it("should return correct storage pool data", async () => {
      let reactFetch = new mockFetch(false, [
        "Tier3-Flash-2",
        "Tier3-Flash-1",
        "Tier1-Flash-2",
        "Tier1-Flash-1",
      ]);
      return await getImagesAndStoragePools(
        ["dal10"],
        reactFetch.fetchPromise
      ).then((data) => {
        assert.deepEqual(
          data.pools["dal10"],
          ["Tier3-Flash-2", "Tier3-Flash-1", "Tier1-Flash-2", "Tier1-Flash-1"],
          "should be the same data"
        );
      });
    });
    it("should return correct image data", async () => {
      let reactFetch = new mockFetch(false, [
        {
          imageID: "a857bbbd-6fee-4bf7-816d-04fb4cdbf65e",
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
      return await getImagesAndStoragePools(
        ["dal10"],
        reactFetch.fetchPromise
      ).then((data) => {
        assert.deepEqual(
          data.images["dal10"],
          [
            {
              imageID: "a857bbbd-6fee-4bf7-816d-04fb4cdbf65e",
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
          "should be the same data"
        );
      });
    });
  });
});
