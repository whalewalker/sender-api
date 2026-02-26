export default function configuration() {
  return {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10),

    mongodb: {
      uri: process.env.MONGODB_URI ?? 'mongodb://localhost:27017/sender_db',
    },

    jwt: {
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-this',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },

    ai: {
      defaultProvider: process.env.AI_DEFAULT_PROVIDER ?? 'gemini',
      geminiApiKey: process.env.GEMINI_API_KEY ?? '',
      geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
      claudeModel: process.env.CLAUDE_MODEL ?? 'claude-sonnet-4-6',
    },

    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
      apiKey: process.env.CLOUDINARY_API_KEY ?? '',
      apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    },

    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      callbackUrl:
        process.env.GOOGLE_CALLBACK_URL ??
        'http://localhost:3000/api/auth/google/callback',
      redirectUrl:
        process.env.GOOGLE_REDIRECT_URL ?? 'http://localhost:5173/auth/callback',
    },

    cors: {
      allowedOrigins: (process.env.ALLOWED_ORIGINS ?? 'http://localhost:3000')
        .split(',')
        .map((o) => o.trim()),
    },
  };
}

export type AppConfig = ReturnType<typeof configuration>;
