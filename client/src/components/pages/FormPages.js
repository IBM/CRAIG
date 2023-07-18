import {
  clusterHelperTestCallback,
  disableSave,
  forceShowForm,
  invalidCrnText,
  invalidCrns,
  invalidName,
  invalidNameText,
  propsMatchState,
  resourceGroupHelperTextCallback,
} from "../../lib";
import {
  AppIdTemplate,
  ClustersTemplate,
  ResourceGroupsTemplate,
  SecretsManagerTemplate,
  KeyManagementTemplate,
  ObjectStorageTemplate,
  TransitGatewayTemplate,
  VpnGatewayTemplate,
  VpcTemplate,
} from "icse-react-assets";
import { RenderDocs } from "./SimplePages";
import { splat } from "lazy-z";
import {
  cosResourceHelperTextCallback,
  encryptionKeyFilter,
  invalidEncryptionKeyRing,
} from "../../lib/forms";

const AppIdPage = (craig) => {
  return (
    <AppIdTemplate
      docs={RenderDocs("appid")}
      appid={craig.store.json.appid}
      disableSave={disableSave}
      onDelete={craig.appid.delete}
      onSave={craig.appid.save}
      onSubmit={craig.appid.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("appid")}
      invalidTextCallback={invalidNameText("appid")}
      invalidKeyCallback={invalidName("appid_key")}
      invalidKeyTextCallback={invalidNameText("appid_key")}
      onKeySave={craig.appid.keys.save}
      onKeyDelete={craig.appid.keys.delete}
      onKeySubmit={craig.appid.keys.create}
    />
  );
};

