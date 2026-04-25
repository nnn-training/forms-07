'use client';

import { useFormContext, type FieldErrors } from 'react-hook-form';

import type { ChoiceInputType } from '@/schemas/createSchema';

type Props = {
  questionIndex: number;
  choiceIndex: number;
  errors: FieldErrors<ChoiceInputType>;
  removeChoice: (index: number) => void;
};

export function ChoiceItem({
  questionIndex,
  choiceIndex,
  errors,
  removeChoice,
}: Props) {
  const { register } = useFormContext();

  return (
    <>
      <div className="flex justify-between mb-3">
        <p>選択肢 {choiceIndex + 1}</p>
        <input
          type="text"
          {...register(
            `questions.${questionIndex}.choices.${choiceIndex}.choiceText`,
          )}
          className="block w-1/2 p-1.5 text-sm text-gray-900 border-b border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => removeChoice(choiceIndex)}
          className="text-red-500 mr-10 px-5 rounded-lg border"
        >
          削除
        </button>
      </div>
      {errors.choiceText?.message && (
        <p className="text-sm text-red-500">{errors.choiceText.message}</p>
      )}
    </>
  );
}