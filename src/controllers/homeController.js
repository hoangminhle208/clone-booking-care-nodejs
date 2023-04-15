import db from "../models";
import CRUDService from "../services/CRUDService";
let getHomePage = async(req, res) => {
    
    try {
        let data = await db.User.findAll();
        return res.render('homepage.ejs',{data:JSON.stringify(data)});
    } catch (error) {
        console.log(error);
    }

}
let getCRUD = (req, res) => {
    return res.render('crud.ejs');
}

let postCRUD = async(req,res) => {
    let message = await CRUDService.createNewUser(req.body);
    return res.send(message);
}

let displayGetCRUD = async(req, res) => {
    let data = await CRUDService.getAllUser();
    res.render('displayCRUD.ejs',{dataTable:data});
}
let getEditCRUD = async(req, res) => {
    let userId = req.query.id;
    if(userId) {
        let userData = await CRUDService.getUserInfoById(userId);
        return res.render('editCRUD.ejs',{user:userData})
    }
    else {
        return res.send('no data');
    }
}

let putCRUD = async(req, res) => {
    let data = req.body;
    await CRUDService.updateUserData(data);
    return res.redirect('/get-crud');
}

let deleteCRUD = async(req, res) => {
    let id = req.query.id;
    if(id){
        await CRUDService.deleteUserById(id);
        return res.send('success');
    }
    else{
        return res.send('user not found');
    }

}
module.exports={
    getHomePage: getHomePage,
    getCRUD: getCRUD,
    postCRUD: postCRUD,
    displayGetCRUD: displayGetCRUD,
    getEditCRUD: getEditCRUD,
    putCRUD: putCRUD,
    deleteCRUD: deleteCRUD,
}