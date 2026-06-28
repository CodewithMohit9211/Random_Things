const pageLoader = document.getElementById('pageLoader');
const themeToggle = document.getElementById('themeToggle');
const weatherToggle = document.getElementById('weatherToggle');
const soundToggle = document.getElementById('soundToggle');
const secretTrigger = document.getElementById('secretTrigger');
const clockDisplay = document.getElementById('clockDisplay');
const weatherDisplay = document.getElementById('weatherDisplay');
const projectButtons = document.querySelectorAll('.pill');
const projectCards = document.querySelectorAll('.project-card');
const heroSection = document.querySelector('.hero-section');
const customCursor = document.getElementById('customCursor');

let isNight = true;
let isRain = false;
let isSound = false;
let audioContext;
let noiseSource;
let gainNode;

function setTheme(theme) {
  document.body.classList.toggle('day', theme === 'day');
  document.body.classList.toggle('night', theme === 'night');
  themeToggle.textContent = theme === 'day' ? 'Night' : 'Day';
}

function setWeather(rain) {
  document.body.classList.toggle('rain', rain);
  weatherToggle.textContent = rain ? 'Clear' : 'Rain';
  weatherDisplay.textContent = rain ? 'Misty Rain' : 'Calm Forest';
}

function initClock() {

  function updateClock() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;
  }

  updateClock();
  setInterval(updateClock, 1000);
}

initClock();

function activateAmbientSound() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    noiseSource = audioContext.createBufferSource();
    const bufferSize = audioContext.sampleRate * 2;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i += 1) {
      data[i] = Math.random() * 2 - 1;
    }
    noiseSource.buffer = buffer;
    noiseSource.loop = true;
    gainNode = audioContext.createGain();
    gainNode.gain.value = 0.02;
    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;
    noiseSource.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);
    noiseSource.start();
  }
}

function updateSoundState(active) {
  if (!audioContext) {
    activateAmbientSound();
  }
  if (gainNode) {
    gainNode.gain.value = active ? 0.03 : 0;
  }
  soundToggle.textContent = active ? 'Silent' : 'Sound';
}

function filterProjects(category) {
  projectButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.filter === category);
  });
  projectCards.forEach((card) => {
    const cardCategory = card.dataset.category;
    card.style.display = category === 'all' || category === cardCategory ? 'grid' : 'none';
  });
}

function handleScrollReveal() {
  const elements = document.querySelectorAll('.fade-up');
  const triggerBottom = window.innerHeight * 0.82;
  elements.forEach((element) => {
    const elemTop = element.getBoundingClientRect().top;
    if (elemTop < triggerBottom) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

function animateCounters() {
  const counters = document.querySelectorAll('.mini-stats strong');
  counters.forEach((counter) => {
    const targetValue = parseInt(counter.textContent, 10);
    let currentValue = 0;
    if (!counter.dataset.animated) {
      counter.dataset.animated = 'true';
      const interval = setInterval(() => {
        currentValue += Math.ceil(targetValue / 22);
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(interval);
        }
        counter.textContent = `${currentValue}`;
      }, 34);
    }
  });
}

function setupCustomCursor() {
  window.addEventListener('mousemove', (event) => {
    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
  });
  document.querySelectorAll('button, a, .project-link').forEach((item) => {
    item.addEventListener('mouseenter', () => {
      customCursor.style.transform = 'translate(-50%, -50%) scale(1.6)';
    });
    item.addEventListener('mouseleave', () => {
      customCursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });
}

function initParallax() {
  heroSection.addEventListener('mousemove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5) * 18;
    const y = (event.clientY / window.innerHeight - 0.5) * 18;
    document.querySelectorAll('.hero-clouds, .hero-mountains, .hero-forest, .hero-glow').forEach((layer, index) => {
      const movement = (index + 1) * 1.3;
      layer.style.transform = `translate(${x / movement}px, ${y / movement}px)`;
    });
  });
}

function createParticles() {
  const canvasParent = document.getElementById('particleCanvas');
  const canvas = document.createElement('canvas');
  canvasParent.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  let width = canvasParent.offsetWidth;
  let height = canvasParent.offsetHeight;
  canvas.width = width;
  canvas.height = height;
  canvas.style.position = 'absolute';
  canvas.style.inset = '0';
  const particles = Array.from({ length: 55 }, () => createParticle(width, height));

  function createParticle(w, h) {
    return {
      x: Math.random() * w,
      y: Math.random() * h,
      radius: Math.random() * 2.4 + 1,
      vx: Math.random() * 0.6 - 0.25,
      vy: Math.random() * 0.7 + 0.15,
      opacity: Math.random() * 0.5 + 0.3,
      hue: Math.random() * 90 + 120,
    };
  }

  function resize() {
    width = canvasParent.offsetWidth;
    height = canvasParent.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  }

  window.addEventListener('resize', resize);

  function draw() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.opacity = 0.3 + Math.sin(Date.now() * 0.001 + particle.x) * 0.1;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y > height + 20) particle.y = -20;
      ctx.beginPath();
      ctx.fillStyle = `hsla(${particle.hue}, 80%, 72%, ${particle.opacity})`;
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}

function initScene() {
  window.addEventListener('scroll', () => {
    const value = window.scrollY / 280;
    const scrollTint = Math.min(value, 1);
    heroSection.style.filter = `brightness(${1 - scrollTint * 0.15})`;
    document.querySelector('.hero-glow').style.opacity = `${0.6 - scrollTint * 0.4}`;
  });
}

function revealSecretMode() {
  const notice = document.createElement('div');
  notice.className = 'secret-notice';
  notice.textContent = 'Secret path unlocked. Nature whispers...';
  document.body.appendChild(notice);
  setTimeout(() => notice.remove(), 4000);
}

function initProjectFiltering() {
  projectButtons.forEach((button) => {
    button.addEventListener('click', () => filterProjects(button.dataset.filter));
  });
}

function animateOnScroll() {
  handleScrollReveal();
  requestAnimationFrame(animateOnScroll);
}

window.addEventListener('DOMContentLoaded', () => {
  setTheme('night');
  setWeather(false);
  initClock();
  setupCustomCursor();
  initParallax();
  createParticles();
  initScene();
  initProjectFiltering();
  animateOnScroll();
  animateCounters();
  setTimeout(() => pageLoader.classList.add('hidden'), 1200);
});

themeToggle.addEventListener('click', () => {
  isNight = !isNight;
  setTheme(isNight ? 'night' : 'day');
});

weatherToggle.addEventListener('click', () => {
  isRain = !isRain;
  setWeather(isRain);
});

soundToggle.addEventListener('click', () => {
  isSound = !isSound;
  updateSoundState(isSound);
});

secretTrigger.addEventListener('click', () => revealSecretMode());

window.addEventListener('keydown', (event) => {
  if (event.key.toLowerCase() === 'm') {
    revealSecretMode();
  }
});
