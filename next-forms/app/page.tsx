import Link from 'next/link';

import { auth } from '@/lib/auth';
import dateFormat from '@/lib/dateFormat';
import prisma from '@/lib/prisma';

export default async function TopPage() {
  const session = await auth();
  const currentUser = session?.user?.id ? await prisma.user.findUnique({
        where: { userId: session.user.id },
        select: { userId: true, isAdmin: true },
      })
    : null;

  const forms = await prisma.form.findMany({
    include: {
      user: {
        select: {
          username: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  const formCards = forms.map((form) => {
    const formattedCreatedAt = dateFormat(form.createdAt);
    const formattedUpdatedAt = dateFormat(form.updatedAt);
    const canEdit = currentUser ? (currentUser.userId === form.createdBy || currentUser.isAdmin) : false;
    return (
      <div key={form.formId} className="border border-gray-300 rounded p-3 m-3">
        <h2>タイトル：{form.formTitle}</h2>
        <p>説明：{form.description}</p>
        <p>作成日時：{formattedCreatedAt}</p>
        {formattedCreatedAt === formattedUpdatedAt ? null : (
          <p>更新日時：{formattedUpdatedAt}</p>
        )}
        <p className="mb-3">作成者：{form.user.username}</p>
        <Link
          href={`/forms/${form.formId}`}
          className="bg-red-500 hover:bg-red-700 text-white py-2 px-4 rounded-full"
        >
          回答する
        </Link>
        <Link
          href={`/forms/${form.formId}/responses`}
          className="bg-blue-500 hover:bg-blue-700 text-white py-2 px-4 rounded-full"
        >
          結果を見る
        </Link>
        {canEdit && (
          <Link
            href={`/forms/${form.formId}/edit`}
            className="bg-green-500 hover:bg-green-700 text-white py-2 px-4 rounded-full"
          >
            編集する
          </Link>
        )}
      </div>
    );
  });

  return (
    <>
      {formCards}
    </>
  );
}