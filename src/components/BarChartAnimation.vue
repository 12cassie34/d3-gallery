<template>
  <div id="barchart" class="w-full">
    <div class="tooltip"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "vue";

const d3 = await import("d3");
import { max, min } from "d3";

import { precipitation } from "../datum/precipitation";

export default defineComponent({
  setup() {
    const margin = { top: 10, right: 30, bottom: 0, left: 90 };

    let height = 0;
    let width = 0;
    let innerWidth = 0;
    let barWidth = 0;
    let barPadding = 0;
    let tooltip = null;

    const xValue = (data) => data.year;
    const yValue = (data) => data.value;
    let xScale = () => {};
    let yScale = () => {};

    const addAttributes = (element, attrs) => {
      for (let att in attrs) {
        element.setAttribute(att, attrs[att]);
      }
      return element;
    };

    const drawChartContainer = () => {
      const barSvg = d3
        .select("#barchart")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%");
      barSvg
        .append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("transform", "translate(0, 20)")
        .attr("fill", "#707070");
      barSvg
        .append("g")
        .attr("id", "bar-chart-svg")
        .attr("transform", "translate(40, 40)");

      const barChartContainer = document.getElementById("barchart");
      height = barChartContainer.clientHeight - 50;
      width = barChartContainer.clientWidth;
      innerHeight = height - margin.top;
      innerWidth = width - margin.right - margin.left;
      barWidth = (innerWidth * 0.6) / precipitation.length;
      barPadding = (innerWidth * 0.4) / precipitation.length / 100;
      xScale = d3
        .scaleBand()
        .domain(precipitation.map(xValue))
        .range([0, innerWidth])
        .padding(barPadding);
      yScale = d3
        .scaleLinear()
        .domain([0, max(precipitation, yValue)])
        .range([height, 0]);
      tooltip = d3.select(".tooltip");
    };
    const drawXAxis = () => {
      const barGroup = d3.select("#bar-chart-svg");
      const xAxis = d3.axisBottom(xScale);
      let xAxisG;

      if (d3.select(".x-axis")._groups[0][0] === null) {
        xAxisG = barGroup
          .append("g")
          .attr("transform", "translate(-5, -40)")
          .attr("text-anchor", "end")
          .attr("class", "x-axis")
          .style("font-family", "Helvetica");
      } else {
        xAxisG = d3.select(".x-axis");
        xAxisG.selectAll("g").remove();
      }

      xAxisG.call(xAxis);

      barGroup
        .selectAll(".tick")
        .filter((d) => d % 5 === 0)
        .attr("class", "custom-ticks");
      xAxisG.selectAll(".domain, line, .tick").remove();
    };
    const drawYAxis = () => {
      const barGroup = d3.select("#bar-chart-svg");
      const yAxisScale = d3
        .scaleLinear()
        .domain([min(precipitation, yValue), max(precipitation, yValue)])
        .range([height, 0]);

      const yAxis = d3.axisRight(yAxisScale).ticks(10);
      let yAxisG;

      if (d3.select(".y-axis")._groups[0][0] === null) {
        yAxisG = barGroup
          .append("g")
          .attr("text-anchor", "revert")
          .attr("transform", "translate(-40, 0)")
          .attr("class", "y-axis")
          .style("font-family", "Helvetica");
      } else {
        yAxisG = d3.select(".y-axis");
        yAxisG.selectAll("g").remove();
      }

      yAxisG.call(yAxis);

      const middleYLine = yAxisG.selectAll("line")._groups[0][5];
      addAttributes(middleYLine, {
        x1: "40",
        y1: "0",
        x2: "100%",
        y2: "0",
        class: "line",
        style:
          "stroke: rgba(255, 255, 255, 0.8); stroke-linecap: butt; stroke-width: 1.5px; stroke-dasharray: 6, 10;",
      });
      barGroup.selectAll(".y-axis path, .y-axis line:not(.line)").remove();
      barGroup.selectAll(".y-axis text").style("color", "#fff");
    };
    const drawBars = () => {
      const barGroup = d3.select("#bar-chart-svg");
      barGroup
        .selectAll("rect")
        .data(precipitation)
        .enter()
        .append("rect")
        .attr("fill", "#a2a2a2")
        .attr("rx", 5)
        .attr("width", barWidth)
        .attr("height", (data) => height - yScale(data.value))
        .attr("x", (data) => xScale(xValue(data)))
        .attr("y", (data) => yScale(yValue(data)) + margin.top)
        .attr("year-value", (data) => data.year)
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseout", mouseout)
        .merge(barGroup);
    };

    function mouseover() {
      tooltip.style("display", "inline");
    }

    function mousemove(e) {
      const data = d3.select(this).data()[0];
      tooltip
        .html(data.year + "<hr/>" + `${data.value} mm`)
        .style("left", `${e.offsetX + 300}px`)
        .style("top", `${e.offsetY - 10}px`);
      d3.select(this).attr("fill", "#f39800");
    }
    function mouseout() {
      tooltip.style("display", "none");
      d3.select(this).attr("fill", "#a2a2a2");
    }

    onMounted(() => {
      drawChartContainer();
      drawBars();
      drawXAxis();
      drawYAxis();
    });
  },
});
</script>


<style scoped>
.y-axis text {
  color: white;
}

.tooltip {
  display: none;
  position: absolute;
  text-align: center;
  max-width: 100px;
  max-height: 300px;
  margin-top: -30px;
  padding: 8px;
  border: none;
  border-radius: 8px;
  font: 10px Helvetica;
  text-transform: lowercase;
  background: #343434;
  color: rgba(255, 255, 255, 0.8);
  pointer-events: none;
}
</style>