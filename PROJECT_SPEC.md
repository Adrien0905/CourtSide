# COURTSIDE — Cahier des charges
## Personal NBA Scouting Database — Draft 2027

**Version :** 1.0  
**Type :** Application web locale, personnelle  
**Utilisateur :** Un seul scout  
**Priorité :** NBA Draft 2027, avec possibilité de suivre les classes futures.

---

# 1. OBJECTIF DU PROJET

Créer une application de scouting basketball personnelle permettant de centraliser :

- Les profils de tous les prospects susceptibles d'intégrer la NBA.
- Les statistiques individuelles et collectives.
- Les observations réalisées pendant les matchs.
- Les rapports de scouting individuels.
- Les vidéos et les séquences intéressantes.
- Mon classement personnel des prospects.
- L'historique des évaluations et des performances.

L'application doit se rapprocher du fonctionnement d'une véritable base de données de scouting utilisée par une franchise NBA.

Il ne s'agit PAS de créer un simple site présentant les meilleurs prospects ou les mock drafts des médias.

Je veux un véritable outil de travail, dans lequel je peux passer plusieurs heures à étudier, évaluer et comparer des joueurs.

## Référence visuelle obligatoire

Vidéo de référence :
https://www.youtube.com/watch?v=Pi7cJINTN1A&t=211s

Utiliser cette vidéo comme référence principale pour comprendre l'organisation des informations, la navigation, la densité des données et les fonctionnalités d'un logiciel professionnel de scouting.

Si le navigateur permet d'accéder à la vidéo, examiner particulièrement les images à partir de 3 min 31.

Ne pas chercher à reproduire exactement le logiciel présenté. S'en inspirer pour créer une interface moderne, ergonomique et adaptée à un utilisateur individuel.

Si la vidéo est inaccessible, ne pas inventer son contenu. Demander des captures d'écran avant de prétendre en reproduire des détails spécifiques.

---

# 2. ENVIRONNEMENT ET CONTRAINTES

L'application doit respecter les contraintes suivantes :

- Utilisation principalement sur ordinateur Windows.
- Interface accessible depuis un navigateur, en local sur mon ordinateur.
- Application initialement conçue pour un seul utilisateur.
- Aucun abonnement payant obligatoire.
- Aucun abonnement ChatGPT ou OpenAI nécessaire.
- Les notes doivent être conservées localement.
- Fonctionnement des modules de notes même sans connexion Internet.
- Les fonctionnalités de récupération des statistiques nécessitent Internet.
- Possibilité de sauvegarder et exporter toutes mes données.

Je privilégie une solution simple à maintenir et peu coûteuse.

Ne pas ajouter de fonctionnalités d'intelligence artificielle nécessitant des API payantes dans la première version.

---

# 3. DESIGN ET INTERFACE

## Direction artistique

Créer une interface professionnelle inspirée des logiciels d'analyse sportive et de scouting NBA.

Caractéristiques :

- Design desktop-first.
- Menu latéral permanent et personnalisable.
- Interface sombre, sobre et élégante.
- Tables de données compactes mais lisibles.
- Typographie claire.
- Navigation rapide entre les joueurs.
- Affichage de nombreuses informations sans surcharger les pages.
- Utilisation cohérente de couleurs pour les évaluations et les statuts.

Éviter les interfaces trop arrondies, les énormes cartes inutiles et les animations décoratives.

Je préfère une interface dense, fonctionnelle et professionnelle.

## Navigation principale

Créer les rubriques suivantes :

1. Dashboard
2. Player Database
3. Scouting Reports
4. Game Log
5. Video Library
6. My Draft Board
7. Player Comparison
8. Settings & Data Management

Une recherche globale doit être disponible depuis toutes les pages.

---

# 4. DASHBOARD

Créer un tableau de bord personnel.

Il doit permettre de retrouver rapidement :

- Les derniers joueurs consultés.
- Les derniers joueurs évalués.
- Les derniers rapports modifiés.
- Les matchs récemment analysés.
- Les joueurs placés dans ma Watchlist.
- Les prospects dont l'évaluation est incomplète.
- Les joueurs suivis sans rapport de scouting.
- Les prochains matchs intéressants à regarder, si les données sont disponibles.

Afficher quelques indicateurs :

- Nombre total de prospects enregistrés.
- Nombre de rapports réalisés.
- Nombre de matchs analysés.
- Nombre de joueurs dans mon Draft Board.
- Nombre de joueurs encore à évaluer.

Prévoir des raccourcis pour ajouter un joueur, un rapport ou une observation.

---

# 5. PLAYER DATABASE

