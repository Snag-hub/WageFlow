import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - Get a single employee
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
        const employee = await prisma.employee.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
            include: {
                attendance: {
                    orderBy: { date: 'desc' },
                    take: 10,
                    include: { site: { select: { name: true } } }
                },
                transactions: {
                    orderBy: { date: 'desc' },
                    take: 10
                },
                _count: {
                    select: { attendance: true, transactions: true }
                }
            }
        });

        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        return NextResponse.json(employee);
    } catch (error) {
        console.error('Fetch Employee Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update an employee
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
        const { name, phone, type, defaultWage } = await req.json();

        if (!name || name.trim() === '') {
            return NextResponse.json({ message: 'Name is required' }, { status: 400 });
        }

        const existingEmployee = await prisma.employee.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
        });

        if (!existingEmployee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        const updatedEmployee = await prisma.employee.update({
            where: { id },
            data: {
                name: name.trim(),
                phone: phone?.trim() || null,
                type: type || 'daily',
                defaultWage: parseFloat(defaultWage) || 0,
            },
        });

        return NextResponse.json(updatedEmployee);
    } catch (error) {
        console.error('Update Employee Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete an employee
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

        // Check ownership
        const employee = await prisma.employee.findFirst({
            where: {
                id,
                companyId: session.user.companyId,
            },
        });

        if (!employee) {
            return NextResponse.json({ message: 'Employee not found' }, { status: 404 });
        }

        // Delete employee (Cascade will handle related data if configured, 
        // but Prisma onDelete: Cascade is at the DB level usually)
        await prisma.employee.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        console.error('Delete Employee Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
