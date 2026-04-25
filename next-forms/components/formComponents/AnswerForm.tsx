'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';

import { saveAnswersAction } from '@/actions/saveAnswersAction';
import { AnswerFormType, answerFormSchema } from '@/schemas/answerSchema';

type Props = {
  form: {
    formId: string;
    formTitle: string;
    description: string;
    formattedCreatedAt: string;
    formattedUpdatedAt: string;
    createdBy: string;
    questions: {
      questionId: string;
      questionText: string;
      questionType: string;
      choices: string[];
    }[];
  };
};

export default function AnswerForm(props: Props) {
  const { form } = props;
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AnswerFormType>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      formId: form.formId,
      answers: {},
    },
  });

  const onSubmit = async (data: AnswerFormType) => {
    const result = await saveAnswersAction(data);
    if (!result.success) {
      let errorMessage = '';
      switch (result.error) {
        case 'VALIDATION_ERROR':
          errorMessage = '入力に誤りがあります。';
          break;
        case 'LOGIN_REQUIRED':
          errorMessage = 'ログインが必要です。';
          break;
        case 'ALREADY_ANSWERED':
          errorMessage = 'このフォームには既に回答しています。';
          break;
        case 'ACTION_FAILED':
          errorMessage = '回答の送信に失敗しました。';
          break;
      }
      console.error(errorMessage);
      router.push('/');
    } else {
      console.log('回答を送信しました。');
      router.push(`/forms/${form.formId}/responses`);
    }
  };

  const questions = form.questions.map((question, index) => {
    const questionNumber = index + 1;
    const renderAnswerField = () => {
      switch (question.questionType) {
        case 'text':
          return (
            <input
              type="text"
              {...register(`answers.${question.questionId}`)}
              className="block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
            />
          );

        case 'paragraph':
          return (
            <textarea
              {...register(`answers.${question.questionId}`)}
              className="block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-full"
            />
          );

        case 'radiobutton':
          return question.choices.map((choice) => (
            <label key={choice} className="pr-4 md:flex md:gap-2">
              <input
                type="radio"
                {...register(`answers.${question.questionId}`)}
                value={choice}
              />
              {choice}
            </label>
          ));

        case 'checkboxes':
          return question.choices.map((choice) => (
            <label key={choice} className="pr-4 md:flex md:gap-2">
              <input
                type="checkbox"
                {...register(`answers.${question.questionId}`)}
                value={choice}
              />
              {choice}
            </label>
          ));
      }
    };
    return (
      <div key={question.questionId} className="my-4">
        <h3>
          質問 {questionNumber}: {question.questionText}
        </h3>
        {renderAnswerField()}
        {errors.answers?.[question.questionId] && (
          <p className="text-sm text-red-500">
            {errors.answers[question.questionId]?.message}
          </p>
        )}
      </div>
    );
  });

  return (
    <div className="justify-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-lg">{form.formTitle}</h1>
        <p>{form.description}</p>
        <p className="pt-4">作成者：{form.createdBy}</p>
        <p>作成日時：{form.formattedCreatedAt}</p>
        {form.formattedUpdatedAt === form.formattedCreatedAt ? null : (
          <p>更新日時：{form.formattedUpdatedAt}</p>
        )}
        {questions}
        <button
          type="submit"
          className="w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 mt-20 bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700"
        >
          回答を送信する
        </button>
      </form>
    </div>
  );
}