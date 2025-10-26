import stageCourtModel from "../models/stageCourtModel.js";
import publicationModel from "../models/publicationModel.js";
import userModel from "../models/userModel.js";

// Créer une nouvelle candidature de stage court
export const createStageCourt = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        // Vérifier que ce n'est pas un doctorant
        if (user.academicGrade === 'DOCTORANT') {
            return res.status(400).json({
                success: false,
                message: "Les doctorants ne peuvent pas postuler pour un stage de courte durée"
            });
        }

        // Pré-remplir les informations depuis le profil
        const stageData = {
            ...req.body,
            userId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            academicGrade: user.academicGrade,
            institution: user.institution
        };

        // Vérifier la durée (max 15 jours)
        if (stageData.dureeJours && stageData.dureeJours > 15) {
            return res.status(400).json({
                success: false,
                message: "La durée du stage ne peut pas dépasser 15 jours"
            });
        }

        const stage = new stageCourtModel(stageData);
        await stage.save();

        res.status(201).json({
            success: true,
            message: "Candidature de stage créée avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur création stage:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la candidature",
            error: error.message
        });
    }
};

// Obtenir toutes les candidatures de stage d'un utilisateur
export const getUserStages = async (req, res) => {
    try {
        const userId = req.userId;
        const { statut, annee, typeStage } = req.query;

        const filter = { userId };
        if (statut) filter.statut = statut;
        if (annee) filter.anneeCandidature = parseInt(annee);
        if (typeStage) filter.typeStage = typeStage;

        const stages = await stageCourtModel
            .find(filter)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: stages.length,
            stages
        });
    } catch (error) {
        console.error("Erreur récupération stages:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des candidatures",
            error: error.message
        });
    }
};

// Obtenir une candidature de stage par ID
export const getStageById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        const stage = await stageCourtModel
            .findById(id)
            .populate('publicationsVerifiees.publicationId');

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        // Vérifier les permissions
        if (stage.userId.toString() !== userId && !['admin', 'evaluateur', 'president_commission'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        res.json({
            success: true,
            stage
        });
    } catch (error) {
        console.error("Erreur récupération stage:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la candidature",
            error: error.message
        });
    }
};

// Mettre à jour une candidature de stage
export const updateStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const updateData = req.body;

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

        // Ne pas permettre la modification si soumise
        if (!['brouillon', 'en_attente_complements'].includes(stage.statut)) {
            return res.status(400).json({
                success: false,
                message: "Cette candidature ne peut plus être modifiée"
            });
        }

        // Vérifier la durée si elle est modifiée
        if (updateData.dureeJours && updateData.dureeJours > 15) {
            return res.status(400).json({
                success: false,
                message: "La durée du stage ne peut pas dépasser 15 jours"
            });
        }

        // Mettre à jour les champs
        const fieldsToUpdate = [
            'paysDestination', 'villeDestination', 'organismeAccueil', 'adresseOrganisme',
            'siteWebOrganisme', 'typeOrganisme', 'typeStage', 'intituleStage', 'thematique',
            'domaine', 'dureeJours', 'dateDebut', 'dateFin', 'objectifs', 'descriptionStage',
            'apportScientifique', 'applicationsPrevues', 'competencesAcquerir', 'retombeesPedagogiques',
            'responsableStage', 'programmeCours', 'programmeDetaille', 'budgetEstimatif',
            'documents', 'projetsRecherche', 'encadrements', 'experiencePedagogique',
            'activitesPedagogiques', 'stagesPrecedents', 'langues', 'responsabilites'
        ];

        fieldsToUpdate.forEach(field => {
            if (updateData[field] !== undefined) {
                stage[field] = updateData[field];
            }
        });

        stage.historique.push({
            action: 'modification',
            auteurId: userId,
            auteurNom: `${stage.firstname} ${stage.lastname}`,
            date: new Date(),
            details: 'Candidature modifiée'
        });

        await stage.save();

        res.json({
            success: true,
            message: "Candidature mise à jour avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur mise à jour stage:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour",
            error: error.message
        });
    }
};

