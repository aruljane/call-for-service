"use strict";

var url = "/api/response_time/";
var charts = {};

var dashboard = new Page({
    el: $('body').get(),
    template: "#dashboard-template",
    data: {
        'capitalize': function (string) {
            return string.charAt(0).toUpperCase() + string.slice(1);
        },
        data: {}
    },
    filterUpdated: function (filter) {
        d3.json(buildURL(filter), _.bind(function (error, newData) {
            if (error) throw error;
            this.set('loading', false);
            this.set('initialload', false);
            newData = cleanupData(newData);
            this.set('data', newData);
        }, this));
    }
});

function cleanupData(data) {
    console.log(data.officer_response_time_by_beat);
    data.officer_response_time_by_beat =
        _.chain(data.officer_response_time_by_beat)
            .filter(function (d) {
                return d.name;
            })
            .sortBy(function (d) {
                return d.name;
            })
            .value();

    data.officer_response_time_by_priority =
        _.chain(data.officer_response_time_by_priority)
            .filter(function (d) {
                return d.name;
            })
            .sortBy(function (d) {
                return d.name == "P" ? "0" : d.name;
            })
            .value();

    return data;
}

function monitorChart(keypath, fn) {
    dashboard.observe(keypath, function (newData) {
        if (!dashboard.get('loading')) {
            // If we don't remove the tooltips before updating
            // the chart, they'll stick around
            d3.selectAll(".nvtooltip").remove();

            fn(newData);
        }
    })
}

monitorChart('data.officer_response_time', buildORTChart);
monitorChart('data.officer_response_time_by_source', buildORTBySourceChart);
monitorChart('data.officer_response_time_by_beat', buildORTByBeatChart);
monitorChart('data.officer_response_time_by_priority', buildORTByPriorityChart);

// ========================================================================
// Functions
// ========================================================================

function durationFormat(secs) {
    if (secs > 60 * 60) {
        return d3.format("d")(Math.round(secs / 60 / 60)) + ":" +
            d3.format("02d")(Math.round((secs / 60) % 60)) + ":" +
            d3.format("02d")(Math.round(secs % 60));
    } else {
        return d3.format("d")(Math.round(secs / 60)) + ":" +
            d3.format("02d")(Math.round(secs % 60));
    }

}

function buildURL(filter) {
    return url + "?" + buildQueryParams(filter);
}


function buildORTBySourceChart(data) {
    var parentWidth = d3.select("#ort-by-source").node().clientWidth;
    var width = parentWidth;
    var height = width * 0.8;

    var svg = d3.select("#ort-by-source svg");
    svg.attr("width", width).attr("height", height);

    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
            .x(function (d) {
                return d.name
            })
            .y(function (d) {
                return Math.round(d.mean);
            })
            .margin({"bottom": 150, "right": 50});

        chart.yAxis.tickFormat(function (secs) {
            return d3.format("d")(Math.round(secs / 60)) + ":" +
                d3.format("02d")(Math.round(secs % 60));
        });

        svg.datum([{key: "Officer Response Time", values: data}]).call(chart);

        //svg.selectAll('.nv-bar').style('cursor', 'pointer');
        //
        //chart.discretebar.dispatch.on('elementClick', function (e) {
        //    if (e.data.id) {
        //        toggleFilter("nature", e.data.id);
        //    }
        //});

        // Have to call this both during creation and after updating the chart
        // when the window is resized.
        var rotateLabels = function () {
            var xTicks = d3.select('#ort-by-source .nv-x.nv-axis > g').selectAll('g');

            xTicks.selectAll('text')
                .style("text-anchor", "start")
                .attr("dx", "0.25em")
                .attr("dy", "0.75em")
                .attr("transform", "rotate(45 0,0)");
        };

        rotateLabels();

        nv.utils.windowResize(function () {
            chart.update();
            rotateLabels();
        });

        return chart;
    })
}

function buildORTByBeatChart(data) {
    var parentWidth = d3.select("#ort-by-beat").node().clientWidth;
    var width = parentWidth;
    var height = width * 0.8;

    var svg = d3.select("#ort-by-beat svg");
    svg.attr("width", width).attr("height", height);

    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
            .x(function (d) {
                return d.name
            })
            .y(function (d) {
                return Math.round(d.mean);
            })
            .margin({"bottom": 150, "right": 50});

        chart.yAxis.tickFormat(function (secs) {
            return d3.format("d")(Math.round(secs / 60)) + ":" +
                d3.format("02d")(Math.round(secs % 60));
        });

        svg.datum([{key: "Officer Response Time", values: data}]).call(chart);


        // Have to call this both during creation and after updating the chart
        // when the window is resized.
        var rotateLabels = function () {
            var xTicks = d3.select('#ort-by-beat .nv-x.nv-axis > g').selectAll('g');

            xTicks.selectAll('text')
                .style("text-anchor", "start")
                .attr("dx", "0.25em")
                .attr("dy", "0.75em")
                .attr("transform", "rotate(45 0,0)");
        };

        rotateLabels();

        nv.utils.windowResize(function () {
            chart.update();
            rotateLabels();
        });

        return chart;
    })
}

