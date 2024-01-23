import {
  IbmCloudKeyProtect,
  ObjectStorage,
  IbmCloudSecretsManager,
  IbmCloudEventStreams,
  CloudApp,
  IbmDb2,
  GroupResource,
  DnsServices,
  IbmCloudSysdigSecure,
  IbmCloudLogging,
  CloudMonitoring,
  IbmCloudSecurityComplianceCenterWorkloadProtection,
} from "@carbon/icons-react";
import { EmptyResourceTile, IcseSelect } from "icse-react-assets";
import {
  azsort,
  contains,
  deepEqual,
  isNullOrEmptyString,
  revision,
  snakeCase,
  titleCase,
} from "lazy-z";
import React from "react";
import "./cloud-services.css";
import { disableSave, propsMatchState } from "../../../lib";
import { ManageService } from "../diagrams/ManageService";
import {
  CraigFormHeading,
  PrimaryButton,
  RenderForm,
} from "../../forms/utils/ToggleFormComponents";
import {
  CraigFormGroup,
  CraigToggleForm,
  DynamicFormModal,
} from "../../forms/utils";
import DynamicForm from "../../forms/DynamicForm";
import StatefulTabs from "../../forms/utils/StatefulTabs";
import { craigForms } from "../CraigForms";
import { getServices } from "../../../lib/forms/overview";
import { docTabs } from "../diagrams/DocTabs";
import HoverClassNameWrapper from "../diagrams/HoverClassNameWrapper";
import { ScrollFormWrapper } from "../diagrams/ScollFormWrapper";

