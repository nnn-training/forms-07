'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';

import { createFormAction } from '@/actions/createFormAction';
import QuestionItem from '@/components/formComponents/QuestionItem';
import { createFormSchema, CreateFormType } from '@/schemas/createSchema';

export default function CreatePage() {
  const router = useRouter();
  // 新しいフォームを定義
  const methods = useForm<CreateFormType>({
    resolver: zodResolver(createFormSchema),
    defaultValues: {
      formTitle: '無題のフォーム',
      description: '',
      questions: [
        {
          questionText: '無題の質問',
          questionType: 'radiobutton',
          choices: [],
        }
      ],
    },
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  // 配列のフォーム(質問事項)を定義
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const addQuestion = () => {
    append({
      questionText: '無題の質問',
      questionType: 'radiobutton',
      choices: [],
    });
  };

  const removeQuestion = (index: number) => {
    remove(index);
  };

  const onSubmit = async (data: CreateFormType) => {
    const result = await createFormAction(data);
    if (!result.success) {
      let errorMessage = '';
      switch (result.error) {
        case 'VALIDATION_ERROR':
          errorMessage = '入力に誤りがあります。';
          break;
        case 'LOGIN_REQUIRED':
          errorMessage = 'ログインが必要です。';
          break;
        case 'USER_NOT_FOUND':
          errorMessage = 'ユーザが見つかりません。';
          break;
        case 'ACTION_FAILED':
          errorMessage = 'フォームの作成に失敗しました。';
          break;
      }
      console.error(errorMessage);
      router.push('/');
    } else {
      console.log('フォームを作成しました。');
      router.push(`/forms/${result.formId}`);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="mt-10">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div>
            <h5>フォームのタイトル</h5>
            <input
              type="text"
              {...register(`formTitle`)}
              className="block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
            />
            {errors.formTitle?.message && (
              <p className="text-sm text-red-500">
                {errors.formTitle?.message}
              </p>
            )}
          </div>
          <div>
            <div>フォームの説明</div>
            <textarea
              {...register(`description`)}
              className="block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
            ></textarea>
            {errors.description?.message && (
              <p className="text-sm text-red-500">
                {errors.description?.message}
              </p>
            )}
          </div>
          <p>質問項目</p>
          <div>
            {fields.map((field, index) => (
              <div key={field.id}>
                <QuestionItem
                  questionIndex={index}
                  errors={errors.questions?.[index] || {}}
                  removeQuestion={removeQuestion}
                />
              </div>
            ))}
          </div>
          {errors.questions?.message && (
            <p className="text-sm text-red-500">
              {errors.questions?.message}
            </p>
          )}
          <button
            type="button"
            className="text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 py-2.5 px-5 me-2 my-2"
            onClick={addQuestion}
          >
            質問を追加
          </button>

          <button
            className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-20 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
            type="submit"
          >
            フォームをつくる
          </button>
        </form>
      </div>
    </FormProvider>
  );
}