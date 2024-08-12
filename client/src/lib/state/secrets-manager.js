const { nameField } = require("./reusable-fields");
const {
  setUnfoundResourceGroup,
  pushToChildFieldModal,
  updateSubChild,
  deleteSubChild,
} = require("./store.utils");
const {
  setKmsFromKeyOnStoreUpdate,
  shouldDisableComponentSave,
  fieldIsNullOrEmptyString,
  resourceGroupsField,
  encryptionKeyGroups,
  hideWhenUseData,
  selectInvalidText,
  kebabCaseInput,
  titleCaseRender,
} = require("./utils");

/**
 * secrets manager on store update
 * @param {lazyZstate} config state store
 * @param {object} config.store
 * @param {object} config.store.json
 * @param {Array<Object>} config.store.json.secrets_manager
 */
function secretsManagerOnStoreUpdate(config) {
  config.store.json.secrets_manager.forEach((secretsManager) => {
    setUnfoundResourceGroup(config, secretsManager);
    setKmsFromKeyOnStoreUpdate(secretsManager, config);
    if (!secretsManager.secrets) {
      secretsManager.secrets = [];
    }
    if (!secretsManager.secrets_groups) {
      secretsManager.secrets_groups = [];
    } else {
      secretsManager.secrets_groups.forEach((group) => {
        group.secrets_manager = secretsManager.name;
      });
    }
  });
}

/**
 * create a new secretsManager instance
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 */
function secretsManagerCreate(config, stateData) {
  config.push(["json", "secrets_manager"], stateData);
}

/**
 * update existing secretsManager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerSave(config, stateData, componentProps) {
  config.store.json.clusters.forEach((cluster) => {
    cluster.opaque_secrets.forEach((secret) => {
      if (secret.secrets_manager == componentProps.data.name) {
        secret.secrets_manager = stateData.name;
      }
    });
  });
  config.updateChild(
    ["json", "secrets_manager"],
    componentProps.data.name,
    stateData
  );
}

/**
 * delete secrets manager
 * @param {lazyZstate} config
 * @param {object} stateData component state data
 * @param {object} componentProps props from component form
 */
function secretsManagerDelete(config, stateData, componentProps) {
  config.carve(["json", "secrets_manager"], componentProps.data.name);
}

/**
 * create secrets manager store
 * @param {*} store
 */
function initSecretsManagerStore(store) {
  store.newField("secrets_manager", {
    init: (config) => {
      config.store.json.secrets_manager = [];
    },
    onStoreUpdate: secretsManagerOnStoreUpdate,
    create: secretsManagerCreate,
    save: secretsManagerSave,
    delete: secretsManagerDelete,
    shouldDisableSave: shouldDisableComponentSave(
      ["name", "resource_group", "encryption_key"],
      "secrets_manager"
    ),
    schema: {
      use_data: {
        type: "toggle",
        default: false,
        labelText: "Use Existing Instance",
      },
      name: nameField("secrets_manager"),
      resource_group: resourceGroupsField(false, {
        noHideWhen: true,
      }),
      plan: {
        type: "select",
        default: "standard",
        invalid: fieldIsNullOrEmptyString("plan"),
        invalidText: selectInvalidText("plan"),
        hideWhen: hideWhenUseData,
        groups: ["Standard", "Trial"],
        onRender: function (stateData, componentProps) {
          if (!componentProps?.data?.plan) {
            // add to plan to component props prevent button from highlighting
            // when no plan is selected
            if (componentProps.data) componentProps.data.plan = stateData.plan;
          }
          return titleCaseRender("plan")(stateData);
        },
        onInputChange: kebabCaseInput("plan"),
        tooltip: {
          content:
            "You can have one Trial instance provisioned in your account at any time. After your 30 day trial expires, functionality is removed but your instance remains available to upgrade for an additional 30 days.",
          align: "right",
          alignModal: "right",
        },
      },
      add_k8s_authorization: {
        type: "toggle",
        default: false,
        labelText: "Add Kubernetes Authorization",
        tooltip: {
          content:
            "Add an authorization to allow Kubernetes clusters to read from this Secrets Manager instance",
        },
        hideWhen: hideWhenUseData,
      },
      add_cis_authorization: {
        type: "toggle",
        default: false,
        labelText: "Add CIS Authorization",
        tooltip: {
          content:
            "Add an authorization to allow IBM Cloud Internet Services to read from this Secrets Manager instance",
        },
        hideWhen: hideWhenUseData,
      },
      encryption_key: {
        type: "select",
        default: "",
        invalid: fieldIsNullOrEmptyString("encryption_key"),
        invalidText: selectInvalidText("encryption key"),
        groups: encryptionKeyGroups,
        hideWhen: hideWhenUseData,
      },
    },
    subComponents: {
      secrets_groups: {
        create: function (config, stateData, componentProps) {
          pushToChildFieldModal(
            config,
            "secrets_manager",
            "secrets_groups",
            stateData,
            componentProps
          );
        },
        save: function (config, stateData, componentProps) {
          updateSubChild(
            config,
            "secrets_manager",
            "secrets_groups",
            stateData,
            componentProps
          );
        },
        delete: function (config, stateData, componentProps) {
          deleteSubChild(
            config,
            "secrets_manager",
            "secrets_groups",
            componentProps
          );
        },
        shouldDisableSave: shouldDisableComponentSave(
          ["name"],
          "secrets_manager",
          "secrets_groups"
        ),
        schema: {
          name: nameField("secrets_groups"),
        },
      },
    },
  });
}

module.exports = {
  secretsManagerOnStoreUpdate,
  secretsManagerCreate,
  secretsManagerSave,
  secretsManagerDelete,
  initSecretsManagerStore,
};
