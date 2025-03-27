// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findConditionType = (conditions: any, conditionType: string) =>
  conditions?.find(
    (condition: { type: string; status: string }) =>
      condition?.type === conditionType && condition?.status === 'True',
  );
