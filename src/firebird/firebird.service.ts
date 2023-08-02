import { Injectable, OnModuleInit } from '@nestjs/common';
import * as firebird from 'node-firebird';

@Injectable()
export class FirebirdService implements OnModuleInit {
  private options = {
    host: 'rigelec.com.ar',
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

// if (err) throw err;

//       const query = `
//     SELECT
//       RDB$TRIGGER_NAME
//     FROM
//       RDB$TRIGGERS
//     WHERE
//       RDB$SYSTEM_FLAG = 0
//       AND RDB$TRIGGER_INACTIVE = 0
//   `;

//       db.query(query, [], function (err, result) {
//         if (err) throw err;
//         console.log('Triggers activos:');
//         result.forEach((row) => {
//           console.log(row.RDB$TRIGGER_NAME);
//         });
//         db.detach(function () {
//           console.log('Desconectado de la base de datos.');
//         });
//       });
//     });
// }
