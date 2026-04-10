import amqp from 'amqplib';
import mqtt from 'mqtt';
import type { CalculatorEvent } from '@qa/event-contracts';
import { config } from './config.js';

export interface EventPublisher {
  publish(event: CalculatorEvent): Promise<void>;
}

class ConsolePublisher implements EventPublisher {
  constructor(private readonly reason: string) {}

  async publish(event: CalculatorEvent) {
    console.info(`[events] ${this.reason}; using console publisher`, event);
  }
}

class RabbitPublisher implements EventPublisher {
  constructor(private readonly connection: any) {}

  async publish(event: CalculatorEvent) {
    const channel = await this.connection.createChannel();
    try {
      await channel.assertExchange('calculator.events', 'topic', { durable: false });
      channel.publish('calculator.events', event.type, Buffer.from(JSON.stringify(event)));
    } finally {
      await channel.close();
    }
  }
}

class MqttPublisher implements EventPublisher {
  private client = mqtt.connect(config.mqttUrl);

  async publish(event: CalculatorEvent) {
    await new Promise<void>((resolve, reject) => {
      this.client.publish(`calculator/${event.type}`, JSON.stringify(event), (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }
}

async function connectAmqp(): Promise<any | null> {
  if (!config.amqpEnabled) {
    console.info('[events] AMQP disabled (set AMQP_ENABLED=true to enable broker publishing)');
    return null;
  }

  try {
    const connection = await amqp.connect(config.amqpUrl);
    console.info(`[events] Connected to AMQP broker at ${config.amqpUrl}`);
    return connection;
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    const message = `[events] Failed to connect to broker at ${config.amqpUrl}: ${reason}`;
    if (config.isLocalLikeEnv) {
      console.warn(`${message}. Continuing without broker in ${process.env.NODE_ENV ?? 'development'}.`);
      return null;
    }
    throw new Error(message);
  }
}

export async function createPublisher(provider = config.brokerProvider): Promise<EventPublisher> {
  if (provider === 'mqtt') return new MqttPublisher();

  if (provider === 'rabbitmq' || provider === 'activemq') {
    const connection = await connectAmqp();
    if (!connection) return new ConsolePublisher('AMQP unavailable');
    return new RabbitPublisher(connection);
  }

  return new ConsolePublisher(`unsupported broker provider '${provider}'`);
}
