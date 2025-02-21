import mongodb from "mongodb";

// Connect to databases
const MongoClient = mongodb.MongoClient;
const dbConnect = async (dbName) => {
  try {
    const client = await MongoClient.connect("mongodb://localhost:27017");
    const db = client.db(dbName);
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB: ", error);
    throw new Error("Failed to connect to mongodb");
  }
};

const db = await dbConnect("logs");

const createLog = async (logObject) => {
  console.log("log: ", logObject);
  const reqlogsCollection = db.collection("reqlogs");
  // @TOOD: add current time ?
  const result = await reqlogsCollection.insertOne(logObject);
  return result;
};

const getLogs = async () => {
  const reqlogsCollection = db.collection("reqlogs");
  const reqlogs = await reqlogsCollection.find();
  return reqlogs;
};

export { createLog, getLogs };
