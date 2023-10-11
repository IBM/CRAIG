import {
  buildSubnet,
  clusterHelperTestCallback,
  disableSave,
  forceShowForm,
  invalidCrnText,
  invalidCrns,
  invalidName,
  invalidNameText,
  newF5Vsi,
  propsMatchState,
  resourceGroupHelperTextCallback,
} from "../../lib";
import {
  AccessGroupsTemplate,
  AppIdTemplate,
  AtrackerPage,
  CloudDatabaseTemplate,
  ClustersTemplate,
  DnsTemplate,
  EventStreamsTemplate,
  ResourceGroupsTemplate,
  SecretsManagerTemplate,
  SecurityGroupTemplate,
  SubnetPageTemplate,
  KeyManagementTemplate,
  NetworkAclTemplate,
  ObjectStorageTemplate,
  RoutingTableTemplate,
  SshKeysTemplate,
  TransitGatewayTemplate,
  VpnGatewayTemplate,
  VpnServerTemplate,
  VpcTemplate,
  VpeTemplate,
  VsiTemplate,
  VsiLoadBalancerTemplate,
  IamAccountSettingsPage,
  SccV1Page,
  F5BigIpPage,
  PowerVsWorkspacePage,
  PowerVsInstancesPage,
  PowerVsVolumesPage,
} from "icse-react-assets";
import { RenderDocs } from "./SimplePages";
import {
  contains,
  isInRange,
  eachKey,
  isIpv4CidrOrAddress,
  isNullOrEmptyString,
  keys,
  nestedSplat,
  splat,
  isEmpty,
} from "lazy-z";
import {
  cosResourceHelperTextCallback,
  disableSshKeyDelete,
  encryptionKeyFilter,
  getSubnetTierStateData,
  getTierSubnets,
  invalidCidrBlock,
  invalidDnsZoneName,
  invalidEncryptionKeyRing,
  invalidSecurityGroupRuleName,
  invalidSecurityGroupRuleText,
  storageChangeDisabledCallback,
  vpnServersHelperText,
} from "../../lib/forms";
import {
  invalidCidr,
  invalidCrnList,
  invalidF5Vsi,
  invalidIamAccountSettings,
  invalidIdentityProviderURI,
  invalidSshPublicKey,
  invalidSubnetTierName,
  nullOrEmptyStringCheckCallback,
  invalidCpuCallback,
  invalidDescription,
  invalidTagList,
} from "../../lib/forms/invalid-callbacks";
import {
  accessGroupPolicyHelperTextCallback,
  aclHelperTextCallback,
  genericNameCallback,
  iamAccountSettingInvalidText,
  invalidCidrText,
  invalidSubnetTierText,
  invalidCpuTextCallback,
  powerVsWorkspaceHelperText,
  invalidDescriptionText,
} from "../../lib/forms/text-callbacks";
import { CopyRuleForm } from "../forms";
import { f5Images } from "../../lib/json-to-iac";
import { Tile } from "@carbon/react";
import { CloudAlerting } from "@carbon/icons-react";
import {
  edgeRouterEnabledZones,
  cosPlans,
  powerStoragePoolRegionMap,
} from "../../lib/constants";