C'est le cœur du logiciel.

Créer une base de données regroupant tous les prospects, sans restriction géographique ou de compétition.

## Catégories de joueurs

- NCAA Division I.
- NCAA Division II et III.
- High School.
- G-League.
- NBA G League Ignite (historique).
- Joueurs internationaux.
- Joueurs évoluant dans les championnats professionnels étrangers.
- Autres parcours atypiques.

Chaque joueur doit pouvoir être ajouté manuellement, même si aucune statistique automatique n'est disponible.

## Informations individuelles

Chaque profil doit pouvoir contenir :

- Prénom et nom.
- Photo ou avatar.
- Date de naissance.
- Âge calculé à la date de la Draft.
- Nationalité.
- Pays de naissance.
- Taille.
- Poids.
- Envergure.
- Standing Reach.
- Poste principal.
- Poste secondaire.
- Université ou club actuel.
- Compétition actuelle.
- Anciennes équipes.
- Année universitaire ou professionnelle.
- Classe de draft visée.
- Statut d'éligibilité à la Draft.
- Liens vers les sources d'information.

Les informations inconnues doivent rester vides. Ne jamais inventer une mesure ou une information.

## Organisation des prospects

Ajouter des statuts personnalisables :

- Watchlist.
- À observer.
- En cours d'évaluation.
- Évalué.
- Draft Board.
- Non retenu.

Ajouter également un système de tags personnalisés.

Exemples :

- Elite Shooter
- Rim Protector
- Playmaker
- Athletic Freak
- High Upside
- Defensive Specialist
- High Risk

## Recherche et filtres

La base doit proposer des filtres combinables :

- Nom.
- Nationalité.
- Compétition.
- Université / Club.
- Poste.
- Taille.
- Âge.
- Année de Draft.
- Statut.
- Tags.
- Classement personnel.
- Statistiques.

Possibilité de trier toutes les colonnes par ordre croissant ou décroissant.

La table doit pouvoir être personnalisée : choix des colonnes affichées, ordre des colonnes et densité d'affichage.

---

# 6. FICHE INDIVIDUELLE DU JOUEUR

Chaque joueur doit disposer d'une fiche complète.

C'est la page que je consulterai le plus souvent.

Organiser la fiche en plusieurs onglets :

### Overview

Résumé du joueur :

- Informations physiques.
- Équipe et compétition.
- Statistiques principales.
- Classement personnel.
- Statut de suivi.
- Dernier rapport de scouting.
- Notes récentes.
- Vidéos associées.

### Statistics

Afficher les statistiques de saison, les performances par match et les éventuelles statistiques avancées.

### Scouting

Accès à mes évaluations structurées et à mes notes libres.

### Game Log

Historique des matchs observés, avec statistiques et commentaires personnels.

### Video

Liste des vidéos et séquences associées au joueur.

### History

Historique des classements personnels, changements de notes et rapports précédents.

Il doit être possible d'ajouter un rapport ou une observation directement depuis cette fiche.

---

# 7. STATISTIQUES ET DONNÉES

Les statistiques doivent être faciles à consulter et clairement organisées.

## Statistiques classiques

- GP
- MPG
- PPG
- RPG
- ORPG
- DRPG
- APG
- SPG
- BPG
- TOV
- FG%
- 3P%
- FT%
- FGM / FGA
- 3PM / 3PA
- FTM / FTA

## Statistiques avancées

Lorsque les sources les fournissent :

- TS%
- eFG%
- Usage Rate
- AST%
- TOV%
- ORB%
- DRB%
- TRB%
- STL%
- BLK%
- Offensive Rating
- Defensive Rating
- BPM
- BPR
- OBPR
- DBPR

Prévoir également :

- Statistiques par match.
- Totaux de saison.
- Statistiques par 40 minutes.
- Statistiques par 100 possessions lorsque les données le permettent.
- Percentiles nationaux.
- Comparaison avec les joueurs évoluant au même poste.

Les métriques non disponibles ne doivent jamais être remplacées arbitrairement par zéro.

Chaque statistique doit indiquer sa saison, sa compétition et sa source.

Lorsqu'une statistique est calculée par l'application, afficher sa formule et la provenance des données utilisées.

Ne pas mélanger les statistiques de compétitions différentes sans signaler la différence.

## Sources de données prioritaires

### Source 1 : CBB Stats

https://stats-cbb.com/developers

API gratuite sans clé.

À utiliser en priorité pour :

- Statistiques NCAA Division I masculine.
- Classement des joueurs selon plusieurs métriques.
- Percentiles nationaux.
- Recherche de joueurs.
- Comparaison individuelle.
- Statistiques avancées.

