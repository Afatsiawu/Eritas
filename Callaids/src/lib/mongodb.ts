import { MongoClient, ServerApiVersion } from 'mongodb';

const uri = process.env.MONGODB_URI || "";

const options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
} as any;

let client;
let clientPromise: Promise<MongoClient | null>;

if (!uri) {
    // In production build, the URI might be missing. 
    // We return a promise that resolves to null instead of rejecting.
    clientPromise = Promise.resolve(null);
} else {
    if (process.env.NODE_ENV === 'development') {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient | null>;
        };

        if (!globalWithMongo._mongoClientPromise) {
            client = new MongoClient(uri, options);
            globalWithMongo._mongoClientPromise = client.connect();
        }
        clientPromise = globalWithMongo._mongoClientPromise;
    } else {
        client = new MongoClient(uri, options);
        clientPromise = client.connect();
    }
}

export default clientPromise;