const AccessGroupsPage = (craig) => {
  return (
    <AccessGroupsTemplate
      docs={RenderDocs("access_groups")}
      access_groups={craig.store.json.access_groups}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.access_groups.delete}
      onSave={craig.access_groups.save}
      onSubmit={craig.access_groups.create}
      invalidCallback={invalidName("access_groups")}
      invalidTextCallback={invalidNameText("access_groups")}
      invalidPolicyCallback={invalidName("policies")}
      invalidPolicyTextCallback={invalidNameText("policies")}
      policyHelperTextCallback={accessGroupPolicyHelperTextCallback}
      onPolicyDelete={craig.access_groups.policies.delete}
      onPolicySave={craig.access_groups.policies.save}
      onPolicySubmit={craig.access_groups.policies.create}
      craig={craig}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidDynamicPolicyCallback={invalidName("dynamic_policies")}
      invalidDynamicPolicyTextCallback={invalidNameText("dynamic_policies")}
      dynamicPolicyHelperTextCallback={accessGroupPolicyHelperTextCallback}
      invalidIdentityProviderCallback={invalidIdentityProviderURI}
      onDynamicPolicyDelete={craig.access_groups.dynamic_policies.delete}
      onDynamicPolicySave={craig.access_groups.dynamic_policies.save}
      onDynamicPolicySubmit={craig.access_groups.dynamic_policies.create}
    />
  );
};

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
      encryptionKeys={craig.store.encryptionKeys}
    />
  );
};

const Atracker = (craig) => {
  return (
    <AtrackerPage
      docs={RenderDocs("atracker")()}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      craig={craig}
      prefix={craig.store.json._options.prefix}
      region={craig.store.json._options.region}
      data={craig.store.json.atracker}
      resourceName={`${craig.store.json._options.prefix}-atracker`}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      cosKeys={craig.store.cosKeys}
      cosBuckets={craig.store.cosBuckets}
      onSave={craig.atracker.save}
    />
  );
};

const CloudDatabasePage = (craig) => {
  return (
    <CloudDatabaseTemplate
      icd={craig.store.json.icd}
      disableSave={disableSave}
      onDelete={craig.icd.delete}
      onSave={craig.icd.save}
      onSubmit={craig.icd.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      invalidCallback={invalidName("icd")}
      invalidTextCallback={invalidNameText("icd")}
      invalidCpuCallback={invalidCpuCallback}
      invalidCpuTextCallback={invalidCpuTextCallback}
      craig={craig}
      docs={RenderDocs("icd")}
    />
  );
};

const ClusterPage = (craig) => {
  return (
    <ClustersTemplate
      noSecretsManager={craig.store.json.secrets_manager.length === 0}
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
      secretsManagerList={splat(craig.store.json.secrets_manager, "name")}
      secretsManagerGroupCallback={function (stateData, componentProps, field) {
        return invalidName(field || "secrets_group")(
          stateData,
          componentProps,
          field
        );
      }}
      secretsManagerGroupCallbackText={invalidNameText("secrets_group")}
      secretCallback={function (stateData, componentProps, field) {
        return invalidName(field || "opaque_secrets")(
          stateData,
          componentProps,
          field
        );
      }}
      secretCallbackText={function (stateData, componentProps, field) {
        return invalidNameText(field || "opaque_secrets")(
          stateData,
          componentProps,
          field
        );
      }}
      descriptionInvalid={invalidDescription}
      descriptionInvalidText={invalidDescriptionText}
      labelsInvalid={invalidTagList}
      labelsInvalidText="One or more labels are invalid"
      onPoolSave={craig.clusters.worker_pools.save}
      onPoolDelete={craig.clusters.worker_pools.delete}
      onPoolSubmit={craig.clusters.worker_pools.create}
      onOpaqueSecretsSave={craig.clusters.opaque_secrets.save}
      onOpaqueSecretsDelete={craig.clusters.opaque_secrets.delete}
      onOpaqueSecretsSubmit={craig.clusters.opaque_secrets.create}
      disablePoolSave={function (field, stateData, componentProps) {
        // field is clusters, inject worker pools
        return disableSave("worker_pools", stateData, componentProps);
      }}
      disableOpaqueSecretsSave={function (field, stateData, componentProps) {
        // field is clusters, inject opaque secrets
        return disableSave("opaque_secrets", stateData, componentProps);
      }}
    />
  );
};

const DnsPage = (craig) => {
  return (
    <DnsTemplate
      craig={craig}
      docs={RenderDocs("dns")}
      dns={craig.store.json.dns}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.dns.delete}
      onSave={craig.dns.save}
      onSubmit={craig.dns.create}
      forceOpen={forceShowForm}
      invalidTextCallback={invalidNameText("dns")}
      invalidCallback={invalidName("dns")}
      onZoneSave={craig.dns.zones.save}
      onZoneDelete={craig.dns.zones.delete}
      onZoneSubmit={craig.dns.zones.create}
      invalidZoneNameCallback={invalidDnsZoneName}
      invalidZoneNameTextCallback={invalidNameText("zones")}
      invalidLabelCallback={nullOrEmptyStringCheckCallback("label")}
      invalidDescriptionCallback={invalidDescription}
      invalidDescriptionTextCallback={invalidDescriptionText}
      vpcList={craig.store.vpcList}
      onRecordSave={craig.dns.records.save}
      onRecordDelete={craig.dns.records.delete}
      onRecordSubmit={craig.dns.records.create}
      invalidRecordCallback={invalidName("records")}
      invalidRecordTextCallback={invalidNameText("records")}
      invalidRdataCallback={nullOrEmptyStringCheckCallback("records")}
      dnsZones={nestedSplat(craig.store.json.dns, "zones", "name")}
      onResolverSave={craig.dns.custom_resolvers.save}
      onResolverSubmit={craig.dns.custom_resolvers.create}
      onResolverDelete={craig.dns.custom_resolvers.delete}
      invalidResolverNameCallback={invalidName("custom_resolvers")}
      invalidResolverNameTextCallback={invalidNameText("custom_resolvers")}
      invalidResolverDescriptionCallback={invalidDescription}
      invalidResolverDescriptionTextCallback={invalidDescriptionText}
      subnetList={craig.getAllSubnets()}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
    />
  );
};

