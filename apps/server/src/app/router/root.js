import * as express from 'express'
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.status(200).send('hello word');
});

// router.post('/api/blob', function(req, res, next) {
//   console.log(req.body)
//   res.status(200)
// })

export default router