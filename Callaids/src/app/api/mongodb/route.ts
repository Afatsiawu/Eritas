import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

// Helper to get connection ONLY when called (not at module level)
async function getDb() {
    const { default: clientPromise } = await import('@/lib/mongodb');
    const client = await clientPromise;
    if (!client) return null;
    return client.db();
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const id = searchParams.get('id');

    if (!collectionName) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    try {
        const db = await getDb();
        if (!db) {
            return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
        }

        const collection = db.collection(collectionName);

        if (id) {
            const data = await collection.findOne({ _id: new ObjectId(id) });
            return NextResponse.json(data);
        } else {
            const data = await collection.find({}).limit(100).toArray();
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('MongoDB API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { collection: collectionName, data } = body;

        if (!collectionName || !data) {
            return NextResponse.json({ error: 'Collection and data are required' }, { status: 400 });
        }

        const db = await getDb();
        if (!db) {
            return NextResponse.json({ error: 'Database connection not available' }, { status: 503 });
        }

        const collection = db.collection(collectionName);
        const result = await collection.insertOne(data);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('MongoDB API POST Error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