const EventStreamsPage = (craig) => {
  return (
    <EventStreamsTemplate
      event_streams={craig.store.json.event_streams}
      disableSave={disableSave}
      onDelete={craig.event_streams.delete}
      onSave={craig.event_streams.save}
      onSubmit={craig.event_streams.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("event_streams")}
      invalidTextCallback={invalidNameText("event_streams")}
      craig={craig}
      docs={RenderDocs("event_streams")}
    />
  );
};

const F5BigIp = (craig) => {
  let templateData = {};
  let vsiData = {};
  if (craig.store.json.f5_vsi.length > 0) {
    // pass in defaults if instances exist
    vsiData = {
      resource_group: craig.store.json.f5_vsi[0].resource_group,
      ssh_keys: craig.store.json.f5_vsi[0].ssh_keys,
      image: /f5-bigip-(15-1-5-1-0-0-14|16-1-2-2-0-0-28)-(ltm|all)-1slot/.exec(
        craig.store.json.f5_vsi[0].image
      )[0], // keep only image name in props
      profile: craig.store.json.f5_vsi[0].profile,
      zones: craig.store.json.f5_vsi.length,
    };
    templateData = craig.store.json.f5_vsi[0].template;
  } else {
    vsiData = {
      zones: craig.store.json.f5_vsi.length,
    };
  }
  return (
    <F5BigIpPage
      docs={RenderDocs("f5")()}
      craig={craig}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      invalidTemplateCallback={invalidF5Vsi}
      vsis={craig.store.json.f5_vsi || []}
      sshKeys={craig.store.sshKeys}
      edge_pattern={craig.store.edge_pattern}
      f5_on_management={craig.store.edge_vpc_name === "management"}
      instanceProfilesApiEndpoint={`/api/vsi/${craig.store.json._options.region}/instanceProfiles`}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      f5Images={Object.keys(f5Images().public_image_map)}
      initVsiCallback={newF5Vsi}
      saveVsiCallback={craig.f5.instance.save}
      templateData={templateData}
      deploymentData={vsiData}
      onTemplateSave={craig.f5.template.save}
      onVsiSave={craig.f5.vsi.save}
      noEdgePattern={craig.store.edge_pattern === undefined}
    />
  );
};

