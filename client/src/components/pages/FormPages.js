import React from "react";
import { disableSave, forceShowForm, propsMatchState } from "../../lib";
import { RenderDocs } from "./SimplePages";
import { arraySplatIndex, contains, transpose } from "lazy-z";
import { disableSshKeyDelete } from "../../lib/forms";
import { CopyRuleForm } from "../forms";
import { Tile } from "@carbon/react";
import { CloudAlerting, FetchUploadCloud } from "@carbon/icons-react";
import powerStoragePoolRegionMap from "../../lib/docs/power-storage-pool-map.json";
import DynamicForm from "../forms/DynamicForm";
import {
  CraigEmptyResourceTile,
  NoCisTile,
  NoPowerNetworkTile,
} from "../forms/dynamic-form/tiles";
import PropTypes from "prop-types";
import {
  PrimaryButton,
  CraigFormHeading,
  CraigToggleForm,
  DynamicFormModal,
  RenderForm,
  StatefulTabs,
  StatelessFormWrapper,
} from "../forms/utils";
import { craigForms } from "./CraigForms";
import { DynamicAclForm } from "./vpc/DynamicAclForm";
import { DynamicSubnetTierForm } from "./vpc/DynamicSubnetTierForm";
import FormTemplate from "../forms/utils/FormTemplate";

function cbrPageTemplate(craig) {
  let forms = craigForms(craig);
  let zoneOptions = {
    name: "Context Based Restriction Zones",
    addText: "Add a CBR Zone",
    formName: "cbr_zones",
    jsonField: "cbr_zones",
  };
  let ruleOptions = {
    name: "Context Based Restriction Rules",
    addText: "Add a CBR Rule",
    formName: "cbr_rules",
    jsonField: "cbr_rules",
  };
  let zoneInnerFormProps = {
    craig: craig,
    form: forms[zoneOptions.jsonField],
    disableSave: disableSave,
    formName: zoneOptions.formName,
  };
  let ruleInnerFormProps = {
    craig: craig,
    form: forms[ruleOptions.jsonField],
    disableSave: disableSave,
    formName: ruleOptions.formName,
  };

  return (
    <>
      <StatefulTabs
        name="Context Based Restrictions"
        about={RenderDocs("cbr", craig.store.json._options.template)()}
        form={
          <>
            <div
              className="subForm marginBottomNone"
              style={{ marginBottom: "0" }}
            >
              <FormTemplate
                name={zoneOptions.name}
                addText={zoneOptions.addText}
                arrayData={craig.store.json[zoneOptions.jsonField]}
                onDelete={craig[zoneOptions.jsonField].delete}
                onSave={craig[zoneOptions.jsonField].save}
                onSubmit={craig[zoneOptions.jsonField].create}
                subHeading={true}
                innerForm={DynamicForm}
                hideAbout={true}
                hideFormTitleButton={zoneOptions.hideFormTitleButton}
                overrideTile={zoneOptions.overrideTile}
                innerFormProps={zoneInnerFormProps}
                deleteDisabledMessage={zoneOptions.deleteDisabledMessage}
                deleteDisabled={zoneOptions.deleteDisabled}
                toggleFormProps={{
                  craig: craig,
                  submissionFieldName: zoneOptions.jsonField,
                  hideName: true,
                  type: "formInSubForm",
                  isMiddleForm: true,
                }}
              />
            </div>
            <div className="subForm">
              <FormTemplate
                name={ruleOptions.name}
                innerForm={DynamicForm}
                addText={ruleOptions.addText}
                arrayData={craig.store.json[ruleOptions.jsonField]}
                onDelete={craig[ruleOptions.jsonField].delete}
                onSave={craig[ruleOptions.jsonField].save}
                onSubmit={craig[ruleOptions.jsonField].create}
                subHeading={true}
                hideAbout={true}
                hideFormTitleButton={false}
                overrideTile={ruleOptions.overrideTile}
                innerFormProps={ruleInnerFormProps}
                deleteDisabledMessage={ruleOptions.deleteDisabledMessage}
                deleteDisabled={ruleOptions.deleteDisabled}
                toggleFormProps={{
                  craig: craig,
                  submissionFieldName: ruleOptions.jsonField,
                  hideName: true,
                  type: "formInSubForm",
                  isMiddleForm: true,
                }}
              />
            </div>
          </>
        }
      />
    </>
  );
}

