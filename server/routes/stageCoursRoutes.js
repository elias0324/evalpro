import express from 'express';
import {
    createStageCourt,
    getUserStages,
    getStageById,
    updateStage,
    addPublicationsStage,
    submitStage,
    examinerRecevabiliteStage,
    addEvaluationStage,
    decisionFinaleStage,
    getAllStages,
    deleteStage,
    recalculerPointsStage,
    enregistrerRapportStage,
    getStatistiquesStages,
    getStagesByType,
    checkEligibilite,
    demanderComplementsStage
} from '../controllers/stageCourtController.js';
import authUser from '../middleware/authUser.js';
import { authAdmin, authEvaluateur, authPresident } from '../middleware/authUser.js';

const stageCourtRouter = express.Router();

// ============================================
// ROUTES PUBLIQUES (Informations générales)
// ============================================

// Obtenir les types de stages disponibles
stageCourtRouter.get('/types', (req, res) => {
    res.json({
        success: true,
        types: [
            { value: 'formation_specialisee', label: 'Formation Spécialisée' },
            { value: 'conference_internationale', label: 'Conférence Internationale' },
            { value: 'seminaire_scientifique', label: 'Séminaire Scientifique' },
            { value: 'atelier_formation', label: 'Atelier de Formation' },
            { value: 'ecole_thematique', label: 'École Thématique' },
            { value: 'ecole_doctorale', label: 'École Doctorale' },
            { value: 'visite_scientifique', label: 'Visite Scientifique' },
            { value: 'workshop', label: 'Workshop' },
            { value: 'summer_school', label: 'Summer School' },
            { value: 'collaboration_recherche', label: 'Collaboration Recherche' }
        ]
    });
});

// Obtenir les critères d'éligibilité
stageCourtRouter.get('/criteres-eligibilite', (req, res) => {
    res.json({
        success: true,
        criteres: {
            dureeMaximale: 15,
            unite: 'jours',
            exclusions: ['DOCTORANT'],
            limitesAnnuelles: 1,
            documentsRequis: [
                'lettreAcceptation',
                'programmeCours',
                'cv',
                'lettreMotivation',
                'attestationTravail',
                'accordChefDepartement'
            ],
            pointsMinimumRecommandes: 20
        }
    });
});

// ============================================
// ROUTES UTILISATEUR (Authentification requise)
// ============================================

// Vérifier l'éligibilité pour un stage court
stageCourtRouter.get('/check-eligibilite', authUser, checkEligibilite);

// Créer une nouvelle candidature de stage court
stageCourtRouter.post('/create', authUser, createStageCourt);

// Obtenir toutes les candidatures de stage de l'utilisateur connecté
stageCourtRouter.get('/my-stages', authUser, getUserStages);

