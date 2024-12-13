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

const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Limita il livello di zoom
    .translateExtent([
        [-width /42.5 , -height / 3],  // Estendi i limiti a sinistra e sopra
        [width + width / 42.5, height + height / 2]  // Estendi i limiti a destra e sotto
    ])
    .on("zoom", (event) => {
        svg.selectAll("path").attr("transform", event.transform);
        svg.selectAll("circle").attr("transform", event.transform);  // Trasforma i nodi
    });
    

// Stati problematici
//stati eliminati dalla lista: Vietnam, Norway, Philippines, Japan
const problematicStates = new Set([
    "The Bahamas", "Fiji", "France", "Haiti",
    "Indonesia", "Israel", "Malaysia",
     "Solomon Islands", "Croatia"
]);

// Funzione per calcolare il bounding box del pezzo più grande
function getLargestPolygonBounds(feature) {
    if (feature.geometry.type === "Polygon") {
        return d3.geoBounds(feature);
    }

    let largestArea = 0;
    let largestBounds = [[Infinity, Infinity], [-Infinity, -Infinity]];

    if (feature.geometry.type === "MultiPolygon") {
        feature.geometry.coordinates.forEach(polygon => {
            const projectedPolygon = {
                type: "Polygon",
                coordinates: polygon
            };
            const bounds = d3.geoBounds(projectedPolygon);
            const area = d3.geoArea(projectedPolygon);

            if (area > largestArea) {
                largestArea = area;
                largestBounds = bounds;
            }
        });
    }

    return largestBounds;
}

// Funzione per calcolare un punto interno personalizzato
function getCustomPoint(feature) {
    const bounds = getLargestPolygonBounds(feature);
    return [
        (bounds[0][0] + bounds[1][0]) / 2,  // Media tra min e max long
        (bounds[0][1] + bounds[1][1]) / 2   // Media tra min e max lat
    ];
}

// Funzione aggiornata per calcolare centroidi validi
function getValidCentroid(feature) {
    let centroid = d3.geoCentroid(feature);

    // Controlla se il centroide è dentro lo stato
    if (d3.geoContains(feature, centroid)) {
        return centroid;
    }

    // Controlla se lo stato è problematico
    if (problematicStates.has(feature.properties.name)) {
        console.warn(`Centroide fuori stato per ${feature.properties.name}, uso punto personalizzato...`);
        return getCustomPoint(feature);
    }

    // Centroide non trovato
    console.warn(`Centroide fuori stato per ${feature.properties.name}`, centroid);
    return centroid;
}

/////////////////////////////////////////////CHOROPLETH MAP//////////////////////////////////////////////////////////////
// Carica i dati GeoJSON per la mappa del mondo

let worldData = null;
let usaData = null;

