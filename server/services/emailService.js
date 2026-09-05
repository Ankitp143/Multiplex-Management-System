const nodemailer = require("nodemailer");

// Create transport with fallback for local testing / production
const createTransporter = async () => {
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Fallback: Generate Ethereal test account if credentials not configured
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    } catch (err) {
        console.warn("⚠️ Could not create Ethereal test account. Mail log mode enabled.", err.message);
        return null;
    }
};

/**
 * Send Password Reset OTP Email
 */
const sendPasswordResetOTP = async (toEmail, otp) => {
    const transporter = await createTransporter();
    
    const subject = "🔒 Your Password Reset OTP - Multiplex Management System";
    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f17; color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto;">
            <h2 style="color: #e5a017; text-align: center;">🎬 Multiplex Management</h2>
            <hr style="border-color: #262938; margin-bottom: 20px;" />
            <h3 style="text-align: center;">Password Reset Verification Code</h3>
            <p>You requested to reset your password. Use the 6-digit OTP code below to reset your password:</p>
            <div style="background: #191c2b; border: 2px dashed #e5a017; font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; padding: 15px; margin: 20px 0; color: #e5a017; border-radius: 8px;">
                ${otp}
            </div>
            <p style="font-size: 13px; color: #a0a5b8; text-align: center;">This code will expire in <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
    `;

    console.log(`\n==================================================`);
    console.log(`📩 [EMAIL OTP SENT] To: ${toEmail} | OTP: ${otp}`);
    console.log(`==================================================\n`);

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: '"Multiplex Support" <no-reply@multiplex.com>',
                to: toEmail,
                subject,
                html
            });
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) console.log("📧 Email Preview URL:", previewUrl);
            return info;
        } catch (err) {
            console.error("❌ Email dispatch failed:", err.message);
        }
    }
};

/**
 * Send Booking & Ticket Confirmation Email
 */
const sendBookingConfirmation = async (toEmail, booking) => {
    const transporter = await createTransporter();
    if (!booking) return;

    const movieTitle = booking.show?.movie?.title || "Movie";
    const theatreName = booking.show?.theatre?.name || "Multiplex Theatre";
    const showDate = booking.show?.showDate ? new Date(booking.show.showDate).toLocaleDateString('en-IN') : "";
    const showTime = booking.show?.startTime || "";
    const seats = booking.seats?.map(s => s.seatNo).join(", ") || "";
    const amount = booking.finalAmount || 0;

    const subject = `🎟️ Booking Confirmed: ${movieTitle}`;
    const html = `
        <div style="font-family: Arial, sans-serif; background-color: #0d0f17; color: #ffffff; padding: 30px; border-radius: 12px; max-width: 520px; margin: 0 auto; border: 1px solid #262938;">
            <div style="text-align: center; margin-bottom: 20px;">
                <span style="font-size: 40px;">🎬</span>
                <h2 style="color: #e5a017; margin: 8px 0;">Booking Confirmed!</h2>
                <p style="color: #10b981; font-weight: bold; margin: 0;">🎉 Enjoy your movie!</p>
            </div>
            
            <div style="background-color: #191c2b; padding: 20px; border-radius: 10px; margin-bottom: 20px; border-left: 4px solid #e5a017;">
                <h3 style="margin-top: 0; color: #ffffff;">${movieTitle}</h3>
                <p style="margin: 6px 0; color: #a0a5b8; font-size: 14px;">🏢 <strong>Theatre:</strong> ${theatreName}</p>
                <p style="margin: 6px 0; color: #a0a5b8; font-size: 14px;">📅 <strong>Date & Time:</strong> ${showDate} | ${showTime}</p>
                <p style="margin: 6px 0; color: #a0a5b8; font-size: 14px;">💺 <strong>Seats:</strong> ${seats}</p>
                <p style="margin: 6px 0; color: #a0a5b8; font-size: 14px;">🎫 <strong>Booking Reference:</strong> ${booking.bookingId}</p>
                <hr style="border-color: #262938; margin: 12px 0;" />
                <div style="display: flex; justify-content: space-between; font-size: 16px;">
                    <span><strong>Total Amount Paid:</strong></span>
                    <span style="color: #e5a017; font-weight: bold;">₹${amount}</span>
                </div>
            </div>

            <p style="font-size: 12px; color: #a0a5b8; text-align: center;">Please present your digital ticket QR code at the multiplex entrance.</p>
        </div>
    `;

    console.log(`\n==================================================`);
    console.log(`🎟️ [TICKET EMAIL SENT] To: ${toEmail} | Booking: ${booking.bookingId}`);
    console.log(`==================================================\n`);

    if (transporter) {
        try {
            const info = await transporter.sendMail({
                from: '"Multiplex Bookings" <tickets@multiplex.com>',
                to: toEmail,
                subject,
                html
            });
            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) console.log("📧 Ticket Email Preview URL:", previewUrl);
            return info;
        } catch (err) {
            console.error("❌ Ticket email dispatch failed:", err.message);
        }
    }
};

module.exports = {
    sendPasswordResetOTP,
    sendBookingConfirmation
};
