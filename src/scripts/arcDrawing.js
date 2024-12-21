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
        const color = availableColors.pop(); // prendi un colore disponibile
        usedColors.push(color); // sposta il colore nella lista dei colori usati
        return color;
}

// se i colori sono esauriti, ritorna un colore di default
console.warn("No more colors available!");
return "#000000"; // nero come fallback
}
  

function releaseColor(color) {
    const index = usedColors.indexOf(color);
    if (index > -1) {
        usedColors.splice(index, 1); // rimuovi il colore dai colori usati
        availableColors.push(color); // aggiungilo ai colori disponibili
    }
}
  
// funzione per calcolare il bounding box del pezzo più grande
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

// funzione per calcolare un punto interno personalizzato
function getCustomPoint(feature) {
    const bounds = getLargestPolygonBounds(feature);
    return [
        (bounds[0][0] + bounds[1][0]) / 2,  // media tra min e max long
        (bounds[0][1] + bounds[1][1]) / 2   // media tra min e max lat
    ];
}

// funzione aggiornata per calcolare centroidi validi
function getValidCentroid(feature) {
    let centroid = d3.geoCentroid(feature);

    // controlla se il centroide è dentro lo stato
    if (d3.geoContains(feature, centroid)) {
        return centroid;
    }

    // controlla se lo stato è problematico
    if (problematicStates.has(feature.properties.name)) {
        //console.warn(`Centroide fuori stato per ${feature.properties.name}, uso punto personalizzato...`);
        return getCustomPoint(feature);
    }

    // centroide non trovato
    //console.warn(`Centroide fuori stato per ${feature.properties.name}`, centroid);
    return centroid;
}


