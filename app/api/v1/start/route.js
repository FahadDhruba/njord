import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import crypto from 'crypto';

export async function POST(request) {
    try {
        const { projectName, email } = await request.json();

        // Normalize project name to lowercase
        const normalizedProjectName = projectName?.trim().toLowerCase();

        // Validate required fields
        if (!email || !normalizedProjectName) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing required fields. It needs projectName & email.',
                },
                { status: 400 }
            );
        }

        // Validate project name
        const projectNameRegex = /^[a-zA-Z0-9_]+$/;
        if (!projectNameRegex.test(normalizedProjectName)) {
            return NextResponse.json(
                {
                    status: 'error',
                    message:
                        'Invalid project name. Only letters, numbers, and underscores are allowed.',
                },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db('njordMain');
        const seasonCollection = db.collection('seasons');

        // Check if season already exists
        const existingSeason = await seasonCollection.findOne({
            projectName: normalizedProjectName,
        });

        if (existingSeason) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Season with this project name already exists.',
                },
                { status: 400 }
            );
        }

        // Generate unique 64-character token
        let token;
        let tokenExists = true;

        while (tokenExists) {
            token = crypto.randomBytes(32).toString('hex'); // 64 chars
            tokenExists = await seasonCollection.findOne({ token });
        }

        const newSeason = {
            projectName: normalizedProjectName,
            email: email.trim().toLowerCase(),
            token,
            createdAt: new Date(),
        };

        // Save season
        await seasonCollection.insertOne(newSeason);

        return NextResponse.json(
            {
                status: 'success',
                message: 'Season created successfully.',
                token,
                projectName: normalizedProjectName,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error while creating Project Season:', error);

        return NextResponse.json(
            {
                status: 'error',
                message: 'Internal Error',
                error: error.message,
            },
            { status: 500 }
        );
    }
}