const createSelectionButtonsContainer = () => {
    // Rimuove il contenitore precedente se esiste
    const existingButtonsContainer = document.getElementById("buttons-container");
    if (existingButtonsContainer) {
        existingButtonsContainer.remove();
    }

    const containerHeight = mapContainer.clientHeight;
    const containerWidth = mapContainer.clientWidth;

    // Crea il contenitore principale per i pulsanti
    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "buttons-container";
    buttonsContainer.style.position = "absolute";
    buttonsContainer.style.top = `${containerHeight * (6 / 8)}px`;
    buttonsContainer.style.right = "0";
    buttonsContainer.style.height = `${containerHeight / 8}px`;
    buttonsContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.flexDirection = "row";
    buttonsContainer.style.alignItems = "center";
    buttonsContainer.style.justifyContent = "center";
    buttonsContainer.style.gap = "10px";

    // Primo pulsante
    const button1 = document.createElement("button");
    button1.id = "button1";
    button1.textContent = "Select All US States";
    button1.style.padding = "12px 6px";
    button1.style.fontSize = "12px";
    button1.style.cursor = "pointer";
    button1.style.border = "1px solid #ccc";
    button1.style.borderRadius = "5px";
    button1.style.backgroundColor = "#f0f0f0";
    button1.addEventListener("mouseover", () => {
        button1.style.backgroundColor = "#d3d3d3";
    });
    button1.addEventListener("mouseout", () => {
        button1.style.backgroundColor = "#f0f0f0";
    });

    // Secondo pulsante
    const button2 = document.createElement("button");
    button2.id = "button2";
    button2.textContent = "Deselect All US States";
    button2.style.padding = "12px 6px";
    button2.style.marginRight = "10px";
    button2.style.fontSize = "12px";
    button2.style.cursor = "pointer";
    button2.style.border = "1px solid #ccc";
    button2.style.borderRadius = "5px";
    button2.style.backgroundColor = "#f0f0f0";
    button2.addEventListener("mouseover", () => {
        button2.style.backgroundColor = "#d3d3d3";
    });
    button2.addEventListener("mouseout", () => {
        button2.style.backgroundColor = "#f0f0f0";
    });

    // Aggiunge i pulsanti al contenitore principale
    buttonsContainer.appendChild(button1);
    buttonsContainer.appendChild(button2);

    document.body.appendChild(buttonsContainer);//aggiunta al body

    //Event Listener per i pulsanti
    document.getElementById("button1").addEventListener("click", () => {
        let usStates = d3.selectAll(".us-states");
        usStates.each(function() {
            let state = d3.select(this);
            let stateName = state.attr("id");
            if (!getSelectedStatesArray().some(s => s.node() === state.node())) {
                addStateToSelectedArray(state);
            }            
        });
        drawConnections();
        zoomOutWorld();
        updateForeignStateColors();
    });

    document.getElementById("button2").addEventListener("click", () => {
        removeAllStatesFromSelectedArray();
        drawConnections();
        document.getElementById("color-bar").style.background = "linear-gradient(to right, #FFFFFF, #08306b)";
        calculateDegrees();
        zoomToAmerica();
        updateForeignStateColors();
    });
};

