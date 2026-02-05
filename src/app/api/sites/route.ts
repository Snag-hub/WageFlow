import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - List all sites for the company
export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const sites = await prisma.site.findMany({
            where: { companyId: session.user.companyId },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { attendance: true }
                }
            }
        });

        return NextResponse.json(sites);
    } catch (error) {
        console.error('Fetch Sites Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new site
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, location } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Site name is required' }, { status: 400 });
        }

        const site = await prisma.site.create({
            data: {
                name: name.trim(),
                location: location?.trim() || null,
                companyId: session.user.companyId,
            },
        });

        return NextResponse.json(site, { status: 201 });
    } catch (error) {
        console.error('Create Site Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
