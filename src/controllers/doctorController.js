import doctorService from "../services/doctorService";

let getTopDoctorHome = async(req,res) => {
    let limit = req.query.limit;
    if(!limit) limit = 10;
    try {
        let response = await doctorService.getTopDoctorHomeService(+limit);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode: -1,
            errMessage: 'Error from server'
        })
    }
}

let getAllDoctor = async(req,res) => {
    try {
        let doctors = await doctorService.getAllDoctor();
        return res.status(200).json(doctors);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Error from server'
        })
    }
}

let postInforDoctor =async (req,res) => {
    try {
        let response = await doctorService.saveDetailInforDoctor(req.body);
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Error from server'
        })
    }
}

let getDetailDoctorById = async (req,res) => {
    try {
        let infor = await doctorService.getDetailDoctorByIdService(req.query.id);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Error from server'
        })
    }
}

let bulkCreateSchedule = async (req,res) => {
    try {
        let infor = await doctorService.bulkCreateScheduleService(req.body);
        return res.status(200).json({infor});
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Error from server'
        })
    }
}

let getScheduleByDate = async (req,res) => {
    try {
        let infor = await doctorService.getSchedulebyDateService(req.query.doctorId,req.query.date);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

let getExtraInforDoctorById = async (req,res) => {
    try {
        let infor = await doctorService.getExtraInforDoctorByIdService(req.query.doctorId);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

let getProfileDoctorById = async (req,res) => {
    try {
        let infor = await doctorService.getProfileDoctorByIdService(req.query.doctorId);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

let getListPatientForDoctor = async(req,res) => {
    try {
        let infor = await doctorService.getListPatientForDoctorService(req.query.doctorId,req.query.date);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

let sendRemedy = async(req,res) => {
    try {
        let infor = await doctorService.sendRemedyService(req.body);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

module.exports = {
    getTopDoctorHome:getTopDoctorHome,
    getAllDoctor:getAllDoctor,
    postInforDoctor:postInforDoctor,
    getDetailDoctorById:getDetailDoctorById,
    bulkCreateSchedule:bulkCreateSchedule,
    getScheduleByDate:getScheduleByDate,
    getExtraInforDoctorById:getExtraInforDoctorById,
    getProfileDoctorById:getProfileDoctorById,
    getListPatientForDoctor:getListPatientForDoctor,
    sendRemedy:sendRemedy,
}