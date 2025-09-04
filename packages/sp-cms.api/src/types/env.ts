export interface Env {
  DB: D1Database;
  BUCKET: R2Bucket;
  ENVIRONMENT: string;
  TOKEN_SECRET: string;
}

declare global {
  interface CloudflareEnv extends Env {}
}
