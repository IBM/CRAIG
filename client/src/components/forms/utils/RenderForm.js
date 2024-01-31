import React from "react";

/**
 * Render a form
 * @param {*} form form element
 * @param {*} formProps props
 * @returns Form element
 */
export function RenderForm(form, formProps) {
  return React.createElement(form, {
    ...formProps,
  });
}