const serviceFormMap = {
  resource_groups: {
    icon: GroupResource,
  },
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
  dns: {
    icon: DnsServices,
  },
  logdna: {
    icon: IbmCloudLogging,
  },
  sysdig: {
    icon: IbmCloudSysdigSecure,
  },
  atracker: {
    icon: CloudMonitoring,
  },
  scc_v2: {
    icon: IbmCloudSecurityComplianceCenterWorkloadProtection,
  },
};

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
      rgModal: false,
    };

    this.onServiceIconClick = this.onServiceIconClick.bind(this);
    this.onServiceSave = this.onServiceSave.bind(this);
    this.onServiceDelete = this.onServiceDelete.bind(this);
    this.toggleModal = this.toggleModal.bind(this);
    this.onServiceSubmit = this.onServiceSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onRequestSubmit = this.onRequestSubmit.bind(this);
  }

  /**
   * create modal request submit function
   * @returns {Function} request submit function
   */
  onRequestSubmit() {
    // prevent from loading unfound field
    return isNullOrEmptyString(this.state.modalService, true)
      ? () => {}
      : (stateData, componentProps) => {
          this.onServiceSubmit(stateData, componentProps);
          this.setState({
            showModal: false,
            modalService: "",
            serviceName: "",
          });
        };
  }

  /**
   * handle input change for modal event
   * @param {*} event
   */
  handleInputChange(event) {
    let { name, value } = event.target;
    // convert display name to craig store name
    this.setState({
      [name]:
        value === "Cloud Databases"
          ? "icd"
          : value === "App ID"
          ? "appid"
          : value === "Activity Tracker"
          ? "atracker"
          : value === "Security & Compliance Center"
          ? "scc_v2"
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

  /**
   * handle service modal submit
   * @param {*} stateData
   * @param {*} componentProps
   */
  onServiceSubmit(stateData, componentProps) {
    if (
      // if the service is not part of an array
      contains(
        ["logdna", "sysdig", "atracker", "scc_v2"],
        this.state.modalService
      )
    ) {
      if (this.state.modalService === "scc_v2") {
        // set SCC enable to true since it is not part of
        stateData.enable = true;
      }
      this.props.craig[this.state.modalService].save(stateData, componentProps);
    }
    // otherwise create
    else
      this.props.craig[this.state.modalService].create(
        stateData,
        componentProps
      );

    // close modal
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
    } else if (this.state.service !== "atracker")
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
    if (contains(["sysdig", "logdna", "atracker"], this.state.service)) {
      // handle delete for non-array services
      let data = { ...this.props.craig[this.state.service] };
      data.enabled = false;
      this.props.craig[this.state.service].save(data);
      this.setState({
        serviceName: "",
        service: "",
      });
    } else
      this.props.craig[this.state.service].delete(stateData, componentProps);
    this.setState({
      serviceName: "",
      service: "",
    });
  }

  /**
   * handle modal toggle
   * @param {*} resourceGroup
   */
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
      "secrets_manager",
      "dns",
    ]);

    let modalGroups = [
      "Activity Tracker",
      "AppID",
      "Cloud Databases",
      "DNS",
      "Event Streams",
      "Object Storage",
      "Key Management",
      "Secrets Manager",
      "Resource Groups",
      "LogDNA",
      "Sysdig",
      "Security & Compliance Center",
    ];

    // filter out activity tracker when enabled
    if (craig.store.json.atracker.enabled) {
      modalGroups = modalGroups.filter((group) => {
        if (group !== "Activity Tracker") {
          return group;
        }
      });
    }

    // filter out sysdig when enabled
    if (craig.store.json.sysdig.enabled) {
      modalGroups = modalGroups.filter((group) => {
        if (group !== "Sysdig") {
          return group;
        }
      });
    }

    // filter out logdna when enabled
    if (craig.store.json.logdna.enabled) {
      modalGroups = modalGroups.filter((group) => {
        if (group !== "LogDNA") {
          return group;
        }
      });
    }

    // filter out scc when enabled
    if (craig.store.json.scc_v2.enable) {
      modalGroups = modalGroups.filter((group) => {
        if (group !== "Security & Compliance Center") {
          return group;
        }
      });
    }

    return (
      <>
        <DynamicFormModal
          key={this.state.modalService}
          name={
            this.state.modalService === "resource_groups"
              ? "Create a Resource Group"
              : `Create a Service in ${this.state.modalResourceGroup}`
          }
          show={this.state.showModal}
          beginDisabled
          submissionFieldName={this.state.modalService}
          onRequestClose={this.toggleModal}
          onRequestSubmit={this.onRequestSubmit()}
        >
          <IcseSelect
            formName="cloud-services"
            value={
              this.state.modalService === "appid"
                ? "AppID"
                : this.state.modalService === "icd"
                ? "Cloud Databases"
                : this.state.modalService === "dns"
                ? "DNS"
                : this.state.modalService === "logdna"
                ? "LogDNA"
                : this.state.modalService === "atracker"
                ? "Activity Tracker"
                : this.state.modalService === "scc_v2"
                ? "Security & Compliance Center"
                : titleCase(this.state.modalService)
            }
            labelText="Service"
            name="modalService"
            handleInputChange={this.handleInputChange}
            disableInvalid
            groups={modalGroups.sort(azsort)}
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
                  : this.state.modalService === "logdna"
                  ? "LogDNA"
                  : this.state.modalService === "atracker"
                  ? "Activity Tracker"
                  : this.state.modalService === "scc_v2"
                  ? "Security & Compliance Center"
                  : titleCase(this.state.modalService)
              )}${
                this.state.modalService === "resource_groups" ? "" : " Service"
              }`}
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
                enabled: contains(["logdna", "sysdig"], this.state.modalService)
                  ? true
                  : undefined,
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
          formName="Cloud Services"
          name="Cloud Services"
          nestedDocs={docTabs(
            [
              "AppID",
              "Cloud Databases",
              "DNS",
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
                key={serviceResourceGroups}
              >
                <div className="marginBottomSmall" />
                {craig.store.json.atracker.enabled ? (
                  <>
                    <CraigFormHeading
                      name="Activity Tracker"
                      type="subHeading"
                    />
                    <div className="subForm marginBottomSmall">
                      <CraigFormHeading
                        icon={<CloudMonitoring className="diagramTitleIcon" />}
                        type="subHeading"
                        name="Activity Tracker"
                        className="marginBottomSmall"
                      />
                      <CraigFormGroup className="overrideGap">
                        <ManageService
                          icon={CloudMonitoring}
                          key={JSON.stringify(craig.store.json.atracker)}
                          service={{
                            type: "atracker",
                            name: "atracker",
                          }}
                          onClick={this.onServiceIconClick}
                          isSelected={this.state.service === "atracker"}
                        />
                      </CraigFormGroup>
                    </div>
                  </>
                ) : (
                  ""
                )}
                <CraigFormHeading
                  name="Resource Groups"
                  type="subHeading"
                  className="marginBottomSmall"
                  buttons={
                    <PrimaryButton
                      type="add"
                      noDeleteButton
                      hoverText="Create a Resource Group"
                      onClick={() => {
                        this.setState({
                          showModal: true,
                          modalService: "resource_groups",
                        });
                      }}
                    />
                  }
                />
                {serviceResourceGroups.map((rg) => (
                  <HoverClassNameWrapper
                    className="subForm marginBottomSmall"
                    hoverClassName="diagramBoxSelected"
                    key={rg}
                  >
                    <CraigFormHeading
                      icon={<GroupResource className="diagramTitleIcon" />}
                      noMarginBottom={serviceMap[rg].length === 0}
                      type="subHeading"
                      className="marginBottomSmall"
                      onClick={() => {
                        this.onServiceIconClick({
                          resourceGroup: "",
                          service: {
                            type: "resource_groups",
                            name: rg,
                          },
                        });
                      }}
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
                      <CraigFormGroup className="overrideGap">
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
                            <HoverClassNameWrapper
                              hoverClassName="diagramBoxSelected"
                              key={JSON.stringify(service)}
                            >
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
                            </HoverClassNameWrapper>
                          ))}
                      </CraigFormGroup>
                    )}
                  </HoverClassNameWrapper>
                ))}
              </div>
              <div className="marginTop1Rem">
                {this.state.service ? (
                  <ScrollFormWrapper>
                    <CraigFormHeading
                      icon={RenderForm(
                        serviceFormMap[this.state.service].icon,
                        {
                          className: "diagramTitleIcon",
                        }
                      )}
                      name={
                        "Editing " +
                        (this.state.serviceName === "scc_v2"
                          ? "Security & Compliance Center"
                          : this.state.serviceName)
                      }
                    />
                    <div>
                      <CraigToggleForm
                        name={
                          this.state.serviceName === "scc_v2"
                            ? "Security & Compliance Center"
                            : this.state.serviceName
                        }
                        tabPanel={{ hideAbout: true }}
                        key={this.state.service + this.state.serviceName}
                        onSave={this.onServiceSave}
                        onDelete={this.onServiceDelete}
                        type="subForm"
                        hideChevron
                        hide={false}
                        hideName
                        submissionFieldName={this.state.service}
                        innerFormProps={{
                          // these are required to populate children
                          disableSave: disableSave,
                          propsMatchState: propsMatchState,
                          craig: craig,
                          data: contains(
                            ["logdna", "sysdig", "atracker", "scc_v2"],
                            this.state.service
                          )
                            ? craig.store.json[this.state.service]
                            : new revision(craig.store.json).child(
                                this.state.service,
                                this.state.serviceName
                              ).data,
                          form: forms[this.state.service],
                        }}
                      />
                    </div>
                  </ScrollFormWrapper>
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
