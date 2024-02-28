const { contains, allFieldsNull, validPortRange } = require("lazy-z");
const {
  fieldIsNullOrEmptyString,
  selectInvalidText,
  unconditionalInvalidText,
} = require("./utils");

/**
 * invalid icmp code or type callback
 * @param {*} stateData
 * @returns {boolean} true if invalid
 */
function invalidIcmpCodeOrType(stateData) {
  return contains(["all", "tcp", "udp"], stateData.ruleProtocol)
    ? false
    : invalidPort(stateData);
}

/**
 * hide when rule has protocol is not tcp or udp
 * @param {*} stateData
 * @returns {boolean} true if should be hidden
 */
function hideWhenNotAllIcmp(stateData) {
  return stateData.ruleProtocol === "all"
    ? true
    : stateData.ruleProtocol === "icmp";
}

/**
 * hide when rule has protocol is tcp or udp
 * @param {*} stateData
 * @returns {boolean} true if should be hidden
 */
function hideWhenTcpOrUdp(stateData) {
  return stateData.ruleProtocol === "all"
    ? true
    : contains(["tcp", "udp"], stateData.ruleProtocol);
}

/**
 * test if a rule has an invalid port
 * @param {*} rule
 * @param {boolean=} isSecurityGroup
 * @returns {boolean} true if port is invalid
 */
function invalidPort(rule, isSecurityGroup) {
  let hasInvalidPort = false;
  if (rule.ruleProtocol !== "all") {
    (rule.ruleProtocol === "icmp"
      ? ["type", "code"]
      : isSecurityGroup
      ? ["port_min", "port_max"]
      : ["port_min", "port_max", "source_port_min", "source_port_max"]
    ).forEach((type) => {
      // check for rule[type] for craig form rule[rule]
      let value = rule.rule ? rule.rule[type] : rule[type];
      if (value && !hasInvalidPort) {
        hasInvalidPort =
          value.match && value.match(/\D/g) !== null
            ? true
            : !validPortRange(type, value);
      }
    });
  }
  return hasInvalidPort;
}

/**
 * invalid tcp or udp callback function
 * @param {*} stateData
 * @returns {boolean} true if invalid
 */
function invalidTcpOrUdpPort(stateData) {
  return contains(["all", "icmp"], stateData.ruleProtocol)
    ? false
    : invalidPort(stateData);
}

/**
 * get which rule protocol is being used
 * @param {string} rule
 * @returns {string} protocol
 */
function getRuleProtocol(rule) {
  let protocol = "all";
  // for each possible protocol
  ["icmp", "tcp", "udp"].forEach((field) => {
    // set protocol to that field if not all fields are null
    if (rule[field] && allFieldsNull(rule[field]) === false) {
      protocol = field;
    }
  });
  return protocol;
}

/**
 * handle input change for rule field
 * @param {*} stateData
 */
function onRuleFieldInputChange(field) {
  return function (stateData) {
    if (!stateData.rule) {
      stateData.rule = {
        port_max: null,
        port_min: null,
        source_port_max: null,
        source_port_min: null,
        type: null,
        code: null,
      };
    }
    stateData.rule[field] = stateData[field];
    return stateData[field];
  };
}

/**
 * networking rule protocol field
 * @returns {Object} form field object
 */
function networkingRuleProtocolField(isAcl) {
  return {
    size: "small",
    type: "select",
    default: "",
    groups: ["All", "TCP", "UDP", "ICMP"],
    invalid: fieldIsNullOrEmptyString("ruleProtocol"),
    invalidText: selectInvalidText("protocol"),
    onInputChange: function (stateData) {
      stateData.rule = {
        port_max: null,
        port_min: null,
        source_port_max: null,
        source_port_min: null,
        type: null,
        code: null,
      };
      stateData.tcp = {
        port_min: null,
        port_max: null,
      };
      stateData.udp = {
        port_min: null,
        port_max: null,
      };
      stateData.icmp = {
        type: null,
        code: null,
      };
      if (isAcl) {
        stateData.tcp.source_port_max = null;
        stateData.tcp.source_port_min = null;
        stateData.udp.source_port_max = null;
        stateData.udp.source_port_min = null;
      }
      return stateData.ruleProtocol.toLowerCase();
    },
    onRender: function (stateData) {
      return contains(["icmp", "udp", "tcp", "all"], stateData.ruleProtocol)
        ? stateData.ruleProtocol.toUpperCase()
        : "";
    },
  };
}

/**
 * build networking form port field
 * @param {boolean} max true if port max
 * @param {boolean} source true if source port
 * @returns {Object} form field object
 */
function networkingRulePortField(max, source) {
  return {
    default: "",
    invalid: invalidTcpOrUdpPort,
    size: "small",
    invalidText: unconditionalInvalidText(
      "Enter a whole number between 1 and 65536"
    ),
    hideWhen: hideWhenNotAllIcmp,
    onInputChange: onRuleFieldInputChange(
      max && source
        ? "source_port_max"
        : source
        ? "source_port_min"
        : max
        ? "port_max"
        : "port_min"
    ),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      let ruleType = getRuleProtocol(stateData);
      let ruleField =
        max && source
          ? "source_port_max"
          : source
          ? "source_port_min"
          : max
          ? "port_max"
          : "port_min";
      if (
        stateData[ruleType] &&
        stateData[ruleType][ruleField] &&
        !stateData[ruleField]
      ) {
        return stateData[ruleType][ruleField];
      } else return stateData[ruleField];
    },
  };
}

/**
 * build networking form type field
 * @returns {Object} form field object
 */
function networkingRuleTypeField() {
  return {
    size: "small",
    default: "",
    invalid: invalidIcmpCodeOrType,
    invalidText: unconditionalInvalidText(
      "Enter a while number between 0 and 254"
    ),
    hideWhen: hideWhenTcpOrUdp,
    onInputChange: onRuleFieldInputChange("type"),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      if (stateData.icmp && stateData.icmp.type && !stateData.type) {
        return stateData.icmp.type === "null" ? "" : stateData.icmp.type;
      } else return stateData.type;
    },
  };
}

/**
 * build networking form code field
 * @returns {Object} form field object
 */
function networkingRuleCodeField() {
  return {
    size: "small",
    default: "",
    invalid: invalidIcmpCodeOrType,
    invalidText: unconditionalInvalidText(
      "Enter a while number between 0 and 255"
    ),
    hideWhen: hideWhenTcpOrUdp,
    onInputChange: onRuleFieldInputChange("code"),
    helperText: unconditionalInvalidText(""),
    onRender: function (stateData) {
      if (stateData.icmp && stateData.icmp.code && !stateData.code) {
        return stateData.icmp.code === "null" ? "" : stateData.icmp.code;
      } else return stateData.code;
    },
  };
}

module.exports = {
  networkingRuleProtocolField,
  networkingRulePortField,
  networkingRuleTypeField,
  networkingRuleCodeField,
  getRuleProtocol,
  hideWhenTcpOrUdp,
  hideWhenNotAllIcmp,
  onRuleFieldInputChange,
  invalidPort,
};