d3.json("../dataset/world-states.geojson.json")
    .then((data) => {
        worldData = data;
        // Disegna la mappa
        svg.selectAll("path")
            .data(data.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", "#b3cde0")
            .attr("stroke", "#03396c")
            .attr("stroke-width", 0.5);

        svg.selectAll("circle")
            .data(data.features)
            .enter().append("circle")
            .attr("cx", d => projection(getValidCentroid(d))[0])
            .attr("cy", d => projection(getValidCentroid(d))[1])
            .attr("r", 1)
            .attr("fill", "red")
            .attr("fill", d => problematicStates.has(d.properties.name) ? "blue" : "red");
    })
    .catch((error) =>
        console.error("Errore nel caricamento dei dati del mondo:", error)
    );


var states = new Array();
var routes = new Array();
d3.json("../../dataset/International_Report.json").then(function(jsonData) {
     states = jsonData.nodes;
     routes = jsonData.edges;
     //calculateDegrees(); // Call calculateDegrees after data is loaded
});

let selectedTimeDegrees = {};
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

    const selectedTimeDegrees = Object.fromEntries(
        Object.entries(degree).map(([state, degree]) => [state, degree.size])
    );

    const colorScale = d3.scaleSequential()
    .domain([0, Math.max(...Object.values(selectedTimeDegrees))/5]) // Intervallo dati
    .interpolator(d3.interpolateBlues);

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


let selectedStatesArray = new Array();

// Carica i dati GeoJSON per i confini degli stati US
d3.json("../dataset/us-states.geojson.json")
    .then((data) => {
        usaData = data;
        // Disegna i confini degli stati US
        svg.selectAll(".us-states")
            .data(data.features)
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

                if(!selectedStatesArray.some(state => state.node() === stateMouseOver.node()) && selectedStatesArray.length != 0){
                    stateMouseOver.raise().attr("fill", "#f08080");
                    reRaiseArcs();
                }
                else{
                    stateMouseOver.raise().attr("stroke-width", 1);
                    reRaiseArcs();
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
                    //zoom out world
                }

                if(selectedStatesArray.some(state => state.node() === selectedState.node())){
                    // Rimuovi lo stato dall'array
                    selectedStatesArray = selectedStatesArray.filter(state => state.node() !== selectedState.node());

                    // Ripristina il colore originale
                    selectedState.attr("fill", "#b3cde0");
                    selectedState.attr("stroke-width", 0.5);

                    console.log(selectedStatesArray.length);

                    if(selectedStatesArray.length == 0){
                        console.log("nessuno stato selezionato");
                        calculateDegrees();
                        //zoom in USA
                    }
                } 
                else {
                    selectedStatesArray.push(selectedState);

                    // Verifica se lo stato è già evidenziato
                    const currentFill = selectedState.style("fill");
                    selectedState.attr("fill", "red");                    

                }
            });
          
            svg.call(zoom);

            svg.selectAll(".us-nodes")
                .data(data.features)
                .enter()
                .append("circle")
                .attr("class", "us-nodes")
                .attr("cx", d => projection(getValidCentroid(d))[0])
                .attr("cy", d => projection(getValidCentroid(d))[1])
                .attr("r", 1)  // Valore del raggio aumentato per visibilità
                .attr("fill", d => problematicStates.has(d.properties.name) ? "blue" : "red");

            const california = usaData.features.find(d => d.properties.NAME === "California");
            const italy = worldData.features.find(d => d.properties.name === "Italy");
            const france = worldData.features.find(d => d.properties.name === "France");
            const brazil = worldData.features.find(d => d.properties.name === "Brazil");
            const Japan = worldData.features.find(d => d.properties.name === "Japan");
            const philippines = worldData.features.find(d => d.properties.name === "Philippines");
            
            drawArc(california, italy, "green");
            drawArc(california, france, "blue");
            drawArc(california, brazil, "red");
            drawArc(california, Japan, "yellow");
            drawArc(california, philippines, "purple");
        })
        .catch(error => console.error("Errore nel caricamento dei dati degli stati americani:", error));


function zoomToAmerica() {
    // Bounding box approssimativo dell'America
    const americaBounds = [[-170, 10], [-50, 75]]; // [Sud-Ovest, Nord-Est]
    const center = [
        (americaBounds[0][0] + americaBounds[1][0]) / 2, // Longitudine media
        (americaBounds[0][1] + americaBounds[1][1]) / 2  // Latitudine media
    ];

    // Calcola la scala e traslazione per centrare l'America
    const newScale = width / 2; // Scala per zoom sull'America
    const translateX = width / 2; // Centra orizzontalmente
    const translateY = height / 2; // Centra verticalmente

    // Usa la trasformazione di zoom per impostare il nuovo stato
    svg.transition()
        .duration(1000) // Durata della transizione
        .call(
            zoomBehavior.transform, // Applica la trasformazione
            d3.zoomIdentity
                .translate(translateX, translateY) // Traslazione
                .scale(newScale) // Scala
        );
}


function drawArc(source, target, color = "black") {
    // Controlla se gli stati sono nel dataset corretto
    const sourceCoords = source.properties.NAME 
        ? projection(getValidCentroid(source)) // Se è uno stato US
        : projection(getValidCentroid(source));

    const targetCoords = target.properties.name 
        ? projection(getValidCentroid(target)) // Se è uno stato estero
        : projection(getValidCentroid(target));

    svg.append("path")
        .datum({
            type: "LineString",
            coordinates: [
                getValidCentroid(source), 
                getValidCentroid(target)
            ]
        })
        .attr("d", d3.geoPath().projection(projection))
        .attr("fill", "none")
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("class", "arc");
}

function reRaiseArcs() {
    svg.selectAll(".arc").raise();
}