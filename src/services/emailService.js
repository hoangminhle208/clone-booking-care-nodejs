require('dotenv').config();

import nodemailer from 'nodemailer';

let sendSimpleEmail = async(dataSend) => {
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD
        },
    });
    transporter.sendMail({
        from: '"Booking appointment:" <hoanganhkks01@gmail.com>',
        to: dataSend.reciverEmail,
        subject: "Thông tin đặt lịch khám bệnh",
        html: getBodyHTMLEmail(dataSend)
    },function(error, info) {
        if (error) { // nếu có lỗi
            console.log(error);
        } else { //nếu thành công
            console.log('Email sent: ' + info.response);
        }
        });
}

let getBodyHTMLEmail = (dataSend) => {
    let result ='';
    if(dataSend.language === 'vi'){
        result =  `
        <h3>Xin chào, ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên ...</p>
        <p>Thông tin đặt lịch khám bệnh</p>
        <div><b>Thời gian: ${dataSend.time}</div>
        <div><b>Thời gian: ${dataSend.doctorName}</div>
        <p>Nếu các thông tin trên là đúng, vui lòng nhấn <a href=${dataSend.redirectLink}>tại đây</a> để xác nhận và hoàn tất thủ tục đặt lịch khám bệnh</p>
        <div>Xin chân thành cảm ơn.</div>
        `;
    }
    if(dataSend.language === 'en'){
        result =  `
        <h3>Hello, ${dataSend.patientName}</h3>
        <p>You received this email because you booked an online medical appointment on...</p>
        <p>Information to book a medical appointment</p>
        <div><b>Time: ${dataSend.time}</div>
        <div><b>Doctor: ${dataSend.doctorName}</div>
        <p>If the above information is correct, please press <a href=${dataSend.redirectLink}>here</a> to confirm and complete the medical appointment booking procedure</p>
        <div>Sincerely thank.</div>
        `;
    }
    return result;
}

let sendAttachment = async(dataSend) => {
    let transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD
        },
    });
    transporter.sendMail({
        from: '"Booking appointment:" <hoanganhkks01@gmail.com>',
        to: dataSend.email,
        subject: "Hóa đơn khám bệnh",
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments:[
            {
                filename:`remedy-${dataSend.patientId}-${new Date().getTime()}.png`,
                content:dataSend.imgBase64.split('base64')[1],
                encoding:'base64'
            }
        ]
    },function(error, info) {
        if (error) { // nếu có lỗi
            console.log(error);
        } else { //nếu thành công
            console.log('Email sent: ' + info.response);
        }
        });
}

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result ='';
    if(dataSend.language === 'vi'){
        result =  `
        <h3>Xin chào, ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này vì đã đặt lịch khám bệnh online trên ...</p>
        <p>Thông hóa đơn khám bệnh</p>
        <div><b>Thời gian: ${dataSend.time}</div>
        <div><b>Thời gian: </div>
        <p>Nếu các thông tin trên có sai sót, vui lòng liên hệ.....</p>
        <div>Xin chân thành cảm ơn.</div>
        `;
    }
    if(dataSend.language === 'en'){
        result =  `
        <h3>Hello, ${dataSend.patientName}</h3>
        <p>You received this email because you booked an online medical appointment on...</p>
        <p>Information invoice medical </p>
        <div><b>Time: ${dataSend.time}</div>
        <div><b>Doctor: </div>
        <p>If the above information is correct, please press <a href=${dataSend.redirectLink}>here</a> to confirm and complete the medical appointment booking procedure</p>
        <div>Sincerely thank.</div>
        `;
    }
    return result;
}

module.exports = {
    sendSimpleEmail:sendSimpleEmail,
    sendAttachment:sendAttachment,

}