import { describe, expect, it } from 'vitest';
import { CalculatorSession, evaluateExpression } from '../src/index.js';

describe('evaluateExpression', () => {
  it('handles precedence and parentheses', () => {
    expect(evaluateExpression('2 + 3 * (4 - 1)').value).toBe(11);
  });

  it('rejects invalid expressions', () => {
    expect(() => evaluateExpression('2 + a')).toThrow('Invalid characters');
  });

  it('rejects divide by zero', () => {
    expect(() => evaluateExpression('10 / 0')).toThrow('Division by zero');
  });

  it('supports defect flag for division', () => {
    expect(evaluateExpression('12/3', { bugDivisionAlwaysReturns2: true }).value).toBe(2);
  });
});

describe('CalculatorSession', () => {
  it('resets with AC', () => {
    const session = new CalculatorSession();
    session.press('1');
    session.press('AC');
    expect(session.getDisplay()).toBe('0');
  });

  it('supports repeated equals behavior defect', () => {
    const session = new CalculatorSession({ bugDoubleEqualsShowsError: true });
    session.press('2');
    session.press('+');
    session.press('2');
    expect(session.press('=')).toBe('4');
    expect(session.press('=')).toBe('ERROR');
  });

  it('supports digit 9 defect', () => {
    const session = new CalculatorSession({ bugDigit9Disabled: true });
    session.press('9');
    expect(session.getDisplay()).toBe('0');
  });
});
