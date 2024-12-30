%% International Air Traffic Visualization
% This project is a web-based visualization tool designed to explore 
% international air traffic between U.S. states and foreign countries. 
% It uses the D3.js library to create interactive and dynamic visualizations. 
% Users can interact with the map to analyze passenger and flight data over time, 
% using various tools and controls.

%% Project Overview
% * *arcDrawing.js*: Handles the drawing of arcs that represent connections 
% between U.S. states and foreign countries, with customization for curvature 
% and interactivity.
% * *colormap.js*: Manages the creation and updating of colormaps to represent 
% data values visually.
% * *map.js*: Initializes and renders the world and U.S. maps, sets up zooming, 
% panning, and general map interactions.
% * *radioButtons.js*: Creates and manages radio button controls for toggling 
% between passenger and flight data views.
% * *selectionButtons.js*: Provides functionality for "Select All" and 
% "Deselect All" actions on U.S. states.
% * *slider.js*: Implements sliders to filter data by year and month, 
% with dynamic updates to the visualization.
% * *tooltips.js*: Adds tooltips to display additional information when hovering 
% over map elements.
% * *zoomHandler.js*: Controls zooming and panning functionality, 
% including predefined zoom regions like the U.S. mainland.
% * *data_cleaner.py*: A preprocessing script written in Python to clean, merge, 
% and format the raw datasets for visualization. It generates the final JSON file 
% used in the visualization.

%% How to Use
% Clone the repository and serve the project using a simple HTTP server to 
% explore the interactive features of the map visualization.