// Obtenir le résumé des candidatures de l'utilisateur
stageCourtRouter.get('/my-stages/summary', authUser, async (req, res) => {
    try {
        const userId = req.userId;
        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        
        const totalStages = await stageCourtModel.countDocuments({ userId });
        const enCours = await stageCourtModel.countDocuments({ 
            userId, 
            statut: { $in: ['brouillon', 'soumise', 'recevable', 'en_cours_evaluation'] } 
        });
        const acceptees = await stageCourtModel.countDocuments({ 
            userId, 
            'decisionFinale.decision': 'accepte' 
        });
        const refusees = await stageCourtModel.countDocuments({ 
            userId, 
            'decisionFinale.decision': 'refuse' 
        });
        
        const derniereAnnee = new Date().getFullYear();
        const stagesAnneeActuelle = await stageCourtModel.countDocuments({ 
            userId, 
            anneeCandidature: derniereAnnee 
        });

        res.json({
            success: true,
            summary: {
                totalStages,
                enCours,
                acceptees,
                refusees,
                stagesAnneeActuelle,
                anneeActuelle: derniereAnnee
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération du résumé",
            error: error.message
        });
    }
});

// Obtenir une candidature de stage par ID
stageCourtRouter.get('/:id', authUser, getStageById);

// Mettre à jour une candidature de stage
stageCourtRouter.put('/:id', authUser, updateStage);

// Ajouter des publications vérifiées à la candidature
stageCourtRouter.post('/:id/add-publications', authUser, addPublicationsStage);

// Retirer une publication de la candidature
stageCourtRouter.delete('/:id/remove-publication/:publicationId', authUser, async (req, res) => {
    try {
        const { id, publicationId } = req.params;
        const userId = req.userId;
        
        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (stage.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        if (!['brouillon', 'en_attente_complements'].includes(stage.statut)) {
            return res.status(400).json({
                success: false,
                message: "Impossible de modifier les publications après soumission"
            });
        }

        stage.publicationsVerifiees = stage.publicationsVerifiees.filter(
            pub => pub.publicationId.toString() !== publicationId
        );

        await stage.calculerPoints();

        res.json({
            success: true,
            message: "Publication retirée avec succès",
            stage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors du retrait de la publication",
            error: error.message
        });
    }
});

// Recalculer les points d'une candidature de stage
stageCourtRouter.post('/:id/recalculate-points', authUser, recalculerPointsStage);

// Soumettre la candidature de stage
stageCourtRouter.post('/:id/submit', authUser, submitStage);

// Enregistrer le rapport de stage après retour
stageCourtRouter.post('/:id/rapport', authUser, enregistrerRapportStage);

// Mettre à jour les informations de suivi du stage
stageCourtRouter.put('/:id/suivi', authUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { dateDepart, dateRetour, billetReserve, visaObtenu, assuranceValidee } = req.body;
        
        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (stage.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        if (stage.statut !== 'acceptee') {
            return res.status(400).json({
                success: false,
                message: "Seules les candidatures acceptées peuvent avoir un suivi"
            });
        }

        if (dateDepart) stage.suiviStage.dateDepart = dateDepart;
        if (dateRetour) stage.suiviStage.dateRetour = dateRetour;
        if (billetReserve !== undefined) stage.suiviStage.billetReserve = billetReserve;
        if (visaObtenu !== undefined) stage.suiviStage.visaObtenu = visaObtenu;
        if (assuranceValidee !== undefined) stage.suiviStage.assuranceValidee = assuranceValidee;

        await stage.save();

        res.json({
            success: true,
            message: "Informations de suivi mises à jour",
            stage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour du suivi",
            error: error.message
        });
    }
});

// Dupliquer une candidature pour créer une nouvelle
stageCourtRouter.post('/:id/duplicate', authUser, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        
        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (stage.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        const stageData = stage.toObject();
        delete stageData._id;
        delete stageData.numeroCandidature;
        delete stageData.statut;
        delete stageData.dateSoumission;
        delete stageData.recevabilite;
        delete stageData.evaluations;
        delete stageData.decisionFinale;
        delete stageData.suiviStage;
        delete stageData.historique;
        delete stageData.notifications;
        delete stageData.createdAt;
        delete stageData.updatedAt;

        stageData.statut = 'brouillon';
        stageData.anneeCandidature = new Date().getFullYear();

        const nouveauStage = new stageCourtModel(stageData);
        await nouveauStage.save();

        res.status(201).json({
            success: true,
            message: "Candidature dupliquée avec succès",
            stage: nouveauStage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la duplication",
            error: error.message
        });
    }
});

// Supprimer une candidature de stage (seulement brouillon)
stageCourtRouter.delete('/:id', authUser, deleteStage);

// ============================================
// ROUTES ADMIN
// ============================================

// Obtenir toutes les candidatures de stage (avec filtres)
stageCourtRouter.get('/admin/all', authAdmin, getAllStages);

// Obtenir les statistiques des stages
stageCourtRouter.get('/admin/statistiques', authAdmin, getStatistiquesStages);

// Obtenir les stages par type
stageCourtRouter.get('/admin/type/:typeStage', authAdmin, getStagesByType);

