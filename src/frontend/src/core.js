var appState = {
    foodData: undefined,
    producerFoodData: undefined,
    tableSize: 0,
    foodLock: true,
    currentMode: 'consumer'
};

function getFoodData(seasonString, isProducer = false) {
    const httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let newFoodData = JSON.parse(httpReq.responseText);
            appState.foodData = newFoodData;

            if (appState.tableSize !== newFoodData.size && !isProducer) {
                document.getElementById('customer-table-body').innerHTML = "";
                createTable(Object.keys(appState.foodData).length);
                updateTable(appState.foodData, false);
            } else if (!isProducer) {
                updateTable(appState.foodData, false);
                return;
            } else {
                //If producer, gather more data before update
                const producerReq = new XMLHttpRequest();
                producerReq.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        let producerFoodData = JSON.parse(producerReq.responseText);
                        appState.producerFoodData = producerFoodData;

                        if(appState.tableSize !== producerFoodData.size) {
                            document.getElementById('customer-table-body').innerHTML = "";
                            createTable(Object.keys(appState.producerFoodData).length, true);
                            updateTable(appState.foodData, true);
                        } else {
                            updateTable(appState.foodData, true);
                        }
                    }
                }

                let params = "season=" + seasonString;
                producerReq.open("GET", "/orderStats?" + params, true);
                producerReq.send();
            }
        }

    }

    let params = "season=" + seasonString;
    httpReq.open("GET", "/listItems?" + params, true);
    httpReq.send();
};

function sendOrder(uuid, quantity) {
    const httpReq = new XMLHttpRequest();
    httpReq.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            resObj = JSON.parse(httpReq.responseText);
            alert(`You purchased ${quantity}lbs of ${appState.foodData[uuid].name} at ${appState.foodData[uuid].price}/lb for a total of $${Math.round(appState.foodData[uuid].price * quantity * 100)/100}. Your order ID is ${resObj.orderId}`)
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

function createTable(foodCount, isProducer = false) {
    htmlChunk = "";
    for (i = 0; i < foodCount; i++) {
        var primaryTemplate = "";
        const tableRowTemplate =
            `<tr id="row-${i}">
                <td class="food-name">a</td>
                <td class="water-eff">c</td>
                <td class="land-eff">d</td>
                <td class="composite-eff">e</td>
                `;
        const consumerTemplate =
            `<td class="price">b</td>
             <td class="order">
                <button class="order-button">Order</button>
            </td></tr>`;
        const producerTemplate =
            `<td class="value">b</td>
             <td class="ordered"></tr>`;

        if (isProducer) {
            document.getElementById('price-header').innerText = "Value (USD)";
            primaryTemplate = tableRowTemplate + producerTemplate;
        } else {
            primaryTemplate = tableRowTemplate + consumerTemplate;
        }

        htmlChunk += primaryTemplate;
    }
    document.getElementById("customer-table-body").innerHTML = htmlChunk;
}

function buttonOrder(uuid) {
    foodName = appState.foodData[uuid].name;
    foodPrice = appState.foodData[uuid].price;
    buyQuantity = prompt(`you've indicated that you'd like to buy ${foodName}. How many lbs of them would you like to buy, at approximately $${foodPrice} per lb?`);
    if (!buyQuantity) {
        return;
    }
    if (isNaN(buyQuantity)) {
        alert("We're sorry, we couldn't understand that. Please enter a positive integer next time.");
        return;
    }

    confirmation = confirm(`You've requested ${buyQuantity} lbs of ${foodName} at $${foodPrice}/lb, estimated to cost $${Math.round(buyQuantity * foodPrice * 100)/100}. Would you like to place this order?`);
    if (confirmation) {
        sendOrder(uuid, buyQuantity);
    } else {
        alert("You've canceled your order.")
    }
}

function updateTable(foodData, isProducer = false) {
    let tableRows = document.getElementById("customer-table-body").getElementsByTagName('tr');
    var keys = Object.keys(foodData);
    if(isProducer) {
        keys = Object.keys(appState.producerFoodData);
    }
    for (i = 0; i < keys.length; i++) {

        if (!isProducer) {
            tableRows[i].getElementsByClassName('food-name')[0].innerText = foodData[keys[i]].name;
            tableRows[i].getElementsByClassName('price')[0].innerText = Math.round(foodData[keys[i]].price*100)/100;
            tableRows[i].getElementsByClassName('water-eff')[0].innerText = Math.round(foodData[keys[i]].water_usage*100)/100;
            tableRows[i].getElementsByClassName('land-eff')[0].innerText = Math.round(50000000000 / foodData[keys[i]].land_usage)/100;
            tableRows[i].getElementsByClassName('composite-eff')[0].innerText = Math.round(Math.round(50000000000 / foodData[keys[i]].land_usage)/100 + Math.round(foodData[keys[i]].water_usage*100)/100);
            tableRows[i].getElementsByClassName('order')[0].getElementsByClassName('order-button')[0].setAttribute("onClick", `javascript: buttonOrder("${keys[i]}");`)
        } else {
            let quantity = appState.producerFoodData[keys[i]].quantity;
            console.log(quantity);
            console.log(appState.producerFoodData);
            tableRows[i].getElementsByClassName('food-name')[0].innerText = foodData[keys[i]].name;
            tableRows[i].getElementsByClassName('value')[0].innerText = Math.round(foodData[keys[i]].price * 100)/100;
            tableRows[i].getElementsByClassName('water-eff')[0].innerText = Math.round(foodData[keys[i]].water_usage * quantity * 100)/100;
            tableRows[i].getElementsByClassName('land-eff')[0].innerText = Math.round(50000000000 / foodData[keys[i]].land_usage * quantity) / 100;
            tableRows[i].getElementsByClassName('composite-eff')[0].innerText = Math.round(Math.round(50000000000 / foodData[keys[i]].land_usage * quantity) / 100 + Math.round(foodData[keys[i]].water_usage * quantity * 100)/100);
            tableRows[i].getElementsByClassName('ordered')[0].innerText = quantity;
        }
    }
}