<template>
  <div class="graph-container flex mt-8 w-full">
    <svg id="graph-svg" width="100%" height="100%"></svg>
  </div>
</template>

<script>
import { defineComponent, onMounted } from "vue";
import * as d3 from "d3";

import { temperatureDatum } from "../datum/temperature30Days";

export default defineComponent({
  setup() {
    let svg = null;
    let chart = null;
    let chartDescription = null;
    let dataLength = 0;
    const yScaleLength = 200;
    const marginLeft = 30;
    let xScale = null;
    let yScale = null;
    const xTranslate = "translate(-5, 0)";
    const obsDataColor = "#DE5754";
    const climateDataColor = "#366F1D";
    const climatePlusSdColor = "#D084D4";
    const climateMinusSdColor = "#8FC0D7";
    const obsLowerColor = "#7F82FC";
    const curve = d3.curveMonotoneX;
    const svgWidth = 500;
    const svgHeight = 500;

    const initializeSvg = () => {
      dataLength = temperatureDatum.length;

      svg = d3
        .select("#graph-svg")
        .append("g")
        .attr("transform", `translate(${marginLeft}, 40)`)
        .attr("class", "svg-container")
        .attr("width", svgWidth)
        .attr("height", svgHeight);

      chart = d3
        .select(".svg-container")
        .append("g")
        .attr("transform", `translate(0, 20)`)
        .attr("class", "chart");

      createXScale();
      createYScale();
      createLineWithDot("obs", obsDataColor);
      createLineWithDot("climate", climateDataColor);
      createDashedLine("plus", climatePlusSdColor);
      createDashedLine("minus", climateMinusSdColor);
      createArea();
      indicateMaxAndMinObs();
      createTitle();
      createChartDescription();
    };

    const createXScale = () => {
      xScale = d3
        .scaleTime()
        .domain([
          new Date(temperatureDatum[0].time),
          new Date(temperatureDatum[dataLength - 1].time),
        ])
        .range([0, 500])
        .nice();

      const xAxis = d3
        .axisBottom(xScale)
        .tickFormat((value, i) => {
          const monthFormat = d3.timeFormat("%b");
          if (i % 6 === 1) return monthFormat(value);
        })
        .ticks(dataLength);

      chart
        .append("g")
        .call(xAxis)
        .attr("transform", `translate(0, ${yScaleLength})`)
        .attr("class", "x-scale");

      d3.selectAll("g.x-scale g:nth-child(6n - 3)")
        .append("text")
        .attr("x", 0)
        .attr("y", 30)
        .text(d3.timeFormat("%d"))
        .attr("fill", "black");

      d3.selectAll("g.x-scale g:nth-child(3)")
        .append("text")
        .attr("x", 0)
        .attr("y", 45)
        .text(d3.timeFormat("%Y"))
        .attr("fill", "black");
    };

    const createYScale = () => {
      let yMin = temperatureDatum[0].obsData,
        yMax = temperatureDatum[0].obsData;
      temperatureDatum.forEach((item) => {
        if (item.obsData < yMin) {
          yMin = item.obsData;
        }
        if (item.obsData > yMax) {
          yMax = item.obsData;
        }
      });

      yScale = d3
        .scaleLinear()
        .domain([yMin - 1, yMax])
        .range([yScaleLength, 0])
        .nice();
      const yAxis = d3.axisLeft(yScale).ticks(10);
      chart
        .append("g")
        .call(yAxis)
        .attr("class", "y-scale")
        .attr("transform", `translate(-1, 0)`);
      d3.select(".y-scale")
        .append("text")
        .text("溫度（°C）")
        .attr("x", `${marginLeft + 10}`)
        .attr("y", -10)
        .attr("fill", "black");
    };

    const createLineWithDot = (type, color) => {
      const typeMap = Object.create(null, {
        obs: { value: (d) => d.obsData },
        climate: { value: (d) => d.climateData },
      });
      chart
        .append("g")
        .selectAll("dot")
        .data(temperatureDatum)
        .enter()
        .append("circle")
        .attr("cx", (d) => {
          return xScale(new Date(d.time));
        })
        .attr("cy", (d) => {
          return yScale(typeMap[type](d));
        })
        .attr("r", 3)
        .attr("transform", xTranslate)
        .attr("class", (d) => {
          return `item-${d.time}`;
        })
        .style("fill", color);

      const line = d3
        .line()
        .x((d) => {
          return xScale(new Date(d.time));
        })
        .y((d) => {
          return yScale(typeMap[type](d));
        })
        .curve(curve);
      chart
        .append("path")
        .datum(temperatureDatum)
        .attr("class", "line")
        .attr("transform", xTranslate)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", "2");
    };

    const createDashedLine = (type, color) => {
      const methodMap = Object.create(null, {
        plus: { value: (d) => d.climateData + d.sd },
        minus: { value: (d) => d.climateData - d.sd },
      });
      const line = d3
        .line()
        .x((d) => {
          return xScale(new Date(d.time));
        })
        .y((d) => {
          return yScale(methodMap[type](d));
        })
        .curve(curve);
      chart
        .append("path")
        .datum(temperatureDatum)
        .attr("class", "line")
        .attr("transform", xTranslate)
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", color)
        .style("stroke-width", "2")
        .style("stroke-dasharray", "3, 3");
    };

    const createArea = () => {
      const opacity = 0.6;
      const height = 500;

      const topToClimate = d3
        .area()
        .x((d) => xScale(new Date(d.time)))
        .y0(0)
        .y1((d) => yScale(d.climateData))
        .curve(curve);

      const bottomToClimate = d3
        .area()
        .x((d) => xScale(new Date(d.time)))
        .y0(height)
        .y1((d) => yScale(d.climateData))
        .curve(curve);

      const topToObs = d3
        .area()
        .x((d) => xScale(new Date(d.time)))
        .y0(0)
        .y1((d) => yScale(d.obsData))
        .curve(curve);

      const bottomToObs = d3
        .area()
        .x((d) => xScale(new Date(d.time)))
        .y0(height)
        .y1((d) => yScale(d.obsData))
        .curve(curve);

      chart
        .append("clipPath")
        .attr("id", "top-to-obs")
        .append("path")
        .attr("d", topToObs(temperatureDatum));

      chart
        .append("clipPath")
        .attr("id", "bottom-to-obs")
        .append("path")
        .attr("d", bottomToObs(temperatureDatum));

      chart
        .append("path")
        .attr("transform", xTranslate)
        .attr("fill", obsLowerColor)
        .attr("opacity", 0.6)
        .attr("clip-path", "url(#top-to-obs)")
        .attr("d", bottomToClimate(temperatureDatum));

      chart
        .append("path")
        .attr("transform", xTranslate)
        .attr("fill", obsDataColor)
        .attr("opacity", opacity)
        .attr("clip-path", "url(#bottom-to-obs)")
        .attr("d", topToClimate(temperatureDatum));
    };

    const indicateMaxAndMinObs = () => {
      function filterResult(arr, targetValue) {
        return arr.filter((item) => {
          return item.obsData === targetValue;
        });
      }

      function appendText(data) {
        chart
          .append("text")
          .attr("x", xScale(new Date(data[0].time)))
          .attr("y", yScale(data[0].obsData))
          .text(data[0].obsData)
          .style("font-size", "10px");
      }

      const obsArr = temperatureDatum.reduce((arr, current) => {
        arr.push(current.obsData);
        return arr;
      }, []);
      const maxObs = Math.max(...obsArr);
      const minObs = Math.min(...obsArr);

      const maxResult = filterResult(temperatureDatum, maxObs);
      const minResult = filterResult(temperatureDatum, minObs);

      appendText(maxResult);
      appendText(minResult);
    };
    const createTitle = () => {
      function sort_time(time) {
        const timeArr = time.split("-");
        return `${timeArr[0]} 年 ${timeArr[1]} 月 ${timeArr[2]} 日`;
      }
      svg
        .append("text")
        .attr("x", `${svgWidth / 12}`)
        .attr("y", `${svgHeight - 530}`)
        .text(
          `台北站 日溫度 ${sort_time(temperatureDatum[0].time)} ~ ${sort_time(
            temperatureDatum[dataLength - 1].time
          )}`
        )
        .style("font-size", "12px");
    };
    const createChartDescription = () => {
      const lineＷidth = 3;
      let startＸ = 10;
      let endX = 30;
      const startY = 0;
      const endY = 0;

      chartDescription = d3
        .select(".svg-container")
        .append("g")
        .attr("transform", `translate(0, -10)`)
        .attr("class", "chart-description");

      const obsDescription = chartDescription
        .append("g")
        .attr("class", "obs-description");
      const climatePlusSd = chartDescription
        .append("g")
        .attr("class", "climate-plus-sd");
      const climateMinusSd = chartDescription
        .append("g")
        .attr("class", "climate-minus-sd");
      const climateDescription = chartDescription
        .append("g")
        .attr("class", "climate-description");

      function draw_description(
        container,
        color,
        start,
        end,
        text,
        dash = "none"
      ) {
        container
          .append("line")
          .style("stroke", color)
          .style("stroke-width", lineＷidth)
          .style("stroke-dasharray", dash)
          .attr("x1", start)
          .attr("y1", startY)
          .attr("x2", end)
          .attr("y2", endY);

        container
          .append("text")
          .attr("x", `${end + 5}`)
          .attr("y", `${startY + 3}`)
          .text(text)
          .style("font-size", "10px");
      }

      draw_description(obsDescription, obsDataColor, startＸ, endX, "觀測值");
      draw_description(
        climatePlusSd,
        climatePlusSdColor,
        startＸ + 70,
        endX + 70,
        "氣候值 + 標準差",
        "3, 3"
      );
      draw_description(
        climateMinusSd,
        climateMinusSdColor,
        startＸ + 180,
        endX + 180,
        "氣候值 - 標準差",
        "3, 3"
      );
      draw_description(
        climateDescription,
        climateDataColor,
        startＸ + 290,
        endX + 290,
        "氣候值"
      );
    };

    onMounted(() => {
      initializeSvg();
    });
  },
});
</script>

<style scoped>
.graph-container {
    margin-left: 20%;
}
</style>