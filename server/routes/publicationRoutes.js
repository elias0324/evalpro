import express from 'express';
import {
    createPublication,
    getUserPublications,
    getPublicationById,
    updatePublication,
    submitPublication,
    deletePublication,
    getPublicationsToVerify,
    validatePublication,
    rejectPublication,
    requestComplements,
    getVerifiedPublications,
    getUserPublicationsStats
} from '../controllers/publicationController.js';
import authUser from '../middleware/authUser.js';
import { authAdmin, authEvaluateur } from '../middleware/authUser.js';

const publicationRouter = express.Router();

// ============================================
// ROUTES UTILISATEUR (Authentification requise)
// ============================================

// Créer une nouvelle publication
publicationRouter.post('/create', authUser, createPublication);

// Obtenir toutes les publications de l'utilisateur connecté
publicationRouter.get('/my-publications', authUser, getUserPublications);

// Obtenir les publications vérifiées de l'utilisateur (pour candidatures)
publicationRouter.get('/verified', authUser, getVerifiedPublications);

// Obtenir les statistiques des publications de l'utilisateur
publicationRouter.get('/stats', authUser, getUserPublicationsStats);

// Obtenir une publication par ID
publicationRouter.get('/:id', authUser, getPublicationById);

// Mettre à jour une publication
publicationRouter.put('/:id', authUser, updatePublication);

// Soumettre une publication pour vérification
publicationRouter.post('/:id/submit', authUser, submitPublication);

// Supprimer une publication
publicationRouter.delete('/:id', authUser, deletePublication);

// ============================================
// ROUTES ADMIN/ÉVALUATEUR
// ============================================

// Obtenir toutes les publications à vérifier
publicationRouter.get('/admin/to-verify', authEvaluateur, getPublicationsToVerify);

// Valider une publication
publicationRouter.post('/:id/validate', authEvaluateur, validatePublication);

// Rejeter une publication
publicationRouter.post('/:id/reject', authEvaluateur, rejectPublication);

// Demander des compléments
publicationRouter.post('/:id/request-complements', authEvaluateur, requestComplements);

export default publicationRouter;