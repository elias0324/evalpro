import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await userModel.findById(userId);

        if(!user){
            return res.json({ success: false, message: 'User not found'});
        }
        res.json({
            success: true,
            userData: {
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                academicGrade: user.academicGrade,
                institution: user.institution,
                IsAccountVerified: user.IsAccountVerified
            }
        });

    } catch (error) {
        res.json({ success: false, message: error.message});
    }
}