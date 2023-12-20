import {
  IbmCloudKeyProtect,
  ObjectStorage,
  IbmCloudSecretsManager,
  IbmCloudEventStreams,
  CloudApp,
  IbmDb2,
  IbmCloudLogging,
  IbmCloudSysdigSecure,
} from "@carbon/icons-react";
import {
  AppIdForm,
  CloudDatabaseForm,
  EmptyResourceTile,
  EventStreamsForm,
  FormModal,
  IcseFormGroup,
  IcseHeading,
  IcseSelect,
  KeyManagementForm,
  LogDNAForm,
  ObjectStorageForm,
  RenderForm,
  SecretsManagerForm,
  SysdigForm,
  ToggleForm,
} from "icse-react-assets";
import {
  azsort,
  contains,
  deepEqual,
  distinct,
  getObjectFromArray,
  isNullOrEmptyString,
  snakeCase,
  splat,
  titleCase,
  transpose,
} from "lazy-z";
import React from "react";
import "./cloud-services.css";
import PropTypes from "prop-types";
import {
  cosResourceHelperTextCallback,
  disableSave,
  invalidEncryptionKeyRing,
  invalidName,
  invalidNameText,
  propsMatchState,
} from "../../../lib";
import { ManageService } from "./ManageService";
import { cosPlans } from "../../../lib/constants";
import {
  encryptionKeyFilter,
  invalidCpuTextCallback,
} from "../../../lib/forms";
import { PrimaryButton } from "../../forms/utils/ToggleFormComponents";

const serviceFormMap = {
  key_management: {
    form: KeyManagementForm,
    icon: IbmCloudKeyProtect,
  },
  object_storage: {
    form: ObjectStorageForm,
    icon: ObjectStorage,
  },
  secrets_manager: {
    form: SecretsManagerForm,
    icon: IbmCloudSecretsManager,
  },
  event_streams: {
    icon: IbmCloudEventStreams,
    form: EventStreamsForm,
  },
  appid: {
    icon: CloudApp,
    form: AppIdForm,
  },
  icd: {
    form: CloudDatabaseForm,
    icon: IbmDb2,
  },
  logdna: {
    form: LogDNAForm,
    icon: IbmCloudLogging,
  },
  sysdig: {
    form: SysdigForm,
    icon: IbmCloudSysdigSecure,
  },
};

/**
 * get form props based
 * @param {*} craig
 * @param {*} service
 * @returns {object} inner form props
 */
