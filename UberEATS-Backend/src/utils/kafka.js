import { Kafka } from 'kafkajs';

// Connect to Kafka brokers from env variables or use default localhost
const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'ubereats-service',
  brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
  // Add retry configuration
  retry: {
    initialRetryTime: 100,
    retries: 5
  }
});

// Create producer and consumer instances
export const producer = kafka.producer({
  allowAutoTopicCreation: true,
  transactionTimeout: 30000
});
export const consumer = kafka.consumer({ 
  groupId: process.env.KAFKA_GROUP_ID || 'ubereats-group',
  sessionTimeout: 30000
});

// Flag to track connection status
let isProducerConnected = false;
let isConsumerConnected = false;

/**
 * Initialize Kafka connections with timeout and retry logic
 * @returns {Promise<boolean>} True if connected successfully
 */
export const initKafka = async () => {
  try {
    // Set a timeout for connection attempts
    const connectionTimeout = 10000; // 10 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Kafka connection timeout')), connectionTimeout)
    );

    // Connect producer with timeout
    try {
      await Promise.race([
        producer.connect(),
        timeoutPromise
      ]);
      console.log('Kafka producer connected successfully');
      isProducerConnected = true;
    } catch (producerError) {
      console.warn('Kafka producer connection failed:', producerError.message);
      isProducerConnected = false;
    }

    // Connect consumer with timeout (only if producer connected)
    if (isProducerConnected) {
      try {
        await Promise.race([
          consumer.connect(),
          timeoutPromise
        ]);
        console.log('Kafka consumer connected successfully');
        isConsumerConnected = true;
      } catch (consumerError) {
        console.warn('Kafka consumer connection failed:', consumerError.message);
        isConsumerConnected = false;
      }
    }

    // Return overall connection status
    const kafkaConnected = isProducerConnected && isConsumerConnected;
    console.log(`Kafka initialization ${kafkaConnected ? 'successful' : 'partial or failed'}`);
    return kafkaConnected;
  } catch (error) {
    console.error('Kafka initialization error:', error.message);
    return false;
  }
};

/**
 * Check if the Kafka producer is connected
 * @returns {boolean} Connection status
 */
export const isKafkaConnected = () => {
  return isProducerConnected;
};

/**
 * Safely send a message to Kafka
 * @param {string} topic - Kafka topic
 * @param {string} key - Message key
 * @param {object} value - Message value (will be stringified)
 * @returns {Promise<boolean>} True if message was sent
 */
export const sendKafkaMessage = async (topic, key, value) => {
  try {
    // First check if producer is connected
    if (!isProducerConnected) {
      console.warn(`Kafka producer not connected - message to ${topic} not sent`);
      return false;
    }

    // Double-check connection status through API if possible
    try {
      if (typeof producer.isConnected === 'function' && !producer.isConnected()) {
        console.warn(`Kafka producer disconnected - message to ${topic} not sent`);
        return false;
      }
    } catch (error) {
      // Ignore errors from isConnected check
    }

    // Attempt to send the message
    await producer.send({
      topic: topic,
      messages: [{ 
        key: key, 
        value: typeof value === 'string' ? value : JSON.stringify(value)
      }]
    });
    
    console.log(`Kafka message sent to topic ${topic} with key ${key}`);
    return true;
  } catch (error) {
    console.warn(`Kafka send error to topic ${topic}:`, error.message);
    return false;
  }
};

/**
 * Gracefully disconnect from Kafka
 */
export const disconnectKafka = async () => {
  try {
    if (isProducerConnected) {
      await producer.disconnect();
      isProducerConnected = false;
    }
    
    if (isConsumerConnected) {
      await consumer.disconnect();
      isConsumerConnected = false;
    }
    
    console.log('Kafka disconnected successfully');
  } catch (error) {
    console.error('Error disconnecting from Kafka:', error.message);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, disconnecting Kafka');
  await disconnectKafka();
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, disconnecting Kafka');
  await disconnectKafka();
}); 