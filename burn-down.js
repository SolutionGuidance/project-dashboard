(function(d3) {
  "use strict";

  function randomizeFeature(feature) {
    var random = Math.random() * 3;
    if (random < 1) {
      feature.status = "Completed";
      feature.startDate = "2018-02-01";
      feature.completedDate = "2018-03-01";
    } else if (random > 2) {
      feature.status = "InProgress";
      feature.startDate = "2018-03-01";
      feature.completedDate = "2018-05-01";
    } else {
      feature.startDate = "2018-06-01";
      feature.completedDate = "2018-06-01";
    }
    return feature;
  }

  function drawBurnDownChart(data, d3) {
    var globalStartDate = new Date("2018-01-01");
    var globalEndDate = new Date("2018-12-31");
    var todayDate = new Date();

    var rootWidth = 700;
    var rootHeight = 700;
    var root = d3
      .select("#burn-down-chart")
      .append("svg")
      .attr("width", rootWidth)
      .attr("height", rootHeight);

    // Render the title.
    var titleHeight = 50;
    root
      .append("text")
      .attr("class", "title")
      .attr("x", rootWidth / 2)
      .attr("y", titleHeight / 2)
      .text("PSM Features Progress");

    var yAxisWidth = 50;
    var xAxisHeight = 50;

    // Define the root g element.
    var chartWidth = rootWidth - yAxisWidth;
    var chartHeight = rootHeight - xAxisHeight - titleHeight;
    var chartG = root
      .append("g")
      .attr("class", "histo")
      .attr("transform", "translate(" + yAxisWidth + ", " + titleHeight + ")");

    // features data in array form, add id to each feature object
    var featuresArray = Object.keys(data.features)
      .map(function(key) {
        var feature = data.features[key];
        return randomizeFeature(feature);
      })
      .sort(function(a, b) {
        return a.completedDate > b.completedDate;
      });

    // Render the axis.

    var xScale = d3
      .scaleTime()
      .domain([globalStartDate, globalEndDate])
      .range([0, 600]);

    var xAxis = d3.axisBottom().scale(xScale);
    chartG
      .append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0, " + chartHeight + ")")
      .call(xAxis);

    var barHeight = chartHeight / featuresArray.length;

    var barWidth = function(feature) {
      var end = xScale(new Date(feature.completedDate));
      // var start = xScale(new Date(feature.startDate));
      var gStart = xScale(globalStartDate);
      return end - gStart;
    };
    var barX = 0;
    var barY = function(datum, index) {
      return index * barHeight;
    };

    function barClass(d) {
      if (d.status === "NotStarted") {
        return "bar barNotStarted";
      } else if (d.status === "InProgress") {
        return "bar barInProgress";
      } else if (d.status === "Completed") {
        return "bar barCompleted";
      } else {
        return "bar";
      }
    }

    // Render the bars.
    chartG
      .selectAll("rect.bar")
      .data(featuresArray)
      .enter()
      .append("rect")
      .attr("class", barClass)
      .attr("x", barX)
      .attr("width", barWidth)
      .attr("y", barY)
      .attr("height", barHeight);
  }

  function readJsonFile(file, callback) {
    var rawFile = new XMLHttpRequest();
    rawFile.overrideMimeType("application/json");
    rawFile.open("GET", file, true);
    rawFile.onreadystatechange = function() {
      if (rawFile.readyState === 4 && rawFile.status == "200") {
        callback(rawFile.responseText);
      }
    };
    rawFile.send(null);
  }

  readJsonFile("sample-input.json", function(text) {
    var data = JSON.parse(text);
    drawBurnDownChart(data, d3);
  });
})(window.d3);
