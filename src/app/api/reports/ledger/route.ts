import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const employeeId = searchParams.get('employeeId');

    if (!employeeId) {
        return NextResponse.json({ message: 'Employee ID is required' }, { status: 400 });
    }

    try {
        const companyId = session.user.companyId;

        // 1. Fetch Attendance (Earnings) to date
        // Note: We only count 'isPresent: true' entries as earnings
        const attendance = await prisma.attendance.findMany({
            where: {
                companyId,
                employeeId,
                isPresent: true
            },
            include: {
                site: { select: { name: true } },
                workType: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
        });

        // 2. Fetch Transactions (Advances & Payments)
        const transactions = await prisma.transaction.findMany({
            where: {
                companyId,
                employeeId
            },
            orderBy: { date: 'asc' }
        });

        // 3. Merge and Sort
        type LedgerItem = {
            id: string;
            date: Date;
            description: string;
            type: 'wage' | 'advance' | 'payment' | 'salary_credit';
            credit: number; // + Money earned/received
            debit: number;  // - Money taken (Advance) or Paid Out (Payment) 
            // Wait, standard accounting:
            // From COMPANY perspective:
            // - Debit: Expense (Wage Expense) / Cash Out (Payment)
            // - Credit: Liability (Wages Payable)

            // From EMPLOYEE PAISA perspective (Khata):
            // - Credit (+): Earned Wage (Company owes them)
            // - Debit (-): Taken Advance / Received Payment (Company owes them less)

            // Let's stick to "Balance = Payable to Employee"
            // Wage -> Increases Balance (+)
            // Advance -> Decreases Balance (-)
            // Payment -> Decreases Balance (-)
        };

        const items: LedgerItem[] = [];

        attendance.forEach(a => {
            items.push({
                id: a.id,
                date: a.date,
                description: `Worked at ${a.site.name} (${a.workType.name})`,
                type: 'wage',
                credit: a.wage,
                debit: 0
            });
        });

        transactions.forEach(t => {
            if (t.type === 'advance') {
                items.push({
                    id: t.id,
                    date: t.date,
                    description: t.note ? `Advance: ${t.note}` : 'Advance taken',
                    type: 'advance',
                    credit: 0,
                    debit: t.amount // Reduces payable
                });
            } else if (t.type === 'payment') {
                items.push({
                    id: t.id,
                    date: t.date,
                    description: t.note ? `Payment: ${t.note}` : 'Cash Payment received',
                    type: 'payment',
                    credit: 0,
                    debit: t.amount // Reduces payable
                });
            } else if (t.type === 'salary_credit') {
                // Manual salary add (bonus etc)
                items.push({
                    id: t.id,
                    date: t.date,
                    description: t.note ? `Bonus/Credit: ${t.note}` : 'Manual Credit',
                    type: 'salary_credit',
                    credit: t.amount, // Increases payable
                    debit: 0
                });
            }
        });

        // Sort chronologically
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // 4. Calculate Running Balance & Summary
        let runningBalance = 0;
        let totalEarned = 0;
        let totalPaid = 0; // Advances + Payments

        const history = items.map(item => {
            if (item.credit > 0) {
                runningBalance += item.credit;
                totalEarned += item.credit;
            } else {
                runningBalance -= item.debit;
                totalPaid += item.debit;
            }

            return {
                ...item,
                balance: runningBalance
            };
        });

        // If history is empty, check for opening balance? (Not implemented yet, assume 0)

        // Find Employee & Company Details
        const [employee, company] = await Promise.all([
            prisma.employee.findUnique({
                where: { id: employeeId },
                select: { name: true, phone: true, type: true, defaultWage: true }
            }),
            prisma.company.findUnique({
                where: { id: companyId },
                select: { name: true }
            })
        ]);

        return NextResponse.json({
            employee,
            company,
            summary: {
                totalEarned,
                totalPaid,
                balance: runningBalance
            },
            history: history.reverse() // Newest first for UI? Or Oldest first? 
            // Usually Ledger is Oldest -> Newest to follow math.
            // But UI might want recent on top. let's return Oldest first (Calculation order) for correctness in table, 
            // UI can reverse if needed, but Table reads better Top-Down for math.
        });

    } catch (error) {
        console.error('Fetch Ledger Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
