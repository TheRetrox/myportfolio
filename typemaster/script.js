
const keyboard = document.querySelector('#keyboard');
const text = document.querySelector('#text');
const usertext = document.querySelector('#text2');
const cursor = document.querySelector('#cursor');
const timer = document.querySelector('.timer');
const settings = document.querySelector("#settings");
const wordSet = document.querySelector("#wordsCount");
const timebtn = document.querySelector("#timediv");
const Alltimes = document.querySelector(".times");
const Allwords = document.querySelector(".word-settings");
const coding = document.querySelector("#coding");
const codingver = document.querySelector(".coding-v");
const line = document.querySelector("#v-line");
const navControls = document.querySelector(".nav-controls");


const attributionTooltip = document.querySelector('.attribution-tooltip');
if (keyboard) {
    keyboard.addEventListener('error', (e) => {
        console.warn("Model failed to load:", e);
        if (attributionTooltip) attributionTooltip.style.display = 'none';
        const kContainer = document.querySelector('.keyboard-container');
        if (kContainer) kContainer.style.display = 'none';
    });
}


let mistakes = 0;
let startTime = 0;
let start = true;
let time = 30;
let printTime = true;
let timeEnd = 0;
let interval;
let a = true;
let word = 30;
let x = 0, y = 0, z = 0;


const key = [];
for (let i = 1; i <= 27; i++) {
    key.push(document.querySelector(`#key${i}`));
}


const letters = [
    "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
    "A", "S", "D", "F", "G", "H", "J", "K", "L",
    "Z", "X", "C", "V", "B", "N", "M"
];
const lettersLower = letters.map(l => l.toLowerCase());


const words = [
    "apple", "banana", "cat", "dog", "elephant", "flower", "guitar", "house", "island", "jungle",
    "kite", "lemon", "mountain", "notebook", "orange", "pencil", "queen", "river", "sun", "tree",
    "umbrella", "violet", "window", "xylophone", "yellow", "zebra", "cloud", "dream", "fire", "game",
    "happy", "ice", "jump", "king", "light", "moon", "nest", "ocean", "peace", "quiet",
    "road", "star", "time", "unicorn", "voice", "water", "yard", "zoom", "bread", "chair"
];

const codeSnippets = {
    js: [
        "const x = 5;", "console.log('hello');", "function add(a, b) { return a + b; }",
        "document.querySelector('.btn');", "window.addEventListener('load', () => {});",
        "const array = [1, 2, 3];", "let status = true;", "if (x > 10) { x = 0; }"
    ],
    py: [
        "print('Hello World')", "def add(a, b): return a + b", "import pandas as pd",
        "x = [i for i in range(10)]", "if __name__ == '__main__':",
        "class MyClass: pass", "list_comp = [x*2 for x in data]"
    ],
    c: [
        "#include <stdio.h>", "int main() { return 0; }", "printf('%d', x);",
        "for(int i=0; i<10; i++)", "char* ptr = NULL;", "struct Node { int data; };"
    ],
    java: [
        "System.out.println('Hello');", "public class Main { }", "private int x = 0;",
        "ArrayList<String> list = new ArrayList<>();", "@Override public void run() { }"
    ]
};


let userArray = [""];
let randomPara = [""];


function gameloop() {

    y += 0.1;
    z += 0.1;
    x += 0.1;
    keyboard.orientation = `${x}deg ${y}deg ${z}deg`;
    keyboard.style.top = `${window.innerHeight / 2 - keyboard.offsetHeight / 2}px`;
    keyboard.style.left = `${window.innerWidth / 2 - keyboard.offsetWidth / 2}px`;


    if (a) {
        randomText(words, text, randomPara, word);
        a = false;

        compare(randomPara, userArray, usertext);
        updateCursor();
    }


    if (printTime) {
        timer.innerText = time;
    } else {

        timer.innerText = "";
    }

    requestAnimationFrame(gameloop);
}


function updateCursor() {

    const spans = usertext.querySelectorAll("span");
    if (spans.length === 0) {
        cursor.style.left = "20px";
        cursor.style.top = "20px";
        return;
    }

    const lastSpan = spans[spans.length - 1];
    const rect = lastSpan.getBoundingClientRect();
    const container = usertext.parentElement;
    const containerRect = container.getBoundingClientRect();


    const relativeTop = rect.top - containerRect.top;
    const absoluteTop = relativeTop + container.scrollTop;

    cursor.style.left = `${rect.right - containerRect.left}px`;
    cursor.style.top = `${absoluteTop}px`;


    const buffer = container.clientHeight / 2;
    if (relativeTop > container.clientHeight - buffer) {
        container.scrollTop += (relativeTop - (container.clientHeight - buffer));
    } else if (relativeTop < 0) {

        container.scrollTop += relativeTop;
    }


    cursor.style.display = "block";
}


function reset() {
    time = 30;
    word = 30;
    mistakes = 0;
    userArray = [""];
    randomPara = [""];
    a = true;
    start = true;
    printTime = true;
    clearInterval(interval);

    if (usertext.parentElement) {
        usertext.parentElement.scrollTop = 0;
    }
}


