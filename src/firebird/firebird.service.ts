import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
    host: 'rigelec.com.ar',
    // host: '10.16.10.16',
    port: 3050,
    database: 'D:\\ETSOL\\PaljetERP\\database\\DBSIF.FDB',
    user: 'SYSDBA',
    password: 'masterkey',
  };

  onModuleInit() {
    this.listenToChanges();
  }

  listenToChanges() {
    firebird.attach(this.options, (err, db) => {
      if (err) {
        console.error('Error connecting to Firebird database:', err);
        return;
      }
      const query = 'SELECT * FROM DB_NOTIF WHERE TABLA_ID IN (1, 214, 88)';
      setInterval(() => {
        try {
          db.query(query, [], (err, result) => {
            if (err) throw err;
            if (result.length > 0) {
              console.log('Changes detected in Firebird database');
              console.log(result);
            }
          });
        } catch (err) {
          console.log(err);
        }
      }, 100);
    });
  }
}
