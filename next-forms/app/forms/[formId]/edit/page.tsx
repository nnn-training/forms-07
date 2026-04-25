import { notFound } from 'next/navigation';

import DeleteForm from '@/components/formComponents/DeleteForm';
import EditForm from '@/components/formComponents/editForm/EditForm';
import { auth } from '@/lib/auth';
import fetchFormById from '@/lib/prismaFinders';
import verifyFormEditPermission from '@/lib/verifyFormEditPermission';

export default async function EditPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = await params;
  const form = await fetchFormById(formId);
  if (!form) {
    return notFound();
  }

  const session = await auth();
  const permissionResult = await verifyFormEditPermission(
    session,
    form.createdBy,
  );
  if (!permissionResult.success) {
    return notFound();
  }

  return (
    <div className="mt-10">
      <EditForm currentForm={form} currentQuestions={form.questions} />
      <div className="mt-10">危険な変更</div>
      <DeleteForm formId={form.formId} />
    </div>
  );
}