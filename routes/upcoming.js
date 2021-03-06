const router = require('express-promise-router')();
const UpcomingController = require('../controllers/upcoming');
const { validateParam, validateBody, schemas } = require('../helpers/routeHelpers');

router.route('/')
  .get(UpcomingController.getUpcomingMeetups);

router.route('/calendars')
  .get(UpcomingController.getCalendars);

module.exports = router;