// Ajouter des publications vérifiées à la candidature de stage
export const addPublicationsStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { publicationIds } = req.body;

        if (!publicationIds || !Array.isArray(publicationIds)) {
            return res.status(400).json({
                success: false,
                message: "Liste de publications invalide"
            });
        }

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

        // Vérifier que les publications sont vérifiées et appartiennent à l'utilisateur
        const publications = await publicationModel.find({
            _id: { $in: publicationIds },
            userId,
            statut: 'verifie'
        });

        if (publications.length !== publicationIds.length) {
            return res.status(400).json({
                success: false,
                message: "Certaines publications sont invalides ou non vérifiées"
            });
        }

        // Ajouter les publications avec barème stage court
        stage.publicationsVerifiees = publications.map(pub => {
            // Recalculer les points selon le barème stage court
            const pointsStage = pub.calculerPoints('stage_court');
            
            return {
                publicationId: pub._id,
                titre: pub.titre,
                typePublication: pub.typePublication,
                annee: pub.anneePublication,
                points: pointsStage
            };
        });

        // Recalculer les points totaux
        await stage.calculerPoints();

        res.json({
            success: true,
            message: "Publications ajoutées avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur ajout publications:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout des publications",
            error: error.message
        });
    }
};

// Soumettre la candidature de stage
export const submitStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

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

        if (stage.statut !== 'brouillon') {
            return res.status(400).json({
                success: false,
                message: "Cette candidature a déjà été soumise"
            });
        }

        // Vérifier la durée
        if (stage.dureeJours > 15) {
            return res.status(400).json({
                success: false,
                message: "La durée du stage ne peut pas dépasser 15 jours"
            });
        }

        // Vérifier que tous les champs requis sont remplis
        const requiredFields = [
            'paysDestination', 'villeDestination', 'organismeAccueil', 'typeOrganisme',
            'typeStage', 'intituleStage', 'thematique', 'dureeJours', 'dateDebut', 'dateFin',
            'objectifs', 'descriptionStage', 'apportScientifique', 'applicationsPrevues',
            'responsableStage', 'budgetEstimatif', 'experiencePedagogique'
        ];

        const missingFields = requiredFields.filter(field => !stage[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Champs requis manquants",
                missingFields
            });
        }

        // Vérifier les documents requis
        const requiredDocs = [
            'lettreAcceptation', 'programmeCours', 'cv', 'lettreMotivation',
            'attestationTravail', 'accordChefDepartement'
        ];

        const missingDocs = requiredDocs.filter(doc => !stage.documents[doc]);

        if (missingDocs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Documents requis manquants",
                missingDocs
            });
        }

        // Calculer les points avant soumission
        await stage.calculerPoints();

        stage.statut = 'soumise';
        stage.dateSoumission = new Date();

        stage.historique.push({
            action: 'soumission',
            auteurId: userId,
            auteurNom: `${stage.firstname} ${stage.lastname}`,
            date: new Date(),
            details: `Candidature soumise avec ${stage.pointsCalcules.pointsTotal} points`
        });

        stage.notifications.push({
            type: 'soumission',
            message: 'Votre candidature de stage a été soumise avec succès',
            date: new Date()
        });

        await stage.save();

        res.json({
            success: true,
            message: "Candidature soumise avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur soumission stage:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la soumission",
            error: error.message
        });
    }
};

