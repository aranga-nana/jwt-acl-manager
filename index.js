
var _ = require('lodash');
var q = require('q');
var permissionValidateFactory = require('./lib/validate-permission');
var authTokenFactory = require('./lib/auth-token-factory');
var validateRequestCreator = require('./lib/validate-request');

module.exports = function (secret, option, acl, permissionDef) {
    var permissionValidator = permissionValidateFactory.create(secret, permissionDef, authTokenFactory);
    var validateRequest = validateRequestCreator(acl);

    var authFactory = {
        generateToken: function (payload) {
            console.log(payload);
            return authTokenFactory.generateToken(secret, payload, option);
        },
        verify: function (token) {
            return authTokenFactory.verify(secret, token);
        },
        accessController: function () {
            return accessController;
        }
    };
    return authFactory;

    //implementation
    function accessController(req, resp, next) {

        if (req.originalUrl) {
            req.resource = req.originalUrl;
        }
        validateRequest(req).then(permissionValidator).then(function (req) {
            next();
        }).catch(function (err) {
            resp.send(err,401);
        });

    }


};
