function createButtonContainer() {
    // Crea il contenitore per il pulsante
    const buttonContainer = document.createElement("div");
    buttonContainer.id = "button-container";
    buttonContainer.style.display = "flex";
    buttonContainer.style.justifyContent = "center";
    buttonContainer.style.marginTop = "10px";

    // Crea il pulsante
    const selectAllButton = document.createElement("button");
    selectAllButton.id = "selectAllButton";
    selectAllButton.textContent = "Select All States";

    // Aggiungi il pulsante al contenitore
    buttonContainer.appendChild(selectAllButton);

    // Aggiungi il contenitore direttamente nel body
    document.body.appendChild(buttonContainer);

    // Aggiungi l'event listener al pulsante
    selectAllButton.addEventListener("click", function () {
        if (selectedStatesArray.length === usaData.features.length) {
            // Deseleziona tutti gli stati
            selectedStatesArray = [];

            svg.selectAll(".us-states")
                .attr("fill", "#b3cde0")
                .attr("stroke-width", 0.5);

            svg.selectAll("[class^='arc-']").remove();

            // Aggiorna il testo del pulsante
            this.textContent = "Select All States";
        } else {
            // Seleziona tutti gli stati
            selectedStatesArray = svg.selectAll(".us-states")
                .nodes()
                .map(node => d3.select(node));

            svg.selectAll(".us-states")
                .attr("fill", "#4682B4")
                .attr("stroke-width", 1);

            // Disegna le connessioni per tutti gli stati selezionati
            selectedStatesArray.forEach(state => {
                drawConnections(state, selectedStatesArray, usaData, worldData, routes);
            });

            // Aggiorna il testo del pulsante
            this.textContent = "Deselect All States";
        }
    });
}

// Chiamata diretta
createButtonContainer();