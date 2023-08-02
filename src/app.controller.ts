import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose/dist/common';
import { Connection } from 'mongoose';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly appService: AppService,
  ) {}

  @Get()
  async getMongoose(): Promise<string> {
    const isConnected = this.connection.readyState;
    if (isConnected) {
      return 'La conexión con la base de datos está activa';
    }
  }
}
