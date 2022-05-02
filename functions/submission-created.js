const { constants } = require('buffer');
const nodemailer = require('nodemailer');

const from = "info@motojoe.co.uk";


exports.handler = function (event, context, callback) {

    let transporter = nodemailer.createTransport({
        host: 'smtp.office365.com', // Office 365 server
        port: 587,     // secure SMTP
        secure: false, // false for TLS - as a boolean not string - but the default is false so just remove this completely
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PW
        },
        tls: {
            ciphers: 'SSLv3'
        }

    });

    console.log("event.body");
    console.log(event.body);

    const body = JSON.parse(event.body);

    // console.log("body.payload");
    // console.log(body.payload);

    // console.log("body.payload.data");
    // console.log(body.payload.data);

    // console.log("body.payload.form_name");
    // console.log(body.payload.form_name);

    const form_name = body.payload.form_name || "unknown";
    const data = body.payload.data;

    console.log("detected:", form_name);

    let msg = false;

    switch (form_name) {
        case "contact":
            msg = contact(data);
            break;
        case "calculator":
            msg = rental(data);
            break;
        case "confirmation":
            msg = confirmation(data);
            break;
        default:
            console.log("no case found for", form)

    }

    if (msg) {

        const signature = `<br/>
        Kindest regards,<br/>
        Amy<br/><br/>
        Scotland's leading motorcycle rental company.<br/><br/>
        <!-- Follow us on <a href="https://www.facebook.com/motojoe.co.uk">Facebook</a> and <a href="https://www.instagram.com/motojoe.co.uk/">Instagram</a><br/><br/>-->
        
        We are an independent, family owned business and Scotland's Premier BMW motorcycle retailer. We are all enthusiastic motorcyclists and passionate about our products and brand. We are here to ensure you have a spectacular motorcycle holiday in Scotland.<br/>
        <br/>
        <table style="font-family:Arial;font-size:12px">
            <tbody>
            <tr><td style="border-right-width:2px;border-right-style:solid;border-right-color:rgb(17,134,200);padding-right:10px"><a href="http://www.motojoe.co.uk/" target="_blank"><img src="https://motojoes.netlify.app/images/MotoJoe.gif" width="180px"></a><a></a></td>
            <td style="padding-left:10px">
                <div style="color:rgb(51,51,51);font-weight:bold;font-size:14px;margin-bottom:5px">Amy Tyrrell</div>
                <div style="margin-bottom:2px"><i>Tours & Rental Manager</i></div>
                <div style="margin-bottom:4px"><a>www.motojoe.co.uk</a></div>
                <div style="color:rgb(51,51,51);margin-bottom:4px">&#43;44 (0) 131 603 4466</div>
                <div style="color:rgb(51,51,51);margin-bottom:4px">&#43;44 (0) 7460 838068</div>
                <a href="https://www.facebook.com/motojoe.co.uk" target="_blank"><img src="https://gallery.mailchimp.com/4bab2b6cbe384b82e4e31426c/images/37c183ed-cd47-4691-b9bc-d845c54c4806.png"></a>&nbsp;
                <!-- <a href="https://www.linkedin.com/company/motojoe" target="_blank"><img src="https://gallery.mailchimp.com/4bab2b6cbe384b82e4e31426c/images/1a5e6c32-a0d1-4e06-9566-2a9ff1f55677.png"></a>&nbsp; -->
                <a href="https://www.instagram.com/motojoe.co.uk/" target="_blank"><img src="https://gallery.mailchimp.com/4bab2b6cbe384b82e4e31426c/images/20733471-d8c0-4262-85f5-542b336a5ea1.png"></a>&nbsp;
                <!-- <a href="https://plus.google.com/103713213759608194818" target="_blank"><img src="https://gallery.mailchimp.com/4bab2b6cbe384b82e4e31426c/images/5438a100-4e5e-4172-9202-5a3c7a936350.png"></a> -->
            </td>
            </tr>
            </tbody>
        </table>
        <br/><br/>
        rentamotorcycle.co.uk is a trading name used by MotoJoe Ltd, a company registered in Scotland with registered number SC462439.<br/><br/>
        MotoJoe is all about having fun with motorcycles.<br/>
        We can take you on adventures in Scotland and beyond.<br/>
        We can help you take your first steps into motorcycling with our training.<br/>
        We can take you off the beaten track and, indeed, the road, for off-road experiences.<br/><br/>
        <strong>Our ethos is to support and inspire each and every customer.</strong><br/><br/>
        From helping you gain the skills and experience to get the most out of your time on a motorcycle to sharing our passion and enthusiasm for touring Scotland by motorcycle.<br/>`

        msg.html = msg.html + signature;

        console.log(msg);

        transporter.sendMail(msg, function (error, info) {
            if (error) {
                console.log("error");
                console.log(error);
                console.log(process.env.EMAIL_USER);
                callback(error);
            } else {
                callback(null, {
                    statusCode: 200,
                    body: "Ok"
                });
            }
        });
    }
    else {
        callback("message not constructed...");
    }
}

function contact(data) {
    console.log("contact");
    console.dir(data);

    let msg = `<p>Thank you for contacting motojoe.co.uk</p>
    <p>Just to confirm we have received your message:</p>
    <p>Subject: <br/>${data.subject}</p>
    <p>Message: <br/>${data.message}</p>`

    return {
        from: from,
        to: data.email,
        bcc: `${from}, ${process.env.EMAIL_USER}`,
        subject: data.subject,
        html: msg
    }
}