function randomText(array, textEl, rText, count) {
    rText[0] = "";
    for (let i = 0; i < count; i++) {
        const random = Math.floor(Math.random() * array.length);
        rText[0] += (i === 0 ? "" : " ") + array[random];
    }
    textEl.innerText = rText[0];
}


function compare(expected, typed, container) {

    container.textContent = "";

    const exp = expected[0];
    const usr = typed[0];

    for (let i = 0; i < usr.length; i++) {
        const span = document.createElement("span");
        span.textContent = usr.charAt(i);



        if (usr.charAt(i) !== exp.charAt(i)) {
            span.classList.add("c-red");
            if (i === usr.length - 1) mistakes++;
        }
        container.appendChild(span);
    }


    if (usr.length >= exp.length) {
        result();
        reset();
    }
}


document.addEventListener("keydown", (e) => {

    letters.forEach((letter, i) => {
        if (e.key === letter || e.key === lettersLower[i]) {
            key[i].classList.add("anima");
            setTimeout(() => key[i].classList.remove("anima"), 250);
        }
    });




    const ignoredKeys = ["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab", "Escape", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
    if (ignoredKeys.includes(e.key)) return;


    if (e.target.id === "mobile-input") return;

    if (e.key === "Backspace") {
        userArray[0] = userArray[0].slice(0, -1);
        compare(randomPara, userArray, usertext);
        updateCursor();
    } else if (e.key === "Enter") {

    } else {

        if (start) startType();


        if (e.key === " ") {
            e.preventDefault();
            key[26].classList.add("anima");
            setTimeout(() => key[26].classList.remove("anima"), 250);
        }


        if (e.key.length === 1) {
            userArray[0] += e.key;
            compare(randomPara, userArray, usertext);
            updateCursor();
        }
    }

});


const mobileInput = document.querySelector("#mobile-input");

if (mobileInput) {
    mobileInput.value = " ";
    mobileInput.style.opacity = "0";


    document.addEventListener("click", (e) => {
        if (e.target.closest("button") || e.target.closest(".nav-bar") || e.target.closest(".modal")) return;
        mobileInput.focus();
        mobileInput.value = " ";
    });

    mobileInput.addEventListener("input", (e) => {
        const val = mobileInput.value;


        if (val.length === 0) {

            userArray[0] = userArray[0].slice(0, -1);
            compare(randomPara, userArray, usertext);
            updateCursor();


            mobileInput.value = " ";
            return;
        }


        const char = val.slice(-1);

        if (char) {

            if (start) startType();

            if (char === " ") {

                key[26].classList.add("anima");
                setTimeout(() => key[26].classList.remove("anima"), 250);
            } else {

                const upperChar = char.toUpperCase();
                const index = letters.indexOf(upperChar);
                if (index !== -1) {
                    key[index].classList.add("anima");
                    setTimeout(() => key[index].classList.remove("anima"), 250);
                }
            }

            userArray[0] += char;
            compare(randomPara, userArray, usertext);
            updateCursor();
        }


        mobileInput.value = " ";
    });
}


function startType() {
    start = false;
    startTime = Date.now();
    interval = setInterval(() => {
        if (printTime) {

            if (time <= timeEnd) {
                clearInterval(interval);
                result();
                reset();
            } else {
                time--;
            }
        } else {

        }
    }, 1000);
}


function result() {
    clearInterval(interval);
    const modal = document.querySelector("#result-modal");
    const resWpm = document.querySelector("#res-wpm");
    const resAcc = document.querySelector("#res-acc");
    const resMistakes = document.querySelector("#res-mistakes");

    const endTime = Date.now();
    let timeTakenSeconds = (endTime - startTime) / 1000;

    if (printTime) {
        timeTakenSeconds = (30 - time) || timeTakenSeconds;
        const originalTime = parseInt(document.querySelector(".times .btn[style*='white']")?.innerText || "30");
        timeTakenSeconds = originalTime - time;
        if (timeTakenSeconds <= 0) timeTakenSeconds = 1;
    } else {
        if (timeTakenSeconds <= 0) timeTakenSeconds = 1;
    }


    const finalLen = userArray[0].length;
    const calculatedWpm = Math.round((finalLen / 5) / (timeTakenSeconds / 60)) || 0;

    const accuracy = Math.max(0, Math.round(((finalLen - mistakes) / finalLen) * 100)) || 0;

    resWpm.innerText = calculatedWpm;
    resAcc.innerText = accuracy + "%";
    resMistakes.innerText = mistakes;

    modal.style.display = "flex";
}

document.querySelector("#retry-btn").addEventListener("click", () => {
    document.querySelector("#result-modal").style.display = "none";
    reset();
});


const times = [15, 30, 60, 120];
const timediv = [
    document.querySelector("#time1"),
    document.querySelector("#time2"),
    document.querySelector("#time3"),
    document.querySelector("#time4")
];

timediv.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        reset();
        time = times[i];
    });
});


timebtn.addEventListener("click", () => {
    Alltimes.style.display = "flex";
    Allwords.style.display = "none";
    codingver.style.display = "none";

    updateActiveButton(timebtn);

    vline();
});


