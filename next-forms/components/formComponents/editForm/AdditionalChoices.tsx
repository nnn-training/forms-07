'use client';

import { useFieldArray, type FieldErrors } from 'react-hook-form';

import ChoiceInputRow from '@/components/formComponents/editForm/ChoiceInputRow';

import type { EditFormType } from '@/schemas/editSchema';

type AdditionalChoicesProps = {
  questionId: string;
  errors: FieldErrors<EditFormType>;
};

export default function AdditionalChoices({
  questionId,
  errors,
}: AdditionalChoicesProps) {
  const { fields, append, remove } = useFieldArray({
    name: `additionalChoices.${questionId}`,
  });
  
  const choiceErrors = errors.additionalChoices?.[questionId] || [];

  return (
    <div className="mt-2 max-w-md">
      <p className="font-medium">追加の選択肢</p>
      {fields.map((field, index) => (
        <ChoiceInputRow
          key={field.id}
          questionId={questionId}
          index={index}
          errors={choiceErrors?.[index] || {}}
          remove={remove}
        />
      ))}
      <button
        type="button"
        onClick={() => append({ choiceText: '' })}
        className="py-1 px-3 text-sm text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
      >
        選択肢を追加
      </button>
    </div>
  );
}