export const formPageTemplate = (craig, options, form) => {
  let forms = craigForms(craig);
  let innerFormProps = {
    craig: craig,
    form: form ? form : forms[options.jsonField],
    disableSave: disableSave,
    formName: options.formName,
  };
  if (options.innerFormProps) transpose(options.innerFormProps, innerFormProps);
  return (
    <FormTemplate
      name={options.name}
      addText={options.addText}
      docs={RenderDocs(options.jsonField, craig.store.json._options.template)}
      arrayData={craig.store.json[options.jsonField]}
      onDelete={craig[options.jsonField].delete}
      onSave={craig[options.jsonField].save}
      onSubmit={craig[options.jsonField].create}
      disableSave={disableSave}
      innerForm={DynamicForm}
      propsMatchState={propsMatchState}
      forceOpen={forceShowForm}
      hideFormTitleButton={options.hideFormTitleButton}
      overrideTile={options.overrideTile}
      innerFormProps={innerFormProps}
      deleteDisabledMessage={options.deleteDisabledMessage}
      deleteDisabled={options.deleteDisabled}
      toggleFormProps={{
        craig: craig,
        disableSave: disableSave,
        submissionFieldName: options.jsonField,
        hideName: true,
        // hide: false,
      }}
    />
  );
};

formPageTemplate.propTypes = {
  craig: PropTypes.shape({}).isRequired,
  options: PropTypes.shape({
    jsonField: PropTypes.string.isRequired,
    hideFormTitleButton: PropTypes.bool,
    overrideTile: PropTypes.node,
    formName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    addText: PropTypes.string.isRequired,
  }).isRequired,
  form: PropTypes.shape({}).isRequired,
};

const AccessGroupsPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Access Groups",
    addText: "Create an Access Group",
    formName: "access-groups",
    jsonField: "access_groups",
  });
};

const CbrForm = (craig) => {
  return cbrPageTemplate(craig);
};

const AppIdPage = (craig) => {
  return formPageTemplate(craig, {
    name: "AppID",
    addText: "Create an AppID Instance",
    formName: "appid",
    jsonField: "appid",
  });
};

const Atracker = (craig) => {
  return (
    <CraigToggleForm
      craig={craig}
      about={RenderDocs("atracker", craig.store.json._options.template)()}
      name="iac-atracker"
      hideName
      noDeleteButton={true}
      onDelete={craig.atracker.delete}
      useAddButton={false}
      tabPanel={{
        name: "Activity Tracker",
      }}
      onShowToggle={() => {}}
      submissionFieldName="atracker"
      onSave={craig.atracker.save}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.atracker,
        disableSave: disableSave,
        form: {
          jsonField: "atracker",
          disableSave: disableSave,
          groups: [
            {
              enabled: craig.atracker.enabled,
              instance: craig.atracker.instance,
            },
            {
              name: craig.atracker.name,
              locations: craig.atracker.locations,
              bucket: craig.atracker.bucket,
            },
            {
              add_route: craig.atracker.add_route,
              cos_key: craig.atracker.cos_key,
            },
            {
              resource_group: craig.atracker.resource_group,
              plan: craig.atracker.plan,
            },
          ],
        },
      }}
    />
  );
};

const Cis = (craig) => {
  return formPageTemplate(craig, {
    name: "Cloud Internet Services (CIS)",
    addText: "Create a CIS Instance",
    formName: "CIS",
    jsonField: "cis",
  });
};

const CisGlbs = (craig) => {
  return formPageTemplate(craig, {
    name: "CIS Global Load Balancers",
    addText: "Create an Origin Pool",
    formName: "cis-glbs",
    jsonField: "cis_glbs",
    overrideTile: craig.store.json.cis.length === 0 ? <NoCisTile /> : undefined,
  });
};

const ClassicSecurityGroups = (craig) => {
  return formPageTemplate(craig, {
    name: "Classic Security Groups",
    addText: "Create a Security Group",
    formName: "classic-security-groups",
    jsonField: "classic_security_groups",
  });
};

const ClassicGateways = (craig) => {
  return formPageTemplate(craig, {
    name: "Classic Gateways",
    addText: "Create a Gateway",
    formName: "classic-gateways",
    jsonField: "classic_gateways",
  });
};

const ClassicSshKeyPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Classic SSH Keys",
    addText: "Create an SSH Key",
    jsonField: "classic_ssh_keys",
  });
};

const ClassicVlanPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Classic VLANs",
    addText: "Create a VLAN",
    jsonField: "classic_vlans",
    formName: "classic-vlans",
  });
};

