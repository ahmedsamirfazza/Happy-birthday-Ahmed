/**
 * Application Controller - Eng. Ahmed Samir Birthday Showcase
 * Features:
 * - Professional sequential letter-by-letter typing:
 *   1. Types "ENG. AHMED SAMIR" in English
 *   2. Types Arabic congratulatory greeting card below it letter-by-letter
 * - Interactive 3D rotating cake untouched and smooth
 * - Candle blowing with sound and celebration
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize 3D Cake (Untouched, perfectly spinning)
  const cake = new BirthdayCake3D('cakeContainer');

  // 2. Initialize Sound Synthesizer
  const audioSynth = new BirthdayAudioSynth();

  // 3. Sequential Letter-by-Letter Typing Animations
  const englishNameText = "ENGINEER AHMED SAMIR";
  const arabicCardText = "كل عام وأنت بألف خير وعيد ميلاد سعيد 🎂🎉، اللهم اجعلها سنة خير وبركة وتوفيق، ويرزقك فيها راحة البال وتحقيق ما تتمنى 🤍";

  const typedTarget = document.getElementById('typedTarget');
  const cursorTitle = document.getElementById('cursorTitle');
  const typedCardTarget = document.getElementById('typedCardTarget');
  const cursorCard = document.getElementById('cursorCard');

  // Sequential Typewriter Function
  function runSequentialTypewriter() {
    typedTarget.textContent = "";
    typedCardTarget.textContent = "";
    cursorCard.classList.add('hidden'); // card cursor hidden initially

    let i = 0;
    // Phase 1: Type English Name
    function typeEnglishName() {
      if (i < englishNameText.length) {
        typedTarget.textContent += englishNameText.charAt(i);
        i++;
        setTimeout(typeEnglishName, 105 + (Math.random() * 30 - 15));
      } else {
        // Finished Phase 1: hide title cursor and activate card cursor
        setTimeout(() => {
          cursorTitle.classList.add('hidden');
          cursorCard.classList.remove('hidden');
          typeArabicCard();
        }, 350);
      }
    }

    // Phase 2: Type Arabic Card Message
    let j = 0;
    function typeArabicCard() {
      if (j < arabicCardText.length) {
        typedCardTarget.textContent += arabicCardText.charAt(j);
        j++;
        setTimeout(typeArabicCard, 55 + (Math.random() * 25 - 10));
      } else {
        // Typing fully completed: celebratory golden sparkle burst
        setTimeout(() => {
          if (typeof confetti === 'function') {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.35 },
              colors: ['#ffd166', '#ffb703', '#ffffff']
            });
          }
        }, 300);
      }
    }

    // Start with slight initial delay
    setTimeout(typeEnglishName, 400);
  }

  runSequentialTypewriter();

  // 4. Background Ambience: Twinkling Stars & Subtle Balloons
  createTwinklingStars();
  startBalloonSpawning();

  // 5. DOM Elements
  const confettiBtn = document.getElementById('confettiBtn');
  const blowCandlesBtn = document.getElementById('blowCandlesBtn');
  const candleBtnText = document.getElementById('candleBtnText');
  const candleEmoji = document.getElementById('candleEmoji');
  const celebrationBanner = document.getElementById('celebrationBanner');
  const relightBtn = document.getElementById('relightBtn');

  // Wishes Elements
  const openWishModalBtn = document.getElementById('openWishModalBtn');
  const wishModal = document.getElementById('wishModal');
  const closeWishModalBtn = document.getElementById('closeWishModalBtn');
  const wishForm = document.getElementById('wishForm');
  const wishMessageInput = document.getElementById('wishMessageInput');

  // Ahmed's WhatsApp number (international format without +)
  const WHATSAPP_NUMBER = '201558262776';

  // 7. Confetti / Fireworks Button
  confettiBtn.addEventListener('click', () => {
    audioSynth.playCheerChime();
    fireCelebrationConfetti();
    spawnBatchBalloons(6);
  });

  // 8. Blow Out Candles Interaction
  blowCandlesBtn.addEventListener('click', () => {
    if (cake.isCandlesLit) {
      // Sound: Blow out wind & celebratory chime
      audioSynth.playBlowCandleSound();
      setTimeout(() => audioSynth.playCheerChime(), 320);

      // Blow cake candles
      cake.blowOutCandles();
      

      // UI updates
      blowCandlesBtn.classList.add('blown');
      candleBtnText.textContent = 'الشموع منطفئة ✨';
      candleEmoji.textContent = '✨';
      celebrationBanner.classList.remove('hidden');

      // Grand Fireworks Confetti Burst
      fireCelebrationConfetti();
      spawnBatchBalloons(10);
    } else {
      relight();
    }
  });

  relightBtn.addEventListener('click', relight);

  function relight() {
    cake.relightCandles();
    blowCandlesBtn.classList.remove('blown');
    candleBtnText.textContent = 'اطفئ الشموع';
    candleEmoji.textContent = '🕯️';
    celebrationBanner.classList.add('hidden');
    audioSynth.playTone(880, 0.4, 'triangle', 0.2);
  }

  // Wishes Modals Logic
  openWishModalBtn.addEventListener('click', () => {
    wishModal.classList.remove('hidden');
    wishMessageInput.focus();
  });

  closeWishModalBtn.addEventListener('click', () => {
    wishModal.classList.add('hidden');
  });

  wishModal.addEventListener('click', (e) => {
    if (e.target === wishModal) wishModal.classList.add('hidden');
  });

  wishForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = wishMessageInput.value.trim();
    if (!message) return;

    // Open WhatsApp chat with the message as-is (no prefix)
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, '_blank');

    wishForm.reset();
    wishModal.classList.add('hidden');

    audioSynth.playCheerChime();
    fireCelebrationConfetti();
  });

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 9. Grand Celebration Confetti (Canvas Confetti)
  function fireCelebrationConfetti() {
    if (typeof confetti !== 'function') return;

    const count = 180;
    const defaults = { origin: { y: 0.65 } };

    function fire(particleRatio, opts) {
      confetti(Object.assign({}, defaults, opts, {
        particleCount: Math.floor(count * particleRatio)
      }));
    }

    fire(0.25, {
      spread: 30,
      startVelocity: 55,
      colors: ['#ffd166', '#ffb703', '#ffffff']
    });
    fire(0.2, {
      spread: 60,
      colors: ['#ffe066', '#f72585', '#b5179e']
    });
    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.85
    });
    fire(0.1, {
      spread: 120,
      startVelocity: 28,
      decay: 0.92,
      scalar: 1.2
    });
  }

  // 10. Star Particles
  function createTwinklingStars() {
    const container = document.getElementById('starsContainer');
    if (!container) return;
    const count = 55;

    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      const size = Math.random() * 2.5 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.setProperty('--duration', `${(Math.random() * 3 + 2).toFixed(1)}s`);
      star.style.animationDelay = `${(Math.random() * 4).toFixed(1)}s`;
      container.appendChild(star);
    }
  }

  // 11. Subtle Floating Balloons
  function createBalloon() {
    const container = document.getElementById('balloonsContainer');
    if (!container) return;

    const balloon = document.createElement('div');
    balloon.className = 'balloon';

    const colors = [
      'radial-gradient(circle at 35% 35%, #ffd166, #ffb703)',
      'radial-gradient(circle at 35% 35%, #ff70a6, #f72585)',
      'radial-gradient(circle at 35% 35%, #80bfff, #4cc9f0)',
      'radial-gradient(circle at 35% 35%, #d4af37, #996515)'
    ];

    const size = Math.random() * 22 + 32;
    balloon.style.width = `${size}px`;
    balloon.style.height = `${size * 1.25}px`;
    balloon.style.left = `${Math.random() * 95}%`;
    balloon.style.background = colors[Math.floor(Math.random() * colors.length)];
    balloon.style.animationDuration = `${(Math.random() * 6 + 12).toFixed(1)}s`;

    container.appendChild(balloon);

    setTimeout(() => {
      balloon.remove();
    }, 18000);
  }

  function startBalloonSpawning() {
    for (let i = 0; i < 3; i++) {
      setTimeout(createBalloon, i * 2000);
    }
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        createBalloon();
      }
    }, 4200);
  }

  function spawnBatchBalloons(num) {
    for (let i = 0; i < num; i++) {
      setTimeout(createBalloon, i * 180);
    }
  }
});
