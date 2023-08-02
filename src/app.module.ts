import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
import { MongodbTriggerService } from './mongodb-trigger/mongodb-trigger.service';
import { CatModule } from './cat/cat.module';

@Module({
  imports: [CatModule],
  controllers: [AppController],
  providers: [AppService, FirebirdService, MongodbTriggerService],
})
export class AppModule {}
