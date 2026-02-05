import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

// GET - Fetch entries for a specific date and site (Merged with Employee list)
export async function GET(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get('date');
    const siteId = searchParams.get('siteId');

    if (!dateStr || !siteId) {
        return NextResponse.json({ message: 'Date and Site ID are required' }, { status: 400 });
    }

    try {
        const date = new Date(dateStr);
        // Normalize date to start of day (UTC or matching db storage convention)
        // For simplicity, we assume the date passed is correct YYYY-MM-DD

        const companyId = session.user.companyId;

        // 1. Get all active employees
        const employees = await prisma.employee.findMany({
            where: {
                companyId,
                isActive: true
            },
            orderBy: { name: 'asc' }
        });

        // 2. Get existing attendance for this date/site
        const attendance = await prisma.attendance.findMany({
            where: {
                companyId,
                siteId,
                date: {
                    gte: new Date(date.setHours(0, 0, 0, 0)),
                    lt: new Date(date.setHours(23, 59, 59, 999))
                }
            }
        });

        return NextResponse.json({ employees, attendance });
    } catch (error) {
        console.error('Fetch Attendance Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

// POST - Bulk Upsert Attendance
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.companyId) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { date, siteId, records } = await req.json();

        if (!date || !siteId || !Array.isArray(records)) {
            return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
        }

        const companyId = session.user.companyId;
        const targetDate = new Date(date);

        // Transaction to ensure atomicity
        await prisma.$transaction(async (tx) => {
            for (const record of records) {
                const { employeeId, isPresent, wage, workTypeId, payerId } = record;

                // Only process if we have minimal valid data (or if marking absent)
                if (!employeeId) continue;

                if (isPresent) {
                    if (!workTypeId || !payerId) {
                        throw new Error(`Missing Work Type or Payer for present employee ${employeeId}`);
                    }

                    // Upsert: Update if exists, Create if not
                    // We need to find by unique constraint. 
                    // Since we don't have a unique compound index on [date, employeeId, siteId] in the schema yet (maybe we should?),
                    // we'll do a findFirst + update/create logic or update the schema.
                    // Checking schema... no unique constraint on Attendance.
                    // So we must be careful not to duplicate.

                    // Delete existing for this employee on this date/site to prevent dupes (simplest "replace" strategy)
                    // ACTUALLY: An employee can only be at one site per day? Or multiple?
                    // Usually one site per day for daily wage. 
                    // Let's assume one site per day for now to keep it simple, OR just delete pre-existing record for this specific site.

                    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

                    // Deleting potential existing record for this specific site/employee/date combination
                    await tx.attendance.deleteMany({
                        where: {
                            companyId,
                            employeeId,
                            siteId, // If we want to allow working on multiple sites, keep siteId. If 1 site/day, remove siteId. keeping siteId for flexibility.
                            date: { gte: startOfDay, lt: endOfDay }
                        }
                    });

                    // Create new
                    await tx.attendance.create({
                        data: {
                            companyId,
                            employeeId,
                            siteId,
                            date: targetDate,
                            isPresent: true,
                            wage: parseFloat(wage),
                            workTypeId,
                            payerId
                        }
                    });
                } else {
                    // If marked absent (isPresent: false), we remove the record if it exists
                    // strict "Attendance" table means only present records usually.
                    // But if we want to track "Absent", we'd update isPresent=false.
                    // However, your schema defaults isPresent=true. 
                    // Let's just DELETE the record if they are unchecked in the UI. To keep table clean.

                    const startOfDay = new Date(targetDate); startOfDay.setHours(0, 0, 0, 0);
                    const endOfDay = new Date(targetDate); endOfDay.setHours(23, 59, 59, 999);

                    await tx.attendance.deleteMany({
                        where: {
                            companyId,
                            employeeId,
                            siteId,
                            date: { gte: startOfDay, lt: endOfDay }
                        }
                    });
                }
            }
        });

        return NextResponse.json({ message: 'Attendance saved successfully' });
    } catch (error: any) {
        console.error('Save Attendance Error:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
