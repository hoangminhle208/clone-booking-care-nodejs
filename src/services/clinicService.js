import { reject } from "lodash";
import db from "../models";
let createClinicService = (data) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!data.name||!data.imageBase64||!data.descriptionHTML||!data.descriptionMarkdown||!data.address){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                await db.Clinic.create({
                    name:data.name,
                    address:data.address,
                    image:data.imageBase64,
                    descriptionHTML:data.descriptionHTML,
                    descriptionMarkdown:data.descriptionMarkdown
                });
                resolve({
                    errCode:0,
                    errMessage:'Ok'
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getAllClinicService = () => {
    return new Promise(async(resolve,reject)=>{
        try {
            let data = await db.Clinic.findAll();
            if(data&&data.length>0){
                data.map(item => {
                    item.image = new Buffer(item.image,'base64').toString('binary');
                    return item;
                })
            }
            resolve({
                errCode:0,
                errMessage:"Ok",
                data:data
            });
        } catch (error) {
            reject(error);
        }
    })
}

let getDetailClinicByIdService = (clinicId) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!clinicId){
                resolve({
                    errCode:1,
                    errMessage:'Missing required parameter'
                })
            }else{
                let data = await db.Clinic.findOne({
                    where:{id:clinicId},
                    attributes:['name','address','image','descriptionHTML','descriptionMarkdown']
                });
                if(data){
                    if(data.image){
                        data.image = new Buffer(data.image,'base64').toString('binary');
                    }
                    let doctorClinic = [];
                    doctorClinic = await db.Doctor_Infor.findAll({
                        where:{clinicId:clinicId},
                        attributes:['doctorId'] 
                    });
                    data.doctorClinic = doctorClinic;
                }else{
                    data = {};
                }
                resolve({
                    errCode:0,
                    errMessage:'Ok',
                    data
                })
            }
        } catch (error) {
            reject(error);
        }
    })
}

module.exports = {
    createClinicService:createClinicService,
    getAllClinicService:getAllClinicService,
    getDetailClinicByIdService:getDetailClinicByIdService,
}