function buildORTByPriorityChart(data) {
    var parentWidth = d3.select("#ort-by-priority").node().clientWidth;
    var width = parentWidth;
    var height = width * 1.2;

    var svg = d3.select("#ort-by-priority svg");
    svg.attr("width", width).attr("height", height);

    nv.addGraph(function () {
        var chart = nv.models.discreteBarChart()
                .x(function (d) {
                    return d.name
                })
                .y(function (d) {
                    return Math.round(d.mean);
                })
            ;

        chart.yAxis.tickFormat(durationFormat);

        svg.datum([{key: "Officer Response Time", values: data}]).call(chart);

        nv.utils.windowResize(function () {
            chart.update();
        });

        return chart;
    })
}

function buildORTChart(data) {
    console.log(data);
    var parentWidth = d3.select("#ort").node().clientWidth;
    var margin = {top: 0, left: 15, right: 15, bottom: 40},
        width = parentWidth - margin.left - margin.right,
        height = parentWidth * 0.2 - margin.top - margin.bottom,
        boxtop = margin.top + 10,
        boxbottom = height - 10,
        tickHeight = (boxbottom - boxtop) * 0.7,
        tickTop = height / 2 - tickHeight / 2,
        center = boxtop + (boxbottom - boxtop) / 2,
        domainMax = Math.min(data.max, data.quartiles[2] + 3 * data.iqr);

    var svg = d3.select("#ort").select("svg");

    if (svg.size() === 0) {
        svg = d3.select("#ort")
            .append("svg")
            .classed("nvd3-svg", true)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .classed({"nvd3": true, "nv-boxPlotWithAxes": true})
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    } else {
        svg = svg.select("g");
    }

    var xScale = d3.scale.linear()
        .domain([0, domainMax])
        .range([0, width]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom")
        .tickFormat(durationFormat);

    var boxplot = svg.selectAll("g.nv-boxplot")
        .data([data]);

    boxplot.exit().remove();

    var boxplots = boxplot.enter()
        .append("g")
        .classed("nv-boxplot", true);

    boxplots.append("line")
        .attr("y1", center)
        .attr("y2", center)
        .classed({"nv-boxplot-whisker": true, "whisker-left": true});

    boxplots.append("line")
        .attr("y1", tickTop)
        .attr("y2", tickTop + tickHeight)
        .classed({"nv-boxplot-tick": true, "tick-left": true});

    boxplots.append("line")
        .attr("y1", center)
        .attr("y2", center)
        .classed({"nv-boxplot-whisker": true, "whisker-right": true});

    boxplots.append("line")
        .attr("y1", tickTop)
        .attr("y2", tickTop + tickHeight)
        .classed({"nv-boxplot-tick": true, "tick-right": true});

    boxplots.append("rect")
        .attr("y", boxtop)
        .attr("height", boxbottom - boxtop)
        .classed({"nv-boxplot-box": true, "box-left": true});

    boxplots.append("rect")
        .attr("y", boxtop)
        .attr("height", boxbottom - boxtop)
        .classed({"nv-boxplot-box": true, "box-right": true});

    boxplots.append("line")
        .attr("y1", boxtop)
        .attr("y2", boxbottom)
        .classed({"nv-boxplot-median": true});

    boxplots.append("g")
        .classed({"nv-x": true, "nv-axis": true})
        .attr("transform", "translate(0, " + (height) + ")");

    boxplot.selectAll("line.whisker-left")
        .attr("x1", function (d) { return xScale(Math.max(0, d.quartiles[0] - d.iqr * 1.5)) })
        .attr("x2", function (d) { return xScale(d.quartiles[0]) })
        .style({"stroke": "rgb(31, 119, 180)"});

    boxplot.selectAll("line.tick-left")
        .attr("x1", function (d) { return xScale(Math.max(0, d.quartiles[0] - d.iqr * 1.5)) })
        .attr("x2", function (d) { return xScale(Math.max(0, d.quartiles[0] - d.iqr * 1.5)) })
        .style({"stroke": "rgb(31, 119, 180)"});

    boxplot.selectAll("line.whisker-right")
        .attr("x1", function (d) { return xScale(Math.min(domainMax, d.quartiles[2] + d.iqr * 1.5)) })
        .attr("x2", function (d) { return xScale(d.quartiles[2]) })
        .style({"stroke": "rgb(31, 119, 180)"});

    boxplot.selectAll("line.tick-right")
        .attr("x1", function (d) { return xScale(Math.min(domainMax, d.quartiles[2] + d.iqr * 1.5)) })
        .attr("x2", function (d) { return xScale(Math.min(domainMax, d.quartiles[2] + d.iqr * 1.5)) })
        .style({"stroke": "rgb(31, 119, 180)"});

    boxplot.selectAll("rect.box-left")
        .attr("x", function (d) { return xScale(d.quartiles[0]) })
        .attr("width", function (d) { return xScale(d.quartiles[1] - d.quartiles[0]) })
        .style({"stroke": "rgb(31, 119, 180)", "fill": "rgb(31, 119, 180)"});

    boxplot.selectAll("rect.box-right")
        .attr("x", function (d) { return xScale(d.quartiles[1]) })
        .attr("width", function (d) { return xScale(d.quartiles[2] - d.quartiles[1]) })
        .style({"stroke": "rgb(31, 119, 180)", "fill": "rgb(31, 119, 180)"});

    boxplot.selectAll("line.nv-boxplot-median")
        .attr("x1", function (d) { return xScale(d.quartiles[1]) })
        .attr("x2", function (d) { return xScale(d.quartiles[1]) });

    boxplot.selectAll("g.nv-x.nv-axis").call(xAxis);
}