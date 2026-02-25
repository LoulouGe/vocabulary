
const themes = {
    "La maison": [
        { english: "Table", french: "Table", hintEn: "A flat surface with legs, for eating or working", hintFr: "Surface plate avec des pieds, pour manger ou travailler" },
        { english: "Chair", french: "Chaise", hintEn: "A seat with a back, for one person", hintFr: "Un siège avec un dossier, pour une personne" },
        { english: "Window", french: "Fenêtre", hintEn: "An opening in a wall with glass, to see outside", hintFr: "Une ouverture dans un mur avec du verre, pour voir dehors" },
        { english: "Bed", french: "Lit", hintEn: "Where you sleep at night", hintFr: "Là où tu dors la nuit" },
        { english: "Door", french: "Porte", hintEn: "You open it to enter or leave a room", hintFr: "Tu l'ouvres pour entrer ou sortir d'une pièce" },
        { english: "Kitchen", french: "Cuisine", hintEn: "The room where you cook food", hintFr: "La pièce où on prépare les repas" },
        { english: "Bathroom", french: "Salle de bain", hintEn: "The room with a shower or bathtub", hintFr: "La pièce avec une douche ou une baignoire" },
        { english: "Garden", french: "Jardin", hintEn: "An outdoor area with plants and flowers", hintFr: "Un espace extérieur avec des plantes et des fleurs" },
        { english: "Roof", french: "Toit", hintEn: "The top part of a house that protects from rain", hintFr: "La partie en haut de la maison qui protège de la pluie" },
        { english: "Wall", french: "Mur", hintEn: "A vertical surface that separates rooms", hintFr: "Une surface verticale qui sépare les pièces" },
        { english: "Floor", french: "Sol", hintEn: "The surface you walk on inside a room", hintFr: "La surface sur laquelle tu marches dans une pièce" },
        { english: "Stairs", french: "Escalier", hintEn: "Steps that go up or down between floors", hintFr: "Des marches pour monter ou descendre entre les étages" },
    ],
    "La nourriture": [
        { english: "Apple", french: "Pomme", hintEn: "A round fruit, often red or green", hintFr: "Un fruit rond, souvent rouge ou vert" },
        { english: "Bread", french: "Pain", hintEn: "Made with flour, you eat it every day", hintFr: "Fait avec de la farine, on en mange tous les jours" },
        { english: "Cheese", french: "Fromage", hintEn: "Made from milk, often yellow", hintFr: "Fait avec du lait, souvent jaune" },
        { english: "Cake", french: "Gâteau", hintEn: "A sweet dessert for birthdays", hintFr: "Un dessert sucré pour les anniversaires" },
        { english: "Milk", french: "Lait", hintEn: "A white drink that comes from cows", hintFr: "Une boisson blanche qui vient des vaches" },
        { english: "Water", french: "Eau", hintEn: "A clear liquid you drink every day", hintFr: "Un liquide transparent que tu bois chaque jour" },
        { english: "Chicken", french: "Poulet", hintEn: "A bird you can eat, very common meat", hintFr: "Un oiseau que l'on mange, une viande très courante" },
        { english: "Rice", french: "Riz", hintEn: "Small white grains, eaten a lot in Asia", hintFr: "Petits grains blancs, très mangés en Asie" },
        { english: "Salad", french: "Salade", hintEn: "A dish with lettuce and vegetables", hintFr: "Un plat avec de la laitue et des légumes" },
        { english: "Butter", french: "Beurre", hintEn: "A yellow spread made from cream", hintFr: "Une pâte jaune faite à partir de crème" },
        { english: "Egg", french: "Oeuf", hintEn: "It comes from a hen, with a shell", hintFr: "Il vient de la poule, avec une coquille" },
        { english: "Sugar", french: "Sucre", hintEn: "A sweet white powder for tea or coffee", hintFr: "Une poudre blanche et sucrée pour le thé ou le café" },
    ],
    "Les animaux": [
        { english: "Dog", french: "Chien", hintEn: "A pet that barks and wags its tail", hintFr: "Un animal qui aboie et remue la queue" },
        { english: "Cat", french: "Chat", hintEn: "A pet that purrs and catches mice", hintFr: "Un animal qui ronronne et attrape les souris" },
        { english: "Bird", french: "Oiseau", hintEn: "An animal with wings that can fly", hintFr: "Un animal avec des ailes qui peut voler" },
        { english: "Fish", french: "Poisson", hintEn: "An animal that lives in water", hintFr: "Un animal qui vit dans l'eau" },
        { english: "Horse", french: "Cheval", hintEn: "A large animal you can ride", hintFr: "Un grand animal que l'on peut monter" },
        { english: "Rabbit", french: "Lapin", hintEn: "A small animal with long ears that hops", hintFr: "Un petit animal avec de longues oreilles qui saute" },
        { english: "Mouse", french: "Souris", hintEn: "A very small animal that likes cheese", hintFr: "Un très petit animal qui aime le fromage" },
        { english: "Cow", french: "Vache", hintEn: "A large farm animal that gives milk", hintFr: "Un grand animal de ferme qui donne du lait" },
        { english: "Pig", french: "Cochon", hintEn: "A pink farm animal that loves mud", hintFr: "Un animal de ferme rose qui aime la boue" },
        { english: "Sheep", french: "Mouton", hintEn: "A farm animal with soft white wool", hintFr: "Un animal de ferme avec de la laine blanche" },
        { english: "Duck", french: "Canard", hintEn: "A bird that swims and says 'quack'", hintFr: "Un oiseau qui nage et fait 'coin coin'" },
        { english: "Frog", french: "Grenouille", hintEn: "A small green animal that jumps near water", hintFr: "Un petit animal vert qui saute près de l'eau" },
    ],
    "La nature": [
        { english: "Sun", french: "Soleil", hintEn: "The big yellow star in the sky during the day", hintFr: "La grande étoile jaune dans le ciel pendant la journée" },
        { english: "Moon", french: "Lune", hintEn: "You can see it in the sky at night", hintFr: "On la voit dans le ciel la nuit" },
        { english: "Star", french: "Étoile", hintEn: "A small shining point in the night sky", hintFr: "Un petit point brillant dans le ciel la nuit" },
        { english: "Cloud", french: "Nuage", hintEn: "A white or grey shape in the sky", hintFr: "Une forme blanche ou grise dans le ciel" },
        { english: "Rain", french: "Pluie", hintEn: "Water that falls from the sky", hintFr: "De l'eau qui tombe du ciel" },
        { english: "Tree", french: "Arbre", hintEn: "A tall plant with a trunk and leaves", hintFr: "Une grande plante avec un tronc et des feuilles" },
        { english: "Flower", french: "Fleur", hintEn: "A colorful plant that smells nice", hintFr: "Une plante colorée qui sent bon" },
        { english: "River", french: "Rivière", hintEn: "A long flow of water through the land", hintFr: "Un long cours d'eau à travers la terre" },
        { english: "Mountain", french: "Montagne", hintEn: "A very high piece of land, with snow on top", hintFr: "Un terrain très élevé, avec de la neige au sommet" },
        { english: "Sea", french: "Mer", hintEn: "A large area of salty water", hintFr: "Une grande étendue d'eau salée" },
        { english: "Snow", french: "Neige", hintEn: "White and cold, it falls in winter", hintFr: "Blanc et froid, ça tombe en hiver" },
        { english: "Wind", french: "Vent", hintEn: "Moving air you can feel but not see", hintFr: "De l'air qui bouge, qu'on sent mais qu'on ne voit pas" },
    ],
    "L'école": [
        { english: "Book", french: "Livre", hintEn: "You read it, it has pages", hintFr: "Tu le lis, il a des pages" },
        { english: "School", french: "École", hintEn: "A place where children go to learn", hintFr: "Un endroit où les enfants vont pour apprendre" },
        { english: "Pen", french: "Stylo", hintEn: "You write with it, it uses ink", hintFr: "Tu écris avec, il utilise de l'encre" },
        { english: "Pencil", french: "Crayon", hintEn: "You write with it, you can erase it", hintFr: "Tu écris avec, tu peux effacer" },
        { english: "Teacher", french: "Professeur", hintEn: "A person who teaches in a school", hintFr: "Une personne qui enseigne à l'école" },
        { english: "Student", french: "Élève", hintEn: "A person who learns in a school", hintFr: "Une personne qui apprend à l'école" },
        { english: "Desk", french: "Bureau", hintEn: "A table where you work or study", hintFr: "Une table où tu travailles ou étudies" },
        { english: "Homework", french: "Devoirs", hintEn: "School work you do at home", hintFr: "Du travail scolaire que tu fais à la maison" },
        { english: "Lesson", french: "Leçon", hintEn: "A period of learning in class", hintFr: "Un moment d'apprentissage en classe" },
        { english: "Notebook", french: "Cahier", hintEn: "A book with empty pages for writing", hintFr: "Un livre avec des pages vides pour écrire" },
        { english: "Blackboard", french: "Tableau", hintEn: "A large dark board the teacher writes on", hintFr: "Un grand tableau sombre sur lequel le professeur écrit" },
        { english: "Bag", french: "Sac", hintEn: "You carry your things in it", hintFr: "Tu transportes tes affaires dedans" },
    ],
    "Les vêtements": [
        { english: "Shirt", french: "Chemise", hintEn: "You wear it on your upper body, with buttons", hintFr: "Tu le portes sur le haut du corps, avec des boutons" },
        { english: "Dress", french: "Robe", hintEn: "A one-piece clothing, often worn by girls", hintFr: "Un vêtement d'une seule pièce, souvent porté par les filles" },
        { english: "Shoes", french: "Chaussures", hintEn: "You wear them on your feet to walk", hintFr: "Tu les portes aux pieds pour marcher" },
        { english: "Hat", french: "Chapeau", hintEn: "You wear it on your head", hintFr: "Tu le portes sur la tête" },
        { english: "Coat", french: "Manteau", hintEn: "A warm piece of clothing for cold weather", hintFr: "Un vêtement chaud pour le froid" },
        { english: "Pants", french: "Pantalon", hintEn: "Clothing for your legs, with two holes", hintFr: "Vêtement pour les jambes, avec deux trous" },
        { english: "Socks", french: "Chaussettes", hintEn: "You wear them on your feet, inside shoes", hintFr: "Tu les portes aux pieds, dans les chaussures" },
        { english: "Gloves", french: "Gants", hintEn: "You wear them on your hands when it's cold", hintFr: "Tu les portes aux mains quand il fait froid" },
        { english: "Scarf", french: "Écharpe", hintEn: "You wrap it around your neck in winter", hintFr: "Tu l'enroules autour du cou en hiver" },
        { english: "Skirt", french: "Jupe", hintEn: "A piece of clothing that hangs from the waist", hintFr: "Un vêtement qui pend à partir de la taille" },
        { english: "Sweater", french: "Pull", hintEn: "A warm knitted top for cold days", hintFr: "Un haut en maille chaud pour les jours froids" },
        { english: "Jacket", french: "Veste", hintEn: "A light coat you wear outside", hintFr: "Un manteau léger que tu portes dehors" },
    ],
};

