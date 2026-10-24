const { subjectregister, unittest1, unittest2, midTerm, final, getunittest1, getfinal, getunittest2, getmidTerm, viewsubjects, studentSubjects } = require("../service/reportservice")

exports.subjectregister=async(req,res)=>
{
    await subjectregister(req,res);
}

exports.unittest1=async(req,res)=>
{
    await unittest1(req,res);
}

exports.unittest2=async(req,res)=>
{
    await unittest2(req,res);
}

exports.midTerm=async(req,res)=>
{
    await midTerm(req,res);
}

exports.final=async(req,res)=>
{
    await final(req,res);
}
exports.getmidTerm=async(req,res)=>
{
    await getmidTerm(req,res);
}
exports.getunittest1=async(req,res)=>
{
    await getunittest1(req,res);
}
exports.getunittest2=async(req,res)=>
{
    await getunittest2(req,res);
}
exports.getfinal=async(req,res)=>
{
    await getfinal(req,res);
}

exports.viewsubjects=async(req,res)=>
{
    await viewsubjects(req,res);
}

exports.studentSubjects=async(req,res)=>
{
    await studentSubjects(req,res);
}