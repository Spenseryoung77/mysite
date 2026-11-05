/* Seed — Paroles Inspirées (contenus de démonstration réalistes) */
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as s from "../src/db/schema";
import { hashPassword } from "../src/lib/password";
import { randomUUID } from "crypto";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db" });
const db = drizzle(pool);

const PX = (id: number, w = 1200, h = 627) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=${h}&w=${w}`;

const now = Date.now();
const H = 3600_000;
const D = 24 * H;
const at = (offsetDays: number, hour?: number) => {
  const d = new Date(now + offsetDays * D);
  if (hour !== undefined) d.setHours(hour, 0, 0, 0);
  return d;
};

async function main() {
  console.log("Nettoyage…");
  for (const t of [s.settings, s.subscribers, s.messages, s.episodes, s.shows, s.events, s.contents, s.categories, s.authors, s.users]) {
    await db.delete(t);
  }

  /* ----- Auteurs ----- */
  const authorRows = await db.insert(s.authors).values([
    { slug: "grace-mbaye", name: "Grâce Mbaye", role: "Rédactrice en chef", color: "#0A4C9E", bio: "Journaliste depuis quinze ans, Grâce a couvert la vie des Églises francophones à Dakar, Abidjan et Paris. Elle veille sur la ligne éditoriale de Paroles Inspirées : des faits vérifiés, des voix respectées, une espérance qui ne masque pas le réel." },
    { slug: "samuel-rakoto", name: "Samuel Rakoto", role: "Pasteur & enseignant", color: "#8A5A12", bio: "Pasteur à Antananarivo, Samuel aime rendre les textes bibliques accessibles sans les simplifier à outrance. Il anime les dossiers de Foi & Bible et l'émission « Racines »." },
    { slug: "claire-fontaine", name: "Claire Fontaine", role: "Responsable des méditations", color: "#136F63", bio: "Accompagnatrice spirituelle à Lyon, Claire écrit chaque matin une méditation courte, enracinée dans un texte biblique. Elle présente le podcast « Le grain de sénevé »." },
    { slug: "david-nguessan", name: "David N'Guessan", role: "Reporter", color: "#7C3AED", bio: "Basé à Abidjan, David sillonne les communautés locales pour raconter les initiatives solidaires, la jeunesse et la culture chrétienne. Il privilégie le terrain et les sources de première main." },
    { slug: "la-redaction", name: "La Rédaction", role: "Collectif", color: "#334155", bio: "Les articles signés « La Rédaction » sont produits collectivement et relus par au moins deux membres de l'équipe avant publication." },
  ]).returning();
  const A = Object.fromEntries(authorRows.map((a) => [a.slug, a.id]));

  /* ----- Catégories ----- */
  const catRows = await db.insert(s.categories).values([
    { slug: "vie-des-eglises", name: "Vie des Églises", section: "actualites", position: 1, description: "Ce qui vit dans les communautés, ici et ailleurs." },
    { slug: "solidarite", name: "Solidarité", section: "actualites", position: 2, description: "Entraide, diaconie et engagement auprès des plus fragiles." },
    { slug: "societe", name: "Société", section: "actualites", position: 3, description: "Regards chrétiens sur le monde qui change." },
    { slug: "culture", name: "Culture", section: "actualites", position: 4, description: "Musique, livres et création d'inspiration chrétienne." },
    { slug: "bible", name: "Bible", section: "foi", position: 1, description: "Comprendre les textes, leur contexte et leur portée." },
    { slug: "priere", name: "Prière", section: "foi", position: 2, description: "Apprendre à prier, avec les mots de la Bible." },
    { slug: "vie-chretienne", name: "Vie chrétienne", section: "foi", position: 3, description: "La foi au quotidien : travail, famille, rythmes de vie." },
    { slug: "questions-de-foi", name: "Questions de foi", section: "foi", position: 4, description: "Les questions que l'on ose parfois à peine poser." },
  ]).returning();
  const C = Object.fromEntries(catRows.map((c) => [c.slug, c.id]));

  type ContentSeed = Partial<typeof s.contents.$inferInsert> & { slug: string; type: string; title: string };
  const insertContent = (c: ContentSeed) =>
    db.insert(s.contents).values({ chapo: "", body: "", status: "published", updatedAt: new Date(), ...c }).returning();

  /* ----- Actualités ----- */
  const [une] = await insertContent({
    slug: "kinshasa-maison-accueil-bethel",
    type: "article",
    title: "À Kinshasa, la communauté Bethel ouvre une maison d'accueil pour les jeunes de la rue",
    chapo: "Vingt lits, un atelier de menuiserie et un accompagnement quotidien : la paroisse Bethel transforme un ancien presbytère en refuge pour les adolescents en rupture familiale.",
    body: `Les travaux ont duré neuf mois, portés par une cinquantaine de bénévoles. Dimanche dernier, la communauté Bethel a inauguré sa maison d'accueil dans le quartier de Lemba, à Kinshasa. Vingt lits y attendent des adolescents qui dormaient jusqu'ici sous les auvents du marché voisin.

« Nous ne voulions pas d'un dortoir de plus, mais d'un lieu qui ressemble à une famille », explique la pasteure Esther Ilunga, qui pilote le projet. Chaque jeune accueilli bénéficie d'un référent, d'un suivi scolaire ou professionnel, et d'un atelier de menuiserie ouvert sur le quartier.

Le financement mêle dons locaux, collecte diaspora et un partenariat avec une menuiserie coopérative qui fournira les premières commandes. La maison prévoit aussi deux soirées par semaine d'aide aux devoirs, ouvertes à tous les enfants du voisinage.

L'équipe reste prudente sur la suite : « L'accueil de nuit est la partie visible. Le vrai travail, c'est la reconstruction des liens familiaux, quand c'est possible », rappelle un éducateur. Une évaluation sera menée après six mois, avec les services sociaux de la commune.`,
    imageUrl: PX(6646926), imageAlt: "Une bénévole tend une boisson chaude lors d'une distribution solidaire", imageCredit: "Photo d'illustration : RDNE Stock project / Pexels",
    categoryId: C["solidarite"], authorId: A["david-nguessan"], publishedAt: at(-0.25),
    sources: "Sources : communiqué de la communauté Bethel, entretien avec l'équipe éducatrice (reportage de démonstration).",
  });

  await insertContent({
    slug: "traduction-bible-langues-locales", type: "article",
    title: "Traduire la Bible en langues locales : les équipes francophones passent à la vitesse supérieure",
    chapo: "Plusieurs alliances de traduction ont annoncé de nouveaux chantiers en Afrique de l'Ouest, avec une méthode qui associe étroitement les locuteurs dès le premier brouillon.",
    body: `Longtemps réservée aux spécialistes, la traduction biblique associe désormais les communautés dès la première ligne. Les équipes réunissent pasteurs, linguistes et locuteurs âgés, garants des expressions idiomatiques.

