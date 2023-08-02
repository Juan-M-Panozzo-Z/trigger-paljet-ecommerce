import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebirdService } from './firebird/firebird.service';
@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, FirebirdService],
})
export class AppModule {}
