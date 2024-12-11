data = d3.json("../../dataset/International_Report.json")

data.then(function(jsonData) {
  const states = jsonData.nodes;
  const routes = jsonData.edges;

  console.log(states);
  console.log(routes);
});