const ROUND_SIZE = 10;
const MATCH_SIZE = 5;

let words = [];
let currentIndex = 0;
let score = 0;
let roundWords = [];
let roundOver = false;
let waitingNext = false;
let attempts = 0;

// Éléments du DOM
const setupScreen = document.getElementById('setup-screen');
const wordListInput = document.getElementById('word-list-input');
const startCustomBtn = document.getElementById('start-custom-btn');
const themeGrid = document.getElementById('theme-grid');

const modeScreen = document.getElementById('mode-screen');
const modeQuizBtn = document.getElementById('mode-quiz-btn');
const modeMatchBtn = document.getElementById('mode-match-btn');
const backToSetupBtn = document.getElementById('back-to-setup-btn');

const quizArea = document.getElementById('quiz-area');
const wordDisplay = document.getElementById('word-to-translate');
const userInput = document.getElementById('user-input');
const checkBtn = document.getElementById('check-btn');
const feedback = document.getElementById('feedback');
const scoreDisplay = document.getElementById('score');
const totalDisplay = document.getElementById('total');
const instruction = document.getElementById('instruction');
const progress = document.getElementById('progress');
const endButtons = document.getElementById('end-buttons');
const replayBtn = document.getElementById('replay-btn');
const menuBtn = document.getElementById('menu-btn');

