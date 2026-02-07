import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - Fetch transactions for a site
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const transactions = await prisma.siteTransaction.findMany({
            where: {
                siteId: id,
                site: { companyId: session.user.companyId }
            },
            include: { payer: { select: { name: true } } },
            orderBy: { date: 'desc' }
        });

        return NextResponse.json(transactions);
    } catch (error) {
        console.error('Fetch Site Transactions Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Record a site transaction (Income)
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const { amount, date, category, payerId, paymentMode, note } = await req.json();

        if (!amount || !date) {
            return NextResponse.json({ message: 'Amount and date are required' }, { status: 400 });
        }

        // Verify site ownership
        const site = await prisma.site.findFirst({
            where: { id, companyId: session.user.companyId }
        });

        if (!site) {
            return NextResponse.json({ message: 'Site not found' }, { status: 404 });
        }

        const transaction = await prisma.siteTransaction.create({
            data: {
                siteId: id,
                amount: parseFloat(amount),
                date: new Date(date),
                type: 'income',
                category: category || 'payment',
                payerId: payerId || null,
                paymentMode: paymentMode || 'cash',
                note: note || null
            }
        });

        return NextResponse.json(transaction);
    } catch (error) {
        console.error('Create Site Transaction Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
