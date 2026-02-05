import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - List recent transactions
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const whereClause: any = {
            companyId: session.user.companyId
        };

        if (employeeId) {
            whereClause.employeeId = employeeId;
        }

        const transactions = await prisma.transaction.findMany({
            where: whereClause,
            orderBy: { date: 'desc' },
            take: limit,
            include: {
                employee: {
                    select: { name: true }
                }
            }
        });

        // Format for UI
        const formatted = transactions.map(t => ({
            id: t.id,
            date: t.date,
            amount: t.amount,
            type: t.type,
            note: t.note,
            employeeName: t.employee.name,
            employeeId: t.employeeId
        }));

        return NextResponse.json(formatted);
    } catch (error) {
        console.error('Fetch Transactions Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create a new transaction (Advance/Payment)
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { employeeId, type, amount, date, note } = await req.json();

        if (!employeeId || !type || !amount || !date) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const transaction = await prisma.transaction.create({
            data: {
                companyId: session.user.companyId,
                employeeId,
                type, // 'advance', 'payment', 'salary_credit'
                amount: parseFloat(amount),
                date: new Date(date),
                note: note || ''
            }
        });

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Create Transaction Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
