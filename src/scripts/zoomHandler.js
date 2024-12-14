function zoomToAmerica() {
 
    // Escludi Alaska e Hawaii
    const mainlandUSFeatures = usaData.features.filter(
        d => !["Alaska", "Hawaii"].includes(d.properties.NAME)
    );

    // Calcola i limiti geografici
    const pathGenerator = d3.geoPath().projection(projection);
    const usBounds = pathGenerator.bounds({
        type: "FeatureCollection",
        features: mainlandUSFeatures
    });

    const [[x0, y0], [x1, y1]] = usBounds;
    const offsetX = 100;  
    const offsetY = 75;  

    // Calcola centro e scala
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(width / dx, height / dy) * 0.55;  // Scala ridotta
    const translate = [
        width / 2 - scale * (x0 + x1) / 2 + offsetX,
        height / 2 - scale * (y0 + y1) / 2 + offsetY
    ];

    // Applica lo zoom
    svg.transition()
        .duration(1000)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        );
}

function zoomOutWorld() {
    // Definisci i bounds per la vista globale
    const x0 = 0;
    const y0 = 0;
    const x1 = width;
    const y1 = height;

    // Calcola scala e traslazione per lo zoom out
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(width / dx, height / dy);
    const translate = [width / 2 - scale * (x0 + x1) / 2, height / 2 - scale * (y0 + y1) / 2];

    // Applica la trasformazione per lo zoom out
    svg.transition()
        .duration(1000)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        );
}