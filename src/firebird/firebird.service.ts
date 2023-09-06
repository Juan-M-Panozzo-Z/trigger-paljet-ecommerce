import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as firebird from 'node-firebird';
import { Model } from 'mongoose';
import { Event } from './models/event.model';
import { Article } from 'src/paljet-sync/models/article.model';
import { retryWhen, delay, take } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class FirebirdService implements OnModuleInit {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectModel(Article.name) private readonly articleModel: Model<Article>,
  ) {}

  private options = {
    host: 'rigelec.com.ar',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  onModuleInit() {
    this.listenToChanges();
    this.watchEvents();
  }

  listenToChanges() {
    this.connectToFirebird();
  }

  connectToFirebird() {
    firebird.attach(this.options, (err, db) => {
      if (err) {
        console.error('Error connecting to Firebird database:', err);
        this.retryConnection();
        return;
      }

      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 214, 88)';
      setInterval(() => {
        try {
          db.query(query, [], (err, events) => {
            if (err) throw err;
            events.forEach(async (event) => {
              const existingEvent = await this.eventModel.findOne({
                TRANSACTION_ID: event.TRANSACTION_ID,
              });
              if (!existingEvent) {
                const newEvent = new this.eventModel(event);
                newEvent.save();
              }
            });
          });
        } catch (error) {
          console.error('Error querying Firebird database:', error);
        }
      }, 1000);
    });
  }

  retryConnection() {
    console.log('Connection to Firebird lost. Retrying...');
    of(null)
      .pipe(
        delay(5000), // Delay for 5 seconds before retrying
        take(10), // Retry 10 times
        retryWhen((errors) => errors),
      )
      .subscribe(() => {
        console.log('Retrying connection to Firebird...');
        this.connectToFirebird();
      });
  }

  async watchEvents() {
    const changeStream = this.eventModel.watch();

    changeStream.on('change', async (change) => {
      if (change.operationType === 'insert') {
        const newEvent = change.fullDocument;
        const value = Number(newEvent.CAMPO_ID.split('=')[1].split(',')[0]);
        console.log('Nuevo evento:', newEvent);
        switch (newEvent.TABLA_ID) {
          case 1:
            console.log('Evento en tabla "ARTICULOS"');
            const existingArticle = await this.articleModel.findOne({
              _id: value,
            });
            if (existingArticle) {
              console.log('Artículo existente. Actualizar');
            }
            break;
          case 88:
            console.log('Evento en tabla "ARTPR"');
            break;
          case 214:
            console.log('Evento en tabla "STOCK"');
            break;
        }
      }
    });

    changeStream.on('error', (error) => {
      console.error('Change stream error:', error);
    });
  }
}