const matchArea = document.getElementById('match-area');
const matchColEn = document.getElementById('match-col-en');
const matchColFr = document.getElementById('match-col-fr');
const matchFeedback = document.getElementById('match-feedback');
const matchScoreDisplay = document.getElementById('match-score');
const matchTotalDisplay = document.getElementById('match-total');
const matchProgress = document.getElementById('match-progress');
const matchEndButtons = document.getElementById('match-end-buttons');
const matchReplayBtn = document.getElementById('match-replay-btn');
const matchMenuBtn = document.getElementById('match-menu-btn');

function shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function parseWordList(text) {
    const lines = text.split('\n');
    const parsed = [];
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        const parts = trimmed.split('=');
        if (parts.length === 2) {
            parsed.push({
                english: parts[0].trim(),
                french: parts[1].trim()
            });
        }
    }
    return parsed;
}

function hideAll() {
    setupScreen.style.display = 'none';
    modeScreen.style.display = 'none';
    quizArea.style.display = 'none';
    matchArea.style.display = 'none';
}

function showSetup() {
    hideAll();
    setupScreen.style.display = '';
}

function showModeSelect() {
    hideAll();
    modeScreen.style.display = '';
}

function showQuiz() {
    hideAll();
    quizArea.style.display = '';
}

function showMatch() {
    hideAll();
    matchArea.style.display = '';
}