// ADMIN: Examiner la recevabilité d'un stage
export const examinerRecevabiliteStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { estRecevable, motifNonRecevabilite, remarques } = req.body;

        const user = await userModel.findById(userId);
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        stage.recevabilite = {
            estRecevable,
            dateExamen: new Date(),
            examinateurId: userId,
            examinateurNom: `${user.firstname} ${user.lastname}`,
            motifNonRecevabilite: estRecevable ? undefined : motifNonRecevabilite,
            remarques
        };

        stage.statut = estRecevable ? 'recevable' : 'non_recevable';
        stage.dateRecevabilite = new Date();

        stage.historique.push({
            action: estRecevable ? 'recevabilite_acceptee' : 'recevabilite_refusee',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: estRecevable ? 'Candidature déclarée recevable' : `Non recevable: ${motifNonRecevabilite}`
        });

        stage.notifications.push({
            type: 'recevabilite',
            message: estRecevable 
                ? 'Votre candidature a été déclarée recevable'
                : `Votre candidature a été déclarée non recevable: ${motifNonRecevabilite}`,
            date: new Date()
        });

        await stage.save();

        res.json({
            success: true,
            message: estRecevable ? "Candidature déclarée recevable" : "Candidature déclarée non recevable",
            stage
        });
    } catch (error) {
        console.error("Erreur examen recevabilité:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'examen de recevabilité",
            error: error.message
        });
    }
};

// EVALUATEUR: Ajouter une évaluation pour un stage
export const addEvaluationStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const evaluationData = req.body;

        const user = await userModel.findById(userId);
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (stage.statut !== 'en_cours_evaluation' && stage.statut !== 'recevable') {
            return res.status(400).json({
                success: false,
                message: "Cette candidature ne peut pas être évaluée actuellement"
            });
        }

        // Calculer la note globale selon les critères du stage court
        const criteres = evaluationData.criteres;
        const noteGlobale = 
            (criteres.pertinenceStage?.note || 0) +
            (criteres.qualiteProduction?.note || 0) +
            (criteres.experiencePedagogique?.note || 0) +
            (criteres.apportFormation?.note || 0) +
            (criteres.faisabilite?.note || 0) +
            (criteres.qualiteDossier?.note || 0);

        const evaluation = {
            evaluateurId: userId,
            nomEvaluateur: `${user.firstname} ${user.lastname}`,
            qualiteEvaluateur: user.academicGrade,
            dateEvaluation: new Date(),
            criteres: evaluationData.criteres,
            noteGlobale,
            avis: evaluationData.avis,
            commentaireGeneral: evaluationData.commentaireGeneral,
            pointsForts: evaluationData.pointsForts,
            pointsFaibles: evaluationData.pointsFaibles,
            recommandations: evaluationData.recommandations
        };

        stage.evaluations.push(evaluation);
        stage.statut = 'en_cours_evaluation';

        // Calculer la note moyenne
        const totalNotes = stage.evaluations.reduce((sum, ev) => sum + ev.noteGlobale, 0);
        stage.noteMoyenne = totalNotes / stage.evaluations.length;

        stage.historique.push({
            action: 'evaluation_ajoutee',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: `Évaluation ajoutée - Note: ${noteGlobale}/100`
        });

        await stage.save();

        res.json({
            success: true,
            message: "Évaluation ajoutée avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur ajout évaluation:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'ajout de l'évaluation",
            error: error.message
        });
    }
};

// PRESIDENT COMMISSION: Décision finale pour un stage
export const decisionFinaleStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const decisionData = req.body;

        const user = await userModel.findById(userId);
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        stage.decisionFinale = {
            decision: decisionData.decision,
            rang: decisionData.rang,
            motif: decisionData.motif,
            recommandations: decisionData.recommandations,
            dateDecision: new Date(),
            dateDeliberation: decisionData.dateDeliberation,
            pvCommission: decisionData.pvCommission,
            decideurId: userId,
            decideurNom: `${user.firstname} ${user.lastname}`,
            montantAccorde: decisionData.montantAccorde,
            pourcentageFinancement: decisionData.pourcentageFinancement,
            typeFinancement: decisionData.typeFinancement,
            organisme: decisionData.organisme,
            conditionsParticulieres: decisionData.conditionsParticulieres,
            obligationsCandidat: decisionData.obligationsCandidat
        };

        stage.statut = decisionData.decision === 'accepte' ? 'acceptee' : 
                       decisionData.decision === 'refuse' ? 'refusee' : 'liste_attente';
        stage.dateDecisionFinale = new Date();

        stage.historique.push({
            action: 'decision_finale',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: `Décision: ${decisionData.decision}`
        });

        stage.notifications.push({
            type: 'decision',
            message: `Décision finale: ${decisionData.decision}`,
            date: new Date()
        });

        await stage.save();

        res.json({
            success: true,
            message: "Décision enregistrée avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur décision finale:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'enregistrement de la décision",
            error: error.message
        });
    }
};

