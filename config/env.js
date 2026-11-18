import 'dotenv/config';

const env = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/students',
  JWT_SECRET: process.env.JWT_SECRET || 'dev-only-secret-change-me',

  // AI Provider Selection
  GROK_ENABLE: process.env.GROK_ENABLE === 'true',

  // Groq
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GROQ_MODEL: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',

  // OpenRouter
  OPEN_ROUTER_API_KEY: process.env.OPEN_ROUTER_API_KEY || '',
  OPEN_ROUTER_MODEL: process.env.OPEN_ROUTER_MODEL || 'meta-llama/llama-3.3-70b-instruct',

  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
};

export default env;
