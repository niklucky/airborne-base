module.exports = {
  version: '0.1.0',
  description: 'Test example',
  debug: true,
  db: {
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      driver: 'mysql',
      password: '12345',
      database: 'MeHappy'
    }
  },
  sources: {
    test: 'users'
  }
};
