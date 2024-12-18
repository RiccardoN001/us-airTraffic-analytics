// Ottieni larghezza e altezza del contenitore
let width = document.querySelector(".responsive-svg-container").clientWidth;
let height = document.querySelector(".responsive-svg-container").clientHeight;

// Crea l'SVG
const svg = d3
    .select("#map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("border", "1px solid black");

svg.append("defs")
.append("clipPath")
.attr("id", "clip")
.append("rect")
.attr("x", 0)
.attr("y", 0)
.attr("width", width)
.attr("height", height);


// Definisci la proiezione centrata sull'America
let projection = d3.geoMercator()
    .scale(width / 6)
    .translate([width / 2, height / 2 + 120]) // Trasla la mappa al centro del contenitore e leggermente verso l'alto
    .rotate([100, 0]); // Ruota di 100 gradi longitudine verso est

// Crea un path generator
const path = d3.geoPath().projection(projection);

const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Limita il livello di zoom
    .translateExtent([
        [-width /42.5 , -height / 3],  // Estendi i limiti a sinistra e sopra
        [width + width / 42.5, height + height / 2]  // Estendi i limiti a destra e sotto
    ])
    .on("zoom", (event) => {
        svg.selectAll("path").attr("transform", event.transform);
        svg.selectAll("circle").attr("transform", event.transform);
        svg.selectAll("[class^='arc-']").attr("transform", event.transform);
    });

svg.call(zoom);

    

// Stati problematici
//stati eliminati dalla lista: Vietnam, Norway, Philippines, Japan
const problematicStates = new Set([
    "The Bahamas", "Fiji", "France", "Haiti",
    "Indonesia", "Israel", "Malaysia",
     "Solomon Islands", "Croatia"
]);

//crea un dizionario in cui associa ogni continente ad un colore
const colorContinent = {
    "Africa": "#9c635c",
    "Asia": "#acae89",
    "Europe": "#568864",
    "North America": "#609692",
    "Oceania": "#78868f",
    "South America": " #b68534",
};

const tooltip = createTooltip();

function getTooltip(){
    return tooltip;
}

/////////////////////////////////////////////CHOROPLETH MAP//////////////////////////////////////////////////////////////
// Carica i dati GeoJSON per la mappa del mondo

let worldData = null;
let usaData = null;
var states = new Array();
var routes = new Array();
let selectedStatesArray = new Array();
let selectedTimeDegrees = {};
let absoluteMaxPassengers = null;
let absoluteMinPassengers = null;
let absoluteMaxFlights = null;
let absoluteMinFlights = null;
let absoluteMaxConnections = null;


function getSelectedStatesArray(){
    return selectedStatesArray;
}

function addStateToSelectedArray(state){
    selectedStatesArray.push(state);
}

function removeAllStatesFromSelectedArray(){
    selectedStatesArray = [];
}

Promise.all([
    d3.json("../dataset/world-states.geojson.json"),
    d3.json("../dataset/us-states.geojson.json"),
    d3.json("../../dataset/International_Report.json")
]).then(([world, usa, reportData]) => {
    worldData = world;
    usaData = usa;
    states = reportData.nodes;
    routes = reportData.edges;

    absoluteMaxPassengers = d3.max(routes, d => d.passengers);
    absoluteMinPassengers = d3.min(routes, d => d.passengers);
    absoluteMaxFlights = d3.max(routes, d => d.flights);
    absoluteMinFlights = d3.min(routes, d => d.flights);
    absoluteMaxConnections = calculateMaxAbsoluteDegree();

    console.log("Max passengers:", absoluteMaxPassengers);
    console.log("Min passengers:", absoluteMinPassengers);
    console.log("Max flights:", absoluteMaxFlights);
    console.log("Min flights:", absoluteMinFlights);
    console.log("Max connections:", absoluteMaxConnections);


    // Chiama zoomToAmerica dopo aver confermato che usaData è pronto
    zoomToAmerica();

    // Disegna la mappa
    svg.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#b2cddf")
        .attr("stroke", (d) => colorContinent[d.properties.continent] || "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            let stateMouseOver = d3.select(this);

            const stateName = d.properties.name; // Nome dello stato
            showTooltip(tooltip, event, `<strong>${stateName}</strong>`);  
        })
        .on("mousemove", function(event) {
            // Mantieni il tooltip aggiornato con la posizione del mouse
            tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", function(event, d) {
            let stateMouseOut = d3.select(this);
            hideTooltip(tooltip);
        });

    svg.selectAll("circle")
        .data(worldData.features)
        .enter().append("circle")
        .attr("cx", d => projection(getValidCentroid(d))[0])
        .attr("cy", d => projection(getValidCentroid(d))[1])
        .attr("r", 0)       //porre uguale a 1 per debug
        .attr("fill", "red");
        //.attr("fill", d => problematicStates.has(d.properties.name) ? "blue" : "red");

    console.log(usaData.features);
    // Disegna i confini degli stati US
    svg.selectAll(".us-states")
        .data(usaData.features)
        .enter()
        .append("path")
        .attr("class", "us-states")
        .attr("d", path)
        .attr("fill", (d) => {
        const stateName = d.properties.NAME; // Nome corretto dallo stato
        const value = selectedTimeDegrees[stateName]; // Valore associato
        
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

            const stateName = d.properties.NAME; // Nome dello stato
            let degree = selectedTimeDegrees[stateName] == undefined ? 0 : selectedTimeDegrees[stateName];
            showTooltip(tooltip, event, `<strong>${stateName}</strong><br>Degree: ${degree}`);

            if(!selectedStatesArray.some(state => state.node() === stateMouseOver.node()) && selectedStatesArray.length != 0){
                stateMouseOver.raise().attr("fill", "#7CA8CA");
                reRaiseArcs();
            }
            else{
                stateMouseOver.raise().attr("stroke-width", 1);
                reRaiseArcs();
            }
        })
        .on("mousemove", function(event) {
        // Mantieni il tooltip aggiornato con la posizione del mouse
        tooltip.style("left", `${event.pageX + 10}px`)
                .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", function(event, d) {
        let stateMouseOut = d3.select(this);
        hideTooltip(tooltip);
        
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
                document.getElementById("color-bar").style.background = "linear-gradient(to right, #fcbaa1, #67000d)";
                zoomOutWorld();
            }

            if(selectedStatesArray.some(state => state.node() === selectedState.node())){
                // Rimuovi lo stato dall'array
                selectedStatesArray = selectedStatesArray.filter(state => state.node() !== selectedState.node());

                // Ripristina il colore originale
                selectedState.attr("fill", "#b3cde0");
                selectedState.attr("stroke-width", 0.5);

                // Rimuovi gli archi associati allo stato e ripristina i colori
                svg.selectAll(`.arc-${d.properties.NAME.replace(/\s+/g, '-')}`)
                    .each(function() {
                        const color = d3.select(this).attr("stroke");
                        releaseColor(color);
                    })
                    .remove();

                if(selectedStatesArray.length == 0){
                    document.getElementById("color-bar").style.background = "linear-gradient(to right, #FFFFFF, #08306b)";
                    calculateDegrees();
                    zoomToAmerica();
                }
            } 
            else {
                selectedStatesArray.push(selectedState);
                drawConnections(); 
            }            
            updateForeignStateColors();
            });
            
            svg.selectAll(".us-nodes")
                .data(usaData.features)
                .enter()
                .append("circle")
                .attr("class", "us-nodes")
                .attr("cx", d => projection(getValidCentroid(d))[0])
                .attr("cy", d => projection(getValidCentroid(d))[1])
                .attr("r", 0);    //porre uguale a 1 per debug
                //.attr("fill", d => problematicStates.has(d.properties.name) ? "blue" : "red");
        })
    .catch((error) =>
        console.error("Errore nel caricamento dei dati del mondo:", error)
    );

