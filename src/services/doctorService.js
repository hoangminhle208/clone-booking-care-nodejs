import db from "../models";
require('dotenv').config();
import _ from 'lodash';
import emailService from '../services/emailService';

const MAX_NUMBER_SCHEDULE = process.env.MAX_NUMBER_SCHEDULE;

let getTopDoctorHomeService = (limitInput) => {
    return new Promise(async(resovle,reject)=>{
        try {
            let users = await db.User.findAll({
                limit: limitInput,
                where:{roleId:'R2'},
                order:[['createdAt','DESC']],
                attributes:{
                    exclude:['password']
                },
                include:[
                    { model: db.Allcode, as:'positionData', attributes:['valueEN','valueVI']},
                    { model: db.Allcode, as:'genderData', attributes:['valueEN','valueVI']}
                ],
                raw:true,
                nest:true
            })
            resovle({
                errCode:0,
                data: users
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getAllDoctor = () =>{
    return new Promise(async(resovle,reject)=>{
        try {
            let doctors = await db.User.findAll({
                where:{roleId:'R2'},
                attributes:{
                    exclude:['password','image']
                },
            });
            resovle({
                errCode:0,
                data:doctors
            })
        } catch (error) {
            reject(error);
        }
    })
}

let checkRequiredFields = (inputData) => {
    let arrFields = ['doctorId','contentHTML','contentMarkdown','action',
        'selectedPrice','selectedPayment','selectedProvince','nameClinic',
        'addressClinic','note','specialtyId'];
    let isValid = true;
    let element = '';
    for(let i=0;i<arrFields.length;i++){
        if(!inputData[arrFields[i]]){
            isValid = false;
            element = arrFields[i];
            break;
        }
    }
    return {
        isValid:isValid,
        element:element
    }
}

let saveDetailInforDoctor = (inputData) => {
    return new Promise(async(resovle,reject)=>{
        try {
            let checkObj = checkRequiredFields(inputData);
            if(checkObj.isValid === false){
                resovle({
                    errCode:1,
                    errMessage:`Missing parameter :${checkObj.element}`
                })
            }else{
                //upsert to Markdown
                if(inputData.action ==='CREATE'){
                    await db.Markdown.create({
                        contentHTML: inputData.contentHTML,
                        contentMarkdown: inputData.contentMarkdown,
                        description: inputData.description,
                        doctorId:inputData.doctorId
                    })
                }else if(inputData.action ==='EDIT'){
                    let doctorMarkdown = await db.Markdown.findOne({
                        where:{doctorId:inputData.doctorId},
                        raw:false
                    })
                    if(doctorMarkdown){
                        doctorMarkdown.contentHTML = inputData.contentHTML;
                        doctorMarkdown.contentMarkdown = inputData.contentMarkdown;
                        doctorMarkdown.description = inputData.description;
                        doctorMarkdown.updateAt = new Date();
                        await doctorMarkdown.save();
                    }
                }
                //upsert to Doctor_infor
                let doctorInfor = await db.Doctor_Infor.findOne({
                    where:{doctorId:inputData.doctorId},
                    raw:false
                })
                if(doctorInfor){
                    //update
                    doctorInfor.doctorId = inputData.doctorId;
                    doctorInfor.priceId = inputData.selectedPrice;
                    doctorInfor.provinceId = inputData.selectedProvince;
                    doctorInfor.paymentId = inputData.selectedPayment;
                    doctorInfor.nameClinic = inputData.nameClinic;
                    doctorInfor.addressClinic = inputData.addressClinic;
                    doctorInfor.note = inputData.note;
                    doctorInfor.updateAt = new Date();
                    doctorInfor.specialtyId = inputData.specialtyId;
                    doctorInfor.clinicId = inputData.clinicId;
                    await doctorInfor.save();
                }else{
                    //create
                    await db.Doctor_Infor.create({
                        doctorId: inputData.doctorId,
                        priceId : inputData.selectedPrice,
                        provinceId : inputData.selectedProvince,
                        paymentId : inputData.selectedPayment,
                        nameClinic : inputData.nameClinic,
                        addressClinic : inputData.addressClinic,
                        note : inputData.note,
                        specialtyId:inputData.specialtyId,
                        clinicId:inputData.clinicId
                    })
                }
            }
            resovle({
                errCode:0,
                errMessage:'Save infor doctor success'
            })
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailDoctorByIdService = (inputId) => {
    return new Promise(async(resovle,reject)=>{
        try {
            if(!inputId){
                resovle({
                    errCode:1,
                    errMessage:'Missing parameter'
                })
            }else{
                let data = await db.User.findOne({
                    where:{id: inputId },
                    attributes:{
                        exclude:['password']
                    },
                    include:[
                        { model: db.Markdown,attributes:['description','contentHTML','contentMarkdown'] },
                        { model: db.Allcode, as:'positionData', attributes:['valueEN','valueVI']},
                        { model: db.Doctor_Infor ,attributes:{
                            exclude:['id','doctorId']
                            },
                            include:[
                                {model: db.Allcode,as:'priceTypeData',attributes:['valueEN','valueVI']},
                                {model: db.Allcode,as:'paymentTypeData',attributes:['valueEN','valueVI']},
                                {model: db.Allcode,as:'provinceTypeData',attributes:['valueEN','valueVI']}
                            ]
                        }
                    ],
                    raw:false,
                    nest:true
                })
                if(data&&data.image){
                    data.image = new Buffer(data.image,'base64').toString('binary');
                }
                if(!data) data = {};
                resovle({
                    errCode:0,
                    data:data
                })
            }
            
        } catch (error) {
            reject(error);
        }
    })
}

let bulkCreateScheduleService = (data) => {
    return new Promise(async(resovle,reject)=>{
        try {
            if(!data.arrSchedule||!data.doctorId||!data.formatedDate){
                resovle({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                let schedule = data.arrSchedule;
                if(schedule && schedule.length>0){
                    schedule = schedule.map(item =>{
                        item.maxNumber = MAX_NUMBER_SCHEDULE;
                        return item;
                    })
                }
                let existing = await db.Schedule.findAll({
                    where:{doctorId: data.doctorId,date:data.formatedDate},
                    attributes:['timeType','date','doctorId','maxNumber'],
                    raw:true
                })
                
                //compare difference
                let toCreate = _.differenceWith(schedule,existing,(a,b)=>{
                    return a.timeType === b.timeType && +a.date === +b.date;
                });
                //console.log(toCreate);
                //create data
                if(toCreate && toCreate.length>0){
                    await db.Schedule.bulkCreate(toCreate);
                }
                resovle({
                    errCode:0,
                    errMessage:'OK'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getSchedulebyDateService = (doctorId,date) => {
    return new Promise(async(resovle,reject)=>{
        try {
            if(!doctorId||!date){
                resovle({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                let dataSchedule = await db.Schedule.findAll({
                    where:{
                        doctorId:doctorId,
                        date:date
                    },
                    include: [
                        {model:db.Allcode,as: 'timeTypeData',attributes:['valueEN','valueVI']},
                        {model:db.User,as:'doctorData',attributes:['firstName','lastName']}
                    ],
                    raw:false,
                    nest:true
                })
                if(!dataSchedule) dataSchedule = [];
                resovle({
                    errCode:0,
                    data:dataSchedule
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getExtraInforDoctorByIdService = (inputId) => {
    return new Promise(async(resovle,reject)=> {
        try {
            if(!inputId){
                resovle({
                    errCode:1,
                    errMessage:'Missing required parameter!'
                })
            }else{
                let data = await db.Doctor_Infor.findOne({
                    where:{doctorId:inputId},
                    attributes:{exclude:['id','doctorId']},
                    include:[
                        {model: db.Allcode,as:'priceTypeData',attributes:['valueEN','valueVI']},
                        {model: db.Allcode,as:'paymentTypeData',attributes:['valueEN','valueVI']},
                        {model: db.Allcode,as:'provinceTypeData',attributes:['valueEN','valueVI']}
                    ],
                    raw:false,
                    nest:true
                });
                if(!data) data = {};
                resovle({
                    errCode:0,
                    data:data
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getProfileDoctorByIdService = (inputId) => {
    return new Promise(async(resovle,reject)=>{
        try {
            if(!inputId){
                resovle({
                    errCode:1,
                    errMessage:"Missing required parameter!"
                });
            }else{
                let data = await db.User.findOne({
                    where:{id: inputId },
                    attributes:{
                        exclude:['password']
                    },
                    include:[
                        { model: db.Markdown,attributes:['description','contentHTML','contentMarkdown'] },
                        { model: db.Allcode, as:'positionData', attributes:['valueEN','valueVI']},
                        { model: db.Doctor_Infor ,attributes:{
                            exclude:['id','doctorId']
                            },
                            include:[
                                {model: db.Allcode,as:'priceTypeData',attributes:['valueEN','valueVI']},
                                {model: db.Allcode,as:'paymentTypeData',attributes:['valueEN','valueVI']},
                                {model: db.Allcode,as:'provinceTypeData',attributes:['valueEN','valueVI']}
                            ]
                        }
                    ],
                    raw:false,
                    nest:true
                })
                if(data&&data.image){
                    data.image = new Buffer(data.image,'base64').toString('binary');
                }
                if(!data) data = {};
                resovle({
                    errCode:0,
                    data:data
                });
            }
        } catch (error) {
            reject(error);
        }
    });
}

let getListPatientForDoctorService = (doctorId,date) => {
    return new Promise(async(resovle,reject)=>{
        try {
            if(!doctorId||!date){
                resovle({
                    errCode:1,
                    errMessage:'Missing required parameter!'
                })
            }else{  
                let data = await db.Booking.findAll({
                    where:{
                        statusId:'S2',
                        doctorId:doctorId,
                        date:date
                    },
                    include:[
                        { model:db.User, as:'patientData' ,attributes:['email','firstName','address','gender'],
                        include:[
                            {
                                model:db.Allcode, as:'genderData',attributes:['valueEN','valueVI']
                            }
                        ]
                        },
                        { model:db.Allcode, as:'timeTypeDataBooking',attributes:['valueEN','valueVI'] }
                    ],
                    raw:false,
                    nest:true
                });
                resovle({
                    errCode:0,
                    data:data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let sendRemedyService = (data) => {
    return new Promise(async(resovle,reject)=> {
        try {
            if(!data.email||!data.doctorId||!data.patientId){
                resovle({
                    errCode:1,
                    errMessage:'Missing parameter!'
                });
            }else{
                //update patient status
                let appointment = await db.Booking.findOne({
                    where:{
                        doctorId:data.doctorId,
                        patientId:data.patientId,
                        timeType:data.timeType,
                        statusId:'S2'
                    },
                    raw:false
                });
                if(appointment){
                    appointment.statusId = 'S3';
                    await appointment.save();
                }

                //send email remedy
                emailService.sendAttachment(data);
                resovle({
                    errCode:0,
                    data:data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    getTopDoctorHomeService:getTopDoctorHomeService,
    getAllDoctor:getAllDoctor,
    saveDetailInforDoctor:saveDetailInforDoctor,
    getDetailDoctorByIdService:getDetailDoctorByIdService,
    bulkCreateScheduleService:bulkCreateScheduleService,
    getSchedulebyDateService:getSchedulebyDateService,
    getExtraInforDoctorByIdService:getExtraInforDoctorByIdService,
    getProfileDoctorByIdService:getProfileDoctorByIdService,
    getListPatientForDoctorService:getListPatientForDoctorService,
    sendRemedyService:sendRemedyService,

}