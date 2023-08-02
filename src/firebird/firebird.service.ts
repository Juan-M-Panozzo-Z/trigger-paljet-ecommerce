import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
    host: '10.16.10.16',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  onModuleInit() {
    this.listenToChanges();
  }

  listenToChanges() {
    firebird.attach(this.options, function (err, db) {
      const query = 'SELECT * FROM DB_NOTIF';
      setInterval(() => {
        db.query(query, [], function (err, result) {
          if (err) throw err;
          console.log(result);
        });
      }, 1000);
    });
  }
}
