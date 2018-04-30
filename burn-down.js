(function(d3) {
  "use strict";

  function randomizeFeature(feature) {
    var random = Math.random() * 3;
    if (random < 1) {
      feature.status = "Completed";
      if (random < 0.5) {
        feature.startDate = "2018-02-01";
        feature.completedDate = "2018-04-01";
      } else {
        feature.startDate = "2018-03-01";
        feature.completedDate = "2018-04-01";
      }
    } else if (random > 2) {
      feature.status = "InProgress";
      if (random < 2.5) {
        feature.startDate = "2018-03-01";
      } else {
        feature.startDate = "2018-04-01";
      }
    }
    return feature;
  }

  function makeFeatureTable(targetSelector, reqsData, issuesData) {
    var table = d3
      .select(targetSelector)
      .append("table")
      .attr("class", "requirementsTable");
    var thead = table.append("thead");
    var tbody = table.append("tbody");

    var columns = [
      { label: "ID", key: "req_id" },
      { label: "Description", key: "description" },
      { label: "Status", key: "status" },
      { label: "Issues", key: "issues" }
    ];

    // Header row.
    thead
      .append("tr")
      .selectAll("th")
      .data(
        columns.map(function(c) {
          return c.label;
        })
      )
      .enter()
      .append("th")
      .attr("class", "requirementsTableCell")
      .text(function(column) {
        return column;
      });

    // Data rows.
    var rows = tbody
      .selectAll("tr")
      .data(reqsData)
      .enter()
      .append("tr");

    // Cells.
    function plainValue(d) {
      return d.value;
    }

    function formatStatus(d) {
      return {
        NotStarted: "Not Started",
        InProgress: "In Progress",
        Completed: "Completed"
      }[d.value];
    }

    function formatIssues(d) {
      d.value.sort(function(a, b) {
        return a > b;
      });
      var links = d.value.map(function(issueNumber) {
        var issue = issuesData[issueNumber];
        var classes =
          issue.status === "Completed" ? "completedIssueLink" : "issueLink";

        return (
          '<a href="' +
          issue.url +
          '" title="' +
          issue.title +
          '" class="' +
          classes +
          '" >' +
          issueNumber +
          "</a>"
        );
      });
      return links.join(", ");
    }

    function cellClass(d) {
      return (
        "requirementsTableCell " +
        {
          req_id: "reqIdCell",
          description: "descriptionCell",
          status: "statusCell",
          issues: "issuesCell"
        }[d.key]
      );
    }

    var cells = rows
      .selectAll("td")
      .data(function(row) {
        return columns.map(function(column) {
          return { key: column.key, value: row[column.key] };
        });
      })
      .enter()
      .append("td")
      .attr("class", cellClass)
      .html(function(d) {
        var formatter = {
          req_id: plainValue,
          description: plainValue,
          status: formatStatus,
          issues: formatIssues
        }[d.key];

        return formatter(d);
      });

    return table;
  }

  function drawBurnDownChart(data, d3) {
    var globalStartDate = new Date("2018-01-01");
    var globalEndDate = new Date("2018-12-31");
    var todayDate = new Date();
    var todayString = todayDate.toISOString();

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

    // features data in array form
    var featuresArray = Object.keys(data.features)
      .map(function(key) {
        var feature = randomizeFeature(data.features[key]);
        // TODO: calculate 'in progress' percent done
        feature.percentDone =
          {
            NotStarted: "0",
            Completed: "100"
          }[feature.status] || "50";

        return feature;
      })
      .sort(function(a, b) {
        if (a.status === b.status) {
          if (a.completedDate === b.completedDate) {
            return a.startDate > b.startDate;
          } else {
            return a.completedDate > b.completedDate;
          }
        } else if (a.status === "NotStarted") {
          return true;
        } else if (b.status === "NotStarted") {
          return false;
        } else if (a.status === "InProgress") {
          return true;
        } else if (b.status === "InProgress") {
          return false;
        }
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

    var barWidthNotStarted = function(feature) {
      var end = xScale(new Date(feature.startDate || todayString));
      var start = xScale(globalStartDate);
      return end - start;
    };

    var barWidthInProgress = function(feature) {
      var end = xScale(new Date(feature.completedDate || todayString));
      var start = xScale(new Date(feature.startDate));
      return end - start;
    };

    var barX = 0;
    var barY = function(datum, index) {
      return index * barHeight;
    };

    function barClass(d) {
      var statusClass = {
        NotStarted: " barNotStarted",
        InProgress: " barInProgress",
        Completed: " barCompleted"
      }[d.status];
      return "bar" + (statusClass || "");
    }

    // Render the bars.
    chartG
      .selectAll("rect.barNotStarted")
      .data(featuresArray)
      .enter()
      .append("rect")
      .attr("class", "bar barNotStarted")
      .attr("x", barX)
      .attr("width", barWidthNotStarted)
      .attr("y", barY)
      .attr("height", barHeight);

    chartG
      .selectAll("rect.barInProgress")
      .data(
        featuresArray.filter(function(f) {
          return f.status !== "NotStarted";
        })
      )
      .enter()
      .append("rect")
      .attr("class", "bar barInProgress")
      .attr("x", function(d) {
        return xScale(new Date(d.startDate));
      })
      .attr("width", barWidthInProgress)
      .attr("y", barY)
      .attr("height", barHeight);

    // Render today line.

    var todayLineColor = "orange";
    var xScaledToday = xScale(todayDate);

    chartG
      .append("line")
      .attr("x1", xScaledToday)
      .attr("x2", xScaledToday)
      .attr("y1", 0)
      .attr("y2", chartHeight + 25)
      .attr("stroke-width", 2)
      .attr("stroke", todayLineColor);

    chartG
      .append("text")
      .attr("x", xScaledToday)
      .attr("y", chartHeight + 40)
      .attr("font-size", "11px")
      .attr("fill", todayLineColor)
      .attr("text-anchor", "middle")
      .text("Today");

    // Tooltips.

    var tooltip = d3
      .select("#burn-down-chart")
      .append("div")
      .attr("class", "tooltip");

    tooltip.append("div").attr("class", "description");
    tooltip.append("div").attr("class", "percentDone");

    function hideDarkBackground() {
      darkBackground.style("display", "none");
    }

    var darkBackground = d3
      .select("#burn-down-chart")
      .append("div")
      .attr("class", "darkBackground")
      .on("click", hideDarkBackground);

    var overlay = darkBackground
      .append("div")
      .attr("class", "overlay")
      .on("click", function(e) {
        d3.event.stopPropagation();
      });

    function loadFeatureOverlay(d, i) {
      overlay.html("");

      overlay
        .append("div")
        .attr("class", "overlayCloseButton")
        .text("Close")
        .on("click", hideDarkBackground);

      overlay.append("h2").text("Feature");

      overlay
        .append("div")
        .attr("class", "overlayFeatureDescription")
        .text(d.description);

      overlay.append("h3").text("Requirements");

      var reqs = d.requirements.map(function(reqId) {
        return data.requirements[reqId];
      });

      var table = makeFeatureTable(".overlay", reqs, data.issues);

      darkBackground.style("display", "block");
    }

    chartG
      .selectAll(["rect.barInProgress", "rect.barNotStarted"])
      .on("mouseover", function(d) {
        tooltip.select(".description").html(d.description);
        tooltip.select(".percentDone").html(d.percentDone + "% done");
        tooltip.style("display", "block");
      })
      .on("mouseout", function(d) {
        tooltip.style("display", "none");
      })
      .on("mousemove", function(d) {
        tooltip
          .style("top", d3.event.layerY + 10 + "px")
          .style("left", d3.event.layerX + 10 + "px");
      })
      .on("click", loadFeatureOverlay);
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
