var express = require('express');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();

/*
 * GET eventslist.
 */
router.get('/eventslist', function(req, res) {
    var db = req.db;
    db.collection('eventslist').find().toArray(function (err, items) {
        res.json(items);
    });
});

/*
 * Show specific event.
 */
router.get('/event/:id', function(req, res) {
    var db = req.db;

    db.collection('eventslist').find({ "_id": new ObjectId(req.params.id) }).toArray(function (err, items) {
    	res.json((items.length === 1) ? items[0] : { _id: req.params.id });
    });
});

/*
 * POST to addevent.
 */
router.post('/addevent', function(req, res) {
    var db = req.db;
    db.collection('eventslist').insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

/*
 * DELETE to deletevent.
 */
router.delete('/deletevent/:id', function(req, res) {
    var db = req.db;
    var eventToDelete = req.params.id;
    db.collection('eventslist').removeById(eventToDelete, function(err, result) {
        res.send((result === 1) ? { msg: '' } : { msg:'error: ' + err });
    });
});
/*
 * UPDATE to updatevent.
 */
router.post('/updatevent/:id', function(req, res) {
    req.db.collection('eventslist').update(
        { "_id": new ObjectId(req.params.id) },
        { $set: req.body }, function(err, result) {
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
        });
});

module.exports = router;