// ADMIN: Obtenir toutes les candidatures de stage
export const getAllStages = async (req, res) => {
    try {
        const { statut, annee, typeStage, page = 1, limit = 20 } = req.query;

        const filter = {};
        if (statut) filter.statut = statut;
        if (annee) filter.anneeCandidature = parseInt(annee);
        if (typeStage) filter.typeStage = typeStage;

        const skip = (parseInt(page) - 1) * parseInt(limit);

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
        console.error("Erreur récupération stages:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des candidatures",
            error: error.message
        });
    }
};

// Supprimer une candidature de stage (seulement brouillon)
export const deleteStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

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

        if (stage.statut !== 'brouillon') {
            return res.status(400).json({
                success: false,
                message: "Seules les candidatures en brouillon peuvent être supprimées"
            });
        }

        await stageCourtModel.findByIdAndDelete(id);

        res.json({
            success: true,
            message: "Candidature supprimée avec succès"
        });
    } catch (error) {
        console.error("Erreur suppression stage:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression",
            error: error.message
        });
    }
};

// Recalculer les points d'un stage
export const recalculerPointsStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

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

        const points = await stage.calculerPoints();

        res.json({
            success: true,
            message: "Points recalculés avec succès",
            pointsCalcules: points
        });
    } catch (error) {
        console.error("Erreur recalcul points:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du recalcul des points",
            error: error.message
        });
    }
};

// Enregistrer le rapport de stage après retour
export const enregistrerRapportStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { 
            rapportStage, 
            attestationParticipation, 
            certificatStage,
            supportsFormation,
            certificatsObtenus,
            justificatifsFinanciers,
            totalDepense,
            evaluationStage
        } = req.body;

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
                message: "Seules les candidatures acceptées peuvent avoir un rapport"
            });
        }

        stage.suiviStage.rapportStage = rapportStage;
        stage.suiviStage.dateDepotRapport = new Date();
        stage.suiviStage.attestationParticipation = attestationParticipation;
        stage.suiviStage.certificatStage = certificatStage;
        stage.suiviStage.supportsFormation = supportsFormation || [];
        stage.suiviStage.certificatsObtenus = certificatsObtenus || [];
        stage.suiviStage.justificatifsFinanciers = justificatifsFinanciers || [];
        stage.suiviStage.totalDepense = totalDepense;
        stage.suiviStage.stageEffectue = true;
        stage.suiviStage.evaluationStage = evaluationStage;

        stage.historique.push({
            action: 'rapport_depose',
            auteurId: userId,
            auteurNom: `${stage.firstname} ${stage.lastname}`,
            date: new Date(),
            details: 'Rapport de stage déposé'
        });

        await stage.save();

        res.json({
            success: true,
            message: "Rapport de stage enregistré avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur enregistrement rapport:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de l'enregistrement du rapport",
            error: error.message
        });
    }
};

