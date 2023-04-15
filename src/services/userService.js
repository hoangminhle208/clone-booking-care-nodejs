import db from "../models";
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let hashUserPassword = (password) => {
    return new Promise(async(resolve,reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (error) {
            reject(error)
        }
    })
}

let handleUserLogin = (email, password) => {
    return new Promise(async(resolve,reject)=>{
        try{
            let userData ={};
            let isExist = await checkUserEmail(email);
            if (isExist){
                //user already exist
                let user = await db.User.findOne({
                    attributes:['id','email','roleId','password','firstName','lastName'],
                    where:{email:email},
                    raw:true
                });
                if(user){
                    //compare password
                    let check = await bcrypt.compareSync(password,user.password);
                    if(check){
                        userData.errCode = 0;
                        userData.errMessage ='OK';
                        delete user.password;
                        userData.user = user;
                    }else{
                        userData.errCode = 3;
                        userData.errMessage = 'Wrong password';
                    }
                }else{
                    userData.errCode = 2;
                    userData.errMessage='User not found';
                }
                //resolve();
            }else{
                //return error
                userData.errCode =1;
                userData.errMessage = 'Your Email isn`t exist in your system';
                
            }
            resolve(userData);
        }catch(error){
            reject(error);
        }
    })
}

let checkUserEmail = (userEmail) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            let user = await db.User.findOne({
                where:{email:userEmail}
            });
            if(user){
                resolve(true);
            }
            else{
                resolve(false);
            }
        } catch (error) {
            reject(error);
        }
    })
}

let getAllUsers = async(userId) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            let users='';
            if(userId=='ALL'){
                users = await db.User.findAll({
                    attributes:{
                        exclude:['password','image']
                    }
                });
            }if(userId&&userId!=='ALL'){
                users= await db.User.findOne({
                    where:{id:userId},
                    attributes:{
                        exclude:['password']
                    }
                })
            }
            resolve(users);
        } catch (error) {
            reject(error)
        }
    })
}

let createNewUser = (data) =>{
    return new Promise(async(resolve,reject)=>{
        try {
            //check email is exist?
            let check = await checkUserEmail(data.email);
            if(check===true){
                resolve({
                    errCode:1,
                    errMessage:'Your email is already used, try another email'
                })
            }else{
                let hashPasswordFromBcrypt = await hashUserPassword(data.password);
                await db.User.create({
                    email: data.email,
                    password: hashPasswordFromBcrypt,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    address: data.address,
                    phonenumber: data.phonenumber,
                    gender: data.gender,
                    roleId: data.roleId,
                    positionId: data.positionId,
                    image: data.avatar
                })
                resolve({
                    errCode:0,
                    message:'OK'
                })
                }
            
        } catch (error) {
            reject(error);
        }
    })
}

let deleteUser = (userId) => {
    return new Promise(async(resolve,reject)=>{
        try {
            let user = await db.User.findOne({where:{id:userId}});
            if(!user){
                resolve({
                    errCode:2,
                    errMessage:`The user isn't exist`
                })
            }
            // if(user){
            //     await user.destroy();
            // }
            await db.User.destroy({
                where:{id:userId}
            })
            resolve({
                errCode:0,
                errMessage:'Delete user successfully!'
            });
        } catch (error) {
            reject(error);
        }
    })
}

let updateUserData = (data) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!data.id || !data.roleId || !data.positionId || !data.gender){
                resolve({
                    errCode:2,
                    errMessage:'Missing required parameter!'
                })
            }
            let user = await db.User.findOne({
                where:{id:data.id},
                raw:false
            })
            if(user){
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;
                user.roleId = data.roleId;
                user.positionId = data.positionId;
                user.gender = data.gender;
                user.phonenumber = data.phonenumber;
                if(data.avatar){
                    user.image = data.avatar;
                }
                await user.save();
                resolve({
                    errCode:0,
                    errMessage:'Update user successfully'
                });
            }
            else {
                resolve({
                    errCode:1,
                    errMessage:`User not found!`
                });
            }
            
        } catch (error) {
            reject(error);
        }
    })
}

let getAllCodeService = (typeInput) => {
    return new Promise(async(resolve,reject)=>{
        try {
            if(!typeInput){
                resolve({
                    errCode : 1,
                    errMessage : 'Missing parameter'
                })
            }else{
                let res = {};
                let allcode = await db.Allcode.findAll({
                    where: {type:typeInput}
                });
                res.errCode = 0;
                res.data = allcode;
                resolve(res);
        }
        } catch (error) {
            reject(error);
        }
    })
}


module.exports={
    handleUserLogin:handleUserLogin,
    getAllUsers:getAllUsers,
    createNewUser:createNewUser,
    hashUserPassword:hashUserPassword,
    deleteUser:deleteUser,
    updateUserData:updateUserData,
    getAllCodeService:getAllCodeService,
}