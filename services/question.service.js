var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('question');

var service = {};

service.authenticate = authenticate;
service.create = create;
service.delete = _delete;
service.getAll = getAll;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    db.users.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve({token :jwt.sign({ sub: user._id }, config.secret), userId: user._id});
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}


function create(body) {
    var deferred = Q.defer();

    // validation
    db.question.findOne(
        { question: body.question },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Question "' + body.question  + '" is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {

        db.question.insert(
            body,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();

    // validation
    db.question.find(
        {}).toArray(
        function (err, list_question) {
            if (err) deferred.reject(err.name + ': ' + err.message);
                // username already exists
                console.log(list_question)
            deferred.resolve(list_question);
        });

    return deferred.promise;

}


function _delete(_id) {
    var deferred = Q.defer();

    db.question.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}