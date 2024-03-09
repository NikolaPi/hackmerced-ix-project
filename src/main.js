const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const port = 8000;
const dbLocation = 'db/primary.sqlite'

const db = new sqlite3.Database(dbLocation);
const app = express();

app.use(express.json())

//initialize database
const initFood = "CREATE TABLE IF NOT EXISTS foods (uuid TEXT PRIMARY KEY, name TEXT, water_usage REAL, land_usage REAL, price REAL);";
const initOrders = "CREATE TABLE IF NOT EXISTS orders (uuid TEXT PRIMARY KEY, food_uuid TEXT, price REAL, quantity REAL, time_submitted INTEGER, recv_time TEXT)"

db.serialize(() => {
    db.run(initFood);
    db.run(initOrders);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/listItems', (req, res) => {
    const listCommand = "SELECT uuid, name, water_usage, land_usage, price FROM foods";
    listData = req.body.season;
    db.all(listCommand, (err, row) => {
        outputObj = {};

        switch(listData) {
            case "SPRING":
                priceMultiplier = 0.8;
            case "SUMMER":
                priceMultiplier = 0.7;
            case "FALL":
                priceMultiplier = 1;
            case "WINTER":
                priceMultiplier = 1.3;
        }

        if(row === undefined) {
            res.send('{}');
            return;
        }
        for(i = 0; i < row.length; i++) {
            newKey = row[i].uuid;
            delete row[i].uuid;
            outputObj[newKey] = row[i];
            //outputObj[newKey].price = row[i].price * priceMultiplier;
        }
        console.log(outputObj);
        res.send(outputObj)
    });
    //REQ: category
    //RETURN: Product UUID, Name, CurrentPrice, Water Score, Land Score, Composite Score
});

app.post('/order', (req, res) => {
    const orderStatement = db.prepare("INSERT INTO orders VALUES (?, ?, ?, ?, ?, ?)");

    //TODO: add error handling / abstraction
    orderData = req.body;
    season = orderData.split('-')[0];
    priceMultiplier = 1;
    switch(season) {
        case "SPRING":
            priceMultiplier = 0.8;
        case "SUMMER":
            priceMultiplier = 0.7;
        case "FALL":
            priceMultiplier = 1;
        case "WINTER":
            priceMultiplier = 1.3;
    }

    orderId = uuidv4();
    timestamp = Math.floor(new Date().getTime() / 1000);
    orderStatement.run(orderId, orderData.food_uuid, orderData.price, orderData.quantity, timestamp, orderData.recv_time);
    console.log(timestamp);
    
    resObj = {
        'orderId': orderId,
        'timestamp': timestamp 
    };
    res.send(resObj);
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});

db.close();