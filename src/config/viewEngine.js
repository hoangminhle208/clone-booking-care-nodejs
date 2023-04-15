import express from "express";

let configViewEngine = (app) => {
    app.use(express.static("./src/public")); //add thư mục file tĩnh để sử dụng
    app.set("view engine", "ejs"); //file ejs dùng để viết logic code trong html : giống blade, jsp
    app.set("views","./src/views")
}

module.exports = configViewEngine;