const mapContainer = document.querySelector(".responsive-svg-container");

const createSliderContainer = () => {
    // Rimuove il contenitore precedente se esiste
    const existingSliderContainer = document.getElementById("slider-container");
    if (existingSliderContainer) {
        existingSliderContainer.remove();
    }

    const containerHeight = mapContainer.clientHeight;
    const containerWidth = mapContainer.clientWidth;

    // Contenitore principale
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

    // Funzione per creare un wrapper slider con layout label-sopra-slider-label-sotto
    const createLabeledSlider = (id, upperLabelText, lowerLabelText, lowerLabelId) => {
        const wrapper = document.createElement("div");
        wrapper.className = "drbar-slider-container";
        wrapper.style.display = "flex";
        wrapper.style.flexDirection = "column";
        wrapper.style.alignItems = "center";
        wrapper.style.justifyContent = "space-between";
        wrapper.style.height = "100%";
        wrapper.style.width = "100%";

        // Label superiore
        const upperLabel = document.createElement("span");
        upperLabel.textContent = upperLabelText;

        // Contenitore dello slider
        const sliderDiv = document.createElement("div");
        sliderDiv.id = id;
        sliderDiv.style.height = "60%"; // Limita l'altezza dello slider
        sliderDiv.style.display = "flex";
        sliderDiv.style.justifyContent = "center";
        sliderDiv.style.alignItems = "center";

        // Label inferiore
        const lowerLabel = document.createElement("span");
        lowerLabel.textContent = lowerLabelText;
        lowerLabel.id = lowerLabelId; // Assegna un ID alla label inferiore

        // Assembla il layout
        wrapper.appendChild(upperLabel);
        wrapper.appendChild(sliderDiv);
        wrapper.appendChild(lowerLabel);

        return { wrapper, sliderDiv };
    };

    // Slider per l'anno (1990-2020)
    const { wrapper: yearWrapper, sliderDiv: yearSliderDiv } = createLabeledSlider(
        "year-slider",
        "Year Range",
        "1990 - 2020",
        "year-label"
    );
    sliderContainer.appendChild(yearWrapper);

    // Slider per il mese (Gen-Dic)
    const { wrapper: monthWrapper, sliderDiv: monthSliderDiv } = createLabeledSlider(
        "month-slider",
        "Month Range",
        "Jan - Dec",
        "month-label"
    );
    
    sliderContainer.appendChild(monthWrapper);

    // Inizializza gli slider DOPO aver aggiunto i div al DOM
    let yearSlider = new DualVRangeBar("year-slider", {
        lowerBound: 1990,
        upperBound: 2020,
        lower: 2020,
        upper: 2020,
        minSpan: 0,
        maxSpan: 0,
    });

    let monthSlider = new DualVRangeBar("month-slider", {
        lowerBound: 1,
        upperBound: 12,
        lower: 1,
        upper: 12,
        minSpan: 0,
    });

    updateFilteredAndAggregatedRoutes();
    

    // Funzione per aggiornare le etichette
    const updateLabels = () => {
        // Arrotonda i valori degli slider a interi
        yearSlider.lower = Math.round(yearSlider.lower);
        yearSlider.upper = Math.round(yearSlider.upper);
        monthSlider.lower = Math.round(monthSlider.lower);
        monthSlider.upper = Math.round(monthSlider.upper);

        // Aggiorna le etichette
        document.getElementById("year-label").textContent = `${yearSlider.lower} - ${yearSlider.upper}`;
        document.getElementById("month-label").textContent = `${getMonthName(monthSlider.lower)} - ${getMonthName(monthSlider.upper)}`;

    };

    yearSlider.addEventListener("update", () => {

        updateLabels();
        updateFilteredAndAggregatedRoutes();

        if (selectedStatesArray.length == 0) {
            calculateDegrees();
        } else {
            //calculateMaxPassengersAndFlights();
            drawConnections();
            updateForeignStateColors();
        }
    });

    monthSlider.addEventListener("update", () => {
        updateLabels();
        updateFilteredAndAggregatedRoutes();

        if (selectedStatesArray.length == 0) {
            calculateDegrees();
        } else {
            //calculateMaxPassengersAndFlights();
            drawConnections();
            updateForeignStateColors();
        }
    });

    // Funzione per ottenere il nome del mese
    function getMonthName(monthNumber) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months[monthNumber - 1];
    }
    // Funzione per ottenere il numero del mese dal nome
    function getMonthNumber(monthName) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(monthName) + 1;
    }
};

