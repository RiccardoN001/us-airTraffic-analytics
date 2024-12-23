function createTooltip() {
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("background-color", "rgba(0, 0, 0, 0.7)")
        .style("color", "#fff")
        .style("padding", "5px 10px")
        .style("border-radius", "5px")
        .style("pointer-events", "none")
        .style("opacity", 0);
    return tooltip;
}

function showTooltip(tooltip, event, content) {
    tooltip.html(content)
        .style("left", `${event.pageX + 10}px`)
        .style("top", `${event.pageY + 10}px`)
        .style("opacity", 1)
        .raise();
}

function hideTooltip(tooltip) {
    tooltip.style("opacity", 0);
}