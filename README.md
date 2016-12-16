# simple access control list for restful endpoints 


### usage
```

var permissionDef={
    'USER_ROLE':1,
    'ADMIN_ROLE':2,
    'SITE_OWNER_ROLE':4,
    'CATEGORY_WRITE':8,
    'CATEGORY_DELETE':16

};
//access list with
var acl ={
    '/category':{
        'GET':['USER_ROLE','ADMIN_ROLE'],
        'POST':['ADMIN_ROLE'],
        'PUT':[],
        'DELETE':[]
     },
    '/category/{id}':{
        'GET':['USER_ROLE','ADMIN_ROLE'],
        'POST':[],
        'PUT':['ADMIN_ROLE','CATEGORY_WRITE'],
        'DELETE':['ADMIN']
     },
  
       '/orders/*':{
        'GET':['USER_ROLE','ADMIN_ROLE'],
        'POST':['ADMIN_ROLE'],
        'PUT':[],
        'DELETE':[]
     },
 
    
};
var options={
    expiresIn:320000,
    issuer:'urn:api:budget:acnonline.net',
   
};
var aclManger = require('jwt-acl-manager')('password',options,acl,permissionDef);
var express = require('express');
var app = express();
app.use(aclManger.accessController()); //add as middleware


//protected route
app.get('/category', function (req, resp) {
    resp.send({ id: new Date().getTime(), message: "category access" },200);
});

```