import { reject } from "lodash";
import db from "../models/index";
require('dotenv').config();
import emailService from '../services/emailService';
import { v4 as uuidv4 } from 'uuid';

let buildUrlEmail = (doctorId,token) => {
    let result = '';
    result = `${process.env.REACT_APP_FRONTEND_URL}/verify-booking?token=${token}&doctorId=${doctorId}`;
    return result;
}

let postBookApoinmentService = (data) => {
    return new Promise(async(resolve,reject)=> {
        try {
            if(!data.email||!data.doctorId||!data.timeType||!data.date||!data.fullName || !data.selectedGender||!data.address){
                resolve({
                    errCode:1,
                    errMessage:"Missing parameter"
                })
            }else{
                let token = uuidv4();
                await emailService.sendSimpleEmail({
                    reciverEmail:data.email,
                    patientName:data.fullName,
                    time: data.timeString,
                    doctorName:data.doctorName,
                    language:data.language,
                    redirectLink:buildUrlEmail(data.doctorId,token)
                });
                let user = await db.User.findOrCreate({
                    where:{email:data.email},
                    defaults:{
                        email:data.email,
                        roleId:'R3',
                        gender:data.selectedGender,
                        address:data.address,
                        firstName:data.fullName
                    },
                });
                if(user&&user[0]){
                    await db.Booking.findOrCreate({
                        where:{patientId:user[0].id},
                        defaults:{
                            statusId:'S1',
                            patientId: user[0].id,
                            doctorId: data.doctorId,
                            date:data.date,
                            timeType:data.timeType,
                            token:token
                        }
                    })
                }
                resolve({
                    errCode:0,
                    errMessage:'Save infor patient booking success'
                });
            }
        } catch (error) {
            reject(error);
        }
    })
}

let postVerifyBookApoinmentService = (data) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!data.token||!data.doctorId){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameter!'
                })
            }else{
                let appointment = await db.Booking.findOne({
                    where:{
                        doctorId:data.doctorId,
                        token:data.token,
                        statusId:'S1'
                    },
                    raw:false
                });
                if(appointment){
                    appointment.statusId = 'S2';
                    await appointment.save();
                    resolve({
                        errCode:0,
                        errMessage:'Update the appointment success'
                    });
                }else{
                    resolve({
                        errCode:2,
                        errMessage:'Appointment has been actived or does not exist'
                    });
                }
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    postBookApoinmentService:postBookApoinmentService,
    postVerifyBookApoinmentService:postVerifyBookApoinmentService,
}