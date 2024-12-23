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


// proiezione centrata sull'america
let projection = d3.geoMercator()
    .scale(width / 6)
    .translate([width / 2, height / 2 + 120])
    .rotate([100, 0]);

const path = d3.geoPath().projection(projection);

const zoom = d3.zoom()
    .scaleExtent([1, 8]) // definisci limiti
    .translateExtent([
        [-width /42.5 , -height / 3],
        [width + width / 42.5, height + height / 2]
    ])
    .on("zoom", (event) => {
        svg.selectAll("path").attr("transform", event.transform);
        svg.selectAll("circle").attr("transform", event.transform);
        svg.selectAll("[class^='arc-']").attr("transform", event.transform);
    });

svg.call(zoom);


//stati eliminati dalla lista dei problematici: Vietnam, Norway, Philippines, Japan
const problematicStates = new Set([
    "The Bahamas", "Fiji", "France", "Haiti",
    "Indonesia", "Israel", "Malaysia",
     "Solomon Islands", "Croatia"
]);


const colorContinent = {
    "Africa": "rgb(228, 186, 15)",
    "Asia": "rgb(35, 192, 14)",
    "Europe": "rgb(232, 14, 14)",
    "North America": "rgb(18, 124, 222)",
    "Oceania": "rgb(172, 35, 218)",
    "South America": "rgb(228, 111, 15)",
};

const tooltip = createTooltip();

function getTooltip(){
    return tooltip;
}


let worldData = null;
let usaData = null;
var states = new Array();
var routes = new Array();
let selectedStatesArray = new Array();
let selectedTimeDegrees = {};
let maxPassengers = 0;
let minPassengers = 0;
let maxFlights = 0;
let minFlights = 0;

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

    zoomToAmerica();

    //disegna la mappa del mondo
    svg.selectAll("path")
        .data(worldData.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#b2cddf")
        .attr("stroke", (d) => colorContinent[d.properties.continent] || "black")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            const stateName = d.properties.name;
            showTooltip(tooltip, event, `<strong>${stateName}</strong>`);  
        })
        .on("mousemove", function(event) {
            tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", function(event, d) {
            hideTooltip(tooltip);
        });

    svg.selectAll("circle")
        .data(worldData.features)
        .enter().append("circle")
        .attr("cx", d => projection(getValidCentroid(d))[0])
        .attr("cy", d => projection(getValidCentroid(d))[1])
        .attr("r", 0)
        .attr("fill", "red");


    // disegna i confini degli stati US
    svg.selectAll(".us-states")
        .data(usaData.features)
        .enter()
        .append("path")
        .attr("class", "us-states")
        .attr("d", path)
        .attr("fill", (d) => {
            const stateName = d.properties.NAME;
            const value = selectedTimeDegrees[stateName];
            let fillColor = "white";
            if (value !== undefined && value !== null) {
                fillColor = colorScale(value);
            }
            return fillColor;
        })            
        .attr("stroke", "#03396c")
        .attr("stroke-width", 0.5)
        .on("mouseover", function(event, d) {
            let stateMouseOver = d3.select(this);
            const stateName = d.properties.NAME;
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
            tooltip.style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY + 10}px`);
        })
        .on("mouseout", function(event, d) {
            let stateMouseOut = d3.select(this);
            hideTooltip(tooltip);
            
            if(!selectedStatesArray.some(state => state.node() === stateMouseOut.node()) && selectedStatesArray.length != 0){
                stateMouseOut.attr("fill", "#b3cde0");
            }
            else{
                stateMouseOut.attr("stroke-width", 0.5);
            }
        })
        .on("click", function(event, d) {
            const selectedState = d3.select(this);

            if(selectedStatesArray.length == 0){
                svg.selectAll(".us-states").attr("fill", "#b3cde0");
                document.getElementById("color-bar").style.background = "linear-gradient(to right, #fcbaa1, #67000d)";
                zoomOutWorld();
            }

            if(selectedStatesArray.some(state => state.node() === selectedState.node())){
                selectedStatesArray = selectedStatesArray.filter(state => state.node() !== selectedState.node());

                selectedState.attr("fill", "#b3cde0");
                selectedState.attr("stroke-width", 0.5);

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
            .attr("r", 0);
    })
    .catch((error) =>
        console.error("Errore nel caricamento dei dati del mondo:", error)
    );

function calculateDegrees() {
    let selectedYear = document.getElementById("yearSlider").value;
    let selectedMonth = document.getElementById("monthSlider").value;

    degree = routes.filter((route) => route.year == selectedYear && route.month == selectedMonth);

    degree = degree.reduce((acc, { US_state, FG_state }) => {
        // aggiunge lo stato collegato al set associato allo stato americano
        acc[US_state] = acc[US_state] || new Set();
        acc[US_state].add(FG_state);
        return acc;
    }, {}); 

    selectedTimeDegrees = Object.fromEntries(
        Object.entries(degree).map(([state, degree]) => [state, degree.size])
    );

    //normalizza i gradi di collegamento
    let maxValue = Math.max(...Object.values(selectedTimeDegrees));
    /*
    //scala sequenziale logaritmica
    const colorScale = d3.scaleSequentialLog()
        .domain([1, maxValue])
        .interpolator(d3.interpolateBlues);
    updateColorBar(0, Math.max(...Object.values(selectedTimeDegrees)), d3.scaleLog().domain([0, maxValue]).range(["#FFFFFF, #08306b"]));
    */
    const logScale = d3.scaleLog()
    .domain([1, maxValue])
    .range([0, 1]); 
    colorScale = t => {
        if (t === 0) return d3.interpolateBlues(0); // Mappa 0 al colore più chiaro
        return d3.interpolateBlues(logScale(Math.max(t, 1))); // Usa il logaritmo per i valori ≥ 1
    };
    updateColorBar(0, maxValue, t => (t === 0 ? " #FFFFFF" : colorScale(t))); // FARLA COSI E' PIU' CORRETTO

    svg.selectAll(".us-states")
        .attr("fill", (d) => {
            const stateName = d.properties.NAME;
            const value = selectedTimeDegrees[stateName];
        
            let fillColor = "white";
        
            if (value != undefined && value != null) {
                fillColor = colorScale(value);
            }
        
            return fillColor;
        });
    /*
    console.log("Degrees:", selectedTimeDegrees);
    console.log("Number of elements:", Object.keys(selectedTimeDegrees).length);
    console.log("Degree massimo:", Math.max(...Object.values(selectedTimeDegrees)));
    */
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
                // aggiunge lo stato collegato al set associato allo stato americano
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

function calculateMaxPassengersAndFlights() {
    let selectedYear = document.getElementById("yearSlider").value;
    let selectedMonth = document.getElementById("monthSlider").value;

    let filteredRoutes = routes.filter(route => 
        route.year == selectedYear && 
        route.month == selectedMonth
    );

    let maxPassengersTemp = d3.max(filteredRoutes, d => d.passengers);
    let minPassengersTemp = d3.min(filteredRoutes, d => d.passengers);

    let maxFlightsTemp = d3.max(filteredRoutes, d => d.flights);
    let minFlightsTemp = d3.min(filteredRoutes, d => d.flights);

    maxFlights = maxFlightsTemp;
    minFlights = minFlightsTemp;
    maxPassengers = maxPassengersTemp;
    minPassengers = minPassengersTemp;
}