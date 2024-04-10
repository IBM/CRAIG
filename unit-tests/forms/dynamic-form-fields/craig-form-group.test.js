const { assert } = require("chai");
const {
  dynamicCraigFormGroupsProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields");
const { state } = require("../../../client/src/lib");
const craig = state();

describe("dynamicCraigFormGroupsProps", () => {
  it("should return correct props if no name, no subForms, and is last", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: ["hi"],
          },
        },
        0
      ),
      {
        key: "-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, no subForms, and is last", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: ["hi"],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, with subForms, and is last", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {
                hi: "mom",
              },
            ],
            subForms: ["hi"],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: false,
      },
      "it should return correct props"
    );
  });
  it("should return correct props if name, with subForms length 0, and is last", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: ["hi"],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return for next to last group when all are hidden", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {},
              {
                hidden: {
                  hideWhen: function () {
                    return true;
                  },
                },
              },
            ],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return for middle group when all are hidden", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {
                hidden: false,
              },
              {
                hidden: {
                  hideWhen: function () {
                    return true;
                  },
                },
              },
              {
                hidden: false,
              },
            ],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        1
      ),
      {
        key: "frog-group-1",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return for next to last group for subnets", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          formName: "subnet",
          form: {
            groups: [
              {
                not_hidden: true,
              },
              {
                hidden: {
                  hideWhen: function () {
                    return false;
                  },
                },
              },
            ],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: false,
        className: "marginBottomSmall",
      },
      "it should return correct props"
    );
  });
  it("should return for next to last group when all are not hidden", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {
                notHidden: {},
              },
              {
                hidden: {
                  hideWhen: function () {
                    return true;
                  },
                },
                notHidden: {},
              },
            ],
            subForms: [],
          },
          data: {
            name: "frog",
          },
        },
        0
      ),
      {
        key: "frog-group-0",
        noMarginBottom: false,
      },
      "it should return correct props"
    );
  });
  it("should return for dns when record not srv and row is 2", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {
                use_vsi: craig.dns.records.use_vsi,
                vpc: craig.dns.records.vpc,
                vsi: craig.dns.records.vsi,
              },
              {
                name: craig.dns.records.name,
                dns_zone: craig.dns.records.dns_zone,
                ttl: craig.dns.records.ttl,
              },
              {
                rdata: craig.dns.records.rdata,
                type: craig.dns.records.type,
                preference: craig.dns.records.preference,
                port: craig.dns.records.port,
              },
              {
                hideWhen: craig.dns.records.priority.hideWhen,
                protocol: craig.dns.records.protocol,
                priority: craig.dns.records.priority,
                weight: craig.dns.records.weight,
              },
              {
                hideWhen: craig.dns.records.service.hideWhen,
                service: craig.dns.records.service,
              },
            ],
          },
          data: {
            name: "frog",
          },
        },
        2,
        {
          name: "frog",
          dns_zone: "internal.com",
          type: "A",
          rdata: "a",
          ttl: 300,
          port: "10",
          protocol: "TCP",
          priority: "01",
          service: "_aaa",
          weight: "01",
          preference: null,
          use_vsi: false,
          vpc: "management",
          vsi: "management-server-1-2",
        }
      ),
      {
        key: "frog-group-2",
        noMarginBottom: true,
      },
      "it should return correct props"
    );
  });
  it("should return for dns when record not srv and row is 1", () => {
    assert.deepEqual(
      dynamicCraigFormGroupsProps(
        {
          form: {
            groups: [
              {
                use_vsi: craig.dns.records.use_vsi,
                vpc: craig.dns.records.vpc,
                vsi: craig.dns.records.vsi,
              },
              {
                name: craig.dns.records.name,
                dns_zone: craig.dns.records.dns_zone,
                ttl: craig.dns.records.ttl,
              },
              {
                rdata: craig.dns.records.rdata,
                type: craig.dns.records.type,
                preference: craig.dns.records.preference,
                port: craig.dns.records.port,
              },
              {
                hideWhen: craig.dns.records.priority.hideWhen,
                protocol: craig.dns.records.protocol,
                priority: craig.dns.records.priority,
                weight: craig.dns.records.weight,
              },
              {
                hideWhen: craig.dns.records.service.hideWhen,
                service: craig.dns.records.service,
              },
            ],
          },
          data: {
            name: "frog",
          },
        },
        1,
        {
          name: "frog",
          dns_zone: "internal.com",
          type: "A",
          rdata: "a",
          ttl: 300,
          port: "10",
          protocol: "TCP",
          priority: "01",
          service: "_aaa",
          weight: "01",
          preference: null,
          use_vsi: false,
          vpc: "management",
          vsi: "management-server-1-2",
        }
      ),
      {
        key: "frog-group-1",
        noMarginBottom: false,
      },
      "it should return correct props"
    );
  });
  it("should return for cos when no activity_tracking", () => {
    let actualData = dynamicCraigFormGroupsProps(
      {
        form: {
          groups: [
            {
              name: craig.object_storage.buckets.name,
              storage_class: craig.object_storage.buckets.storage_class,
              kms_key: craig.object_storage.buckets.kms_key,
            },
            {
              force_delete: craig.object_storage.buckets.force_delete,
            },
            {
              activity_tracking: craig.object_storage.buckets.activity_tracking,
              metrics_monitoring:
                craig.object_storage.buckets.metrics_monitoring,
            },
            {
              heading: {
                type: "subHeading",
                name: "Activity Tracking",
                className: "marginBottomSmall",
              },
              hideWhen: craig.object_storage.buckets.read_data_events.hideWhen,
            },
            {
              read_data_events: craig.object_storage.buckets.read_data_events,
              write_data_events: craig.object_storage.buckets.write_data_events,
              activity_tracking_crn:
                craig.object_storage.buckets.activity_tracking_crn,
              className: "subForm",
            },
            {
              heading: {
                type: "subHeading",
                name: "Metrics Monitoring",
                className: "marginBottomSmall",
              },
              hideWhen:
                craig.object_storage.buckets.request_metrics_enabled.hideWhen,
            },
            {
              request_metrics_enabled:
                craig.object_storage.buckets.request_metrics_enabled,
              usage_metrics_enabled:
                craig.object_storage.buckets.usage_metrics_enabled,
              metrics_monitoring_crn:
                craig.object_storage.buckets.metrics_monitoring_crn,
              className: "subForm",
            },
          ],
        },
        data: {
          name: "frog",
        },
      },
      4,
      {}
    );
    assert.deepEqual(
      actualData,
      { key: "frog-group-4", noMarginBottom: true },
      "it should have correct data"
    );
  });
  it("should return for cos when activity_tracking", () => {
    let actualData = dynamicCraigFormGroupsProps(
      {
        form: {
          groups: [
            {
              name: craig.object_storage.buckets.name,
              storage_class: craig.object_storage.buckets.storage_class,
              kms_key: craig.object_storage.buckets.kms_key,
            },
            {
              force_delete: craig.object_storage.buckets.force_delete,
            },
            {
              activity_tracking: craig.object_storage.buckets.activity_tracking,
              metrics_monitoring:
                craig.object_storage.buckets.metrics_monitoring,
            },
            {
              heading: {
                type: "subHeading",
                name: "Activity Tracking",
                className: "marginBottomSmall",
              },
              hideWhen: craig.object_storage.buckets.read_data_events.hideWhen,
            },
            {
              read_data_events: craig.object_storage.buckets.read_data_events,
              write_data_events: craig.object_storage.buckets.write_data_events,
              activity_tracking_crn:
                craig.object_storage.buckets.activity_tracking_crn,
              className: "subForm",
            },
            {
              heading: {
                type: "subHeading",
                name: "Metrics Monitoring",
                className: "marginBottomSmall",
              },
              hideWhen:
                craig.object_storage.buckets.request_metrics_enabled.hideWhen,
            },
            {
              request_metrics_enabled:
                craig.object_storage.buckets.request_metrics_enabled,
              usage_metrics_enabled:
                craig.object_storage.buckets.usage_metrics_enabled,
              metrics_monitoring_crn:
                craig.object_storage.buckets.metrics_monitoring_crn,
              className: "subForm",
            },
          ],
        },
        data: {
          name: "frog",
        },
        craig: craig,
      },
      4,
      {
        activity_tracking: true,
      }
    );
    assert.deepEqual(
      actualData,
      {
        key: "frog-group-4",
        noMarginBottom: true,
        className: "subForm marginBottomNone",
      },
      "it should have correct data"
    );
  });
  it("should return for cos when activity_tracking and metrics monitoring for metrics", () => {
    let actualData = dynamicCraigFormGroupsProps(
      {
        form: {
          groups: [
            {
              name: craig.object_storage.buckets.name,
              storage_class: craig.object_storage.buckets.storage_class,
              kms_key: craig.object_storage.buckets.kms_key,
            },
            {
              force_delete: craig.object_storage.buckets.force_delete,
            },
            {
              activity_tracking: craig.object_storage.buckets.activity_tracking,
              metrics_monitoring:
                craig.object_storage.buckets.metrics_monitoring,
            },
            {
              heading: {
                type: "subHeading",
                name: "Activity Tracking",
                className: "marginBottomSmall",
              },
              hideWhen: craig.object_storage.buckets.read_data_events.hideWhen,
            },
            {
              read_data_events: craig.object_storage.buckets.read_data_events,
              write_data_events: craig.object_storage.buckets.write_data_events,
              activity_tracking_crn:
                craig.object_storage.buckets.activity_tracking_crn,
              className: "subForm",
            },
            {
              heading: {
                type: "subHeading",
                name: "Metrics Monitoring",
                className: "marginBottomSmall",
              },
              hideWhen:
                craig.object_storage.buckets.request_metrics_enabled.hideWhen,
            },
            {
              request_metrics_enabled:
                craig.object_storage.buckets.request_metrics_enabled,
              usage_metrics_enabled:
                craig.object_storage.buckets.usage_metrics_enabled,
              metrics_monitoring_crn:
                craig.object_storage.buckets.metrics_monitoring_crn,
              className: "subForm",
            },
          ],
        },
        data: {
          name: "frog",
        },
        craig: craig,
      },
      6,
      {
        activity_tracking: true,
        metrics_monitoring: true,
      }
    );
    assert.deepEqual(
      actualData,
      {
        key: "frog-group-6",
        noMarginBottom: true,
        className: "subForm marginBottomNone",
      },
      "it should have correct data"
    );
  });
  it("should return for cos when activity_tracking and metrics monitoring for activity tracking", () => {
    let actualData = dynamicCraigFormGroupsProps(
      {
        form: {
          groups: [
            {
              name: craig.object_storage.buckets.name,
              storage_class: craig.object_storage.buckets.storage_class,
              kms_key: craig.object_storage.buckets.kms_key,
            },
            {
              force_delete: craig.object_storage.buckets.force_delete,
            },
            {
              activity_tracking: craig.object_storage.buckets.activity_tracking,
              metrics_monitoring:
                craig.object_storage.buckets.metrics_monitoring,
            },
            {
              heading: {
                type: "subHeading",
                name: "Activity Tracking",
                className: "marginBottomSmall",
              },
              hideWhen: craig.object_storage.buckets.read_data_events.hideWhen,
            },
            {
              read_data_events: craig.object_storage.buckets.read_data_events,
              write_data_events: craig.object_storage.buckets.write_data_events,
              activity_tracking_crn:
                craig.object_storage.buckets.activity_tracking_crn,
              className: "subForm",
            },
            {
              heading: {
                type: "subHeading",
                name: "Metrics Monitoring",
                className: "marginBottomSmall",
              },
              hideWhen:
                craig.object_storage.buckets.request_metrics_enabled.hideWhen,
            },
            {
              request_metrics_enabled:
                craig.object_storage.buckets.request_metrics_enabled,
              usage_metrics_enabled:
                craig.object_storage.buckets.usage_metrics_enabled,
              metrics_monitoring_crn:
                craig.object_storage.buckets.metrics_monitoring_crn,
              className: "subForm",
            },
          ],
        },
        data: {
          name: "frog",
        },
        craig: craig,
      },
      4,
      {
        activity_tracking: true,
        metrics_monitoring: true,
      }
    );
    assert.deepEqual(
      actualData,
      {
        key: "frog-group-4",
        noMarginBottom: false,
        className: "subForm",
      },
      "it should have correct data"
    );
  });
});
