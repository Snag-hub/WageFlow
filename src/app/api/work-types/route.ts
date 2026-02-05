import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - List all work types
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const workTypes = await prisma.workType.findMany({
            where: { companyId: session.user.companyId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { attendance: true }
                }
            }
        });

        return NextResponse.json(workTypes);
    } catch (error) {
        console.error('Fetch Work Types Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new work type
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Work type name is required' }, { status: 400 });
        }

        const workType = await prisma.workType.create({
            data: {
                name: name.trim(),
                companyId: session.user.companyId,
            },
        });

        return NextResponse.json(workType, { status: 201 });
    } catch (error) {
        console.error('Create Work Type Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
