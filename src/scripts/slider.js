// Load dataset from JSON file
const dataFilePath = '../dataset/International_Report.json';

// Define dataset and initialize variables
let dataset = [];
let years = [];

// Load data from JSON file
d3.json(dataFilePath, function(error, data) {
  if (error) {
    console.error('Error loading data:', error);
    return;
  }

  if (data && data.routes) {
    dataset = data.routes.map(route => ({
      year: route.year,
      month: route.month,
      US_state: route.US_state,
      FG_state: route.FG_state,
      flights: route.flights,
      passengers: route.passengers
    }));
  } else {
    console.error('Invalid data format');
    return;
  }

  // Extract unique years and months
  years = [...new Set(dataset.map(d => d.year))];
  months = [...new Set(dataset.map(d => d.month))];

  // Create sliders and initialize chart
  createSliders();
  filterData(years[0], months[0]);
});

// Create sliders
function createSliders() {
  // Year Slider
  const yearSlider = d3.select("body")
    .append("div")
    .style("margin", "20px 0");

  yearSlider.append("label")
    .text("Year: ")
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", years.length - 1)
    .attr("value", 0)
    .on("input", function() {
      const selectedYear = years[this.value];
      filterData(selectedYear, months[0]);
    });

  // Month Slider
  const monthSlider = d3.select("body")
    .append("div")
    .style("margin", "20px 0");

  monthSlider.append("label")
    .text("Month: ")
    .append("input")
    .attr("type", "range")
    .attr("min", 0)
    .attr("max", months.length - 1)
    .attr("value", 0)
    .on("input", function() {
      const selectedMonth = months[this.value];
      filterData(years[0], selectedMonth);
    });
}

// Filter function
function filterData(selectedYear, selectedMonth) {
  const filteredData = dataset.filter(d => d.year === selectedYear && d.month === selectedMonth);
  updateChart(filteredData);
}

// Update chart function
function updateChart(filteredData) {
  svg.selectAll("circle").remove();

  svg.selectAll("circle")
    .data(filteredData)
    .enter()
    .append("circle")
    .attr("cx", (d, i) => i * 50 + 50)
    .attr("cy", height / 2)
    .attr("r", 10)
    .attr("fill", "blue")
    .append("title")
    .text(d => `${d.US_state} to ${d.FG_state}, Passengers: ${d.passengers}, Flights: ${d.flights}`);
}