import express from 'express';
import {
    createPerfectionnement,
    getUserCandidatures,
    getCandidatureById,
    updateCandidature,
    addPublications,
    submitCandidature,
    examinerRecevabilite,
    addEvaluation,
    convoquerAudition,
    enregistrerAudition,
    decisionFinale,
    getAllCandidatures,
    deleteCandidature,
    recalculerPoints,
    getStatistiques
} from '../controllers/perfectionnementController.js';
import authUser from '../middleware/authUser.js';
import { authAdmin, authEvaluateur, authPresident } from '../middleware/authUser.js';

const perfectionnementRouter = express.Router();

// ============================================
// ROUTES UTILISATEUR (Authentification requise)
// ============================================

// Créer une nouvelle candidature de perfectionnement
perfectionnementRouter.post('/create', authUser, createPerfectionnement);

// Obtenir toutes les candidatures de l'utilisateur connecté
perfectionnementRouter.get('/my-candidatures', authUser, getUserCandidatures);

// Obtenir une candidature par ID
perfectionnementRouter.get('/:id', authUser, getCandidatureById);

// Mettre à jour une candidature
perfectionnementRouter.put('/:id', authUser, updateCandidature);

// Ajouter des publications vérifiées à la candidature
perfectionnementRouter.post('/:id/add-publications', authUser, addPublications);

// Recalculer les points d'une candidature
perfectionnementRouter.post('/:id/recalculate-points', authUser, recalculerPoints);

// Soumettre la candidature
perfectionnementRouter.post('/:id/submit', authUser, submitCandidature);

// Supprimer une candidature (seulement brouillon)
perfectionnementRouter.delete('/:id', authUser, deleteCandidature);

// ============================================
// ROUTES ADMIN
// ============================================

// Obtenir toutes les candidatures (avec filtres)
perfectionnementRouter.get('/admin/all', authAdmin, getAllCandidatures);

// Obtenir les statistiques des candidatures
perfectionnementRouter.get('/admin/statistiques', authAdmin, getStatistiques);

// Examiner la recevabilité d'une candidature
perfectionnementRouter.post('/:id/recevabilite', authAdmin, examinerRecevabilite);

// Convoquer à une audition
perfectionnementRouter.post('/:id/convoquer-audition', authAdmin, convoquerAudition);

// Enregistrer le résultat de l'audition
perfectionnementRouter.post('/:id/audition', authAdmin, enregistrerAudition);

// ============================================
// ROUTES ÉVALUATEUR
// ============================================

// Ajouter une évaluation à une candidature
perfectionnementRouter.post('/:id/evaluation', authEvaluateur, addEvaluation);

// ============================================
// ROUTES PRÉSIDENT COMMISSION
// ============================================

// Prendre une décision finale
perfectionnementRouter.post('/:id/decision-finale', authPresident, decisionFinale);

export default perfectionnementRouter;