// Statistiques des candidatures de stage
export const getStatistiquesStages = async (req, res) => {
    try {
        const { annee } = req.query;
        const filter = annee ? { anneeCandidature: parseInt(annee) } : {};

        const total = await stageCourtModel.countDocuments(filter);
        
        const parStatut = await stageCourtModel.aggregate([
            { $match: filter },
            { $group: { _id: '$statut', count: { $sum: 1 } } }
        ]);

        const parTypeStage = await stageCourtModel.aggregate([
            { $match: filter },
            { $group: { _id: '$typeStage', count: { $sum: 1 } } }
        ]);

        const parGrade = await stageCourtModel.aggregate([
            { $match: filter },
            { $group: { _id: '$academicGrade', count: { $sum: 1 } } }
        ]);

        const parPays = await stageCourtModel.aggregate([
            { $match: filter },
            { $group: { _id: '$paysDestination', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        const acceptees = await stageCourtModel.countDocuments({
            ...filter,
            'decisionFinale.decision': 'accepte'
        });

        const refusees = await stageCourtModel.countDocuments({
            ...filter,
            'decisionFinale.decision': 'refuse'
        });

        const enCours = await stageCourtModel.countDocuments({
            ...filter,
            statut: { $in: ['soumise', 'recevable', 'en_cours_evaluation', 'evaluee'] }
        });

        // Durée moyenne des stages acceptés
        const dureeMoyenne = await stageCourtModel.aggregate([
            { 
                $match: { 
                    ...filter, 
                    'decisionFinale.decision': 'accepte' 
                } 
            },
            { 
                $group: { 
                    _id: null, 
                    moyenneDuree: { $avg: '$dureeJours' } 
                } 
            }
        ]);

        res.json({
            success: true,
            statistiques: {
                total,
                acceptees,
                refusees,
                enCours,
                parStatut,
                parTypeStage,
                parGrade,
                parPays,
                dureeMoyenneJours: dureeMoyenne[0]?.moyenneDuree || 0
            }
        });
    } catch (error) {
        console.error("Erreur statistiques stages:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors du calcul des statistiques",
            error: error.message
        });
    }
};

// Obtenir les stages par type
export const getStagesByType = async (req, res) => {
    try {
        const { typeStage } = req.params;
        const { statut, page = 1, limit = 20 } = req.query;

        const filter = { typeStage };
        if (statut) filter.statut = statut;

        const skip = (parseInt(page) - 1) * parseInt(limit);

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
        console.error("Erreur récupération stages par type:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des stages",
            error: error.message
        });
    }
};

// Vérifier l'éligibilité pour un stage court
export const checkEligibilite = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        const eligibilite = {
            eligible: true,
            raisons: []
        };

        // Vérifier que ce n'est pas un doctorant
        if (user.academicGrade === 'DOCTORANT') {
            eligibilite.eligible = false;
            eligibilite.raisons.push("Les doctorants ne sont pas éligibles aux stages de courte durée");
        }

        // Vérifier les candidatures en cours
        const candidaturesEnCours = await stageCourtModel.countDocuments({
            userId,
            statut: { $in: ['soumise', 'recevable', 'en_cours_evaluation', 'evaluee'] }
        });

        if (candidaturesEnCours > 0) {
            eligibilite.eligible = false;
            eligibilite.raisons.push("Vous avez déjà une candidature en cours d'évaluation");
        }

        // Vérifier les stages acceptés dans l'année
        const anneeActuelle = new Date().getFullYear();
        const stagesAnneeActuelle = await stageCourtModel.countDocuments({
            userId,
            anneeCandidature: anneeActuelle,
            'decisionFinale.decision': 'accepte'
        });

        if (stagesAnneeActuelle > 0) {
            eligibilite.eligible = false;
            eligibilite.raisons.push("Vous avez déjà bénéficié d'un stage cette année");
        }

        res.json({
            success: true,
            eligibilite
        });
    } catch (error) {
        console.error("Erreur vérification éligibilité:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la vérification d'éligibilité",
            error: error.message
        });
    }
};

// Demander des compléments
export const demanderComplementsStage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { demande } = req.body;

        if (!demande) {
            return res.status(400).json({
                success: false,
                message: "La demande de complément est requise"
            });
        }

        const user = await userModel.findById(userId);
        const stage = await stageCourtModel.findById(id);

        if (!stage) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        stage.complementsRequis.push({
            demande,
            dateRequete: new Date()
        });

        stage.statut = 'en_attente_complements';

        stage.historique.push({
            action: 'complements_demandes',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: demande
        });

        stage.notifications.push({
            type: 'complements',
            message: `Des compléments sont demandés: ${demande}`,
            date: new Date()
        });

        await stage.save();

        res.json({
            success: true,
            message: "Compléments demandés avec succès",
            stage
        });
    } catch (error) {
        console.error("Erreur demande compléments:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la demande de compléments",
            error: error.message
        });
    }
};