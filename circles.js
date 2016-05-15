var tree = {
  id: "parent",
  children: [
    { id: "one", value: 50000, },
    { id: "two", value: 1500, },
    { id: "three", value: 1300, },
    { id: "four", value: 15000, },
  ]
};

var root = d3.hierarchy(tree)
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.value - a.value; })


console.log(tree, root);

var margin = {
  top: 50,
  right: 50,
  bottom: 50,
  left: 50,
};

function area2radius(area) {
  return Math.sqrt(area / Math.PI);
}

var radius = function(d) { return area2radius(d); };

var color = d3.scaleCategory10();
var angleForNextCircleArrangement = function(innerCircleRadius, outerCircleRadius) {
  var inner = 2 * innerCircleRadius * innerCircleRadius;

  var result = Math.acos((inner - (outerCircleRadius * outerCircleRadius)) / inner);

  console.log("outerCircleRadius: ", outerCircleRadius, "result: ", result);
  return result;
};

var angleForCircleArrangment = function(innerCircleRadius, currentOuterWidth, previousOuterWidth, cumulativeTheta) {
  var newTheta = angleForNextCircleArrangement(innerCircleRadius, currentOuterWidth + previousOuterWidth);
  console.log("cumulativeTheta: ", cumulativeTheta, "newTheta: ", newTheta);
  return cumulativeTheta + newTheta;
};

var width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var svg = d3.selection().append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var innerCircleRadius = null;
svg.append("circle").datum(root)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", function(d) { return innerCircleRadius = radius(d.value); });

console.log("innerCircleRadius: ", innerCircleRadius);

var g = svg.append("g").datum(root)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var previousCircleTheta = 0;
var previousOuterWidth = 0;

root.children.forEach(function(circle, i) {
  var r = radius(circle.value);
  var out = innerCircleRadius;

  theta = null;
  if (i === 0) {
    theta = 0;
  } else {
    theta = angleForCircleArrangment(innerCircleRadius, r, previousOuterWidth, previousCircleTheta);
  }

  previousOuterWidth = r;
  previousCircleTheta = theta;

  var x = Math.cos(theta) * out;
  var y = -Math.sin(theta) * out;

  g.append("circle")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", r)
      .attr("fill", color(i));

  g.append("rect")
      .attr("width", 6)
      .attr("height", 6)
      .attr("x", x - 3)
      .attr("y", y - 3);

  g.append("line")
      .attr("x1", 0)
      .attr("y1", 0)
      .attr("x2", x)
      .attr("y2", y)
      .attr("stroke", color(i));
});

svg.append("circle").datum(root)
    .attr("stroke", "red")
    .attr("fill", "none")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", function(d) { return innerCircleRadius = radius(d.value); });