const CloudDatabasePage = (craig) => {
  return formPageTemplate(craig, {
    name: "Cloud Databases",
    addText: "Create a Cloud Database",
    jsonField: "icd",
    formName: "icd",
  });
};

const ClusterPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Clusters",
    addText: "Create a Cluster",
    jsonField: "clusters",
    formName: "clusters",
  });
};

const DnsPage = (craig) => {
  return formPageTemplate(craig, {
    name: "DNS Service",
    addText: "Create a DNS Service Instance",
    jsonField: "dns",
    formName: "DNS",
  });
};

const EventStreamsPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Event Streams",
    addText: "Create an Event Streams Service",
    jsonField: "event_streams",
    formName: "Event Streams",
  });
};

const NoEdgeNetworkTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <span>
        <CloudAlerting size="24" className="iconMargin" /> No Edge Network. Go
        back to the{" "}
        <a className="no-secrets-link" href="/">
          Home page
        </a>{" "}
        to enable Edge Networking.{" "}
        <em>
          Dynamic Scalable Subnets must be disabled to create an Edge VPC
          network.
        </em>
      </span>
    </Tile>
  );
};

export const F5BigIp = (craig, isBeta) => {
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

  const F5 = () => {
    return (
      <>
        <CraigToggleForm
          name="F5 Big IP Template Configuration"
          submissionFieldName="f5_vsi_template"
          noDeleteButton
          hideName
          hide={isBeta ? false : true}
          hideChevron={isBeta}
          onSave={craig.f5.template.save}
          type="formInSubForm"
          tabPanel={{ hideAbout: true }}
          craig={craig}
          innerFormProps={{
            craig: craig,
            form: {
              groups: [
                {
                  license_type: craig.f5.template.license_type,
                  tmos_admin_password: craig.f5.template.tmos_admin_password,
                },
                {
                  byol_license_basekey: craig.f5.template.byol_license_basekey,
                  license_username: craig.f5.template.license_username,
                  license_password: craig.f5.template.license_password,
                },
                {
                  license_host: craig.f5.template.license_host,
                  license_pool: craig.f5.template.license_pool,
                },
                {
                  license_unit_of_measure:
                    craig.f5.template.license_unit_of_measure,
                  license_sku_keyword_1:
                    craig.f5.template.license_sku_keyword_1,
                },
                {
                  license_sku_keyword_2:
                    craig.f5.template.license_sku_keyword_2,
                },
                {
                  template_version: craig.f5.template.template_version,
                  template_source: craig.f5.template.template_source,
                },
                {
                  app_id: craig.f5.template.app_id,
                  phone_home_url: craig.f5.template.phone_home_url,
                },
                {
                  do_declaration_url: craig.f5.template.do_declaration_url,
                  as3_declaration_url: craig.f5.template.as3_declaration_url,
                },
                {
                  ts_declaration_url: craig.f5.template.ts_declaration_url,
                  tgstandby_url: craig.f5.template.tgstandby_url,
                },
                {
                  tgrefresh_url: craig.f5.template.tgrefresh_url,
                  tgactive_url: craig.f5.template.tgactive_url,
                },
              ],
            },
            data: templateData,
          }}
        />
        <CraigToggleForm
          name="Configure F5 Big IP"
          hide={isBeta ? false : true}
          hideChevron={isBeta}
          noDeleteButton
          hideName
          craig={craig}
          type="formInSubForm"
          submissionFieldName="f5_vsi"
          tabPanel={{ hideAbout: true }}
          innerFormProps={{
            data: vsiData,
            craig: craig,
            form: {
              groups: [
                {
                  zones: craig.f5.vsi.zones,
                  resource_group: craig.f5.vsi.resource_group,
                  ssh_keys: craig.f5.vsi.ssh_keys,
                },
                {
                  image: craig.f5.vsi.image,
                  profile: craig.f5.vsi.profile,
                },
              ],
            },
          }}
          onSave={craig.f5.vsi.save}
        />
      </>
    );
  };

  return isBeta ? (
    <F5 />
  ) : craig.store.edge_pattern === undefined ? (
    <StatefulTabs
      name="F5 Big IP"
      hideFormTitleButton
      form={<NoEdgeNetworkTile />}
      about={RenderDocs("f5", craig.store.json._options.template)()}
    />
  ) : (
    <CraigToggleForm
      craig={craig}
      noSaveButton
      about={RenderDocs("f5", craig.store.json._options.template)()}
      tabPanel={{
        name: "F5 Big IP",
      }}
      noDeleteButton
      hideName
      name="F5 Big IP"
      submissionFieldName=""
      nullRef
      overrideDynamicForm={F5}
    />
  );
};

