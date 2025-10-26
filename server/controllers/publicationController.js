import perfectionnementModel from "../models/perfectionnementModel.js";
import publicationModel from "../models/publicationModel.js";
import userModel from "../models/userModel.js";

// Créer une nouvelle candidature de perfectionnement
export const createPerfectionnement = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }

        // Pré-remplir les informations depuis le profil
        const candidatureData = {
            ...req.body,
            userId,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            academicGrade: user.academicGrade,
            institution: user.institution
        };

        const candidature = new perfectionnementModel(candidatureData);
        await candidature.save();

        res.status(201).json({
            success: true,
            message: "Candidature créée avec succès",
            candidature
        });
    } catch (error) {
        console.error("Erreur création candidature:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la création de la candidature",
            error: error.message
        });
    }
};

// Obtenir toutes les candidatures d'un utilisateur
export const getUserCandidatures = async (req, res) => {
    try {
        const userId = req.userId;
        const { statut, annee } = req.query;

        const filter = { userId };
        if (statut) filter.statut = statut;
        if (annee) filter.anneeCandidature = parseInt(annee);

        const candidatures = await perfectionnementModel
            .find(filter)
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: candidatures.length,
            candidatures
        });
    } catch (error) {
        console.error("Erreur récupération candidatures:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération des candidatures",
            error: error.message
        });
    }
};

// Obtenir une candidature par ID
export const getCandidatureById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const userRole = req.userRole;

        const candidature = await perfectionnementModel
            .findById(id)
            .populate('publicationsVerifiees.publicationId');

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        // Vérifier les permissions
        if (candidature.userId.toString() !== userId && !['admin', 'evaluateur', 'president_commission'].includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        res.json({
            success: true,
            candidature
        });
    } catch (error) {
        console.error("Erreur récupération candidature:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la candidature",
            error: error.message
        });
    }
};

// Mettre à jour une candidature
export const updateCandidature = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const updateData = req.body;

        const candidature = await perfectionnementModel.findById(id);

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (candidature.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        // Ne pas permettre la modification si soumise
        if (!['brouillon', 'en_attente_complements'].includes(candidature.statut)) {
            return res.status(400).json({
                success: false,
                message: "Cette candidature ne peut plus être modifiée"
            });
        }

        // Mettre à jour les champs
        const fieldsToUpdate = [
            'paysDestination', 'universiteAccueil', 'adresseUniversite', 'laboratoireAccueil',
            'specialite', 'dureeSejourMois', 'dateDebutPrevue', 'dateFinPrevue',
            'objetMission', 'justificationScientifique', 'resultatsPrevus', 'apportPourInstitution',
            'planTravailDetaille', 'budgetEstimatif', 'encadrantEtranger', 'documents',
            'projetsRecherche', 'encadrements', 'activitesPedagogiques', 'responsabilites',
            'manifestationsScientifiques'
        ];

        fieldsToUpdate.forEach(field => {
            if (updateData[field] !== undefined) {
                candidature[field] = updateData[field];
            }
        });

        candidature.historique.push({
            action: 'modification',
            auteurId: userId,
            auteurNom: `${candidature.firstname} ${candidature.lastname}`,
            date: new Date(),
            details: 'Candidature modifiée'
        });

        await candidature.save();

        res.json({
            success: true,
            message: "Candidature mise à jour avec succès",
            candidature
        });
    } catch (error) {
        console.error("Erreur mise à jour candidature:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour",
            error: error.message
        });
    }
};

