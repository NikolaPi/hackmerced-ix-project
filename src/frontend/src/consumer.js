appState.currentMode = false;

getFoodData(appState.currentMode, appState.currentMode);
document.getElementById('season-selector').onchange = () => {
    console.log("selection changed");
    getFoodData(document.getElementById('season-selector').value, appState.currentMode);
};

document.getElementById('mode-selector').onchange = () => {
    let currentMode = document.getElementById('mode-selector').value;
    if(currentMode === "consumer") {
        getFoodData(document.getElementById('season-selector').value, false);
        appState.currentMode = false;
    } else if(currentMode === "producer") {
        getFoodData(document.getElementById('season-selector').value, true);
        appState.currentMode = true;
    }
}