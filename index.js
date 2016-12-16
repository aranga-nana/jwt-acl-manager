var jwt = require('jsonwebtoken');
var _ = require('lodash');
var q = require('q');

module.exports = function (secret, option, acl, permissionDef) {

    var authFactory = {
        generateToken: generateToken,
        verify: verify,
        accessController: accessController
		

    };
    return authFactory;

    //implementation
    function accessController(req, resp, next) {

        if (!req.headers.authorization) {
            resp.send({ status: "401", messsage: "cannot find authorization header" }, 401);
			
            return;
        }

        var ary = _.split(req.headers.authorization, ' ');
        if (ary.length != 2) {
            resp.send({ status: 401, messsage: "Invalid authorization header",name:"Unauthorized access" }, 401);
		
            return;
        }
		
        validate(ary[1],req).then(checkAccess).then(function (req) {
            
            next();
        }).catch(function (err) {
            resp.send(err, 401);
			return;
			
            
        });

        function checkAccess(result) {
            var deferred = q.defer();
            var p = result.payload.loggedInAs;
            var req = result.req;
         
            if (req.resource) {
                
                if (acl[req.resource] ){
                    ary = acl[req.resource][req.method];
                  
                    if (_checkPermission(ary,p)){
                        deferred.resolve(req);
                    } 
                    else{
                        deferred.reject({status:401,message:"no access right for resource",name:"Unauthorized Access"});
                    }   
                }else{
                    var eff=[];
                    _.each(acl,function(v,k){
                        if (_.endsWith(k,'*')){
                            r = _.replace(k,'/*','');
                           
                            if (req.resource.indexOf(r) != -1){
                                console.log('V',v[req.method]);
                                if (v[req.method]){
                                    eff =v[req.method];
                                }
                                
                                
                            }
                        }    
                    });
                    if (eff.length ==0){
                        deferred.reject({status:401,message:"no access right",name:"Unauthorized Access",err:new Error()});
                    }
                    else {
                        var ret = _checkPermission(eff,p);
                      
                        if (ret){
                             deferred.resolve(req);
                        }else{
                             deferred.reject({status:401,message:"no access right",name:"Unauthorized Access"});
                        }

                    }

                }
  
            }
            else {

                deferred.reject({ status: 400, message: "invalid http request" });
            }

            //private methods
            function _checkPermission(ary,p){
				console.log('_checkPermission()');
                var ret = false;
                _.each(ary,function(v,i){
		
                    if (permissionDef[v] && (permissionDef[v] & p) > 0) {
                      
                       ret = true;
                    }    
                });
                return ret;
            }


            return deferred.promise;



        }
    }




    function  generateToken(payload) {
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
    function verify(data) {
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
    function validate(token,req){
        var deferred = q.defer();
        verify(token).then(function(payload){
            deferred.resolve({req:req,payload:payload});

        }).catch(function(e){
            deferred.reject(e);
        });
        return deferred.promise;
    }
};
