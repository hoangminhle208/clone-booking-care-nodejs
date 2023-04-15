import patientService from "../services/patientService";

let postBookApoinment = async(req,res) => {
    try {
        let infor = await patientService.postBookApoinmentService(req.body);
        return res.status(200).json(infor);
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            errCode:-1,
            errMessage:'Erorr from server'
        })
    }
}

let postVerifyBookApoinment = async(req,res) => {
    try {
        let infor = await patientService.postVerifyBookApoinmentService(req.body);
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
    postBookApoinment:postBookApoinment,
    postVerifyBookApoinment:postVerifyBookApoinment,
}