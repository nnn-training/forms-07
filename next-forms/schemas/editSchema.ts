import { z } from 'zod';
import { baseFormSchema, choiceInputSchema, questionInputSchema } from '@/schemas/createSchema';

export const additionalChoicesSchema = z.record(
  z.string(),
  z
    .array(choiceInputSchema)
    .max(50, { message: '選択肢は50件以内で入力してください。' })
    .superRefine((choices, ctx) => {
      const choiceTextSet = new Set<string>();

      choices.forEach((choice, index) => {
        const trimmedChoiceText = choice.choiceText.trim();

        if (choiceTextSet.has(trimmedChoiceText)) {
          ctx.addIssue({
            code: 'custom',
            message: '選択肢の内容が重複しています。',
            path: [index, 'choiceText'],
          });
          return;
        }

        choiceTextSet.add(trimmedChoiceText);
      });
    }),
);

export type AdditionalChoicesType = z.infer<typeof additionalChoicesSchema>;

export const editFormSchema = baseFormSchema.extend({
  formId: z.string(),
  additionalChoices: additionalChoicesSchema.optional(),
  questions: z.array(questionInputSchema).max(50, { message: '質問は50件以内で入力してください。' }).optional(),
});
export type EditFormType = z.infer<typeof editFormSchema>;