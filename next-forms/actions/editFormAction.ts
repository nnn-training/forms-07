'use server';

import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import verifyFormEditPermission from '@/lib/verifyFormEditPermission';
import { editFormSchema } from '@/schemas/editSchema';
import type { OperationResultWithFormId } from '@/lib/operationResultType';

export default async function editFormAction(
  data: unknown,
): Promise<OperationResultWithFormId> {

  const parsed = editFormSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: 'VALIDATION_ERROR',
    };
  }
  const parsedData = parsed.data;

  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: 'LOGIN_REQUIRED' };
  }
  const formId = parsedData.formId;

  const form = await prisma.form.findUnique({
    where: { formId },
    select: { createdBy: true },
  });
  if (!form) {
    return { success: false, error: 'NOT_FOUND' };
  }

  const permissionResult = await verifyFormEditPermission(session, form.createdBy);
  if (!permissionResult.success) {
    return permissionResult;
  }

  const additionalQuestionsLength = parsedData.questions?.length ?? 0;
  // 既存質問との合計をチェック
  if (additionalQuestionsLength > 0) {
    const existingQuestionLength = await prisma.question.count({
      where: { formId },
    });
    if (existingQuestionLength + additionalQuestionsLength > 50) {
      return { success: false, error: 'VALIDATION_ERROR' };
    }
  }

  // 追加する選択肢について検証
  const validatedAdditionalChoices: {
    questionId: string;
    choices: string[];
  }[] = [];
  if (parsedData.additionalChoices) {
    const entries = Object.entries(parsedData.additionalChoices);
    const submittedQuestionIds = entries.map(([questionId]) => questionId);
    const existingQuestions = await prisma.question.findMany({
      where: {
        formId,
        questionId: { in: submittedQuestionIds },
      },
      select: {
        questionId: true,
        questionType: true,
        choices: true,
      },
    });
    if (existingQuestions.length !== submittedQuestionIds.length) {
      return { success: false, error: 'VALIDATION_ERROR' };
    }
    const formQuestionsMap = new Map(
      existingQuestions.map((q) => [q.questionId, q]),
    );

    for (const [questionId, choices] of entries) {
      const question = formQuestionsMap.get(questionId);
      if (!question) {
        return { success: false, error: 'VALIDATION_ERROR' };
      }

      // questionType をチェック
      if (
        question.questionType !== 'radiobutton' &&
        question.questionType !== 'checkboxes'
      ) {
        return { success: false, error: 'VALIDATION_ERROR' };
      }

      // 既存選択肢との重複をチェック
      const additionalChoiceTexts = choices.map((c) => c.choiceText.trim());
      const existingSet = new Set(question.choices.map((c) => c.trim()));
      for (const c of additionalChoiceTexts) {
        if (existingSet.has(c)) {
          return { success: false, error: 'VALIDATION_ERROR' };
        }
      }
      // 既存選択肢との合計をチェック
      if (question.choices.length + additionalChoiceTexts.length > 50) {
        return { success: false, error: 'VALIDATION_ERROR' };
      }

      validatedAdditionalChoices.push({
        questionId,
        choices: question.choices.concat(additionalChoiceTexts),
      });
    }
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.form.update({
        where: { formId: formId },
        data: {
          formTitle: parsedData.formTitle,
          description: parsedData.description,
        },
      });

      // 新しい質問の追加
      if (parsedData.questions?.length) {
        const additionalQuestions = parsedData.questions.map((question) => ({
          formId: formId,
          questionText: question.questionText,
          questionType: question.questionType,
          choices: question.choices?.map((choice) => choice.choiceText) ?? [],
        }));
        await tx.question.createMany({ data: additionalQuestions });
      }

    // 既存質問への選択肢追加
    if (validatedAdditionalChoices.length > 0) {
      await Promise.all(
        validatedAdditionalChoices.map(async (additionalChoice) => {
          await tx.question.update({
            where: { questionId: additionalChoice.questionId },
            data: {
              choices: {
                set: additionalChoice.choices,
              },
            },
          });
        }),
      );
    }
  });
  } catch (error) {
    console.error('editFormAction Error: ', error);
    return { success: false, error: 'ACTION_FAILED' };
  }

  return { success: true, formId: formId };
}