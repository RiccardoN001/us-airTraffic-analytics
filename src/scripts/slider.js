// Carica i dati JSON
d3.json("../../dataset/International_Report.json").then(function(jsonData) {
  const states = jsonData.nodes;
  const routes = jsonData.edges;

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
  sliderContainer.style.width = "70px"; // Larghezza della slidebar aumentata per includere le etichette
  sliderContainer.style.display = "flex";
  sliderContainer.style.flexDirection = "column";
  sliderContainer.style.alignItems = "center";
  sliderContainer.style.justifyContent = "space-around";
  //sliderContainer.style.backgroundColor = "#f0f0f0"; // Sfondo per evidenziare

  // Crea un contenitore per il primo slider e l'etichetta
  const slider1Container = document.createElement("div");
  slider1Container.style.display = "flex";
  slider1Container.style.flexDirection = "column";
  slider1Container.style.alignItems = "center";
  slider1Container.style.justifyContent = "center";
  slider1Container.style.marginBottom = "20px"; // Stacca il primo slider

  // Etichetta per il primo slider
  const label1 = document.createElement("div");
  label1.innerText = "";
  label1.style.marginBottom = "20px"; // Distanza dall'etichetta allo slider
  label1.style.fontSize = "12px";
  label1.style.textAlign = "center";
  slider1Container.appendChild(label1);

  // Crea la prima slidebar
  const inputSlider1 = document.createElement("input");
  inputSlider1.type = "range";
  inputSlider1.min = routes[0].year;
  inputSlider1.max = routes[routes.length - 1].year;
  inputSlider1.value = routes[routes.length - 1].year;
  inputSlider1.id = "yearSlider"; // Aggiungi l'id
  inputSlider1.style.writingMode = "bt-lr"; // Modalità verticale
  inputSlider1.style.transform = "rotate(270deg)"; // Ruota per verticalità
  inputSlider1.style.width = `${containerHeight / 2 - 20}px`; // Adatta all'altezza del contenitore
  inputSlider1.style.margin = "0";
  inputSlider1.style.background = "#ddd";
  inputSlider1.classList.add("vertical-slider");
  slider1Container.appendChild(inputSlider1);

  // Crea un contenitore per il secondo slider e l'etichetta
  const slider2Container = document.createElement("div");
  slider2Container.style.display = "flex";
  slider2Container.style.flexDirection = "column";
  slider2Container.style.alignItems = "center";
  slider2Container.style.justifyContent = "center";
  slider2Container.style.marginTop = "20px"; // Stacca il secondo slider

  // Etichetta per il secondo slider
  const label2 = document.createElement("div");
  label2.innerText = "";
  label2.style.marginBottom = "20px"; // Distanza dall'etichetta allo slider
  label2.style.fontSize = "12px";
  label2.style.textAlign = "center";
  slider2Container.appendChild(label2);

  // Crea la seconda slidebar
  const inputSlider2 = document.createElement("input");
  inputSlider2.type = "range";
  inputSlider2.min = 1;
  inputSlider2.max = 12;
  inputSlider2.value = 1;
  inputSlider2.id = "monthSlider"; // Aggiungi l'id
  inputSlider2.style.writingMode = "bt-lr"; // Modalità verticale
  inputSlider2.style.transform = "rotate(270deg)"; // Ruota per verticalità
  inputSlider2.style.width = `${containerHeight / 2 - 20}px`; // Adatta all'altezza del contenitore
  inputSlider2.style.margin = "0";
  inputSlider2.style.background = "#ddd";
  inputSlider2.classList.add("vertical-slider");
  slider2Container.appendChild(inputSlider2);

  // Aggiungi i contenitori degli slider al contenitore principale
  sliderContainer.appendChild(slider1Container);
  sliderContainer.appendChild(slider2Container);

  // Aggiungi il contenitore della slidebar accanto alla mappa
  document.body.appendChild(sliderContainer);

  // Imposta il valore iniziale dello slider
  document.getElementById("yearSlider").value = 2020;
  document.getElementById("monthSlider").value = 1;

  calculateDegrees();

  // Event Listener per la prima slidebar
  inputSlider1.addEventListener("input", (e) => {
    //console.log(`Anno selezionato: ${e.target.value}`);
    console.log(calculateDegrees());
    // Aggiungi logica per aggiornare la mappa se necessario
  });

  // Event Listener per la seconda slidebar
  inputSlider2.addEventListener("input", (e) => {
    //console.log(`Mese selezionato: ${e.target.value}`);
    console.log(calculateDegrees());
    // Aggiungi logica per aggiornare la mappa se necessario
  });

}).catch(function(error) {
  console.error("Errore durante il caricamento dei dati JSON:", error);
});