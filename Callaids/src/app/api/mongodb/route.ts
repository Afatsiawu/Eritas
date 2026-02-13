import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const collectionName = searchParams.get('collection');
    const id = searchParams.get('id');

    if (!collectionName) {
        return NextResponse.json({ error: 'Collection name is required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(); // Uses the DB name from the URI if present, otherwise specify
        const collection = db.collection(collectionName);

        if (id) {
            const data = await collection.findOne({ _id: new ObjectId(id) });
            return NextResponse.json(data);
        } else {
            // Basic query - can be extended to support filters
            const data = await collection.find({}).limit(100).toArray();
            return NextResponse.json(data);
        }
    } catch (error) {
        console.error('MongoDB API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    const { collection: collectionName, data } = await request.json();

    if (!collectionName || !data) {
        return NextResponse.json({ error: 'Collection and data are required' }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const collection = db.collection(collectionName);

        const result = await collection.insertOne(data);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error('MongoDB API POST Error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