Vérifier la documentation OpenAPI avant de développer l'intégration.

### Source 2 : College Basketball Data

https://api.collegebasketballdata.com/getting-started

API nécessitant une clé personnelle.

À utiliser pour compléter les données :

- Joueurs.
- Équipes.
- Matchs.
- Box scores.
- Statistiques de saison.
- Recruiting.
- Historique des Drafts.
- Données de classement.

Vérifier les limites du compte gratuit et les champs effectivement accessibles.

### Autres compétitions

Pour les joueurs internationaux, G-League, High School et divisions NCAA non couvertes :

- Prévoir une saisie manuelle.
- Autoriser l'import de fichiers CSV.
- Permettre d'ajouter des liens vers des sources statistiques externes.
- Prévoir une architecture permettant d'ajouter de nouvelles API ultérieurement.

Ne jamais présenter une couverture statistique mondiale comme complète si les sources ne le permettent pas.

---

# 8. SCOUTING REPORTS

C'est la fonctionnalité la plus importante du logiciel.

Je veux pouvoir créer deux types de notes complémentaires.

## A. Notes libres

Un espace de rédaction personnel permettant de noter mes observations sans structure imposée.

Fonctionnalités :

- Éditeur de texte riche.
- Titres et sous-titres.
- Listes.
- Texte en gras.
- Tags.
- Date automatique.
- Sauvegarde automatique.
- Possibilité de modifier les notes.
- Possibilité d'associer les notes à un joueur, un match ou une vidéo.

Je dois pouvoir écrire comme dans un véritable carnet de scouting.

## B. Scouting Reports structurés

Créer un modèle de rapport personnalisable.

### Informations générales

- Joueur.
- Date d'observation.
- Match ou événement.
- Compétition.
- Équipe adverse.
- Minutes observées.
- Confiance dans l'évaluation.

### Physical Profile

Évaluer :

- Taille.
- Envergure.
- Mobilité.
- Vitesse.
- Explosivité.
- Force.
- Équilibre.
- Coordination.
- Agilité.
- Endurance.

### Offensive Skills

Évaluer :

- Shooting.
- Catch & Shoot.
- Pull-up Shooting.
- Three-point Shooting.
- Mid-range.
- Free Throws.
- Finishing.
- Rim Pressure.
- Ball Handling.
- Shot Creation.
- Passing.
- Playmaking.
- Off-ball Movement.
- Decision Making.

### Defensive Skills

Évaluer :

- Point of Attack Defense.
- Perimeter Defense.
- Screen Navigation.
- Help Defense.
- Rim Protection.
- Switchability.
- Defensive Awareness.
- Defensive Rebounding.
- Defensive Motor.

### Basketball IQ

Évaluer :

- Court Vision.
- Decision Making.
- Game Understanding.
- Reading Defenses.
- Reading Pick & Roll.
- Anticipation.
- Tactical Awareness.

### Mentality & Intangibles

Évaluer :

- Competitiveness.
- Work Ethic.
- Confidence.
- Leadership.
- Consistency.
- Motor.
- Coachability, lorsque cela est réellement observable ou documenté.

### NBA Projection

Champs à renseigner :

- NBA Archetype.
- Projected NBA Role.
- Offensive Ceiling.
- Defensive Ceiling.
- Strengths.
- Weaknesses.
- Main Concerns.
- Player Comparison.
- Floor.
- Ceiling.
- Overall Potential.

## Système de notation

Chaque caractéristique peut recevoir une note de 1 à 10.

Échelle indicative :

- 1–2 : Très faible.
- 3–4 : En dessous de la moyenne.
- 5 : Moyen.
- 6–7 : Au-dessus de la moyenne.
- 8–9 : Très fort.
- 10 : Exceptionnel.

L'évaluation doit être faite par rapport au groupe de prospects étudié et au niveau attendu pour le rôle NBA.

Prévoir une option « Non évalué ».

Ne jamais attribuer automatiquement de notes à un joueur.

Les notes chiffrées ne doivent pas remplacer les observations écrites.

Possibilité de donner une note globale personnelle et un niveau de confiance.

---

# 9. GAME LOG / MATCH SCOUTING

Créer une rubrique permettant d'enregistrer chaque match observé.

Informations :

- Date.
- Compétition.
- Équipes.
- Score final.
- Lien vers le match ou le replay.
- Joueurs observés.
- Temps passé à observer le joueur.
- Statistiques du match.
- Notes personnelles.

Un même match peut être associé à plusieurs prospects.

