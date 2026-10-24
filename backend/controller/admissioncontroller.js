const { admission,admissionlogin,studentprofile,viewstudent,payfee,viewbyids,studentprofile2, viewbyidstudent, updatestudent, deleteadmittedstudent} = require("../service/admissionservice");

exports.admission=async(req,res)=>
{
 await admission(req,res);
}

exports.admissionlogin=async(req,res)=>
{
    console.log("1")
 await admissionlogin(req,res);
 console.log("4")
}

exports.studentprofile=async(req,res)=>
{   console.log("5")
    await studentprofile(req,res);
    console.log("7")
}

exports.viewstudent=async(req,res)=>
{
    await viewstudent(req,res);
}

exports.deleteadmittedstudent=async(req,res)=>
{
    await deleteadmittedstudent(req,res);
}

exports.payfee=async(req,res)=>
{
    await payfee(req,res);  
}

exports.viewbyids=async(req,res)=>
{
    await viewbyids(req,res);
}

exports.studentprofile2=async(req,res)=>
{
    await studentprofile2(req,res);
}

exports.updatestudent=async(req,res)=>
{
    await updatestudent(req,res);
}

exports.viewbyidstudent=async(req,res)=>
{
    await viewbyidstudent(req,res);
}