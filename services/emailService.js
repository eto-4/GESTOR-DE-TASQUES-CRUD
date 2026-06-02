// services/emailService.js
const nodemailer = require('nodemailer');

// Configurar el transportador amb les credencials de Mailtrap
const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS
    }
});

// Envia l'email de recuperació de contrasenya
// El token es genera al controlador i s'inclou a l'URL
const sendPasswordResetEmail = async (email, resetToken) => {
    const resetUrl = `http://localhost:3000/api/auth/reset-password/${resetToken}`;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Recuperació de contrasenya - Gestor de Tasques',
        html: `
            <h2>Recuperació de contrasenya</h2>
            <p>Has sol·licitat recuperar la teva contrasenya.</p>
            <p>Fes clic al següent enllaç per restablir-la:</p>
            <a href="${resetUrl}" style="
                background-color: #4CAF50;
                color: white;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                margin: 10px 0;
            ">Restablir contrasenya</a>
            <p>O copia aquesta URL al teu navegador:</p>
            <p>${resetUrl}</p>
            <p><strong>Aquest enllaç expira en 1 hora.</strong></p>
            <p>Si no has sol·licitat aquest canvi, ignora aquest email.</p>
        `
    };

    return transporter.sendMail(mailOptions);
};

module.exports = { sendPasswordResetEmail };