const { RegexButWithWords } = require("regex-but-with-words");

module.exports = {
  lastCommaExp: new RegexButWithWords()
    .literal(",")
    .look.ahead(exp => exp.stringEnd())
    .done("i"),
  reservedSubnetNameExp: new RegexButWithWords()
    .stringBegin()
    .group(exp => {
      exp
        .literal("f5-external")
        .or()
        .literal("f5-workload")
        .or()
        .literal("f5-management")
        .or()
        .literal("f5-bastion")
        .or()
        .literal("vpn-1")
        .or()
        .literal("vpn-2")
        .or()
        .any()
        .anyNumber()
        .literal("zone")
        .any()
        .anyNumber();
    })
    .stringEnd()
    .done("g"),
  newResourceNameExp: new RegexButWithWords()
    .stringBegin()
    .set("A-z")
    .group(exp => {
      exp
        .set("a-z0-9-")
        .anyNumber()
        .set("a-z0-9");
    })
    .anyNumber()
    .stringEnd()
    .done("s"),
  sshKeyValidationExp: new RegexButWithWords()
    .stringBegin()
    .literal("ssh-rsa AAAA")
    .set("0-9A-Za-z+/")
    .oneOrMore()
    .group(exp => {
      exp.set("=", 0, 3).group(exp => {
        exp
          .negatedSet("@")
          .oneOrMore()
          .literal("@")
          .negatedSet("@")
          .oneOrMore();
      });
    })
    .lazy()
    .stringEnd()
    .done("g"),
  maskFieldsExpStep1ReplacePublicKey: new RegexButWithWords()
    .literal("public_key")
    .done("g"),
  maskFieldsExpStep2ReplaceTmosAdminPassword: new RegexButWithWords()
    .literal("tmos_admin_password")
    .done("g"),
  maskFieldsExpStep3ReplaceLicensePassword: new RegexButWithWords()
    .literal("license_password")
    .done("g"),
  maskFieldsExpStep4HideValue: new RegexButWithWords()
    .literal('%%%%":')
    .negativeLook.ahead(exp => exp.whitespace().literal("null"))
    .whitespace()
    .group(exp => {
      exp
        .group(exp =>
          exp
            .literal('"')
            .negatedSet('"')
            .oneOrMore()
            .look.ahead('"')
        )
        .or()
        .literal("null")
        .or()
        .literal('""');
    })
    .done("g"),
  maskFieldsExpStep5CleanUp: new RegexButWithWords()
    .literal("public_key%%%%")
    .done("g")
};
