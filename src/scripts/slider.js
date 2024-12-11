data = d3.json("../../dataset/International_Report.json")

data.then(function(jsonData) {
  const states = jsonData.nodes;
  const routes = jsonData.edges;

  console.log(states);
  console.log(routes);
});

// Seleziona il contenitore responsivo
const container = document.querySelector(".responsive-svg-container");
const containerHeight = container.clientHeight;
const containerWidth = container.clientWidth;

// Calcola la posizione della slidebar a destra del container
const sliderContainer = document.createElement("div");
sliderContainer.style.position = "absolute";
sliderContainer.style.top = "0";
sliderContainer.style.right = "0";
sliderContainer.style.height = `${containerHeight}px`;
sliderContainer.style.width = "50px"; // Larghezza della slidebar
sliderContainer.style.display = "flex";
sliderContainer.style.flexDirection = "column";
sliderContainer.style.alignItems = "center";
sliderContainer.style.justifyContent = "space-around";
//sliderContainer.style.backgroundColor = "#f0f0f0"; // Sfondo per evidenziare

// Crea la prima slidebar
const inputSlider1 = document.createElement("input");
inputSlider1.type = "range";
inputSlider1.min = "0";
inputSlider1.max = "100";
inputSlider1.value = "50";
inputSlider1.style.writingMode = "bt-lr"; // Modalità verticale
inputSlider1.style.transform = "rotate(270deg)"; // Ruota per verticalità
inputSlider1.style.width = `${containerHeight / 2 - 20}px`; // Adatta all'altezza del contenitore
inputSlider1.style.margin = "0";
//inputSlider1.style.background = "#ddd";
inputSlider1.classList.add("vertical-slider");

// Crea la seconda slidebar
const inputSlider2 = document.createElement("input");
inputSlider2.type = "range";
inputSlider2.min = "0";
inputSlider2.max = "100";
inputSlider2.value = "50";
inputSlider2.style.writingMode = "bt-lr"; // Modalità verticale
inputSlider2.style.transform = "rotate(270deg)"; // Ruota per verticalità
inputSlider2.style.width = `${containerHeight / 2 - 20}px`; // Adatta all'altezza del contenitore
inputSlider2.style.margin = "0";
//inputSlider2.style.background = "#ddd";
inputSlider2.classList.add("vertical-slider");

// Aggiungi gli slider al contenitore
sliderContainer.appendChild(inputSlider1);
sliderContainer.appendChild(inputSlider2);

// Aggiungi il contenitore della slidebar accanto alla mappa
document.body.appendChild(sliderContainer);

// Event Listener per la prima slidebar
inputSlider1.addEventListener("input", (e) => {
  console.log(`Valore Slider 1: ${e.target.value}`);
  // Aggiungi logica per aggiornare la mappa se necessario
});

// Event Listener per la seconda slidebar
inputSlider2.addEventListener("input", (e) => {
  console.log(`Valore Slider 2: ${e.target.value}`);
  // Aggiungi logica per aggiornare la mappa se necessario
});