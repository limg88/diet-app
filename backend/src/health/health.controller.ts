import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  getHealth() {
    return { status: 'ok' };
  }

  @Get('db')
  async getDatabaseHealth() {
    await this.databaseService.query('SELECT 1');
    return { status: 'ok', db: 'ok' };
  }
}
