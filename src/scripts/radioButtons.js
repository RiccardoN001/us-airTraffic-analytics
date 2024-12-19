const createRadioButtonContainer = () => {
    
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
    middleContainer.style.overflow = "hidden"; 
    middleContainer.style.boxSizing = "border-box"; 

    // Crea il contenitore dei radio button
    const radioContainer = document.createElement("div");
    radioContainer.className = "radio-container";
    radioContainer.style.display = "flex";
    radioContainer.style.flexDirection = "row";
    radioContainer.style.justifyContent = "space-around";
    radioContainer.style.alignItems = "center";
    radioContainer.style.width = "100%"; 
    radioContainer.style.height = "100%"; 
    radioContainer.style.boxSizing = "border-box";

    // Funzione per creare un radio button con etichetta
    const createRadioButton = (value, labelText, isChecked = false) => {
        const radioWrapper = document.createElement("div");
        radioWrapper.style.display = "flex";
        radioWrapper.style.alignItems = "center";
        radioWrapper.style.justifyContent = "center";
        radioWrapper.style.margin = "0 5px"; 
        radioWrapper.style.flexShrink = "1"; 

        const radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = "arcSelection";
        radioInput.id = `arcSelection-${value}`;
        radioInput.value = value;
        if (isChecked) {
            radioInput.checked = true;
        }

        const label = document.createElement("label");
        label.htmlFor = radioInput.id;
        label.textContent = labelText;
        label.style.cursor = "pointer";
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

        // Event Listener per il cambio di colore al passaggio del mouse
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