'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, FormProvider } from 'react-hook-form';

import editFormAction from '@/actions/editFormAction';
import EditChoices from '@/components/formComponents/editForm/EditChoices';
import QuestionItem from '@/components/formComponents/QuestionItem';
import { EditFormType, editFormSchema } from '@/schemas/editSchema';

import type { Form, Question } from '@prisma/client';

type CurrentFormProps = {
  currentForm: Form;
  currentQuestions: Question[];
};

export default function EditForm(props: CurrentFormProps) {
  const { currentForm, currentQuestions } = props;
  const router = useRouter();
  const methods = useForm<EditFormType>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      formId: currentForm.formId,
      formTitle: currentForm.formTitle,
      description: currentForm.description,
      additionalChoices: {},
      questions: [],
    },
  });
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: EditFormType) => {
    const result = await editFormAction(data);
    if (!result.success) {
      let errorMessage = '';
      switch (result.error) {
        case 'VALIDATION_ERROR':
          errorMessage = '入力に誤りがあります。';
          break;
        case 'LOGIN_REQUIRED':
          errorMessage = 'ログインが必要です。';
          break;
        case 'NOT_FOUND':
          errorMessage = 'フォームが見つかりません。';
          break;
        case 'NO_PERMISSION':
          errorMessage = 'このフォームを編集する権限がありません。';
          break;
        case 'ACTION_FAILED':
          errorMessage = 'フォームの編集に失敗しました。';
          break;
      }
      console.error(errorMessage);
      router.push('/');
    } else {
      console.log('フォームを編集しました。');
      router.push(`/forms/${result.formId}`);
    }
  };

  const {
    fields: additionalQuestionFields,
    append,
    remove,
  } = useFieldArray({
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-10"
      >
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

        {/* 既存の質問の表示 + 選択肢の追加 */}
        <EditChoices
          currentQuestions={currentQuestions}
          errors={errors}
        />

        {/* 質問の追加 */}
        <div>
          <h3 className="text-xl font-semibold">追加の質問</h3>
          {additionalQuestionFields.map((field, index) => (
            <QuestionItem
              key={field.id}
              questionIndex={index}
              errors={errors.questions?.[index] || {}}
              removeQuestion={removeQuestion}
            />
          ))}
          <button
            type="button"
            onClick={addQuestion}
            className="text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 py-2.5 px-5 me-2 my-2"
          >
            質問を追加
          </button>
        </div>
        <button
          className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-20 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700"
          type="submit"
        >
          この内容でフォームを編集する
        </button>
      </form>
    </FormProvider>
  );
}