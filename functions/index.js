const functions = require("firebase-functions");
const {onValueWritten} = require("firebase-functions/v2/database");
const {logger} = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();

// update a place's average scores after a user submits a score
exports.updatePlaceOverallScore = onValueWritten("/places/{place_id}/scores/{user_uid}/overall", (event) => {
  let place_id = event.params.place_id
  let scoresRef = db.ref(`places/${place_id}/scores`)
  scoresRef.once('value', function(snapshot) {
    let scores = snapshot.val()
    let average = 0
    let count = Object.keys(scores).length
    for (const user_uid in scores) {
      average = average + Number(scores[user_uid].overall)
    }
    average = (average / count).toFixed(1)
    let averagesRef = db.ref(`places/${place_id}/averages`)
    return averagesRef.update({
      overall: average
    })
  })
});