const FortigateVnf = (craig) => {
  return formPageTemplate(craig, {
    name: "Fortigate",
    addText: "Create a Fortigate Network Appliance",
    jsonField: "fortigate_vnf",
    formName: "fortigate",
  });
};

const IamAccountSettings = (craig) => {
  return (
    <CraigToggleForm
      name="IAM Account Settings"
      hide={false}
      about={RenderDocs(
        "iam_account_settings",
        craig.store.json._options.template
      )()}
      noDeleteButton={craig.store.json.iam_account_settings.enable === false}
      useAddButton={craig.store.json.iam_account_settings.enable === false}
      tabPanel={{
        name: "IAM Account Settings",
      }}
      submissionFieldName="iam_account_settings"
      hideName
      onSave={(stateData) => {
        stateData.enable = true;
        craig.iam_account_settings.save(stateData);
      }}
      onShowToggle={() => {}}
      onDelete={() => {
        craig.store.json.iam_account_settings.enable = false;
        craig.update();
      }}
      craig={craig}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.iam_account_settings,
        form: {
          groups: [
            {
              if_match: craig.iam_account_settings.if_match,
              mfa: craig.iam_account_settings.mfa,
            },
            {
              include_history: craig.iam_account_settings.include_history,
              restrict_create_service_id:
                craig.iam_account_settings.restrict_create_service_id,
              restrict_create_platform_apikey:
                craig.iam_account_settings.restrict_create_platform_apikey,
            },
            {
              max_sessions_per_identity:
                craig.iam_account_settings.max_sessions_per_identity,
              session_expiration_in_seconds:
                craig.iam_account_settings.session_expiration_in_seconds,
              session_invalidation_in_seconds:
                craig.iam_account_settings.session_invalidation_in_seconds,
            },
            {
              allowed_ip_addresses:
                craig.iam_account_settings.allowed_ip_addresses,
            },
          ],
        },
      }}
    />
  );
};

const KeyManagementPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Key Management",
    addText: "Create a Key Management Service",
    jsonField: "key_management",
    formName: "kms",
  });
};

class NetworkAcls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showToggleForm: false,
      sourceAcl: null,
      destinationVpc: null,
      addClusterRuleAcl: null,
      showAclModal: false,
    };
    this.onModalSubmit = this.onModalSubmit.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleModalToggle = this.handleModalToggle.bind(this);
  }

  handleModalToggle() {
    this.setState({ showAclModal: !this.state.showAclModal });
  }

  onModalSubmit(data) {
    this.props.craig.vpcs.acls.create(data, {
      vpc_name: this.props.data.name,
    });
    this.handleModalToggle();
  }

  handleSelect(event) {
    let { name, value } = event.target;
    this.setState({ [name]: value });
  }

  render() {
    let craig = this.props.craig;
    let vpcIndex = arraySplatIndex(
      this.props.craig.store.json.vpcs,
      "name",
      this.props.data.name
    );
    return (
      <>
        <DynamicFormModal
          name="Create an ACL"
          show={this.state.showAclModal}
          beginDisabled
          submissionFieldName="acls"
          onRequestSubmit={this.onModalSubmit}
          onRequestClose={this.handleModalToggle}
        >
          {RenderForm(DynamicAclForm, {
            craig: craig,
            vpcIndex: vpcIndex,
            aclIndex: -1,
            innerFormProps: {
              isModal: true,
              shouldDisableSubmit: function () {
                // see above
                this.props.setRefUpstream(this.state);
                if (disableSave("acls", this.state, this.props) === false) {
                  this.props.enableModal();
                } else {
                  this.props.disableModal();
                }
              },
            },
          })}
        </DynamicFormModal>

        <CraigFormHeading
          name="Network Access Control Lists"
          className="marginBottomSmall"
          type="subHeading"
          buttons={
            <PrimaryButton
              type="add"
              noDeleteButton
              onClick={this.handleModalToggle}
            />
          }
        />

        {this.props.data.acls.map((acl, aclIndex) => (
          <DynamicAclForm
            key={"dynamic-acl-form-" + aclIndex}
            nested
            beginHidden
            craig={craig}
            aclIndex={aclIndex}
            vpcIndex={vpcIndex}
            onDelete={craig.vpcs.acls.delete}
            onSave={craig.vpcs.acls.save}
            innerFormProps={{
              vpc_name: this.props.data.name,
              data: acl,
              craig: craig,
              disableSave: disableSave,
              form: {
                jsonField: "acls",
                groups: [
                  {
                    use_data: craig.vpcs.acls.use_data,
                  },
                  {
                    name: craig.vpcs.acls.name,
                    resource_group: craig.vpcs.acls.resource_group,
                  },
                ],
              },
            }}
          />
        ))}

        {this.props.child
          ? RenderForm(this.props.child, {
              data: this.props.data,
              craig: this.props.craig,
            })
          : ""}
      </>
    );
  }
}

