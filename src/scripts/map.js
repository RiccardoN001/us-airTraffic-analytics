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
    });

/////////////////////////////////////////////CHOROPLETH MAP//////////////////////////////////////////////////////////////
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