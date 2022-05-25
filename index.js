const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// Middleware
app.use(cors());
app.use(express.json());

// rapid_admin
// u9xfAV1oYBksYAhO


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fl8bx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('rapid_manufacturer').collection('items');
        const purchaseCollection = client.db('rapid_manufacturer').collection('purchases');
        const reviewsCollection = client.db('rapid_manufacturer').collection('reviews');

        // To load all items to the client site 
        app.get('/items', async (req, res) => {
            const query = {};
            const cursor = itemsCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);
        })

        // using post API to purchase a particular item 
        app.post('/purchase', async (req, res) => {
            const purchase = req.body;
            const result = purchaseCollection.insertOne(purchase);
            res.send(result);

        })


        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const items = await itemsCollection.findOne(query);
            res.send(items);
        })


        app.get('/purchase/:email', async (req, res) => {
            const email = req.params.email;
            const query = { userEmail: email };
            const cursor = purchaseCollection.find(query);
            const purchase = await cursor.toArray();
            res.send(purchase);
        })


        
        app.delete('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const purchase = await purchaseCollection.deleteOne(query);
            res.send(purchase);
        })
    

        app.post('/review', async (req, res) => {
            const review = req.body;
            const result = reviewsCollection.insertOne(review);
            res.send(result);

        })


        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewsCollection.find(query);
            const reviews = await cursor.toArray();
            res.send(reviews);
        })


    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);






app.get('/', (req, res) => {
    res.send('Hello from Rapid Manufacturer!')
})

app.listen(port, () => {
    console.log(`Rapid Manufacturer listening on port ${port}`)
})