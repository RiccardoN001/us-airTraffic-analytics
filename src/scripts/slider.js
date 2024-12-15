d3.json("../../dataset/International_Report.json").then(function(jsonData) {
  const states = jsonData.nodes;
  const routes = jsonData.edges;

  // Seleziona il contenitore responsivo
  const container = document.querySelector(".responsive-svg-container");

  const createSliderContainer = () => {
    // Rimuove il contenitore precedente se esiste
    const existingSliderContainer = document.getElementById("slider-container");
    if (existingSliderContainer) {
      existingSliderContainer.remove();
    }

    const containerHeight = container.clientHeight;
    const containerWidth = container.clientWidth;

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
      if(bottomLabelText === "2020") {
        bottomLabel.id = "yearLabel";
      }
      else {
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
      calculateDegrees();
      updateSliderLabels();
      svg.selectAll("[class^='arc-']").remove();

    });

    document.getElementById("monthSlider").addEventListener("input", (e) => {
      console.log(`Mese selezionato: ${e.target.value}`);
      calculateDegrees();
      updateSliderLabels();
      svg.selectAll("[class^='arc-']").remove();

    });
  };


  // Crea i contenitori inizialmente
  createSliderContainer();
  calculateDegrees();

  // Aggiungi un listener per il ridimensionamento della finestra
  window.addEventListener("resize", createSliderContainer);

}).catch(function(error) {
  console.error("Errore durante il caricamento dei dati JSON:", error);
});

// Funzione per aggiornare il valore delle label degli slider
function updateSliderLabels() {
  document.getElementById("yearLabel").textContent = document.getElementById("yearSlider").value;
  document.getElementById("monthLabel").textContent = getMonthName(document.getElementById("monthSlider").value);
}

function getMonthName(monthNumber) {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return months[monthNumber - 1]; // Subtract 1 because arrays are 0-indexed
}
