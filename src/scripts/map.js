// Ottieni larghezza e altezza del contenitore
let width = document.querySelector(".responsive-svg-container").clientWidth;
let height = document.querySelector(".responsive-svg-container").clientHeight;

// Crea l'SVG
const svg = d3
    .select("#map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid black");

// Definisci la proiezione centrata sull'America
let projection = d3
    .geoMercator()
    .scale(width / 6)
    .translate([width / 2, height / 2 + 120]) // Trasla la mappa al centro del contenitore e leggermente verso l'alto
    .rotate([100, 0]); // Ruota di 100 gradi longitudine verso est

// Crea un path generator
const path = d3.geoPath().projection(projection);

// Funzione per il comportamento di zoom e trascinamento
function zoomed(event) {
    const { transform } = event;
    svg.selectAll("path").attr("transform", transform);
}

// Funzione per il panning continuo orizzontale e spanning verticale simulato
function continuousPan(event) {
    const dx = event.dx;
    const dy = event.dy;

    // Calcola nuova rotazione per il panning orizzontale
    const rotate = projection.rotate();
    rotate[0] += dx / 4; // Movimento orizzontale continuo
    projection.rotate(rotate);

    // Calcola nuova traslazione per lo spanning verticale
    const translate = projection.translate();
    let newY = translate[1] + dy;

    // Limita lo spanning verticale
    const maxVertical = height / 2 + 200;
    const minVertical = height / 2 - 200;
    newY = Math.max(minVertical, Math.min(maxVertical, newY));

    projection.translate([translate[0], newY]);
    svg.selectAll("path").attr("d", path);
}

// Carica i dati GeoJSON per la mappa del mondo
d3.json("../dataset/world-states.geojson.json")
    .then((data) => {
        // Disegna la mappa
        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#b3cde0")
            .attr("stroke", "#03396c")
            .attr("stroke-width", 0.5);
    })
    .catch((error) =>
        console.error("Errore nel caricamento dei dati del mondo:", error)
    );

//dati fittizi per gli stati US
const fakeData = {
    "Alabama": Math.random() * 100,
    "Alaska": Math.random() * 100,
    "Arizona": Math.random() * 100,
    "Arkansas": Math.random() * 100,
    "California": Math.random() * 100,
    "Colorado": Math.random() * 100,
    "Connecticut": Math.random() * 100,
    "Delaware": Math.random() * 100,
    "Florida": Math.random() * 100,
    "Georgia": Math.random() * 100,
    "Hawaii": Math.random() * 100,
    "Idaho": Math.random() * 100,
    "Illinois": Math.random() * 100,
    "Indiana": Math.random() * 100,
    "Iowa": Math.random() * 100,
    "Kansas": Math.random() * 100,
    "Kentucky": Math.random() * 100,
    "Louisiana": Math.random() * 100,
    "Maine": Math.random() * 100,
    "Maryland": Math.random() * 100,
    "Massachusetts": Math.random() * 100,
    "Michigan": Math.random() * 100,
    "Minnesota": Math.random() * 100,
    "Mississippi": Math.random() * 100,
    "Missouri": Math.random() * 100,
    "Montana": Math.random() * 100,
    "Nebraska": Math.random() * 100,
    "Nevada": Math.random() * 100,
    "New Hampshire": Math.random() * 100,
    "New Jersey": Math.random() * 100,
    "New Mexico": Math.random() * 100,
    "New York": Math.random() * 100,
    "North Carolina": Math.random() * 100,
    "North Dakota": Math.random() * 100,
    "Ohio": Math.random() * 100,
    "Oklahoma": Math.random() * 100,
    "Oregon": Math.random() * 100,
    "Pennsylvania": Math.random() * 100,
    "Rhode Island": Math.random() * 100,
    "South Carolina": Math.random() * 100,
    "South Dakota": Math.random() * 100,
    "Tennessee": Math.random() * 100,
    "Texas": Math.random() * 100,
    "Utah": Math.random() * 100,
    "Vermont": Math.random() * 100,
    "Virginia": Math.random() * 100,
    "Washington": Math.random() * 100,
    "West Virginia": Math.random() * 100,
    "Wisconsin": Math.random() * 100,
    "Wyoming": Math.random() * 100
};

// Scala di colori
const colorScale = d3.scaleSequential()
    .domain([0, 100]) // Intervallo dati
    .interpolator(d3.interpolateBlues);


let selectedStatesArray = new Array();

// Carica i dati GeoJSON per i confini degli stati US
d3.json("../dataset/us-states.geojson.json")
    .then((data) => {
        // Disegna i confini degli stati US
        svg.selectAll(".us-states")
            .data(data.features)
            .enter()
            .append("path")
            .attr("class", "us-states")
            .attr("d", path)
            .attr("fill", (d) => {
                const stateName = d.properties.NAME; // Nome corretto dallo stato
                const value = fakeData[stateName]; // Valore associato
            
                let fillColor = "white"; // Colore di default
            
                if (value !== undefined && value !== null) {
                    fillColor = colorScale(value); // Applica il colore dalla scala
                }
            
                return fillColor;
            })            
            .attr("stroke", "#03396c")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                let stateMouseOver = d3.select(this);

                if(!selectedStatesArray.some(state => state.node() === stateMouseOver.node()) && selectedStatesArray.length != 0){
                    stateMouseOver.raise().attr("fill", "#f08080");
                }
                else{
                    stateMouseOver.raise().attr("stroke-width", 1);
                }
            })
            .on("mouseout", function(event, d) {
                let stateMouseOut = d3.select(this);
            
                if(!selectedStatesArray.some(state => state.node() === stateMouseOut.node()) && selectedStatesArray.length != 0){
                    stateMouseOut.attr("fill", "#b3cde0"); // ripristina colore originale
                }
                else{
                    //ripristina stroke-width di default
                    stateMouseOut.attr("stroke-width", 0.5);
                }
            })
            .on("click", function(event, d) {
                // Seleziona lo stato cliccato
                const selectedState = d3.select(this);

                if(selectedStatesArray.length == 0){
                    //disattiva chropleth map
                    svg.selectAll(".us-states").attr("fill", "#b3cde0");
                }

                if(selectedStatesArray.some(state => state.node() === selectedState.node())){
                    // Rimuovi lo stato dall'array
                    selectedStatesArray = selectedStatesArray.filter(state => state.node() !== selectedState.node());

                    // Ripristina il colore originale
                    selectedState.attr("fill", "#b3cde0");

                    console.log(selectedStatesArray.length);

                    if(selectedStatesArray.lenght == 0){
                        console.log("nessuno stato selezionato");
                        //ripristina choropleth map
                        svg.selectAll(".us-states")
                            .attr("fill", (d) => {
                                const stateName = d.properties.NAME; // Nome corretto dallo stato
                                const value = fakeData[stateName]; // Valore associato
                            
                                let fillColor = "white"; // Colore di default
                            
                                if (value != undefined && value != null) {
                                    fillColor = colorScale(value); // Applica il colore dalla scala
                                }
                            
                                return fillColor;
                            })
                    }
                } 
                else {
                    selectedStatesArray.push(selectedState);

                    // Verifica se lo stato è già evidenziato
                    const currentFill = selectedState.style("fill");
                    selectedState.attr("fill", "red");
                }
            });
          
            svg.call(d3.drag().on("drag", continuousPan));

            // Aggiungi il comportamento di zoom
            svg.call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoomed));
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
