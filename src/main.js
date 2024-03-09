const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');

const port = 8000;
const dbLocation = 'db/primary.sqlite'

const db = new sqlite3.Database(dbLocation);
const app = express();

app.use(express.json())
app.use(express.static('src/frontend'));

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
    const listCommand = "SELECT uuid, name, water_usage, land_usage, price FROM foods;";
    season = req.query.season.split('-')[0];
    console.log("season debug");
    console.log(req.query.season);
    console.log(season);
    db.serialize(() => {
        db.all(listCommand, (err, row) => {
            outputObj = {};

            priceMultiplier = 1;

            if(row === undefined) {
                res.send('{}');
                return;
            }
            for(i = 0; i < row.length; i++) {
                newKey = row[i].uuid;
                delete row[i].uuid;
                outputObj[newKey] = row[i];
                outputObj[newKey].price = row[i].price * priceMultiplier;
            }
            res.send(outputObj)
        });
    })
    //REQ: category
    //RETURN: Product UUID, Name, CurrentPrice, Water Score, Land Score, Composite Score
});

app.post('/order', (req, res) => {
    const orderStatement = db.prepare("INSERT INTO orders VALUES (?, ?, (SELECT price FROM foods WHERE uuid = ?), ?, ?, ?)");
    const getPricePaid = db.prepare("SELECT price FROM orders WHERE uuid = ?");

    //TODO: add error handling / abstraction
    orderData = req.body;
    console.log(orderData);
    season = orderData.season.split('-')[0];
    console.log(season);

    orderId = uuidv4();
    console.log(orderId);
    timestamp = Math.floor(new Date().getTime() / 1000);
    db.serialize(() => {
        orderStatement.run(orderId, orderData.food_uuid, orderData.food_uuid, orderData.quantity, timestamp, orderData.season);
        getPricePaid.get(orderId, (err, row) => {
            resObj = {
                'orderId': orderId,
                'timestamp': timestamp,
                'quantity': orderData.quantity,
                //unit price NOT total price
                'price': row.price
            };

            res.send(resObj);
        });
    });
});

app.get('/orderStats', (req, res) => {
    //TODO: dashboard
});

app.listen(port, () => {
    console.log(`Listening on ${port}`);
});