const IamAccountSettings = (craig) => {
  return (
    <IamAccountSettingsPage
      craig={craig}
      onSave={craig.iam_account_settings.save}
      onDelete={() => {
        craig.store.json.iam_account_settings.enable = false;
        craig.update();
      }}
      docs={RenderDocs("iam_account_settings")()}
      data={craig.store.json.iam_account_settings}
      useAddButton={craig.store.json.iam_account_settings.enable === false}
      noDeleteButton={craig.store.json.iam_account_settings.enable === false}
      invalidCallback={invalidIamAccountSettings}
      invalidTextCallback={iamAccountSettingInvalidText}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
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
        return (
          craig.store.json.key_management.length === 1 &&
          craig.store.json._options.fs_cloud
        );
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

const NetworkAclPage = (craig) => {
  return (
    <NetworkAclTemplate
      vpcs={craig.store.json.vpcs}
      docs={RenderDocs("acls")}
      forceOpen={forceShowForm}
      craig={craig}
      onAclSubmit={craig.vpcs.acls.create}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      child={CopyRuleForm}
      invalidTextCallback={invalidNameText("acls")}
      invalidCallback={invalidName("acls")}
      invalidRuleTextCallback={invalidNameText("acl_rules")}
      invalidRuleText={invalidName("acl_rules")}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      helperTextCallback={aclHelperTextCallback}
      onRuleSave={craig.vpcs.acls.rules.save}
      onRuleDelete={craig.vpcs.acls.rules.delete}
      onSubmitCallback={craig.vpcs.acls.rules.create}
      onSave={craig.vpcs.acls.save}
      onDelete={craig.vpcs.acls.delete}
    />
  );
};

const LoadBalancerPage = (craig) => {
  return (
    <VsiLoadBalancerTemplate
      docs={RenderDocs("load_balancers")}
      load_balancers={craig.store.json.load_balancers}
      disableSave={disableSave}
      onDelete={craig.load_balancers.delete}
      onSave={craig.load_balancers.save}
      onSubmit={craig.load_balancers.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("load_balancers")}
      invalidTextCallback={invalidNameText("load_balancers")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      vsiDeployments={craig.store.json.vsi}
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
      cosPlans={cosPlans}
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

const NoPowerNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> Power VS is not
      enabled. Return to the
      <a className="no-secrets-link" href="/">
        Options Page
      </a>{" "}
      to enable Power VS.
    </Tile>
  );
};

const NoPowerWorkspaceTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> No Power VS Workspaces.
      Go to the
      <a className="no-secrets-link" href="/form/power">
        Power VS Workspace Page
      </a>{" "}
      to create one.
    </Tile>
  );
};

const PowerInfraPage = (craig) => {
  return craig.store.json._options.enable_power_vs ? (
    <PowerVsWorkspacePage
      edgeRouterEnabledZones={edgeRouterEnabledZones}
      power={[...craig.store.json.power]}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.power.delete}
      onSave={craig.power.save}
      onSubmit={craig.power.create}
      forceOpen={forceShowForm}
      deleteDisabled={() => {
        return (
          craig.store.json.power.length === 1 &&
          (!isEmpty(craig.store.json.power_instances) ||
            !isEmpty(craig.store.json.power_volumes))
        );
      }}
      craig={craig}
      docs={RenderDocs("power")}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      zones={craig.store.json._options.power_vs_zones}
      onNetworkDelete={craig.power.network.delete}
      onNetworkSave={craig.power.network.save}
      onNetworkSubmit={craig.power.network.create}
      onConnectionDelete={craig.power.cloud_connections.delete}
      onConnectionSave={craig.power.cloud_connections.save}
      onConnectionSubmit={craig.power.cloud_connections.create}
      transitGatewayList={splat(craig.store.json.transit_gateways, "name")}
      onSshKeyDelete={craig.power.ssh_keys.delete}
      onSshKeySave={craig.power.ssh_keys.save}
      onSshKeySubmit={craig.power.ssh_keys.create}
      invalidCallback={invalidName("power")}
      invalidTextCallback={invalidNameText("power")}
      helperTextCallback={powerVsWorkspaceHelperText}
      invalidKeyCallback={invalidSshPublicKey}
      invalidNetworkNameCallback={invalidName("network")}
      invalidNetworkNameCallbackText={invalidNameText("network")}
      invalidConnectionNameCallback={invalidName("cloud_connections")}
      invalidConnectionNameTextCallback={invalidNameText("cloud_connections")}
      invalidCidrCallback={(stateData, componentProps) => {
        return invalidCidr(componentProps.craig)(
          { cidr: stateData.pi_cidr },
          componentProps
        );
      }}
      sshKeyDeleteDisabled={() => {
        // currently ssh keys are not in use, this will be updated when they are
        return false;
      }}
      invalidSshKeyCallback={(stateData, componentProps) => {
        // passthrough function to override field
        return invalidName("power_vs_ssh_keys")(stateData, componentProps);
      }}
      invalidSshKeyCallbackText={(stateData, componentProps) => {
        // passthrough function to override field
        return invalidNameText("power_vs_ssh_keys")(stateData, componentProps);
      }}
      invalidCidrCallbackText={(stateData, componentProps) => {
        return invalidCidrText(componentProps.craig)(
          {
            cidr: stateData.pi_cidr,
          },
          componentProps
        );
      }}
      invalidDnsCallback={(stateData) => {
        return (
          contains(stateData.pi_dns[0], "/") ||
          !isIpv4CidrOrAddress(stateData.pi_dns[0])
        );
      }}
      invalidDnsCallbackText={() => {
        return "Invalid IP Address";
      }}
      imageMap={require("../../lib/docs/power-image-map.json")}
      onAttachmentSave={craig.power.attachments.save}
      disableAttachmentSave={storageChangeDisabledCallback}
    />
  ) : (
    <NoPowerNetworkTile />
  );
};

