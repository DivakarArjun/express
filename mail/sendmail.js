const nodemailer = require("nodemailer");
module.exports = async (reciever, sub, message) => {
    let transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PWD
        }
    });
    let mailOptions = {
        from: process.env.EMAIL,
        to: reciever,
        subject:sub,
        html: message,
        
    };
    // if(file_content){
    //     mailOptions['attachments']=[{
    //         filename: 'report.pdf',
    //         content:file_content,
    //         contentType: 'application/pdf'
    //     }]
    // }
    transporter.sendMail(mailOptions,function(error, response){
        if(error){
            console.log(error);
        }else{
            console.log("Message sent: " + response.message);
        }
        transporter.close(); // shut down the connection pool, no more messages
    });
}