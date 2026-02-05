import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - List all payers
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const payers = await prisma.payer.findMany({
            where: { companyId: session.user.companyId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { attendance: true }
                }
            }
        });

        return NextResponse.json(payers);
    } catch (error) {
        console.error('Fetch Payers Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new payer
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, contactInfo } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Payer name is required' }, { status: 400 });
        }

        const payer = await prisma.payer.create({
            data: {
                name: name.trim(),
                contactInfo: contactInfo?.trim() || null,
                companyId: session.user.companyId,
            },
        });

        return NextResponse.json(payer, { status: 201 });
    } catch (error) {
        console.error('Create Payer Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
