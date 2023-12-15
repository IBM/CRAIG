const {
  isBoolean,
  isString,
  isArray,
  isFunction,
  isNullOrEmptyString,
  kebabCase,
} = require("lazy-z");

/**
 * field function should return boolean on evaluation. throws if field is not boolean
 * @param {*} props
 * @param {string} functionName name of function used to format error text
 * @param {string} fieldFunctionName name of function to check result ex. disabled
 * @returns {boolean}
 */
function fieldFunctionReturnsBooleanCheck(
  props,
  functionName,
  fieldFunctionName
) {
  let result = props.field[fieldFunctionName](
    props.parentState,
    props.parentProps,
    props.index
  );
  if (!isBoolean(result)) {
    throw new Error(
      `${functionName} expects props.field.${fieldFunctionName} to evaluate to boolean, got ${typeof result}`
    );
  }
  return result;
}

/**
 * disabled returns a boolean check. throws if disabled field function
 * does not evaluate to boolean
 * @param {*} props
 * @param {string} functionName name of function
 * @returns {boolean} true if should be disabled
 */
function disabledReturnsBooleanCheck(props, functionName) {
  return fieldFunctionReturnsBooleanCheck(props, functionName, "disabled");
}

/**
 * invalid returns a boolean check. throws if disabled field function
 * does not evaluate to boolean
 * @param {*} props
 * @param {string} functionName name of function
 * @returns {boolean} true if should be disabled
 */
function invalidReturnsBooleanCheck(props, functionName) {
  return fieldFunctionReturnsBooleanCheck(props, functionName, "invalid");
}

/**
 * field function should return boolean on evaluation. throws if field is not boolean
 * @param {*} props
 * @param {string} functionName name of function used to format error text
 * @param {string} fieldFunctionName name of function to check result ex. disabled
 * @returns {boolean}
 */
function fieldFunctionReturnsStringCheck(
  props,
  functionName,
  fieldFunctionName
) {
  let result = isFunction(props.field[fieldFunctionName])
    ? props.field[fieldFunctionName](props.parentState, props.parentProps)
    : props.field[fieldFunctionName];
  if (!isString(result)) {
    throw new Error(
      `${functionName} expects props.field.${fieldFunctionName} to evaluate to string, got ${typeof result}`
    );
  }
  return result;
}

/**
 * check to make sure groups evaluates to an array or is an array
 * @param {*} props
 * @param {*} functionName
 * @param {*} stateValue
 * @returns {Array<string>}
 */
function groupsEvaluatesToArrayCheck(props, functionName, stateValue) {
  if (
    // check that groups either is an array or is a function that returns an array
    (!isArray(props.field.groups) && !isFunction(props.field.groups)) ||
    (isFunction(props.field.groups) &&
      !isArray(props.field.groups(props.parentState, props.parentProps)))
  ) {
    throw new Error(
      `${functionName} expects props.field.groups to be an array of string or to be a function that evaluates to be an array of string. Got value ${typeof (isFunction(
        props.field.groups
      )
        ? props.field.groups(props.parentState, props.parentProps)
        : props.field.groups)}`
    );
  }
  // prevent multiselect from adding invalid param ""
  let groups = (
    functionName !== "dynamicMultiSelectProps" &&
    (isNullOrEmptyString(stateValue) || !stateValue)
      ? [""]
      : []
  ).concat(
    isArray(props.field.groups)
      ? props.field.groups
      : props.field.groups(props.parentState, props.parentProps)
  );
  return groups;
}

/**
 * create field input id
 * @param {*} props dynamic component props
 * @returns {string} field id
 */
function dynamicFieldId(props) {
  return kebabCase(`${props.propsName} ${props.name} ${props.keyIndex}`);
}

/**
 * add classname from component
 * @param {*} className
 * @param {*} field field object
 * @returns {string} className string
 */
function addClassName(className, field) {
  let composedClassName = className;
  if (field?.className) {
    composedClassName += " " + field.className;
  }

  composedClassName +=
    field?.size === "small"
      ? " fieldWidthSmaller"
      : field?.size === "wide"
      ? " textInputWide"
      : " fieldWidth";

  return composedClassName;
}

module.exports = {
  fieldFunctionReturnsBooleanCheck,
  disabledReturnsBooleanCheck,
  invalidReturnsBooleanCheck,
  fieldFunctionReturnsStringCheck,
  groupsEvaluatesToArrayCheck,
  dynamicFieldId,
  addClassName,
};
