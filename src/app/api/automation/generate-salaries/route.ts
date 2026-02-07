import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // This is a manual trigger for simplicity, but could be called by a cron job
        const today = new Date();
        const firstOfMonth = startOfMonth(today);
        const monthYear = format(firstOfMonth, 'MMMM yyyy');

        // Find all active salary employees who don't have a salary_credit this month
        const employees = await prisma.employee.findMany({
            where: {
                companyId: session.user.companyId,
                type: 'salary',
                isActive: true,
                transactions: {
                    none: {
                        type: 'salary_credit',
                        date: {
                            gte: firstOfMonth,
                            lte: endOfMonth(today)
                        }
                    }
                }
            }
        });

        if (employees.length === 0) {
            return NextResponse.json({ message: 'No salaries to process or already processed' });
        }

        const batches = employees.map(emp => {
            return prisma.transaction.create({
                data: {
                    companyId: session.user.companyId,
                    employeeId: emp.id,
                    type: 'salary_credit',
                    amount: emp.defaultWage,
                    date: firstOfMonth,
                    note: `Monthly Salary Credit for ${monthYear}`,
                    paymentMode: 'bank_transfer'
                }
            });
        });

        await prisma.$transaction(batches);

        return NextResponse.json({
            message: `Successfully processed ${employees.length} salaries`,
            processed: employees.length
        });
    } catch (error) {
        console.error('Salary Automation Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