const NetworkAclPage = (craig) => {
  let none = () => {};
  return (
    <FormTemplate
      name="Network Access Control Lists"
      innerForm={NetworkAcls}
      arrayData={craig.store.json.vpcs}
      docs={RenderDocs("acls", craig.store.json._options.template)}
      onSubmit={none}
      onDelete={none}
      onSave={none}
      disableSave={none}
      propsMatchState={none}
      forceOpen={forceShowForm}
      hideFormTitleButton
      innerFormProps={{
        craig: craig,
        child: CopyRuleForm,
        disableSave: disableSave,
        propsMatchState: propsMatchState,
      }}
      toggleFormProps={{
        craig: craig,
        noDeleteButton: true,
        noSaveButton: true,
        hideName: true,
        submissionFieldName: "network_acls",
        disableSave: none,
        propsMatchState: none,
        nullRef: true,
      }}
    />
  );
};

const LoadBalancerPage = (craig) => {
  return formPageTemplate(craig, {
    name: "VPC Load Balancers",
    addText: "Create a Load Balancer",
    jsonField: "load_balancers",
    formName: "load_balancers",
  });
};

const ObjectStoragePage = (craig) => {
  return formPageTemplate(craig, {
    name: "Object Storage",
    addText: "Create an Object Storage Service",
    jsonField: "object_storage",
    formName: "cos",
  });
};

const NoVpcTile = () => {
  return (
    <Tile className="tileBackground displayFlex alignItemsCenter wrap marginTop">
      <CloudAlerting size="24" className="iconMargin" /> No VPCs have been
      created. Go to the
      <a className="no-vpc-link" href="/form/vpcs">
        Virtual Private Clouds Page
      </a>
      to create one.
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
  return formPageTemplate(craig, {
    name: "Power VS Workspace",
    addText: "Create a Workspace",
    jsonField: "power",
    overrideTile:
      craig.store.json._options.enable_power_vs !== true ? (
        <NoPowerNetworkTile />
      ) : undefined,
    hideFormTitleButton: craig.store.json._options.power_vs_zones.length === 0,
    formName: "Power Vs Workspace",
  });
};

const PowerVsInstances = (craig) => {
  return formPageTemplate(craig, {
    name: "Power VS Instances",
    addText: "Create an Instance",
    jsonField: "power_instances",
    overrideTile: !craig.store.json._options.enable_power_vs ? (
      <NoPowerNetworkTile />
    ) : craig.store.json.power.length === 0 ? (
      <NoPowerWorkspaceTile />
    ) : undefined,
    hideFormTitleButton:
      !craig.store.json._options.enable_power_vs ||
      craig.store.json.power.length === 0,
    formName: "Power Instances",
    innerFormProps: {
      powerStoragePoolMap: powerStoragePoolRegionMap,
    },
  });
};

const PowerVsVolumes = (craig) => {
  return formPageTemplate(craig, {
    name: "Power VS Storage Volumes",
    addText: "Create a Volume",
    jsonField: "power_volumes",
    overrideTile: !craig.store.json._options.enable_power_vs ? (
      <NoPowerNetworkTile />
    ) : craig.store.json.power.length === 0 ? (
      <NoPowerNetworkTile />
    ) : undefined,
    formName: "Power Volumes",
    hideFormTitleButton:
      !craig.store.json._options.enable_power_vs ||
      craig.store.json.power.length === 0,
    innerFormProps: {
      powerStoragePoolMap: powerStoragePoolRegionMap,
    },
  });
};

const ResourceGroupPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Resource Groups",
    addText: "Create a Resource Group",
    formName: "Resource Groups",
    deleteDisabled: () => {
      return craig.store.json.resource_groups.length === 1;
    },
    deleteDisabledMessage: "Must have at least one resource group",
    jsonField: "resource_groups",
  });
};

const RoutingTablesPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Routing Tables",
    addText: "Create a Routing Table",
    formName: "routing-tables",
    jsonField: "routing_tables",
  });
};

