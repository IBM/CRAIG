import MixedPattern from "../../images/mixed.png";
import VsiPattern from "../../images/VsiPattern.png";
import VsiEdgePattern from "../../images/VsiEdgePattern.png";
import SapHanaPattern from "../../images/SapHanaPattern.png";
import OracleRac from "../../images/oracle-rac.png";
import Empty from "../../images/empty.png";
import PowerVsQuickStart from "../../images/quick-start-power.png";
import OracleSI from "../../images/oracle-si.png";
import Vpnaas from "../../images/vpnaas.png";
import PowerVsPoc from "../../images/power-poc.png";
import PowerVsPocClassic from "../../images/power-poc-classic.png";
import vtlQuickstart from "../../images/vtl-quickstart.png";
import { keys } from "lazy-z";
const { template_dropdown_map } = require("../../lib/constants");

const templateImages = {
  Mixed: MixedPattern.src,
  VSI: VsiPattern.src,
  "VSI Edge": VsiEdgePattern.src,
  "Power VS SAP Hana": SapHanaPattern.src,
  "Power VS Oracle Ready": OracleRac.src,
  "Empty Project": Empty.src,
  "Power VS Quick Start": PowerVsQuickStart.src,
  "Power VS Oracle Single Instance": OracleSI.src,
  "VPN as a Service": Vpnaas.src,
  "Power VS POC": PowerVsPoc.src,
  "Power VS POC Classic": PowerVsPocClassic.src,
  "Power VS FalconStor VTL Quickstart": vtlQuickstart.src,
};

keys(template_dropdown_map).forEach((template) => {
  template_dropdown_map[template].image = templateImages[template];
});

export { template_dropdown_map as templates };
