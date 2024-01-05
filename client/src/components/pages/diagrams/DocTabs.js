import React from "react";
import { RenderDocs } from "../SimplePages";
import { snakeCase } from "lazy-z";

/**
 * create doc tabs
 * @param {string} mainTabName
 * @param {Array<string>} tabs
 * @param {*} craig
 * @returns {Array} array of objects
 */
export const docTabs = (tabs, craig) => {
  let displayTabs = [];
  tabs.forEach((tab) => {
    let nextTab = {
      name: tab,
      about: RenderDocs(
        snakeCase(
          tab === "Power VS Instances (LPARs)"
            ? "power_instances"
            : tab === "Power VS"
            ? "power"
            : tab === "Cloud Databases"
            ? "icd"
            : tab === "Virtual Private Cloud"
            ? "vpcs"
            : tab === "Access Control Lists (ACLs)"
            ? "acls"
            : tab === "Subnets & Subnet Tiers"
            ? "subnets"
            : tab === "Virtual Servers"
            ? "vsi"
            : tab
        ),
        craig.store.json._options.template
      ),
    };
    displayTabs.push(nextTab);
  });
  return displayTabs;
};
