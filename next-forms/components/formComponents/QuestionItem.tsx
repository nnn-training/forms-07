'use client';

import { useFieldArray, useFormContext, useWatch, type FieldErrors } from 'react-hook-form';
import { ChoiceItem } from '@/components/formComponents/ChoiceItem';

import type { QuestionInputType } from '@/schemas/createSchema';

type Props = {
  questionIndex: number;
  errors: FieldErrors<QuestionInputType>;
  removeQuestion: (index: number) => void;
};

export default function QuestionItem({
  questionIndex,
  errors,
  removeQuestion,
}: Props) {
  const { register } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    name: `questions.${questionIndex}.choices`,
  });

  const addChoice = () => {
    append({
      choiceText: '',
    });
  };
  const removeChoice = (choiceIndex: number) => {
    remove(choiceIndex);
  };

  const questionType = useWatch({
    name: `questions.${questionIndex}.questionType`,
  });

  // raidobutton / checkboxes : choiceItem (「選択肢を追加」ボタン) を表示
  //     text    / paragraph  : テキストフィールド風の div 要素を表示（実際は静的表示）
  const renderQuestionField = () => {
    switch (questionType) {
      case 'radiobutton':
      case 'checkboxes':
        return (
          <div className="max-w-md">
            {fields.map((field, index) => (
              <ChoiceItem
                key={field.id}
                questionIndex={questionIndex}
                choiceIndex={index}
                errors={errors.choices?.[index] || {}}
                removeChoice={removeChoice}
              />
            ))}
            <div className="text-center">
              <button
                onClick={addChoice}
                type="button"
                className="text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 py-1 px-5 me-1 my-1"
              >
                選択肢を追加
              </button>
            </div>
            {errors.choices?.message && (
              <p className="text-sm text-red-500">
                {errors.choices?.message}
              </p>
            )}
          </div>
        );
      case 'text':
        return (
          <div className="block p-2.5 w-full text-sm border-b border-gray-300">
            1 行のテキスト
          </div>
        );
      case 'paragraph':
        return (
          <div className="block p-2.5 w-full text-sm border-b border-gray-300">
            複数行のテキスト
          </div>
        );
    }
  };

  return (
    <div
      className="questions block mt-5 p-6 bg-white border border-gray-200 rounded-lg"
      id={`question${questionIndex}`}
    >
      <p>質問 {questionIndex + 1}</p>
      <div className="flex justify-between mb-3">
        <input
          type="text"
          {...register(`questions.${questionIndex}.questionText`)}
          className="block p-2.5 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 w-1/2"
        />
        <select
          id={`questionType${questionIndex}`}
          {...register(`questions.${questionIndex}.questionType`)}
        >
          <option id={`${questionIndex}text`} value="text">
            1 行のテキスト
          </option>
          <option id={`${questionIndex}paragraph`} value="paragraph">
            複数行のテキスト
          </option>
          <option id={`${questionIndex}radiobutton`} value="radiobutton">
            ラジオボタン
          </option>
          <option id={`${questionIndex}checkboxes`} value="checkboxes">
            チェックボックス
          </option>
        </select>
        <button
          type="button"
          onClick={() => removeQuestion(questionIndex)}
          className="text-red-500 px-5 rounded-lg border"
        >
          削除
        </button>
      </div>
      {errors.questionText?.message && (
        <p className="text-sm text-red-500">
          {errors.questionText.message}
        </p>
      )}
      {renderQuestionField()}
    </div>
  );
}