// Génère les boutons de thèmes
for (const themeName of Object.keys(themes)) {
    const btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.textContent = themeName;
    btn.addEventListener('click', () => {
        words = themes[themeName];
        showModeSelect();
    });
    themeGrid.appendChild(btn);
}

startCustomBtn.addEventListener('click', () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) {
        alert("Il faut au moins 2 mots ! Vérifie le format : anglais = français");
        return;
    }
    words = parsed;
    showModeSelect();
});

// Mode selection
modeQuizBtn.addEventListener('click', () => {
    showQuiz();
    startRound();
});

modeMatchBtn.addEventListener('click', () => {
    showMatch();
    startMatchRound();
});

backToSetupBtn.addEventListener('click', () => {
    showSetup();
});

// Quiz buttons
replayBtn.addEventListener('click', () => {
    startRound();
});

menuBtn.addEventListener('click', () => {
    showSetup();
});

// Match buttons
matchReplayBtn.addEventListener('click', () => {
    startMatchRound();
});

matchMenuBtn.addEventListener('click', () => {
    showSetup();
});

function startRound() {
    currentIndex = 0;
    score = 0;
    roundOver = false;
    attempts = 0;
    scoreDisplay.innerText = score;
    feedback.innerText = "";
    checkBtn.style.display = "";
    userInput.style.display = "";
    endButtons.style.display = "none";

    const size = Math.min(ROUND_SIZE, words.length);
    roundWords = shuffle(words).slice(0, size).map(word => ({
        ...word,
        direction: Math.random() < 0.5 ? "en-to-fr" : "fr-to-en"
    }));
    totalDisplay.innerText = roundWords.length;

    displayWord();
}

const mcqChoices = document.getElementById('mcq-choices');

function displayWord() {
    const word = roundWords[currentIndex];
    const dir = word.direction;

    if (dir === "en-to-fr") {
        wordDisplay.innerText = word.english;
        instruction.innerText = "Traduisez en français :";
    } else {
        wordDisplay.innerText = word.french;
        instruction.innerText = "Translate into English:";
    }

    attempts = 0;
    feedback.innerText = "";
    mcqChoices.style.display = "none";
    mcqChoices.innerHTML = "";
    progress.innerText = (currentIndex + 1) + " / " + roundWords.length;
    userInput.value = "";
    userInput.focus();
}

