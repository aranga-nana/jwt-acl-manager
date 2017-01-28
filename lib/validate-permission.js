var q = require('q');
var _ = require('lodash');

module.exports = {
    create: function (secret, permissionDef, tokenFactory) {


        return function (result) {
            var deferred = q.defer();
            var tokenResult = tokenFactory.parseRequest(result.req);
            var verify = tokenFactory.verify;

            if (result.ignore) {

                deferred.resolve(result.req);
            }
            else {
                if (tokenResult.status) {
                    deferred.reject(tokenResult);
                }
                else {
                    verify(secret, tokenResult.token).then(function (payload) {
                        if (hasRights(result.access, payload.loggedInAs)) {
                            result.req.jwtPayLoad = payload;
                            deferred.resolve(result.req);
                        }
                        else {
                            deferred.reject({ status: 401, "message": "Insufficient privileges", "name": "ValidatePermission" })
                        }

                    }).catch(function (err) {
                        console.error(err);
                        deferred.reject(err);
                    });


                }
            }


            return deferred.promise;
        };

        //private 
        function hasRights(rightsAry, permissionBitMask) {
            var ret = false;



            _.each(rightsAry, function (v, i) {

                if (permissionDef[v] && (permissionDef[v] & permissionBitMask) > 0) {

                    ret = true;
                }
            });
            return ret;
        }

    }
}

