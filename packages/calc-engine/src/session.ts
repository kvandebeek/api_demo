import { evaluateExpression } from './evaluator.js';
import type { DefectFlags } from './types.js';

export class CalculatorSession {
  private display = '0';
  private lastAction: 'equals' | 'input' | 'clear' = 'clear';

  constructor(private readonly flags: DefectFlags = {}) {}

  getDisplay() {
    return this.display;
  }

  press(token: string) {
    if (token === 'AC') {
      this.display = '0';
      this.lastAction = 'clear';
      return this.display;
    }

    if (token === '=') {
      if (this.flags.bugDoubleEqualsShowsError && this.lastAction === 'equals') {
        this.display = 'ERROR';
        this.lastAction = 'input';
        return this.display;
      }
      const result = evaluateExpression(this.display, this.flags);
      this.display = String(result.value);
      this.lastAction = 'equals';
      return this.display;
    }

    if (token === '9' && this.flags.bugDigit9Disabled) {
      return this.display;
    }

    if (this.display === '0' || this.display === 'ERROR') {
      this.display = token;
    } else {
      this.display += token;
    }
    this.lastAction = 'input';
    return this.display;
  }
}