« Une traduction qui ignore les proverbes locaux passe à côté du cœur de la langue », observe un conseiller en traduction interrogé lors d'un séminaire à Abidjan. Les nouveaux chantiers annoncés cette saison concernent quatre langues d'Afrique de l'Ouest.

Le processus reste long : relecture théologique, tests de compréhension en village, révision orale avant l'impression. Les équipes francophones fournissent les versions de travail à partir des textes hébreux et grecs, en s'appuyant sur les traductions classiques du domaine public.

Les premières publications sont attendues sous forme d'évangiles illustrés et d'enregistrements audio, avant les Bibles complètes.`,
    imageUrl: PX(8275630), imageAlt: "Une Bible ouverte tenue dans des mains, éclairée en clair-obscur", imageCredit: "Photo d'illustration : Orlando Allo / Pexels",
    categoryId: C["vie-des-eglises"], authorId: A["la-redaction"], publishedAt: at(-1.2),
    sources: "Sources : communications des alliances de traduction, séminaire d'Abidjan (article de démonstration).",
  });

  await insertContent({
    slug: "festival-louange-esperance-abidjan", type: "article",
    title: "Festival Louange & Espérance : trois jours de musique et de fraternité à Abidjan",
    chapo: "Chorales venues de six pays, scènes ouvertes et veillée de prière : le festival revient au Palais de la culture avec une programmation résolument intergénérationnelle.",
    body: `C'est devenu un rendez-vous attendu de la rentrée. Le festival Louange & Espérance réunira une trentaine de chorales et groupes au Palais de la culture d'Abidjan, pour trois jours de concerts gratuits en plein air.

Les organisateurs revendiquent une programmation intergénérationnelle : gospel classique le matin, créations urbaines l'après-midi, grandes veillées le soir. « Les jeunes ne demandent pas qu'on baisse le niveau, ils demandent qu'on leur fasse confiance », sourit le directeur artistique, qui a confié deux plateaux à des collectifs de moins de vingt-cinq ans.

Nouveauté cette année : un village associatif accueillera les œuvres diaconales de la ville, et une scène « témoignages » donnera la parole à des parcours de reconstruction.

Les concerts seront captés et diffusés en différé sur les canaux partenaires, avec sous-titrage français.`,
    imageUrl: PX(7933486), imageAlt: "Des musiciens chantent en extérieur, vêtus de couleurs vives", imageCredit: "Photo d'illustration : Caleb Oquendo / Pexels",
    categoryId: C["culture"], authorId: A["david-nguessan"], publishedAt: at(-2.1),
    sources: "Sources : dossier de presse du festival (article de démonstration).",
  });

  await insertContent({
    slug: "aide-alimentaire-hausse-besoins", type: "article",
    title: "Aide alimentaire : les épiceries solidaires chrétiennes font face à la hausse des besoins",
    chapo: "Entre inflation et précarité étudiante, les distributions portées par les Églises voient arriver de nouveaux publics. Reportage sur une logistique entièrement bénévole.",
    body: `À l'ouverture des portes, la file s'étire déjà le long du mur. Parmi les visages, des habitués, mais aussi des étudiants et des travailleurs pauvres que les bénévoles n'avaient jamais vus.

Les épiceries solidaires portées par les Églises décrivent toutes la même évolution : des files plus longues, des publics plus variés, et des denrées plus chères. « Nous servons trente pour cent de familles en plus qu'il y a deux ans, à budget constant », résume la responsable d'un point de distribution.

La réponse s'organise : mutualisation des achats entre associations, partenariats avec les invendus des commerces, et un accueil qui ne se limite pas au colis — café, écoute, orientation vers les services sociaux.

Les responsables insistent sur la dignité : « Personne ne repart avec un panier et un sermon. On propose, on ne conditionne pas. »`,
    imageUrl: PX(6646882), imageAlt: "Deux bénévoles se transmettent un carton d'aide alimentaire", imageCredit: "Photo d'illustration : RDNE Stock project / Pexels",
    categoryId: C["societe"], authorId: A["grace-mbaye"], publishedAt: at(-3),
    sources: "Sources : reportage auprès de trois points de distribution (article de démonstration).",
  });

  await insertContent({
    slug: "groupes-campus-presentiel", type: "article",
    title: "Sur les campus, les groupes chrétiens renouent avec le présentiel",
    chapo: "Après des années de rencontres en visioconférence, les groupes d'étudiants réinvestissent les amphis et les cafétérias. Entre regain d'engagement et fatigue numérique.",
    body: `Amphi B, midi quinze : une trentaine d'étudiants partagent sandwichs et nouvelles de la semaine. La scène paraît banale ; elle ne l'était plus il y a trois ans.

Les groupes chrétiens de campus dressent le même bilan : les visioconférences ont maintenu le lien, mais l'engagement s'est érodé. « On ne se connaît vraiment qu'autour d'une table », confie une étudiante en médecine, responsable d'un groupe d'une quarantaine de membres.

Les formats évoluent : études bibliques courtes le midi, week-ends de rentrée, tutorat entre étudiants, et des projets de service ouverts à tous, croyants ou non.

Le défi reste la relève : former chaque année de nouveaux responsables, alors que les cursus s'accélèrent. Plusieurs groupes mutualisent désormais leurs formations à l'échelle régionale.`,
    imageUrl: PX(14587105), imageAlt: "Un groupe de jeunes lève les mains lors d'une rencontre", imageCredit: "Photo d'illustration : Caleb Oquendo / Pexels",
    categoryId: C["vie-des-eglises"], authorId: A["la-redaction"], publishedAt: at(-4),
    sources: "Sources : entretiens avec des responsables de groupes étudiants (article de démonstration).",
  });

  await insertContent({
    slug: "parcours-accompagnement-deuil", type: "article",
    title: "Un nouveau parcours d'accompagnement du deuil porté par des aumôniers",
    chapo: "Huit soirées pour traverser la perte d'un proche, entre écoute, textes bibliques et gestes concrets : le parcours « Espérer encore » se déploie dans une dizaine de villes.",
    body: `Le deuil ne se gère pas, il se traverse — et rarement seul. C'est la conviction qui a donné naissance au parcours « Espérer encore », huit soirées animées en binôme par un aumônier et un psychologue.

Chaque rencontre associe un temps d'écoute en petits groupes, un texte biblique lu sans obligation de commentaire, et un geste concret : écrire une lettre, préparer un album, cuisiner le plat du disparu.

« Les psaumes de lamentation autorisent la colère et les questions. Beaucoup découvrent qu'ils ont le droit d'être en colère devant Dieu », explique l'un des aumôniers formateurs.