function getFormProps(craig, service) {
  let formProps = {
    submissionFieldName: service,
    craig: craig,
    resourceGroups: splat(craig.store.json.resource_groups, "name"),
    disableSave: disableSave,
    propsMatchState: propsMatchState,
  };
  if (service === "logdna") {
    transpose(
      {
        cosBuckets: craig.store.cosBuckets,
        prefix: craig.store.json._options.prefix,
      },
      formProps
    );
  } else if (service === "sysdig") {
    transpose(
      {
        prefix: craig.store.json._options.prefix,
      },
      formProps
    );
  } else if (service === "key_management") {
    transpose(
      {
        invalidCallback: invalidName("key_management"),
        invalidTextCallback: invalidNameText("key_management"),
        invalidKeyCallback: invalidName("encryption_keys"),
        invalidKeyTextCallback: invalidNameText("encryption_keys"),
        invalidRingCallback: invalidEncryptionKeyRing,
        invalidRingText:
          "Invalid Key Ring Name. Must match the regular expression: /^[A-z]([a-z0-9-]*[a-z0-9])*$/s",
        encryptionKeyProps: {
          craig: craig,
          disableSave: disableSave,
          onSave: craig.key_management.keys.save,
          onDelete: craig.key_management.keys.delete,
          onSubmit: craig.key_management.keys.create,
        },
      },
      formProps
    );
  } else if (service === "object_storage") {
    transpose(
      {
        cosPlans: cosPlans,
        kmsList: splat(craig.store.json.key_management, "name"),
        invalidCallback: invalidName("object_storage"),
        invalidTextCallback: invalidNameText("object_storage"),
        invalidKeyCallback: invalidName("cos_keys"),
        invalidKeyTextCallback: invalidNameText("cos_keys"),
        invalidBucketCallback: invalidName("buckets"),
        invalidBucketTextCallback: invalidNameText("buckets"),
        composedNameCallback: cosResourceHelperTextCallback,
        keyProps: {
          craig: craig,
          onSave: craig.object_storage.keys.save,
          onSubmit: craig.object_storage.keys.create,
          onDelete: craig.object_storage.keys.delete,
          disableSave: disableSave,
        },
        bucketProps: {
          craig: craig,
          disableSave: disableSave,
          onSave: craig.object_storage.buckets.save,
          onSubmit: craig.object_storage.buckets.create,
          onDelete: craig.object_storage.buckets.delete,
          encryptionKeys: craig.store.encryptionKeys,
          encryptionKeyFilter: encryptionKeyFilter,
        },
      },
      formProps
    );
  } else if (service === "secrets_manager") {
    transpose(
      {
        encryptionKeys: craig.store.encryptionKeys,
        invalidCallback: invalidName("secrets_manager"),
        invalidTextCallback: invalidNameText("secrets_manager"),
        secrets: craig.getAllResourceKeys(),
      },
      formProps
    );
  } else if (service === "event_streams") {
    transpose(
      {
        invalidCallback: invalidName("event_streams"),
        invalidTextCallback: invalidNameText("event_streams"),
      },
      formProps
    );
  } else if (service === "appid") {
    transpose(
      {
        encryptionKeys: craig.store.encryptionKeys,
        invalidCallback: invalidName("appid"),
        invalidTextCallback: invalidNameText("appid"),
        invalidKeyCallback: invalidName("appid_key"),
        invalidKeyTextCallback: invalidNameText("appid_key"),
        keyProps: {
          craig: craig,
          onSave: craig.appid.keys.save,
          onSubmit: craig.appid.keys.create,
          onDelete: craig.appid.keys.delete,
          disableSave: disableSave,
        },
      },
      formProps
    );
  } else if (service === "icd") {
    transpose(
      {
        encryptionKeys: craig.store.encryptionKeys,
        invalidCallback: invalidName("icd"),
        invalidTextCallback: invalidNameText("icd"),
        invalidCpuTextCallback: invalidCpuTextCallback,
      },
      formProps
    );
  }
  return formProps;
}

/**
 * create service form modal inner form props
 * @param {*} craig
 * @param {string} form
 * @param {string} resourceGroup
 * @returns {Object} inner form modal object
 */
function serviceFormModalInnerFormProps(craig, form, resourceGroup) {
  let innerFormProps = {
    data: {
      resource_group: resourceGroup,
      name: "",
    },
    isModal: true,
    shouldDisableSubmit: function () {
      // references to `this` in function are intentionally vague
      // in order to pass the correct functions and field values to the
      // child modal component
      // by passing `this` in a function that it scoped to the component
      // we allow the function to be successfully bound to the modal form
      // while still referencing the local value `enableSubmitField`
      // to use it's own values for state and props including enableModal
      // and disableModal, which are dynamically added to the component
      // at time of render
      if (
        disableSave(this.props.submissionFieldName, this.state, this.props) ===
        false
      ) {
        this.props.enableModal();
      } else {
        this.props.disableModal();
      }
    },
  };
  transpose(getFormProps(craig, form), innerFormProps);
  if (form === "icd") {
    transpose(
      {
        use_data: false,
        plan: "standard",
        encryption_key: "",
        service: "",
        group_id: "member",
        memory: null,
        disk: null,
        cpu: null,
      },
      innerFormProps.data
    );
  } else if (contains(["logdna", "sysdig"], form)) {
    innerFormProps.data = { ...craig.store.json[form] };
    innerFormProps.data.enabled = true;
    innerFormProps.data.resource_group = resourceGroup;
  }
  return innerFormProps;
}

/**
 * get toggle form props
 * @param {*} craig
 * @param {string} service service name ex. key_management
 * @param {*} innerForm
 * @param {string} serviceName name of the service to find
 * @param {Function} onServiceSave pass through function for save
 */
