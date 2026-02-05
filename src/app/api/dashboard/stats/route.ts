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
        const companyId = session.user.companyId;

        // Fetch stats in parallel
        const [employeeCount, siteCount, recentAttendance] = await Promise.all([
            prisma.employee.count({ where: { companyId } }),
            prisma.site.count({ where: { companyId } }),
            prisma.attendance.findMany({
                where: { companyId },
                take: 5,
                orderBy: { date: 'desc' },
                include: {
                    employee: true,
                    site: true
                }
            })
        ]);

        // For now, mock the financial and percentage stats until those modules are more populated
        return NextResponse.json({
            employees: employeeCount,
            sites: siteCount,
            attendanceRate: 0, // Calculate this later
            pendingDues: 0,    // Calculate this later
            recentAttendance: recentAttendance.map((a: any) => ({
                id: a.id,
                employeeName: a.employee.name,
                siteName: a.site.name,
                status: a.isPresent ? 'Present' : 'Absent',
                time: a.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }))
        });
    } catch (error) {
        console.error('Fetch Dashboard Stats Error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
