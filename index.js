const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
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


function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'UnAuthorized Access' });
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' })
        }
        req.decoded = decoded;
        next();
    });

}


async function run() {
    try {
        await client.connect();
        const itemsCollection = client.db('rapid_manufacturer').collection('items');
        const purchaseCollection = client.db('rapid_manufacturer').collection('purchases');
        const reviewsCollection = client.db('rapid_manufacturer').collection('reviews');
        const userCollection = client.db('rapid_manufacturer').collection('users');

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

        app.get('/user', async (req, res) => {
            const users = await userCollection.find().toArray();
            res.send(users);
        })

        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await userCollection.updateOne(filter, updateDoc);

            res.send({ result });
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ result, token });
        })



        app.get('/item/:id', async (req, res) => {
            const query = {};

            const users = await itemsCollection.findOne(query);
            res.send(users);
        })

        app.get('/item/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await itemsCollection.findOne(query);
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







        // app.get('/purchase/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const purchase = await purchaseCollection.findOne(query);
        //     res.send(purchase);
        // })


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