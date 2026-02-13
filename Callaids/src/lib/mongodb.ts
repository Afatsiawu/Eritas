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
let clientPromise: Promise<MongoClient>;

if (!uri) {
    if (process.env.NODE_ENV === 'production') {
        console.warn('MONGODB_URI is not defined in environment variables');
    }
    clientPromise = Promise.reject(new Error('MONGODB_URI is missing'));
} else {
    if (process.env.NODE_ENV === 'development') {
        let globalWithMongo = global as typeof globalThis & {
            _mongoClientPromise?: Promise<MongoClient>;
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