function getHint(word) {
    // Indice dans la langue du mot présenté
    if (word.direction === "en-to-fr") {
        return word.hintEn;
    } else {
        return word.hintFr;
    }
}

function checkAnswer() {
    if (roundOver || waitingNext) return;
    const answer = userInput.value.trim().toLowerCase();
    if (answer === "") return;
    const word = roundWords[currentIndex];

    let correctAnswer;
    if (word.direction === "en-to-fr") {
        correctAnswer = word.french.toLowerCase();
    } else {
        correctAnswer = word.english.toLowerCase();
    }

    if (answer === correctAnswer) {
        feedback.innerText = "Bravo !";
        feedback.style.color = "green";
        if (attempts === 0) {
            score += 1;
        }
        else {
            score += 0.5; // Moitié des points si l'utilisateur a utilisé un indice
        }
        scoreDisplay.innerText = score;
    } else {
        attempts++;
        if (attempts === 1) {
            if (word.direction === "fr-to-en") {
                // QCM : 3 choix dont la bonne réponse
                feedback.innerText = "Essaie encore ! Choisis la bonne réponse :";
                feedback.style.color = "#b08b2e";
                showMcq(word);
            } else {
                const hint = getHint(word);
                if (hint) {
                    feedback.innerText = "Essaie encore ! Indice : " + hint;
                    feedback.style.color = "#b08b2e";
                } else {
                    feedback.innerText = "Essaie encore !";
                    feedback.style.color = "#b08b2e";
                }
            }
            userInput.value = "";
            userInput.focus();
            return;
        } else {
            feedback.innerText = "C'était « " + correctAnswer + " »";
            feedback.style.color = "red";
        }
    }

    waitingNext = true;
    setTimeout(() => {
        waitingNext = false;
        nextWord();
    }, 1500);
}

checkBtn.addEventListener('click', checkAnswer);

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        checkAnswer();
    }
});

function nextWord() {
    currentIndex++;

    if (currentIndex < roundWords.length) {
        displayWord();
    } else {
        roundOver = true;
        feedback.innerText = "Fin de la partie ! Score : " + score + " / " + roundWords.length;
        feedback.style.color = "#344e41";
        wordDisplay.innerText = "---";
        progress.innerText = "";
        instruction.innerText = "Partie terminée !";
        checkBtn.style.display = "none";
        userInput.style.display = "none";
        endButtons.style.display = "";
    }
}

function showMcq(word) {
    const correctAnswer = word.english;
    // Choisir 2 mauvaises réponses parmi les autres mots
    const others = words.filter(w => w.english !== correctAnswer);
    const wrongAnswers = shuffle(others).slice(0, 2).map(w => w.english);
    const choices = shuffle([correctAnswer, ...wrongAnswers]);

    mcqChoices.innerHTML = "";
    mcqChoices.style.display = "flex";
    userInput.style.display = "none";
    checkBtn.style.display = "none";

    choices.forEach(choice => {
        const btn = document.createElement('button');
        btn.className = 'mcq-btn';
        btn.textContent = choice;
        btn.addEventListener('click', () => {
            if (waitingNext) return;
            // Désactiver tous les boutons
            mcqChoices.querySelectorAll('.mcq-btn').forEach(b => b.style.pointerEvents = 'none');

            if (choice === correctAnswer) {
                btn.classList.add('correct');
                feedback.innerText = "Bravo !";
                feedback.style.color = "green";
                score += 0.5;
                scoreDisplay.innerText = score;
            } else {
                btn.classList.add('wrong');
                // Montrer la bonne réponse
                mcqChoices.querySelectorAll('.mcq-btn').forEach(b => {
                    if (b.textContent === correctAnswer) b.classList.add('correct');
                });
                feedback.innerText = "C'était « " + correctAnswer + " »";
                feedback.style.color = "red";
            }

            waitingNext = true;
            setTimeout(() => {
                waitingNext = false;
                mcqChoices.style.display = "none";
                userInput.style.display = "";
                checkBtn.style.display = "";
                nextWord();
            }, 1500);
        });
        mcqChoices.appendChild(btn);
    });
}

