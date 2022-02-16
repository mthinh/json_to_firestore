const admin = require('firebase-admin');

const path = require('path');
const fs = require('fs');

const directoryPath = path.join(__dirname, 'domain_json');

function importDomainData() {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return console.log(`Unable to scan directory: ${err}`);
    }

    files.forEach((file) => {
      const lastDotIndex = file.lastIndexOf('.');

      const domain = require(`./domain_json/${file}`);
      const domainName = file.substring(0, lastDotIndex);

      domain.forEach((item) => {
        admin
          .firestore()
          .collection(domainName)
          .doc(item.id)
          .set(item)
          .then(() => {
            console.log('Document written');
          })
          .catch((error) => {
            console.error('Error adding document: ', error);
          });
      });
    });
  });
}

module.exports = importDomainData;
