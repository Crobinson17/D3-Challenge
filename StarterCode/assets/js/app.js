// D3 Scatter Plot
var width = parseInt(d3.select("#scatter").style("width"));

// Graph height
var height = width - width / 3.9;


// Margin spacing for graph
// bottom and left axes text
var margin = 50;
var LabelArea = 80;
var BottomPad = 50;
var LeftPad = 50;

// Create the actual canvas for the graph
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .attr("class", "chart");

// Radius
var CircleRadius;
function crGet() {
  if (width <= 500) {
    CircleRadius = 4;
  }
  else {
    CircleRadius = 10;
  }
}
crGet();



// Bottom Labels
svg.append("g").attr("class", "xText");

var XText = d3.select(".xText");

function XTextRefresh() {
  XText.attr(
    "transform",
    "translate(" +
      ((width - LabelArea) / 2 + LabelArea) +
      ", " +
      (height - margin - BottomPad) +
      ")"
  );
}
XTextRefresh();

// Append X Text

// 1. Poverty
XText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "poverty")
  .attr("data-axis", "x")
  .attr("class", "aText active x")
  .text("In Poverty (%)");

// 2. Income
XText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "income")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Household Income (Median)");
// 3. Age
XText
  .append("text")
  .attr("y", 0)
  .attr("data-name", "age")
  .attr("data-axis", "x")
  .attr("class", "aText inactive x")
  .text("Age (Median)");

var LeftXText = margin + LeftPad;
var LeftYText = (height + LabelArea) / 2 - LabelArea;


svg.append("g").attr("class", "yText");
var YText = d3.select(".yText");

function YTextRefresh() {
  YText.attr(
    "transform",
    "translate(" + LeftXText + ", " + LeftYText + ")rotate(-90)"
  );
}
YTextRefresh();

//Append Y Text

// 1. Smokes
YText
  .append("text")
  .attr("x", 0)
  .attr("data-name", "smokes")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Smokes (%)");
// 2. Obesity
YText
  .append("text")
  .attr("y", -26)
  .attr("data-name", "obesity")
  .attr("data-axis", "y")
  .attr("class", "aText active y")
  .text("Obese (%)");
// 3. Lacks Healthcare
YText
  .append("text")
  .attr("y", 26)
  .attr("data-name", "healthcare")
  .attr("data-axis", "y")
  .attr("class", "aText inactive y")
  .text("Lacks Healthcare (%)");



// Import CSV file.
d3.csv("assets/data/data.csv").then(function(data) {
  
  visualize(data);
});


