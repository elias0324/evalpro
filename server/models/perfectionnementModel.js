import mongoose from "mongoose";

const perfectionnementSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
    // Informations de base (auto-remplies depuis le profil user)
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: true },
    academicGrade: { type: String, required: true },
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
    
    // Informations sur le perfectionnement
    paysDestination: { 
        type: String, 
        required: true 
    },
    
    universiteAccueil: { 
        type: String, 
        required: true 
    },
    
    adresseUniversite: String,
    
    laboratoireAccueil: {
        type: String,
        required: true
    },
    
    specialite: { 
        type: String, 
        required: true 
    },
    
    dureeSejourMois: { 
        type: Number, 
        required: true,
        min: 1,
        max: 12
    },
    
    dateDebutPrevue: { 
        type: Date, 
        required: true 
    },
    
    dateFinPrevue: { 
        type: Date, 
        required: true 
    },
    
    // Objectifs et justification
    objetMission: { 
        type: String, 
        required: true,
        maxlength: 2000
    },
    
    justificationScientifique: { 
        type: String, 
        required: true,
        maxlength: 2000
    },
    
    resultatsPrevus: { 
        type: String, 
        required: true,
        maxlength: 1500
    },
    
    apportPourInstitution: {
        type: String,
        required: true,
        maxlength: 1500
    },
    
    planTravailDetaille: {
        type: String,
        maxlength: 3000
    },
    
    // Budget détaillé
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
    
    // Encadrant/Responsable à l'étranger
    encadrantEtranger: {
        civilite: {
            type: String,
            enum: ['Mr', 'Mme', 'Dr', 'Pr']
        },
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        email: { type: String, required: true },
        telephone: String,
        grade: String,
        specialite: String,
        laboratoire: String,
        universite: String
    },
    
    // Documents requis (URLs après upload)
    documents: {
        lettreInvitation: { 
            type: String, 
            required: true 
        },
        planTravail: { 
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
        projetRecherche: { 
            type: String, 
            required: true 
        },
        lettreRecommandation: String,
        accordChefDepartement: {
            type: String,
            required: true
        },
        accordRecteur: String,
        relevesNotes: String,
        diplomesUniversitaires: String
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
    
    // Calcul des points selon le barème du perfectionnement
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
            points: { type: Number, default: 0 }, // 6 points par article
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
            points: { type: Number, default: 0 }, // 5 points par communication
            details: [{
                titre: String,
                conference: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Communications nationales
        communicationsNationales: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 2 points par communication
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
            points: { type: Number, default: 0 }, // 7 points par chapitre
            details: [{
                titre: String,
                livre: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Ouvrages scientifiques
        ouvrages: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 20 points par ouvrage
            details: [{
                titre: String,
                editeur: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Brevets
        brevets: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 15 points par brevet
            details: [{
                titre: String,
                numero: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Encadrement doctoral (soutenus uniquement)
        encadrementDoctoral: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 15 points par thèse
            details: [{
                etudiant: String,
                sujet: String,
                anneeSoutenance: Number,
                points: Number
            }]
        },
        
        // Encadrement master (soutenus uniquement)
        encadrementMaster: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 5 points par master
            details: [{
                etudiant: String,
                sujet: String,
                anneeSoutenance: Number,
                points: Number
            }]
        },
        
        // Projets de recherche (chef de projet uniquement)
        projetsRecherche: {
            nombre: { type: Number, default: 0 },
            points: { type: Number, default: 0 }, // 10 points par projet
            details: [{
                intitule: String,
                type: String,
                annee: Number,
                points: Number
            }]
        },
        
        // Total
        pointsTotal: { type: Number, default: 0 },
        
        // Date du dernier calcul
        dernierCalcul: Date
    },
    
    // Activités de recherche
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
        organisme: String,
        statut: {
            type: String,
            enum: ['en_cours', 'termine', 'suspendu'],
            default: 'en_cours'
        },
        description: String
    }],
    
    // Encadrements (uniquement soutenus pour le perfectionnement)
    encadrements: [{
        type: {
            type: String,
            enum: ['doctorat', 'master'],
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
            enum: ['soutenu'], // Seulement soutenus pour perfectionnement
            required: true,
            default: 'soutenu'
        },
        anneeInscription: { type: Number, required: true },
        anneeSoutenance: { type: Number, required: true },
        etablissement: String,
        mentionObtenue: String
    }],
    
    // Activités pédagogiques
    activitesPedagogiques: [{
        anneeUniversitaire: { type: String, required: true },
        type: {
            type: String,
            enum: ['cours_magistral', 'travaux_diriges', 'travaux_pratiques', 'encadrement_stage', 'encadrement_memoire'],
            required: true
        },
        intitule: { type: String, required: true },
        niveau: {
            type: String,
            enum: ['licence', 'master', 'doctorat', 'ingenieur'],
            required: true
        },
        semestre: {
            type: String,
            enum: ['S1', 'S2', 'annuel']
        },
        volumeHoraire: { type: Number, required: true },
        nombreEtudiants: Number
    }],
    
    // Responsabilités scientifiques et pédagogiques
    responsabilites: [{
        type: {
            type: String,
            enum: [
                'chef_departement',
                'directeur_laboratoire',
                'responsable_equipe',
                'responsable_formation',
                'responsable_master',
                'membre_conseil_scientifique',
                'autre'
            ]
        },
        intitule: String,
        etablissement: String,
        dateDebut: Date,
        dateFin: Date,
        enCours: Boolean
    }],
    
    // Participations à des manifestations scientifiques
    manifestationsScientifiques: [{
        type: {
            type: String,
            enum: ['conference', 'seminaire', 'atelier', 'colloque', 'jury_these', 'comite_scientifique']
        },
        intitule: String,
        lieu: String,
        date: Date,
        role: String // Organisateur, membre comité, participant, etc.
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
            'convoque_audition',
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
    dateAudition: Date,
    dateDecisionFinale: Date,
    
    // Évaluations de la commission scientifique
    evaluations: [{
        evaluateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        nomEvaluateur: String,
        qualiteEvaluateur: String, // Professeur, MCF, etc.
        dateEvaluation: { type: Date, default: Date.now },
        
        // Critères d'évaluation détaillés
        criteres: {
            pertinenceScientifique: { 
                note: { type: Number, min: 0, max: 20 },
                commentaire: String
            },
            qualitePublications: { 
                note: { type: Number, min: 0, max: 20 },
                commentaire: String
            },
            impactPublications: {
                note: { type: Number, min: 0, max: 10 },
                commentaire: String
            },
            faisabiliteProjet: { 
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            },
            apportInstitution: { 
                note: { type: Number, min: 0, max: 15 },
                commentaire: String
            },
            qualiteDossier: { 
                note: { type: Number, min: 0, max: 10 },
                commentaire: String
            },
            coherenceParcours: {
                note: { type: Number, min: 0, max: 10 },
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
        recommandations: String,
        questionsAudition: [String]
    }],
    
    // Note moyenne des évaluations
    noteMoyenne: Number,
    
    // Audition
    audition: {
        dateHeure: Date,
        lieu: String,
        dureeMinutes: Number,
        presenceCandidat: Boolean,
        membreJury: [{
            nom: String,
            qualite: String
        }],
        notesAudition: String,
        appreciationJury: String
    },
    
    // Décision finale de la commission
    decisionFinale: {
        decision: {
            type: String,
            enum: ['accepte', 'refuse', 'ajourne', 'liste_attente']
        },
        rang: Number, // Classement si accepté
        motif: String,
        recommandations: String,
        dateDecision: Date,
        dateDeliberation: Date,
        pvCommission: String, // URL du PV
        
        // Décideur (Président commission)
        decideurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        decideurNom: String,
        decideurQualite: String,
        
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
    
    // Suivi post-acceptation
    suiviMission: {
        // Avant départ
        dateDepart: Date,
        dateRetour: Date,
        billetReserve: Boolean,
        visaObtenu: Boolean,
        assuranceValidee: Boolean,
        
        // Pendant le séjour
        rapportsIntermediaires: [{
            date: Date,
            fichier: String, // URL
            commentaires: String
        }],
        
        // Après retour
        rapportFinal: String, // URL du fichier
        dateDepotRapportFinal: Date,
        attestationPresence: String, // URL du fichier
        certificatStage: String,
        
        // Justificatifs financiers
        justificatifsFinanciers: [{
            type: String, // Billet, hébergement, etc.
            montant: Number,
            fichier: String // URL
        }],
        totalDepense: Number,
        
        missionsEffectuee: Boolean,
        evaluationMission: {
            satisfactionGlobale: { type: Number, min: 1, max: 5 },
            objectifsAtteints: Boolean,
            difficultes: String,
            recommandations: String,
            publicationsResultantes: [String],
            collaborationsEtablies: [String]
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
                'convocation_audition',
                'audition_realisee',
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
perfectionnementSchema.index({ userId: 1, statut: 1 });
perfectionnementSchema.index({ numeroCandidature: 1 });
perfectionnementSchema.index({ statut: 1, dateSoumission: -1 });
perfectionnementSchema.index({ academicGrade: 1, statut: 1 });
perfectionnementSchema.index({ anneeCandidature: 1, statut: 1 });
perfectionnementSchema.index({ 'decisionFinale.decision': 1 });

// Virtual pour calculer la durée totale
perfectionnementSchema.virtual('dureeJours').get(function() {
    if (this.dateDebutPrevue && this.dateFinPrevue) {
        const diff = this.dateFinPrevue - this.dateDebutPrevue;
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    }
    return 0;
});

// Générer numéro de candidature
perfectionnementSchema.pre('save', async function(next) {
    if (this.isNew && !this.numeroCandidature) {
        const year = new Date().getFullYear();
        const count = await mongoose.model('perfectionnement').countDocuments({
            anneeCandidature: year
        });
        this.numeroCandidature = `PERF-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    next();
});

// Méthode pour calculer automatiquement les points
perfectionnementSchema.methods.calculerPoints = async function() {
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
        communicationsNationales: { nombre: 0, points: 0, details: [] },
        chapitresLivre: { nombre: 0, points: 0, details: [] },
        ouvrages: { nombre: 0, points: 0, details: [] },
        brevets: { nombre: 0, points: 0, details: [] },
        encadrementDoctoral: { nombre: 0, points: 0, details: [] },
        encadrementMaster: { nombre: 0, points: 0, details: [] },
        projetsRecherche: { nombre: 0, points: 0, details: [] },
        pointsTotal: 0,
        dernierCalcul: new Date()
    };
    
    // Calculer points publications
    publications.forEach(pub => {
        const detail = {
            titre: pub.titre,
            annee: pub.anneePublication,
            points: 0
        };
        
        switch(pub.typePublication) {
            case 'article_scopus_wos':
                detail.revue = pub.revue?.nom;
                detail.points = 10;
                points.articlesRevuesIndexees.nombre++;
                points.articlesRevuesIndexees.points += 10;
                points.articlesRevuesIndexees.details.push(detail);
                break;
            case 'article_revue_nationale':
                detail.revue = pub.revue?.nom;
                detail.points = 6;
                points.articlesRevuesNationales.nombre++;
                points.articlesRevuesNationales.points += 6;
                points.articlesRevuesNationales.details.push(detail);
                break;
            case 'conference_internationale':
                detail.conference = pub.conference?.nom;
                detail.points = 5;
                points.communicationsInternationales.nombre++;
                points.communicationsInternationales.points += 5;
                points.communicationsInternationales.details.push(detail);
                break;
            case 'conference_nationale':
                detail.conference = pub.conference?.nom;
                detail.points = 2;
                points.communicationsNationales.nombre++;
                points.communicationsNationales.points += 2;
                points.communicationsNationales.details.push(detail);
                break;
            case 'chapitre_livre':
                detail.livre = pub.livre?.titreLivre;
                detail.points = 7;
                points.chapitresLivre.nombre++;
                points.chapitresLivre.points += 7;
                points.chapitresLivre.details.push(detail);
                break;
            case 'livre':
                detail.editeur = pub.livre?.editeur;
                detail.points = 20;
                points.ouvrages.nombre++;
                points.ouvrages.points += 20;
                points.ouvrages.details.push(detail);
                break;
            case 'brevet':
                detail.points = 15;
                points.brevets.nombre++;
                points.brevets.points += 15;
                points.brevets.details.push(detail);
                break;
        }
    });
    
    // Calculer points encadrements (uniquement soutenus)
    this.encadrements.forEach(enc => {
        if (enc.statut === 'soutenu') {
            const detail = {
                etudiant: `${enc.prenomEtudiant} ${enc.nomEtudiant}`,
                sujet: enc.sujet,
                anneeSoutenance: enc.anneeSoutenance,
                points: 0
            };
            
            if (enc.type === 'doctorat') {
                detail.points = 15;
                points.encadrementDoctoral.nombre++;
                points.encadrementDoctoral.points += 15;
                points.encadrementDoctoral.details.push(detail);
            } else if (enc.type === 'master') {
                detail.points = 5;
                points.encadrementMaster.nombre++;
                points.encadrementMaster.points += 5;
                points.encadrementMaster.details.push(detail);
            }
        }
    });
    
    // Calculer points projets (chef de projet uniquement)
    const projetsChef = this.projetsRecherche.filter(p => p.role === 'chef_projet');
    projetsChef.forEach(projet => {
        const detail = {
            intitule: projet.intitule,
            type: projet.typeProjet,
            annee: projet.anneeDebut,
            points: 10
        };
        points.projetsRecherche.details.push(detail);
    });
    points.projetsRecherche.nombre = projetsChef.length;
    points.projetsRecherche.points = projetsChef.length * 10;
    
    // Total
    points.pointsTotal = 
        points.articlesRevuesIndexees.points +
        points.articlesRevuesNationales.points +
        points.communicationsInternationales.points +
        points.communicationsNationales.points +
        points.chapitresLivre.points +
        points.ouvrages.points +
        points.brevets.points +
        points.encadrementDoctoral.points +
        points.encadrementMaster.points +
        points.projetsRecherche.points;
    
    this.pointsCalcules = points;
    await this.save();
    
    return points;
};

// Méthode pour soumettre la candidature
perfectionnementSchema.methods.soumettre = async function() {
    this.statut = 'soumise';
    this.dateSoumission = new Date();
    
    // Calculer les points avant soumission
    await this.calculerPoints();
    
    this.historique.push({
        action: 'soumission',
        auteurId: this.userId,
        auteurNom: `${this.firstname} ${this.lastname}`,
        date: new Date(),
        details: `Candidature soumise avec ${this.pointsCalcules.pointsTotal} points`
    });
    
    this.notifications.push({
        type: 'soumission',
        message: 'Votre candidature a été soumise avec succès',
        date: new Date()
    });
    
    await this.save();
    return this;
};

const perfectionnementModel = mongoose.models.perfectionnement || mongoose.model('perfectionnement', perfectionnementSchema);

export default perfectionnementModel;