const PowerVsInstances = (craig) => {
  return !craig.store.json._options.enable_power_vs ? (
    <NoPowerNetworkTile />
  ) : craig.store.json.power.length === 0 ? (
    <NoPowerWorkspaceTile />
  ) : (
    <PowerVsInstancesPage
      power_instances={craig.store.json.power_instances}
      storage_pool_map={powerStoragePoolRegionMap}
      power_volumes={craig.store.json.power_volumes}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onSave={craig.power_instances.save}
      onSubmit={craig.power_instances.create}
      onDelete={craig.power_instances.delete}
      craig={craig}
      power={craig.store.json.power}
      docs={RenderDocs("power_instances")}
      invalidCallback={invalidName("power_instances")}
      invalidTextCallback={invalidNameText("power_instances")}
      invalidIpCallback={(ip) => {
        if (isNullOrEmptyString(ip)) {
          return false;
        } else return contains(ip, "/") || !isIpv4CidrOrAddress(ip);
      }}
      invalidPiProcessorsCallback={(stateData) => {
        // weird is in range error with decimal numbers and is in range
        return (
          parseFloat(stateData.pi_processors) < 0.25 ||
          parseFloat(stateData.pi_processors) > 7
        );
      }}
      invalidPiMemoryCallback={(stateData) => {
        return !isInRange(parseFloat(stateData.pi_memory), 0, 918);
      }}
      invalidPiProcessorsTextCallback={() => {
        return "Must be a number between 0.25 and 7.";
      }}
      invalidPiMemoryTextCallback={() => {
        return "Must be a whole number less than 918.";
      }}
      storageChangesDisabledCallback={storageChangeDisabledCallback}
    />
  );
};

