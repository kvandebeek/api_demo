import type { DefectFlags, EvaluationResult } from './types.js';

const VALID_CHARS = /^[0-9+\-*/().\s]+$/;

export function evaluateExpression(expression: string, flags: DefectFlags = {}): EvaluationResult {
  const trimmed = expression.trim();
  if (!trimmed) throw new Error('Expression is required.');
  if (!VALID_CHARS.test(trimmed)) throw new Error('Invalid characters in expression.');

  const normalized = trimmed.replace(/\s+/g, '');

  if (flags.bugDivisionAlwaysReturns2 && normalized.includes('/')) {
    return { expression: trimmed, normalizedExpression: normalized, value: 2 };
  }

  const safe = normalized.replace(/(\d)(\()/g, '$1*(').replace(/(\))(\d)/g, ')*$2');

  if (/\/0(?!\d)/.test(safe)) {
    throw new Error('Division by zero is not allowed.');
  }

  const value = Function(`"use strict"; return (${safe});`)();
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('Expression did not produce a finite number.');
  }

  return { expression: trimmed, normalizedExpression: normalized, value };
}