Le parcours, non confessionnel dans son accueil, est proposé gratuitement par les paroisses partenaires, qui forment leurs équipes avec des professionnels de santé.`,
    imageUrl: PX(6646852), imageAlt: "Une bénévole en tenue d'association, les bras croisés, souriante", imageCredit: "Photo d'illustration : RDNE Stock project / Pexels",
    categoryId: C["societe"], authorId: A["grace-mbaye"], publishedAt: at(-5.2),
    sources: "Sources : présentation du parcours et entretien avec l'équipe formatrice (article de démonstration).",
  });

  await insertContent({
    slug: "chorales-concert-noel-solidaire", type: "article",
    title: "Des chorales inter-Églises préparent un concert de Noël au profit des familles isolées",
    chapo: "Douze chorales, trois traditions et une même partition : le concert « Une place à la table » reversera l'intégralité de sa billetterie aux colis de fêtes.",
    body: `Ils répètent séparément depuis septembre, mais se retrouveront pour la première fois samedi : deux cents choristes catholiques, protestants et évangéliques préparent un concert commun au profit des familles isolées.

Le programme mêle chants traditionnels français, gospel et polyphonies africaines. « La diversité n'est pas un folklore, c'est le sujet du concert », explique la cheffe de chœur coordinatrice.

L'intégralité de la billetterie financera des colis de fêtes et des invitations à des tables ouvertes le 25 décembre, organisées avec les centres sociaux.

Les organisateurs espèrent mille spectateurs — et surtout, disent-ils, « mille tables avec une chaise de moins vide ».`,
    imageUrl: PX(8815037), imageAlt: "Une chorale chante avec enthousiasme, dirigée par une pasteure", imageCredit: "Photo d'illustration : Pavel Danilyuk / Pexels",
    categoryId: C["culture"], authorId: A["david-nguessan"], publishedAt: at(-6.1),
    sources: "Sources : conférence de presse des organisateurs (article de démonstration).",
  });

  await insertContent({
    slug: "semaine-priere-unite-rendez-vous", type: "article",
    title: "Semaine de prière pour l'unité : le guide des rendez-vous œcuméniques",
    chapo: "Du 18 au 25 janvier, des célébrations communes sont prévues dans plus de deux cents villes francophones. Mode d'emploi d'une semaine pas comme les autres.",
    body: `Chaque année, la Semaine de prière pour l'unité des chrétiens invite les communautés à prier ensemble, au-delà des frontières confessionnelles. Le thème retenu cette année invite à « marcher ensemble », avec des textes préparés conjointement par des équipes de plusieurs traditions.

Concrètement, la semaine prend des formes variées : vêpres communes, marches silencieuses, petits-déjeuners entre responsables, échanges de chaires le dimanche.

Les organisateurs locaux recommandent aux visiteurs de vérifier les horaires auprès de chaque communauté, et rappellent que toutes les célébrations sont ouvertes à tous, sans condition.

