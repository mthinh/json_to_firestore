const admin = require('firebase-admin');

const serviceAccount = require('./service_account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'YOUR_APP_DATABASE_URL',
});

function main() {
  // Do what you want
}

main();
