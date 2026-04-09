import amqp from 'amqplib';
import mqtt from 'mqtt';
import type { CalculatorEvent } from '@qa/event-contracts';
import { config } from './config.js';

export interface EventPublisher {
  publish(event: CalculatorEvent): Promise<void>;
}

class ConsolePublisher implements EventPublisher {
  async publish(event: CalculatorEvent) {
    console.info('event', event);
  }
}

class RabbitPublisher implements EventPublisher {
  private connectionPromise = amqp.connect(config.rabbitUrl);

  async publish(event: CalculatorEvent) {
    const connection = await this.connectionPromise;
    const channel = await connection.createChannel();
    await channel.assertExchange('calculator.events', 'topic', { durable: false });
    channel.publish('calculator.events', event.type, Buffer.from(JSON.stringify(event)));
    await channel.close();
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

export function createPublisher(provider = config.brokerProvider): EventPublisher {
  if (provider === 'rabbitmq') return new RabbitPublisher();
  if (provider === 'mqtt') return new MqttPublisher();
  if (provider === 'activemq') return new RabbitPublisher();
  return new ConsolePublisher();
}
