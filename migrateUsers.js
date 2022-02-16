const admin = require('firebase-admin');

const users = require('./backed_up/users_setting.json');
const professions = require('./domain_json/professions.json');
const bands = require('./domain_json/bands.json');

function migrateUsers() {
  users.forEach((user) => {
    const userId = user.id;
    const bandId = user.band_id;
    const professionId = user.profession_id;
    const currentBand = bands.find((band) => band.id === bandId);
    const currentProfession = professions.find(
      (profession) => professionId === profession.id
    );

    const userData = {
      id: userId,
      email: userId,
      name: userId,
      current_profession: currentProfession,
      current_band: currentBand,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    admin.firestore().collection('users').doc(userId).set(userData);
  });
}

module.exports = migrateUsers;
