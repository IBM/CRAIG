import {
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  DataTable,
  TableContainer,
} from "@carbon/react";
import React, { Component } from "react";
import { contains, allFieldsNull } from "lazy-z";
import PropTypes from "prop-types";

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
 * set up rows and headers
 * @param {Object} componentProps
 * @param {array} componentProps.rules
 * @param {bool} componentProps.isSecurityGroup
 * @returns {object} rows, headers for data table
 */
function setupRowsAndHeaders(componentProps) {
  const { rules, isSecurityGroup } = { ...componentProps };

  const headers = [
    {
      key: "name",
      header: "Name",
    },
    { key: "direction", header: "Direction" },
    {
      key: "source",
      header: "Source".replace(isSecurityGroup ? "Source" : "$$$", "CIDR"),
    },
    { key: "protocol", header: "Protocol" },
    { key: "port", header: "Port" },
  ];

  const rows = JSON.parse(JSON.stringify(rules));

  // set up required data for each row
  rows.forEach((row) => {
    row.protocol = getRuleProtocol(row);
    row.id = row.name;
    row.port =
      row.protocol === "all"
        ? "ALL"
        : row.protocol === "icmp"
        ? row.icmp.code
        : contains(["null", null], row[row.protocol].port_min) ||
          contains(["null", null], row[row.protocol].port_max)
        ? "ALL"
        : `${row[row.protocol].port_min}-${row[row.protocol].port_max}`;
    delete row.icmp;
    delete row.tcp;
    delete row.udp;
  });

  // add in action and destination if not security group
  if (!isSecurityGroup) {
    headers.splice(1, 0, {
      // add extra fields if not security group
      key: "action",
      header: "Action",
    });
    headers.splice(4, 0, { key: "destination", header: "Destination" });
  }

  return { rows: rows, headers: headers };
}

class OrderCardDataTable extends Component {
  constructor(props) {
    super(props);

    this.state = setupRowsAndHeaders(this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.rules !== this.props.rules) {
      this.setState(setupRowsAndHeaders(this.props));
    }
  }

  render() {
    const { rows, headers } = { ...this.state };

    return (
      <DataTable headers={headers} rows={rows}>
        {({ rows, headers, getHeaderProps, getRowProps }) => (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map((header, index) => (
                    <TableHeader
                      key={header.header + "-" + index}
                      {...getHeaderProps({ header })}
                    >
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row, index) => (
                  <TableRow
                    key={row.name + "-" + index}
                    {...getRowProps({ row })}
                  >
                    {row.cells.map((cell) => (
                      <TableCell
                        key={JSON.stringify(cell)}
                        className={
                          this.props.isSecurityGroup ? "dt-security-group" : ""
                        }
                      >
                        <div key={JSON.stringify(cell) + "-port"}>
                          {contains(["tcp", "udp", "all", "icmp"], cell.value)
                            ? cell.value.toUpperCase()
                            : cell.value}
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    );
  }
}

OrderCardDataTable.defaultPRops = {
  isSecurityGroup: false,
};

OrderCardDataTable.propTypes = {
  isSecurityGroup: PropTypes.bool.isRequired,
  rules: PropTypes.array.isRequired,
};

export default OrderCardDataTable;