// Ajouter des publications vérifiées à la candidature
export const addPublications = async (req, res) => {
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

        const candidature = await perfectionnementModel.findById(id);

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (candidature.userId.toString() !== userId) {
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

        // Ajouter les publications
        candidature.publicationsVerifiees = publications.map(pub => ({
            publicationId: pub._id,
            titre: pub.titre,
            typePublication: pub.typePublication,
            annee: pub.anneePublication,
            points: pub.pointsAttribues
        }));

        // Recalculer les points
        await candidature.calculerPoints();

        res.json({
            success: true,
            message: "Publications ajoutées avec succès",
            candidature
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

// Soumettre la candidature
export const submitCandidature = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const candidature = await perfectionnementModel.findById(id);

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (candidature.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Accès non autorisé"
            });
        }

        if (candidature.statut !== 'brouillon') {
            return res.status(400).json({
                success: false,
                message: "Cette candidature a déjà été soumise"
            });
        }

        // Vérifier que tous les champs requis sont remplis
        const requiredFields = [
            'paysDestination', 'universiteAccueil', 'laboratoireAccueil', 'specialite',
            'dureeSejourMois', 'dateDebutPrevue', 'dateFinPrevue', 'objetMission',
            'justificationScientifique', 'resultatsPrevus', 'apportPourInstitution',
            'budgetEstimatif', 'encadrantEtranger'
        ];

        const missingFields = requiredFields.filter(field => !candidature[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Champs requis manquants",
                missingFields
            });
        }

        // Vérifier les documents requis
        const requiredDocs = [
            'lettreInvitation', 'planTravail', 'cv', 'lettreMotivation',
            'attestationTravail', 'projetRecherche', 'accordChefDepartement'
        ];

        const missingDocs = requiredDocs.filter(doc => !candidature.documents[doc]);

        if (missingDocs.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Documents requis manquants",
                missingDocs
            });
        }

        await candidature.soumettre();

        res.json({
            success: true,
            message: "Candidature soumise avec succès",
            candidature
        });
    } catch (error) {
        console.error("Erreur soumission candidature:", error);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la soumission",
            error: error.message
        });
    }
};

// ADMIN: Examiner la recevabilité
export const examinerRecevabilite = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { estRecevable, motifNonRecevabilite, remarques } = req.body;

        const user = await userModel.findById(userId);
        const candidature = await perfectionnementModel.findById(id);

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        candidature.recevabilite = {
            estRecevable,
            dateExamen: new Date(),
            examinateurId: userId,
            examinateurNom: `${user.firstname} ${user.lastname}`,
            motifNonRecevabilite: estRecevable ? undefined : motifNonRecevabilite,
            remarques
        };

        candidature.statut = estRecevable ? 'recevable' : 'non_recevable';
        candidature.dateRecevabilite = new Date();

        candidature.historique.push({
            action: estRecevable ? 'recevabilite_acceptee' : 'recevabilite_refusee',
            auteurId: userId,
            auteurNom: `${user.firstname} ${user.lastname}`,
            date: new Date(),
            details: estRecevable ? 'Candidature déclarée recevable' : `Non recevable: ${motifNonRecevabilite}`
        });

        candidature.notifications.push({
            type: 'recevabilite',
            message: estRecevable 
                ? 'Votre candidature a été déclarée recevable'
                : `Votre candidature a été déclarée non recevable: ${motifNonRecevabilite}`,
            date: new Date()
        });

        await candidature.save();

        res.json({
            success: true,
            message: estRecevable ? "Candidature déclarée recevable" : "Candidature déclarée non recevable",
            candidature
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

// EVALUATEUR: Ajouter une évaluation
export const addEvaluation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const evaluationData = req.body;

        const user = await userModel.findById(userId);
        const candidature = await perfectionnementModel.findById(id);

        if (!candidature) {
            return res.status(404).json({
                success: false,
                message: "Candidature non trouvée"
            });
        }

        if (candidature.statut !== 'en_cours_evaluation' && candidature.statut !== 'recevable') {
            return res.status(400).json({
                success: false,
                message: "Cette candidature ne peut pas être évaluée actuellement"
            });
        }

        // Calculer la note globale
        const criteres = evaluationData.criteres;
        const noteGlobale = 
            (criteres.pertinenceScientifique?.note || 0) +
            (criteres.qualitePublications?.note || 0) +
            (criteres.impactPublications?.note || 0) +
            (criteres.faisabiliteProjet?.note || 0) +
            (criteres.apportInstitution?.note || 0) +
            (criteres.qualiteDossier?.note || 0) +
            (criteres.coherenceParcours?.note || 0);

        const evaluation = {
            evaluateurId: userId }