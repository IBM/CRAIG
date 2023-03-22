import {
  resourceGroupHelperTextCallback,
  invalidNameText,
  propsMatchState,
  disableSave,
  invalidName,
  invalidEncryptionKeyRing,
  cosResourceHelperTextCallback,
  invalidSshPublicKey
} from "../lib/forms";
import {
  ResourceGroupForm,
  KeyManagementForm,
  ObjectStorageForm,
  SecretsManagerForm,
  AppIdForm,
  VpcForm,
  SshKeyForm,
  TransitGatewayForm,
  VpnGatewayForm
} from "icse-react-assets";
import { RenderDocs } from "./RenderDocs";
import { splat, contains, transpose } from "lazy-z";
import NaclForm from "./forms/NaclForm";

const pathToFormMap = {
  resourceGroups: {
    jsonField: "resource_groups",
    name: "ResourceGroups",
    addText: "Create a Resource Group",
    innerForm: ResourceGroupForm
  },
  secretsManager: {
    jsonField: "secrets_manager",
    name: "Secrets Manager",
    addText: "Create a Secrets Manager Instance",
    innerForm: SecretsManagerForm
  },
  keyManagement: {
    jsonField: "key_management",
    name: "Key Management",
    addText: "Create a Key Management Service",
    innerForm: KeyManagementForm
  },
  objectStorage: {
    jsonField: "object_storage",
    name: "Object Storage",
    addText: "Create an Object Storage Service",
    innerForm: ObjectStorageForm
  },
  appID: {
    jsonField: "appid",
    name: "AppID",
    addText: "Create an AppID Service",
    innerForm: AppIdForm
  },
  vpcs: {
    jsonField: "vpcs",
    name: "Virtual Private Clouds",
    addText: "Create a VPC",
    innerForm: VpcForm
  },
  sshKeys: {
    jsonField: "ssh_keys",
    name: "SSH Keys",
    addText: "Create an SSH Key",
    innerForm: SshKeyForm
  },
  transitGateways: {
    jsonField: "transit_gateways",
    name: "Transit Gateways",
    addText: "Create a Transit Gateway",
    innerForm: TransitGatewayForm
  },
  vpn: {
    jsonField: "vpn_gateways",
    name: "VPN Gateways",
    addText: "Create a VPN Gateway",
    innerForm: VpnGatewayForm
  }
};
/**
 * create form template props for form page
 * @param {string} form form name
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formProps(form, craig) {
  function none() {}

  if (form === "nacls") {
    return {
      name: "Network Access Control Lists",
      innerForm: NaclForm,
      arrayData: craig.store.json.vpcs,
      docs: RenderDocs("acls"),
      onSubmit: none,
      onDelete: none,
      onSave: none,
      disableSave: none,
      propsMatchState: none,
      hideFormTitleButton: true,
      innerFormProps: {
        craig: craig
      },
      toggleFormProps: {
        noDeleteButton: true,
        noSaveButton: true,
        hideName: true,
        submissionFieldName: "network_acls",
        disableSave: none,
        propsMatchState: none,
        nullRef: true
      }
    };
  }

  let formFields = pathToFormMap[form];
  let jsonField = pathToFormMap[form].jsonField;
  let formTemplate = {
    name: formFields.name,
    addText: formFields.addText,
    innerForm: formFields.innerForm,
    disableSave: disableSave,
    propsMatchState: propsMatchState,
    arrayData: craig.store.json[jsonField],
    onDelete: craig[jsonField].delete,
    onSave: craig[jsonField].save,
    onSubmit: craig[jsonField].create,
    docs: RenderDocs(jsonField),
    innerFormProps: {
      craig: craig,
      disableSave: disableSave,
      invalidCallback: invalidName(jsonField),
      invalidTextCallback: invalidNameText(jsonField)
    },
    toggleFormProps: {
      disableSave: disableSave,
      hideName: true,
      submissionFieldName: jsonField
    }
  };
  // add resource groups
  if (
    contains(
      [
        "secretsManager",
        "keyManagement",
        "objectStorage",
        "appID",
        "vpcs",
        "ssh_keys",
        "transitGateways",
        "vpn"
      ],
      form
    )
  ) {
    formTemplate.innerFormProps.resourceGroups = splat(
      craig.store.json.resource_groups,
      "name"
    );
  }
  // add encryption keys
  if (contains(["secretsManager"], form)) {
    formTemplate.innerFormProps.encryptionKeys = craig.store.encryptionKeys;
  }

  if (form === "resourceGroups") {
    /**
     * resource groups
     */
    formTemplate.deleteDisabled = () => {
      return craig.store.json.resource_groups.length === 1;
    };
    formTemplate.deleteDisabledMessage = "Cannot delete only resource group";
    formTemplate.innerFormProps.helperTextCallback = resourceGroupHelperTextCallback;
  } else if (form === "keyManagement") {
    /**
     * key management
     */
    formTemplate.deleteDisabled = () => {
      return craig.store.json.key_management.length === 1;
    };
    formTemplate.deleteDisabledMessage =
      "Cannot delete only Key Management instance";
    transpose(
      {
        invalidKeyCallback: invalidName("encryption_keys"),
        invalidKeyTextCallback: invalidNameText("encryption_keys"),
        invalidRingCallback: invalidEncryptionKeyRing,
        invalidRingText:
          "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        propsMatchState: propsMatchState,
        encryptionKeyProps: {
          onSave: craig.key_management.keys.save,
          onDelete: craig.key_management.keys.delete,
          onSubmit: craig.key_management.keys.create,
          disableSave: disableSave,
          craig: craig
        }
      },
      formTemplate.innerFormProps
    );
  } else if (form === "objectStorage") {
    /**
     * cos
     */
    transpose(
      {
        composedNameCallback: cosResourceHelperTextCallback,
        kmsList: splat(craig.store.json.key_management, "name"),
        invalidKeyCallback: invalidName("cos_keys"),
        invalidKeyTextCallback: invalidNameText("cos_keys"),
        propsMatchState: propsMatchState,
        invalidBucketCallback: invalidName("buckets"),
        invalidBucketTextCallback: invalidNameText("buckets"),
        keyProps: {
          onSave: craig.object_storage.keys.save,
          onDelete: craig.object_storage.keys.delete,
          onSubmit: craig.object_storage.keys.create,
          disableSave: disableSave,
          craig: craig
        },
        bucketProps: {
          onSave: craig.object_storage.buckets.save,
          onDelete: craig.object_storage.buckets.delete,
          onSubmit: craig.object_storage.buckets.create,
          disableSave: disableSave,
          craig: craig,
          encryptionKeys: craig.store.encryptionKeys
        }
      },
      formTemplate.innerFormProps
    );
  } else if (form === "appID") {
    /**
     * appid
     */
    transpose(
      {
        invalidKeyCallback: invalidName("appid_keys"),
        invalidKeyTextCallback: invalidNameText("appid_keys"),
        propsMatchState: propsMatchState,
        keyProps: {
          disableSave: disableSave,
          onSave: craig.appid.keys.save,
          onDelete: craig.appid.keys.delete,
          onSubmit: craig.appid.keys.create,
          craig: craig
        }
      },
      formTemplate.innerFormProps
    );
  } else if (form === "vpcs") {
    /**
     * vpcs
     */
    formTemplate.innerFormProps.cosBuckets = craig.store.cosBuckets;
  } else if (form === "sshKeys") {
    formTemplate.innerFormProps.invalidKeyCallback = invalidSshPublicKey;
  } else if (form === "transitGateways") {
    formTemplate.innerFormProps.vpcList = craig.store.vpcList;
    formTemplate.innerFormProps.readOnlyName = false;
  } else if (form === "vpn") {
    formTemplate.innerFormProps.vpcList = craig.store.vpcList;
    formTemplate.innerFormProps.subnetList = craig.getAllSubnets();
  }
  return formTemplate;
}

export default formProps;
