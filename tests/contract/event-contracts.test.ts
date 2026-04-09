import { describe, expect, it } from 'vitest';
import type { CalculatorEvent } from '@qa/event-contracts';

describe('event contracts', () => {
  it('accepts completed event shape', () => {
    const event: CalculatorEvent = {
      type: 'calculation.completed',
      expression: '2+2',
      result: 4,
      timestamp: new Date().toISOString()
    };

    expect(event.type).toBe('calculation.completed');
  });
});
