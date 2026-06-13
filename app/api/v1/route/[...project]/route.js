import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

function extractAccessToken(request) {
    return request.headers.get('x-njord-token')?.trim() || '';
}

async function assertSeasonAccess(db, token) {
    if (!token) {
        return {
            ok: false,
            response: NextResponse.json(
                {
                    status: 'error',
                    message: 'Missing access token. Send x-njord-token.',
                },
                { status: 401 }
            ),
        };
    }

    const season = await db.collection('seasons').findOne({ token });

    if (!season) {
        return {
            ok: false,
            response: NextResponse.json(
                {
                    status: 'error',
                    message: 'Invalid access token.',
                },
                { status: 403 }
            ),
        };
    }

    return { ok: true, season };
}

export async function GET(request, { params }) {
    try {

        const { project } = await params;

        const client = await clientPromise;
        const db = client.db('njordMain');
        const accessToken = extractAccessToken(request);
        const accessCheck = await assertSeasonAccess(db, accessToken);

        if (!accessCheck.ok) {
            return accessCheck.response;
        }

        if (accessCheck.season.projectName !== project[0].toLowerCase()) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Access token does not match the project.',
                },
                { status: 403 }
            );
        }

        const DynaCollection = db.collection(project.join('.').toLowerCase());
        const projectLabel = project.join('/').toLowerCase();

        const documents = await DynaCollection.find({}).toArray();

        return NextResponse.json(
            {
                status: 'success',
                message: 'Documents fetched successfully.',
                project: projectLabel,
                documents
            },
            { status: 200 }
        );
    } catch (error) {
        console.error('Error while fetching Documents:', error);

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

export async function POST(request, { params }) {
    try {

        const { project } = await params;

        const document = await request.json();

        const client = await clientPromise;
        const db = client.db('njordMain');
        const accessToken = extractAccessToken(request);
        const accessCheck = await assertSeasonAccess(db, accessToken);

        if (!accessCheck.ok) {
            return accessCheck.response;
        }

        if (accessCheck.season.projectName !== project[0].toLowerCase()) {
            return NextResponse.json(
                {
                    status: 'error',
                    message: 'Access token does not match the project.',
                },
                { status: 403 }
            );
        }

        const DynaCollection = db.collection(project.join('.').toLowerCase());

        const { token, ...safeDocument } = document;

        await DynaCollection.insertOne(safeDocument);

        return NextResponse.json(
            {
                status: 'success',
                message: 'Document created successfully.',
                project: project.join('/').toLowerCase()
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error while creating Document:', error);

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