const SccV2 = (craig) => {
  return (
    <CraigToggleForm
      craig={craig}
      about={RenderDocs("scc_v2", craig.store.json._options.template)()}
      name="Security and Compliance Center"
      hideName
      noDeleteButton={
        craig.store.json.scc_v2
          ? craig.store.json.scc_v2.enable === false
          : true
      }
      onDelete={craig.scc_v2.delete}
      useAddButton={
        craig.store.json.scc_v2
          ? craig.store.json.scc_v2.enable === false
          : true
      }
      tabPanel={{
        name: "Security and Compliance Center",
      }}
      onShowToggle={() => {}}
      submissionFieldName="scc_v2"
      onSave={craig.scc_v2.save}
      innerFormProps={{
        craig: craig,
        data: craig.store.json.scc_v2,
        disableSave: disableSave,
        form: {
          jsonField: "scc_v2",
          disableSave: disableSave,
          groups: [
            {
              name: craig.scc_v2.name,
              region: craig.scc_v2.region,
              resource_group: craig.scc_v2.resource_group,
            },
          ],
          subForms: [
            {
              name: "Profile Attachments",
              jsonField: "profile_attachments",
              addText: "Create a Profile Attachment",
              hideWhen: function (stateData, componentProps) {
                return componentProps.craig.store.json.scc_v2.enable === false;
              },
              form: {
                groups: [
                  {
                    name: craig.scc_v2.profile_attachments.name,
                    profile: craig.scc_v2.profile_attachments.profile,
                  },
                  {
                    schedule: craig.scc_v2.profile_attachments.schedule,
                  },
                ],
              },
            },
          ],
        },
      }}
    />
  );
};

const SecretsManagerPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Secrets Manager",
    addText: "Create a Secrets Manager Instance",
    formName: "secrets-manager",
    jsonField: "secrets_manager",
  });
};

const SecurityGroupPage = (craig) => {
  return (
    <>
      {formPageTemplate(craig, {
        name: "Security Groups",
        addText: "Create a Security Group",
        jsonField: "security_groups",
        formName: "Security Groups",
        hideFormTitleButton: craig.store.json.vpcs.length === 0,
      })}
      {craig.store.json.security_groups.length > 0 && (
        <div
          style={{
            marginTop: "-1.5rem",
          }}
        >
          <CopyRuleForm craig={craig} isAclForm={false} />
        </div>
      )}
    </>
  );
};

