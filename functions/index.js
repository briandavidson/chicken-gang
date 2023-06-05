const functions = require("firebase-functions");
const {onValueWritten} = require("firebase-functions/v2/database");
const {logger} = require("firebase-functions");
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.database();

// update a place's average scores after a user submits a score
exports.updatePlaceOverallScore = onValueWritten("/places/{place_id}/user_scores/{user_uid}", (event) => {
  let place_id = event.params.place_id
  let scoresRef = db.ref(`places/${place_id}/user_scores`)
  scoresRef.once('value', function(snapshot) {
    let user_scores = snapshot.val()
    let averages = {}
    let user_scores_count = Object.keys(user_scores).length
    for (const user_uid in user_scores) {
      let user_score_categories = user_scores[user_uid]
      for (const user_score_category in user_score_categories) {
        if (user_score_category !== 'comments') {
          if (!averages[user_score_category]) {
            averages[user_score_category] = 0
          }
          averages[user_score_category] = averages[user_score_category] + Number(user_score_categories[user_score_category])
        }
      }
    }
    logger.log('precalculated averages: ', averages)
    for (const average_score_category in averages) {
      averages[average_score_category] = (averages[average_score_category] / user_scores_count).toFixed(1)
      logger.log(average_score_category + ': ' + averages[average_score_category])
    }
    let averagesRef = db.ref(`places/${place_id}`)
    return averagesRef.update({
      averages: averages
    })
  })
});
