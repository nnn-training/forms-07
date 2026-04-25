'use client';

import AdditionalChoices from '@/components/formComponents/editForm/AdditionalChoices';

import type { EditFormType } from '@/schemas/editSchema';
import type { Question } from '@prisma/client';
import type { FieldErrors } from 'react-hook-form';

type EditChoicesProps = {
  currentQuestions: Question[];
  errors: FieldErrors<EditFormType>;
};

export default function EditChoices({
  currentQuestions,
  errors,
}: EditChoicesProps) {
  const questionTypeLabel = (questionType: string) => {
    switch (questionType) {
      case 'text':
        return '1 行のテキスト';
      case 'paragraph':
        return '複数行のテキスト';
      case 'radiobutton':
        return 'ラジオボタン';
      case 'checkboxes':
        return 'チェックボックス';
    }
  };

  return (
    <>
      <div className="my-10">
        <p className="text-xl font-semibold">既存の質問項目</p>
        {currentQuestions.map((question, index) => (
          <div
            key={question.questionId}
            className="my-4 p-4 border rounded-lg bg-gray-50"
          >
            <div className="flex justify-between">
              <p className="font-medium">
                質問 {index + 1}: {question.questionText}
              </p>
              <p>{questionTypeLabel(question.questionType)}</p>
            </div>
            {question.choices.length > 0 && (
              <ul className="ml-4 mt-2 list-disc">
                {question.choices.map((choice, i) => (
                  <li key={i}>
                    選択肢 {i + 1}: {choice}
                  </li>
                ))}
              </ul>
            )}
            {(question.questionType === 'radiobutton' ||
              question.questionType === 'checkboxes') && (
              <AdditionalChoices
                questionId={question.questionId}
                errors={errors}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
}