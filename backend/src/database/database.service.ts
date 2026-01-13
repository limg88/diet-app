import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool | null = null;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ??
      'postgresql://dietapp:dietapp@localhost:5433/dietapp';
    this.pool = new Pool({ connectionString });
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
}
