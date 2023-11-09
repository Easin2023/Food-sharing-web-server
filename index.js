const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cookieParser = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors(
  //   {
  //   origin: ["http://localhost:5173"],
  //   credentials: true,
  // }
  )
);
app.use(cookieParser());
app.use(express.json());
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hgwvewl.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //     await client.close();
  }
}
run().catch(console.dir);

const database = client.db("foodsharingdatabse");

const foodAddedCollection = database.collection("addedFood");
const foodRequestCollection = database.collection("foodRequest");

// app.post("/jwt", async (req, res) => {
//   try {
//     const body = req.body;
//     const token = jwt.sign(body, process.env.JWT_TOKEN, { expiresIn: "1h" });
//     res
//       .cookie("token", token, {
//         httpOnly: true,
//         secure: false,
//       })
//       .send({ success: true });
//   } catch (error) {
//     console.log(error);
//   }
// });
app.get("/addedFoodData", async (req, res) => {
  try {
    // console.log(req.query);
    let query = {}; // Change 'const' to 'let'
    if (req.query?.email) {
      query = { email: req.query.email };
    }
    const result = await foodAddedCollection
      .find(query)
      .sort({ Food_Quantity: -1 })
      .toArray();
    // console.log(query)
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});
app.get("/addedFoodDataFindToExpiredDate", async (req, res) => {
  try {
    const result = await foodAddedCollection
      .find()
      .sort({ Expired_Date_Time: 1 })
      .toArray();
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/addedFoodData/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodAddedCollection.findOne(query);
  res.send(result);
});


app.post("/addedFood", async (req, res) => {
  try {
    const body = req.body;
    // console.log(body)
    const result = await foodAddedCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/foodRequest/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const result = await foodRequestCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error);
  }
});

app.get("/foodRequest", async (req, res) => {
  console.log(req.query);
  let query = {};
  if (req.query?.email) {
    query = { email: req.query.email };
  }
  const result = await foodRequestCollection.find(query).toArray();
  res.send(result);
});

app.post("/foodRequest", async (req, res) => {
  try {
    const body = req.body;
    const result = await foodRequestCollection.insertOne(body);
    res.send(result);
  } catch (error) {
    console.log(error);
    res.send({ error });
  }
});

app.put("/foodRequest/:id", async (req, res) => {
  const id = req.params.id;
  const body = req.body;
  console.log(body);
  const query = { _id: new ObjectId(id) };
  const setDoc = {
    $set: {
      status: body.status,
    },
  };
  const result = await foodRequestCollection.updateOne(query, setDoc);
  res.send(result);
});

app.delete("/foodRequest/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodRequestCollection.deleteOne(query);
  res.send(result);
});

app.put("/updateFoodData/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const query = { _id: new ObjectId(id) };
    const updateDoc = {
      $set: {
        Food_Image: body.FoodImage,
        Food_Name: body.FoodName,
        Food_Quantity: body.FoodQuantity,
        Pickup_Location: body.PickupLocation,
        Expired_Date_Time: body.ExpiredDate,
        Additional_Notes: body.AdditionalNotes,
      },
    };
    const result = await foodAddedCollection.updateOne(query, updateDoc);
    res.send(result);
    // console.log(body)
  } catch (error) {
    console.log(error);
  }
});

app.delete("/addedFoodData/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodAddedCollection.deleteOne(query);
  res.send(result);
});

app.get("/", (req, res) => {
  res.send("server is running");
});
app.listen(port, () => {
  console.log(`server is running${port}`);
});
