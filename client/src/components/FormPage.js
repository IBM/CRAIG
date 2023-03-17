import React from "react";
import {
  IcseFormTemplate,
  ResourceGroupForm,
  KeyManagementForm,
  ObjectStorageForm,
  SecretsManagerForm,
  SshKeyForm,
  AppIdForm,
  VpcForm
} from "icse-react-assets";
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
import PropTypes from "prop-types";
import { splat } from "lazy-z";
import { RenderDocs } from "./RenderDocs";

/**
 * create form template props for form page
 * @param {string} form form name
 * @param {lazyZstate} craig
 * @returns {Object} form template props
 */
function formTemplateProps(form, craig) {
  if (form === "resourceGroups") {
    return {
      name: "Resource Groups",
      addText: "Create a Resource Group",
      arrayData: craig.store.json.resource_groups,
      innerForm: ResourceGroupForm,
      disableSave: disableSave,
      onDelete: craig.resource_groups.delete,
      onSave: craig.resource_groups.save,
      onSubmit: craig.resource_groups.create,
      propsMatchState: propsMatchState,
      docs: RenderDocs("resource_groups"),
      deleteDisabled: () => {
        return craig.store.json.resource_groups.length === 1;
      },
      deleteDisabledMessage: "Cannot delete only resource group",
      innerFormProps: {
        craig: craig,
        disableSave: invalidName("resource_groups"),
        invalidCallback: invalidName("resource_groups"),
        invalidTextCallback: invalidNameText("resource_groups"),
        helperTextCallback: resourceGroupHelperTextCallback
      },
      toggleFormProps: {
        disableSave: disableSave,
        hideName: true,
        submissionFieldName: "resource_groups"
      }
    };
  } else if (form === "secretsManager") {
    return {
      name: "Secrets Manager",
      addText: "Create a Secrets Manager Instance",
      docs: RenderDocs("secrets_manager"),
      arrayData: craig.store.json.secrets_manager,
      innerForm: SecretsManagerForm,
      disableSave: disableSave,
      onDelete: craig.secrets_manager.delete,
      onSave: craig.secrets_manager.save,
      onSubmit: craig.secrets_manager.create,
      propsMatchState: propsMatchState,
      innerFormProps: {
        craig: craig,
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        disableSave: invalidName("secrets_manager"),
        invalidCallback: invalidName("secrets_manager"),
        invalidTextCallback: invalidNameText("secrets_manager"),
        helperTextCallback: resourceGroupHelperTextCallback,
        encryptionKeys: craig.store.encryptionKeys
      },
      toggleFormProps: {
        disableSave: disableSave,
        hideName: true,
        submissionFieldName: "secrets_manager"
      }
    };
  } else if (form === "keyManagement") {
    return {
      name: "Key Management",
      addText: "Create a Key Management Service",
      docs: RenderDocs("key_management"),
      arrayData: craig.store.json.key_management,
      innerForm: KeyManagementForm,
      disableSave: disableSave,
      onDelete: craig.key_management.delete,
      onSave: craig.key_management.save,
      onSubmit: craig.key_management.create,
      propsMatchState: propsMatchState,
      deleteDisabled: () => {
        return craig.store.json.key_management.length === 1;
      },
      deleteDisabledMessage: "Cannot delete only Key Management instance",
      innerFormProps: {
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        craig: craig,
        disableSave: invalidName("key_management"),
        invalidCallback: invalidName("key_management"),
        invalidTextCallback: invalidNameText("key_management"),
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
      toggleFormProps: {
        hideName: true,
        submissionFieldName: "key_management"
      }
    };
  } else if (form === "objectStorage") {
    return {
      name: "Object Storage",
      addText: "Create an Object Storage Service",
      arrayData: craig.store.json.object_storage,
      innerForm: ObjectStorageForm,
      disableSave: disableSave,
      onDelete: craig.object_storage.delete,
      onSave: craig.object_storage.save,
      onSubmit: craig.object_storage.create,
      propsMatchState: propsMatchState,
      docs: RenderDocs("object_storage"),
      innerFormProps: {
        craig: craig,
        composedNameCallback: cosResourceHelperTextCallback,
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        kmsList: splat(craig.store.json.key_management, "name"),
        disableSave: invalidName("object_storage"),
        invalidCallback: invalidName("object_storage"),
        invalidTextCallback: invalidNameText("object_storage"),
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
      toggleFormProps: {
        hideName: true,
        submissionFieldName: "object_storage"
      }
    };
  } else if (form === "appID") {
    return {
      name: "AppID",
      addText: "Create an AppID Service",
      docs: RenderDocs("appid"),
      arrayData: craig.store.json.appid,
      innerForm: AppIdForm,
      disableSave: disableSave,
      onDelete: craig.appid.delete,
      onSave: craig.appid.save,
      onSubmit: craig.appid.create,
      propsMatchState: propsMatchState,
      innerFormProps: {
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        craig: craig,
        disableSave: invalidName("appid"),
        invalidCallback: invalidName("appid"),
        invalidTextCallback: invalidNameText("appid"),
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
      toggleFormProps: {
        hideName: true,
        submissionFieldName: "appid"
      }
    };
  } else if (form === "vpcs") {
    return {
      name: "Virtual Private Clouds",
      addText: "Create a VPC",
      arrayData: craig.store.json.vpcs,
      innerForm: VpcForm,
      disableSave: disableSave,
      onDelete: craig.vpcs.delete,
      onSave: craig.vpcs.save,
      onSubmit: craig.vpcs.create,
      propsMatchState: propsMatchState,
      docs: RenderDocs("vpcs"),
      innerFormProps: {
        craig: craig,
        disableSave: disableSave,
        invalidCallback: invalidName("vpcs"),
        invalidTextCallback: invalidNameText("vpcs"),
        cosBuckets: craig.store.cosBuckets,
        resourceGroups: splat(craig.store.json.resource_groups, "name")
      },
      toggleFormProps: {
        disableSave: disableSave,
        hideName: true,
        submissionFieldName: "vpcs",
        hide: false
      }
    };
  } else if (form === "sshKeys") {
    return {
      name: "SSH Keys",
      addText: "Create an SSH Key",
      arrayData: craig.store.json.ssh_keys,
      innerForm: SshKeyForm,
      disableSave: disableSave,
      onDelete: craig.ssh_keys.delete,
      onSave: craig.ssh_keys.save,
      onSubmit: craig.ssh_keys.create,
      propsMatchState: propsMatchState,
      innerFormProps: {
        craig: craig,
        resourceGroups: splat(craig.store.json.resource_groups, "name"),
        disableSave: disableSave,
        invalidCallback: invalidName("ssh_keys"),
        invalidTextCallback: invalidNameText("ssh_keys"),
        invalidKeyCallback: invalidSshPublicKey,
        propsMatchState: propsMatchState
      },
      toggleFormProps: {
        hideName: true,
        submissionFieldName: "ssh_keys"
      }
    };
  }
}

export const FormPage = props => {
  return <IcseFormTemplate {...formTemplateProps(props.form, props.craig)} />;
};

FormPage.propTypes = {
  form: PropTypes.string.isRequired
};
