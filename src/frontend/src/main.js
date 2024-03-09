var appState = {
    foodData: undefined,
    tableSize: 0,
    foodLock: true
};

function getFoodData(seasonString) {
    const httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            newFoodData = JSON.parse(httpReq.responseText);
            if(appState.tableSize !== newFoodData.size) {
                document.getElementById('customer-table-body').innerHTML = "";
                createTable(Object.keys(newFoodData).length);
                updateTable(newFoodData);
                appState.foodData = newFoodData;
            }
        }
    };

    params = "season=" + seasonString;
    httpReq.open("GET", "/listItems?" + params, true);
    httpReq.send();
}

function sendOrder(uuid, quantity) {
    const httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function () {
        if(this.readyState == 4 && this.status == 200) {
            resObj = JSON.parse(httpReq.responseText);
            alert(`You purchased ${quantity}lbs of ${appState.foodData[uuid].name} at ${appState.foodData[uuid].price}/lb for a total of ${appState.foodData[uuid].price * quantity}. Your order ID is ${resObj.orderId}`)
        }
    }

    httpReq.open("POST", "/order", true);
    httpReq.setRequestHeader("Content-Type", "application/json");
    reqObj = {
        'food_uuid': uuid,
        'quantity': quantity,
        'season': document.getElementById('season-selector').value
    };
    httpReq.send(JSON.stringify(reqObj));
}

function createTable(foodCount) {
    htmlChunk = "";
    for(i = 0; i < foodCount; i++) {
        const tableRowTemplate = 
        `<tr id="row-${i}">
            <td class="food-name">a</td>
            <td class="price">b</td>
            <td class="water-eff">c</td>
            <td class="land-eff">d</td>
            <td class="composite-eff">e</td>
            <td class="order">
                <button class="order-button">Order</button>
            </td>
        </tr>`;

        htmlChunk += tableRowTemplate;
    }

    document.getElementById("customer-table-body").innerHTML = htmlChunk;
}

function buttonOrder(uuid) {
    foodName = appState.foodData[uuid].name;
    foodPrice = appState.foodData[uuid].price;
    buyQuantity = prompt(`you've indicated that you'd like to buy ${foodName}. How many lbs of them would you like to buy, at approximately $${foodPrice} per lb?`);
    if(!buyQuantity) {
        return;
    }
    if(isNaN(buyQuantity)) {
        alert("We're sorry, we couldn't understand that. Please enter a positive integer next time.");
        return;
    }

    confirmation = confirm(`You've requested ${buyQuantity} lbs of ${foodName} at $${foodPrice}/lb, estimated to cost $${buyQuantity*foodPrice}. Would you like to place this order?`);
    if(confirmation) {
        sendOrder(uuid, buyQuantity);
    } else {
        alert("You've canceled your order.")
    }
}

function updateTable(foodData) {
    tableRows = document.getElementById("customer-table-body").getElementsByTagName('tr');
    var keys = Object.keys(foodData);
    for(i = 0; i < keys.length; i++) {
        console.log(i);
        tableRows[i].getElementsByClassName('food-name')[0].innerText = foodData[keys[i]].name;
        tableRows[i].getElementsByClassName('price')[0].innerText = foodData[keys[i]].price;
        tableRows[i].getElementsByClassName('water-eff')[0].innerText = foodData[keys[i]].water_usage;
        tableRows[i].getElementsByClassName('land-eff')[0].innerText = Math.round(100000000000 / foodData[keys[i]].land_usage)/100;
        tableRows[i].getElementsByClassName('composite-eff')[0].innerText = foodData[keys[i]].water_usage + foodData[keys[i]].land_usage/1000;
        tableRows[i].getElementsByClassName('order')[0].getElementsByClassName('order-button')[0].setAttribute("onClick", `javascript: buttonOrder("${keys[i]}");`)
    }
}

getFoodData(document.getElementById('season-selector').value);
document.getElementById('season-selector').onchange = () => {
    console.log("selection changed");
    getFoodData(document.getElementById('season-selector').value);
};