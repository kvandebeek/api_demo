import express from 'express';
import { z } from 'zod';
import { evaluateExpression } from '@qa/calc-engine';
import type { CalculatorEvent } from '@qa/event-contracts';
import { config } from './config.js';
import { createPublisher } from './events.js';

const requestSchema = z.object({ expression: z.string().min(1) });

export function createApp() {
  const app = express();
  app.use(express.json());
  const publisher = createPublisher();

  app.get('/health', (_req, res) => res.json({ ok: true, broker: config.brokerProvider }));

  app.get('/debug/state', (_req, res) => {
    res.json({
      flags: config.flags,
      brokerProvider: config.brokerProvider,
      stateMachine: ['input', 'equals', 'error']
    });
  });

  app.post('/calculate', async (req, res) => {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid payload', details: parsed.error.issues });
    }

    const expression = parsed.data.expression;
    const requested: CalculatorEvent = { type: 'calculation.requested', expression, timestamp: new Date().toISOString() };
    await publisher.publish(requested).catch(() => undefined);

    try {
      const result = evaluateExpression(expression, config.flags);
      const completed: CalculatorEvent = {
        type: 'calculation.completed',
        expression,
        result: result.value,
        timestamp: new Date().toISOString()
      };
      await publisher.publish(completed).catch(() => undefined);
      return res.json({ result: result.value, expression });
    } catch (error) {
      const failed: CalculatorEvent = {
        type: 'calculation.failed',
        expression,
        error: (error as Error).message,
        timestamp: new Date().toISOString()
      };
      await publisher.publish(failed).catch(() => undefined);
      return res.status(422).json({ error: (error as Error).message });
    }
  });

  return app;
}