Possibilité de rédiger un rapport général sur le match puis des observations individuelles sur chaque joueur.

Chaque joueur doit retrouver automatiquement les matchs auxquels il est associé dans son historique.

---

# 10. VIDEO LIBRARY

Créer une bibliothèque vidéo associée aux prospects.

Je dois pouvoir :

- Ajouter un lien YouTube.
- Ajouter un lien vers un autre hébergeur vidéo.
- Associer la vidéo à un ou plusieurs joueurs.
- Ajouter une description.
- Ajouter des tags.
- Ajouter des observations.

Fonctionnalité particulièrement intéressante :

Possibilité d'ajouter une observation à un timestamp précis.

Exemple :

Vidéo : Duke vs Kentucky

00:34 – Bonne lecture du pick & roll.

02:15 – Mauvaise rotation défensive.

04:28 – Excellente finition main gauche.

Les timestamps doivent être cliquables pour ouvrir la vidéo directement au bon moment lorsque le lecteur le permet.

Ne pas télécharger ni héberger les vidéos. Utiliser les liens et les lecteurs autorisés.

---

# 11. MY DRAFT BOARD

Créer mon classement personnel des prospects.

Fonctionnalités :

- Classement entièrement personnalisable.
- Déplacement des joueurs par glisser-déposer.
- Top 10, Top 30, Top 60 et classement complet.
- Création de tiers (Tier 1, Tier 2, etc.).
- Possibilité de modifier les classements à tout moment.
- Possibilité d'ajouter une justification à chaque position.
- Affichage du dernier changement de position.
- Historique des classements.
- Plusieurs Draft Boards pour différentes années.

Champs du classement :

- Rank.
- Player.
- Position.
- Team.
- Age.
- Tier.
- Overall Grade.
- NBA Projection.
- Confidence.
- Last Updated.

Prévoir également des champs facultatifs pour renseigner les positions annoncées par d'autres analystes et les sources correspondantes.

Distinguer systématiquement mon classement personnel des classements extérieurs.

Ne pas récupérer automatiquement des mock drafts par scraping non autorisé.

---

# 12. PLAYER COMPARISON

Créer un outil de comparaison entre 2, 3 ou 4 prospects.

Comparer :

- Profil physique.
- Âge.
- Poste.
- Statistiques classiques.
- Statistiques avancées.
- Percentiles.
- Notes de scouting.
- Évaluations par catégorie.
- NBA Projection.
- Classement personnel.

Présenter les résultats dans un tableau comparatif.

Ajouter éventuellement un radar chart pour comparer les évaluations de scouting.

Ne comparer statistiquement que des données suffisamment comparables (même compétition et contexte similaire).

---

# 13. GESTION DES DONNÉES

Toutes les données personnelles doivent être stockées dans une base locale.

Fonctionnalités :

- Sauvegarde automatique des modifications.
- Export complet en JSON.
- Export des joueurs et statistiques en CSV.
- Import de joueurs via CSV.
- Import de données depuis un fichier.
- Sauvegarde de la base de données.
- Restauration d'une sauvegarde.

Prévoir une confirmation avant les suppressions définitives.

Les API ne doivent jamais être la seule source de conservation des notes personnelles.

---

# 14. ARCHITECTURE TECHNIQUE

Privilégier une architecture simple et robuste.

Proposition technique :

- Next.js pour l'application.
- TypeScript.
- React.
- Tailwind CSS.
- shadcn/ui pour les composants.
- SQLite pour la base de données locale.
- Prisma pour la gestion de la base de données.
- TanStack Table pour les tableaux.
- Recharts pour les graphiques.
- dnd-kit pour le glisser-déposer du Draft Board.
- Tiptap pour les notes riches.

Cette stack peut être adaptée si une solution plus simple et mieux adaptée est identifiée.

L'application doit pouvoir être lancée depuis mon ordinateur avec une commande simple et s'ouvrir dans le navigateur.

Organisation recommandée des données :

- Players
- Teams
- Leagues
- Seasons
- PlayerSeasonStats
- Games
- PlayerGameStats
- ScoutingReports
- Notes
- VideoClips
- DraftBoards
- DraftBoardEntries
- Sources
- SyncLogs

Prévoir des identifiants internes stables ainsi que les identifiants externes des joueurs lorsque les fournisseurs en proposent.

La clé des API doit être conservée dans un fichier d'environnement et ne jamais être exposée au navigateur.

---

# 15. FIABILITÉ ET MISE À JOUR

Point essentiel : je ne veux pas retrouver le problème de DraftBallR, avec des classements et des informations qui ne sont plus à jour.

Prévoir :

