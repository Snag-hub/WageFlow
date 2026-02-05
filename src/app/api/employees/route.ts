import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const employees = await prisma.employee.findMany({
            where: {
                companyId: session.user.companyId,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(employees);
    } catch (error) {
        console.error('Fetch Employees Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { name, phone, type, defaultWage } = await req.json();

        if (!name) {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const employee = await prisma.employee.create({
            data: {
                name,
                phone,
                type: type || 'daily',
                defaultWage: parseFloat(defaultWage) || 0,
                companyId: session.user.companyId,
            },
        });

        return NextResponse.json(employee, { status: 201 });
    } catch (error) {
        console.error('Create Employee Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