// ===== Jeu Relier les mots =====

let matchWords = [];
let matchScore = 0;
let matchedCount = 0;
let selectedEn = null;
let selectedFr = null;
let matchLocked = false;

function startMatchRound() {
    matchScore = 0;
    matchedCount = 0;
    selectedEn = null;
    selectedFr = null;
    matchLocked = false;
    matchFeedback.innerText = "";
    matchEndButtons.style.display = "none";

    const size = Math.min(MATCH_SIZE, words.length);
    matchWords = shuffle(words).slice(0, size);

    matchTotalDisplay.innerText = matchWords.length;
    matchScoreDisplay.innerText = 0;
    matchProgress.innerText = "0 / " + matchWords.length;

    // Créer les colonnes mélangées
    const enOrder = shuffle(matchWords);
    const frOrder = shuffle(matchWords);

    matchColEn.innerHTML = '';
    matchColFr.innerHTML = '';

    enOrder.forEach(word => {
        const el = document.createElement('div');
        el.className = 'match-word';
        el.textContent = word.english;
        el.dataset.key = word.english;
        el.addEventListener('click', () => onClickEn(el, word));
        matchColEn.appendChild(el);
    });

    frOrder.forEach(word => {
        const el = document.createElement('div');
        el.className = 'match-word';
        el.textContent = word.french;
        el.dataset.key = word.english; // clé commune pour vérifier la paire
        el.addEventListener('click', () => onClickFr(el, word));
        matchColFr.appendChild(el);
    });
}

function onClickEn(el, word) {
    if (matchLocked || el.classList.contains('matched')) return;

    // Désélectionner l'ancien
    if (selectedEn) selectedEn.el.classList.remove('selected');

    selectedEn = { el, word };
    el.classList.add('selected');

    if (selectedFr) tryMatch();
}

function onClickFr(el, word) {
    if (matchLocked || el.classList.contains('matched')) return;

    if (selectedFr) selectedFr.el.classList.remove('selected');

    selectedFr = { el, word };
    el.classList.add('selected');

    if (selectedEn) tryMatch();
}

function tryMatch() {
    matchLocked = true;
    const isCorrect = selectedEn.word.english === selectedFr.word.english;

    if (isCorrect) {
        selectedEn.el.classList.remove('selected');
        selectedFr.el.classList.remove('selected');
        selectedEn.el.classList.add('matched');
        selectedFr.el.classList.add('matched');
        matchScore++;
        matchedCount++;
        matchScoreDisplay.innerText = matchScore;
        matchProgress.innerText = matchedCount + " / " + matchWords.length;
        matchFeedback.innerText = "Bravo !";
        matchFeedback.style.color = "green";

        selectedEn = null;
        selectedFr = null;
        matchLocked = false;

        if (matchedCount === matchWords.length) {
            endMatchRound();
        }
    } else {
        selectedEn.el.classList.add('wrong');
        selectedFr.el.classList.add('wrong');
        matchFeedback.innerText = "Essaie encore !";
        matchFeedback.style.color = "#c1121f";

        const enEl = selectedEn.el;
        const frEl = selectedFr.el;

        setTimeout(() => {
            enEl.classList.remove('selected', 'wrong');
            frEl.classList.remove('selected', 'wrong');
            selectedEn = null;
            selectedFr = null;
            matchLocked = false;
        }, 600);
    }
}

function endMatchRound() {
    matchFeedback.innerText = "Bravo ! Score : " + matchScore + " / " + matchWords.length;
    matchFeedback.style.color = "#344e41";
    matchProgress.innerText = "Partie terminée !";
    matchEndButtons.style.display = "";
}

// On démarre sur l'écran de configuration
showSetup();
