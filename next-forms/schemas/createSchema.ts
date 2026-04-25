import { z } from 'zod';
import { nonEmptyString } from '@/schemas/_utils';

// 選択肢のスキーマ
export const choiceInputSchema = z.object({
  choiceText: nonEmptyString('選択肢')
  .refine((value) => !/[\r\n]/.test(value), {
    message: '選択肢に改行を含めることはできません。',
  }),
});
export type ChoiceInputType = z.infer<typeof choiceInputSchema>;

// 質問１件のスキーマ
// 質問全てに共通するスキーマ
const baseQuestionSchema = z.object({
  questionText: nonEmptyString('質問'),
  questionType: z.enum(['text', 'paragraph', 'radiobutton', 'checkboxes']),
});
// questionType によって場合分け
export const questionInputSchema = z.discriminatedUnion('questionType', [
  baseQuestionSchema.extend({
    questionType: z.enum(['text', 'paragraph']),
    choices: z.array(choiceInputSchema).max(0, { message: 'テキスト系質問には選択肢を設定できません。' }).optional(),
  }),
  baseQuestionSchema.extend({
    questionType: z.enum(['radiobutton', 'checkboxes']),
    choices: z
      .array(choiceInputSchema)
      .min(1, { message: '選択肢を追加してください。' })
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
  }),
]);
export type QuestionInputType = z.infer<typeof questionInputSchema>;

// フォーム全体のスキーマ
export const baseFormSchema = z.object({
  formTitle: nonEmptyString('タイトル'),
  description: z
    .string()
    .max(255, { message: '説明は255文字以内で入力してください。' })
    .optional(),
});
export const createFormSchema = baseFormSchema.extend({
  questions: z
    .array(questionInputSchema)
    .min(1, { message: '質問を追加してください。' })
    .max(50, { message: '質問は50件以内で入力してください。' }),
});
export type CreateFormType = z.infer<typeof createFormSchema>;