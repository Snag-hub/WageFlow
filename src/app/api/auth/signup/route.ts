import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(req: Request) {
    try {
        const { companyName, email, password } = await req.json();

        if (!companyName || !email || !password) {
            return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create company and user in a transaction
        const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
            const company = await tx.company.create({
                data: {
                    name: companyName,
                },
            });

            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash: hashedPassword,
                    role: 'admin',
                    companyId: company.id,
                },
            });

            return { company, user };
        });

        return NextResponse.json({ message: 'Account created successfully', result }, { status: 201 });
    } catch (error: any) {
        console.error('Signup Error:', error);

        // Return more specific error messages
        if (error.code === 'P2002') {
            return NextResponse.json({ message: 'Email already exists' }, { status: 400 });
        }

        if (error.message?.includes('connect')) {
            return NextResponse.json({ message: 'Database connection error. Please check your DATABASE_URL.' }, { status: 500 });
        }

        return NextResponse.json({
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        }, { status: 500 });
    }
}
