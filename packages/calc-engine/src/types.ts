export type DefectFlags = {
  bugDigit9Disabled?: boolean;
  bugDivisionAlwaysReturns2?: boolean;
  bugDoubleEqualsShowsError?: boolean;
};

export type EvaluationResult = {
  expression: string;
  value: number;
  normalizedExpression: string;
};
