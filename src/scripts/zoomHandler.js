function zoomToAmerica() {
 
    // escludi Alaska e Hawaii
    const mainlandUSFeatures = usaData.features.filter(
        d => !["Alaska", "Hawaii"].includes(d.properties.NAME)
    );

    // calcola i limiti geografici
    const pathGenerator = d3.geoPath().projection(projection);
    const usBounds = pathGenerator.bounds({
        type: "FeatureCollection",
        features: mainlandUSFeatures
    });

    const [[x0, y0], [x1, y1]] = usBounds;
    const offsetX = 100;  
    const offsetY = 75;  

    // calcola centro e scala
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(width / dx, height / dy) * 0.55;  // scala ridotta
    const translate = [
        width / 2 - scale * (x0 + x1) / 2 + offsetX,
        height / 2 - scale * (y0 + y1) / 2 + offsetY
    ];

    // applica lo zoom
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
    // definisco i bounds
    const x0 = 0;
    const y0 = 0;
    const x1 = width;
    const y1 = height;

    // calcola scala e traslazione per lo zoom out
    const dx = x1 - x0;
    const dy = y1 - y0;
    const scale = Math.min(width / dx, height / dy);
    const translate = [width / 2 - scale * (x0 + x1) / 2, height / 2 - scale * (y0 + y1) / 2];

    // applica zoom out
    svg.transition()
        .duration(1000)
        .call(
            zoom.transform,
            d3.zoomIdentity
                .translate(translate[0], translate[1])
                .scale(scale)
        );
}