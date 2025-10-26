import mongoose from "mongoose";

const publicationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    
    // Type de publication
    typePublication: {
        type: String,
        enum: [
            'article_scopus_wos',
            'article_revue_nationale',
            'conference_internationale',
            'conference_nationale',
            'chapitre_livre',
            'livre',
            'brevet',
            'these',
            'memoire'
        ],
        required: true
    },
    
    // Informations générales
    titre: {
        type: String,
        required: true,
        trim: true
    },
    
    auteurs: [{
        nom: { type: String, required: true },
        prenom: { type: String, required: true },
        ordre: { type: Number, required: true }, // Position dans la liste des auteurs
        estAuteurPrincipal: { type: Boolean, default: false },
        affiliation: String
    }],
    
    // Pour articles de revue
    revue: {
        nom: String,
        issn: String,
        eissn: String,
        indexation: {
            type: String,
            enum: ['scopus', 'wos', 'scopus_wos', 'autre', 'non_indexe']
        },
        facteurImpact: Number,
        quartile: {
            type: String,
            enum: ['Q1', 'Q2', 'Q3', 'Q4', 'N/A']
        },
        pays: String
    },
    
    // Pour conférences
    conference: {
        nom: String,
        acronyme: String,
        lieu: String,
        pays: String,
        dateDebut: Date,
        dateFin: Date,
        typeConference: {
            type: String,
            enum: ['internationale', 'nationale', 'regionale']
        },
        typePresentation: {
            type: String,
            enum: ['orale', 'poster', 'keynote', 'invited']
        },
        comiteScientifique: { type: Boolean, default: false },
        comiteLecture: { type: Boolean, default: false },
        actesPublies: { type: Boolean, default: false },
        isbn: String,
        issn: String
    },
    
    // Pour livre/chapitre
    livre: {
        titreLivre: String,
        editeur: String,
        isbn: String,
        nombrePages: Number,
        edition: String,
        volumeNumero: String,
        // Pour chapitre spécifiquement
        numerosChapitre: String,
        pagesDebut: Number,
        pagesFin: Number
    },
    
    // Informations de publication
    anneePublication: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },
    
    moisPublication: {
        type: Number,
        min: 1,
        max: 12
    },
    
    volume: String,
    numero: String,
    pages: String, // Format: "123-145"
    
    // Liens et identifiants
    doi: String,
    url: String,
    urlScopus: String,
    urlWos: String,
    
    // Documents justificatifs (URLs après upload)
    documents: {
        fichierPublication: { 
            type: String,
            required: true
        }, // PDF de l'article
        pageGarde: String, // Page de garde
        lettreAcceptation: String, // Lettre d'acceptation
        certificatPresentation: String, // Certificat pour conférence
        preuveCitation: String, // Screenshot Scopus/WOS
        attestationIndexation: String // Attestation d'indexation
    },
    
    // Statut de vérification
    statut: {
        type: String,
        enum: [
            'brouillon',
            'soumise',
            'en_attente_verification',
            'en_cours_verification',
            'verifie',
            'rejete',
            'complements_requis'
        ],
        default: 'brouillon'
    },
    
    // Vérification par admin/évaluateur
    verification: {
        verificateurId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        nomVerificateur: String,
        dateVerification: Date,
        commentaires: String,
        motifRejet: String,
        complementsRequis: [String],
        
        // Vérifications détaillées
        verifications: {
            doiValide: { 
                type: Boolean, 
                default: false,
                commentaire: String
            },
            indexationConfirmee: { 
                type: Boolean, 
                default: false,
                commentaire: String
            },
            auteursConfirmes: { 
                type: Boolean, 
                default: false,
                commentaire: String
            },
            documentsComplets: { 
                type: Boolean, 
                default: false,
                commentaire: String
            },
            qualiteScientifique: {
                type: Boolean,
                default: false,
                commentaire: String
            }
        }
    },
    
    // Points attribués selon le barème
    pointsAttribues: {
        type: Number,
        default: 0
    },
    
    // Barème utilisé pour le calcul
    baremeUtilise: {
        type: String,
        enum: ['perfectionnement', 'stage_court', 'autre']
    },
    
    // Métadonnées scientifiques
    langue: {
        type: String,
        enum: ['francais', 'anglais', 'arabe', 'espagnol', 'allemand', 'autre'],
        default: 'francais'
    },
    
    motsClés: [{
        type: String,
        trim: true
    }],
    
    résumé: {
        type: String,
        maxlength: 3000
    },
    
    abstract: {
        type: String,
        maxlength: 3000
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
            'sciences_sociales',
            'sciences_economiques',
            'droit',
            'lettres_langues',
            'sciences_humaines',
            'autre'
        ]
    },
    
    sousDomaineSpecialite: String,
    
    // Citations et impact (pour Scopus/WOS)
    citations: {
        nombreCitations: { type: Number, default: 0 },
        hIndex: Number,
        derniereMiseAJour: Date,
        sourceCitations: {
            type: String,
            enum: ['scopus', 'wos', 'google_scholar', 'autre']
        }
    },
    
    // Informations complémentaires
    projetRecherche: {
        nom: String,
        type: String, // PNR, PRFU, etc.
        financement: String
    },
    
    laboratoireRecherche: String,
    
    // Collaboration internationale
    collaborationInternationale: {
        type: Boolean,
        default: false
    },
    
    paysCoauteurs: [String],
    
    // Open access
    openAccess: {
        type: Boolean,
        default: false
    },
    
    // Utilisation dans candidatures
    utiliseDansCandidatures: [{
        candidatureId: mongoose.Schema.Types.ObjectId,
        typeCandidature: {
            type: String,
            enum: ['perfectionnement', 'stage_court']
        },
        dateUtilisation: Date
    }],
    
    // Date de soumission
    dateSoumission: Date,
    
    // Historique des modifications
    historique: [{
        action: {
            type: String,
            enum: [
                'creation',
                'modification',
                'soumission',
                'verification_debut',
                'verification_fin',
                'validation',
                'rejet',
                'complements_demandes',
                'complements_fournis'
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
        anciennes_valeurs: mongoose.Schema.Types.Mixed,
        nouvelles_valeurs: mongoose.Schema.Types.Mixed
    }],
    
    // Remarques et notes
    remarquesAuteur: String,
    notesInternes: String
    
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index pour améliorer les performances
publicationSchema.index({ userId: 1, statut: 1 });
publicationSchema.index({ typePublication: 1, anneePublication: -1 });
publicationSchema.index({ 'revue.indexation': 1 });
publicationSchema.index({ statut: 1, dateSoumission: -1 });
publicationSchema.index({ 'verification.verificateurId': 1 });
publicationSchema.index({ doi: 1 });

// Virtual pour le nombre total d'auteurs
publicationSchema.virtual('nombreAuteurs').get(function() {
    return this.auteurs.length;
});

// Virtual pour vérifier si l'utilisateur est premier auteur
publicationSchema.virtual('estPremierAuteur').get(function() {
    return this.auteurs.some(a => a.ordre === 1 && a.estAuteurPrincipal);
});

// Méthode pour calculer les points selon le barème
publicationSchema.methods.calculerPoints = function(typeBareme = 'perfectionnement') {
    let points = 0;
    
    if (typeBareme === 'perfectionnement') {
        switch(this.typePublication) {
            case 'article_scopus_wos':
                // Barème selon quartile
                if (this.revue.quartile === 'Q1') points = 15;
                else if (this.revue.quartile === 'Q2') points = 12;
                else if (this.revue.quartile === 'Q3') points = 10;
                else if (this.revue.quartile === 'Q4') points = 8;
                else points = 10; // Par défaut
                break;
                
            case 'article_revue_nationale':
                points = 6;
                break;
                
            case 'conference_internationale':
                if (this.conference.typePresentation === 'keynote') points = 8;
                else if (this.conference.typePresentation === 'orale') points = 5;
                else points = 3; // poster
                break;
                
            case 'conference_nationale':
                points = 2;
                break;
                
            case 'chapitre_livre':
                points = 7;
                break;
                
            case 'livre':
                points = 20;
                break;
                
            case 'brevet':
                points = 15;
                break;
                
            case 'these':
                points = 10;
                break;
                
            case 'memoire':
                points = 5;
                break;
                
            default:
                points = 0;
        }
    } else if (typeBareme === 'stage_court') {
        // Barème réduit pour stage court
        switch(this.typePublication) {
            case 'article_scopus_wos':
                points = 10;
                break;
                
            case 'article_revue_nationale':
                points = 5;
                break;
                
            case 'conference_internationale':
                points = 3;
                break;
                
            case 'chapitre_livre':
                points = 5;
                break;
                
            case 'livre':
                points = 15;
                break;
                
            default:
                points = 0;
        }
    }
    
    this.pointsAttribues = points;
    this.baremeUtilise = typeBareme;
    return points;
};

// Méthode pour soumettre une publication
publicationSchema.methods.soumettre = async function() {
    this.statut = 'soumise';
    this.dateSoumission = new Date();
    
    this.historique.push({
        action: 'soumission',
        auteurId: this.userId,
        date: new Date(),
        details: 'Publication soumise pour vérification'
    });
    
    await this.save();
    return this;
};

// Méthode pour valider la publication
publicationSchema.methods.valider = async function(verificateurId, verificateurNom, commentaires = '', typeBareme = 'perfectionnement') {
    this.statut = 'verifie';
    this.verification.verificateurId = verificateurId;
    this.verification.nomVerificateur = verificateurNom;
    this.verification.dateVerification = new Date();
    this.verification.commentaires = commentaires;
    
    // Marquer toutes les vérifications comme validées
    this.verification.verifications.doiValide = true;
    this.verification.verifications.indexationConfirmee = true;
    this.verification.verifications.auteursConfirmes = true;
    this.verification.verifications.documentsComplets = true;
    this.verification.verifications.qualiteScientifique = true;
    
    // Calculer les points
    this.calculerPoints(typeBareme);
    
    // Ajouter à l'historique
    this.historique.push({
        action: 'validation',
        auteurId: verificateurId,
        auteurNom: verificateurNom,
        date: new Date(),
        details: `Publication validée avec ${this.pointsAttribues} points (barème: ${typeBareme})`
    });
    
    await this.save();
    return this;
};

// Méthode pour rejeter la publication
publicationSchema.methods.rejeter = async function(verificateurId, verificateurNom, motif) {
    this.statut = 'rejete';
    this.verification.verificateurId = verificateurId;
    this.verification.nomVerificateur = verificateurNom;
    this.verification.dateVerification = new Date();
    this.verification.motifRejet = motif;
    this.pointsAttribues = 0;
    
    this.historique.push({
        action: 'rejet',
        auteurId: verificateurId,
        auteurNom: verificateurNom,
        date: new Date(),
        details: `Publication rejetée: ${motif}`
    });
    
    await this.save();
    return this;
};

// Méthode pour demander des compléments
publicationSchema.methods.demanderComplements = async function(verificateurId, verificateurNom, complementsListe) {
    this.statut = 'complements_requis';
    this.verification.verificateurId = verificateurId;
    this.verification.nomVerificateur = verificateurNom;
    this.verification.dateVerification = new Date();
    this.verification.complementsRequis = complementsListe;
    
    this.historique.push({
        action: 'complements_demandes',
        auteurId: verificateurId,
        auteurNom: verificateurNom,
        date: new Date(),
        details: `Compléments demandés: ${complementsListe.join(', ')}`
    });
    
    await this.save();
    return this;
};

// Middleware pre-save pour validation
publicationSchema.pre('save', function(next) {
    // Vérifier que la date de publication n'est pas dans le futur
    const currentYear = new Date().getFullYear();
    if (this.anneePublication > currentYear + 1) {
        next(new Error('L\'année de publication ne peut pas être dans le futur'));
    }
    
    // Vérifier qu'il y a au moins un auteur
    if (this.auteurs.length === 0) {
        next(new Error('Au moins un auteur est requis'));
    }
    
    // Calculer le budget total si c'est une nouvelle publication
    if (this.isNew) {
        this.historique.push({
            action: 'creation',
            auteurId: this.userId,
            date: new Date(),
            details: 'Publication créée'
        });
    }
    
    next();
});

const publicationModel = mongoose.models.publication || mongoose.model('publication', publicationSchema);

export default publicationModel;