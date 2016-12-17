/**
 * Auth token factory
 */
var jwt = require('jsonwebtoken');
var _ = require('lodash');
var q = require('q');

module.exports = {
    parseRequest: parseRequest,
    verify: verify,
    generateToken: generateToken
};

//implementation
function parseRequest(req) {
    if (!req.headers.authorization) {

        return { status: "401", messsage: "missing authorization header", "name": "auth-token-parser" };
    }

    var ary = _.split(req.headers.authorization, ' ');
    if (ary.length != 2) {

        return { status: 401, messsage: "Invalid authorization header", "name": "auth-token-parser" };
    }
    return { token: ary[1] };

}

function verify(secret, data) {
    var deferred = q.defer();

    jwt.verify(data, secret, function (err, payload) {

        if (err) {

            deferred.reject(err);
            return;
        }
        console.log(payload);
        deferred.resolve(payload);
    });

    return deferred.promise;

}
function generateToken(secret, payload, option) {
    var deferred = q.defer();
    jwt.sign(payload, secret, option, function (err, token) {
        //console.log(data);
        if (err) {
            deferred.reject(err);
        }
        else {
            deferred.resolve(token);
        }

    });
    return deferred.promise;
}