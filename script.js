

document.addEventListener('DOMContentLoaded', function () {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('appear');
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const serviceSections = document.querySelectorAll('.s-sec');
    serviceSections.forEach(section => {
        observer.observe(section);
    });

    const skillCards = document.querySelectorAll('.skill-card');
    const skillObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const skillObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, skillObserverOptions);

    skillCards.forEach(card => {
        skillObserver.observe(card);
    });

    const projectCards = document.querySelectorAll('.project-card');
    const projectObserverOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const projectObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                observer.unobserve(entry.target);
            }
        });
    }, projectObserverOptions);

    projectCards.forEach(card => {
        projectObserver.observe(card);
    });
});


document.querySelectorAll('.skill-card, .services-re, .services-sq, .hireme-sec, .footer-text').forEach(card => {
    card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    });
});

const hamburger = document.querySelector('.hamburger');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileLinks = document.querySelectorAll('.mobile-menu a');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

const closeMenuBtn = document.querySelector('.close-menu');
if (closeMenuBtn) {
    closeMenuBtn.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
}

mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});


const GITHUB_USERNAME = 'theRetrox';

async function fetchGitHubData() {
    try {
        const userResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`);
        if (!userResponse.ok) throw new Error('Failed to fetch user data');
        const userData = await userResponse.json();

        const reposResponse = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`);
        if (!reposResponse.ok) throw new Error('Failed to fetch repositories');
        const reposData = await reposResponse.json();

        const createdDate = new Date(userData.created_at);
        const now = new Date();
        const ageInYears = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24 * 365));

        animateCounter('stat-repos', userData.public_repos);
        animateCounter('account-age-years', ageInYears);

    } catch (error) {
        console.error('Error fetching GitHub data:', error);
        document.getElementById('stat-repos').textContent = '--';
        document.getElementById('account-age-years').textContent = '--';
    }
}

function animateCounter(elementId, targetValue) {
    const element = document.getElementById(elementId);
    const duration = 1500;
    const steps = 60;
    const increment = targetValue / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
        step++;
        current += increment;

        if (step >= steps) {
            element.textContent = targetValue;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, duration / steps);
}

document.addEventListener('DOMContentLoaded', fetchGitHubData);

const aboutObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            aboutObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
});

document.addEventListener('DOMContentLoaded', () => {
    const aboutElements = document.querySelectorAll('.stat-item-minimal');
    aboutElements.forEach((el, index) => {
        el.style.transitionDelay = `${index * 0.1}s`;
        aboutObserver.observe(el);
    });
});

let body = document.body;
const spaceStation = document.querySelector('#space-station');
const heroModel = document.querySelector('#hero-model');
const modelcontainer = document.querySelector('.model-container');

let zoom = 10;
let horizontalangle = 0;
let verticalangle = 90;


let zm = 10;
let ho = 0;
let ver = 90;


body.addEventListener('mousemove', (e) => {
    let x = e.clientX;
    let y = e.clientY;

});


let gameloop = () => {

    ho += 0.2;
    if (ho >= 360) { ho = 0; }

    spaceStation.cameraOrbit = `${horizontalangle}deg ${verticalangle}deg ${zoom}m`;
    heroModel.cameraOrbit = `${ho}deg ${ver}deg ${zm}m`;
    requestAnimationFrame(gameloop);
}
requestAnimationFrame(gameloop);     