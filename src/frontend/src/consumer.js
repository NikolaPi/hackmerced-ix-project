getFoodData(document.getElementById('season-selector').value, false);
document.getElementById('season-selector').onchange = () => {
    console.log("selection changed");
    getFoodData(document.getElementById('season-selector').value, false);
};