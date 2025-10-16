const { assert } = require("chai");
const { getDisplaySubnetTiers } = require("../../../client/src/lib");

describe("subnet tier map functions", () => {
  it("should return correct data when no tier object present", () => {
    let actualData = getDisplaySubnetTiers({
      vpc: {},
      craig: {
        store: {
          subnetTiers: {
            test: undefined,
          },
          json: {
            virtual_private_endpoints: [],
            vsi: [
              {
                vpc: "test",
                subnets: [],
              },
              {
                vpc: "test",
                subnets: ["hello"],
              },
            ],
            vpn_servers: [],
            clusters: [],
            vpn_gateways: [],
          },
        },
      },
    });
    let expectedData = { emptySubnetResources: false, subnetTiers: [] };
    assert.deepEqual(
      actualData,
      expectedData,
      "it should return correct subnet tiers",
    );
  });
  it("should return empty subnet resources as true when a vsi has a matching vpc and no subnets", () => {
    let data = getDisplaySubnetTiers({
      vpc: {
        name: "test",
        subnetTiers: [],
      },
      craig: {
        store: {
          json: {
            virtual_private_endpoints: [],
            vsi: [
              {
                vpc: "test",
                subnets: [],
              },
              {
                vpc: "test",
                subnets: ["hello"],
              },
            ],
            vpn_servers: [],
            clusters: [],
            vpn_gateways: [],
          },
        },
      },
    });
    assert.isTrue(
      data.emptySubnetResources,
      "it should have empty subnet resources",
    );
    assert.deepEqual(
      data.subnetTiers,
      ["NO_SUBNETS"],
      "it should return subnet tiers",
    );
  });
  it("should return empty subnet resources as true when a vpn gateway has a matching vpc and a null subnet", () => {
    let data = getDisplaySubnetTiers({
      vpc: {
        name: "test",
      },
      craig: {
        store: {
          subnetTiers: {
            test: [],
          },
          json: {
            virtual_private_endpoints: [],
            vsi: [],
            vpn_servers: [],
            clusters: [],
            vpn_gateways: [
              {
                vpc: "test",
                subnet: null,
              },
              {
                vpc: "test",
                subnet: "yes",
              },
            ],
          },
        },
      },
    });
    assert.isTrue(
      data.emptySubnetResources,
      "it should have empty subnet resources",
    );
    assert.deepEqual(
      data.subnetTiers,
      ["NO_SUBNETS"],
      "it should return subnet tiers",
    );
  });
  it("should return empty subnet resources as false when all items have a matching vpc and subnet", () => {
    let data = getDisplaySubnetTiers({
      vpc: {
        name: "test",
      },
      craig: {
        store: {
          subnetTiers: {
            test: [],
          },
          json: {
            virtual_private_endpoints: [],
            vsi: [],
            vpn_servers: [],
            clusters: [],
            vpn_gateways: [
              {
                vpc: "test",
                subnet: "frog",
              },
              {
                vpc: "test",
                subnet: "toad",
              },
            ],
          },
        },
      },
    });
    assert.isFalse(
      data.emptySubnetResources,
      "it should not have empty subnet resources",
    );
    assert.deepEqual(data.subnetTiers, [], "it should return subnet tiers");
  });
});