function drawArc(source, target, color = "black", route) {
    const currentTransform = d3.zoomTransform(svg.node());

    const sourceCentroid = getValidCentroid(source);
    const targetCentroid = getValidCentroid(target);

    const projectedSource = projection(sourceCentroid);
    const projectedTarget = projection(targetCentroid);

    let isOutOfBounds = false;
    const coordinates = [sourceCentroid, targetCentroid];

    const pathNode = d3.geoPath().projection(projection)({
        type: "LineString",
        coordinates: coordinates
    });

    const tempPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    tempPath.setAttribute("d", pathNode);
    const pathLength = tempPath.getTotalLength();
    const midPoint = tempPath.getPointAtLength(pathLength / 2);

    if (midPoint.y < 0) {
        isOutOfBounds = true;
    }

    if (isOutOfBounds) {
        let data;

        if(projectedSource[0] < projectedTarget[0]) {
            if(source.properties.NAME === "Alaska") {
                data = [
                    { x: projectedSource[0], y: projectedSource[1] },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) * (1/6 * ((projectedTarget[0] - projectedSource[0]) / 600)), y: projectedSource[1] - ((projectedTarget[0] - projectedSource[0]) / 600) * 80 },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) / 2, y: projectedSource[1] - 155 },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) * (5/6 * ((projectedTarget[0] - projectedSource[0]) / 600)), y: projectedSource[1] - ((projectedTarget[0] - projectedSource[0]) / 600) * 80 },
                    { x: projectedTarget[0], y: projectedTarget[1] }
                ];  
            }
            else{
                data = [
                    { x: projectedSource[0], y: projectedSource[1] },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) * (1/6 * ((projectedTarget[0] - projectedSource[0]) / 600)), y: projectedSource[1] - ((projectedTarget[0] - projectedSource[0]) / 600) * 280 },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) / 2, y: projectedSource[1] - 355 },
                    { x: projectedSource[0] + (projectedTarget[0] - projectedSource[0]) * (5/6 * ((projectedTarget[0] - projectedSource[0]) / 600)), y: projectedSource[1] - ((projectedTarget[0] - projectedSource[0]) / 600) * 280 },
                    { x: projectedTarget[0], y: projectedTarget[1] }
                ];  
            }       
        } 
        else {
            data = [
                { x: projectedSource[0], y: projectedSource[1] },
                { x: (projectedSource[0] + projectedTarget[0]) * (4/5 * ((projectedSource[0] - projectedTarget[0]) / 600)), y: projectedSource[1] - ((projectedSource[0] - projectedTarget[0]) / 600) * 250 },
                { x: (projectedSource[0] + projectedTarget[0]) /2, y: projectedSource[1] - ((projectedSource[0] - projectedTarget[0]) / 600) * 350 },
                { x: (projectedSource[0] + projectedTarget[0]) * (1/5 * ((projectedSource[0] - projectedTarget[0]) / 600)), y: projectedSource[1] - ((projectedSource[0] - projectedTarget[0]) / 600) * 250 },
                { x: projectedTarget[0], y: projectedTarget[1] }
            ];
        }

        const line = d3.line()
            .x(d => d.x)
            .y(d => d.y)
            .curve(d3.curveBasis);

        svg.append("path")
            .attr("d", line(data))
            .attr("transform", currentTransform)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("opacity", 0.9)
            .attr("stroke-width", 1.5)
            .attr("class", `arc-${source.properties.NAME.replace(/\s+/g, '-')}`)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", 3)
                    .attr("stroke", "red") 
                    .attr("opacity", 1)
                    .raise();
                showTooltip(getTooltip(), event, `US State: <strong>${source.properties.NAME}</strong>
                    <br>Foreign State: <strong>${target.properties.name}</strong>
                    <br>Number of Passengers: ${route["passengers"]}<br>Number of Flights: ${route["flights"]}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0.9)
                    .attr("stroke", color); 
                hideTooltip(getTooltip());
            });
    } 
    else {
        svg.append("path")
            .datum({
                type: "LineString",
                coordinates: coordinates
            })
            .attr("d", d3.geoPath().projection(projection))
            .attr("transform", currentTransform)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("opacity", 0.9)
            .attr("stroke-width", 1.5)
            .attr("class", `arc-${source.properties.NAME.replace(/\s+/g, '-')}`)
            .on("mouseover", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", 3)
                    .attr("stroke", "red") 
                    .attr("opacity", 1)
                    .raise();
                showTooltip(getTooltip(), event, `US State: <strong>${source.properties.NAME}</strong>
                    <br>Foreign State: <strong>${target.properties.name}</strong>
                    <br>Number of Passengers: ${route["passengers"]}<br>Number of Flights: ${route["flights"]}`);
            })
            .on("mousemove", function(event) {
                tooltip.style("left", `${event.pageX + 10}px`)
                        .style("top", `${event.pageY + 10}px`);
            })
            .on("mouseout", function(event, d) {
                d3.select(this)
                    .attr("stroke-width", 1.5)
                    .attr("opacity", 0.9)
                    .attr("stroke", color); 
                hideTooltip(getTooltip());
            });
    }
}


function drawConnections() {
    // pulisce gli archi esistenti per evitare duplicati
    svg.selectAll("[class^='arc-']").remove();

    selectedStatesArray.forEach((selectedState) => {
        selectedState.attr("fill", "#4682B4");

        const selectedYear = document.getElementById("yearSlider").value;
        const selectedMonth = document.getElementById("monthSlider").value;

        
        const source = usaData.features.find(
            (d) => d.properties.NAME === selectedState.data()[0].properties.NAME
        );

        if (!source) {
            console.error("Source state not found in usaData.");
            return;
        }

        const degree = routes.filter(
            (route) =>
                route.year == selectedYear &&
                route.month == selectedMonth &&
                route.US_state === source.properties.NAME
        );

        const selectedArc = getSelectedArc();
        let colorScale, valueField;

        if (selectedArc === "passengers") {
            valueField = "passengers";
            d3.select("#lower-container").style("display", "block");
            colorScale = d3.scaleSequential(t => d3.interpolateReds(t + 0.2))
                           .domain([minPassengers, maxPassengers]);
            updateColorBar(minPassengers, maxPassengers, d3.scaleLinear().domain([0, 1]).range(["#fcbaa1", "#67000d"]));
        } 
        else if (selectedArc === "flights") {
            valueField = "flights";
            d3.select("#lower-container").style("display", "block");
            colorScale = d3.scaleSequential(t => d3.interpolateReds(t + 0.2))
                           .domain([minFlights, maxFlights]);
            updateColorBar(minFlights, maxFlights, d3.scaleLinear().domain([0, 1]).range(["#fcbaa1", "#67000d"]));
        }
        else {
            valueField = "static";
            colorScale = null;
            d3.select("#lower-container").style("display", "none");
        }

        degree.forEach((route) => {
            const target = worldData.features.find(
                (d) => d.properties.name === route.FG_state
            );

            if (!target) {
                console.warn(`Target state ${route.FG_state} not found in worldData.`);
                return;
            }

            let arcColor;

            if (valueField === "static") {
                arcColor = "#000000";
            } else {
                const routeValue = route[valueField];
                arcColor = colorScale ? colorScale(routeValue) : "#000000";
            }

            drawArc(source, target, arcColor, route);

            // contrassegna lo stato estero
            svg.selectAll("path")
                .filter((d) => d && d.properties && d.properties.name === route.FG_state)
                .attr("fill", "#4682B4");
        });
    });
}

function reRaiseArcs() {
    svg.selectAll("[class^='arc-']").raise();
}

function updateForeignStateColors() {
    // resetta il colore di tutti gli stati esteri
    svg.selectAll("path")
        .filter(d => d && d.properties && d.properties.name)
        .attr("fill", "#b2cddf");

    selectedStatesArray.forEach((selectedState) => {
        const source = usaData.features.find(
            d => d.properties.NAME === selectedState.data()[0].properties.NAME
        );

        const selectedYear = document.getElementById("yearSlider").value;
        const selectedMonth = document.getElementById("monthSlider").value;

        const connections = routes.filter(
            route => route.year == selectedYear && 
                     route.month == selectedMonth && 
                     route.US_state === source.properties.NAME
        );

        connections.forEach(route => {
            const target = worldData.features.find(
                d => d.properties.name === route.FG_state
            );

            if (target) {
                svg.selectAll("path")
                    .filter(d => d && d.properties && d.properties.name === route.FG_state)
                    .attr("fill", "#4682B4");
            }
        });
    });
}