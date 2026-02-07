import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        if (!from || !to) {
            return NextResponse.json({ message: 'Date range required' }, { status: 400 });
        }

        const fromDate = new Date(from);
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999); // End of day

        // 1. Fetch Income (Site Transactions)
        const incomeTransactions = await prisma.siteTransaction.findMany({
            where: {
                site: { companyId: session.user.companyId },
                date: {
                    gte: fromDate,
                    lte: toDate
                }
            },
            include: {
                site: { select: { name: true } },
                payer: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        // 2. Fetch Expenses (Employee Transactions - Advance, Payment, Salary Credit)
        // Note: Wages are derived from attendance, but transactions are the actual cashflow
        const expenseTransactions = await prisma.transaction.findMany({
            where: {
                companyId: session.user.companyId,
                date: {
                    gte: fromDate,
                    lte: toDate
                }
            },
            include: {
                employee: { select: { name: true } },
                site: { select: { name: true } }
            },
            orderBy: { date: 'desc' }
        });

        const totalIncome = incomeTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const totalExpense = expenseTransactions.reduce((sum, tx) => sum + tx.amount, 0);
        const netProfit = totalIncome - totalExpense;

        return NextResponse.json({
            totalIncome,
            totalExpense,
            netProfit,
            incomeTransactions,
            expenseTransactions
        });
    } catch (error) {
        console.error('Fetch Earnings Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
