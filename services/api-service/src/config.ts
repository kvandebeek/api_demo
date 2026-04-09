import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.API_PORT ?? 3001),
  brokerProvider: process.env.BROKER_PROVIDER ?? 'rabbitmq',
  rabbitUrl: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  mqttUrl: process.env.MQTT_URL ?? 'mqtt://localhost:1883',
  activeMqUrl: process.env.ACTIVEMQ_URL ?? 'amqp://localhost:5672',
  flags: {
    bugDigit9Disabled: process.env.BUG_DIGIT_9_DISABLED === 'true',
    bugDivisionAlwaysReturns2: process.env.BUG_DIVISION_ALWAYS_RETURNS_2 === 'true',
    bugDoubleEqualsShowsError: process.env.BUG_DOUBLE_EQUALS_SHOWS_ERROR === 'true'
  }
};
