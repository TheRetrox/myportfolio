


const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const c = canvas.getContext("2d");


let G = 0.5;
let FRAGMENTATION_THRESHOLD = 10;
let line_size = 400;
let obg_count = 5;
const density = 0.009;
let eventCalled = false;
let collisionsEnabled = true;


let circleObg = [];
let random_mass_arr = [];
let random_size_arr = [];
let dirCircleArr = [];
let C_circleArr = [];
let circleNames = [];
let trailHistory = [];



let f_circleObg = [];
let f_random_mass_arr = [];
let f_random_size_arr = [];
let f_dirCircleArr = [];
let f_creationTime = [];
let FRAGMENT_LIFETIME = 3000;



const planetColors = [
    { name: 'Earth', colors: ['#dff9ff', '#4cc9f0', '#4a90e2', '#081c15'], type: 'liquid' },
    { name: 'Lava', colors: ['#fff2cc', '#ff7518', '#cc3300', '#330000'], type: 'liquid' },
    { name: 'GasGiant', colors: ['#fefae0', '#e9c46a', '#b56576', '#3d2b1f'], type: 'gas', hasRings: true },
    { name: 'Desert', colors: ['#fff2cc', '#e6b566', '#a36f2d', '#2e1f0f'], type: 'rocky' },
    { name: 'Toxic', colors: ['#eaffd0', '#a3bffa', '#6c63ff', '#1a237e'], type: 'gas' },
    { name: 'Shadow', colors: ['#e0e0e0', '#757575', '#212121', '#000000'], type: 'rocky' },
    { name: 'Neon', colors: ['#f0f0f0', '#00ffff', '#00bcd4', '#001f3f'], type: 'gas' },
    { name: 'Crimson', colors: ['#ffebee', '#ef5350', '#c62828', '#4a0000'], type: 'rocky' },
    { name: 'Mystic', colors: ['#ede7f6', '#b39ddb', '#673ab7', '#311b92'], type: 'gas' },
    { name: 'Aurora', colors: ['#e0f7fa', '#80deea', '#536dfe', '#1a237e'], type: 'gas' },
    { name: 'Storm', colors: ['#f5f5f5', '#90a4ae', '#455a64', '#263238'], type: 'gas' },
    { name: 'Ember', colors: ['#fff3e0', '#ffb74d', '#e65100', '#1a0000'], type: 'rocky' },
    { name: 'Void', colors: ['#f0f0f0', '#8888ff', '#000033', '#000000'], type: 'gas' },
    { name: 'Amethyst', colors: ['#f3e5f5', '#ce93d8', '#8e24aa', '#4a0072'], type: 'rocky' },
    { name: 'Gold', colors: ['#fff8e1', '#ffd54f', '#ffb300', '#4e342e'], type: 'rocky' },
    { name: 'Obsidian', colors: ['#eceff1', '#90a4ae', '#263238', '#000000'], type: 'rocky' }
];


const MAX_TRAIL_LENGTH = 450;
const TRAIL_FADE_TIME = 9000;

function updateTrails() {
    for (let i = 0; i < circleObg.length; i++) {

        if (!trailHistory[i]) {
            trailHistory[i] = [];
        }


        trailHistory[i].push({
            x: circleObg[i].x,
            y: circleObg[i].y,
            time: Date.now()
        });


        if (trailHistory[i].length > MAX_TRAIL_LENGTH) {
            trailHistory[i].shift();
        }


        const currentTime = Date.now();
        trailHistory[i] = trailHistory[i].filter(point =>
            currentTime - point.time < TRAIL_FADE_TIME
        );
    }
}

