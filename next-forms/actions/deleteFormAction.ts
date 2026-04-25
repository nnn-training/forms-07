'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import verifyFormEditPermission from '@/lib/verifyFormEditPermission';
import type { OperationResult } from '@/lib/operationResultType';

export default async function deleteFormAction(
  formId: string
): Promise<OperationResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'LOGIN_REQUIRED' };
  }

  const form = await prisma.form.findUnique({
    where: { formId },
    select: { createdBy: true },
  });
  if (!form) {
    return { success: false, error: 'NOT_FOUND' };
  }

  const permissionResult = await verifyFormEditPermission(session, form.createdBy);
  if (!permissionResult.success) {
    return permissionResult;
  }

  try {
    await prisma.form.delete({
      where: {
        formId: formId,
      },
    });
  } catch (error) {
    console.error('deleteFormAction Error: ', error);
    return { success: false, error: 'ACTION_FAILED' };
  }
  return { success: true };
}