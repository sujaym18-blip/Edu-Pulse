const { conditionupdate, driverdetails, viewdrivers, studenttransportdetails, viewstudenttransport, viewtransportconditions, viewroutebyid, viewroutes, addroute, viewallstudenttransport } = require("../service/transportservice")


exports.conditionupdate=async(req,res)=>
{
    await conditionupdate(req,res);
}

exports.conditionview=async(req,res)=>
{
    await viewtransportconditions(req,res);
}

exports.driverdetails=async(req,res)=>
{
    await driverdetails(req,res);
}

exports.viewdrivers=async(req,res)=>
{
    await viewdrivers(req,res);
}

exports.studenttransportdetails=async(req,res)=>
{
    await studenttransportdetails(req,res);
}

exports.studenttransportview=async(req,res)=>
{
    await viewstudenttransport(req,res);
}
exports.addroute=async(req,res)=>
{
    await addroute(req,res);
}
exports.viewroutes=async(req,res)=>
{
    await viewroutes(req,res);
}
exports.viewroutebyid=async(req,res)=>
{
    await viewroutebyid(req,res);
}

exports.viewallstudenttransport=async(req,res)=>
{
    await viewallstudenttransport(req,res);
}