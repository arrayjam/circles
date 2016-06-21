var tree = {
  id: "parent",
  children: [
    { id: "one", value: 9000, },
    { id: "two", value: 50000, },
    { id: "two", value: 13000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 1000, },
    { id: "two", value: 9000, },
  ]
};

var root = d3.hierarchy(tree)
    .sum(function(d) { return d.value; })
    .sort(function(a, b) { return b.value - a.value; })


console.log(tree, root);

function area2radius(area) {
  return Math.sqrt(area / Math.PI);
}

var radius = function(d) { return area2radius(d); };

var color = d3.scaleOrdinal(d3.schemeCategory10);
var angleForNextCircleArrangement = function(innerCircleRadius, outerCircleRadius) {
  var inner = 2 * innerCircleRadius * innerCircleRadius;

  var result = Math.acos((inner - (outerCircleRadius * outerCircleRadius)) / inner);

  console.log("outerCircleRadius: ", outerCircleRadius, "result: ", result);
  return result;
};

var angleForNextCircleArrangement2Radius = function(innerCircleRadiusA, innerCircleRadiusB, outerCircleRadius) {
  var result = Math.acos(((innerCircleRadiusA * innerCircleRadiusA) + (innerCircleRadiusB * innerCircleRadiusB) - (outerCircleRadius * outerCircleRadius)) / (2 * innerCircleRadiusA * innerCircleRadiusB))

  console.log("outerCircleRadius: ", outerCircleRadius, "result: ", result);
  return result;
};

var angleForCircleArrangment = function(innerCircleRadius, currentOuterWidth, previousOuterWidth, cumulativeTheta) {
  var newTheta = angleForNextCircleArrangement2Radius(innerCircleRadius + currentOuterWidth, innerCircleRadius + previousOuterWidth, currentOuterWidth + previousOuterWidth);
  console.log("cumulativeTheta: ", cumulativeTheta, "newTheta: ", newTheta);
  return cumulativeTheta + newTheta;
};

var width = 960,
    height = 960;

var svg = d3.selection().append("svg")
    .attr("width", width)
    .attr("height", height);

var innerCircleRadius = null;
console.log("innerCircleRadius: ", innerCircleRadius);

var zoom = d3.zoom()
    .scaleExtent([1 / 2, 10])
    .on("zoom", zoomed);

var zoomTarget = svg.append("rect")
    .attr("width", width)
    .attr("height", height)
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mousemove", mousemove)
    .call(zoom);

var zoomedGroup = svg.append("g")
    .style("pointer-events", "none");

var rootCircle = zoomedGroup.append("circle").datum(root)
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", function(d) { return innerCircleRadius = radius(d.value); });


var g = zoomedGroup.append("g").datum(root)
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

var zoomEvent = null;

function zoomed() {
  zoomedGroup.attr("transform", zoomEvent = d3.event.transform);
  var mouse = d3.mouse(zoomedGroup.node());
  // console.log(d3.event, zoomEvent, zoomEvent.invert(mouse));
  var pos = zoomEvent.invert(mouse);
  var k = zoomEvent.k;
  var r = +rootCircle.attr("r");
  var x = +rootCircle.attr("cx");
  var y = +rootCircle.attr("cy");
  console.log(r, k, r/k);

  if ((pos[0] > x - r) &&
      (pos[0] < x + r) &&
      (pos[1] > y - r) &&
      (pos[1] < y + r) &&
      (r / k < r)) {
    rootCircle.style("fill", "red");
  } else {
    rootCircle.style("fill", "black");
  }

}

function mousemove() {
  // if (zoomEvent) console.log(d3.event, zoomEvent.invert([d3.event.x, d3.event.y]), d3.event.x, d3.event.y);
}

var previousCircleTheta = 0;
var previousOuterWidth = 0;

root.children.forEach(function(circle, i) {
  var r = radius(circle.value);
  var out = innerCircleRadius + r;

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

zoomedGroup.append("circle").datum(root)
    .attr("stroke", "red")
    .attr("fill", "none")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", function(d) { return innerCircleRadius = radius(d.value); });
