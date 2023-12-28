import {
  IbmCloudKeyProtect,
  ObjectStorage,
  IbmCloudSecretsManager,
  IbmCloudEventStreams,
  CloudApp,
  IbmDb2,
  GroupResource,
} from "@carbon/icons-react";
import {
  EmptyResourceTile,
  IcseFormGroup,
  IcseSelect,
} from "icse-react-assets";
import {
  azsort,
  contains,
  deepEqual,
  distinct,
  isNullOrEmptyString,
  revision,
  snakeCase,
  splat,
  titleCase,
} from "lazy-z";
import React from "react";
import "./cloud-services.css";
import { disableSave, propsMatchState } from "../../../lib";
import { ManageService } from "./ManageService";
import {
  CraigFormHeading,
  PrimaryButton,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import { CraigToggleForm, DynamicFormModal } from "../../forms/utils";
import DynamicForm from "../../forms/DynamicForm";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import { craigForms } from "../CraigForms";
import { docTabs } from "../vpc/DisplayComponents";

const serviceFormMap = {
  key_management: {
    icon: IbmCloudKeyProtect,
  },
  object_storage: {
    icon: ObjectStorage,
  },
  secrets_manager: {
    icon: IbmCloudSecretsManager,
  },
  event_streams: {
    icon: IbmCloudEventStreams,
  },
  appid: {
    icon: CloudApp,
  },
  icd: {
    icon: IbmDb2,
  },
};

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

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

class CloudServicesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeRg: "",
      showModal: false,
      modalResourceGroup: "",
      modalService: "",
      service: "",
      serviceName: "",
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
      scrollToTop();
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
        service: "",
        serviceName: "",
      });
    }
  }

  render() {
    let craig = this.props.craig;
    const forms = craigForms(craig);
    let { serviceResourceGroups, serviceMap } = getServices(this.props.craig, [
      "appid",
      "icd",
      "event_streams",
      "key_management",
      "object_storage",
      // "secrets_manager", not supported until after refactor
    ]);

    return (
      <>
        <DynamicFormModal
          name={`Create a Service in ${this.state.modalResourceGroup}`}
          show={this.state.showModal}
          beginDisabled
          submissionFieldName={this.state.modalService}
          onRequestClose={this.toggleModal}
          onRequestSubmit={
            // prevent from loading unfound field
            isNullOrEmptyString(this.state.modalService, true)
              ? () => {}
              : (stateData, componentProps) => {
                  craig[this.state.modalService].create(
                    stateData,
                    componentProps
                  );
                  this.setState({
                    showModal: false,
                    modalService: "",
                    serviceName: "",
                  });
                }
          }
        >
          <IcseSelect
            formName="cloud-services"
            value={
              this.state.modalService === "appid"
                ? "AppID"
                : this.state.modalService === "icd"
                ? "Cloud Databases"
                : titleCase(this.state.modalService)
            }
            labelText="Service"
            name="modalService"
            handleInputChange={this.handleInputChange}
            disableInvalid
            groups={[
              "AppID",
              "Cloud Databases",
              "Event Streams",
              "Object Storage",
              "Key Management",
            ]}
          />
          <div className="marginBottomSmall" />
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <></>
          ) : (
            <CraigFormHeading
              name={`New ${titleCase(
                this.state.modalService === "icd"
                  ? "Cloud Databases"
                  : this.state.modalService === "appid"
                  ? "AppID"
                  : titleCase(this.state.modalService)
              )} Service`}
            />
          )}
          {isNullOrEmptyString(this.state.modalService, true) ? (
            // need to pass html element
            <></>
          ) : (
            <DynamicForm
              className="formInSubForm"
              isModal
              form={forms[this.state.modalService]}
              craig={craig}
              modalService={this.state.modalService}
              data={{
                resource_group: this.state.modalResourceGroup,
              }}
              shouldDisableSubmit={function () {
                if (isNullOrEmptyString(this.props.modalService, true)) {
                  this.props.disableModal();
                } else if (
                  disableSave(
                    this.props.modalService,
                    this.state,
                    this.props
                  ) === false
                ) {
                  this.props.enableModal();
                } else {
                  this.props.disableModal();
                }
              }}
            />
          )}
        </DynamicFormModal>
        <div className="marginBottomSmall" />
        <StatefulTabs
          name="Cloud Services"
          overrideTabs={docTabs(
            "Manage Services",
            [
              "AppID",
              "Cloud Databases",
              "Event Streams",
              "Key Management",
              "Object Storage",
            ],
            craig
          )}
          form={
            <div className="displayFlex" style={{ minWidth: "100%" }}>
              <div
                style={{
                  marginRight: "1rem",
                  width: "580px",
                }}
              >
                {serviceResourceGroups.map((rg) => (
                  <div className="subForm marginBottomSmall" key={rg}>
                    <CraigFormHeading
                      icon={<GroupResource className="diagramTitleIcon" />}
                      noMarginBottom={serviceMap[rg].length === 0}
                      type="subHeading"
                      name={rg}
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
                            if (
                              (a.overrideType || a.type) <
                              (b.overrideType || b.type)
                            )
                              return -1;
                            if (
                              (a.overrideType || a.type) >
                              (b.overrideType || b.type)
                            )
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
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "1rem" }}>
                {this.state.service ? (
                  <>
                    <CraigFormHeading
                      icon={RenderForm(
                        serviceFormMap[this.state.service].icon,
                        {
                          className: "diagramTitleIcon",
                        }
                      )}
                      name={"Editing " + this.state.serviceName}
                    />
                    <div
                      style={{
                        padding: "0",
                        width: "50vw",
                        maxWidth: "690px",
                      }}
                      className="subForm"
                    >
                      <CraigToggleForm
                        name={this.state.serviceName}
                        tabPanel={{ hideAbout: true }}
                        key={this.state.service + this.state.serviceName}
                        onSave={this.onServiceSave}
                        onDelete={this.onServiceDelete}
                        type="subForm"
                        hideChevron
                        hideHeading
                        hide={false}
                        hideName
                        submissionFieldName={this.state.service}
                        innerFormProps={{
                          // these are required to populate children
                          disableSave: disableSave,
                          propsMatchState: propsMatchState,
                          craig: craig,
                          data: new revision(craig.store.json).child(
                            this.state.service,
                            this.state.serviceName
                          ).data,
                          form: forms[this.state.service],
                        }}
                      />
                    </div>
                  </>
                ) : (
                  ""
                )}
              </div>
            </div>
          }
        />
      </>
    );
  }
}

export default CloudServicesPage;
