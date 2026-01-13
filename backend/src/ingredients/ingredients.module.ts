import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CollaborationModule } from '../collaboration/collaboration.module';
import { IngredientsController } from './ingredients.controller';
import { IngredientsService } from './ingredients.service';

@Module({
  imports: [DatabaseModule, CollaborationModule],
  controllers: [IngredientsController],
  providers: [IngredientsService],
})
export class IngredientsModule {}