//Creazione dizionario con i gradi di collegamenti
function calculateDegrees() {
    let selectedYear = document.getElementById("yearSlider").value;
    let selectedMonth = document.getElementById("monthSlider").value;

    console.log("Selected Year:", selectedYear);
    console.log("Selected Month:", selectedMonth);

    degree = routes.filter((route) => route.year == selectedYear && route.month == selectedMonth);

    degree = degree.reduce((acc, { US_state, FG_state }) => {
        // Aggiunge lo stato collegato al set associato allo stato americano
        acc[US_state] = acc[US_state] || new Set();
        acc[US_state].add(FG_state);
        return acc;
    }, {}); 

    selectedTimeDegrees = Object.fromEntries(
        Object.entries(degree).map(([state, degree]) => [state, degree.size])
    );

    const colorScale = d3.scaleSequential()
    .domain([0, absoluteMaxConnections]) // Intervallo dati
    .interpolator(d3.interpolateBlues);
    updateColorBar(0, absoluteMaxConnections, d3.scaleLinear().domain([0, 1]).range(["#FFFFFF, #08306b"]));


    svg.selectAll(".us-states")
        .attr("fill", (d) => {
            const stateName = d.properties.NAME; // Nome corretto dallo stato
            const value = selectedTimeDegrees[stateName]; // Valore associato
        
            let fillColor = "white"; // Colore di default
        
            if (value != undefined && value != null) {
                fillColor = colorScale(value); // Applica il colore dalla scala
            }
        
            return fillColor;
        });
    console.log("Degrees:", selectedTimeDegrees);
    console.log("Number of elements:", Object.keys(selectedTimeDegrees).length);
    console.log("Degree massimo:", Math.max(...Object.values(selectedTimeDegrees)));
} 

function calculateMaxAbsoluteDegree(){
    //per ogni anno e per ogni mese calcola il grado massimo di collegamenti, e salva il massimo assoluto
    let absoluteMaxYears = d3.max(routes, d => d.year);
    let absoluteMinYears = d3.min(routes, d => d.year);
    let maxDegree = 0;
    for(let i = absoluteMinYears; i <= absoluteMaxYears; i++){
        for(let j = 1; j < 13; j++){
            let degree = routes.filter((route) => route.year == i && route.month == j);
            degree = degree.reduce((acc, { US_state, FG_state }) => {
                // Aggiunge lo stato collegato al set associato allo stato americano
                acc[US_state] = acc[US_state] || new Set();
                acc[US_state].add(FG_state);
                return acc;
            }, {}); 

            let selectedTimeDegrees = Object.fromEntries(
                Object.entries(degree).map(([state, degree]) => [state, degree.size])
            );

            let maxDegreeMonth = Math.max(...Object.values(selectedTimeDegrees));
            if(maxDegreeMonth > maxDegree){
                maxDegree = maxDegreeMonth;
            }
        }
    }
    return maxDegree;
}