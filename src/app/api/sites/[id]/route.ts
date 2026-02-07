import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - Get a single site
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const site = await prisma.site.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                siteTransactions: {
                    orderBy: { date: 'desc' },
                    include: { payer: { select: { name: true } } }
                },
                payer: { select: { name: true } }
            }
        });

        if (!site) {
            return NextResponse.json({ message: 'Site not found' }, { status: 404 });
        }

        return NextResponse.json(site);
    } catch (error) {
        console.error('Fetch Site Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update a site
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const {
            name,
            location,
            clientId,
            pricingModel,
            rate,
            quantity,
            contractAmount,
            includesMaterial,
            notes,
            payerId
        } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Site name is required' }, { status: 400 });
        }

        // Verify site belongs to company
        const existingSite = await prisma.site.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
        });

        if (!existingSite) {
            return NextResponse.json({ message: 'Site not found' }, { status: 404 });
        }

        const updatedSite = await prisma.site.update({
            where: { id },
            data: {
                name: name.trim(),
                location: location?.trim() || null,
                clientId: clientId || null,
                pricingModel: pricingModel || 'item_rate',
                rate: rate ? parseFloat(rate) : null,
                quantity: quantity ? parseFloat(quantity) : null,
                contractAmount: contractAmount ? parseFloat(contractAmount) : null,
                includesMaterial: !!includesMaterial,
                notes: notes?.trim() || null,
                payerId: payerId || null
            },
        });

        return NextResponse.json(updatedSite);
    } catch (error) {
        console.error('Update Site Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete a site
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        // Verify site belongs to company
        const site = await prisma.site.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                _count: {
                    select: { attendance: true }
                }
            }
        });

        if (!site) {
            return NextResponse.json({ message: 'Site not found' }, { status: 404 });
        }

        // Check if site has attendance records
        if (site._count.attendance > 0) {
            return NextResponse.json(
                { message: 'Cannot delete site with existing attendance records' },
                { status: 400 }
            );
        }

        await prisma.site.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Site deleted successfully' });
    } catch (error) {
        console.error('Delete Site Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
