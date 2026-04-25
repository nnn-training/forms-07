import prisma from '@/lib/prisma';
import { OperationResult } from '@/lib/operationResultType';

import type { Session } from 'next-auth';

export default async function verifyFormEditPermission(
  session: Session | null,
  createdBy: string,
): Promise<OperationResult> {
  if (!session?.user?.id) {
    return { success: false, error: 'LOGIN_REQUIRED' };
  }
  const user = await prisma.user.findUnique({
    where: { userId: session.user.id },
    select: { userId: true, isAdmin: true },
  });

  if (!user) {
    return { success: false, error: 'USER_NOT_FOUND' };
  }
  if (user.userId !== createdBy && !user.isAdmin) {
    return { success: false, error: 'NO_PERMISSION' };
  }
  return { success: true };
}