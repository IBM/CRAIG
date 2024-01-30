const { assert } = require("chai");
const { state } = require("../../client/src/lib");
const {
  getVolumeDisplayName,
} = require("../../client/src/lib/forms/power-volume-table");

/**
 * initialize store
 * @returns {lazyZState} state store
 */
function newState() {
  let store = new state();
  store.setUpdateCallback(() => {});
  return store;
}

describe("getVolumeDisplayName", () => {
  it("should show correct display name when no storage type", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          pi_affinity_instance: "frog",
          storage_option: "Affinity",
        },
        {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                },
              ],
            },
          },
        }
      ),
      "Affinity Instance frog ()",
      "it should return correct data"
    );
  });
  it("should show correct display name for storage type", () => {
    assert.deepEqual(
      getVolumeDisplayName({
        storage_option: "Storage Type",
        pi_volume_type: "tier1",
      }),
      "Tier 1",
      "it should return correct data"
    );
  });
  it("should show correct display name for storage pool", () => {
    assert.deepEqual(
      getVolumeDisplayName({
        storage_option: "Storage Pool",
        pi_volume_pool: "storage-pool-1-flash-4",
      }),
      "Storage Pool 1 Flash 4",
      "it should return correct data"
    );
  });
  it("should show correct display name for affinity volume with instance affinity for storage type instance", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Affinity",
          pi_affinity_instance: "frog",
        },
        {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                  storage_option: "Storage Type",
                  pi_storage_type: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Affinity Instance frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for affinity volume with instance affinity for storage pool instance", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Affinity",
          pi_affinity_instance: "frog",
        },
        {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                  storage_option: "Storage Pool",
                  pi_storage_pool: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Affinity Instance frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for affinity volume with volume affinity for storage type volume", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Affinity",
          pi_affinity_volume: "frog",
        },
        {
          store: {
            json: {
              power_volumes: [
                {
                  name: "frog",
                  storage_option: "Storage Type",
                  pi_volume_type: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Affinity Volume frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for affinity volume with volume affinity for storage pool volume", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Affinity",
          pi_affinity_volume: "frog",
        },
        {
          store: {
            json: {
              power_volumes: [
                {
                  name: "frog",
                  storage_option: "Storage Pool",
                  pi_volume_pool: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Affinity Volume frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for anti-affinity volume with instance affinity for storage type instance", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Anti-Affinity",
          pi_anti_affinity_instance: "frog",
        },
        {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                  storage_option: "Storage Type",
                  pi_storage_type: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Anti-Affinity Instance frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for anti-affinity volume with instance affinity for storage pool instance", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Anti-Affinity",
          pi_anti_affinity_instance: "frog",
        },
        {
          store: {
            json: {
              power_instances: [
                {
                  name: "frog",
                  storage_option: "Storage Pool",
                  pi_storage_pool: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Anti-Affinity Instance frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for anti-affinity volume with volume affinity for storage type volume", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Anti-Affinity",
          pi_anti_affinity_volume: "frog",
        },
        {
          store: {
            json: {
              power_volumes: [
                {
                  name: "frog",
                  storage_option: "Storage Type",
                  pi_volume_type: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Anti-Affinity Volume frog (Tier 1)",
      "it should return correct data"
    );
  });
  it("should show correct display name for anti-affinity volume with volume affinity for storage pool volume", () => {
    assert.deepEqual(
      getVolumeDisplayName(
        {
          storage_option: "Anti-Affinity",
          pi_anti_affinity_volume: "frog",
        },
        {
          store: {
            json: {
              power_volumes: [
                {
                  name: "frog",
                  storage_option: "Storage Pool",
                  pi_volume_pool: "tier1",
                },
              ],
            },
          },
        }
      ),
      "Anti-Affinity Volume frog (Tier 1)",
      "it should return correct data"
    );
  });
});
