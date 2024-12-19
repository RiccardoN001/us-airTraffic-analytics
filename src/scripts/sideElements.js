d3.json("../../dataset/International_Report.json").then(function(jsonData) {
    const states = jsonData.nodes;
    const routes = jsonData.edges;
    
    // Inizializzazione dei side elements
    createSliderContainer();
    createRadioButtonContainer();
    createColormapContainer();
    createSelectionButtonsContainer();
    calculateDegrees();


}).catch(function(error) {
    console.error("Errore durante il caricamento dei dati JSON:", error);
});

function getSelectedArc() {
    const selectedRadio = document.querySelector('input[name="arcSelection"]:checked');
    return selectedRadio ? selectedRadio.value : null;
}
