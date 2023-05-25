const express = require("express");
const app = express();
const cors = require("cors");
// const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
// require('dotenv').config();

app.use(express.json());
app.use(cors());



// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@learndb.isqzetk.mongodb.net/?retryWrites=true&w=majority`;

const uri = "mongodb+srv://wonderkin:bZZ2Yb7iO2U3qlrM@learndb.isqzetk.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
[];
async function run() {
  try {
    client.connect();

    const db = client.db("wonderkin").collection("collection0");

// get all toy data
    app.get("/", async (req, res) => {
      const result = await db.find().limit(20).toArray();
      res.send(result);
    });

    app.get("/category", async (req, res) => {
      let query = {};
      query = { category: req.query.category };
      const result = await db.find(query).limit(6).toArray();
      res.send(result);
    });


 // get by email
    app.get("/my-toys", async (req, res) => {
      let query = {};
      query = { sellerEmail: req.query.email };
      const result = await db.find(query).toArray();
      res.send(result);
    });

    app.get("/my-toys/sort", async (req, res) => {
      let query = {};
      query = { sellerEmail: req.query.email };
      const result = await db
        .find(query)
        .sort({ price: parseInt(req.query.sorting) })
        .toArray();
      res.send(result);
    });


 // view details by id 
    app.get("/all-toys/:id", async (req, res) => {
      const query = { _id: new ObjectId(req.params.id) };
      const result = await db.find(query).toArray();
      res.send(result);
    });




// add product into database
    app.post("/addtoys", async (req, res) => {
      const data = {
        name: req.body.name,
        image: req.body.image,
        price: parseInt(req.body.price),
        rating: parseInt(req.body.rating),
        quantity: parseInt(req.body.quantity),
        description: req.body.description,
        category: req.body.category,
        sellerName: req.body.sellerName,
        sellerEmail: req.body.sellerEmail,
      };
      const result = await db.insertOne(data);
      res.send(result);
    });


    // edit data  or update data
    app.put("/", async (req, res) => {
      const filter = { _id: new ObjectId(req.body.id) };
      const options = { upsert: true };
      const update = {
        $set: {
          name: req.body.name,
          price: req.body.price,
          quantity: req.body.quantity,
          description: req.body.description,
          rating: req.body.rating,
        },
      };
      const result = await db.updateOne(filter, update, options);
      res.send(result);
    });



    // delete my toys  data 
    app.delete("/my-toys", async (req, res) => {
      const query = { _id: new ObjectId(req.body.data) };
      const result = await db.deleteOne(query);
      res.send(result);
    });



    // Send a ping to confirm a successful connection
    await client.db("wonderkin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You are successfully connected to MongoDB!"
    );
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(process.env.PORT || 3000, () => {console.log('listening')})
