const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://Oware:kDDJVud44VNkBnHD@cluster0.xlwwa6a.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    console.log("Connecting...");
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } catch (err) {
    console.error("Connection failed:", err);
  } finally {
    await client.close();
  }
}
run();
