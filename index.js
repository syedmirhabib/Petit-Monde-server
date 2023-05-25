const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mdbClient = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

(async (_) => {
  try {
    const categories = mdbClient.db("wonderkin").collection("collection0");
    const toys = mdbClient.db("wonderkin").collection("collection0");

    app.get("/categories", async (req, res) => {
      let result;

      if (req.query.id) {
        const query = { _id: new ObjectId(req.query.id) };
        result = await categories.findOne(query);
      } else {
        const cursor = categories.find();
        result = await cursor.toArray();
      }

      res.send(result);
    });

    app.get("/toys", async (req, res) => {
      let result;

      if (req.query.id) {
        const query = { _id: new ObjectId(req.query.id) };
        result = await toys.findOne(query);
      } else if (req.query.cid) {
        const query = { category_id: req.query.cid };
        const cursor = toys.find(query);
        result = await cursor.toArray();
      } else {
        let query = {},
          cursor;

        if (req.query.uid) query = { seller_id: req.query.uid };

        if (req.query.search)
          query = {
            ...query,
            name: { $regex: req.query.search, $options: "i" },
          };

        if (req.query.sort) {
          let sort = 1;

          req.query.sort !== "asc" ? (sort = -1) : null;

          cursor = toys
            .find(query)
            .limit(+req.query.limit || 0)
            .sort({ price: sort });
        } else {
          cursor = toys.find(query).limit(+req.query.limit || 0);
        }

        result = await cursor.toArray();
      }

      res.send(result);
    });

    app.get("/toys/discount", async (req, res) => {
      const query = { discount: true };
      const cursor = toys.find(query);
      const result = await cursor.toArray();

      res.send(result);
    });

    app.post("/toys", async (req, res) => {
      const toy = {
        ...req.body,
        price: +req.body.price,
        shipping: +req.body.shipping,
        quantity: +req.body.quantity,
        discount: JSON.parse(req.body.discount),
      };
      const result = await toys.insertOne(toy);

      res.send(result);
    });

    app.put("/toys", async (req, res) => {
      const query = { _id: new ObjectId(req.query.id) };
      const toy = {
        ...req.body,
        price: +req.body.price,
        shipping: +req.body.shipping,
        quantity: +req.body.quantity,
        discount: JSON.parse(req.body.discount),
      };
      const result = await toys.updateOne(query, { $set: toy });

      res.send(result);
    });

    app.delete("/toys", async (req, res) => {
      const query = { _id: new ObjectId(req.query.id) };
      const result = await toys.deleteOne(query);

      res.send(result);
    });

    mdbClient
      .db("admin")
      .command({ ping: 1 })
      .then((_) => console.log("Successfully connected to MongoDB!"));
  } catch (err) {
    console.log("Did not connect to MongoDB! " + err.message);
  } finally {
    await mdbClient.close();
  }
})();

app.get("/", (req, res) => {
  res.send("ToyState is running...");
});

app.listen(port, (_) => {
  console.log(`ToyState API is running on port: ${port}`);
});