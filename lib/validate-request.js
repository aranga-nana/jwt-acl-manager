var q = require('q');
var _ = require('lodash');

module.exports = function (acl) {

    return validateRequest;



    function validateRequest(req) {
        var deferred = q.defer();


        if (req.resource) {
            
            if (acl[req.resource]) {
                var requiredRights = acl[req.resource][req.method];
                deferred.resolve({ req: req, access: requiredRights });
                 
            } else {
                var requiredRights = [];
                ignore = true;
                _.each(acl, function (v, k) {
                    if (_.endsWith(k, '*')) {
                        r = _.replace(k, '/*', '');


                        if (req.resource.indexOf(r) != -1) {
                            console.log(req.resource,'path match to acl:',k);
                            if (v[req.method]) {
                                requiredRights = v[req.method];
                                ignore = false;
                            }
                        }
                    }
                });
                if (ignore) {
                     console.error('no permission required for path:',req.resource);
                    deferred.resolve({ req: req, ignore: true });
                }
                else {
                    
                    deferred.resolve({ req: req, access: requiredRights });
                }

            }

        }
        else {
            console.error("no resource set");
            deferred.reject({ status: 400, message: "invalid http request", "name": "validateRequestPath" });
        }
        return deferred.promise;
    }
};