const SubnetsPage = (craig) => {
  class Subnets extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        shownForms: [],
        showModal: false,
        showSubnetModal: false,
      };
      this.onModalSubmit = this.onModalSubmit.bind(this);
      this.onShowToggle = this.onShowToggle.bind(this);
      this.onImportModalSubmit = this.onImportModalSubmit.bind(this);
    }

    onModalSubmit(data) {
      this.props.craig.vpcs.subnetTiers.create(data, {
        vpc_name: this.props.data.name,
      });
      this.setState({ showModal: false });
    }

    onImportModalSubmit(data) {
      this.props.craig.vpcs.subnets.create(data, {
        name: this.props.data.name,
      });
      this.setState({ showSubnetModal: false });
    }

    onShowToggle(index) {
      let forms = [...this.state.shownForms];
      if (!contains(this.state.shownForms, index)) {
        forms.push(index);
      } else {
        forms.splice(forms.indexOf(index), 1);
      }
      this.setState({ shownForms: forms });
    }

    render() {
      let tiers = this.props.data.subnetTiers
        ? this.props.data.subnetTiers
        : this.props.craig.store.subnetTiers;
      let craig = this.props.craig;
      return (
        <>
          {this.state.showSubnetModal ? (
            <DynamicFormModal
              name={`Import a Subnet in ${this.props.data.name} VPC`}
              show
              beginDisabled
              submissionFieldName="subnets"
              onRequestSubmit={this.onImportModalSubmit}
              onRequestClose={() => {
                this.setState({ showSubnetModal: false });
              }}
            >
              {RenderForm(DynamicForm, {
                craig: craig,
                vpc_name: this.props.data.name,
                shouldDisableSubmit: function () {
                  // see abovec
                  this.props.setRefUpstream(this.state);
                  if (disableSave("subnet", this.state, this.props) === false) {
                    this.props.enableModal();
                  } else {
                    this.props.disableModal();
                  }
                },
                data: {
                  use_data: true,
                  name: "",
                  has_prefix: false,
                },
                form: {
                  groups: [
                    {
                      name: craig.vpcs.subnets.name,
                    },
                  ],
                },
              })}
            </DynamicFormModal>
          ) : (
            ""
          )}
          {this.state.showModal ? (
            <DynamicFormModal
              name={`Create a Subnet Tier in ${this.props.data.name} VPC`}
              show
              beginDisabled
              submissionFieldName="subnetTiers"
              onRequestSubmit={this.onModalSubmit}
              onRequestClose={() => {
                this.setState({ showModal: false });
              }}
            >
              {RenderForm(DynamicSubnetTierForm, {
                craig: craig,
                vpcIndex: arraySplatIndex(
                  craig.store.json.vpcs,
                  "name",
                  this.props.data.name
                ),
                subnetTierIndex: -1,
                aclName: "",
                isModal: true,
                innerFormProps: {
                  isModal: true,
                  shouldDisableSubmit: function () {
                    // see above
                    this.props.setRefUpstream(this.state);
                    if (
                      disableSave("subnetTier", this.state, this.props) ===
                      false
                    ) {
                      this.props.enableModal();
                    } else {
                      this.props.disableModal();
                    }
                  },
                },
              })}
            </DynamicFormModal>
          ) : (
            ""
          )}
          {this.props.data.acls.length === 0 && !this.props.data.use_data ? (
            <CraigEmptyResourceTile
              name="Network ACLs"
              customClick={
                <p>
                  Add one from the <a href="/form/nacls">ACL Page</a>{" "}
                </p>
              }
            />
          ) : (
            <CraigFormHeading
              name="Subnet Tiers"
              type="subHeading"
              className={tiers.length === 0 ? "" : "marginBottomSmall"}
              buttons={
                <>
                  {this.props.data.acls.length === 0 ? (
                    ""
                  ) : (
                    <PrimaryButton
                      type="add"
                      noDeleteButton={this.props.data.use_data !== true}
                      onClick={() => {
                        this.setState({ showModal: true });
                      }}
                      hoverText="Create a Subnet Tier"
                    />
                  )}
                  {this.props.data.use_data && (
                    <PrimaryButton
                      type="custom"
                      customIcon={FetchUploadCloud}
                      noDeleteButton
                      hoverText="Import Existing Subnet"
                      onClick={() => {
                        this.setState({ showSubnetModal: true });
                      }}
                    />
                  )}
                </>
              }
            />
          )}
          {tiers.map((tier, tierIndex) => (
            <DynamicSubnetTierForm
              craig={craig}
              key={"tier-" + tierIndex}
              vpcIndex={arraySplatIndex(
                craig.store.json.vpcs,
                "name",
                this.props.data.name
              )}
              subnetTierIndex={tierIndex}
              onDelete={craig.vpcs.subnetTiers.delete}
              onSave={craig.vpcs.subnetTiers.save}
              formInSubForm
              onShowToggle={this.onShowToggle}
              hide={!contains(this.state.shownForms, tierIndex)}
              isLast={tierIndex + 1 === tiers.length}
            />
          ))}
          {this.props.data.use_data ? (
            <div className="marginTop1Rem">
              <StatelessFormWrapper
                onIconClick={() => {
                  this.onShowToggle(tiers.length);
                }}
                hide={!contains(this.state.shownForms, tiers.length)}
                className="formInSubForm"
                name="Imported Subnets"
              >
                <div
                  className="formInSubForm displayFlex"
                  style={{ marginTop: "-2rem" }}
                >
                  {this.props.data.subnets.filter((subnet) => {
                    if (subnet.use_data) return subnet;
                  }).length === 0 ? (
                    <CraigEmptyResourceTile
                      name="Imported Subnets"
                      customIcon={FetchUploadCloud}
                      className="widthOneHundredPercent"
                    />
                  ) : (
                    this.props.data.subnets
                      .filter((subnet) => {
                        if (subnet.use_data) return subnet;
                      })
                      .map((subnet) => {
                        return (
                          <Tile
                            key={subnet.name}
                            className="marginRightSubnetTile marginBottomNone subForm"
                            style={{
                              width: "50%",
                            }}
                          >
                            <DynamicForm
                              importedSubnet
                              vpc_name={this.props.data.name}
                              formName="subnet"
                              data={subnet}
                              craig={craig}
                              form={{
                                groups: [
                                  {
                                    name: craig.vpcs.subnets.name,
                                  },
                                ],
                              }}
                              name={this.props.data.name}
                            />
                          </Tile>
                        );
                      })
                  )}
                </div>
              </StatelessFormWrapper>
            </div>
          ) : (
            ""
          )}
        </>
      );
    }
  }

  let none = () => {};
  return (
    <FormTemplate
      name="VPC Subnets"
      arrayData={craig.store.json.vpcs}
      docs={RenderDocs("subnets", craig.store.json._options.template)}
      onSubmit={none}
      onDelete={none}
      onSave={none}
      disableSave={none}
      propsMatchState={none}
      forceOpen={forceShowForm}
      hideFormTitleButton
      innerForm={Subnets}
      innerFormProps={{
        craig: craig,
      }}
      toggleFormProps={{
        craig: craig,
        noDeleteButton: true,
        noSaveButton: true,
        hideName: true,
        submissionFieldName: "subnets",
        disableSave: none,
        propsMatchState: none,
        nullRef: true,
      }}
    />
  );
};

