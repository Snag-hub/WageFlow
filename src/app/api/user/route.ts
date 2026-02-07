import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import prisma from '@/lib/prisma';

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { hasSeenTutorial } = await req.json();

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: { hasSeenTutorial },
        });

        return NextResponse.json({
            message: 'User updated successfully',
            user: { hasSeenTutorial: updatedUser.hasSeenTutorial }
        });
    } catch (error: any) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: error.message || 'Internal server error' }, { status: 500 });
    }
}
