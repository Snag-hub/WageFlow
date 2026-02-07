import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - List all clients
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const clients = await prisma.client.findMany({
            where: { companyId: session.user.companyId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { sites: true }
                }
            }
        });

        return NextResponse.json(clients);
    } catch (error) {
        console.error('Fetch Clients Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new client
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, contactInfo, email, phone, address } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Client name is required' }, { status: 400 });
        }

        const client = await prisma.client.create({
            data: {
                name: name.trim(),
                contactInfo: contactInfo?.trim() || null,
                email: email?.trim() || null,
                phone: phone?.trim() || null,
                address: address?.trim() || null,
                companyId: session.user.companyId,
            },
        });

        return NextResponse.json(client, { status: 201 });
    } catch (error) {
        console.error('Create Client Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
