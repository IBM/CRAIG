const { assert } = require("chai");
const {
  dynamicIcseFormGroupsProps,
} = require("../../../client/src/lib/forms/dynamic-form-fields");
const { state } = require("../../../client/src/lib");
const craig = state();

describe("dynamicIcseFormGroupsProps", () => {
  it("should return correct props if no name, no subForms, and is last", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
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
      dynamicIcseFormGroupsProps(
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
      dynamicIcseFormGroupsProps(
        {
          form: {
            groups: ["hi"],
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
      dynamicIcseFormGroupsProps(
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
      dynamicIcseFormGroupsProps(
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
  it("should return for next to last group when all are not hidden", () => {
    assert.deepEqual(
      dynamicIcseFormGroupsProps(
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
      dynamicIcseFormGroupsProps(
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
      dynamicIcseFormGroupsProps(
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
});
