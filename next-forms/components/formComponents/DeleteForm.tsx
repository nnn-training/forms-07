'use client';

import { useRouter } from 'next/navigation';

import deleteFormAction from '@/actions/deleteFormAction';

export default function DeleteForm({
  formId,
}: {
  formId: string;
}) {
  const router = useRouter();
  const deleteForm = async () => {
    const isConfirmed = window.confirm('本当に削除しますか？');
    if (!isConfirmed) return;

    const result = await deleteFormAction(formId);
    if (!result.success) {
      let errorMessage = '';
      switch (result.error) {
        case 'LOGIN_REQUIRED':
          errorMessage = 'ログインが必要です。';
          break;
        case 'NOT_FOUND':
          errorMessage = 'フォームが見つかりません。';
          break;
        case 'NO_PERMISSION':
          errorMessage = 'このフォームを削除する権限がありません。';
          break;
        case 'ACTION_FAILED':
          errorMessage = 'フォームの削除に失敗しました。';
          break;
      }
      console.error(errorMessage);
    } else {
      console.log('フォームを削除しました。');
    }
    router.push('/');
  };

  return (
    <form action={deleteForm}>
      <button
        className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-3 bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700"
        type="submit"
      >
        このフォームを削除する
      </button>
    </form>
  );
}