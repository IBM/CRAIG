const { RegexButWithWords } = require("regex-but-with-words");

module.exports = {
  lastCommaExp: new RegexButWithWords()
    .literal(",")
    .look.ahead(exp => exp.stringEnd())
    .done("i")
};