function rental(data) {
    console.log("rental");
    console.dir(data);

    let msg = `<p>Thank you for contacting motojoe.co.uk</p>
    <p>Just to confirm we have received your availability enquiry and will respond in due course.</p>
    <br/>
    <p>${data.firstname} ${data.lastname} (${data.email})</p>
    <br/>
    <table cellspacing="2" cellpadding="2">
        <tr><td>Motorcycle</td><td>Pick Up</td><td>Drop Off</td></tr>
        <tr><td>${data.motorcycle}</td><td>${data.pickup_date} ${data.pickup_hours}:${data.pickup_minutes}</td><td>${data.dropoff_date} ${data.dropoff_hours}:${data.dropoff_minutes}</td></tr>
    </table>
    <br/>
    <table cellspacing="2" cellpadding="2">
    <tr><td>Days</td><td>Daily Rate</td><td>Charge</td></tr>
    <tr><td>${data.days}</td><td>${data.days}</td><td align="right">${data.charge}</td></tr>`

    if (data.weekend_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Weekend Rate Applies</td><td align="right">${data.weekend_charge}</td></tr>`
    }
 
    if (data.sundaypickup_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Sunday Pick Up</td><td align="right">${data.sundaypickup_charge}</td></tr>`
    }
 
    if (data.mondaypickup_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Monday Pick Up</td><td align="right">${data.mondaypickup_charge}</td></tr>`
    }
 
    if (data.sundaydropoff_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Sunday Drop Off</td><td align="right">${data.sundaydropoff_charge}</td></tr>`
    }
 
    if (data.mondaydropoff_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Monday Drop Off</td><td align="right">${data.mondaydropoff_charge}</td></tr>`
    }
 
    if (data.satnav_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Sat Nav</td><td align="right">${data.satnav_charge}</td></tr>`
    }
 
    if (data.overseas_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Overseas Licence</td><td align="right">${data.overseas_charge}</td></tr>`
    }
 
    if (data.outside_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Ride outside UK</td><td align="right">${data.outside_charge}</td></tr>`
    }
 
    if (data.panniers_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Panniers</td><td align="right">${data.panniers_charge}</td></tr>`
    }
 
    if (data.topbox_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Topbox</td><td align="right">${data.topbox_charge}</td></tr>`
    }
 
    if (data.tankbag_charge != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Tank Bag</td><td align="right">${data.tankbag_charge}</td></tr>`
    }
 
    if (data.week_discount != "£0") {
        msg = msg + `<tr><td colspan="2" align="right">Discount</td><td align="right">${data.week_discount}</td></tr>`
    }
 
    msg = msg + `<tr><td colspan="2" align="right"><strong>TOTAL:</strong></td><td align="right"><strong>${data.total}</strong></td></tr>
        </table>`;

    return {
        from: from,
        to: data.email,
        bcc: `${from}, ${process.env.EMAIL_USER}`,
        subject: "Availability Enquiry",
        html: msg
    }
}

function confirmation(data) {
    console.log("confirmation");
    console.dir(data);

    let msg = `<p>Thank you for confirming your booking with motojoe.co.uk</p>
    <p>Please double check that the details we have are correct:</p>
    <br/>
    <table cellspacing="2" cellpadding="2">
    <tr><td>First Name:</td><td>${data.first_name}</td></tr>
    <tr><td>Last Name:</td><td>${data.last_name}</td></tr>
    <tr><td>Email Address:</td><td>${data.email}</td></tr>
    <tr><td>Telephone:</td><td>${data.phone}</td></tr>
    <tr><td>Address:</td><td>${data.home_address_1}</td></tr>
    <tr><td></td><td>${data.home_address_2}</td></tr>
    <tr><td>City/Town</td><td>${data.home_city}</td></tr>
    <tr><td>Postcode/ZIP</td><td>${data.home_postcode}</td></tr>
    <tr><td>Contact Details (whilst renting):</td><td>${data.contact_details || ""}</td></tr>
    <tr><td>Occupation:</td><td>${data.occupation}</td></tr>
    <tr><td>DOB:</td><td>${data.dob}</td></tr>
    <tr><td>Licence No:</td><td>${data.licence}</td></tr>
    <tr><td>Years Licence held for :</td><td>${data.licence_held}</td></tr>
    <tr><td>Issuing Authority:</td><td>${data.authority}</td></tr>
    <tr><td>Licence Address:</td><td>${data.licence_address || ""}</td></tr>
    <tr><td>Pillion:</td><td>${data.pillion || ""}</td></tr>
    <tr><td>Terms Accepted:</td><td>${data.rental_terms_agreement}</td></tr>
    <tr><td>Liability Accepted:</td><td>${data.insurance_terms_agreement}</td></tr>
    <tr><td>Excess Accepted:</td><td>${data.excess}</td></tr>
    <tr><td>Declined:</td><td>${data.declined || ""}</td></tr>
    <tr><td>Offences:</td><td>${data.offences || ""}</td></tr>
    <tr><td>Conditions:</td><td>${data.conditions || ""}</td></tr>
    <tr><td>Acc/Claims:</td><td>${data.accident || ""}</td></tr>
    <tr><td>Further Details:</td><td>${data.further_details || ""}</td></tr>
    <tr><td>E/C Name:</td><td>${data.emergency_contact_name}</td></tr>
    <tr><td>E/C Number:</td><td>${data.emergency_contact_number}</td></tr>
    <tr><td>E/C Relationship:</td><td>${data.emergency_contact_relationship}</td></tr>
    </table>`;

    return {
        from: from,
        to: data.email,
        bcc: `${from}, ${process.env.EMAIL_USER}`,
        subject: "Rental Confirmation",
        html: msg
    }
}
