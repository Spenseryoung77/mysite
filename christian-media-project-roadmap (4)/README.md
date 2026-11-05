# Paroles Inspirées — Direction artistique

Ce document décrit l'identité visuelle du site et explique **pourquoi** chaque choix de design a été fait.
Il sert de référence pour les personnes qui écrivent, illustrent ou développent le site, afin que les pages restent cohérentes.

> **Statut :** direction provisoire, construite à partir de la description du logo fourni (fond bleu profond, texte blanc, flamme blanche).
> Le fichier source du logo n'était pas disponible : les couleurs et le logo affichés sont des **approximations** à remplacer par les éléments officiels dès qu'ils existent (voir § 12).

---

## Sommaire

1. [Intention générale](#1-intention-générale)
2. [Couleurs](#2-couleurs)
3. [Typographie](#3-typographie)
4. [Logo et symbole](#4-logo-et-symbole)
5. [Formes, espacements et grille](#5-formes-espacements-et-grille)
6. [Composants d'interface](#6-composants-dinterface)
7. [Éléments éditoriaux](#7-éléments-éditoriaux)
8. [Mise en page par type de page](#8-mise-en-page-par-type-de-page)
9. [Images et médias](#9-images-et-médias)
10. [Accessibilité](#10-accessibilité)
11. [Performance et sobriété](#11-performance-et-sobriété)
12. [Limites actuelles et points à valider](#12-limites-actuelles-et-points-à-valider)
13. [Où modifier quoi](#13-où-modifier-quoi)

---

## 1. Intention générale

**Le style en quatre mots : sobre, chaleureux, moderne, spirituel.**

| Principe | Ce que ça change concrètement |
|---|---|
| **Le contenu d'abord** | Beaucoup de blanc, une seule couleur forte (le bleu), pas de décor superflu. Le regard va au titre et au texte. |
| **Inspirer confiance** | Auteur, date, sources, crédits et nature du contenu toujours visibles. La transparence fait partie du design. |
| **Une chaleur maîtrisée** | Coins arrondis, grandes zones bleu très clair, flamme en rappel. Pas d'effets spectaculaires. |
| **Lisible partout** | On conçoit d'abord pour le téléphone et les connexions lentes. Pas de carrousel, pas de lecture automatique, pas d'animation lourde. |

**Ce qu'on évite exprès :** dégradés « néon », photos de banque d'images trop mises en scène, typographies fantaisie, fonds sombres sur les pages de lecture, pop-ups.

---

## 2. Couleurs

### 2.1 Palette

| Rôle | Nom (variable Tailwind) | Valeur | Usage |
|---|---|---|---|
| Couleur principale | `brand` | `#04326E` | Bandeau « À la une », boutons principaux, pied de page, liens, badges de rubrique, bloc prière |
| Bleu foncé | `brand-900` | `#021F45` | Survol des boutons principaux |
| Bleu intermédiaire | `brand-700` | `#0A4A9A` | Seconde couleur des dégradés (vignettes sans image, lecteur média) |
| Bleu très clair | `brand-50` | `#EFF5FC` | En-têtes de pages, bloc méditation, citations, charte éditoriale, survols du menu |
| Texte | `ink` | `#202B39` | Texte courant et titres |
| Blanc | — | `#FFFFFF` | Fond principal, texte sur bleu |

**Couleurs fonctionnelles** (palette Tailwind, jamais décoratives) :

| Couleur | Usage |
|---|---|
| Ambre (`amber-50/100/400/500/900`) | Avertissements : opinion, contenu sponsorisé, correction, événement annulé, bandeau d'aperçu, contour de focus clavier (`#F5A524`) |
| Vert (`green-50/900`) | Confirmation de l'envoi d'un formulaire |
| Rouge (`red-50/700/800`) | Erreurs, suppressions |
| Gris ardoise (`slate-*`) | Métadonnées, bordures (`slate-200`), badges de catégorie |
| Violet (`purple-100/900`) | Statut « Programmé » dans l'administration uniquement |

### 2.2 Pourquoi ces choix

- **Un seul bleu dominant.** Il vient du logo et suffit à reconnaître le média. Une deuxième couleur vive aurait affaibli l'identité. Le bleu évoque aussi la confiance, le calme et la profondeur, ce qui va bien avec un média d'information et de foi.
- **Un texte jamais noir pur.** `#202B39` est un gris bleuté : il fatigue moins les yeux sur de longs textes que `#000`, et il s'accorde avec le bleu.
- **Le bleu très clair plutôt que du gris.** Il marque les zones importantes (méditation, citations, charte) tout en restant dans l'univers de la marque. Un gris aurait paru froid.
- **L'ambre comme seule couleur chaude.** Il est réservé à ce qui demande une attention particulière : une opinion, un partenariat, une correction. Le lecteur apprend vite qu'ambre signifie « à lire avec recul ».
- **Le pied de page en bleu plein.** Il ferme visuellement chaque page et rappelle le fond du logo.

### 2.3 Contrastes (calculés selon la formule WCAG)

| Combinaison | Ratio approximatif | Niveau |
|---|---|---|
| Blanc sur `#04326E` | ≈ 12,4 : 1 | AAA |
| `#202B39` sur blanc | ≈ 14,3 : 1 | AAA |
| `#202B39` sur `#EFF5FC` | ≈ 13 : 1 | AAA |
| `#04326E` sur `#EFF5FC` | ≈ 11,4 : 1 | AAA |
| Focus ambre `#F5A524` sur `#04326E` | ≈ 6 : 1 | Conforme |
| Focus ambre `#F5A524` sur blanc | ≈ 2 : 1 | ⚠️ **Insuffisant** (3 : 1 demandé pour les éléments d'interface), voir § 12 |

---

## 3. Typographie

### 3.1 Familles

| Usage | Pile de polices | Classe |
|---|---|---|
| Titres, logo, intitulés de section | `"Montserrat", "Arial Black", system-ui, …` | `font-display` |
| Texte courant, interface | `system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial` | `font-sans` |

**Pourquoi :**
- **Titres :** une sans-serif épaisse (`font-black` = 900, `font-bold` = 700) rappelle l'esprit du lettrage du logo, sans prétendre en être la police exacte.
- **Texte courant en police système :** aucun fichier à télécharger, donc un affichage immédiat même avec une connexion limitée. Ces polices sont aussi très bien réglées pour l'écran sur chaque appareil.
- ⚠️ **Montserrat n'est pas chargée** pour le moment. Elle ne s'affiche que si elle est installée sur l'appareil du visiteur ; sinon, c'est Arial Black qui prend le relais. Voir § 12.

### 3.2 Échelle

| Élément | Mobile | Ordinateur | Graisse |
|---|---|---|---|
| Titre d'article, titre de page (H1) | `text-3xl` (30 px) | `text-5xl` (48 px) | 900 |
| Titre de section (H2) | `text-2xl` (24 px) | `text-3xl` (30 px) | 900 |
| Titre de carte (H3) | `text-lg` (18 px) | idem | 700 |
| Chapô | `text-xl` (20 px) | idem | 400 |
| Texte d'article | 18 px, interligne 1,8 | idem | 400 |
| Interface, résumés | `text-sm` (14 px) | idem | 400–600 |
| Métadonnées, crédits | `text-xs` (12 px) | idem | 400 |
| Surtitres (« Rubrique », « À la une ») | `text-sm`, majuscules, `tracking-widest` | idem | 700 |

**Pourquoi :**
- **Texte de lecture à 18 px avec un interligne de 1,8.** Les articles et méditations se lisent longuement, souvent sur téléphone : une taille généreuse et des lignes aérées réduisent la fatigue.
- **Largeur de lecture limitée** (`max-w-4xl` sur les articles) pour éviter des lignes trop longues sur grand écran.
- **Surtitres en petites capitales espacées.** Ils situent le lecteur (rubrique, statut) sans concurrencer le titre.
- **Écart net entre graisses** (900 pour les titres, 400 pour le texte) : la hiérarchie se lit au premier coup d'œil.

---

## 4. Logo et symbole

### 4.1 Logo affiché (`src/components/Logo.tsx`)

Une pastille bleue `#04326E` aux coins arrondis (`rounded-xl`), avec une flamme blanche à gauche et « PAROLES / INSPIRÉES » sur deux lignes, en majuscules, graisse 900.

**Pourquoi :**
- C'est une **reconstitution** du logo décrit, en SVG et en code, en attendant le fichier original. Elle reste nette à toutes les tailles, ne pèse presque rien et n'est jamais déformée.
- **La pastille bleue est conservée même sur fond blanc** : le logo garde toujours son fond d'origine, il n'est jamais recoloré.
- **Une version compacte** (texte plus petit) sert dans la barre latérale de l'administration.
- Dans le pied de page bleu, un **fin contour blanc translucide** (`ring-white/30`) détache la pastille du fond, qui est de la même couleur.

### 4.2 Règles d'usage

- Le logo est toujours un lien vers l'accueil, avec le texte alternatif **« Paroles Inspirées — accueil »**.
- Il est placé dans l'en-tête et le pied de page uniquement.
- Le padding interne (`px-3 py-2`) sert de zone de respiration minimale.
- Ne pas étirer, ne pas changer la couleur de fond, ne pas ajouter d'ombre.

### 4.3 La flamme comme motif

La flamme (`<Flame />`) est le seul élément graphique récurrent. Elle apparaît :

| Endroit | Rôle |
|---|---|
| Icône du site (`src/app/icon.svg`) | Flamme blanche sur carré bleu arrondi : reconnaissable même à 16 px |
| Surtitre « À la une » | Petit rappel de l'identité au point d'entrée du site |
| Vignettes sans image | Remplace une photo absente par un visuel de marque plutôt qu'un vide |

**Pourquoi l'utiliser avec parcimonie :** un symbole répété partout perd sa force. Trois usages bien choisis suffisent à l'ancrer.

---

## 5. Formes, espacements et grille

### 5.1 Arrondis

| Élément | Arrondi |
|---|---|
| Boutons, champs, badges | `rounded-lg` (8 px) / `rounded-md` (6 px) |
| Logo | `rounded-xl` (12 px) |
| Cartes, images, encadrés | `rounded-2xl` (16 px) |
| Grands blocs (méditation, newsletter, mission) | `rounded-3xl` (24 px) |
| Filtres de catégories | `rounded-full` (pilules) |

**Pourquoi :** des arrondis **qui grandissent avec la taille de l'élément** gardent une sensation homogène. Ils rappellent discrètement la forme arrondie du logo et adoucissent l'interface, ce qui crée une impression d'accueil sans paraître enfantin.

### 5.2 Conteneur et grille

- Conteneur unique `.container-pi` : largeur maximale 1152 px (`max-w-6xl`), marges de 16 px sur mobile et 24 px au-delà.
- Grilles de cartes : 1 colonne sur mobile, 2 sur tablette, 3 sur ordinateur (`sm:grid-cols-2 lg:grid-cols-3`).
- Sections espacées verticalement de `py-12` ; en-têtes de pages en `py-12 md:py-16`.

**Pourquoi :** une seule largeur de référence aligne tous les blocs. Trois colonnes au maximum gardent des cartes assez grandes pour lire titre et résumé ; au-delà, l'accueil ressemblerait à un catalogue.

### 5.3 Séparations

Bordures fines `slate-200` et alternance de fonds (blanc / `brand-50` / `slate-50`), plutôt que des traits épais ou des ombres fortes. L'ombre (`shadow-md`) n'apparaît qu'au **survol** des cartes, pour signaler qu'elles sont cliquables.

---

## 6. Composants d'interface

Les styles sont définis dans `src/app/globals.css` (`@layer components`).

### 6.1 Boutons

| Classe | Apparence | Usage |
|---|---|---|
| `.btn-primary` | Fond bleu, texte blanc gras, bleu plus foncé au survol | Action principale : s'abonner, lire, envoyer |
| `.btn-light` | Fond blanc, texte bleu | Action principale **sur fond bleu** (bandeau « À la une », pied de page, bloc newsletter) |
| `.btn-ghost` | Contour gris, fond blanc ; bordure et texte bleus au survol | Actions secondaires : archives, partage, pagination |
| `.btn-danger` | Fond rouge | Suppression (administration uniquement, toujours avec confirmation) |

**Décisions :**
- **Hauteur minimale de 44 px** (`min-h-11`) : c'est la taille confortable pour un doigt sur écran tactile.
- **Une seule action principale par bloc**, pour que le visiteur sache toujours quoi faire.
- `.btn-light` inverse les couleurs pour garder un fort contraste sur les fonds bleus.
- Un bouton désactivé passe à 60 % d'opacité, et son libellé change pendant l'envoi (« Envoi… »).

### 6.2 Liens

- `.link` : bleu, gras, **toujours souligné** ; le soulignement s'épaissit au survol.
- `.link-light` : blanc, soulignement translucide, pour le pied de page.

**Pourquoi souligner :** la charte demande que les liens se repèrent **autrement que par la couleur seule**, ce qui aide les personnes daltoniennes ou malvoyantes.

### 6.3 Champs de formulaire

- `.input` : hauteur 44 px, texte à 16 px (ce qui évite le zoom automatique sur iPhone), bordure grise qui devient bleue avec un halo léger au focus.
- `.label` : libellé en gras toujours visible **au-dessus** du champ, jamais seulement en texte indicatif.
- Une aide sous le champ explique à quoi sert la donnée (« Votre adresse sert uniquement à… »).
- Les messages de retour sont des encadrés colorés (vert pour un succès, rouge pour une erreur) annoncés aux lecteurs d'écran (`role="status"` / `role="alert"`).

**Pourquoi :** des formulaires clairs inspirent confiance, et expliquer l'usage des données fait partie de la transparence du média.

### 6.4 Badges

`Badge` : petite étiquette en majuscules, gras, `text-xs`.

| Ton | Couleurs | Signification |
|---|---|---|
| `brand` | Bleu sur bleu très clair | Rubrique ou type de contenu |
| `slate` | Gris | Catégorie, format (vidéo, audio), « Enseignement », « Passé » |
| `amber` | Ambre | « Opinion », « Contenu sponsorisé », « Annulé » |

**Pourquoi :** le code couleur fait partie de l'information. Il permet de distinguer **faits, enseignements, opinions et contenus sponsorisés**, comme l'exige la charte éditoriale. Les simples informations (`fait`) ne reçoivent volontairement aucun badge, pour ne pas surcharger.

### 6.5 Cartes de contenu (`ContentCard`)

Ordre de lecture : **image 16:9 → badges → titre → référence biblique → résumé (3 lignes au maximum) → date · auteur**.

**Décisions :**
- **Toute la carte est cliquable** (lien étendu par `after:absolute after:inset-0`), mais il n'y a qu'un seul lien dans le code, ce qui évite la répétition pour les lecteurs d'écran et le clavier.
- **Format d'image fixe en 16:9**, pour que la grille reste alignée quelles que soient les photos.
- **Date et auteur toujours en bas** (`mt-auto`), alignés d'une carte à l'autre.
- Pour un témoignage anonymisé, le nom de l'auteur est masqué.

### 6.6 En-tête

- **Collé en haut de l'écran**, fond blanc à 95 % avec léger flou : on garde le menu sans masquer brutalement le contenu.
- Ordre : logo → menu (sur ordinateur) → loupe → bouton « S'abonner » → bouton du menu mobile.
- **Lien d'évitement « Aller au contenu »** visible au premier appui sur Tab.
- Le bouton « Soutenir » est **volontairement absent** tant que les dons ne sont pas en place.

### 6.7 Menu mobile

Le bouton ☰ ouvre un panneau sous l'en-tête : **recherche en premier**, puis les rubriques en grandes lignes tactiles, et le bouton newsletter en pleine largeur. Le menu se ferme automatiquement quand on change de page.

**Pourquoi la recherche en tête :** sur mobile, beaucoup de visiteurs savent déjà ce qu'ils cherchent.

### 6.8 Pied de page

Fond bleu plein, organisé en 4 colonnes : présentation du média, rubriques, pages institutionnelles (charte, contact, pages légales), newsletter. Une bande inférieure indique le copyright et **la traduction biblique utilisée par défaut**.

**Pourquoi afficher la traduction ici :** c'est une mention de transparence et de respect des droits, présente sur chaque page.

### 6.9 Fil d'Ariane, filtres, pagination

- **Fil d'Ariane** sur les pages profondes (articles, émissions), séparateur « › ».
- **Filtres** sous forme de pilules ; celle qui est active est remplie de bleu.
- **Pagination** par boutons « ← Plus récents / Plus anciens → » avec « Page X sur Y ».

**Pourquoi des boutons plutôt qu'un défilement infini :** le pied de page reste accessible, chaque page a une adresse qu'on peut partager, et la consommation de données est plus faible.

---

## 7. Éléments éditoriaux

Le rendu du texte est géré par le composant `Prose` (classe `.prose-pi`).

| Élément | Traitement | Pourquoi |
|---|---|---|
| **Intertitres** (`##`) | Police d'affichage, graisse 800, grand espace au-dessus | Découper les textes longs en étapes de lecture |
| **Citations** (`>`) | Filet bleu à gauche, fond bleu très clair, italique, coin droit arrondi | Mettre en valeur un verset ou une parole : c'est le moment « inspiré » du texte |
| **Référence biblique** | Bleu gras au-dessus du texte, traduction en petit gris dessous | La source d'une citation biblique est toujours visible |
| **Prière** | Bloc bleu plein, texte blanc, grand italique | Un changement d'ambiance net : on passe de la lecture au recueillement |
| **Correction** | Filet ambre, fond ambre clair, en tête d'article | Une erreur corrigée est signalée honnêtement, avant le texte |
| **Avertissement opinion / sponsorisé** | Encadré gris (opinion) ou ambre (sponsorisé) | Séparer clairement l'opinion et le partenariat de l'information |
| **Sources** | Encadré bordé en fin d'article, liste à puces, liens cliquables | Vérifiables sans gêner la lecture |
| **Transcription** | Bloc repliable « Transcription » | Accessible sans allonger la page |
| **Encart auteur** | Fond gris clair, nom en lien, fonction et présentation | Des auteurs identifiés renforcent la confiance |
| **Crédit photo** | Petite légende grise sous l'image | Droits respectés et visibles |
| **Dates** | « Publié le… » et, si besoin, « Mis à jour le… » | Le lecteur sait si l'information est récente |

---

## 8. Mise en page par type de page

### Accueil
Les sections suivent un **rythme alterné** pour éviter la monotonie :

1. **À la une** : bandeau bleu plein, texte à gauche, image à droite. C'est le seul grand aplat bleu en haut de page, il donne immédiatement l'identité.
2. **Méditation** : carte bleu très clair, texte sur 3/5 et image sur 2/5. Ambiance calme et spirituelle.
3. **Derniers articles** : grille de cartes sur fond blanc.
4. **À regarder / à écouter** : fond gris très clair pour signaler un autre type de contenu.
5. **Témoignage** : une seule carte, largeur limitée, pour une mise en avant intime.
6. **Notre mission** : bloc bordé avec une liste d'engagements (coches bleues).
7. **Événements**, si des événements sont prévus.
8. **Newsletter** : grand bloc bleu arrondi, qui fait écho au bandeau du haut et encadre la page.

Les sections sans contenu sont **masquées automatiquement** : aucune section vide ni contenu fictif présenté comme réel. L'ordre et l'affichage se règlent dans l'administration.

### Pages de rubrique
En-tête bleu très clair (surtitre, grand titre, description), puis filtres, grille et pagination. Sur la page Témoignages, un encart invite à proposer son témoignage ; sur la page Vidéos, la liste des émissions s'affiche en premier.

### Article, méditation, témoignage, épisode
- En-tête bleu très clair avec fil d'Ariane, badges, titre, chapô et métadonnées.
- Colonne de lecture unique et centrée (`max-w-4xl`), **sans barre latérale**, pour se concentrer sur le texte.
- Si le contenu a une vidéo ou un audio, **le lecteur remplace l'image principale**.
- Fin de page : partage, encart auteur, contenus proches.

### Page d'émission
En-tête **bleu plein** (comme le bandeau de l'accueil) pour en faire une « vitrine », puis la grille des épisodes.

### Pages institutionnelles et légales
Texte simple, sections numérotées par des H2. Les modèles à compléter portent un **bandeau ambre** bien visible.

### Page 404
Message clair, champ de recherche et lien vers l'accueil, pour que le visiteur ne reste jamais bloqué.

### Administration
Style plus **utilitaire** : fond gris clair, barre latérale blanche, cartes blanches, tableaux. On garde la marque (logo, bleu) mais la priorité est l'efficacité. Les statuts ont chacun leur couleur (gris pour un brouillon, ambre pour « à relire », bleu pour « validé », vert pour « publié », violet pour « programmé ») et la barre « Enregistrer » reste toujours visible en bas de l'écran.

L'**aperçu** d'un contenu non publié affiche un bandeau ambre en haut, pour qu'on ne le confonde jamais avec la version en ligne.

---

## 9. Images et médias

### Ligne photographique
- **Sujets :** personnes, vie chrétienne, Bible, communauté, entraide, lumière naturelle.
- **Ton :** naturel et lumineux, pas de mise en scène artificielle.
- **À éviter :** visages de mineurs sans autorisation, images génériques sans lien avec le texte, montages trop chargés.
- **Obligatoire :** un **texte alternatif** et un **crédit** (l'administration bloque la publication sans eux).
- Les photos de départ viennent de Pexels et sont créditées.

### Traitement technique
- Format 16:9 pour les cartes et les articles, 16:10 pour le bandeau « À la une ».
- Recadrage automatique (`object-cover`) avec des coins arrondis assortis aux cartes.
- **Chargement différé** (`loading="lazy"`) et décodage asynchrone.
- **Sans image**, un dégradé bleu avec la flamme remplace la photo, pour garder une grille cohérente sans visuel fictif.

### Lecteur vidéo et audio
Le lecteur n'est pas chargé au départ : on affiche une **vignette bleue en dégradé** avec un gros bouton lecture blanc et la mention « Le lecteur se charge uniquement à votre demande ».

**Pourquoi :**
- Les données mobiles sont économisées.
- Il n'y a pas de lecture automatique.
- Aucun service tiers (YouTube, etc.) n'est contacté avant le clic, ce qui protège la vie privée. Pour YouTube, on utilise la version `youtube-nocookie`.

---

## 10. Accessibilité

| Décision | Mise en œuvre |
|---|---|
| Focus clavier très visible | Contour ambre de 3 px, décalé de 2 px (`:focus-visible`) |
| Lien d'évitement | « Aller au contenu » en tête de page |
| Langue | `<html lang="fr">` |
| Structure | Un seul H1 par page ; si l'accueil n'a pas de « une », un H1 invisible est ajouté pour les lecteurs d'écran |
| Navigation | `aria-label` sur chaque `<nav>`, `aria-current="page"` sur l'élément actif, `aria-expanded` sur le menu mobile |
| Formulaires | Labels explicites, messages annoncés, champs obligatoires marqués « * » |
| Zones tactiles | 44 px minimum |
| Mouvement | `prefers-reduced-motion` coupe les transitions et le défilement doux |
| Icônes décoratives | `aria-hidden="true"` ; les boutons composés d'une seule icône ont un libellé caché |
| Liens | Toujours soulignés |

---

## 11. Performance et sobriété

- **Aucune police web téléchargée** pour le texte courant.
- **Logo et icônes en SVG dans le code** : pas de requête réseau supplémentaire.
- **Pas de carrousel, pas d'animation au défilement, pas de vidéo en fond.**
- Les transitions se limitent à des changements de couleur ou d'ombre au survol.
- Images chargées à la demande, lecteurs média chargés au clic.

**Pourquoi :** une partie du public visé consulte sur mobile avec une connexion limitée. Un site rapide, c'est aussi une marque de respect envers le lecteur.

---

## 12. Limites actuelles et points à valider

| Point | État | Action recommandée |
|---|---|---|
| Logo | Reconstitution SVG provisoire | Le remplacer par le fichier original recadré (SVG de préférence) dans `src/components/Logo.tsx` et `src/app/icon.svg` |
| Bleu `#04326E` | Estimé d'après l'image fournie | Le confirmer à partir du fichier source ou de la charte officielle |
| Police des titres | Montserrat déclarée mais **non chargée** (Arial Black en remplacement) | Soit charger Montserrat via `next/font/google` dans `src/app/layout.tsx`, soit valider officiellement Arial Black / la police système |
| Focus clavier sur fond blanc | Ambre ≈ 2 : 1, sous le minimum de 3 : 1 | Ajouter un second contour bleu foncé, ou choisir une teinte plus foncée sur fond clair |
| Photos | Images libres de démonstration | Les remplacer par des visuels propres au média, avec autorisations |
| Modèles d'e-mails | Bandeau bleu et bouton bleu (confirmation de newsletter) | Les décliner pour les campagnes une fois le prestataire choisi |

---

## 13. Où modifier quoi

| Je veux changer… | Fichier |
|---|---|
| Couleurs, polices, boutons, champs, style des articles | `src/app/globals.css` (bloc `@theme` et `@layer components`) |
| Logo et flamme | `src/components/Logo.tsx` |
| Icône du site | `src/app/icon.svg` |
| En-tête / menu mobile / pied de page | `src/components/Header.tsx`, `MobileMenu.tsx`, `Footer.tsx` |
| Cartes, badges, rendu du texte, en-têtes de pages | `src/components/content.tsx` |
| Page article / méditation (blocs prière, sources, correction) | `src/components/ContentDetailView.tsx` |
| Lecteur média et boutons de partage | `src/components/client.tsx` |
| Mise en page de l'accueil | `src/app/(site)/page.tsx` (ordre et affichage aussi réglables dans **Administration → Page d'accueil**) |
| Nom des rubriques et libellés | `src/lib/site.ts` |
| Couleur du navigateur mobile | `themeColor` dans `src/app/layout.tsx` |

> **Règle d'or :** avant d'ajouter une couleur, une police ou un effet, se demander si cela aide le lecteur à **comprendre, lire ou faire confiance**. Si ce n'est pas le cas, ne pas l'ajouter.
