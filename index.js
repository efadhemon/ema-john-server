
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d0ugz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express()
const port = 4000

app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
  res.send('Server site is working')
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const productsCollection = client.db(process.env.DB_NAME).collection("products");
  const ordersCollection = client.db(process.env.DB_NAME).collection("orders");

  app.post('/addProduct', (req, res) => {
    const product = req.body;
    productsCollection.insertOne(product)
      .then(result => {
        res.send(result.insertedCount);
      })
  })

  app.get('/products', (req, res) => {
    productsCollection.find({}).limit(20)
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.get('/products/:key', (req, res) => {
    productsCollection.find({ key: req.params.key })
      .toArray((err, documents) => {
        res.send(documents[0])
      })
  })

  app.post('/productsByKeys', (req, res) => {
    const productKeys = req.body;
    productsCollection.find({ key: { $in: productKeys } })
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  app.post('/addOrder', (req, res) => {
    const order = req.body;
    console.log(order);
    ordersCollection.insertOne(order)
      .then(result => {
        res.send(result.insertedCount > 0);
      })
  })

});



app.listen(process.env.PORT || port)