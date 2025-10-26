import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstname: {type: String, required: true, trim: true},
    lastname: {type: String, required: true, trim: true},
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
      },
      //telephone: { 
        //type: String,
        //match: [/^\+?[\d\s\-\(\)]{10,}$/, 'Numéro de téléphone invalide']
      //},
    password: {type: String, required: true},
    academicGrade: {
        type: String,
        required: true,
        enum :[
            'PROFESSEUR',
            'MAITRE_DE_CONFERENCES_CLASSE_A',
            'MAITRE_DE_CONFERENCES_CLASSE_B',
            'MAITRE_ASSISTANT_CLASSE_A',
            'MAITRE_ASSISTANT_CLASSE_B',
            'DOCTORANT',
            'PERSONNEL_ADMINISTRATIF'
        ],
        default : 'DOCTORANT'
    },
    institution: {
        type: String,
        required: true,
        enum: [
            'UNIVERSITE_TLEMCEN_ABOU_BAKR_BELKAID',
            'UNIVERSITE_ORAN_1',
            'UNIVERSITE_ALGER_1'
        ],
        default: 'UNIVERSITE_TLEMCEN_ABOU_BAKR_BELKAID'
    },
    role: {
        type: String,
        enum: ['candidat', 'admin', 'evaluateur'],
        default: 'candidat'
    },

    verifyOtp: {type: String, default: ''},
    verifyOtpExpireAt: {type: Number, default: 0},
    IsAccountVerified: {type: Boolean, default: false},
    resetOtp: {type: String, default: ''},
    resetOtpExpireAt: {type: Number, default: 0},

})
const  userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
