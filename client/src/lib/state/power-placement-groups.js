const { splatContains, revision } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  nameField,
} = require("./reusable-fields");
const {
  powerVsWorkspaceGroups,
  shouldDisableComponentSave,
  kebabCaseInput,
} = require("./utils");

function initPlacementGroupStore(store) {
  store.newField("power_placement_groups", {
    init: function (config) {
      config.store.json.power_placement_groups = [];
    },
    create: function (config, stateData) {
      config.push(["json", "power_placement_groups"], stateData);
    },
    save: function (config, stateData, componentProps) {
      config.updateChild(
        ["json", "power_placement_groups"],
        componentProps.data.name,
        stateData
      );
    },
    delete: function (config, stateData, componentProps) {
      config.carve(
        ["json", "power_placement_groups"],
        componentProps.data.name
      );
    },
    onStoreUpdate: function (config) {
      if (config.store.json.power_placement_groups)
        config.store.json.power_placement_groups.forEach((pool) => {
          if (!splatContains(config.store.json.power, "name", pool.workspace)) {
            pool.workspace = null;
            pool.zone = null;
          }
        });
      else config.store.json.power_placement_groups = [];
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "workspace", "pi_placement_group_policy"],
      "power_placement_groups"
    ),
    schema: {
      workspace: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("workspace"),
        invalidText: selectInvalidText("workspace"),
        groups: powerVsWorkspaceGroups,
        onStateChange: function (stateData, componentProps) {
          let powerWorkspaceZone = new revision(
            componentProps.craig.store.json
          ).child("power", stateData.workspace).data.zone;
          stateData.zone = powerWorkspaceZone;
        },
      },
      name: nameField("power_placement_groups"),
      pi_placement_group_policy: {
        type: "select",
        labelText: "Placement Group Policy",
        default: "",
        groups: ["Affinity", "Anti-Affinity"],
        invalid: fieldIsNullOrEmptyString("pi_placement_group_policy"),
        onInputChange: kebabCaseInput("pi_placement_group_policy"),
        onRender: function (stateData) {
          return (stateData.pi_placement_group_policy || "").replace(/a/g, "A");
        },
      },
    },
  });
}

module.exports = {
  initPlacementGroupStore,
};