const PowerVsVolumes = (craig) => {
  return !craig.store.json._options.enable_power_vs ? (
    <NoPowerNetworkTile />
  ) : craig.store.json.power.length === 0 ? (
    <NoPowerWorkspaceTile />
  ) : (
    <PowerVsVolumesPage
      power_volumes={craig.store.json.power_volumes}
      disableSave={disableSave}
      propsMatchState={propsMatchState}
      onDelete={craig.power_volumes.delete}
      onSave={craig.power_volumes.save}
      onSubmit={craig.power_volumes.create}
      forceOpen={forceShowForm}
      craig={craig}
      docs={RenderDocs("power_volumes")}
      power={craig.store.json.power}
      power_instances={craig.store.json.power_instances}
      invalidCallback={invalidName("power_volumes")}
      invalidTextCallback={invalidNameText("power_volumes")}
      affinityChangesDisabled={() => {
        // placeholder
        return false;
      }}
      storage_pool_map={powerStoragePoolRegionMap}
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

const RoutingTablesPage = (craig) => {
  return (
    <RoutingTableTemplate
      routing_tables={craig.store.json.routing_tables}
      disableSave={disableSave}
      docs={RenderDocs("routing_tables")}
      propsMatchState={propsMatchState}
      onDelete={craig.routing_tables.delete}
      onSave={craig.routing_tables.save}
      onSubmit={craig.routing_tables.create}
      forceOpen={forceShowForm}
      craig={craig}
      vpcList={craig.store.vpcList}
      invalidCallback={invalidName("routing_tables")}
      invalidTextCallback={invalidNameText("routing_tables")}
      invalidRouteTextCallback={invalidNameText("routes")}
      invalidRouteCallback={invalidName("routes")}
      onRouteSave={craig.routing_tables.routes.delete}
      onRouteDelete={craig.routing_tables.routes.save}
      onRouteSubmit={craig.routing_tables.routes.create}
    />
  );
};

const SccV1 = (craig) => {
  let sccData = { ...craig.store.json.scc },
    sccEnabled = craig.store.json.scc.enable === false;
  eachKey(sccData, (key) => {
    if (sccData[key] === null) {
      sccData[key] = "";
    }
  });
  return (
    <SccV1Page
      docs={RenderDocs("security_compliance_center")()}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      craig={craig}
      data={sccData}
      onSave={craig.scc.save}
      useAddButton={sccEnabled}
      invalidCallback={invalidName("scc")}
      invalidTextCallback={() => {
        return genericNameCallback();
      }}
      noDeleteButton={sccEnabled}
      onDelete={() => {
        craig.store.json.scc.enable = false;
        craig.update();
      }}
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

const SecurityGroupPage = (craig) => {
  return (
    <>
      <SecurityGroupTemplate
        docs={RenderDocs("security_groups")}
        security_groups={craig.store.json.security_groups}
        disableSave={disableSave}
        onDelete={craig.security_groups.delete}
        onSave={craig.security_groups.save}
        onSubmit={craig.security_groups.create}
        propsMatchState={propsMatchState}
        forceOpen={forceShowForm}
        craig={craig}
        resourceGroups={splat(craig.store.json.resource_groups, "name")}
        invalidCallback={invalidName("security_groups")}
        invalidTextCallback={invalidNameText("security_groups")}
        disableSaveCallback={function (stateData, componentProps) {
          return (
            propsMatchState("sg_rules", stateData, componentProps) ||
            disableSave("sg_rules", stateData, componentProps)
          );
        }}
        invalidRuleText={invalidSecurityGroupRuleName}
        invalidRuleTextCallback={invalidSecurityGroupRuleText}
        onSubmitCallback={craig.security_groups.rules.create}
        onRuleSave={craig.security_groups.rules.save}
        onRuleDelete={craig.security_groups.rules.delete}
        vpcList={craig.store.vpcList}
      />
      {craig.store.json.security_groups.length > 0 && (
        <CopyRuleForm craig={craig} isAclForm={false} />
      )}
    </>
  );
};

const SubnetsPage = (craig) => {
  return (
    <SubnetPageTemplate
      vpcs={craig.store.json.vpcs}
      docs={RenderDocs("subnets")}
      forceOpen={forceShowForm}
      subnetTiers={craig.store.subnetTiers}
      dynamicSubnets={craig.store.json._options.dynamic_subnets}
      subnetListCallback={(stateData, componentProps) => {
        let nextTier = [craig.store.subnetTiers[componentProps.data.name]]
          .length;
        let subnets = [];
        while (subnets.length < stateData.zones) {
          subnets.push(
            buildSubnet(
              componentProps.vpc_name,
              keys(craig.store.subnetTiers).indexOf(componentProps.vpc_name),
              stateData.name,
              nextTier,
              stateData.networkAcl,
              componentProps.data.resource_group,
              subnets.length + 1,
              stateData.addPublicGateway
            )
          );
        }
        return subnets;
      }}
      craig={craig}
      propsMatchState={propsMatchState}
      disableSave={disableSave}
      invalidSubnetTierText={invalidSubnetTierText}
      invalidSubnetTierName={invalidSubnetTierName}
      invalidCidr={invalidCidr}
      invalidCidrText={invalidCidrText}
      invalidName={invalidName}
      invalidNameText={invalidNameText}
      getSubnetTierStateData={getSubnetTierStateData}
      getTierSubnets={getTierSubnets}
      onSubnetSubmit={craig.vpcs.subnetTiers}
      onSubnetSave={craig.vpcs.subnets.save}
      onSubnetTierSave={craig.vpcs.subnetTiers.save}
      onSubnetTierDelete={craig.vpcs.subnetTiers.delete}
    />
  );
};

const SshKeysPage = (craig) => {
  return (
    <SshKeysTemplate
      ssh_keys={craig.store.json.ssh_keys}
      disableSave={disableSave}
      onDelete={craig.ssh_keys.delete}
      onSave={craig.ssh_keys.save}
      onSubmit={craig.ssh_keys.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("ssh_keys")}
      invalidTextCallback={invalidNameText("ssh_keys")}
      craig={craig}
      docs={RenderDocs("ssh_keys")}
      deleteDisabled={disableSshKeyDelete}
      invalidKeyCallback={invalidSshPublicKey}
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
      power={craig.store.json.power}
      edgeRouterEnabledZones={edgeRouterEnabledZones}
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

const VpnServerPage = (craig) => {
  return (
    <VpnServerTemplate
      noSecretsManager={craig.store.json.secrets_manager.length === 0}
      vpn_servers={craig.store.json.vpn_servers}
      disableSave={disableSave}
      onDelete={craig.vpn_servers.delete}
      onSave={craig.vpn_servers.save}
      onSubmit={craig.vpn_servers.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      invalidCallback={invalidName("vpn_servers")}
      invalidTextCallback={invalidNameText("vpn_servers")}
      craig={craig}
      docs={RenderDocs("vpn_servers")}
      invalidCidrBlock={invalidCidrBlock}
      invalidCrnList={invalidCrnList}
      onRouteSave={craig.vpn_servers.routes.save}
      onRouteDelete={craig.vpn_servers.routes.delete}
      onRouteSubmit={craig.vpn_servers.routes.create}
      invalidRouteCallback={invalidName("vpn_server_routes")}
      invalidRouteTextCallback={invalidNameText("vpn_server_routes")}
      subnetList={craig.getAllSubnets()}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      helperTextCallback={vpnServersHelperText}
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

const VpePage = (craig) => {
  return (
    <VpeTemplate
      docs={RenderDocs("virtual_private_endpoints")}
      vpe={craig.store.json.virtual_private_endpoints}
      disableSave={disableSave}
      onDelete={craig.virtual_private_endpoints.delete}
      onSave={craig.virtual_private_endpoints.save}
      onSubmit={craig.virtual_private_endpoints.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      invalidCallback={invalidName("virtual_private_endpoints")}
      invalidTextCallback={invalidNameText("virtual_private_endpoints")}
      vpcList={craig.store.vpcList}
      subnetList={craig.getAllSubnets()}
      securityGroups={craig.store.json.security_groups}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      secretsManagerInstances={splat(craig.store.json.secrets_manager, "name")}
    />
  );
};

const VsiPage = (craig) => {
  return (
    <VsiTemplate
      docs={RenderDocs("vsi")}
      vsi={craig.store.json.vsi}
      disableSave={disableSave}
      onDelete={craig.vsi.delete}
      onSave={craig.vsi.save}
      onSubmit={craig.vsi.create}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      craig={craig}
      resourceGroups={splat(craig.store.json.resource_groups, "name")}
      encryptionKeys={craig.store.encryptionKeys}
      sshKeys={craig.store.sshKeys}
      apiEndpointImages={`/api/vsi/${craig.store.json._options.region}/images`}
      apiEndpointInstanceProfiles={`/api/vsi/${craig.store.json._options.region}/instanceProfiles`}
      invalidCallback={invalidName("vsi")}
      invalidTextCallback={invalidNameText("vsi")}
      invalidVolumeCallback={invalidName("volume")}
      invalidVolumeTextCallback={invalidNameText("volume")}
      onVolumeSave={craig.vsi.volumes.save}
      onVolumeDelete={craig.vsi.volumes.delete}
      onVolumeCreate={craig.vsi.volumes.create}
      vpcList={craig.store.vpcList}
      securityGroups={craig.store.json.security_groups}
      subnetList={craig.getAllSubnets()}
    />
  );
};

export const NewFormPage = (props) => {
  let { form, craig } = props;

  if (form === "accessGroups") {
    return AccessGroupsPage(craig);
  } else if (form === "appID") {
    return AppIdPage(craig);
  } else if (form === "activityTracker") {
    return Atracker(craig);
  } else if (form === "icd") {
    return CloudDatabasePage(craig);
  } else if (form === "clusters") {
    return ClusterPage(craig);
  } else if (form === "dns") {
    return DnsPage(craig);
  } else if (form === "eventStreams") {
    return EventStreamsPage(craig);
  } else if (form === "f5") {
    return F5BigIp(craig);
  } else if (form === "iamAccountSettings") {
    return IamAccountSettings(craig);
  } else if (form === "keyManagement") {
    return KeyManagementPage(craig);
  } else if (form === "lb") {
    return LoadBalancerPage(craig);
  } else if (form === "nacls") {
    return NetworkAclPage(craig);
  } else if (form === "objectStorage") {
    return ObjectStoragePage(craig);
  } else if (form === "power") {
    return PowerInfraPage(craig);
  } else if (form === "powerInstances") {
    return PowerVsInstances(craig);
  } else if (form === "powerVolumes") {
    return PowerVsVolumes(craig);
  } else if (form === "resourceGroups") {
    return ResourceGroupPage(craig);
  } else if (form === "securityComplianceCenter") {
    return SccV1(craig);
  } else if (form === "secretsManager") {
    return SecretsManagerPage(craig);
  } else if (form === "routingTables") {
    return RoutingTablesPage(craig);
  } else if (form === "securityGroups") {
    return SecurityGroupPage(craig);
  } else if (form === "sshKeys") {
    return SshKeysPage(craig);
  } else if (form === "subnets") {
    return SubnetsPage(craig);
  } else if (form === "transitGateways") {
    return TransitGatewayPage(craig);
  } else if (form === "vpcs") {
    return VpcPage(craig);
  } else if (form === "vpe") {
    return VpePage(craig);
  } else if (form === "vpn") {
    return VpnGatewayPage(craig);
  } else if (form === "vpnServers") {
    return VpnServerPage(craig);
  } else if (form === "vsi") {
    return VsiPage(craig);
  }
};
