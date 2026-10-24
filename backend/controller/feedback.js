const { viewfeedback, addfeedback, feedbackRatings } = require("../service/feedbackservice");


exports.addfeedback=async(req,res)=>
{
    await addfeedback(req,res);
}

exports.viewfeedback=async(req,res)=>
{
    await viewfeedback(req,res);
}

exports.feedbackRatings=async(req,res)=>
{
    await feedbackRatings(req,res);
}