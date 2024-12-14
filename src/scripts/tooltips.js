function createTooltip() {
    // Crea l'elemento del tooltip
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0); // Nascondi inizialmente il tooltip

    return tooltip;
}

function showTooltip(tooltip, event, content) {
    // Aggiorna il contenuto e la posizione del tooltip
    tooltip.html(content)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`)
        .style("opacity", 1); // Mostra il tooltip
}

function hideTooltip(tooltip) {
    // Nascondi il tooltip
    tooltip.style("opacity", 0);
}
