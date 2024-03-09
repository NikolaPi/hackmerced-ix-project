getFoodData(document.getElementById('season-selector').value, true);
document.getElementById('season-selector').onchange = () => {
    console.log("selection changed");
    getFoodData(document.getElementById('season-selector').value, true);
};