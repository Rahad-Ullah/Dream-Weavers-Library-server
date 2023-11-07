const express = require('express');
const cors = require('cors');
var jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())
app.use(cookieParser())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zku3u3r.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const booksCollection = client.db('dreamWeaversDB').collection('books')
    const categoriesCollection = client.db('dreamWeaversDB').collection('categories')

    // get specific book from Database by id
    app.get('/book', async (req, res) => {
        const id = req.query.id;
        const filter = {_id: new ObjectId(id)}
        const result = await booksCollection.findOne(filter)
        res.send(result)
    })

    // get multiple books on specific category
    app.get('/books', async (req, res) => {
      const category = req.query.category;
      const filter = {category: category}
      const result = await booksCollection.find(filter).toArray()
      res.send(result)
    })
    
    // insert book to database
    app.post('/books', async (req, res) => {
        const newBook = req.body;
        const result = await booksCollection.insertOne(newBook)
        res.send(result)
    })

    // get all categories
    app.get('/categories', async (req, res) => {
      const result = await categoriesCollection.find().toArray()
      res.send(result)
    })

    

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Dream Weavers Library is running')
})

app.listen(port, () => {
    console.log('Dream Weavers server is running on port', port)
})