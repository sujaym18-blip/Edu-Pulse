const express = require('express');
const { conditionupdate, studenttransportview, studenttransportdetails,  viewdrivers, driverdetails, conditionview, addroute, viewroutes, viewroutebyid, viewallstudenttransport } = require('../controller/transport');
const router = express.Router();
let auth=require('../middleware/admin');
let auths=require('../middleware/admission');

router.post('/conditionupdate',conditionupdate);
router.get('/conditionview',conditionview);
router.post('/driverdetails',auth,driverdetails);
router.get('/viewdrivers',viewdrivers);
router.post('/studenttransportdetails',auths,studenttransportdetails);
router.get('/studenttransportview',auths,studenttransportview);
router.post('/addroute',addroute);
router.get('/viewroutes',viewroutes);
router.get('/viewroutebyid/:id',viewroutebyid);
router.get('/viewallstudenttransport',viewallstudenttransport);

module.exports = router;
