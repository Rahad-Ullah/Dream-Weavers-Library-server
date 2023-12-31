const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors({
  origin: [
    `http://localhost:5173`,
    `https://dream-weavers-library.web.app`,
    `https://dream-weavers-library.firebaseapp.com`,
  ],
  credentials: true
}))
app.use(express.json())



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
    const borrowedBooksCollection = client.db('dreamWeaversDB').collection('borrowedBooks')
    const categoriesCollection = client.db('dreamWeaversDB').collection('categories')
    const userCollection = client.db('dreamWeaversDB').collection('users')

    // get specific book from Database by id
    app.get('/book/:id', async (req, res) => {  
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)}
        const result = await booksCollection.findOne(filter)
        res.send(result)
    })

    // get multiple books on specific category
    app.get('/books/:category', async (req, res) => {
      const category = req.params.category;
      const filter = {category: category}
      const result = await booksCollection.find(filter).toArray()
      res.send(result)
    })

    // get available books only
    app.get('/avail-books', async (req, res) => {
      const result = await booksCollection.find().toArray()
      res.send(result)
    })

    // update available books
    app.patch('/avail-books', async (req, res) => {
      const id = req.query.id;
      const filter = {_id: new ObjectId(id)}
      const book = req.body;

      const {name, author_name, image, category, rating} = book;
      const updateDoc = {
        $set: {
          name,
          author_name, 
          image, 
          category, 
          rating
        }
      }
      const result = await booksCollection.updateOne(filter, updateDoc)
      res.send(result)
      
    })
    
    // insert book to database
    app.post('/books', async (req, res) => {
        const newBook = req.body;
        const result = await booksCollection.insertOne(newBook)
        res.send(result)
    })

    // decrease book quantity
    app.patch('/books', async (req, res) => {
      const id = req.query.id;
      const filter = {_id: new ObjectId(id)}
      const newQuantity = req.body.quantity;
      const updateDoc = {
        $set: {
          quantity: newQuantity
        }
      }
      const result = await booksCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // increase book quantity
    app.patch('/book', async (req, res) => {
      const name = req.query.name;
      const filter = {name}
      const newQuantity = req.body.quantity;
      console.log(newQuantity)
      const updateDoc = {
        $set: {
          quantity: newQuantity
        }
      }
      const result = await booksCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    // get all categories
    app.get('/categories', async (req, res) => {
      const result = await categoriesCollection.find().toArray()
      res.send(result)
    })

    // get all borrowed books
    app.get('/borrowed-books', async (req, res) => {
      const email = req.query.email;
      const filter = {email}
      const result = await borrowedBooksCollection.find(filter).toArray()
      res.send(result)
      console.log(result.length)
    })

    // insert borrowed books
    app.post('/borrowed-books', async (req, res) => {
      const book = req.body;
      const result = await borrowedBooksCollection.insertOne(book)
      res.send(result)
    })

     // delete from borrowed books
     app.delete('/borrowed-books', async (req, res) => {
      const id = req.query.id;
      const filter = {_id: new ObjectId(id)}
      const result = await borrowedBooksCollection.deleteOne(filter)
      res.send(result)
    })

    // set isBorrowed status
    app.get('/borrowed-status', async (req, res) => {
      const filter = {name: req.query.name, email: req.query.email}
      const result = await borrowedBooksCollection.findOne(filter)
      if(result){
        res.send({status: true})
      }
      else{
        res.send({status: false})
      }
    })

    // set user
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user)
      res.send(result)
    })

    // get user
    app.get('/users', async (req, res) => {
      const email = req.query.email;
      const filter = {email}
      const result = await userCollection.findOne(filter)
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