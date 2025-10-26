import mongoose from "mongoose";

const stageCourtSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
    // Informations de base (auto-remplies depuis le profil user)
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    academicGrade: { 
        type: String, 
        required: true,
        // Exclusion des doctorants
        enum: [
            'PROFESSEUR',
            'MAITRE_DE_CONFERENCES_CLASSE_A',
            'MAITRE_DE_CONFERENCES_CLASSE_B',
            'MAITRE_ASSISTANT_CLASSE_A',
            'MAITRE_ASSISTANT_CLASSE_B',
            'PERSONNEL_ADMINISTRATIF'
        ]
    },
    institution: { type: String, required: true },
    
    // Numéro de candidature (généré automatiquement)
    numeroCandidature: {
        type: String,
        unique: true
    },
    
    // Année de la candidature
    anneeCandidature: {
        type: Number,
        default: () => new Date().getFullYear()
    },
    
    // Informations sur le stage
    paysDestination: { 
        type: String, 
        required: true 
    },
    
    villeDestination: {
        type: String,
        required: true
    },
    
    organismeAccueil: { 
        type: String, 
        required: true 
    },
    
    adresseOrganisme: String,
    siteWebOrganisme: String,
    
    typeOrganisme: {
        type: String,
        enum: ['universite', 'centre_recherche', 'entreprise', 'institut_formation', 'laboratoire', 'autre'],
        required: true
    },
    
    typeStage: { 
        type: String,
        enum: [
            'formation_specialisee',
            'conference_internationale',
            'seminaire_scientifique',
            'atelier_formation',
            'ecole_thematique',
            'ecole_doctorale',
            'visite_scientifique',
            'workshop',
            'summer_school',
            'collaboration_recherche'
        ],
        required: true
    },
    
    intituleStage: {
        type: String,
        required: true,
        trim: true
    },
    
    thematique: {
        type: String,
        required: true
    },
    
    domaine: {
        type: String,
        enum: [
            'informatique',
            'mathematiques',
            'physique',
            'chimie',
            'biologie',
            'medecine',
            'pharmacie',
            'sciences_ingenieur',
            'sciences_agronomiques',
            'sciences_economiques',
            'sciences_sociales',
            'lettres_langues',
            'autre'
        ]
    },
    
    // Durée (MAXIMUM 15 jours selon le document)
    dureeJours: { 
        type: Number, 
        required: true,
        min: 1,
        max: 15,
        validate: {
            validator: Number.isInteger,
            message: 'La durée doit être un nombre entier de jours'
        }
    },
    
    dateDebut: { 
        type: Date, 
        required: true 
    },
    
    dateFin: { 
        type: Date, 
        required: true 
    },
    
    // Objectifs et description
    objectifs: { 
        type: String, 
        required: true,
        maxlength: 1500
    },
    
    descriptionStage: {
        type: String,
        required: true,
        maxlength: 2000
    },
    
    apportScientifique: { 
        type: String, 
        required: true,
        maxlength: 1500
    },
    
    applicationsPrevues: {
        type: String,
        required: true,
        maxlength: 1500
    },
    
    competencesAcquerir: [String],
    
    retombeesPedagogiques: {
        type: String,
        maxlength: 1000
    },
    
    // Responsable du stage à l'étranger
    responsableStage: {
        civilite: {
            type: String,
            enum: ['Mr', 'Mme', 'Dr', 'Pr']
        },
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        email: { type: String, required: true },
        telephone: String,
        fonction: String,
        qualite: String,
        organisme: String
    },
    
    // Programme détaillé du stage
    programmeCours: {
        type: String // URL du fichier programme
    },
    
    programmeDetaille: [{
        jour: Number,
        date: Date,
        activites: String,
        duree: String,
        intervenant: String
    }],
    
    // Budget estimatif
    budgetEstimatif: {
        billetAvion: { 
            type: Number, 
            required: true,
            min: 0
        },
        hebergement: { 
            type: Number, 
            required: true,
            min: 0
        },
        subsistance: { 
            type: Number, 
            required: true,
            min: 0
        },
        fraisInscription: { 
            type: Number, 
            default: 0,
            min: 0
        },
        transportLocal: { 
            type: Number, 
            default: 0,
            min: 0
        },
        assurance: {
            type: Number,
            default: 0,
            min: 0
        },
        fraisVisa: {
            type: Number,
            default: 0,
            min: 0
        },
        autres: { 
            type: Number, 
            default: 0,
            min: 0
        },
        total: { 
            type: Number, 
            required: true,
            min: 0
        },
        devise: {
            type: String,
            default: 'EUR'
        }
    },
    
    // Documents requis (URLs après upload)
    documents: {
        lettreAcceptation: { 
            type: String, 
            required: true 
        },
        programmeCours: { 
            type: String, 
            required: true 
        },
        cv: { 
            type: String, 
            required: true 
        },
        lettreMotivation: {
            type: String,
            required: true
        },
        attestationTravail: { 
            type: String, 
            required: true 
        },
        accordChefDepartement: {
            type: String,
            required: true
        },
        devisBillet: String,
        devisHebergement: String,
        attestationInscription: String,
        brochureFormation: String
    },
    
    // Publications scientifiques vérifiées (références)
    publicationsVerifiees: [{
        publicationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'publication',
            required: true
        },
        titre: String,
        typePublication: String,
        annee: Number,
        points: Number
    }],
    
    // Calcul des points selon le barème du stage court (DIFFÉRENT du perfectionnement)
    pointsCalcules: {
        // Articles revues internationales indexées (Scopus/WOS)
        articlesRevuesIndexees: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 10 points par article
            details: [{
                titre: String,
                revue: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Articles revues nationales
        articlesRevuesNationales: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 5 points (MOINS que perfectionnement)
            details: [{
                titre: String,
                revue: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Communications internationales
        communicationsInternationales: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 3 points (MOINS que perfectionnement)
            details: [{
                titre: String,
                conference: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Chapitres de livre
        chapitresLivre: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 5 points
            details: [{
                titre: String,
                livre: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Encadrement doctoral (EN COURS + SOUTENUS pour stage court)
        encadrementDoctoral: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 10 points (MOINS que perfectionnement)
            details: [{
                etudiant: String,
                sujet: String,
                statut: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Encadrement master (EN COURS + SOUTENUS pour stage court)
        encadrementMaster: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 3 points
            details: [{
                etudiant: String,
                sujet: String,
                statut: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Projets de recherche (chef + membre pour stage court)
        projetsRecherche: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 5 points par projet
            details: [{
                intitule: String,
                type: String,
                role: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Expérience pédagogique (SPÉCIFIQUE au stage court)
        experiencePedagogique: {
            annees: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 1 point par année
            details: String
        },
        
        // Total
        pointsTotal: { type: Number, default: 0 },
        
        // Date du dernier calcul
        dernierCalcul: Date
    },
    
    // Activités de recherche (chef ET membre comptent pour stage court)
    projetsRecherche: [{
        intitule: { type: String, required: true },
        typeProjet: {
            type: String,
            enum: ['PNR', 'PRFU', 'PRIMA', 'Erasmus+', 'CNEPRU', 'ATRST', 'autre'],
            required: true
        },
        codeProjet: String,
        role: {
            type: String,
            enum: ['chef_projet', 'membre_equipe'],
            required: true
        },
        anneeDebut: { type: Number, required: true },
        anneeFin: Number,
        budget: Number,
        statut: {
            type: String,
            enum: ['en_cours', 'termine', 'suspendu'],
            default: 'en_cours'
        },
        description: String
    }],
    
    // Encadrements (EN COURS + SOUTENUS pour stage court)
    encadrements: [{
        type: {
            type: String,
            enum: ['doctorat', 'master', 'licence'],
            required: true
        },
        nomEtudiant: { type: String, required: true },
        prenomEtudiant: { type: String, required: true },
        sujet: { type: String, required: true },
        pourcentageEncadrement: { 
            type: Number, 
            required: true,
            min: 0,
            max: 100
        },
        coEncadrant: String,
        statut: {
            type: String,
            enum: ['en_cours', 'soutenu'], // EN COURS aussi pour stage court
            required: true
        },
        anneeInscription: { type: Number, required: true },
        anneeSoutenance: Number,
        etablissement: String
    }],
    
    // Expérience pédagogique (IMPORTANT pour stage court)
    experiencePedagogique: {
        anneeDebutEnseignement: { 
            type: Number, 
            required: true 
        },
        nombreAnneesExperience: { 
            type: Number, 
            required: true 
        },
        etablissements: [String],
        chargeHoraireAnnuelleMoyenne: Number,
        niveauxEnseignes: [String],
        matieresPrincipales: [String]
    },
    
    // Activités pédagogiques récentes (3 dernières années)
    activitesPedagogiques: [{
        anneeUniversitaire: { type: String, required: true },
        type: {
            type: String,
            enum: ['cours_magistral', 'travaux_diriges', 'travaux_pratiques', 'encadrement_stage', 'encadrement_memoire', 'encadrement_pfe'],
            required: true
        },
        intitule: { type: String, required: true },
        niveau: {
            type: String,
            enum: ['licence', 'master', 'doctorat', 'ingenieur'],
            required: true
        },
        semestre: String,
        volumeHoraire: { type: Number, required: true },
        nombreEtudiants: Number
    }],
    
    // Stages de formation antérieurs
    stagesPrecedents: [{
        annee: Number,
        pays: String,
        organisme: String,
        ville: String,
        dureeJours: Number,
        typeStage: String,
        intitule: String,
        apportProfessionnel: String
    }],
    
    // Langues maîtrisées
    langues: [{
        langue: {
            type: String,
            enum: ['francais', 'anglais', 'arabe', 'espagnol', 'allemand', 'italien', 'autre']
        },
        niveau: {
            type: String,
            enum: ['debutant', 'intermediaire', 'avance', 'courant', 'bilingue']
        },
        certification: String
    }],
    
    // Responsabilités pédagogiques et administratives
    responsabilites: [{
        type: {
            type: String,
            enum: [
                'chef_departement',
                'responsable_formation',
                'responsable_master',
                'responsable_licence',
                'coordinateur_pedagogique',
                'membre_conseil_pedagogique',
                'autre'
            ]
        },
        intitule: String,
        etablissement: String,
        dateDebut: Date,
        dateFin: Date,
        enCours: Boolean
    }],
    
    // Statut de la candidature
    statut: {
        type: String,
        enum: [
            'brouillon',
            'soumise',
            'recevable',
            'non_recevable',
            'en_cours_evaluation',
            'evaluee',
            'acceptee',
            'refusee',
            'liste_attente',
            'annulee',
            'en_attente_complements'
        ],
        default: 'brouillon'
    },
    
    // Recevabilité administrative
    recevabilite: {
        estRecevable: Boolean,
        dateExamen: Date,
        examinateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        examinateurNom: String,
        motifNonRecevabilite: String,
        remarques: String
    },
    
    // Dates importantes
    dateSoumission: Date,
    dateRecevabilite: Date,
    dateCommission: Date,
    dateDecisionFinale: Date,
    
    // Évaluations de la commission
    evaluations: [{
        evaluateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        nomEvaluateur: String,
        qualiteEvaluateur: String,
        dateEvaluation: { type: Date, default: Date.now },
        
        // Critères d'évaluation spécifiques au stage court
        criteres: {
            pertinenceStage: { 
                note: { type: Number, min: 0, max: 20 },
                commentaire: String
            },
            qualiteProduction: { 
                note: { type: Number, min: 0, max: 20 },
                commentaire: String
            },
            experiencePedagogique: {
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            },
            apportFormation: { 
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            },
            faisabilite: { 
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            },
            qualiteDossier: { 
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            }
        },
        
        noteGlobale: { type: Number, min: 0, max: 100 },
        
        avis: {
            type: String,
            enum: ['tres_favorable', 'favorable', 'favorable_reserve', 'reserve', 'defavorable'],
            required: true
        },
        
        commentaireGeneral: String,
        pointsForts: String,
        pointsFaibles: String,
        recommandations: String
    }],
    
    // Note moyenne des évaluations
    noteMoyenne: Number,
    
    // Décision finale de la commission
    decisionFinale: {
        decision: {
            type: String,
            enum: ['accepte', 'refuse', 'ajourne', 'liste_attente']
        },
        rang: Number,
        motif: String,
        recommandations: String,
        dateDecision: Date,
        dateDeliberation: Date,
        pvCommission: String, // URL du PV
        
        decideurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        decideurNom: String,
        
        // Financement accordé
        montantAccorde: Number,
        pourcentageFinancement: Number,
        typeFinancement: {
            type: String,
            enum: ['total', 'partiel']
        },
        organisme: String,
        
        conditionsParticulieres: String,
        obligationsCandidat: [String]
    },
    
    // Suivi post-stage
    suiviStage: {
        // Avant départ
        dateDepart: Date,
        dateRetour: Date,
        billetReserve: Boolean,
        visaObtenu: Boolean,
        assuranceValidee: Boolean,
        
        // Après retour
        rapportStage: String, // URL du fichier
        dateDepotRapport: Date,
        attestationParticipation: String, // URL
        certificatStage: String, // URL
        
        // Documents acquis pendant le stage
        supportsFormation: [String], // URLs
        certificatsObtenus: [String],
        
        // Justificatifs financiers
        justificatifsFinanciers: [{
            type: String,
            montant: Number,
            fichier: String
        }],
        totalDepense: Number,
        
        stageEffectue: Boolean,
        
        // Évaluation du stage
        evaluationStage: {
            satisfactionGlobale: { type: Number, min: 1, max: 5 },
            objectifsAtteints: { type: Boolean },
            pertinenceContenu: { type: Number, min: 1, max: 5 },
            qualiteIntervenants: { type: Number, min: 1, max: 5 },
            organisationLogistique: { type: Number, min: 1, max: 5 },
            difficultes: String,
            suggestionsAmeliorations: String,
            
            // Retombées
            competencesAcquises: [String],
            applicationsPrevues: String,
            collaborationsEtablies: [String],
            publicationsEnvisagees: [String],
            retombeesPedagogiques: String
        }
    },
    
    // Historique complet
    historique: [{
        action: {
            type: String,
            enum: [
                'creation',
                'modification',
                'soumission',
                'recevabilite_acceptee',
                'recevabilite_refusee',
                'evaluation_debut',
                'evaluation_ajoutee',
                'decision_finale',
                'complements_demandes',
                'complements_fournis',
                'annulation'
            ]
        },
        auteurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        auteurNom: String,
        date: { 
            type: Date, 
            default: Date.now 
        },
        details: String,
        documentsModifies: [String]
    }],
    
    // Commentaires et remarques
    commentairesAdmin: String,
    commentairesCommission: String,
    complementsRequis: [{
        demande: String,
        dateRequete: Date,
        dateReponse: Date,
        reponse: String,
        fichier: String
    }],
    
    // Notifications
    notifications: [{
        type: String,
        message: String,
        date: { type: Date, default: Date.now },
        lue: { type: Boolean, default: false }
    }]
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour performances
stageCourtSchema.index({ userId: 1, statut: 1 });
stageCourtSchema.index({ numeroCandidature: 1 });
stageCourtSchema.index({ statut: 1, dateSoumission: -1 });
stageCourtSchema.index({ typeStage: 1 });
stageCourtSchema.index({ academicGrade: 1, statut: 1 });
stageCourtSchema.index({ anneeCandidature: 1, statut: 1 });
stageCourtSchema.index({ 'decisionFinale.decision': 1 });

// Virtual pour vérifier si le stage respecte la limite de 15 jours
stageCourtSchema.virtual('respecteLimiteDuree').get(function() {
    return this.dureeJours <= 15;
});

// Générer numéro de candidature
stageCourtSchema.pre('save', async function(next) {
    if (this.isNew && !this.numeroCandidature) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('stageCourt').countDocuments({
            anneeCandidature: year
        });
        this.numeroCandidature = `STAGE-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    
    // Vérifier que la durée ne dépasse pas 15 jours
    if (this.dureeJours > 15) {
        return next(new Error('La durée du stage ne peut pas dépasser 15 jours'));
    }
    
    // Vérifier que ce n'est pas un doctorant
    if (this.academicGrade === 'DOCTORANT') {
        return next(new Error('Les doctorants ne peuvent pas postuler pour un stage de courte durée'));
    }
    
    next();
});

// Méthode pour calculer automatiquement les points (barème différent du perfectionnement)
stageCourtSchema.methods.calculerPoints = async function() {
    const Publication = mongoose.model('publication');
    
    // Récupérer les publications vérifiées
    const publicationIds = this.publicationsVerifiees.map(p => p.publicationId);
    const publications = await Publication.find({ 
        _id: { $in: publicationIds },
        statut: 'verifie'
    });
    
    // Réinitialiser les compteurs
    let points = {
        articlesRevuesIndexees: { nombre: 0, points: 0, details: [] },
        articlesRevuesNationales: { nombre: 0, points: 0, details: [] },
        communicationsInternationales: { nombre: 0, points: 0, details: [] },
        chapitresLivre: { nombre: 0, points: 0, details: [] },
        encadrementDoctoral: { nombre: 0, points: 0, details: [] },
        encadrementMaster: { nombre: 0, points: 0, details: [] },
        projetsRecherche: { nombre: 0, points: 0, details: [] },
        experiencePedagogique: { annees: 0, points: 0, details: '' },
        pointsTotal: 0,
        dernierCalcul: new Date()
    };
    
    // Calculer points publications (barème RÉDUIT pour stage court)
    publications.forEach(pub => {
        const detail = {
            titre: pub.titre,
            annee: pub.anneePublication,
            points: 0
        };
        
        switch(pub.typePublication) {
            case 'article_scopus_wos':
                detail.revue = pub.revue?.nom;
                detail.points = 10; // 10 points (même que perfectionnement)
                points.articlesRevuesIndexees.nombre++;
                points.articlesRevuesIndexees.points += 10;
                points.articlesRevuesIndexees.details.push(detail);
                break;
            case 'article_revue_nationale':
                detail.revue = pub.revue?.nom;
                detail.points = 5; // 5 points (MOINS que perfectionnement: 6)
                points.articlesRevuesNationales.nombre++;
                points.articlesRevuesNationales.points += 5;
                points.articlesRevuesNationales.details.push(detail);
                break;
            case 'conference_internationale':
                detail.conference = pub.conference?.nom;
                detail.points = 3; // 3 points (MOINS que perfectionnement: 5)
                points.communicationsInternationales.nombre++;
                points.communicationsInternationales.points += 3;
                points.communicationsInternationales.details.push(detail);
                break;
            case 'chapitre_livre':
                detail.livre = pub.livre?.titreLivre;
                detail.points = 5; // 5 points (MOINS que perfectionnement: 7)
                points.chapitresLivre.nombre++;
                points.chapitresLivre.points += 5;
                points.chapitresLivre.details.push(detail);
                break;
        }
    });
    
    // Calculer points encadrements (EN COURS + SOUTENUS pour stage court)
    this.encadrements.forEach(enc => {
        const detail = {
            etudiant: `${enc.prenomEtudiant} ${enc.nomEtudiant}`,
            sujet: enc.sujet,
            statut: enc.statut,
            annee: enc.statut === 'soutenu' ? enc.anneeSoutenance : enc.anneeInscription,
            points: 0
        };
        
        if (enc.type === 'doctorat') {
            detail.points = 10; // 10 points (MOINS que perfectionnement: 15)
            points.encadrementDoctoral.nombre++;
            points.encadrementDoctoral.points += 10;
            points.encadrementDoctoral.details.push(detail);
        } else if (enc.type === 'master') {
            detail.points = 3; // 3 points (MOINS que perfectionnement: 5)
            points.encadrementMaster.nombre++;
            points.encadrementMaster.points += 3;
            points.encadrementMaster.details.push(detail);
        }
    });
    
    // Calculer points projets (TOUS les projets pour stage court, pas seulement chef)
    this.projetsRecherche.forEach(projet => {
        const detail = {
            intitule: projet.intitule,
            type: projet.typeProjet,
            role: projet.role,
            annee: projet.anneeDebut,
            points: 5 // 5 points par projet (MOINS que perfectionnement: 10)
        };
        points.projetsRecherche.details.push(detail);
    });
    points.projetsRecherche.nombre = this.projetsRecherche.length;
    points.projetsRecherche.points = this.projetsRecherche.length * 5;
    
    // Calculer points expérience pédagogique (SPÉCIFIQUE au stage court)
    if (this.experiencePedagogique && this.experiencePedagogique.nombreAnneesExperience) {
        points.experiencePedagogique.annees = this.experiencePedagogique.nombreAnneesExperience;
        points.experiencePedagogique.points = this.experiencePedagogique.nombreAnneesExperience * 1; // 1 point/année
        points.experiencePedagogique.details = `${this.experiencePedagogique.nombreAnneesExperience} années d'expérience pédagogique`;
    }
    
    // Total
    points.pointsTotal = 
        points.articlesRevuesIndexees.points +
        points.articlesRevuesNationales.points +
        points.communicationsInternationales.points +
        points.chapitresLivre.points +
        points.encadrementDoctoral.points +
        points.encadrementMaster.points +
        points.projetsRecherche.points +
        points.experiencePedagogique.points;
    
    this.point