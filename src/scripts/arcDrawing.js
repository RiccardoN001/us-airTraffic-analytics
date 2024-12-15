let availableColors = [
    "#6B8E23", // Olive Green
    "#4682B4", // Steel Blue
    "#D2B48C", // Tan
    "#708090", // Slate Gray
    "#8FBC8F", // Dark Sea Green
    "#B0C4DE", // Light Steel Blue
    "#A0522D", // Sienna
    "#C0C0C0"  // Silver
  ];
  
let usedColors = [];
  
function assignColor() {
    if (availableColors.length > 0) {
        const color = availableColors.pop(); // Prendi un colore disponibile
        usedColors.push(color); // Sposta il colore nella lista dei colori usati
        return color;
}

// Fallback: se i colori sono esauriti, ritorna un colore di default
console.warn("No more colors available!");
return "#000000"; // Nero come fallback
}
  

function releaseColor(color) {
    const index = usedColors.indexOf(color);
    if (index > -1) {
        usedColors.splice(index, 1); // Rimuovi il colore dai colori usati
        availableColors.push(color); // Aggiungilo ai colori disponibili
    }
}
  
  


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

//GRAFIC FUNCTIONS FOR ARCS
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
        .attr("class", `arc-${source.properties.NAME.replace(/\s+/g, '-')}`);
}


function drawConnections(selectedState, selectedStatesArray, usaData, worldData, routes) {
    // Aggiungi lo stato selezionato all'array
    selectedStatesArray.push(selectedState);
  
    // Evidenzia lo stato selezionato
    selectedState.attr("fill", "red");
  
    // Recupera anno e mese selezionati
    const selectedYear = document.getElementById("yearSlider").value;
    const selectedMonth = document.getElementById("monthSlider").value;
  
    // Trova la sorgente nello stato selezionato
    const source = usaData.features.find(
      (d) => d.properties.NAME === selectedState.data()[0].properties.NAME
    );
  
    if (!source) {
      console.error("Source state not found in usaData.");
      return;
    }

    const arcColor = assignColor();
  
    // Filtra le rotte per anno, mese e stato sorgente
    const degree = routes.filter(
      (route) =>
        route.year == selectedYear &&
        route.month == selectedMonth &&
        route.US_state === source.properties.NAME
    );

    // Calcola il minimo e il massimo dei passeggeri
    const minPassengers = d3.min(degree, d => d.passengers);
    const maxPassengers = d3.max(degree, d => d.passengers);

    // Definisci una scala di colori
    const colorScale = d3.scaleLinear()
    .domain([minPassengers, maxPassengers]) // Range di valori di passeggeri
    .range(["#c6f5ca", "#1b5e20"]); // Verde chiaro -> Verde scuro


    degree.forEach((route) => {
        const target = worldData.features.find(
          (d) => d.properties.name === route.FG_state
        );
      
        if (!target) {
          console.warn(`Target state ${route.FG_state} not found in worldData.`);
          return;
        }
      
        console.log(
          "Target:",
          target.properties.name,
          "Source:",
          source.properties.NAME,
          "Passengers:",
          route.passengers
        );
      
        // Calcola il colore in base al numero di passeggeri
        const arcColor = colorScale(route.passengers);
      
        // Disegna l'arco
        drawArc(source, target, arcColor);
    });
  }

function reRaiseArcs() {
    svg.selectAll("[class^='arc-']").raise();
}
