d3.json("../../dataset/International_Report.json").then(function(jsonData) {
    const states = jsonData.nodes;
    const routes = jsonData.edges;

    // Seleziona il contenitore responsivo
    const mapContainer = document.querySelector(".responsive-svg-container");

    const createSliderContainer = () => {
        // Rimuove il contenitore precedente se esiste
        const existingSliderContainer = document.getElementById("slider-container");
        if (existingSliderContainer) {
            existingSliderContainer.remove();
        }

        const containerHeight = mapContainer.clientHeight;
        const containerWidth = mapContainer.clientWidth;

        // Calcola la posizione della slidebar a destra del container
        const sliderContainer = document.createElement("div");
        sliderContainer.id = "slider-container";
        sliderContainer.style.position = "absolute";
        sliderContainer.style.top = "0";
        sliderContainer.style.right = "0";
        sliderContainer.style.height = `${containerHeight / 2}px`;
        sliderContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
        sliderContainer.style.display = "flex";
        sliderContainer.style.flexDirection = "row"; // Posiziona i contenitori orizzontalmente
        sliderContainer.style.alignItems = "center";
        sliderContainer.style.justifyContent = "space-around";
        document.body.appendChild(sliderContainer);

        // Funzione per creare uno slider con due label (sopra e sotto)
        const createSliderWithLabels = (id, min, max, topLabelText, bottomLabelText) => {
            const sliderWrapper = document.createElement("div");
            sliderWrapper.style.display = "flex"; // Layout flessibile
            sliderWrapper.style.flexDirection = "column"; // Layout verticale per il contenitore
            sliderWrapper.style.alignItems = "center"; // Allinea al centro
            sliderWrapper.style.width = `${sliderContainer.clientWidth / 2}px`; // Ogni slider occupa metà larghezza del contenitore padre
            sliderWrapper.style.height = `${sliderContainer.clientHeight}px`; // Occupa l'altezza totale del contenitore padre

            // Label superiore
            const topLabel = document.createElement("span");
            topLabel.textContent = topLabelText;
            topLabel.style.fontSize = "14px";
            topLabel.style.marginTop = "20px";

            //creo un contenitore singolo per ogni slider
            const singleSliderContainer = document.createElement("div");
            singleSliderContainer.style.display = "flex";
            singleSliderContainer.style.flexDirection = "column";
            singleSliderContainer.style.alignItems = "center";
            singleSliderContainer.style.justifyContent = "center";
            singleSliderContainer.style.width = "100%";
            singleSliderContainer.style.height = "70%";

            // Slider
            const slider = document.createElement("input");
            slider.type = "range";
            slider.min = min;
            slider.max = max;
            slider.id = id;
            slider.style.writingMode = "bt-lr"; // Modalità verticale
            slider.style.transform = "rotate(270deg)"; // Ruota per verticalità
            slider.style.width = `${containerHeight * 0.3}px`; // Adatta l'altezza al contenitore
            slider.style.background = "#ddd";
            slider.classList.add("vertical-slider");

            singleSliderContainer.appendChild(slider);

            // Label inferiore
            const bottomLabel = document.createElement("span");
            bottomLabel.textContent = bottomLabelText;
            bottomLabel.style.fontSize = "14px";
            if (bottomLabelText === "2020") {
                bottomLabel.id = "yearLabel";
            } else {
                bottomLabel.id = "monthLabel";
            }

            sliderWrapper.appendChild(topLabel);
            sliderWrapper.appendChild(singleSliderContainer);
            sliderWrapper.appendChild(bottomLabel);

            return sliderWrapper;
        };

        // Crea il primo slider con le sue label
        const yearSliderWrapper = createSliderWithLabels(
            "yearSlider",
            routes[0].year,
            routes[routes.length - 1].year,
            "Year",
            "2020"
        );

        // Crea il secondo slider con le sue label
        const monthSliderWrapper = createSliderWithLabels(
            "monthSlider",
            1,
            12,
            "Month",
            "Jan"
        );

        // Aggiungi i due contenitori al contenitore principale
        sliderContainer.appendChild(yearSliderWrapper);
        sliderContainer.appendChild(monthSliderWrapper);

        // Imposta il valore iniziale degli slider
        document.getElementById("yearSlider").value = 2020;
        document.getElementById("monthSlider").value = 1;

        // Aggiungi i listener agli slider
        document.getElementById("yearSlider").addEventListener("input", (e) => {
            console.log(`Anno selezionato: ${e.target.value}`);
            updateSliderLabels();

            if (selectedStatesArray.length == 0) {
                calculateDegrees();
            } else {
                drawConnections();
            }
        });

        document.getElementById("monthSlider").addEventListener("input", (e) => {
            console.log(`Mese selezionato: ${e.target.value}`);
            updateSliderLabels();

            if (selectedStatesArray.length == 0) {
                calculateDegrees();
            } else {
                drawConnections();
            }
        });
    };

    const createRadioButtonContainer = () => {
        // Rimuove il contenitore precedente se esiste
        const existingMiddleContainer = document.getElementById("middle-container");
        if (existingMiddleContainer) {
            existingMiddleContainer.remove();
        }

        const containerHeight = mapContainer.clientHeight;
        const containerWidth = mapContainer.clientWidth;

        // Crea il contenitore principale
        const middleContainer = document.createElement("div");
        middleContainer.id = "middle-container";
        middleContainer.style.position = "absolute";
        middleContainer.style.top = `${containerHeight / 2}px`;
        middleContainer.style.right = "0";
        middleContainer.style.height = `${containerHeight / 5}px`;
        middleContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
        middleContainer.style.display = "flex";
        middleContainer.style.alignItems = "center";
        middleContainer.style.justifyContent = "center";
        middleContainer.style.overflow = "hidden"; // Evita che gli elementi escano dal container
        middleContainer.style.boxSizing = "border-box"; // Considera padding e bordi nelle dimensioni totali

        // Crea il contenitore dei radio button
        const radioContainer = document.createElement("div");
        radioContainer.className = "radio-container";
        radioContainer.style.display = "flex";
        radioContainer.style.flexDirection = "row";
        radioContainer.style.justifyContent = "space-around";
        radioContainer.style.alignItems = "center";
        radioContainer.style.width = "100%"; // Adatta alla larghezza del contenitore
        radioContainer.style.height = "100%"; // Adatta all'altezza del contenitore
        radioContainer.style.boxSizing = "border-box";

        // Funzione per creare un radio button con etichetta
        const createRadioButton = (value, labelText, isChecked = false) => {
            const radioWrapper = document.createElement("div");
            radioWrapper.style.display = "flex";
            radioWrapper.style.alignItems = "center";
            radioWrapper.style.justifyContent = "center";
            radioWrapper.style.margin = "0 5px"; // Margine tra i radio button
            radioWrapper.style.flexShrink = "1"; // Adatta i radio button allo spazio disponibile

            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.name = "arcSelection";
            radioInput.id = `arcSelection-${value}`;
            radioInput.value = value;
            if (isChecked) {
                radioInput.checked = true; // Imposta la selezione predefinita
            }

            const label = document.createElement("label");
            label.htmlFor = radioInput.id;
            label.textContent = labelText;
            label.style.cursor = "pointer"; // Indica che è cliccabile
            label.style.padding = "0.5em 1em";
            label.style.margin = "0";
            label.style.border = "1px solid #ccc";
            label.style.borderRadius = "5px";
            label.style.backgroundColor = "#fff";
            label.style.transition = "background-color 0.3s, color 0.3s";

            if (isChecked) {
                label.style.backgroundColor = "#0043ed";
                label.style.color = "#fff";
            }

            // Effetto di selezione per il label
            radioInput.addEventListener("change", () => {
                document.querySelectorAll(`label[for^="arcSelection-"]`).forEach(l => {
                    l.style.backgroundColor = "#fff";
                    l.style.color = "#000";
                });
                label.style.backgroundColor = "#0043ed";
                label.style.color = "#fff";
            });

            label.addEventListener("mouseover", () => {
                if (!radioInput.checked) {
                    label.style.backgroundColor = "#f0f0f0";
                }
            });
            label.addEventListener("mouseout", () => {
                if (!radioInput.checked) {
                    label.style.backgroundColor = "#fff";
                }
            });

            // Aggiunge radio button e label al wrapper
            radioWrapper.appendChild(radioInput);
            radioWrapper.appendChild(label);

            return radioWrapper;
        };

        // Aggiunge i radio button
        radioContainer.appendChild(createRadioButton("passengers", "Passengers", true));
        radioContainer.appendChild(createRadioButton("flights", "Flights"));
        radioContainer.appendChild(createRadioButton("allView", "None"));

        // Aggiunge il contenitore dei radio button al contenitore principale
        middleContainer.appendChild(radioContainer);
        document.body.appendChild(middleContainer);

        document.querySelectorAll('input[name="arcSelection"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                console.log(`Opzione selezionata: ${e.target.value}`);
                drawConnections();
            });
        });
    };

    const createColormapContainer = () => {
        // Rimuove il contenitore precedente se esiste
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
        lowerContainer.style.height = `${containerHeight / 8}px`; // Occupa 1/8 dell'altezza
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
        colormapContainer.style.width = "90%"; // Occupa quasi tutta la larghezza disponibile

        // Barra della colormap (con estremi arrotondati)
        const colorBar = document.createElement("div");
        colorBar.id = "color-bar";
        colorBar.style.width = "100%";
        colorBar.style.height = "20px";
        colorBar.style.background = "linear-gradient(to right, #FFFFFF, #08306b)";
        colorBar.style.borderRadius = "10px"; // Estremi arrotondati
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

        // Aggiunge le etichette al contenitore
        labelContainer.appendChild(labelStart);
        labelContainer.appendChild(labelEnd);

        // Aggiunge la barra e le etichette al contenitore principale
        colormapContainer.appendChild(colorBar);
        colormapContainer.appendChild(labelContainer);

        // Aggiunge il contenitore principale al lowerContainer
        lowerContainer.appendChild(colormapContainer);

        // Aggiunge il lowerContainer al body
        document.body.appendChild(lowerContainer);
    };

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
        buttonsContainer.style.height = `${containerHeight / 8}px`; // Occupa 1/8 dell'altezza
        buttonsContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
        buttonsContainer.style.display = "flex";
        buttonsContainer.style.flexDirection = "row";
        buttonsContainer.style.alignItems = "center";
        buttonsContainer.style.justifyContent = "center";
        buttonsContainer.style.gap = "10px";
    
        // Crea il primo pulsante
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
    
        // Crea il secondo pulsante
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
    
        // Aggiunge il contenitore principale al body
        document.body.appendChild(buttonsContainer);
    };
    
    

    // Crea i contenitori inizialmente
    createSliderContainer();
    createRadioButtonContainer();
    createColormapContainer();
    createSelectionButtonsContainer();
    calculateDegrees();

    document.getElementById("button1").addEventListener("click", () => {
        let usStates = d3.selectAll(".us-states");
        usStates.each(function() {
            let state = d3.select(this);
            let stateName = state.attr("id");
            if (!getSelectedStatesArray().some(s => s.node() === state.node())) {
                addStateToSelectedArray(state);
            }            
        });
        updateColorBar(0, absoluteMaxConnections, d3.scaleLinear().domain([0, 1]).range(["#fcbaa1", "#67000d"]));
        drawConnections();
        zoomOutWorld();
    });

    document.getElementById("button2").addEventListener("click", () => {
        removeAllStatesFromSelectedArray();
        drawConnections();
        document.getElementById("color-bar").style.background = "linear-gradient(to right, #FFFFFF, #08306b)";
        calculateDegrees();
        zoomToAmerica();
    });

    // Aggiungi un listener per il ridimensionamento della finestra
    //window.addEventListener("resize", createSliderContainer);

}).catch(function(error) {
    console.error("Errore durante il caricamento dei dati JSON:", error);
});

function getSelectedArc() {
    const selectedRadio = document.querySelector('input[name="arcSelection"]:checked');
    return selectedRadio ? selectedRadio.value : null; // Restituisce il valore selezionato o null se nessuno è selezionato
}

console.log("Valore selezionato:", getSelectedArc());

// Funzione per aggiornare il valore delle label degli slider
function updateSliderLabels() {
    document.getElementById("yearLabel").textContent = document.getElementById("yearSlider").value;
    document.getElementById("monthLabel").textContent = getMonthName(document.getElementById("monthSlider").value);
}

function getMonthName(monthNumber) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[monthNumber - 1]; // Subtract 1 because arrays are 0-indexed
}

function updateColorBar(minValue, maxValue, colorScale) {
    const colorBar = document.getElementById("color-bar");
    colorBar.style.background = `linear-gradient(to right, ${colorScale(0)}, ${colorScale(1)}`;
    document.getElementById("labelStartColormap").textContent = minValue;
    document.getElementById("labelEndColormap").textContent = maxValue;
}