const SshKeysPage = (craig) => {
  return formPageTemplate(craig, {
    name: "SSH Keys",
    addText: "Create an SSH Key",
    deleteDisabled: disableSshKeyDelete,
    deleteDisabledMessage: "SSH Key currently in use",
    jsonField: "ssh_keys",
  });
};

const TransitGatewayPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Transit Gateways",
    addText: "Create a Transit Gateway",
    formName: "Transit Gateway",
    jsonField: "transit_gateways",
  });
};

const VpnGatewayPage = (craig) => {
  return formPageTemplate(craig, {
    name: "VPN Gateways",
    addText: "Create a VPN Gateway",
    jsonField: "vpn_gateways",
    formName: "vpn_gateways",
    overrideTile: craig.store.vpcList.length === 0 ? <NoVpcTile /> : null,
    hideFormTitleButton: craig.store.vpcList.length === 0,
    innerFormProps: {},
  });
};

const VpnServerPage = (craig) => {
  return formPageTemplate(craig, {
    name: "VPN Servers",
    addText: "Create a VPN Server",
    jsonField: "vpn_servers",
    formName: "vpn_servers",
  });
};

const VpcPage = (craig) => {
  return formPageTemplate(craig, {
    name: "Virtual Private Clouds",
    addText: "Create a VPC",
    jsonField: "vpcs",
    formName: "vpcs",
  });
};

const VpePage = (craig) => {
  return formPageTemplate(craig, {
    name: "Virtual Private Endpoints",
    addText: "Create a VPE",
    jsonField: "virtual_private_endpoints",
    formName: "Virtual Private Endpoints",
    overrideTile: craig.store.vpcList.length === 0 ? <NoVpcTile /> : undefined,
  });
};

const VsiPage = (craig) => {
  return formPageTemplate(craig, {
    name: "VSI",
    addText: "Create a VSI",
    jsonField: "vsi",
    formName: "vsi",
  });
};

const Vtl = (craig) => {
  return formPageTemplate(craig, {
    name: "FalconStor VTL Instances",
    addText: "Create an Instance",
    jsonField: "vtl",
    overrideTile: !craig.store.json._options.enable_power_vs ? (
      <NoPowerNetworkTile />
    ) : craig.store.json.power.length === 0 ? (
      <NoPowerWorkspaceTile />
    ) : undefined,
    hideFormTitleButton:
      !craig.store.json._options.enable_power_vs ||
      craig.store.json.power.length === 0,
    formName: "VTL",
    innerFormProps: {
      powerStoragePoolMap: powerStoragePoolRegionMap,
    },
  });
};

export const NewFormPage = (props) => {
  let { form, craig } = props;

  if (form === "accessGroups") {
    return AccessGroupsPage(craig);
  } else if (form === "appID") {
    return AppIdPage(craig);
  } else if (form === "activityTracker") {
    return Atracker(craig);
  } else if (form === "cbr") {
    return CbrForm(craig);
  } else if (form === "cis") {
    return Cis(craig);
  } else if (form === "cisGlbs") {
    return CisGlbs(craig);
  } else if (form === "classicSecurityGroups") {
    return ClassicSecurityGroups(craig);
  } else if (form === "classicGateways") {
    return ClassicGateways(craig);
  } else if (form === "classicSshKeys") {
    return ClassicSshKeyPage(craig);
  } else if (form === "classicVlans") {
    return ClassicVlanPage(craig);
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
  } else if (form === "fortigate") {
    return FortigateVnf(craig);
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
  } else if (form === "sccV2") {
    return SccV2(craig);
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
  } else if (form === "vtl") {
    return Vtl(craig);
  }
};
