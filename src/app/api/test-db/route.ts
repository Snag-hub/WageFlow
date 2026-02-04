import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
    try {
        // Test database connection
        await prisma.$connect();

        // Try a simple query
        const companyCount = await prisma.company.count();

        return NextResponse.json({
            status: 'success',
            message: 'Database connection successful',
            companyCount,
            databaseUrl: process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET'
        });
    } catch (error: any) {
        console.error('Database Test Error:', error);

        return NextResponse.json({
            status: 'error',
            message: error.message,
            code: error.code,
            databaseUrl: process.env.DATABASE_URL ? 'Set (hidden for security)' : 'NOT SET',
            hint: 'Check if DATABASE_URL is correctly set in Vercel environment variables'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}
