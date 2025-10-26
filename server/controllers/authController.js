import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';

// ✅ Password validation helper
const validatePassword = (password) => {
    if (password.length < 8) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre' };
    }
    return { valid: true };
};

export const register = async (req, res) => {
    const {firstname, lastname, email, password, academicGrade, institution} = req.body;
    
    if(!firstname ||!lastname || !email || !password ||!academicGrade ||!institution){
        return res.json({success: false, message: 'Tous les champs sont requis'})
    }

    // ✅ Validate password strength
    const passwordCheck = validatePassword(password);
    if (!passwordCheck.valid) {
        return res.json({success: false, message: passwordCheck.message});
    }

    try {
        const existingUser = await userModel.findOne({email})
        if(existingUser){
            return res.json({ success: false, message : "Un utilisateur avec cet email existe déjà"});
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({firstname, lastname, email, password: hashedPassword, academicGrade, institution});
        await user.save();

        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        
        // ✅ Fixed cookie settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        // Sending welcome email
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Bienvenue sur EvalPro',
            text: `Bienvenue sur la plateforme EvalPro. Votre compte a été créé avec l'email: ${email}`
        }

        await transporter.sendMail(mailOptions);

        // ✅ AUTO-SEND VERIFICATION OTP
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();

        const otpMailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: '🔐 Code de vérification EvalPro',
            text: `Bonjour ${firstname},\n\nVoici votre code de vérification: ${otp}\n\n⏰ Ce code expire dans 24 heures.\n\nCordialement,\nL'équipe EvalPro`
        }

        await transporter.sendMail(otpMailOptions);

        // ✅ Return user data along with success
        return res.json({
            success: true,
            message: 'Inscription réussie! Un code OTP a été envoyé à votre email.',
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                academicGrade: user.academicGrade,
                institution: user.institution,
                IsAccountVerified: user.IsAccountVerified
            }
        });
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const login = async (req, res)=>{
    const {email, password} = req.body;

    if (!email || !password){
        return res.json({success: false, message: 'Email and password are required'})
    }

    try {
        const user = await userModel.findOne({email});

        if (!user) {
            return res.json({success: false, message: 'Invalid email'})
        }
        
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch){
            return res.json({success: false, message: 'Invalid password'})
        }
        
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        
        // ✅ Fixed cookie settings
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        // ✅ Return user data along with success
        return res.json({
            success: true,
            message: 'Login successful',
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                academicGrade: user.academicGrade,
                institution: user.institution,
                IsAccountVerified: user.IsAccountVerified
            }
        });
        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token',{
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        })
        return res.json({success: true, message: "Logged Out"})
        
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

//send verification Otp to the user's email
export const sendVerifyOtp = async (req, res) => {
    try {
       const userId = req.userId; 
       const user = await userModel.findById(userId);
       
       if(!user){
        return res.json({success: false, message: "User not found"});
       } 

       if(user.IsAccountVerified){
        return res.json({success: false, message: "Account already verified"})
       }
       
       const otp = String(Math.floor(100000 + Math.random() * 900000));

       user.verifyOtp = otp;
       user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
       await user.save();

       const mailOption = {
        from: process.env.SENDER_EMAIL,
        to: user.email,
        subject: 'Code de vérification EvalPro',
        text: `Votre code OTP est: ${otp}. Utilisez ce code pour vérifier votre compte.`
       }

       await transporter.sendMail(mailOption);
       res.json({ success: true, message: 'Code OTP envoyé par email'});
    } catch (error) {
        res.json({success: false, message: error.message});
    }
}

// ✅ FIXED: verify email using otp - NOW KEEPS USER LOGGED IN
export const verifyEmail = async(req, res) =>{
    const {otp} = req.body;
    const userId = req.userId;
    
    if(!userId || !otp) {
       return res.json({ success: false, message: 'Missing Details'}); 
    }
    try {
        const user = await userModel.findById(userId);

        if(!user){
            return res.json({ success: false, message: 'User not found'});
        }

        if(user.verifyOtp === '' || user.verifyOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP'});
        }

        if(user.verifyOtpExpireAt < Date.now()){
            return res.json({ success: false, message: 'OTP Expired'});
        }

        user.IsAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        // ✅ Generate a NEW token to keep user logged in
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, { expiresIn: '7d'});
        
        // ✅ Set the cookie again with new token
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            maxAge : 7 * 24 * 60 * 60 * 1000
        });

        // ✅ Return updated user data
        return res.json({ 
            success: true, 
            message: 'Email verified successfully',
            user: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                academicGrade: user.academicGrade,
                institution: user.institution,
                IsAccountVerified: user.IsAccountVerified
            }
        });
        
    } catch (error) {
        return res.json({ success: false, message: error.message})
    }
}

// check if user is authenticated
export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true})
    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}

// send password reset otp
export const sendResetOtp = async (req, res) => {
    const {email} = req.body;

    if(!email){
        return res.json({ success: false, message: 'Email is required'})
    }

    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({ success: false, message: 'User not found'});
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Réinitialisation du mot de passe',
            text: `Votre code OTP pour réinitialiser votre mot de passe est: ${otp}. Ce code expire dans 15 minutes.`
        }

       await transporter.sendMail(mailOption);
       res.json({ success: true, message: 'Code OTP envoyé par email'});

    } catch (error) {
        return res.json({ success: false, message: error.message});
    }
}

// Reset user password
export const resetPassword = async (req, res) => {
    const {email, otp, newPassword} = req.body;

    if (!email || !otp || !newPassword){
        return res.json({ success: false, message: 'Tous les champs sont requis'});
    }

    // ✅ Validate new password strength
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.valid) {
        return res.json({success: false, message: passwordCheck.message});
    }
    
    try {
        const user = await userModel.findOne({email});
        if(!user){
            return res.json({ success: false, message: 'User not found'});
        }

        if(user.resetOtp === "" || user.resetOtp !== otp){
            return res.json({ success: false, message: 'Invalid OTP'});
        }

        if(user.resetOtpExpireAt < Date.now()){
            return res.json({ success: false, message: 'OTP Expired'});
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({ success: true, message: 'Password has been reset successfully'});
        
    } catch (error) {
        return res.json({ success: false, message: error.message});
    }
}