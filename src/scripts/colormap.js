const createColormapContainer = () => {
    
    const existingLowerContainer = document.getElementById("lower-container");
    if (existingLowerContainer) {
        existingLowerContainer.remove();
    }

    const containerHeight = mapContainer.clientHeight;
    const containerWidth = mapContainer.clientWidth;

    // Crea il contenitore principale
    const lowerContainer = document.createElement("div");
    lowerContainer.id = "lower-container";
    lowerContainer.style.position = "absolute";
    lowerContainer.style.top = `${containerHeight * (9 / 10)}px`;
    lowerContainer.style.right = "0";
    lowerContainer.style.height = `${containerHeight / 8}px`; 
    lowerContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
    lowerContainer.style.display = "flex";
    lowerContainer.style.flexDirection = "column";
    lowerContainer.style.alignItems = "center";
    lowerContainer.style.justifyContent = "center";

    // Contenitore per la colormap
    const colormapContainer = document.createElement("div");
    colormapContainer.id = "colormap-container";
    colormapContainer.style.display = "flex";
    colormapContainer.style.flexDirection = "column";
    colormapContainer.style.alignItems = "center";
    colormapContainer.style.width = "90%";

    // Barra della colormap (con estremi arrotondati)
    const colorBar = document.createElement("div");
    colorBar.id = "color-bar";
    colorBar.style.width = "100%";
    colorBar.style.height = "20px";
    colorBar.style.background = "linear-gradient(to right, #FFFFFF, #08306b)";
    colorBar.style.borderRadius = "10px"; 
    colorBar.style.border = "2px solid #ccc";

    // Contenitore per le etichette sotto la barra
    const labelContainer = document.createElement("div");
    labelContainer.style.display = "flex";
    labelContainer.style.justifyContent = "space-between";
    labelContainer.style.width = "100%";
    labelContainer.style.marginTop = "5px";

    // Etichetta iniziale (valore minimo)
    const labelStart = document.createElement("label");
    labelStart.textContent = "";
    labelStart.id = "labelStartColormap";
    labelStart.style.fontSize = "12px";
    labelStart.style.fontWeight = "bold";
    labelStart.style.color = "#333";

    // Etichetta finale (valore massimo)
    const labelEnd = document.createElement("label");
    labelEnd.textContent = "";
    labelEnd.id = "labelEndColormap";
    labelEnd.style.fontSize = "12px";
    labelEnd.style.fontWeight = "bold";
    labelEnd.style.color = "#333";

   
    labelContainer.appendChild(labelStart);
    labelContainer.appendChild(labelEnd);
    
    colormapContainer.appendChild(colorBar);
    colormapContainer.appendChild(labelContainer);

    lowerContainer.appendChild(colormapContainer);

    document.body.appendChild(lowerContainer);
};

function updateColorBar(minValue, maxValue, colorScale) {
    const colorBar = document.getElementById("color-bar");
    colorBar.style.background = `linear-gradient(to right, ${colorScale(0)}, ${colorScale(1)}`;
    document.getElementById("labelStartColormap").textContent = minValue;
    document.getElementById("labelEndColormap").textContent = maxValue;
}