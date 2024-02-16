import React from "react";
import { Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
import { Tab, TabList, TabPanels, Tabs, TabPanel, Toggle } from "@carbon/react";
Chart.register(...registerables);

class Stats extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      views: {},
      clones: {},
      refs: {},
      type: "clones",
      allTime: true,
    };
    this.onTabClick = this.onTabClick.bind(this);
    this.getDates = this.getDates.bind(this);
    this.getValues = this.getValues.bind(this);
    this.getAllTimeData = this.getAllTimeData.bind(this);
    this.getChartData = this.getChartData.bind(this);
    this.datesToText = this.datesToText.bind(this);
  }

  onTabClick(event) {
    let index = event.selectedIndex;
    let currentTab =
      index === 0
        ? "clones"
        : index === 1
        ? "views"
        : index === 2
        ? "refs"
        : undefined;
    this.setState({ type: currentTab });
  }

  /**
   * Get array of dates based on whether all-time or 30-days is selected
   * @param {string} type type of stats (clones, views, refs)
   * @returns {Array} Array of formatted dates
   */
  getDates(type) {
    return this.state.allTime
      ? this.getAllTimeData(type).dates
      : this.datesToText(Object.keys(this.state[type]).splice(-30));
  }

  /**
   * Get array of stats based on whether all-time or 30-days is selected
   * @param {string} type type of stats (clones, views, refs)
   * @returns {Array} Array of formatted stats
   */
  getValues(type) {
    return this.state.allTime
      ? this.getAllTimeData(type).values
      : Object.values(this.state[type]).splice(-30);
  }

  getChartData() {
    let label = this.state.type === "clones" ? "Clones" : "Views";
    let labels =
      this.state.type === "refs"
        ? Object.keys(this.state.refs)
        : this.getDates(this.state.type);
    let data =
      this.state.type === "refs"
        ? Object.values(this.state.refs)
        : this.getValues(this.state.type);
    return {
      labels: labels,
      datasets: [
        {
          label: label,
          data: data,
          fill: true,
          backgroundColor: "#1064fc",
        },
      ],
    };
  }

  /**
   * Groups daily data into weeks for all time viewing
   * @param {string} type type of stats (clones, views, refs)
   * @returns {Object} Array of dates and values grouped by week
   */
  getAllTimeData(type) {
    let dates = this.datesToText(Object.keys(this.state[type]));
    let values = Object.values(this.state[type]);
    let groupedDates = [];
    let groupedValues = [];
    let dateRanges = [];
    let weekSum = 0;
    // Group every 7 Days together
    for (let i = 0; i < dates.length; i += 7) {
      groupedDates.push(dates.slice(i, i + 7));
    }
    // Create date range for each week
    groupedDates.forEach((group) => {
      let startDate = group[0];
      let endDate = group[group.length - 1];
      dateRanges.push(startDate + " - " + endDate);
    });
    // Get sum of views for every 7 days
    values.forEach((value, index) => {
      if ((index % 7 === 6 && index !== 0) || index === values.length - 1) {
        weekSum += parseInt(value);
        groupedValues.push(weekSum);
        weekSum = 0;
      } else {
        weekSum += parseInt(value);
      }
    });
    return {
      dates: dateRanges,
      values: groupedValues,
    };
  }

  /**
   * Converts dates from YYYY-MM-DD format to Month Day Format
   * 2024-01-20 --> Jan 20
   * @param {Array} datesArray Array of dates in YYYY-MM-DD format
   * @returns {Array} Array of dates in Month Day format
   */
  datesToText(datesArray) {
    let months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    let prettyDates = [];
    datesArray.forEach((date) => {
      let splitDate = date.split("-");
      let monthIndex = parseInt(splitDate[1]);
      let monthName = months[monthIndex - 1];
      let day = parseInt(splitDate[2]);
      prettyDates.push(monthName + " " + day);
    });
    return prettyDates;
  }

  async componentDidMount() {
    await fetch(`/api/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        console.log(error);
      })
      .then((data) => {
        this.setState({
          views: data.views,
          clones: data.clones,
          refs: data.refs,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  render() {
    let options = {
      legend: {
        labels: {
          boxHeight: 30,
        },
      },
    };
    return (
      <>
        <div style={{ marginBottom: "0.4rem", fontSize: "x-large" }}>
          CRAIG Usage Statistics
        </div>
        <Tabs onChange={this.onTabClick}>
          <TabList aria-label="stats">
            <Tab>Clone Stats</Tab>
            <Tab>Traffic Stats</Tab>
            <Tab>Reference Stats</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <div className="chart" style={{ maxHeight: "75vh" }}>
                <Toggle
                  id="time"
                  labelA="Last 30 days"
                  labelB="All Time"
                  style={{ marginTop: "4rem" }}
                  defaultToggled={true}
                  toggled={this.state.allTime}
                  onToggle={() => {
                    this.setState({ allTime: !this.state.allTime });
                  }}
                />
                <Bar data={this.getChartData("clones")} options={options} />
              </div>
            </TabPanel>
            <TabPanel>
              <div className="chart" style={{ maxHeight: "75vh" }}>
                <Toggle
                  id="time"
                  labelA="Last 30 days"
                  labelB="All Time"
                  style={{ marginTop: "4rem" }}
                  defaultToggled={true}
                  toggled={this.state.allTime}
                  onToggle={() => {
                    this.setState({ allTime: !this.state.allTime });
                  }}
                />
                <Bar data={this.getChartData("views")} options={options} />
              </div>
            </TabPanel>
            <TabPanel>
              <div className="chart">
                <Bar data={this.getChartData("refs")} options={options} />
              </div>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </>
    );
  }
}

export default Stats;