function visualize(theData) {
  var CurX = "poverty";
  var CurY = "obesity";

  
  var XMin;
  var XMax;
  var YMin;
  var YMax;

  // Tooltip 

  var toolTip = d3
    .tip()
    .attr("class", "d3-tip")
    .offset([50, -60])
    .html(function(d) {
      
      var TheX;
      var TheState = "<div>" + d.state + "</div>";
      
      var TheY = "<div>" + CurY + ": " + d[CurY] + "%</div>";
      
      if (CurX === "poverty") {
        TheX = "<div>" + CurX + ": " + d[CurX] + "%</div>";
      }
      else {
        
        TheX = "<div>" +
          CurX +
          ": " +
          parseFloat(d[CurX]).toLocaleString("en") +
          "</div>";
      }
      
      return TheState + TheX + TheY;
    });
  svg.call(toolTip);


  // Min & Max

  function XMinMax() {
    
    XMin = d3.min(theData, function(d) {
      return parseFloat(d[CurX]) * 0.90;
    });

    XMax = d3.max(theData, function(d) {
      return parseFloat(d[CurX]) * 1.10;
    });
  }

  
  function YMinMax() {
    
    YMin = d3.min(theData, function(d) {
      return parseFloat(d[CurY]) * 0.90;
    });

    YMax = d3.max(theData, function(d) {
      return parseFloat(d[CurY]) * 1.10;
    });
  }

  
  function labelChange(axis, clickedText) {
    d3
      .selectAll(".aText")
      .filter("." + axis)
      .filter(".active")
      .classed("active", false)
      .classed("inactive", true);

    
    clickedText.classed("inactive", false).classed("active", true);
  }

  XMinMax();
  YMinMax();

  
  // Circle placement
  var xScale = d3
    .scaleLinear()
    .domain([XMin, XMax])
    .range([margin + LabelArea, width - margin]);
  var YScale = d3
    .scaleLinear()
    .domain([YMin, YMax])
    
    .range([height - margin - LabelArea, margin]);

  
  var XAxis = d3.axisBottom(xScale);
  var YAxis = d3.axisLeft(YScale);

  // X and Y tick counts
  function tickCount() {
    if (width <= 500) {
      XAxis.ticks(5);
      YAxis.ticks(5);
    }
    else {
      XAxis.ticks(10);
      YAxis.ticks(10);
    }
  }
  tickCount();

  
  svg
    .append("g")
    .call(XAxis)
    .attr("class", "xAxis")
    .attr("transform", "translate(0," + (height - margin - LabelArea) + ")");
  svg
    .append("g")
    .call(YAxis)
    .attr("class", "yAxis")
    .attr("transform", "translate(" + (margin + LabelArea) + ", 0)");

  
  var Circles = svg.selectAll("g theCircles").data(theData).enter();

  
  Circles
    .append("circle")
    .attr("CX", function(d) {
      return xScale(d[CurX]);
    })
    .attr("CY", function(d) {
      return YScale(d[CurY]);
    })
    .attr("r", CircleRadius)
    .attr("class", function(d) {
      return "stateCircle " + d.abbr;
    })
    
    .on("mouseover", function(d) {
      toolTip.show(d, this);
      
      d3.select(this).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      
      toolTip.hide(d);
      d3.select(this).style("stroke", "#e3e3e3");
    });

  
  Circles
    .append("text")
    
    .text(function(d) {
      return d.abbr;
    })
  
    .attr("DX", function(d) {
      return xScale(d[CurX]);
    })
    .attr("DY", function(d) {
      

      return YScale(d[CurY]) + CircleRadius / 2.5;
    })
    .attr("font-size", CircleRadius)
    .attr("class", "stateText")
    
    .on("mouseover", function(d) {
      toolTip.show(d);
      
      d3.select("." + d.abbr).style("stroke", "#323232");
    })
    .on("mouseout", function(d) {
      
      toolTip.hide(d);
      d3.select("." + d.abbr).style("stroke", "#e3e3e3");
    });

  // Dynamics
  d3.selectAll(".aText").on("click", function() {
    var self = d3.select(this);

    
    if (self.classed("inactive")) {
      
      var axis = self.attr("data-axis");
      var Name = self.attr("data-name");

      
      if (axis === "x") {
        CurX = Name;
        XMinMax();

        
        xScale.domain([XMin, XMax]);
        svg.select(".xAxis").transition().duration(300).call(XAxis);

        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cx", function(d) {
              return xScale(d[CurX]);
            })
            .duration(300);
        });

        
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dx", function(d) {
              return xScale(d[CurX]);
            })
            .duration(200);
        });

        
        labelChange(axis, self);
      }
      else {
        CurY = Name;


        YMinMax();
        YScale.domain([YMin, YMax]);

        // Updating the Y axis
        svg.select(".yAxis").transition().duration(300).call(YAxis);

        
        d3.selectAll("circle").each(function() {
          d3
            .select(this)
            .transition()
            .attr("cy", function(d) {
              return YScale(d[CurY]);
            })
            .duration(300);
        });

        
        d3.selectAll(".stateText").each(function() {
          d3
            .select(this)
            .transition()
            .attr("dy", function(d) {
              return YScale(d[CurY]) + CircleRadius / 4;
            })
            .duration(300);
        });

        labelChange(axis, self);
      }
    }
  });

 
  d3.select(window).on("resize", resize);
  function resize() {
 
    width = parseInt(d3.select("#scatter").style("width"));
    height = width - width / 3.9;
    LeftYText = (height + LabelArea) / 2 - LabelArea;

    svg.attr("width", width).attr("height", height);

    // Change XScale and YScale ranges
    xScale.range([margin + LabelArea, width - margin]);
    YScale.range([height - margin - LabelArea, margin]);

  
    svg
      .select(".xAxis")
      .call(XAxis)
      .attr("transform", "translate(0," + (height - margin - LabelArea) + ")");

    svg.select(".yAxis").call(YAxis);
    tickCount();

    // Upodate label
    XTextRefresh();
    YTextRefresh();

    // Update radius
    crGet();

    
    d3
      .selectAll("circle")
      .attr("cy", function(d) {
        return YScale(d[CurY]);
      })
      .attr("cx", function(d) {
        return xScale(d[CurX]);
      })
      .attr("r", function() {
        return CircleRadius;
      });

    
  }
}
