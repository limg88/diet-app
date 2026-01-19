import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolConfig, QueryResultRow } from 'pg';
import { buildPoolConfig } from './db-config';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const poolConfig = buildPoolConfig({
      DATABASE_URL: this.configService.get<string>('DATABASE_URL'),
      DB_MODE: this.configService.get<string>('DB_MODE'),
      DB_SSL: this.configService.get<string>('DB_SSL'),
      DB_SSL_REJECT_UNAUTHORIZED: this.configService.get<string>('DB_SSL_REJECT_UNAUTHORIZED'),
      DATABASE_SSL: this.configService.get<string>('DATABASE_SSL'),
      DATABASE_SSL_REJECT_UNAUTHORIZED: this.configService.get<string>(
        'DATABASE_SSL_REJECT_UNAUTHORIZED',
      ),
      DATABASE_POOL_MAX: this.configService.get<string>('DATABASE_POOL_MAX'),
      DATABASE_POOL_IDLE_TIMEOUT_MS: this.configService.get<string>(
        'DATABASE_POOL_IDLE_TIMEOUT_MS',
      ),
      DATABASE_POOL_CONN_TIMEOUT_MS: this.configService.get<string>('DATABASE_POOL_CONN_TIMEOUT_MS'),
    });
    this.logTargetDatabase(poolConfig.connectionString, poolConfig.ssl, poolConfig);
    this.pool = new Pool(poolConfig);
    await this.pool.query('SELECT 1');
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
    }
  }

  async query<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []) {
    if (!this.pool) {
      throw new Error('Database connection is not initialized.');
    }
    return this.pool.query<T>(text, params);
  }

  private logTargetDatabase(
    connectionString?: string,
    ssl?: PoolConfig['ssl'],
    poolConfig?: PoolConfig,
  ) {
    if (!connectionString) {
      this.logger.warn('Database connection string is not set.');
      return;
    }

    try {
      const url = new URL(connectionString);
      const host = url.hostname || 'unknown';
      const port = url.port || '5432';
      const dbName = url.pathname?.replace(/^\//, '') || 'unknown';
      const mode = this.configService.get<string>('DB_MODE') ?? 'unknown';
      const sslEnabled = Boolean(ssl);
      const max = poolConfig?.max ?? 'default';

      this.logger.log(
        `DB target: mode=${mode} host=${host} port=${port} db=${dbName} ssl=${sslEnabled} poolMax=${max}`,
      );
    } catch {
      this.logger.warn('Unable to parse DATABASE_URL for logging.');
    }
  }
}
