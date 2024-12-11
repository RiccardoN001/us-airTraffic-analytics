
// Ottieni larghezza e altezza del contenitore
let width = document.querySelector(".responsive-svg-container").clientWidth;
let height = document.querySelector(".responsive-svg-container").clientHeight;

const svg = d3
  .select("#map")
  .attr("viewBox", `0 0 ${width} ${height}`)
  .style("border", "1px solid black");


const projection = d3.geoMercator()
    .scale(width / 6) // Scala la mappa in base alla larghezza del contenitore
    .rotate([100, 0]) // Ruota di 100 gradi longitudine verso est
    .translate([width / 2, height / 2 +120]); // Trasla la mappa al centro del contenitore e leggermente verso l'alto
  
// Crea un path generator
const path = d3.geoPath().projection(projection);


// Carica i dati GeoJSON del mondo
// Carica i dati GeoJSON del mondo
d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .then(data => {
    // Disegna la mappa mondiale
    svg.selectAll(".world")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "world")
      .attr("d", path)
      .attr("fill", "#b3cde0")
      .attr("stroke", "#03396c")
      .attr("stroke-width", 0.5);
  })
  .catch(error => console.error("Errore nel caricamento dei dati mondiali:", error));

// Carica i dati GeoJSON degli stati americani
d3.json("../dataset/us-states.geojson.json")
  .then(data => {
    // Disegna la mappa degli stati americani
    svg.selectAll(".us-states")
      .data(data.features)
      .enter()
      .append("path")
      .attr("class", "us-states")
      .attr("d", path)
      .attr("fill", "#b3cde0")
      .attr("stroke", "#03396c")
      .attr("stroke-width", 0.5);
  })
  .catch(error => console.error("Errore nel caricamento dei dati degli stati americani:", error));



/*
// Map and projection (americocentric, without cuts)
var projection = d3.geoMercator()
    .scale(width / 6)
    .center([-98, 38])
    .rotate([100, 0]) // Rotazione per centrare l'America
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeBlues[7]);

// Create groups for the map layers
var worldGroup = svg.append("g").attr("class", "world");
var statesGroup = svg.append("g").attr("class", "us-states");

// Load external data and boot
d3.queue()
  .defer(d3.json, "../dataset/world-states.geojson.json") // Mappa mondiale
  .defer(d3.json, "../dataset/us-states.geojson.json") // Mappa degli stati USA
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); }) // Dati mondiali
  .await(ready);

function ready(error, world, usStates) {
  if (error) throw error;

function zoomToBoundingBox(group, bbox, scaleMultiplier = 1) {
    const [[x0, y0], [x1, y1]] = bbox;
    const widthBBox = x1 - x0;
    const heightBBox = y1 - y0;

    const scale = Math.min(width / widthBBox, height / heightBBox) * scaleMultiplier;
    const translate = [(width - scale * (x0 + x1)) / 2, (height - scale * (y0 + y1)) / 2];

    svg.transition()
    .duration(750)
    .call(zoom_handler.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

//[581.88 256.4319][972.2 528.75]

const usaBBox = [[900, 356], [2100, 500]];
zoomToBoundingBox(statesGroup, usaBBox, 1.5);

// Draw the world map
worldGroup.selectAll("path")
.data(world.features.filter(function(d) {
// Esclude gli Stati Uniti (supponendo che l'ID sia 'USA')
return d.id !== "USA";
}))
.enter()
.append("path")
.attr("d", path)
.attr("fill", function(d) {
d.total = data.get(d.id) || 0; //Colora in base alla popolazione
return colorScale(d.total);
})
.style("stroke", "transparent")
.attr("class", "Country")
.style("opacity", .8)
.on("mouseover", function(event, d) {
d3.select(this)
    .transition()
    .duration(200)
    .style("stroke-width", 1)
    .style("opacity", 1)
    .style("stroke", "black");
})
.on("mouseleave", function(event, d) {
d3.select(this)
    .transition()
    .duration(200)
    .style("stroke-width", 1)
    .style("opacity", .8)
    .style("stroke", "transparent");
});

// Draw the US states map
statesGroup.selectAll("path")
.data(usStates.features)
.enter()
.append("path")
.attr("d", path)
.attr("fill", function(d) {
d.total = data.get(d.properties.NAME) || 0; //TO-DO: Colora in base ai collegamenti
return colorScale(d.total);
})
.style("stroke", "transparent")
.attr("class", "State")
.style("opacity", .8)
.on("mouseover", function(event, d) {
d3.select(this)
    .transition()
    .duration(200)
    .style("stroke-width", 0.5)
    .style("opacity", 1)
    .style("stroke", "black");
})
.on("mouseleave", function(event, d) {
d3.select(this)
    .transition()
    .duration(200)
    .style("stroke-width", 0.5)
    .style("opacity", .8)
    .style("stroke", "transparent");
})
.on("click", function(event, d) {
    const selectedState = d3.select(this);

    // Verifica se lo stato è già evidenziato
    const currentFill = selectedState.style("fill");

    if (currentFill === "red") {
        // Se è evidenziato, ripristina il colore originale
        selectedState.style("fill", function(d) {
            d.total = data.get(d.properties.NAME) || 0;
            return colorScale(d.total);
        });

        // Verifica se non ci sono più stati rossi
        const anyRedState = statesGroup.selectAll(".State").filter(function() {
            return d3.select(this).style("fill") === "red";
        }).empty();

        // Se non ci sono più stati rossi, zooma sugli Stati Uniti
        if (anyRedState) {
            zoomToBoundingBox(worldGroup, usaBBox, 1);
        }
    } else {
        // Se non è evidenziato, colora di rosso
        selectedState.style("fill", "red");
        const worldBBox = [[550, 0], [2500, 1000]];
        zoomToBoundingBox(worldGroup, worldBBox, 1);
        console.log(worldBBox);

        // Se non ci sono stati rossi prima, esegui zoomToBoundingBox sugli USA
        const anyRedState = statesGroup.selectAll(".State").filter(function() {
            return d3.select(this).style("fill") === "red";
        }).empty();

        if (anyRedState) {
            zoomToBoundingBox(worldGroup, usaBBox, 1);
        }
    }
});



}

// Zoom handling
var zoom_handler = d3.zoom()
    .scaleExtent([1, 8])
    .on("zoom", zoom_actions);

zoom_handler(svg);

function zoom_actions() {
    worldGroup.attr("transform", d3.event.transform);
    statesGroup.attr("transform", d3.event.transform);
}
// Resize handling
window.addEventListener("resize", () => {
    width = window.innerWidth;
    height = window.innerHeight;
    svg.attr("width", width).attr("height", height);
    projection.translate([width / 2, height / 2]).scale(width / 6);
    worldGroup.selectAll("path").attr("d", path);
    statesGroup.selectAll("path").attr("d", path);
});

*/