const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)


const sendWelcomeEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'nik.twister@gmail.com',
        subject: 'Thanks for joining in!!',
        text: `Hola ${name}, \n\nWelcome to the task-manager app. Let us know how you're getting along with it. Enjoy :)\n\n\nKind regards,\ntask-manager app team.`
    })

}


const sendCancellationEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'nik.twister@gmail.com',
        subject: 'Sad to see you go',
        text: `Hey ${name}, \n\nWe're sorry that it had to come to this. Our task-manager app team would love to hear your suggestions on how we can improve our user experience. Hope we'll see you again :)\n\n\nSayonara.`
    })
    
}

module.exports = {sendWelcomeEmail, sendCancellationEmail}
