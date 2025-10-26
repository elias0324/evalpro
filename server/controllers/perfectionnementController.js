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
            qualiteEvaluateur: user.academicGrade, }