coding.addEventListener("click", () => {
    Alltimes.style.display = "none";
    Allwords.style.display = "none";
    codingver.style.display = "flex";

    updateActiveButton(coding);

    vline();
});

const codingLan = [
    document.querySelector("#lan1"),
    document.querySelector("#lan2"),
    document.querySelector("#lan3"),
    document.querySelector("#lan4")
];

const codingLanIds = ["js", "py", "c", "java"];
codingLan.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        reset();
        const lang = codingLanIds[i];
        randomText(codeSnippets[lang], text, randomPara, 10);
        a = false;
    });
});


wordSet.addEventListener("click", () => {
    Alltimes.style.display = "none";
    Allwords.style.display = "flex";
    codingver.style.display = "none";

    updateActiveButton(wordSet);

    vline();
});

const wordDiv = [
    document.querySelector("#words1"),
    document.querySelector("#words2"),
    document.querySelector("#words3"),
    document.querySelector("#words4")
];

const wordselect = [15, 30, 60, 100];

wordDiv.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        reset();
        word = wordselect[i];
        printTime = false;
    });
});

let none = true;
settings.addEventListener("click", () => {
    if (none) {
        Alltimes.style.display = "none";
        Allwords.style.display = "none";
        codingver.style.display = "none";
        coding.style.display = "none";
        wordSet.style.display = "none";
        timebtn.style.display = "none";
        none = false;
        settings.classList.remove("active-mode");
    } else {
        coding.style.display = "flex";
        wordSet.style.display = "flex";
        timebtn.style.display = "flex";
        none = true;
        settings.classList.add("active-mode");
    }
    vline();
});

function updateActiveButton(activeBtn) {
    [timebtn, wordSet, coding].forEach(btn => btn.classList.remove("active-mode"));

    [timebtn, wordSet, coding].forEach(btn => btn.style.color = "");
    activeBtn.classList.add("active-mode");
}

function vline() {
    if (Alltimes.style.display == "flex" ||
        Allwords.style.display == "flex" ||
        codingver.style.display == "flex") {
        line.style.display = "block";
    } else {
        line.style.display = "none"
    }
}

const closeTooltipBtn = document.querySelector("#close-tooltip");


if (closeTooltipBtn && attributionTooltip) {
    closeTooltipBtn.addEventListener("click", () => {
        attributionTooltip.classList.add("hidden");
    });
}



if (timebtn) {



    Alltimes.style.display = "flex";
    Allwords.style.display = "none";
    codingver.style.display = "none";
}

updateActiveButton(timebtn);
requestAnimationFrame(gameloop);






const themeBtn = document.getElementById("theme-btn");
const themes = ["default", "matrix", "sunset", "ocean", "dracula", "monochrome", "forest", "berry", "mellow"];


let currentTheme = localStorage.getItem("keyboard-theme") || "default";
document.documentElement.setAttribute("data-theme", currentTheme);

if (themeBtn) {
    themeBtn.addEventListener("click", () => {

        let index = themes.indexOf(currentTheme);
        index = (index + 1) % themes.length;

        currentTheme = themes[index];
        document.documentElement.setAttribute("data-theme", currentTheme);
        localStorage.setItem("keyboard-theme", currentTheme);


        const icon = themeBtn.querySelector("i");
        if (icon) {
            icon.classList.add("fa-bounce");
            setTimeout(() => icon.classList.remove("fa-bounce"), 500);
        }
    });
}





function toggleSlidemenu() {
    const navBar = document.querySelector(".nav-bar");

    // Check if open
    if (navControls.classList.contains("slide-menu")) {

        navControls.classList.remove("active");
        const overlay = document.querySelector(".menu-overlay");
        if (overlay) overlay.style.opacity = "0";

        setTimeout(() => {
            navControls.classList.remove("slide-menu");
            navControls.style.display = "";



            if (navBar && !navBar.contains(navControls)) {
                navBar.appendChild(navControls);
            }

            if (overlay) overlay.remove();
        }, 300);

    } else {

        const overlay = document.createElement("div");
        overlay.className = "menu-overlay";
        Object.assign(overlay.style, {
            position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)", zIndex: "9998", opacity: "0", transition: "opacity 0.3s ease"
        });
        overlay.onclick = toggleSlidemenu;
        document.body.appendChild(overlay);

        requestAnimationFrame(() => overlay.style.opacity = "1");

        document.body.appendChild(navControls);
        navControls.classList.add("slide-menu");


        navControls.style.display = "flex";

        requestAnimationFrame(() => {
            navControls.classList.add("active");
        });
    }
}


window.addEventListener("resize", () => {
    if (window.innerWidth > 1100) {
        if (navControls.classList.contains("slide-menu")) {

            navControls.classList.remove("slide-menu");
            navControls.classList.remove("active");
            navControls.style.display = "";

            const navBar = document.querySelector(".nav-bar");
            navBar.appendChild(navControls);

            const overlay = document.querySelector(".menu-overlay");
            if (overlay) overlay.remove();
        }
    }
});