Un livret de prière commun, disponible en téléchargement libre, accompagne chaque journée avec un texte biblique, une intention et une action concrète.`,
    imageUrl: PX(8814994), imageAlt: "Une assemblée en prière derrière une pasteure", imageCredit: "Photo d'illustration : Pavel Danilyuk / Pexels",
    categoryId: C["vie-des-eglises"], authorId: A["la-redaction"], publishedAt: at(-7),
    sources: "Sources : livret de préparation de la Semaine de prière (article de démonstration).",
  });

  /* Brouillons pour l'espace d'administration */
  await insertContent({
    slug: "aumoniers-hopital-reportage", type: "article", status: "draft",
    title: "Dans les couloirs de l'hôpital, le silence habité des aumôniers",
    chapo: "Reportage en préparation auprès de l'équipe d'aumônerie du CHU — en attente de relecture et de validation des citations.",
    body: `Premier jet du reportage. Les entretiens sont retranscrits ; il reste à faire valider les citations par les personnes rencontrées et à vérifier les chiffres de fréquentation de l'aumônerie.`,
    categoryId: C["societe"], authorId: A["david-nguessan"], publishedAt: null,
  });
  await insertContent({
    slug: "jeunes-et-service-enquete", type: "article", status: "review",
    title: "Les jeunes et le service : enquête sur l'engagement des 18-30 ans",
    chapo: "Sondage, entretiens et terrain : notre enquête sur ce qui motive — ou freine — l'engagement des jeunes adultes dans les Églises.",
    body: `Version soumise à relecture. L'éditrice doit vérifier la méthodologie du sondage cité et l'équilibre des témoignages entre zones urbaines et rurales.`,
    categoryId: C["vie-des-eglises"], authorId: A["grace-mbaye"], publishedAt: null,
  });

  /* ----- Enseignements Foi & Bible ----- */
  await insertContent({
    slug: "lire-les-psaumes-quand-les-mots-manquent", type: "enseignement",
    title: "Lire les Psaumes quand les mots nous manquent",
    chapo: "Colère, joie, doute, action de grâce : le psautier est le seul livre de la Bible qui nous donne des mots à dire à Dieu plutôt que des mots de Dieu à écouter. Mode d'emploi.",
    body: `Il y a des jours où la prière ressemble à un écran blanc. On voudrait dire quelque chose à Dieu, mais les mots tournent en rond. C'est précisément là que les Psaumes deviennent précieux : ils sont un vocabulaire prêté.

Le psautier couvre tout le spectre humain. On y trouve l'émerveillement du psaume 8, la détresse du psaume 13 — « Jusques à quand, Éternel ? » —, la confiance du psaume 23 et la colère brute des psaumes dits imprécatoires. Rien de ce que nous traversons n'y est censuré.

Lire un psaume, c'est d'abord le lire lentement, à voix haute si possible. Les images sont concrètes : le rocher, l'eau, le berger, la lampe. Prenez le temps de les voir avant de chercher « la leçon ».

Ensuite, priez-le tel quel. Vous n'êtes pas obligé d'être d'accord avec chaque verset pour le faire vôtre : le psalmiste lui-même se reprend, discute, revient à la confiance. Le mouvement du texte devient le vôtre.

Enfin, gardez une trace. Un verset recopié, une date en marge : au fil des mois, votre psautier devient un journal de marche, où l'on relit ce que l'on croyait impossible de traverser.`,
    verseRef: "Psaume 42, 2", verseText: "Comme une biche soupire après des courants d'eau, ainsi mon âme soupire après toi, ô Dieu !", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: "Les Psaumes pour aujourd'hui",
    imageUrl: PX(15382621), imageAlt: "Une Bible ouverte sur une table en bois, lumière douce", imageCredit: "Photo : Roman Ziomka / Pexels",
    categoryId: C["priere"], authorId: A["samuel-rakoto"], publishedAt: at(-1.5),
  });

  await insertContent({
    slug: "la-grace-ce-que-nous-ne-meritons-pas", type: "enseignement",
    title: "La grâce : ce que nous ne méritons pas",
    chapo: "Le mot le plus employé du vocabulaire chrétien est aussi le plus mal compris. Petit parcours pour retrouver à la grâce son caractère scandaleux.",
    body: `Demandez à dix personnes ce qu'est la grâce, et vous obtiendrez dix variantes de « un coup de pouce divin ». Le Nouveau Testament est plus radical : la grâce n'aide pas les méritants, elle accueille ceux qui ne le sont pas.

Paul le formule sans détour aux Éphésiens : le salut est un don, « afin que personne ne se glorifie ». La logique du don dérange nos réflexes de comptabilité. Nous préférons mériter ; la grâce nous demande de recevoir.

Attention à deux contresens fréquents. La grâce n'est pas un permis de faire n'importe quoi : Paul passe aussitôt aux « bonnes œuvres préparées d'avance ». Et elle n'est pas une récompense déguisée pour les humbles : ce serait encore un mérite.

Dans les évangiles, la grâce a des visages : un collecteur d'impôts invité à dîner, une femme surprise en faute et relevée, un brigand promis au paradis. À chaque fois, quelqu'un s'offusque. C'est peut-être le meilleur test : une grâce qui ne scandalise personne a probablement été édulcorée.

Recevoir la grâce change aussi notre regard sur les autres. Il devient difficile d'exiger d'eux une perfection que nous n'avons pas eu à fournir nous-mêmes.`,
    verseRef: "Éphésiens 2, 8", verseText: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu.", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: "Comprendre la grâce",
    imageUrl: PX(8275630), imageAlt: "Bible ouverte en clair-obscur", imageCredit: "Photo : Orlando Allo / Pexels",
    categoryId: C["questions-de-foi"], authorId: A["samuel-rakoto"], publishedAt: at(-3.5),
  });

  await insertContent({
    slug: "parabole-semeur-quatre-terrains", type: "enseignement",
    title: "La parabole du semeur : quatre terrains, un seul cœur",
    chapo: "Pourquoi Jésus raconte-t-il des histoires ? Plongée dans la plus célèbre de ses paraboles, où chaque auditeur reconnaît un peu de son propre terrain.",
    body: `Un semeur sème partout : le chemin, les cailloux, les ronces, la bonne terre. Première surprise : le semeur est généreux jusqu'à l'imprudence. Aucun agriculteur raisonnable ne gaspillerait ainsi sa semence.

Jésus ne décrit pas quatre catégories de personnes, mais quatre états d'un même cœur. Nous avons tous des zones tassées par l'habitude, des enthousiasmes sans racine, des soucis qui étouffent — et des parcelles où quelque chose pousse vraiment.

Le texte s'adresse d'abord aux disciples découragés par l'accueil mitigé de leur message. La parabole leur dit : la croissance ne dépend pas de votre performance. Semez largement ; le fruit viendra, parfois trente, parfois cent pour un.

Elle pose enfin une question redoutable à l'auditeur : quel terrain suis-je en train de devenir ? Non pas une fois pour toutes, mais cette saison-ci. Les ronces d'aujourd'hui s'appellent peut-être notifications, inquiétudes financières ou ambitions comparatives.

La bonne nouvelle, c'est qu'un terrain se travaille. Bêcher, désherber, laisser reposer : la vie spirituelle a aussi son agriculture.`,
    verseRef: "Matthieu 13, 3", verseText: "Un semeur sortit pour semer.", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: "Sur les pas de Jésus",
    imageUrl: PX(6860381), imageAlt: "Mains prenant des notes sur une Bible ouverte", imageCredit: "Photo : Tima Miroshnichenko / Pexels",
    categoryId: C["bible"], authorId: A["samuel-rakoto"], publishedAt: at(-5.5),
  });

  await insertContent({
    slug: "prier-notre-pere-ligne-a-ligne", type: "enseignement",
    title: "Prier le Notre Père, ligne à ligne",
    chapo: "La prière la plus récitée du monde est aussi la plus structurante. Sept demandes pour réapprendre à prier sans rabâcher.",
    body: `« Notre » : la prière chrétienne commence au pluriel. Même seul dans sa chambre, on prie avec d'autres. « Père » : Jésus autorise une proximité que peu de traditions osaient. Le reste du texte découle de ces deux premiers mots.

« Que ton nom soit sanctifié, que ton règne vienne » : avant de demander quoi que ce soit pour nous, la prière décentre. Elle remet le monde dans le bon ordre — Dieu d'abord, et ce n'est pas une humiliation mais un soulagement.

« Donne-nous aujourd'hui notre pain de ce jour » : le quotidien a droit de cité. Le pain, pas la fortune ; aujourd'hui, pas dans dix ans. La ligne suivante, sur le pardon, est la seule que Jésus commente : recevoir et donner le pardon sont indissociables.

« Ne nous laisse pas entrer en tentation » : la formule a été retravaillée par plusieurs Églises pour lever l'ambiguïté — Dieu ne tend pas de pièges. Il s'agit de demander la traversée, pas l'exemption.

Un exercice simple pour la semaine : prier une seule ligne par jour, en laissant cette phrase habiter les situations concrètes de la journée.`,
    verseRef: "Matthieu 6, 9", verseText: "Voici donc comment vous devez prier : Notre Père qui es aux cieux ! Que ton nom soit sanctifié.", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: "École de prière",
    imageUrl: PX(9589377), imageAlt: "Bible ouverte sur un pupitre avec des cierges allumés", imageCredit: "Photo : cottonbro studio / Pexels",
    categoryId: C["priere"], authorId: A["claire-fontaine"], publishedAt: at(-8),
  });

  await insertContent({
    slug: "repos-qui-resiste-rythme-sabbat", type: "enseignement",
    title: "Le repos qui résiste : retrouver le rythme du sabbat",
    chapo: "Dans une économie de la disponibilité permanente, s'arrêter un jour par semaine est devenu un acte de résistance — et une intuition biblique étonnamment moderne.",
    body: `Le premier repos de la Bible n'est pas le nôtre : c'est celui de Dieu. Le récit de la création s'achève par un arrêt, et le commandement du sabbat en fait un rythme pour tous — y compris les serviteurs et les animaux. Le repos n'était pas un luxe de propriétaire.

Jésus radicalise encore : « Le sabbat est fait pour l'homme, et non l'homme pour le sabbat. » L'arrêt n'est pas une performance religieuse de plus, c'est un cadeau à recevoir.

Concrètement, un sabbat contemporain peut se préparer : prévenir ses proches, poser le téléphone dans un tiroir, prévoir les repas à l'avance. Ce qui paraît rigide au début devient vite une respiration attendue.

Les pratiquants témoignent d'un effet inattendu : le travail des six autres jours s'en trouve clarifié. Ce qui ne tenait pas dans six jours ne tenait souvent pas dans sept non plus — c'était le déni qui tenait lieu d'organisation.

Commencer petit : une demi-journée, un repas sans écran, une marche. Le rythme se construit, il ne se décrète pas.`,
    verseRef: "Exode 20, 8", verseText: "Souviens-toi du jour du repos, pour le sanctifier.", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: null,
    imageUrl: PX(10438600), imageAlt: "Bible ouverte avec bougie et feuillage, ambiance paisible", imageCredit: "Photo : Denis Gvozdov / Pexels",
    categoryId: C["vie-chretienne"], authorId: A["claire-fontaine"], publishedAt: at(-10),
  });

  await insertContent({
    slug: "quatre-evangiles-meme-histoire", type: "enseignement",
    title: "Pourquoi les quatre Évangiles racontent la même histoire différemment",
    chapo: "Deux généalogies différentes, des miracles déplacés, des paroles variant d'un auteur à l'autre : et si ces différences étaient une richesse plutôt qu'un problème ?",
    body: `Quatre évangiles, c'est trois de trop — l'argument est ancien, et il mérite mieux qu'un haussement d'épaules. Les premières communautés ont choisi de garder quatre récits alors même que des harmonisations existaient. C'est un choix théologique délibéré.

Chaque évangéliste écrit pour une communauté, avec une question. Matthieu relie Jésus aux Écritures d'Israël ; Marc va droit au but, dans l'urgence ; Luc soigne l'universel et les petits ; Jean prend le temps de la contemplation.

Les différences de détail sont celles de tout témoignage honnête : quatre témoins d'un même événement ne racontent jamais mot pour mot la même scène. Les historiens y voient un signe de sources indépendantes, pas de concertation.

Lire les évangiles « en colonnes », comme on compare quatre journaux, est un excellent exercice. On y découvre ce que chaque auteur souligne — et donc ce qu'il veut nous faire comprendre.

L'unité n'est pas dans l'uniformité du récit, mais dans la personne vers laquelle les quatre convergent.`,
    verseRef: "Jean 20, 31", verseText: "Mais ces choses ont été écrites afin que vous croyiez que Jésus est le Christ, le Fils de Dieu, et qu'en croyant vous ayez la vie en son nom.", verseTranslation: "Louis Segond 1910 (domaine public)",
    series: "Sur les pas de Jésus",
    imageUrl: PX(9446065), imageAlt: "Une personne annote une Bible en étudiant", imageCredit: "Photo : Andrew Dibble / Pexels",
    categoryId: C["bible"], authorId: A["samuel-rakoto"], publishedAt: at(-12),
  });

  /* ----- Méditations ----- */
  const med = async (slug: string, title: string, chapo: string, body: string, prayer: string, verseRef: string, verseText: string, img: number, dayOffset: number, scheduled = false) =>
    insertContent({
      slug, type: "meditation", title, chapo, body, prayer, verseRef, verseText,
      verseTranslation: "Louis Segond 1910 (domaine public)",
      imageUrl: PX(img), imageAlt: "Lumière du matin sur un paysage paisible", imageCredit: "Photo : Pexels",
      categoryId: C["priere"], authorId: A["claire-fontaine"],
      status: scheduled ? "scheduled" : "published",
      publishedAt: scheduled ? at(dayOffset, 6) : at(dayOffset, 6),
    });

  await med("une-lampe-pour-aujourd-hui", "Une lampe pour aujourd'hui",
    "La parole de Dieu n'éclaire pas toute la route d'un coup. Elle éclaire le prochain pas — et c'est suffisant pour marcher.",
    `Nous aimerions des projecteurs : voir la semaine, l'année, la décennie. Le psaume promet une lampe — celles qui s'accrochent à la ceinture et n'éclairent que deux ou trois mètres devant soi.

C'est frustrant, et c'est miséricordieux. Deux ou trois mètres, c'est la décision d'aujourd'hui, l'appel à passer, le pardon à demander ce soir. Le reste de la route existe, mais il ne nous appartient pas encore.

Demandez-vous ce matin : quel est le prochain pas éclairé ? Pas le dixième. Le premier.`,
    "Seigneur, apprends-moi à marcher à ta lumière, un pas à la fois. Garde-moi de l'impatience qui trébuche et de la peur qui s'arrête. Amen.",
    "Psaume 119, 105", "Ta parole est une lampe à mes pieds, et une lumière sur mon sentier.", 7273, 0);

  await med("le-souci-depose", "Le souci déposé",
    "Pierre ne nous demande pas de ne plus avoir de soucis. Il nous propose un endroit où les poser.",
    `« Déchargez-vous » : le verbe évoque un fardeau que l'on jette sur une autre épaule. Le texte ne dit pas que le souci est imaginaire, ni qu'il est mal d'en avoir. Il dit qu'il existe une épaule plus large.

Nous confondons souvent porter et contrôler. Porter, c'est faire sa part aujourd'hui. Contrôler, c'est rejouer la nuit des scénarios auxquels nous ne pouvons rien.

Ce matin, nommez votre souci à voix haute. Puis faites le geste intérieur de le déposer — et reprenez uniquement la part qui vous revient.`,
    "Père, je te remets ce qui pèse trop lourd pour moi. Donne-moi de faire ma part avec courage, et de te laisser la tienne. Amen.",
    "1 Pierre 5, 7", "Déchargez-vous sur lui de tous vos soucis, car lui-même prend soin de vous.", 1215591, -1);

  await med("la-force-tranquille", "La force tranquille",
    "Ésaïe renverse nos intuitions : la force ne vient pas de l'agitation, mais du calme et de la confiance.",
    `Nous admirons ceux qui s'agitent avec assurance. Le prophète, lui, annonce une force qui ressemble à un lac au matin : le calme, la confiance, le repos.

Ce n'est pas de la passivité. C'est l'énergie de celui qui n'a plus besoin de tout tenir. Le chirurgien le plus précis n'est pas le plus nerveux ; la main ferme est une main posée.

Aujourd'hui, avant chaque décision importante, prenez trois respirations. Demandez : est-ce que je décide par force, ou par peur ?`,
    "Dieu tranquille, ralentis mon cœur. Que mes gestes d'aujourd'hui naissent de la confiance et non de la panique. Amen.",
    "Ésaïe 30, 15", "C'est dans le calme et la confiance que sera votre force.", 11834006, -2);

  await med("renouveles-chaque-matin", "Renouvelés chaque matin",
    "Les bontés de Dieu ne sont pas un stock qui s'épuise. Elles sont une source qui se lève avec le jour.",
    `L'auteur des Lamentations écrit au milieu des ruines. Ce n'est pas un optimiste de salon : il a tout vu brûler. Et c'est lui qui ose : « Elles se renouvellent chaque matin. »

Hier a pu être un échec, une dispute, une rechute. Le texte ne le nie pas. Il affirme simplement que la provision d'aujourd'hui n'est pas celle d'hier, resservie en plus petit.

Au réveil, avant les notifications, ouvrez la fenêtre. Ce qui se lève n'est pas seulement le soleil.`,
    "Merci pour ce matin neuf. Je reçois tes bontés d'aujourd'hui sans les mesurer à mes mérites d'hier. Amen.",
    "Lamentations 3, 22-23", "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme ; elles se renouvellent chaque matin.", 19248218, -3);

  await med("demeurer-dans-la-vigne", "Demeurer dans la vigne",
    "Le sarment ne fabrique pas le fruit : il le laisse venir en restant attaché. Et nous ?",
    `« Demeurer » revient sept fois dans quelques versets. À force, on comprend que c'est le verbe central — pas produire, pas réussir : demeurer.

Nous savons faire beaucoup de choses pour Dieu. Savons-nous rester avec lui ? Le sarment coupé reste vert quelques heures ; c'est ce qui rend le diagnostic difficile. La sève, elle, est déjà partie.

Demeurer a des formes simples : un psaume le matin, une reconnaissance le soir, le refus de remplir chaque silence. Le fruit viendra par surcroît.`,
    "Jésus, vrai cep, garde-moi attaché à toi aujourd'hui. Que je cherche d'abord ta présence, et le fruit suivra. Amen.",
    "Jean 15, 5", "Je suis le cep, vous êtes les sarments. Celui qui demeure en moi et en qui je demeure porte beaucoup de fruit, car sans moi vous ne pouvez rien faire.", 10438600, -4);

  await med("marcher-humblement", "Marcher humblement",
    "Michée résume toute la Torah en trois verbes : pratiquer, aimer, marcher. Le troisième est le plus difficile.",
    `On t'a fait connaître ce qui est bien. Pas un secret, pas une énigme : la justice à pratiquer, la miséricorde à aimer, l'humilité pour marcher avec Dieu.

Pratiquer la justice, c'est concret : le salaire juste, la parole tenue, la place laissée à l'autre. Aimer la miséricorde, c'est plus rare — beaucoup la pratiquent à contrecœur ; peu l'aiment.

Marcher humblement, enfin, c'est accepter le rythme de l'accompagnement. Ni devant pour tout décider, ni derrière pour se désengager : avec.`,
    "Seigneur, donne-moi la justice dans les mains, la miséricorde dans le cœur, et l'humilité dans les pas. Amen.",
    "Michée 6, 8", "On t'a fait connaître, ô homme, ce qui est bien ; et ce que l'Éternel demande de toi, c'est que tu pratiques la justice, que tu aimes la miséricorde, et que tu marches humblement avec ton Dieu.", 15382621, 2, true);

  /* ----- Témoignages ----- */
  const [temoin1] = await insertContent({
    slug: "de-l-angoisse-a-la-paix-marianne", type: "temoignage", format: "texte",
    title: "« J'ai cessé de croire que je devais tout tenir » — le parcours de Marianne",
    chapo: "Cadre commerciale, mère de deux enfants, Marianne a vécu l'angoisse comme une seconde peau. Elle raconte comment une communauté et quelques psaumes ont changé son rapport au contrôle.",
    body: `« Sur les photos, je souris. C'est important de le dire, parce que l'angoisse n'a pas de visage. Pendant trois ans, j'ai fonctionné : réunions, devoirs, courses. Et la nuit, je faisais des listes. Des listes de catastrophes possibles, classées par probabilité. »

Marianne a d'abord consulté. « Il ne faut pas opposer la foi et le soin. Mon médecin m'a outillée, une thérapeute m'a appris à respirer, et ma communauté m'a portée. Les trois ensemble. »

Le déclic spirituel est venu d'une phrase entendue lors d'un culte : « Tu n'es pas le saint-Esprit de tes enfants. » Elle rit encore en la racontant. « J'ai compris que je m'étais attribué un poste que Dieu ne m'avait pas donné : directrice générale de l'univers. »

Aujourd'hui, les listes existent toujours, mais elles ont changé de format. « Chaque soir, j'écris trois choses que je remets et une chose que je ferai demain. Le reste appartient à plus compétent que moi. »

Marianne tient à préciser : « Je ne vais pas mieux parce que je crois mieux. Je vais mieux parce que j'ai accepté d'être aidée. C'est peut-être ça, la foi. »`,
    imageUrl: PX(7520771, 800, 1200), imageAlt: "Portrait souriant de Marianne, en lumière naturelle", imageCredit: "Photo d'illustration : cottonbro studio / Pexels — publiée avec l'accord de la personne",
    authorId: A["grace-mbaye"], publishedAt: at(-3),
    consentNote: "Témoignage recueilli et relu avec Marianne, publié avec son accord écrit. Prénom réel conservé à sa demande.",
  });

  await insertContent({
    slug: "reconstruit-apres-la-prison", type: "temoignage", format: "texte", anonymized: true,
    title: "Reconstruit après la prison : la deuxième peine, c'est le regard des autres",
    chapo: "À sa sortie de détention, « Thomas » a trouvé un logement, un travail — et une solitude immense. Jusqu'au jour où une église lui a confié des clés.",
    body: `« La prison m'avait préparé à tout sauf à une chose : être libre et ne servir à rien. Les premiers mois, je rentrais du travail, je fermais la porte, et je regardais le mur. Personne ne m'attendait nulle part. »

Thomas a poussé la porte d'une église un dimanche, par hasard, pour la chaleur. « Le café était mauvais. Je suis resté quatre ans. » Ce qu'il a trouvé, ce n'est pas des questions sur son passé, mais des tâches : porter des chaises, réparer une gouttière, conduire un vieux monsieur au marché.

« Le jour où le pasteur m'a donné les clés du local pour ouvrir le mercredi, j'ai pleuré dans ma voiture. Des clés. On m'avait rendu quelque chose à ouvrir, au lieu de quelque chose à fermer. »

Aujourd'hui, Thomas accompagne d'autres sortants de détention, avec l'aumônerie qui l'avait visité. « Je ne raconte pas mon histoire pour qu'on me plaigne. Je la raconte parce qu'un type, quelque part, croit qu'après la prison il n'y a que le mur. »`,
    imageUrl: PX(2233066, 800, 1200), imageAlt: "Portrait en noir et blanc d'un homme souriant", imageCredit: "Photo d'illustration : Daniel Tijesuni / Pexels — la personne a choisi l'anonymat",
    authorId: A["la-redaction"], publishedAt: at(-8),
    consentNote: "Prénom modifié à la demande du témoin. Récit relu et validé avec lui avant publication ; aucun détail permettant l'identification n'a été conservé.",
  });

  await insertContent({
    slug: "chorale-retrouver-souffle", type: "temoignage", format: "video",
    title: "Une chorale pour retrouver souffle — et voix",
    chapo: "Après un burn-out, Nadia ne supportait plus le bruit. C'est paradoxalement en chantant avec trente autres qu'elle a réappris à habiter le silence.",
    body: `« Au début, je venais m'asseoir au fond, sans chanter. La cheffe de chœur m'a dit : ta place compte même quand tu te tais. Personne ne m'avait dit ça depuis un an. »

Dans cette vidéo, Nadia raconte sa lente remontée : les premières notes murmurées, le trac du premier concert, et ce qu'elle appelle « le miracle du mercredi soir » — deux heures où son téléphone et ses urgences restent dans le sac.

La chorale, elle, ne se voyait pas comme un lieu de soin. « On fait de la musique, pas de la thérapie, sourit la cheffe. Mais chanter ensemble, c'est déjà réparer quelque chose. »

Le témoignage de Nadia est suivi d'un temps de louange capté lors du festival Louange & Espérance.`,
    imageUrl: PX(34328505), imageAlt: "Assemblée en louange, lumières colorées et croix en scène", imageCredit: "Photo : Caleb Oquendo / Pexels",
    mediaUrl: "nQWFzMvCfLE",
    authorId: A["david-nguessan"], publishedAt: at(-12),
    consentNote: "Témoignage vidéo publié avec l'accord de Nadia (prénom d'usage). Séquence de louange : chaîne officielle Hillsong Worship, présentée à titre d'extrait autorisé du lecteur.",
  });

  await insertContent({
    slug: "trois-minutes-avec-esther", type: "temoignage", format: "audio",
    title: "Trois minutes avec Esther : « La prière m'a appris à dire non »",
    chapo: "Infirmière de nuit, Esther priait surtout pour tenir. Elle a découvert qu'elle pouvait aussi prier pour poser des limites.",
    body: `Dans cet épisode enregistré par téléphone, Esther raconte son métier d'infirmière de nuit, la culpabilité de dire non, et la phrase d'une collègue qui a tout changé : « Tu n'es pas la provision de Dieu pour tout le monde. »

« Je priais : Seigneur, donne-moi la force. Un jour j'ai osé prier : Seigneur, montre-moi ce qui n'est pas à moi. La liste était longue. »

Esther continue les nuits, mais elle a appris à protéger ses jours. « Mes patients n'ont pas besoin d'une infirmière épuisée qui les aime. Ils ont besoin d'une infirmière reposée qui les soigne. »

Un format court, à écouter au casque, entre deux trajets.`,
    imageUrl: PX(12895422, 800, 1200), imageAlt: "Portrait en noir et blanc d'une femme souriante à Lagos", imageCredit: "Photo d'illustration : Chigozie Onyeche / Pexels",
    mediaUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    authorId: A["claire-fontaine"], publishedAt: at(-18),
    consentNote: "Enregistrement publié avec l'accord d'Esther. Extrait sonore de démonstration (piste instrumentale libre) en attendant la mise en ligne de l'entretien.",
  });

  /* ----- Émissions & épisodes ----- */
  const [showLouange] = await db.insert(s.shows).values({
    slug: "louange-et-esperance-sessions", title: "Louange & Espérance — Sessions", kind: "video",
    host: "Présenté par David N'Guessan", coverUrl: PX(34328517),
    description: "La rédaction sélectionne des chants de louange qui ont marqué la francophonie, présentés avec leur chaîne officielle. Chaque session est introduite par quelques minutes de contexte : l'histoire du chant, son texte, et ce qu'il dit de l'espérance chrétienne.",
  }).returning();

  const [showGrain] = await db.insert(s.shows).values({
    slug: "le-grain-de-seneve", title: "Le grain de sénevé", kind: "podcast",
    host: "Présenté par Claire Fontaine", coverUrl: PX(10933702),
    description: "Un podcast de méditation courte : dix minutes, un texte biblique, une question pour la journée. Enregistré chaque matin, pensé pour les trajets, la vaisselle et les pauses café.",
  }).returning();

  await db.insert(s.episodes).values([
    {
      showId: showLouange.id, slug: "what-a-beautiful-name-session", title: "« What A Beautiful Name » — la session qui a fait chanter le monde",
      summary: "L'histoire du chant de Hillsong Worship, sa progression théologique du Nom vers l'Agneau, et la session live qui a dépassé le demi-milliard de vues. Lecture intégrale sur la chaîne officielle.",
      duration: "5 min", publishedAt: at(-2), thumbnailUrl: PX(36425621), youtubeId: "nQWFzMvCfLE",
      credit: "Vidéo : Hillsong Worship — chaîne officielle YouTube. Lecteur intégré sans lecture automatique.",
      transcript: "Introduction de la rédaction (2 min) : genèse du chant en 2016, structure en deux mouvements — la révélation du Nom, puis la victoire de l'Agneau — suivie de la session live officielle (5 min).",
    },
    {
      showId: showLouange.id, slug: "oceans-la-confiance-en-eaux-profondes", title: "« Oceans » — chanter la confiance en eaux profondes",
      summary: "Pourquoi ce chant sur Pierre marchant sur l'eau est devenu l'un des plus repris au monde ? Décryptage du texte, portée de l'image des « océans », et session officielle de Hillsong UNITED.",
      duration: "9 min", publishedAt: at(-9), thumbnailUrl: PX(36425622), youtubeId: "dy9nwe9_xzw",
      credit: "Vidéo : Hillsong UNITED — chaîne officielle YouTube. Lecteur intégré sans lecture automatique.",
      transcript: "Introduction de la rédaction (3 min) : le récit de Matthieu 14, la métaphore des eaux profondes, les critiques et la justesse de l'image — suivie de la session officielle (9 min).",
    },
    {
      showId: showGrain.id, slug: "grain-seneve-ep-12-commencer-petit", title: "Ép. 12 — Commencer petit",
      summary: "Le Royaume comparé à la plus petite des graines : pourquoi nos commencements modestes ne sont pas des échecs. Dix minutes pour cesser de mépriser les petits débuts.",
      duration: "10 min", publishedAt: at(-1), thumbnailUrl: PX(36357088),
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      credit: "Extrait sonore de démonstration (piste libre SoundHelix) en attendant l'audio de l'épisode.",
      transcript: "Texte : Marc 4, 30-32 (LSG 1910). Claire médite la parabole du grain de sénevé : la disproportion entre la graine et l'arbre, le temps caché de la germination, et la question du jour : « Quelle petite chose fidèle puis-je commencer aujourd'hui, sans témoin ? »",
    },
    {
      showId: showGrain.id, slug: "grain-seneve-ep-11-le-bruit-et-le-murmure", title: "Ép. 11 — Le bruit et le murmure",
      summary: "Élie attend Dieu dans le vent, le tremblement de terre, le feu — et le trouve dans un murmure. Apprendre à baisser le volume du monde.",
      duration: "9 min", publishedAt: at(-4), thumbnailUrl: PX(38125420),
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      credit: "Extrait sonore de démonstration (piste libre SoundHelix) en attendant l'audio de l'épisode.",
      transcript: "Texte : 1 Rois 19, 11-13 (LSG 1910). Le récit de l'Horeb, la pédagogie du « son fin et léger », et un exercice pratique de trois minutes de silence habité.",
    },
    {
      showId: showGrain.id, slug: "grain-seneve-ep-10-les-mains-ouvertes", title: "Ép. 10 — Les mains ouvertes",
      summary: "On ne reçoit rien avec les poings fermés. Une méditation sur la générosité, le contrôle et l'art de tenir les choses sans les serrer.",
      duration: "11 min", publishedAt: at(-7), thumbnailUrl: PX(11449473),
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      credit: "Extrait sonore de démonstration (piste libre SoundHelix) en attendant l'audio de l'épisode.",
      transcript: "Texte : Psaume 145, 16 (LSG 1910). Claire explore le geste des mains ouvertes : recevoir, donner, lâcher. Question du jour : « Qu'est-ce que je serre trop fort en ce moment ? »",
    },
  ]);

  /* ----- Événements ----- */
  await db.insert(s.events).values([
    {
      slug: "soiree-louange-ouverte-paris", title: "Soirée louange ouverte « Chantez ! »",
      description: "Une soirée de louange intergénérationnelle ouverte à tous, avec les équipes de trois communautés du centre de Paris. Entrée libre, offrande au profit de l'accueil de nuit.",
      startsAt: at(10, 19), location: "Temple du Marais, 17 rue Saint-Antoine", city: "Paris",
      organizer: "Association Louange & Espérance", registrationEmail: "inscription@louange-esperance.example",
    },
    {
      slug: "formation-accompagner-bible-en-ligne", title: "Formation en ligne : accompagner avec la Bible",
      description: "Quatre sessions en visioconférence pour les responsables de petits groupes : écoute, questions ouvertes, références bibliques et limites de l'accompagnement. Supports fournis.",
      startsAt: at(24, 18), location: "Visioconférence (lien envoyé après inscription)", city: "En ligne", isOnline: true,
      organizer: "Institut de formation francophone", registrationEmail: "formation@iff.example",
    },
    {
      slug: "rencontre-chorales-regionales", title: "Rencontre des chorales régionales",
      description: "La rencontre est annulée en raison de l'indisponibilité de la salle. Les organisateurs étudient une nouvelle date ; les inscriptions seront transférées.",
      startsAt: at(18, 14), location: "Espace musical Saint-Cécile", city: "Lyon",
      organizer: "Fédération des chorales", status: "cancelled", registrationEmail: "contact@chorales.example",
    },
    {
      slug: "collecte-solidaire-hiver", title: "Grande collecte solidaire d'hiver",
      description: "Collecte de manteaux, couvertures et produits d'hygiène au profit des distributions de nuit. Merci aux 84 bénévoles et aux douze points de dépôt partenaires.",
      startsAt: at(-12, 9), location: "Douze points de dépôt en ville", city: "Abidjan",
      organizer: "Collectif diaconie d'Abidjan", isOrganizerOurs: false,
    },
  ]);

  /* ----- Messages ----- */
  await db.insert(s.messages).values([
    {
      kind: "contact", name: "Aïcha K.", email: "aicha.k@example.org", subject: "Question sur les sources d'un article",
      body: "Bonjour, votre article sur les épiceries solidaires cite une hausse de 30 % des publics. Pourriez-vous préciser la période et la source ? Je prépare un exposé pour notre groupe de jeunes. Merci !",
      status: "new", createdAt: at(-0.8),
    },
    {
      kind: "temoignage", name: "Marc-Olivier T.", email: "mo.t@example.org", subject: "Proposition de témoignage — réconciliation familiale",
      body: "Après douze ans de silence, mon père et moi nous sommes retrouvés grâce à un verset lu ensemble presque par hasard. Je souhaite raconter ce chemin, avec l'accord de mon père. Je préfère d'abord en parler à la rédaction avant toute publication.",
      consent: true, format: "texte", status: "new", createdAt: at(-1.5),
    },
    {
      kind: "contact", name: "Église de la Plaine", email: "accueil@plaine.example", subject: "Annonce d'un concert caritatif",
      body: "Nous organisons un concert caritatif le mois prochain et souhaiterions qu'il figure dans votre agenda. Comment procéder ?",
      status: "read", createdAt: at(-4),
    },
  ]);

  /* ----- Newsletter ----- */
  await db.insert(s.subscribers).values([
    { email: "lectrice@example.org", status: "confirmed", token: randomUUID(), confirmedAt: at(-20), createdAt: at(-20) },
    { email: "pasteur.b@example.org", status: "confirmed", token: randomUUID(), confirmedAt: at(-11), createdAt: at(-11) },
    { email: "nouveau.lecteur@example.org", status: "pending", token: randomUUID(), createdAt: at(-0.3) },
  ]);

  /* ----- Comptes ----- */
  const hash = hashPassword("Flamme!2026");
  await db.insert(s.users).values([
    { email: "admin@paroles-inspirees.org", name: "Grâce Mbaye", role: "admin", passwordHash: hash },
    { email: "s.rakoto@paroles-inspirees.org", name: "Samuel Rakoto", role: "editor", passwordHash: hash },
    { email: "d.nguessan@paroles-inspirees.org", name: "David N'Guessan", role: "redacteur", passwordHash: hash },
  ]);

  /* ----- Réglages accueil ----- */
  await db.insert(s.settings).values([
    { key: "featured_id", value: String(une.id) },
    { key: "featured_testimony_id", value: String(temoin1.id) },
    { key: "home_sections", value: JSON.stringify([
      { id: "articles", visible: true },
      { id: "foi", visible: true },
      { id: "medias", visible: true },
      { id: "temoignage", visible: true },
      { id: "evenements", visible: true },
    ]) },
  ]);

  console.log("Seed terminé ✔");
  await pool.end();
}

main().catch((e) => { console.error(e); process.exit(1); });