const ClusterPage = (craig) => {
  return (
    <ClustersTemplate
      docs={RenderDocs("clusters")}
      clusters={craig.store.json.clusters}
      disableSave={disableSave}
      onDelete={craig.clusters.delete}
      onSave={craig.clusters.save}
      onSubmit={craig.clusters.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("clusters")}
      invalidTextCallback={invalidNameText("clusters")}
      invalidPoolCallback={invalidName("worker_pools")}
      invalidPoolTextCallback={invalidNameText("worker_pools")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      vpcList={craig.store.vpcList}
      encryptionKeys={craig.store.encryptionKeys}
      subnetList={craig.getAllSubnets()}
      kubeVersionApiEndpoint="/api/cluster/versions"
      flavorApiEndpoint={`/api/cluster/${craig.store.json._options.region}/flavors`}
      helperTextCallback={clusterHelperTestCallback}
      cosNames={splat(craig.store.json.object_storage, "name")}
      onPoolSave={craig.clusters.worker_pools.save}
      onPoolDelete={craig.clusters.worker_pools.delete}
      onPoolSubmit={craig.clusters.worker_pools.create}
      disablePoolSave={function (field, stateData, componentProps) {
        // field is clusters, inject worker pools
        return disableSave("worker_pools", stateData, componentProps);
      }}
    />
  );
};

const KeyManagementPage = (craig) => {
  return (
    <KeyManagementTemplate
      docs={RenderDocs("key_management")}
      key_management={craig.store.json.key_management}
      disableSave={disableSave}
      onDelete={craig.key_management.delete}
      onSave={craig.key_management.save}
      onSubmit={craig.key_management.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      deleteDisabled={() => {
        return craig.store.json.key_management.length === 1;
      }}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("key_management")}
      invalidTextCallback={invalidNameText("key_management")}
      invalidKeyCallback={invalidName("encryption_keys")}
      invalidKeyTextCallback={invalidNameText("encryption_keys")}
      invalidRingCallback={invalidEncryptionKeyRing}
      invalidRingText={
        "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s"
      }
      onKeySave={craig.key_management.keys.save}
      onKeyDelete={craig.key_management.keys.delete}
      onKeySubmit={craig.key_management.keys.create}
    />
  );
};

const ObjectStoragePage = (craig) => {
  return (
    <ObjectStorageTemplate
      docs={RenderDocs("object_storage")}
      object_storage={craig.store.json.object_storage}
      disableSave={disableSave}
      onDelete={craig.object_storage.delete}
      onSave={craig.object_storage.save}
      onSubmit={craig.object_storage.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      kmsList={splat(craig.store.json.key_management, "name")}
      invalidCallback={invalidName("object_storage")}
      invalidTextCallback={invalidNameText("object_storage")}
      invalidKeyCallback={invalidName("cos_keys")}
      invalidKeyTextCallback={invalidNameText("cos_keys")}
      invalidBucketCallback={invalidName("buckets")}
      invalidBucketTextCallback={invalidNameText("buckets")}
      onKeySave={craig.object_storage.keys.save}
      onKeyDelete={craig.object_storage.keys.delete}
      onKeySubmit={craig.object_storage.keys.create}
      onBucketSave={craig.object_storage.buckets.save}
      onBucketDelete={craig.object_storage.buckets.delete}
      onBucketSubmit={craig.object_storage.buckets.create}
      composedNameCallback={cosResourceHelperTextCallback}
      encryptionKeyFilter={encryptionKeyFilter}
    />
  );
};

const ResourceGroupPage = (craig) => {
  return (
    <ResourceGroupsTemplate
      resource_groups={craig.store.json.resource_groups}
      docs={RenderDocs("resource_groups")}
      disableSave={disableSave}
      onDelete={craig.resource_groups.delete}
      onSave={craig.resource_groups.save}
      onSubmit={craig.resource_groups.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      deleteDisabled={() => {
        return craig.store.json.resource_groups.length === 1;
      }}
      helperTextCallback={resourceGroupHelperTextCallback}
      invalidCallback={invalidName("resource_groups")}
      invalidTextCallback={invalidNameText("resource_groups")}
    />
  );
};

const SecretsManagerPage = (craig) => {
  return (
    <SecretsManagerTemplate
      secrets_managers={craig.store.json.secrets_manager}
      disableSave={disableSave}
      onDelete={craig.secrets_manager.delete}
      onSave={craig.secrets_manager.save}
      onSubmit={craig.secrets_manager.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      invalidCallback={invalidName("secrets_manager")}
      invalidTextCallback={invalidNameText("secrets_manager")}
      secrets={craig.getAllResourceKeys()}
      docs={RenderDocs("secrets_manager")}
    />
  );
};

const TransitGatewayPage = (craig) => {
  return (
    <TransitGatewayTemplate
      docs={RenderDocs("transit_gateways")}
      transit_gateways={craig.store.json.transit_gateways}
      disableSave={disableSave}
      onDelete={craig.transit_gateways.delete}
      onSave={craig.transit_gateways.save}
      onSubmit={craig.transit_gateways.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("transit_gateways")}
      invalidTextCallback={invalidNameText("transit_gateways")}
      vpcList={craig.store.vpcList}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCrns={invalidCrns}
      invalidCrnText={invalidCrnText}
    />
  );
};

const VpnGatewayPage = (craig) => {
  return (
    <VpnGatewayTemplate
      docs={RenderDocs("vpn_gateways")}
      vpn_gateways={craig.store.json.vpn_gateways}
      disableSave={disableSave}
      onDelete={craig.vpn_gateways.delete}
      onSave={craig.vpn_gateways.save}
      onSubmit={craig.vpn_gateways.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("vpn_gateways")}
      invalidTextCallback={invalidNameText("vpn_gateways")}
      vpcList={craig.store.vpcList}
      subnetList={craig.getAllSubnets()}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
    />
  );
};

const VpcPage = (craig) => {
  return (
    <VpcTemplate
      docs={RenderDocs("vpcs")}
      vpcs={craig.store.json.vpcs}
      disableSave={disableSave}
      onDelete={craig.vpcs.delete}
      onSave={craig.vpcs.save}
      onSubmit={craig.vpcs.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("vpcs")}
      invalidTextCallback={invalidNameText("vpcs")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      cosBuckets={craig.store.cosBuckets}
    />
  );
};

export const NewFormPage = (props) => {
  let { form, craig } = props;
  if (form === "appID") {
    return AppIdPage(craig);
  } else if (form === "clusters") {
    return ClusterPage(craig);
  } else if (form === "keyManagement") {
    return KeyManagementPage(craig);
  } else if (form === "objectStorage") {
    return ObjectStoragePage(craig);
  } else if (form === "resourceGroups") {
    return ResourceGroupPage(craig);
  } else if (form === "secretsManager") {
    return SecretsManagerPage(craig);
  } else if (form === "transitGateways") {
    return TransitGatewayPage(craig);
  } else if (form === "vpnGateways") {
    return VpnGatewayPage(craig);
  } else if (form === "vpcs") {
    return VpcPage(craig);
  }
};