function drawTrails() {
    const currentTime = Date.now();

    for (let i = 0; i < circleObg.length; i++) {
        if (!trailHistory[i] || trailHistory[i].length < 2) continue;


        const colors = planetColors[C_circleArr[i]].colors;
        const baseColor = colors[1];


        const r = parseInt(baseColor.slice(1, 3), 16);
        const g = parseInt(baseColor.slice(3, 5), 16);
        const b = parseInt(baseColor.slice(5, 7), 16);


        for (let j = 0; j < trailHistory[i].length - 1; j++) {
            const point1 = trailHistory[i][j];
            const point2 = trailHistory[i][j + 1];


            const age = currentTime - point1.time;
            const fadeProgress = age / TRAIL_FADE_TIME;
            const alpha = (1 - fadeProgress) * 0.5;


            const widthProgress = j / trailHistory[i].length;
            const smoothProgress = Math.pow(widthProgress, 0.7);
            const lineWidth = smoothProgress * 1.1 + 0.1;

            c.beginPath();
            c.moveTo(point1.x, point1.y);
            c.lineTo(point2.x, point2.y);
            c.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
            c.lineWidth = lineWidth;
            c.stroke();
        }
    }
}


function addphysics() {
    let collisions = [];
    let bodiesToRemove = new Set();


    for (let i = 0; i < circleObg.length; i++) {

        dirCircleArr[i].dx *= 0.999;
        dirCircleArr[i].dy *= 0.999;

        for (let j = i + 1; j < circleObg.length; j++) {
            const dx = circleObg[i].x - circleObg[j].x;
            const dy = circleObg[i].y - circleObg[j].y;
            const hypo = Math.sqrt(dx * dx + dy * dy);

            if (hypo < 0.00001) continue;

            const dist = Math.max(hypo, 20);


            const alpha = Math.max(0, 1 - hypo / line_size);
            if (alpha > 0) {
                c.beginPath();
                c.moveTo(circleObg[i].x, circleObg[i].y);
                c.lineTo(circleObg[j].x, circleObg[j].y);
                c.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
                c.stroke();
            }


            const force = (G * random_mass_arr[i] * random_mass_arr[j]) / (dist * dist);
            const fx = (dx / hypo) * force;
            const fy = (dy / hypo) * force;


            dirCircleArr[i].dx -= fx / random_mass_arr[i];
            dirCircleArr[i].dy -= fy / random_mass_arr[i];
            dirCircleArr[j].dx += fx / random_mass_arr[j];
            dirCircleArr[j].dy += fy / random_mass_arr[j];


            const collisionDist = random_size_arr[i] + random_size_arr[j];
            if (collisionsEnabled && hypo <= collisionDist) {
                collisions.push([i, j]);
            }
        }
    }


    for (const [i, j] of collisions) {
        if (bodiesToRemove.has(i) || bodiesToRemove.has(j)) continue;

        const relVelX = dirCircleArr[i].dx - dirCircleArr[j].dx;
        const relVelY = dirCircleArr[i].dy - dirCircleArr[j].dy;
        const relativeSpeed = Math.sqrt(relVelX * relVelX + relVelY * relVelY);

        if (relativeSpeed > FRAGMENTATION_THRESHOLD) {

            const combinedMass = random_mass_arr[i] + random_mass_arr[j];
            const combinedSize = random_size_arr[i] + random_size_arr[j];

            const baseFragments = 20;
            const sizeMultiplier = Math.min(5, combinedSize / 20);
            let fragmentCount = Math.floor(baseFragments * sizeMultiplier + Math.random() * 30);
            fragmentCount = Math.max(20, Math.min(100, fragmentCount));

            const fragmentMass = combinedMass / fragmentCount;
            const baseFragmentSize = 0.5 + Math.random() * 1.5;

            for (let n = 0; n < fragmentCount; n++) {
                const fragmentSize = baseFragmentSize * (0.8 + Math.random() * 0.4);
                createFragment(circleObg[i].x, circleObg[i].y, fragmentMass, fragmentSize);
            }

            bodiesToRemove.add(i);
            bodiesToRemove.add(j);

        } else {

            let biggerIdx, smallerIdx;
            if (random_mass_arr[i] >= random_mass_arr[j]) {
                biggerIdx = i;
                smallerIdx = j;
            } else {
                biggerIdx = j;
                smallerIdx = i;
            }

            random_mass_arr[biggerIdx] += random_mass_arr[smallerIdx];
            const newVolume = Math.pow(random_size_arr[biggerIdx], 3) + Math.pow(random_size_arr[smallerIdx], 3);
            random_size_arr[biggerIdx] = Math.cbrt(newVolume);

            bodiesToRemove.add(smallerIdx);
        }
    }


    const sortedIndices = Array.from(bodiesToRemove).sort((a, b) => b - a);
    for (const idx of sortedIndices) {
        removeObject(idx);
    }
}
function fragmentUpdate() {
    const currentTime = Date.now();

    for (let o = f_circleObg.length - 1; o >= 0; o--) {
        f_circleObg[o].x += f_dirCircleArr[o].dx;
        f_circleObg[o].y += f_dirCircleArr[o].dy;

        for (let l = f_circleObg.length - 1; l >= 0; l--) {
            const dx = f_circleObg[o].x - f_circleObg[l].x;
            const dy = f_circleObg[o].y - f_circleObg[l].y;
            const hypo = Math.sqrt(dx * dx + dy * dy);


            const alpha = Math.max(0, 1 - hypo / 35);
            c.beginPath();
            c.moveTo(f_circleObg[o].x, f_circleObg[o].y);
            c.lineTo(f_circleObg[l].x, f_circleObg[l].y);
            c.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.2})`;
            c.lineWidth = 0.5;
            c.stroke();

        }


        const age = currentTime - f_creationTime[o];


        if (f_circleObg[o].x < 0 || f_circleObg[o].x > window.innerWidth ||
            f_circleObg[o].y < 0 || f_circleObg[o].y > window.innerHeight ||
            f_random_size_arr[o] < 0.5 ||
            age > FRAGMENT_LIFETIME) {
            clearFragments(o);
        }
    }
}


function clearFragments(idx) {
    f_circleObg.splice(idx, 1);
    f_dirCircleArr.splice(idx, 1);
    f_random_mass_arr.splice(idx, 1);
    f_random_size_arr.splice(idx, 1);
    f_creationTime.splice(idx, 1);
}

function drawFragments() {
    const currentTime = Date.now();


    const FADE_START_RATIO = 0.7;

    for (let t = 0; t < f_circleObg.length; t++) {
        const age = currentTime - f_creationTime[t];
        const lifeRatio = age / FRAGMENT_LIFETIME;


        let opacity = 0.9;
        if (lifeRatio > FADE_START_RATIO) {

            const fadeProgress = (lifeRatio - FADE_START_RATIO) / (1 - FADE_START_RATIO);
            opacity = 0.9 * (1 - fadeProgress);
        }

        c.beginPath();
        c.arc(f_circleObg[t].x, f_circleObg[t].y, f_random_size_arr[t], 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        c.fill();
    }
}




function createFragment(x, y, random_mass, random_size) {
    let actualspeed = 0.5;
    let randomSpeed = Math.floor(Math.random() * 10) + 1;


    let angle = Math.random() * Math.PI * 2;
    let speed = actualspeed + randomSpeed * 0.02;
    let dx = Math.cos(angle) * speed;
    let dy = Math.sin(angle) * speed;

    f_circleObg.push({ x: x, y: y });
    f_dirCircleArr.push({ dx: dx, dy: dy });
    f_random_mass_arr.push(random_mass);
    f_random_size_arr.push(random_size);
    f_creationTime.push(Date.now());
}


function draw() {
    let planetsToRemove = [];

    for (let i = 0; i < circleObg.length; i++) {
        const x = circleObg[i].x;
        const y = circleObg[i].y;
        const radius = random_size_arr[i];
        const planetInfo = planetColors[C_circleArr[i]];
        const colors = planetInfo.colors;


        if (planetInfo.hasRings) {
            c.beginPath();
            c.ellipse(x, y, radius * 2.2, radius * 0.6, 0.2, 0, Math.PI * 2);
            c.strokeStyle = colors[1] + '44';
            c.lineWidth = radius * 0.3;
            c.stroke();

            c.beginPath();
            c.ellipse(x, y, radius * 1.8, radius * 0.4, 0.2, 0, Math.PI * 2);
            c.strokeStyle = colors[2] + '66';
            c.lineWidth = radius * 0.15;
            c.stroke();
        }


        const gradient = c.createRadialGradient(
            x - radius * 0.3, y - radius * 0.3, radius * 0.1,
            x, y, radius
        );
        gradient.addColorStop(0, colors[0]);
        gradient.addColorStop(0.3, colors[1]);
        gradient.addColorStop(0.7, colors[2]);
        gradient.addColorStop(1, colors[3]);

        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fillStyle = gradient;
        c.fill();


        c.save();
        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.clip();

        if (planetInfo.type === 'liquid') {

            c.strokeStyle = colors[0] + '15';
            c.lineWidth = 1;
            for (let n = 0; n < 3; n++) {
                const verticalOffset = (n - 1) * radius * 0.4;
                c.beginPath();
                c.moveTo(x - radius, y + verticalOffset);
                c.bezierCurveTo(
                    x - radius * 0.5, y + verticalOffset - radius * 0.3,
                    x + radius * 0.5, y + verticalOffset + radius * 0.3,
                    x + radius, y + verticalOffset
                );
                c.stroke();
            }
        } else if (planetInfo.type === 'gas') {

            for (let n = 0; n < 4; n++) {
                c.fillStyle = colors[1] + '22';
                c.fillRect(x - radius, y - radius + (n * radius * 0.5), radius * 2, radius * 0.2);
            }
        } else if (planetInfo.type === 'rocky') {

            c.fillStyle = colors[3] + '44';
            for (let n = 0; n < 3; n++) {
                c.beginPath();
                c.arc(x + (Math.sin(n) * radius * 0.5), y + (Math.cos(n) * radius * 0.5), radius * 0.2, 0, Math.PI * 2);
                c.fill();
            }
        }
        c.restore();


        const highlight = c.createRadialGradient(
            x - radius * 0.4, y - radius * 0.4, radius * 0.05,
            x - radius * 0.4, y - radius * 0.4, radius * 0.4
        );
        highlight.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        highlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

        c.beginPath();
        c.arc(x, y, radius, 0, Math.PI * 2);
        c.fillStyle = highlight;
        c.fill();


        const atmosGlow = c.createRadialGradient(x, y, radius, x, y, radius * 1.3);
        atmosGlow.addColorStop(0, colors[1] + '33');
        atmosGlow.addColorStop(1, colors[1] + '00');

        c.beginPath();
        c.arc(x, y, radius * 1.3, 0, Math.PI * 2);
        c.fillStyle = atmosGlow;
        c.fill();


        circleObg[i].x += dirCircleArr[i].dx;
        circleObg[i].y += dirCircleArr[i].dy;


        const margin = 100;
        const isOutsideScreen =
            x + radius < -margin ||
            x - radius > window.innerWidth + margin ||
            y + radius < -margin ||
            y - radius > window.innerHeight + margin;

        if (isOutsideScreen) {
            planetsToRemove.push(i);
            continue;
        }


        c.fillStyle = 'rgba(255, 255, 255, 0.8)';
        c.font = `${Math.max(10, radius / 2.5)}px monospace`;
        c.textAlign = 'center';
        c.fillText(circleNames[i], x, y - radius * 1.4);
    }

    for (let i = planetsToRemove.length - 1; i >= 0; i--) {
        removeObject(planetsToRemove[i]);
    }
}




function create(event, fromClick) {
    const randomP = Math.floor(Math.random() * planetColors.length);
    const randomname = Math.floor(Math.random() * 5000);

    const x = fromClick ? event.clientX : Math.random() * window.innerWidth - 20;
    const y = fromClick ? event.clientY : Math.random() * window.innerHeight - 20;

    const random_size = Math.max(5, Math.floor(Math.random() * 20));
    const random_mass = (4 / 3) * Math.PI * Math.pow(random_size, 3) * density;

    circleObg.push({ x: x, y: y });
    dirCircleArr.push({ dx: 0, dy: 0 });
    random_mass_arr.push(random_mass);
    random_size_arr.push(random_size);
    C_circleArr.push(randomP);
    circleNames.push("planet_" + randomname);

    eventCalled = true;
    updateObjectCount();
}


function removeObject(index1, index2) {
    const indexes = index2 !== undefined ? [index1, index2] : [index1];
    indexes.sort((a, b) => b - a);
    for (const idx of indexes) {
        circleObg.splice(idx, 1);
        random_mass_arr.splice(idx, 1);
        random_size_arr.splice(idx, 1);
        dirCircleArr.splice(idx, 1);
        C_circleArr.splice(idx, 1);
        circleNames.splice(idx, 1);
        trailHistory.splice(idx, 1);
    }
    updateObjectCount();
}


function clearSimulation() {
    circleObg = [];
    random_mass_arr = [];
    random_size_arr = [];
    dirCircleArr = [];
    C_circleArr = [];
    circleNames = [];
    trailHistory = [];
    eventCalled = false;

    f_circleObg = [];
    f_random_mass_arr = [];
    f_random_size_arr = [];
    f_dirCircleArr = [];
    f_creationTime = [];
    updateObjectCount();
}


function updateObjectCount() {
    document.getElementById('object-count').textContent = circleObg.length;
}




canvas.addEventListener('mousedown', (e) => {
    create(e, true);
});


window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


const customizeBtn = document.querySelector('.customize-btn');
const customizationPanel = document.querySelector('.customization-panel');
const welcomePanel = document.querySelector('.welcome-panel');
const welcomeCloseBtn = document.getElementById('welcome-close-btn');
const welcomeStartBtn = document.getElementById('welcome-start-btn');
const customizationCloseBtn = document.getElementById('customization-close-btn');
const overlay = document.querySelector('.overlay');

const gConstSlider = document.getElementById('gravity-slider');
const fragSlider = document.getElementById('Fragmentaition');
const lineLenSlider = document.getElementById('Lines');
const fragmentLifetimeSlider = document.getElementById('Fragment_Lifetime');
const objNumSlider = document.getElementById('Object_Number');

const gConstVal = document.getElementById('gravity-slider-value');
const fragVal = document.getElementById('Fragmentaition-value');
const lineLenVal = document.getElementById('Lines-value');
const fragmentLifetimeVal = document.getElementById('Fragment_Lifetime-value');
const objNumVal = document.getElementById('Object_Number-value');
const clearBtn = document.getElementById('clear-btn');


customizeBtn.addEventListener('click', () => {
    customizationPanel.classList.add('active');
    overlay.classList.add('active');

});


welcomeCloseBtn.addEventListener('click', closeWelcome);
welcomeStartBtn.addEventListener('click', closeWelcome);
function closeWelcome() {
    welcomePanel.classList.remove('active');
    overlay.classList.remove('active');

}


customizationCloseBtn.addEventListener('click', closeCustomization);
overlay.addEventListener('click', closeCustomization);
function closeCustomization() {
    customizationPanel.classList.remove('active');
    overlay.classList.remove('active');

}


gConstSlider.addEventListener('input', () => {
    G = parseFloat(gConstSlider.value);
    gConstVal.textContent = G;
});
fragSlider.addEventListener('input', () => {
    FRAGMENTATION_THRESHOLD = parseFloat(fragSlider.value);
    fragVal.textContent = FRAGMENTATION_THRESHOLD;
});
lineLenSlider.addEventListener('input', () => {
    line_size = parseFloat(lineLenSlider.value);
    lineLenVal.textContent = line_size;
});
fragmentLifetimeSlider.addEventListener('input', () => {
    FRAGMENT_LIFETIME = parseFloat(fragmentLifetimeSlider.value) * 1000;
    fragmentLifetimeVal.textContent = parseFloat(fragmentLifetimeSlider.value);
});
objNumSlider.addEventListener('input', () => {
    obg_count = parseFloat(objNumSlider.value);
    objNumVal.textContent = obg_count;
});


const collisionToggle = document.getElementById('collision-toggle');
collisionToggle.addEventListener('change', () => {
    collisionsEnabled = collisionToggle.checked;
});


clearBtn.addEventListener('click', () => {
    clearSimulation();
    closeCustomization();
});


function gameloop() {
    c.clearRect(0, 0, window.innerWidth, window.innerHeight);
    if (eventCalled) {
        updateTrails();
        drawTrails();
        addphysics();
        fragmentUpdate()
        draw();
        if (f_circleObg.length > 0) {
            drawFragments();
        }
    }

    if (circleObg.length < obg_count) {
        create(0, false);
    }

    requestAnimationFrame(gameloop);
}

requestAnimationFrame(gameloop);
updateObjectCount();
