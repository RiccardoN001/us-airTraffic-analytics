const mapContainer = document.querySelector(".responsive-svg-container");

const createSliderContainer = () => {
    // Rimuove il contenitore precedente se esiste
    const existingSliderContainer = document.getElementById("slider-container");
    if (existingSliderContainer) {
        existingSliderContainer.remove();
    }

    const containerHeight = mapContainer.clientHeight;
    const containerWidth = mapContainer.clientWidth;

    //Il container viene calcolato in base all'altezza e alla larghezza del contenitore della mappa
    const sliderContainer = document.createElement("div");
    sliderContainer.id = "slider-container";
    sliderContainer.style.position = "absolute";
    sliderContainer.style.top = "0";
    sliderContainer.style.right = "0";
    sliderContainer.style.height = `${containerHeight / 2}px`;
    sliderContainer.style.width = `${document.body.clientWidth - containerWidth}px`;
    sliderContainer.style.display = "flex";
    sliderContainer.style.flexDirection = "row";
    sliderContainer.style.alignItems = "center";
    sliderContainer.style.justifyContent = "space-around";
    document.body.appendChild(sliderContainer);

    // Funzione per creare uno slider con due label (sopra e sotto)
    const createSliderWithLabels = (id, min, max, topLabelText, bottomLabelText) => {
        const sliderWrapper = document.createElement("div");
        sliderWrapper.style.display = "flex"; 
        sliderWrapper.style.flexDirection = "column";
        sliderWrapper.style.alignItems = "center"; 
        sliderWrapper.style.width = `${sliderContainer.clientWidth / 2}px`; 
        sliderWrapper.style.height = `${sliderContainer.clientHeight}px`; 

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

    // Slider per l'anno
    const yearSliderWrapper = createSliderWithLabels(
        "yearSlider",
        routes[0].year,
        routes[routes.length - 1].year,
        "Year",
        "2020"
    );

    // Slider per il mese
    const monthSliderWrapper = createSliderWithLabels(
        "monthSlider",
        1,
        12,
        "Month",
        "Jan"
    );

    sliderContainer.appendChild(yearSliderWrapper);
    sliderContainer.appendChild(monthSliderWrapper);

    // Imposta il valore iniziale degli slider
    document.getElementById("yearSlider").value = 2020;
    document.getElementById("monthSlider").value = 1;

    calculateMaxPassengersAndFlights();

    // Aggiungi i listener agli slider
    document.getElementById("yearSlider").addEventListener("input", (e) => {
        console.log(`Anno selezionato: ${e.target.value}`);
        const yearValue = parseInt(e.target.value);

        // Assicurati che il mese non superi marzo se l'anno è il 2020 (A causa del covid non ci sono voli registrati dopo marzo 2020)
        if (yearValue === 2020 && parseInt(document.getElementById("monthSlider").value) > 3) {
            document.getElementById("monthSlider").value = 3;
        }
        
        updateSliderLabels();

        if (selectedStatesArray.length == 0) {
            calculateDegrees();
        } else {
            calculateMaxPassengersAndFlights();
            drawConnections();
            updateForeignStateColors();
        }
    });

    document.getElementById("monthSlider").addEventListener("input", (e) => {
        console.log(`Mese selezionato: ${e.target.value}`);
        const monthValue = parseInt(e.target.value);

        // Assicurati che il mese non superi marzo se l'anno è il 2020 (A causa del covid non ci sono voli registrati dopo marzo 2020)
        if (parseInt(document.getElementById("yearSlider").value) === 2020 && monthValue > 3) {
            e.target.value = 3; 
        }
        updateSliderLabels();

        if (selectedStatesArray.length == 0) {
            calculateDegrees();
        } else {
            calculateMaxPassengersAndFlights();
            drawConnections();
            updateForeignStateColors();
        }
    });
};

// Funzione per aggiornare il valore delle label degli slider
function updateSliderLabels() {
    document.getElementById("yearLabel").textContent = document.getElementById("yearSlider").value;
    document.getElementById("monthLabel").textContent = getMonthName(document.getElementById("monthSlider").value);
}

// Funzione per ottenere il nome del mese in base al numero
function getMonthName(monthNumber) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[monthNumber - 1]; 
}