function serviceToggleFormProps(
  craig,
  service,
  innerForm,
  serviceName,
  onServiceSave,
  onServiceDelete
) {
  let baseToggleFormProps = {
    name:
      (service === "logdna"
        ? "logdna"
        : service === "sysdig"
        ? "sysdig"
        : serviceName) +
      ` (${titleCase(service)
        .replace("Appid", "AppID")
        .replace("Icd", "Cloud Database")
        .replace("Logdna", "LogDNA")})`,
    hide: false,
    type: "form",
    propsMatchState: propsMatchState,
    tabPanel: {
      hideAbout: true,
    },
    onSave: onServiceSave,
    onDelete: onServiceDelete,
    innerForm: innerForm,
    innerFormProps: {
      data: contains(["logdna", "sysdig"], service)
        ? {
            ...craig.store.json[service],
          }
        : {
            ...getObjectFromArray(
              craig.store.json[service],
              "name",
              serviceName
            ),
          },
      propsMatchState: propsMatchState,
      craig: craig,
    },
    craig: craig,
    disableSave: disableSave,
    submissionFieldName: service,
    hideName: true,
    onShowToggle: () => {
      // dummy function
    },
  };
  transpose(getFormProps(craig, service), baseToggleFormProps.innerFormProps);
  return baseToggleFormProps;
}

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
        splat(craig.store.json[field], "resource_group")
      )
    );
  });
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
            overrideType:
              resourceType === "icd" ? "cloud_databases" : undefined,
          });
        }
      });
    });
  });

  ["sysdig", "logdna"].forEach((observabilityService) => {
    if (craig.store.json[observabilityService].enabled) {
      let rg = craig.store.json[observabilityService].resource_group;
      let serviceRg = !rg ? "No Resource Group" : rg;
      serviceMap[serviceRg].push({
        name: observabilityService,
        type: observabilityService,
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

class CloudServicesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRg: "",
      showModal: false,
      modalResourceGroup: "service-rg",
      modalService: "",
    };

    this.onServiceIconClick = this.onServiceIconClick.bind(this);
    this.onServiceSave = this.onServiceSave.bind(this);
    this.onServiceDelete = this.onServiceDelete.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onServiceSubmit = this.onServiceSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event) {
    let { name, value } = event.target;
    this.setState({
      [name]:
        value === "Cloud Databases"
          ? "icd"
          : value === "App ID"
          ? "appid"
          : snakeCase(value),
    });
  }

  /**
   * handle click for service icon
   * @param {*} serviceData
   */
  onServiceIconClick(serviceData) {
    let clickedServiceData = {
      activeRg: serviceData.resourceGroup,
      service: serviceData.service.type,
      serviceName: serviceData.service.name,
    };
    let currentServiceData = {
      activeRg: this.state.activeRg,
      service: this.state.service,
      serviceName: this.state.serviceName,
    };
    if (deepEqual(clickedServiceData, currentServiceData)) {
      // if clicked again do not show
      this.setState({
        activeRg: "",
        service: "",
        serviceName: "",
      });
    } else {
      this.setState({
        activeRg: serviceData.resourceGroup,
        service: serviceData.service.type,
        serviceName: serviceData.service.name,
      });
    }
  }

  onServiceSubmit(data) {
    if (contains(["logdna", "sysdig"], this.state.modalService)) {
      this.props.craig[this.state.modalService].save(data);
    } else this.props.craig[this.state.modalService].create(data);
    this.toggleModal();
  }

  /**
   * pass through service save function to prevent error when
   * rendering form with a new name
   * @param {*} stateData
   * @param {*} componentProps
   */
  onServiceSave(stateData, componentProps) {
    this.props.craig[this.state.service].save(stateData, componentProps);
    if (stateData.resource_group !== componentProps.data.resource_group) {
      // when moving resource groups, remove form
      this.setState({
        service: "",
        serviceName: "",
      });
    } else
      this.setState({
        serviceName: stateData.name,
      });
  }

  /**
   * pass through service save function to prevent error when
   * rendering form with a new name
   * @param {*} stateData
   * @param {*} componentProps
   */
  onServiceDelete(stateData, componentProps) {
    if (contains(["sysdig", "logdna"], this.state.service)) {
      let data = { ...this.props.craig[this.state.service] };
      data.enabled = false;
      this.props.craig[this.state.service].save(data);
    } else
      this.props.craig[this.state.service].delete(stateData, componentProps);
    this.setState({
      serviceName: "",
      service: "",
    });
  }

  toggleModal(resourceGroup) {
    if (this.state.showModal) {
      this.setState({
        showModal: false,
        modalResourceGroup: "",
      });
    } else {
      this.setState({
        showModal: true,
        modalResourceGroup: resourceGroup,
        modalService: "",
      });
    }
  }

  render() {
    let { serviceResourceGroups, serviceMap } = getServices(this.props.craig, [
      "appid",
      "icd",
      "event_streams",
      "key_management",
      "object_storage",
      "secrets_manager",
    ]);
    return (
      <>
        <IcseHeading name="Cloud Services" />
        <FormModal
          name={"Create a new service"}
          show={this.state.showModal}
          onRequestSubmit={this.onServiceSubmit}
          onRequestClose={this.toggleModal}
          submissionFieldName="key_management"
          beginDisabled
        >
          <IcseSelect
            formName="cloud-service-modal"
            name="modalService"
            labelText="Service Type"
            value={titleCase(this.state.modalService)
              .replace("Icd", "Cloud Databases")
              .replace("Logdna", "LogDNA")}
            groups={[
              "Key Management",
              "Object Storage",
              "Secrets Manager",
              "Event Streams",
              "App ID",
              "Cloud Databases",
            ]
              .concat(
                this.props.craig.store.json.logdna.enabled ? [] : ["LogDNA"]
              )
              .concat(
                this.props.craig.store.json.sysdig.enabled ? [] : ["Sysdig"]
              )
              .sort(azsort)}
            handleInputChange={this.handleInputChange}
            invalidText="Select a service type"
            className={
              isNullOrEmptyString(this.state.modalService)
                ? "fieldWidth"
                : "fieldWidth marginBottom"
            }
          />
          {isNullOrEmptyString(this.state.modalService) ? (
            <></> // empty div here must be passed to be valid child
          ) : (
            <IcseHeading
              type="subHeading"
              name={"New " + titleCase(this.state.modalService) + " Service"}
            />
          )}
          {isNullOrEmptyString(this.state.modalService) ? (
            <></> // empty div here must be passed to be a valid child
          ) : (
            RenderForm(serviceFormMap[this.state.modalService].form, {
              ...serviceFormModalInnerFormProps(
                this.props.craig,
                this.state.modalService,
                this.state.modalResourceGroup
              ),
            })
          )}
        </FormModal>
        {serviceResourceGroups.map((rg) => (
          <div className="subForm marginBottomSmall" key={rg}>
            <IcseHeading
              type="subHeading"
              name={rg}
              className={
                serviceMap[rg].length === 0
                  ? "marginBottomSmaller"
                  : "marginBottomSmall"
              }
              buttons={
                rg === "No Resource Group" ? (
                  // hide button when resource group is null
                  <></>
                ) : (
                  <PrimaryButton
                    type="add"
                    onClick={() => this.toggleModal(rg)}
                    className="none-right"
                    noDeleteButton
                  />
                )
              }
            />
            {serviceMap[rg].length === 0 ? (
              <EmptyResourceTile name="services in this resource group" />
            ) : (
              <IcseFormGroup className="overrideGap">
                {serviceMap[rg]
                  .sort((a, b) => {
                    // sort resources by name within the same resource type
                    if ((a.overrideType || a.type) < (b.overrideType || b.type))
                      return -1;
                    if ((a.overrideType || a.type) > (b.overrideType || b.type))
                      return 1;
                    if (a.name < b.name && a.type === b.type) return -1;
                    if (a.name > b.name && a.type === b.type) return 1;
                  })
                  .map((service) => (
                    <ManageService
                      key={JSON.stringify(service)}
                      resourceGroup={rg}
                      service={service}
                      icon={serviceFormMap[service.type].icon}
                      onClick={this.onServiceIconClick}
                      isSelected={
                        this.state.service === service.type &&
                        this.state.serviceName === service.name
                      }
                    />
                  ))}
              </IcseFormGroup>
            )}

            {this.state.activeRg === rg &&
              !isNullOrEmptyString(this.state.serviceName) && (
                <ToggleForm
                  key={this.state.serviceName}
                  hideChevon
                  {...serviceToggleFormProps(
                    this.props.craig,
                    this.state.service,
                    serviceFormMap[this.state.service].form,
                    this.state.serviceName,
                    this.onServiceSave,
                    this.onServiceDelete
                  )}
                />
              )}
          </div>
        ))}
      </>
    );
  }
}

export default CloudServicesPage;
