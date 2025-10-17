const { distinct, splat, azsort } = require("lazy-z");

/**
 * get services
 * @param {*} craig craig object
 * @param {Array<string>} services list of services
 * @returns {Object} service resource groups and service map
 */
function getServices(craig, services) {
  let serviceResourceGroups = splat(craig.store.json.resource_groups, "name");
  let serviceMap = {};
  services.forEach((field) => {
    serviceResourceGroups = distinct(
      serviceResourceGroups.concat(
        splat(craig.store.json[field], "resource_group"),
      ),
    );
  });

  // add logdna and sysdig rgs
  serviceResourceGroups = distinct(
    serviceResourceGroups
      .concat(craig.store.json.sysdig.resource_group)
      .concat(craig.store.json.logdna.resource_group),
  );

  serviceResourceGroups = serviceResourceGroups.sort(azsort).sort((a) => {
    // move null to front
    if (!a) return -1;
    else return 0;
  });

  // for each resource group
  serviceResourceGroups.forEach((rg) => {
    let rgName = rg === null ? "No Resource Group" : rg;
    serviceMap[rgName] = [];
    // for each service
    services.forEach((resourceType) => {
      // look up that resource and add to service map
      craig.store.json[resourceType].forEach((service) => {
        if (service.resource_group === rg) {
          serviceMap[rgName].push({
            name: service.name,
            type: resourceType,
            data: service,
            overrideType:
              resourceType === "icd" ? "cloud_databases" : undefined,
          });
        }
      });
    });
  });

  ["sysdig", "logdna", "atracker"].forEach((observabilityService) => {
    if (craig.store.json[observabilityService]["enabled"]) {
      let rg = craig.store.json[observabilityService].resource_group;
      let serviceRg = !rg ? "No Resource Group" : rg;
      if (
        observabilityService !== "atracker" ||
        craig.store.json[observabilityService].instance
      )
        serviceMap[serviceRg].push({
          name: observabilityService,
          type: observabilityService,
          data: craig.store.json[observabilityService],
        });
    }
  });

  if (!serviceResourceGroups[0]) {
    serviceResourceGroups[0] = "No Resource Group";
  }

  return {
    serviceResourceGroups,
    serviceMap,
  };
}

module.exports = {
  getServices,
};
