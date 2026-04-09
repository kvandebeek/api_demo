export type CalculationRequestedEvent = {
  type: 'calculation.requested';
  expression: string;
  timestamp: string;
};

export type CalculationCompletedEvent = {
  type: 'calculation.completed';
  expression: string;
  result: number;
  timestamp: string;
};

export type CalculationFailedEvent = {
  type: 'calculation.failed';
  expression: string;
  error: string;
  timestamp: string;
};

export type CalculatorEvent =
  | CalculationRequestedEvent
  | CalculationCompletedEvent
  | CalculationFailedEvent;
