let rec=require('../models/transport/driver');
let rec2=require('../models/transport/studenttransport');
let rec3=require('../models/transport/transportCondition');
let rec4=require('../models/transport/BusRoute');

exports.conditionupdate=async(req,res)=>
{
let busNo=req.body.busNo;
let size=req.body.size;
let fuelCapacity=req.body.fuelCapacity;
let currentFuel=req.body.currentFuel;
let routeNo=req.body.routeNo;
let busType=req.body.busType;
let mileage=req.body.mileage;
let lastRefuelDate=req.body.lastRefuelDate;
let lastMaintenanceDate=req.body.lastMaintenanceDate;
let status=req.body.status;

let newcondition=new rec3({busNo:busNo,size:size,fuelCapacity:fuelCapacity,currentFuel:currentFuel,routeNo:routeNo,busType:busType,mileage:mileage,lastRefuelDate:lastRefuelDate,lastMaintenanceDate:lastMaintenanceDate,status:status});
await newcondition.save();
return res.status(201).json({success:true,msg:"condition updated"});
}

exports.viewtransportconditions=async(req,res)=>
{
  let conditions=await rec3.find();
  return res.status(200).json({success:true,data:conditions});

}

exports.driverdetails=async(req,res)=>
{
  
  let Route=req.body.Route;
  let name=req.body.name;
  let licenseNumber=req.body.licenseNumber;
  let phoneNumber=req.body.phoneNumber;
  let email=req.body.email;
  let dateOfBirth=req.body.dateOfBirth;
  let address=req.body.address;
  let employmentStartDate=req.body.employmentStartDate;
  
  let route=await rec.findOne({Route:Route});
  if(route)
  {
    return res.status(400).json({success:false,msg:"Route already assigned to another driver"});
  }
  let data=await rec.find();
  if(data.length==0){
    driverId=1;
  let newdriver=new rec({driverId:driverId,Route:Route,name:name,licenseNumber:licenseNumber,phoneNumber:phoneNumber,email:email,dateOfBirth:dateOfBirth,address:address,employmentStartDate:employmentStartDate});
  await newdriver.save();
  return res.status(201).json({success:true,msg:"driver details added"});
  }
  else{
    driverId=data.length+1;
  let newdriver=new rec({driverId:driverId,Route:Route,name:name,licenseNumber:licenseNumber,phoneNumber:phoneNumber,email:email,dateOfBirth:dateOfBirth,address:address,employmentStartDate:employmentStartDate});
  await newdriver.save();
  return res.status(201).json({success:true,msg:"driver details added"});
   }
}

exports.viewdrivers=async(req,res)=>
{
  let driver=await rec.find();
  return res.status(200).json({success:true,driver:driver});
}

exports.studenttransportdetails=async(req,res)=>
{
  console.log(req.body);
  let studentId=req.adm;
  let Route=req.body.route;
  let Stop=req.body.stop;
  let arrivalTime=req.body.arrivalTime;
  let departureTime=req.body.departureTime;

  let record=new rec2({studentId:studentId.id,studentName:studentId.name,address:studentId.address,contactNumber:studentId.contact,Route:Route,Stop:Stop,arrivalTime:arrivalTime,departureTime:departureTime});
  await record.save();
  return res.status(201).json({success:true,msg:"student detail added"});
}

exports.viewstudenttransport=async(req,res)=>
{
  let studentId=req.adm;
  let studenttransport=await rec2.findOne({studentId:studentId.id});
  return res.status(200).json({success:true,studenttransport:studenttransport});
}
exports.viewallstudenttransport=async(req,res)=>
{
  let stu=await rec2.find();
  return res.status(200).json({success:true,stu:stu});
}

exports.addroute=async(req,res)=>
{
  console.log(req.body);
  let routeNumber=req.body.routeNumber;
  let startTime=req.body.startTime;
  let endTime=req.body.endTime;
  let stops=req.body.stops;

  let newroute=new rec4({routeNumber:routeNumber,startTime:startTime,endTime:endTime,stops:stops});
  await newroute.save();
  return res.status(201).json({success:true,msg:"route added"});
}

exports.viewroutes=async(req,res)=>
{
  let routes=await rec4.find();
  return res.status(200).json({success:true,routes:routes});
}

exports.viewroutebyid=async(req,res)=>
{
  let routeNumber=req.params.id;
  let route=await rec4.findOne({routeNumber:routeNumber});
  return res.status(200).json({success:true,stops:route});
}