let rec=require('../models/hosteldetail/room');
let rec2=require('../models/hosteldetail/studentschema');
let rec3=require('../models/hosteldetail/fees');
exports.addroom=async(req,res)=>
{
    const { singleRooms, doubleRooms } = req.body;
    const singleRoomCount = Number(singleRooms);
    const doubleRoomCount = Number(doubleRooms);

    if (
        singleRooms === undefined || singleRooms === null || singleRooms === '' ||
        doubleRooms === undefined || doubleRooms === null || doubleRooms === '' ||
        !Number.isInteger(singleRoomCount) || singleRoomCount < 0 ||
        !Number.isInteger(doubleRoomCount) || doubleRoomCount < 0
    ) {
        return res.status(400).json({
            success: false,
            msg: 'Room counts must be non-negative whole numbers',
        });
    }

    try {
        const room = await rec.findOneAndUpdate(
            {},
            { singleRooms: singleRoomCount, doubleRooms: doubleRoomCount },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        );
        return res.status(200).json({
            success: true,
            msg: 'Room availability updated successfully',
            room,
        });
    } catch (error) {
        console.error('Room availability update error:', error);
        return res.status(500).json({ success: false, msg: 'Unable to update room availability' });
    }

}

exports.viewroom=async(req,res)=>
{
    try {
        const roomlist = await rec.find().sort({ createdAt: 1 });
        return res.status(200).json({
            success: true,
            msg: 'All room details fetched successfully',
            room: roomlist,
        });
    } catch (error) {
        console.error('Room availability fetch error:', error);
        return res.status(500).json({ success: false, msg: 'Unable to fetch room availability' });
    }
}

exports.updateroom=async(req,res)=>
{
    const { singleRooms, doubleRooms } = req.body;
    const singleRoomCount = Number(singleRooms);
    const doubleRoomCount = Number(doubleRooms);

    if (
        singleRooms === undefined || singleRooms === null || singleRooms === '' ||
        doubleRooms === undefined || doubleRooms === null || doubleRooms === '' ||
        !Number.isInteger(singleRoomCount) || singleRoomCount < 0 ||
        !Number.isInteger(doubleRoomCount) || doubleRoomCount < 0
    ) {
        return res.status(400).json({
            success: false,
            msg: 'Room counts must be non-negative whole numbers',
        });
    }

    try {
        const record = await rec.findByIdAndUpdate(
            req.params.id,
            { singleRooms: singleRoomCount, doubleRooms: doubleRoomCount },
            { new: true, runValidators: true }
        );
        if (!record) {
            return res.status(404).json({ success: false, msg: 'Room details not found' });
        }

        return res.status(200).json({
            success: true,
            msg: 'Room details updated successfully',
            room: record,
        });
    } catch (error) {
        console.error('Room details update error:', error);
        return res.status(500).json({ success: false, msg: 'Unable to update room details' });
    }
};




exports.studentregister = async (req, res) => {
  let studentId=req.adm;
  let bloodGroup=req.body.bloodGroup;
  let allergies=req.body.allergies;
  let emergencyContact=req.body.emergencyContact;
  let gender=req.body.gender;
  let roomType=req.body.roomType;
  let ac=req.body.ac;
  let cooler=req.body.cooler;
  let fan=req.body.fan;
  let personalKitchen=req.body.personalKitchen;
  let attachedBathroom=req.body.attachedBathroom;
  let balcony=req.body.balcony;
  let laundry=req.body.laundry;
  let wifi=req.body.wifi;
  let gym=req.body.gym;
  let totalCharge=req.body.totalCharge;
  let roomNo;

    if (roomType === 'single') {
      const singleStudents = await rec2.find({ roomType: 'single' });
      if (singleStudents.length === 0) {
        roomNo = 101;
      } else {
        roomNo = 101 + singleStudents.length;
      }

    } else if (roomType === 'double') {
      const doubleStudents = await rec2.find({ roomType: 'double' });

      if (doubleStudents.length === 0) {
        roomNo = 201;
      } else {
        if (doubleStudents.length % 2 === 0) {
          roomNo = 201 + (doubleStudents.length / 2);
        } else {
          roomNo = 201 + Math.floor(doubleStudents.length / 2);
        }
      }

    } 
    let feeRecord = new rec3({
    StudentId: studentId.id,
    StudentName: studentId.name,
    totalAmount: totalCharge,
    paymentStatus: 'unpaid', 
    amountPaid: 0 
  });

  await feeRecord.save();


  let data=new rec2({studentid:studentId.id,Name:studentId.name,address:studentId.address,contactNumber:studentId.contact,email:studentId.email,dob:studentId.dob,bloodGroup:bloodGroup,allergies:allergies,emergencyContact:emergencyContact,gender:gender,roomType:roomType,ac:ac,cooler:cooler,fan:fan,personalKitchen:personalKitchen,attachedBathroom:attachedBathroom,balcony:balcony,laundry:laundry,wifi:wifi,gym:gym,totalCharge:totalCharge,roomNo:roomNo});
  await data.save();
  return res.status(201).json({success:true,msg:'student hostel added successfully',data:data});


};


exports.feespayment = async (req, res) => {
    try {
        const studentId = req.adm;
        
        const { paymentStatus, amountPaid } = req.body; 
        let feeRecord = await rec3.findOne({ StudentId: studentId.id });
        
        feeRecord.paymentStatus = paymentStatus;
        feeRecord.amountPaid = amountPaid; 
        feeRecord.date = new Date(); 
        await feeRecord.save();

        return res.status(200).json({
            success: true,
            msg: `Fee record updated successfully for Student ID ${studentId.id}`,
            data: feeRecord
        });

    } catch (error) {
        console.error("Fee Update Error:", error);
        return res.status(500).json({ success: false, msg: `Internal Server Error: ${error.message}` });
    }
};



exports.viewstudenthostel=async(req,res)=>
{
  let studentId=req.adm;
  let student=await rec2.findOne({studentid:studentId.id});
  return res.status(200).json({success:true,student:student});
}

exports.viewfees=async(req,res)=>
{
  let studentId=req.adm;
  let feeDetails=await rec3.findOne({StudentId:studentId.id});
  return res.status(200).json({success:true,feeDetails:feeDetails});
}