- Un bouton de synchronisation manuelle.
- Une date de dernière mise à jour visible.
- Un indicateur de données obsolètes.
- Un système de cache pour éviter les appels API inutiles.
- Un journal des synchronisations.
- Une gestion des erreurs API.
- Une conservation des données déjà téléchargées en cas de panne d'une API.

Pour chaque donnée importée, conserver si possible :

- Fournisseur.
- Identifiant externe.
- Date de récupération.
- Saison.
- Source originale.

Les données manquantes ne sont jamais égales à zéro.

Ne jamais inventer des statistiques ou informations biographiques.

Respecter les limites d'accès et les conditions d'utilisation des fournisseurs.

---

# 16. PRIORITÉS DE DÉVELOPPEMENT

Ne pas développer toutes les fonctionnalités en même temps.

Construire le logiciel en étapes successives.

### PHASE 1 — Interface et structure

Priorité absolue.

Créer :
- Dashboard.
- Menu latéral.
- Player Database.
- Fiches individuelles.
- Interface Scouting Reports.
- My Draft Board.

Utiliser des données fictives clairement identifiées comme données de démonstration.

Objectif : obtenir une interface visuellement convaincante et fonctionnelle avant de connecter les API.

### PHASE 2 — Base de données et notes

Développer :
- Création de joueurs.
- Modification et suppression.
- Sauvegarde locale.
- Notes libres.
- Rapports structurés.
- Tags.
- Historique des observations.

Objectif : pouvoir véritablement utiliser l'application pour observer et noter des joueurs.

### PHASE 3 — Draft Board et comparaison

Développer :
- Classement personnalisé.
- Drag & drop.
- Tiers.
- Historique du classement.
- Comparaison de prospects.

### PHASE 4 — Intégration des statistiques NCAA

Connecter CBB Stats puis College Basketball Data.

Vérifier les données disponibles et les limites réelles des API.

Permettre de retrouver rapidement les statistiques d'un prospect depuis sa fiche.

### PHASE 5 — Vidéos et matchs

Développer :
- Game Log.
- Liens vidéo.
- Timestamps.
- Observations liées aux matchs.
- Historique vidéo des prospects.

### PHASE 6 — Élargissement des données

Ajouter les fonctionnalités nécessaires pour les joueurs internationaux, G-League, High School et NCAA hors Division I.

Privilégier les imports et la saisie manuelle tant qu'une source automatisée fiable n'a pas été identifiée.

---

# 17. CRITÈRES DE VALIDATION

Le projet ne sera considéré comme utilisable que lorsque les conditions suivantes seront remplies :

1. Je peux créer un joueur manuellement.
2. Je peux retrouver un joueur grâce à la recherche.
3. Je peux afficher ses informations et ses statistiques.
4. Je peux ajouter et modifier une note libre.
5. Je peux créer un rapport de scouting structuré.
6. Je peux associer un rapport à un match.
7. Je peux ajouter une vidéo et des observations horodatées.
8. Je peux placer un joueur dans mon Draft Board.
9. Je peux modifier mon classement par glisser-déposer.
10. Je peux comparer plusieurs prospects.
11. Mes données restent enregistrées après fermeture et redémarrage de l'application.
12. Je peux exporter une sauvegarde.
13. L'application affiche clairement les erreurs de récupération des statistiques.

Tous les boutons doivent réellement fonctionner.

Aucune page ne doit être uniquement décorative.

---

# 18. CONSIGNES IMPORTANTES POUR ANTIGRAVITY

Je suis débutant en développement logiciel. Je veux que tu prennes en charge la majeure partie de la programmation.

Respecte impérativement ces consignes :

- Ne construis pas tout le projet en une seule fois.
- Travaille par étapes indépendantes.
- Ne supprime jamais une fonctionnalité fonctionnelle pour en reconstruire une autre.
- Avant chaque phase, explique brièvement les modifications prévues.
- Vérifie que le projet fonctionne après chaque étape.
- Utilise des tests et vérifie le build.
- Limite les dépendances inutiles.
- Ne développe pas de fonctionnalité payante.
- Ne multiplie pas les appels API.
- N'utilise pas d'IA externe pour effectuer des opérations qui peuvent être réalisées directement par le logiciel.
- Ne remplace pas les données réelles par des données fictives sans le signaler.
- Conserve un fichier de documentation expliquant comment lancer et sauvegarder l'application.

La priorité est la qualité de l'interface, la facilité d'utilisation, la fiabilité des données et la qualité de l'outil de prise de notes.

Le résultat final doit être un logiciel personnel de scouting NBA, pas une simple démonstration de développement web.