// Obtenir les stages par pays
stageCourtRouter.get('/admin/pays/:pays', authAdmin, async (req, res) => {
    try {
        const { pays } = req.params;
        const { statut, page = 1, limit = 20 } = req.query;

        const filter = { paysDestination: pays };
        if (statut) filter.statut = statut;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stages = await stageCourtModel
            .find(filter)
            .populate('userId', 'firstname lastname email academicGrade institution')
            .sort({ dateSoumission: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await stageCourtModel.countDocuments(filter);

        res.json({
            success: true,
            count: stages.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            stages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des stages",
            error: error.message
        });
    }
});

// Examiner la recevabilité d'une candidature de stage
stageCourtRouter.post('/:id/recevabilite', authAdmin, examinerRecevabiliteStage);

// Demander des compléments
stageCourtRouter.post('/:id/demander-complements', authAdmin, demanderComplementsStage);

// Annuler une candidature
stageCourtRouter.post('/:id/annuler', authAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { motif } = req.body;

        const userModel = (await import('../models/userModel.js')).default;
        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;

        const user = await userModel.findById(userId);
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        stage.statut = 'annulee';

        stage.historique.push({
            action: 'annulation',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: motif || 'Candidature annulée par administration'
        });

        stage.notifications.push({
            type: 'annulation',
            message: `Votre candidature a été annulée: ${motif}`,
            date: new Date()
        });

        await stage.save();

        res.json({
            success: true,
            message: "Candidature annulée",
            stage
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'annulation",
            error: error.message
        });
    }
});

// ============================================
// ROUTES ÉVALUATEUR
// ============================================

// Obtenir les candidatures à évaluer
stageCourtRouter.get('/evaluateur/a-evaluer', authEvaluateur, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stages = await stageCourtModel
            .find({ 
                statut: { $in: ['recevable', 'en_cours_evaluation'] } 
            })
            .populate('userId', 'firstname lastname email academicGrade institution')
            .sort({ dateRecevabilite: 1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await stageCourtModel.countDocuments({ 
            statut: { $in: ['recevable', 'en_cours_evaluation'] } 
        });

        res.json({
            success: true,
            count: stages.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            stages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des candidatures",
            error: error.message
        });
    }
});

// Ajouter une évaluation à une candidature de stage
stageCourtRouter.post('/:id/evaluation', authEvaluateur, addEvaluationStage);

// ============================================
// ROUTES PRÉSIDENT COMMISSION
// ============================================

// Obtenir les candidatures évaluées (prêtes pour décision)
stageCourtRouter.get('/president/evaluees', authPresident, async (req, res) => {
    try {
        const { page = 1, limit = 20, annee } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const filter = { statut: 'evaluee' };
        if (annee) filter.anneeCandidature = parseInt(annee);

        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stages = await stageCourtModel
            .find(filter)
            .populate('userId', 'firstname lastname email academicGrade institution')
            .sort({ noteMoyenne: -1, pointsCalcules: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await stageCourtModel.countDocuments(filter);

        res.json({
            success: true,
            count: stages.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            stages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des candidatures",
            error: error.message
        });
    }
});

// Prendre une décision finale pour un stage
stageCourtRouter.post('/:id/decision-finale', authPresident, decisionFinaleStage);

// Exporter les candidatures pour délibération
stageCourtRouter.get('/president/export-deliberation', authPresident, async (req, res) => {
    try {
        const { annee } = req.query;
        const filter = { 
            statut: 'evaluee',
            anneeCandidature: annee ? parseInt(annee) : new Date().getFullYear()
        };

        const stageCourtModel = (await import('../models/stageCourtModel.js')).default;
        const stages = await stageCourtModel
            .find(filter)
            .populate('userId', 'firstname lastname email academicGrade institution')
            .sort({ noteMoyenne: -1, 'pointsCalcules.pointsTotal': -1 });

        const exportData = stages.map((stage, index) => ({
            rang: index + 1,
            numeroCandidature: stage.numeroCandidature,
            candidat: `${stage.firstname} ${stage.lastname}`,
            grade: stage.academicGrade,
            institution: stage.institution,
            typeStage: stage.typeStage,
            destination: `${stage.villeDestination}, ${stage.paysDestination}`,
            duree: stage.dureeJours,
            points: stage.pointsCalcules?.pointsTotal || 0,
            noteMoyenne: stage.noteMoyenne || 0,
            nombreEvaluations: stage.evaluations?.length || 0
        }));

        res.json({
            success: true,
            count: exportData.length,
            annee: filter.anneeCandidature,
            candidatures: exportData
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'export",
            error: error.message
        });
    }
});

export default stageCourtRouter;