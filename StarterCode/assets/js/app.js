// Define SVG area dimensions
var svgWidth = 980;
var svgHeight = 600;

// Define the chart's margins as an object
var margin = {
    top: 20,
    right: 40,
    bottom: 100,
    left: 100
  };

// Define dimensions of the chart area

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);
  


// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("height", svgHeight)
  .attr("width", svgWidth);

// Initial Params
var NewXAxis = "poverty";
var newYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(bureauData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(bureauData, d => d[chosenXAxis]) * 0.9,
      d3.max(bureauData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;
}
// function used for updating y-scale var upon click on axis label
function yScale(bureauData, chosenYAxis) {
   
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(bureauData, d => d[chosenYAxis]) * 0.7,
        d3.max(bureauData, d => d[chosenYAxis]) * 1.3
      ])
      .range([height, 0]);
  
    return yLinearScale;
  }

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}
  


// New circles
function renderCircles(circlesGroup, newXScale, NewXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("nx", d => newXScale(d[NewXAxis]))
    .attr("ny", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesTextGroup(circlesTextGroup, newXScale, NewXAxis, newYScale, chosenYAxis) {
    circlesTextGroup.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[NewXAxis]))
      .attr("y", d => newYScale(d[NewYAxis]))
    
    return circlesTextGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel_prefix = "";
    var xlabel = "Poverty";
    var xlabel_suffix = "%";
  }
  else if (chosenXAxis === "age") {
    var xlabel_prefix = "";
    var xlabel = "Median age";
    var xlabel_suffix = "";
  } 
  else {
    var xlabel_prefix = "$";
    var xlabel = "Income";
    var xlabel_suffix = "";
  }

  if (chosenYAxis === "healthcare") {
    var ylabel = "No healthcare";
    var ylabel_suffix = "%";
  }
  else if (chosenYAxis === "smoker") {
    var ylabel = "Smoking";
    var ylabel_suffix = "%";
  } 
  else {
    var ylabel = "Obesity";
    var ylabel_suffix = "%";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${xlabel_prefix}${d[chosenXAxis]}${xlabel_suffix}<br>${ylabel}: ${d[chosenYAxis]}${ylabel_suffix}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
    .on("mouseover", function(data) {
      toolTip.show(data, this);
    })
    // onmouseout event
    .on("mouseout", function(data) {
      toolTip.hide(data);
    });
  return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(bureauData) {
  //if (err) throw err;

  // parse data
  bureauData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.income = +data.income;
    data.healthcare = +data.healthcare;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });
 

  // xLinearScale function above csv import
  var xLinearScale = xScale(bureauData, NewXAxis);

  // Create y scale function
  var yLinearScale = yScale(bureauData, newYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circleGroup = chartGroup.selectAll("circle")
    .data(bureauData)
    .enter()
    .append("circle")
    .attr("nx", d => xLinearScale(d[NewXAxis]))
    .attr("ny", d => yLinearScale(d[newYAxis]))
    .attr("r", "20")
    .classed("stateCircle", true);

  // updateToolTip function above csv import
  var circleGroup = updateToolTip(NewXAxis, newYAxis, circleGroup);

  // adding state abbreviation labels
  var circlesTextGroup = chartGroup.append("text").classed("stateText",true)
    .selectAll("tspan")
    .data(bureauData)
    .enter()
    .append("tspan")
    .attr("x", d => xLinearScale(d[NewXAxis]))
    .attr("y", d => yLinearScale(d[newYAxis]))
    .text(d => d.abbr);

  // Create group for  3 x-axis labels, and 3 y-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + margin.top})`);
  var yLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(0, 0)`);


  var poverty_Label = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 25)
    .attr("value", "poverty") 
    .classed("aText", true)
    .classed("active", true)
    .text("In Poverty (%)");

  var age_Label = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 50)
    .attr("value", "age") 
    .classed("aText", true)
    .classed("inactive", true)
    .text("Age (Median)");

  var income_Label = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 70)
    .attr("value", "income") 
    .classed("aText", true)
    .classed("inactive", true)
    .text("Household Income (Median)");

  // append y axis
  var health_Label = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -30)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("aText", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)");

  var smoker_Label = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesity_Label = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -80)
    .attr("x", 0)
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Obese (%)");

  // x axis labels 
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== NewXAxis) {

        // replaces Xaxis with value
        NewXAxis = value;

        

        // updates x scale for new data
        xLinearScale = xScale(bureauData, NewXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circleGroup = renderCircles(circleGroup, xLinearScale, NewXAxis, yLinearScale, newYAxis);
        circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, NewXAxis, yLinearScale, newYAxis);

        // updates tooltips with new info
        circleGroup = updateToolTip(NewXAxis, newYAxis, circleGroup);

        // changes classes to change bold text
        if (NewXAxis === "poverty") {
          poverty_Label
            .classed("active", true)
            .classed("inactive", false);
          age_Label
            .classed("active", false)
            .classed("inactive", true);
          income_Label
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (NewXAxis === "age") {
          poverty_Label
            .classed("active", false)
            .classed("inactive", true);
          age_Label
            .classed("active", true)
            .classed("inactive", false);
          income_Label
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          poverty_Label
            .classed("active", false)
            .classed("inactive", true);
          age_Label
            .classed("active", false)
            .classed("inactive", true);
          income_Label
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });

  yLabelGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value == newYAxis) {

        // replaces chosenXaxis with value
        newYAxis = value;

        
        // updates y scale for new data
        yLinearScale = yScale(bureauData, newYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new x values
        circleGroup = renderCircles(circleGroup, xLinearScale, NewXAxis, yLinearScale, newYAxis);
        circlesTextGroup = renderCirclesTextGroup(circlesTextGroup, xLinearScale, NewXAxis, yLinearScale, newYAxis);

        // updates tooltips with new info
        circleGroup = updateToolTip(NewXAxis, newYAxis, circleGroup);

        // change classes 
        if (newYAxis === "healthcare") {
          health_Label
            .classed("active", true)
            .classed("inactive", false);
          smoker_Label
            .classed("active", false)
            .classed("inactive", true);
          obesity_Label
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (newYAxis === "smokes") {
          health_Label
            .classed("active", false)
            .classed("inactive", true);
          smoker_Label
            .classed("active", true)
            .classed("inactive", false);
          obesity_Label
            .classed("active", false)
            .classed("inactive", true);
        }
        else {
          health_Label
            .classed("active", false)
            .classed("inactive", true);
          smoker_Label
            .classed("active", false)
            .classed("inactive", true);
          obesity_Label
            .classed("active", true)
            .classed("inactive", false);
        }  }  });   });
