'use client';

import { useFormContext, type FieldErrors } from 'react-hook-form';

import type { ChoiceInputType } from '@/schemas/createSchema';

type ChoiceInputRowProps = {
  questionId: string;
  index: number;
  errors: FieldErrors<ChoiceInputType>;
  remove: (index: number) => void;
};

export default function ChoiceInputRow({
  questionId,
  index,
  errors,
  remove,
}: ChoiceInputRowProps) {
  const { register } = useFormContext();

  return (
    <>
      <div className="flex justify-between mb-3">
        <p>選択肢 {index + 1}</p>
        <input
          type="text"
          {...register(`additionalChoices.${questionId}.${index}.choiceText`)}
          className="block w-1/2 p-1.5 text-sm text-gray-900 border-b border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500"
        />
        <button
          type="button"
          onClick={() => remove(index)}
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