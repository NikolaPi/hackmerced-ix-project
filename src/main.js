const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const db = new sqlite3.Database(':memory:');
const app = express();

app.use(express.json())

const port = 8000;

//initialize database
const initFood = "CREATE TABLE IF NOT EXISTS foods (uuid TEXT PRIMARY KEY, name TEXT, water_usage REAL, land_usage REAL, price REAL);";
const initOrders = "CREATE TABLE IF NOT EXISTS orders (uuid TEXT PRIMARY KEY, food_uuid TEXT, price REAL, quantity REAL, time_submitted INTEGER, recv_time INTEGER)"
const testData = "INSERT INTO foods VALUES ('212e6253-f88b-489d-a24b-aa5d33b2f825', 'testFood', 100, 150, 15);";
const testData2 = "INSERT INTO foods VALUES ('932e6d53-fe8b-489d-a24b-aaed3eb7fd25', 'testFood2', 120.3, 23, 70);";

db.serialize(() => {
    db.run(initFood);
    db.run(initOrders);
    db.run(testData);
    db.run(testData2);
});

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/listItems', (req, res) => {
    const listCommand = "SELECT uuid, name, water_usage, land_usage, price FROM foods";
    db.all(listCommand, (err, row) => {
        outputObj = {};
        for(i = 0; i < row.length; i++) {
            newKey = row[i].uuid;
            delete row[i].uuid;
            outputObj[newKey] = row[i];
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

    orderId = uuidv4();
    timestamp = Math.floor(new Date().getTime() / 1000);
    orderStatement.run(orderId, orderData.food_uuid, orderData.price, orderData.quantity, timestamp, orderData.recv_time);
    console.log(timestamp);
    res.send(orderId);
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});