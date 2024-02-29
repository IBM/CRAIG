const { transpose, snakeCase } = require("lazy-z");
const {
  resourceGroupsField,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  selectInvalidText,
  titleCaseRender,
} = require("./utils");
const { setUnfoundResourceGroup } = require("./store.utils");
const { nameField } = require("./reusable-fields");

/**
 * init scc v2 store
 * @param {*} store
 */
function initSccV2(store) {
  store.newField("scc_v2", {
    init: function (config) {
      config.store.json.scc_v2 = {
        enable: false,
        resource_group: "",
        region: "",
        account_id: "${var.account_id}",
        profile_attachments: [],
      };
    },
    onStoreUpdate: function (config) {
      if (!config.store.json.scc_v2) {
        config.store.json.scc_v2 = {
          enable: false,
          resource_group: "",
          region: "",
          account_id: "${var.account_id}",
          profile_attachments: [],
        };
      } else {
        setUnfoundResourceGroup(config, config.store.json.scc_v2);
      }
    },
    save: function (config, stateData) {
      if (stateData.enable === false) {
        stateData.enable = true;
      }
      transpose(stateData, config.store.json.scc_v2);
    },
    delete: function (config) {
      config.store.json.scc_v2.enable = false;
      config.store.json.scc_v2.profile_attachments = [];
      config.store.json.scc_v2.resource_group = "";
      config.store.json.scc_v2.region = "";
    },
    shouldDisableSave: shouldDisableComponentSave(
      ["resource_group", "region"],
      "scc_v2"
    ),
    schema: {
      name: {
        readOnly: true,
        size: "small",
        onRender: function () {
          return "scc";
        },
        helperText: function (stateData, componentProps) {
          return `${componentProps.craig.store.json._options.prefix}-scc`;
        },
      },
      resource_group: resourceGroupsField(true),
      region: {
        default: "",
        type: "select",
        size: "small",
        invalid: fieldIsNullOrEmptyString("region"),
        invalidText: selectInvalidText("region"),
        groups: ["us-south", "us-east", "eu-de"],
      },
    },
    subComponents: {
      profile_attachments: {
        create: function (config, stateData) {
          config.push(["json", "scc_v2", "profile_attachments"], stateData);
        },
        save: function (config, stateData, componentProps) {
          config.updateChild(
            ["json", "scc_v2", "profile_attachments"],
            componentProps.data.name,
            stateData
          );
        },
        delete: function (config, stateData, componentProps) {
          config.carve(
            ["json", "scc_v2", "profile_attachments"],
            componentProps.data.name
          );
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name", "profile", "schedule"],
          "scc_v2",
          "profile_attachments"
        ),
        schema: {
          name: nameField("profile_attachments"),
          profile: {
            type: "select",
            default: "",
            invalid: fieldIsNullOrEmptyString("profile"),
            invalidText: selectInvalidText("profile"),
            groups: [
              "FS Cloud",
              "Kubernetes Benchmark",
              "Cloud Internet Services Benchmark",
            ],
          },
          schedule: {
            type: "select",
            default: "",
            invalid: fieldIsNullOrEmptyString("schedule"),
            invalidText: selectInvalidText("schedule"),
            groups: ["Daily", "Every 7 Days", "Every 30 Days"],
            onRender: titleCaseRender("schedule"),
            onInputChange: function (stateData) {
              return snakeCase(stateData.schedule);
            },
          },
        },
      },
    },
  });
}

module.exports = {
  initSccV2,
};
