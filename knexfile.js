'use strict';

module.exports = {
  development: {
    client: 'pg',
    connection: 'postgres://hmlbvgfy:GWS5Qlr9eticsOVNMSpqC8oT1vDd01yp@elmer.db.elephantsql.com:5432/hmlbvgfy'   || { 
      user: 'dev',
      database: 'noteful-app'
    }
  },
  test: {
    client: 'pg',
    connection: 'postgres://hmlbvgfy:GWS5Qlr9eticsOVNMSpqC8oT1vDd01yp@elmer.db.elephantsql.com:5432/hmlbvgfy' ||  {
      user:'dev',
      database: 'notefultest'
    }
  },
  production: {
    client: 'pg',
    connection: 'postgres://hmlbvgfy:GWS5Qlr9eticsOVNMSpqC8oT1vDd01yp@elmer.db.elephantsql.com:5432/hmlbvgfy' || process.env.DATABASE_URL
  }
};


