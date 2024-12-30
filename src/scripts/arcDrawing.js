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
        selectedState.attr("fill", " rgb(64, 119, 164)"); // #36648B

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
            const logScale = d3.scaleLog()
                .domain([minPassengers, maxPassengers])
                .range([0, 1]);
            colorScale = t => d3.interpolateReds(logScale(t));
            updateColorBar(minPassengers, maxPassengers, colorScale);
        } 
        else if (selectedArc === "flights") {
            valueField = "flights";
            d3.select("#lower-container").style("display", "block");
            const logScale = d3.scaleLog()
                .domain([minFlights, maxFlights])
                .range([0, 1]);
            colorScale = t => d3.interpolateOranges(logScale(t));
            updateColorBar(minFlights, maxFlights, colorScale);
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
                arcColor = "#ab0e0e";
            } else {
                const routeValue = route[valueField];
                arcColor = colorScale ? colorScale(routeValue) : "#000000";
            }

            drawArc(source, target, arcColor, route);
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
                    .attr("fill", "#7AAFD4");
            }
        });
    });
}

function getSelectedArc() {
    const selectedRadio = document.querySelector('input[name="arcSelection"]:checked');
    return selectedRadio ? selectedRadio.value : null;
}