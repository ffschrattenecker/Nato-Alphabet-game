// NATO Phonetic Alphabet Dataset
const NATO_ALPHABET = [
  { letter: 'A', word: 'Alpha', phonetic: 'AL-fah' },
  { letter: 'B', word: 'Bravo', phonetic: 'BRAH-voh' },
  { letter: 'C', word: 'Charlie', phonetic: 'CHAR-lee' },
  { letter: 'D', word: 'Delta', phonetic: 'DELL-tah' },
  { letter: 'E', word: 'Echo', phonetic: 'ECK-oh' },
  { letter: 'F', word: 'Foxtrot', phonetic: 'FOKS-trot' },
  { letter: 'G', word: 'Golf', phonetic: 'GOLF' },
  { letter: 'H', word: 'Hotel', phonetic: 'hoh-TELL' },
  { letter: 'I', word: 'India', phonetic: 'IN-dee-ah' },
  { letter: 'J', word: 'Juliett', phonetic: 'JEW-lee-ETT' },
  { letter: 'K', word: 'Kilo', phonetic: 'KEY-loh' },
  { letter: 'L', word: 'Lima', phonetic: 'LEE-mah' },
  { letter: 'M', word: 'Mike', phonetic: 'MIKE' },
  { letter: 'N', word: 'November', phonetic: 'no-VEM-ber' },
  { letter: 'O', word: 'Oscar', phonetic: 'OSS-cah' },
  { letter: 'P', word: 'Papa', phonetic: 'pah-PAH' },
  { letter: 'Q', word: 'Quebec', phonetic: 'keh-BECK' },
  { letter: 'R', word: 'Romeo', phonetic: 'ROW-me-oh' },
  { letter: 'S', word: 'Sierra', phonetic: 'see-AIR-rah' },
  { letter: 'T', word: 'Tango', phonetic: 'TANG-go' },
  { letter: 'U', word: 'Uniform', phonetic: 'YOU-nee-form' },
  { letter: 'V', word: 'Victor', phonetic: 'VIK-tah' },
  { letter: 'W', word: 'Whiskey', phonetic: 'WISS-key' },
  { letter: 'X', word: 'X-ray', phonetic: 'ECKS-ray' },
  { letter: 'Y', word: 'Yankee', phonetic: 'YANG-key' },
  { letter: 'Z', word: 'Zulu', phonetic: 'ZOO-loo' }
];

// Spelling words bank (Challenging & diverse words to ensure complete letter coverage)
const SPELLING_WORDS = [
  'ALPHABET', 'ASTRONAUT', 'ZEBRA', 'QUARTZ', 'JUXTAPOSE', 'EQUINOX', 
  'MYSTIQUE', 'VOLCANO', 'KEYBOARD', 'LABYRINTH', 'WAVELENGTH', 'CHALLENGE', 
  'PHARAOH', 'WHISKEY', 'OXYGEN', 'ZEALOUS', 'BICYCLE', 'FREQUENCY', 
  'HARMONY', 'JIGSAW', 'KNIGHT', 'NAVIGATOR', 'QUADRANT', 'VORTEX', 
  'WIZARD', 'XYLOPHONE', 'YESTERDAY', 'ZODIAC', 'SQUEEZE', 'JOURNEY'
];

// App State
let state = {
  currentMode: 'flashcards',
  score: 0,
  streak: 0,
  highscore: 0,
  audioEnabled: true,
  flashcardIndex: 0,
  
  // Type-In Mode variables
  typeinLetter: '',
  typeinAnswered: false,

  // Spelling Mode variables
  spellingWord: '',
  spellingIndex: 0,
  spellingCompleted: false,

  // Letter specific mastery statistics
  letterStats: {}
};

// DOM Cache
const dom = {
  // Navigation
  tabs: {
    flashcards: document.getElementById('tab-flashcards'),
    stats: document.getElementById('tab-stats'),
    typein: document.getElementById('tab-typein'),
    spelling: document.getElementById('tab-spelling'),
    reference: document.getElementById('tab-reference')
  },
  screens: {
    flashcards: document.getElementById('screen-flashcards'),
    stats: document.getElementById('screen-stats'),
    typein: document.getElementById('screen-typein'),
    spelling: document.getElementById('screen-spelling'),
    reference: document.getElementById('screen-reference')
  },
  // Global displays
  score: document.getElementById('score-display'),
  streak: document.getElementById('streak-display'),
  highscore: document.getElementById('highscore-display'),
  audioToggle: document.getElementById('btn-audio-toggle'),
  resetStats: document.getElementById('btn-reset-stats'),
  
  // Flashcards Screen
  flashcardContainer: document.getElementById('flashcard-container'),
  flashcard: document.getElementById('flashcard'),
  cardFrontLetter: document.getElementById('card-front-letter'),
  cardBackWord: document.getElementById('card-back-word'),
  cardBackPhonetic: document.getElementById('card-back-phonetic'),
  btnPrevCard: document.getElementById('btn-prev-card'),
  btnNextCard: document.getElementById('btn-next-card'),
  btnSpeakCard: document.getElementById('btn-speak-card'),

  // Stats Screen
  statsAccuracy: document.getElementById('stats-accuracy'),
  statsTotalAttempts: document.getElementById('stats-total-attempts'),
  statsWeakestLetter: document.getElementById('stats-weakest-letter'),
  masteryGrid: document.getElementById('mastery-grid'),

  // Type-In Screen
  typeinTargetLetter: document.getElementById('typein-target-letter'),
  typeinInput: document.getElementById('typein-input'),
  btnSubmitTypein: document.getElementById('btn-submit-typein'),
  typeinFeedback: document.getElementById('typein-feedback'),

  // Spelling Screen
  spellingWordContainer: document.getElementById('spelling-word-container'),
  spellingCurrentChar: document.getElementById('spelling-current-char'),
  spellingInput: document.getElementById('spelling-input'),
  btnSubmitSpelling: document.getElementById('btn-submit-spelling'),
  spellingFeedback: document.getElementById('spelling-feedback'),

  // Reference Cheat Sheet
  refSearch: document.getElementById('ref-search'),
  refGrid: document.getElementById('ref-grid')
};

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
  loadStats();
  initNavigation();
  initGlobalListeners();
  initReferenceSheet();
  
  // Start the default screen
  switchMode('flashcards');
});

// --- AUDIO (Text-To-Speech) SYSTEM ---
function speak(text) {
  if (!state.audioEnabled) return;
  if ('speechSynthesis' in window) {
    // Cancel any active speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9; // Slightly slower for clear phonetic spelling pronunciation
    utterance.pitch = 1.0;
    
    // Choose an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice = voices.find(voice => voice.lang.startsWith('en'));
    if (enVoice) {
      utterance.voice = enVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

// Make sure voices are loaded (Chrome/Safari async issue)
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}

// --- PERSISTENCE & STATS ---
function loadStats() {
  const savedScore = localStorage.getItem('nato_score');
  const savedStreak = localStorage.getItem('nato_streak');
  const savedHighScore = localStorage.getItem('nato_highscore');
  const savedAudio = localStorage.getItem('nato_audio');
  const savedLetterStats = localStorage.getItem('nato_letter_stats');
  
  if (savedScore !== null) state.score = parseInt(savedScore, 10);
  if (savedStreak !== null) state.streak = parseInt(savedStreak, 10);
  if (savedHighScore !== null) state.highscore = parseInt(savedHighScore, 10);
  if (savedAudio !== null) state.audioEnabled = savedAudio === 'true';
  
  if (savedLetterStats !== null) {
    state.letterStats = JSON.parse(savedLetterStats);
  } else {
    state.letterStats = {};
    NATO_ALPHABET.forEach(item => {
      state.letterStats[item.letter] = { correct: 0, total: 0 };
    });
  }
  
  updateStatsDisplay();
}

function updateStatsDisplay() {
  dom.score.textContent = state.score;
  dom.streak.textContent = `🔥 ${state.streak}`;
  dom.highscore.textContent = state.highscore;
  
  if (state.audioEnabled) {
    dom.audioToggle.classList.add('active');
    dom.audioToggle.textContent = '🔊';
  } else {
    dom.audioToggle.classList.remove('active');
    dom.audioToggle.textContent = '🔇';
  }
}

function recordAnswer(isCorrect) {
  if (isCorrect) {
    state.score += 10;
    state.streak++;
    if (state.score > state.highscore) {
      state.highscore = state.score;
    }
  } else {
    state.streak = 0;
  }
  
  localStorage.setItem('nato_score', state.score);
  localStorage.setItem('nato_streak', state.streak);
  localStorage.setItem('nato_highscore', state.highscore);
  updateStatsDisplay();
}

function recordLetterAttempt(letter, isCorrect) {
  letter = letter.toUpperCase();
  if (!state.letterStats[letter]) {
    state.letterStats[letter] = { correct: 0, total: 0 };
  }
  state.letterStats[letter].total++;
  if (isCorrect) {
    state.letterStats[letter].correct++;
  }
  localStorage.setItem('nato_letter_stats', JSON.stringify(state.letterStats));
}

function resetAllStats() {
  if (confirm("Are you sure you want to reset all your stats and high scores?")) {
    state.score = 0;
    state.streak = 0;
    state.highscore = 0;
    state.letterStats = {};
    NATO_ALPHABET.forEach(item => {
      state.letterStats[item.letter] = { correct: 0, total: 0 };
    });
    localStorage.removeItem('nato_score');
    localStorage.removeItem('nato_streak');
    localStorage.removeItem('nato_highscore');
    localStorage.removeItem('nato_letter_stats');
    updateStatsDisplay();
  }
}

// --- GLOBAL LISTENERS ---
function initGlobalListeners() {
  // Audio toggle button
  dom.audioToggle.addEventListener('click', () => {
    state.audioEnabled = !state.audioEnabled;
    localStorage.setItem('nato_audio', state.audioEnabled);
    updateStatsDisplay();
    if (state.audioEnabled) {
      speak("Audio enabled");
    }
  });

  // Reset button
  dom.resetStats.addEventListener('click', resetAllStats);
}

// --- NAVIGATION SYSTEM ---
function initNavigation() {
  Object.keys(dom.tabs).forEach(mode => {
    dom.tabs[mode].addEventListener('click', () => {
      switchMode(mode);
    });
  });
}

function switchMode(mode) {
  state.currentMode = mode;
  
  // Update Tabs
  Object.keys(dom.tabs).forEach(key => {
    const tab = dom.tabs[key];
    const isActive = key === mode;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Update Screens
  Object.keys(dom.screens).forEach(key => {
    dom.screens[key].classList.toggle('active', key === mode);
  });

  // Mode Specific Init Actions
  if (mode === 'flashcards') {
    renderFlashcard();
  } else if (mode === 'stats') {
    renderStatsDashboard();
  } else if (mode === 'typein') {
    nextTypeinQuestion();
  } else if (mode === 'spelling') {
    nextSpellingWord();
  }
}

// --- FLASHCARDS MODE ---
dom.flashcardContainer.addEventListener('click', () => {
  dom.flashcard.classList.toggle('flipped');
  // If flipping to back side, speak the phonetic word
  if (dom.flashcard.classList.contains('flipped')) {
    const item = NATO_ALPHABET[state.flashcardIndex];
    speak(item.word);
  }
});

dom.btnPrevCard.addEventListener('click', (e) => {
  e.stopPropagation();
  dom.flashcard.classList.remove('flipped');
  state.flashcardIndex = (state.flashcardIndex - 1 + 26) % 26;
  setTimeout(renderFlashcard, 150);
});

dom.btnNextCard.addEventListener('click', (e) => {
  e.stopPropagation();
  dom.flashcard.classList.remove('flipped');
  state.flashcardIndex = (state.flashcardIndex + 1) % 26;
  setTimeout(renderFlashcard, 150);
});

dom.btnSpeakCard.addEventListener('click', (e) => {
  e.stopPropagation();
  const item = NATO_ALPHABET[state.flashcardIndex];
  speak(item.word);
});

function renderFlashcard() {
  const item = NATO_ALPHABET[state.flashcardIndex];
  dom.cardFrontLetter.textContent = item.letter;
  dom.cardBackWord.textContent = item.word;
  dom.cardBackPhonetic.textContent = `[${item.phonetic}]`;
}

// --- STATISTICS DASHBOARD MODE ---
function renderStatsDashboard() {
  let totalAttempts = 0;
  let totalCorrect = 0;
  let weakestLetter = '-';
  let minAccuracy = 101; // higher than 100
  
  // Clear grid
  dom.masteryGrid.innerHTML = '';
  
  NATO_ALPHABET.forEach(item => {
    const stats = state.letterStats[item.letter] || { correct: 0, total: 0 };
    totalAttempts += stats.total;
    totalCorrect += stats.correct;
    
    // Create element
    const el = document.createElement('div');
    el.className = 'mastery-item';
    
    let accuracy = 0;
    if (stats.total === 0) {
      el.classList.add('unattempted');
      el.title = `${item.letter} (${item.word}): Not attempted yet`;
      el.innerHTML = `<span>${item.letter}</span><span class="mastery-count">-</span>`;
    } else {
      accuracy = Math.round((stats.correct / stats.total) * 100);
      
      if (accuracy >= 80) {
        el.classList.add('excellent');
      } else if (accuracy >= 50) {
        el.classList.add('good');
      } else if (accuracy > 0) {
        el.classList.add('warning');
      } else {
        el.classList.add('danger');
      }
      
      // Keep track of weakest letter (must have attempts)
      if (accuracy < minAccuracy) {
        minAccuracy = accuracy;
        weakestLetter = item.letter;
      }
      
      el.title = `${item.letter} (${item.word}): ${stats.correct}/${stats.total} correct (${accuracy}%)`;
      el.innerHTML = `<span>${item.letter}</span><span class="mastery-count">${stats.correct}/${stats.total}</span>`;
    }
    
    // Add click to speak
    el.addEventListener('click', () => {
      speak(item.word);
    });
    
    dom.masteryGrid.appendChild(el);
  });
  
  // Render overall summary
  const overallAccuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  dom.statsAccuracy.textContent = `${overallAccuracy}%`;
  dom.statsTotalAttempts.textContent = totalAttempts;
  dom.statsWeakestLetter.textContent = weakestLetter !== '-' ? `${weakestLetter} (${minAccuracy}%)` : '-';
}

// --- TYPE-IN MODE ---
function nextTypeinQuestion() {
  state.typeinAnswered = false;
  dom.typeinFeedback.textContent = '';
  dom.typeinFeedback.className = 'feedback-box';
  dom.typeinInput.value = '';
  dom.typeinInput.className = 'type-input';
  dom.typeinInput.disabled = false;
  
  const randomItem = NATO_ALPHABET[Math.floor(Math.random() * NATO_ALPHABET.length)];
  state.typeinLetter = randomItem.letter;
  dom.typeinTargetLetter.textContent = randomItem.letter;
  
  dom.typeinInput.focus();
}

function checkTypeinAnswer() {
  if (state.typeinAnswered) return;
  
  const userAnswer = dom.typeinInput.value.trim().toLowerCase();
  if (!userAnswer) return;
  
  state.typeinAnswered = true;
  dom.typeinInput.disabled = true;
  
  const correctItem = NATO_ALPHABET.find(item => item.letter === state.typeinLetter);
  const isCorrect = userAnswer === correctItem.word.toLowerCase();
  recordAnswer(isCorrect);
  recordLetterAttempt(state.typeinLetter, isCorrect);
  
  if (isCorrect) {
    dom.typeinInput.classList.add('correct');
    dom.typeinFeedback.textContent = `Correct! It's ${correctItem.word}.`;
    dom.typeinFeedback.classList.add('correct');
    speak(correctItem.word);
    setTimeout(nextTypeinQuestion, 1200);
  } else {
    dom.typeinInput.classList.add('incorrect');
    dom.typeinFeedback.textContent = `Oops! Correct answer is: ${correctItem.word}`;
    dom.typeinFeedback.classList.add('incorrect');
    speak(correctItem.word);
    setTimeout(nextTypeinQuestion, 2000);
  }
}

dom.btnSubmitTypein.addEventListener('click', checkTypeinAnswer);
dom.typeinInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkTypeinAnswer();
});

// --- SPELLING MODE ---
function nextSpellingWord() {
  state.spellingCompleted = false;
  dom.spellingFeedback.textContent = '';
  dom.spellingFeedback.className = 'feedback-box';
  dom.spellingInput.value = '';
  dom.spellingInput.className = 'type-input';
  dom.spellingInput.disabled = false;
  
  // Pick random word
  state.spellingWord = SPELLING_WORDS[Math.floor(Math.random() * SPELLING_WORDS.length)];
  state.spellingIndex = 0;
  
  // Render letter lines
  dom.spellingWordContainer.innerHTML = '';
  for (let i = 0; i < state.spellingWord.length; i++) {
    const span = document.createElement('span');
    span.className = 'spelling-letter';
    span.textContent = state.spellingWord[i];
    if (i === 0) span.classList.add('active');
    dom.spellingWordContainer.appendChild(span);
  }
  
  updateSpellingPrompt();
  dom.spellingInput.focus();
}

function updateSpellingPrompt() {
  const char = state.spellingWord[state.spellingIndex];
  dom.spellingCurrentChar.textContent = char;
  
  // Update target letters classes
  const spans = dom.spellingWordContainer.querySelectorAll('.spelling-letter');
  spans.forEach((span, index) => {
    span.classList.toggle('active', index === state.spellingIndex);
    span.classList.toggle('completed', index < state.spellingIndex);
  });
}

function checkSpellingInput() {
  if (state.spellingCompleted) return;
  
  const inputVal = dom.spellingInput.value.trim().toLowerCase();
  if (!inputVal) return;
  
  const targetChar = state.spellingWord[state.spellingIndex];
  const targetWordItem = NATO_ALPHABET.find(item => item.letter === targetChar);
  const isCorrect = inputVal === targetWordItem.word.toLowerCase();
  
  if (isCorrect) {
    // Play sound & update score
    speak(targetWordItem.word);
    recordAnswer(true);
    recordLetterAttempt(targetChar, true);
    
    // Animate correct input flash
    dom.spellingInput.classList.add('correct');
    setTimeout(() => dom.spellingInput.classList.remove('correct'), 500);
    
    dom.spellingInput.value = '';
    state.spellingIndex++;
    
    if (state.spellingIndex >= state.spellingWord.length) {
      // Word Complete!
      state.spellingCompleted = true;
      dom.spellingInput.disabled = true;
      
      const completedSpans = dom.spellingWordContainer.querySelectorAll('.spelling-letter');
      completedSpans.forEach(span => span.classList.add('completed'));
      
      dom.spellingFeedback.textContent = `🎉 Fantastic! You spelled "${state.spellingWord}" perfectly!`;
      dom.spellingFeedback.classList.add('correct');
      
      // Speak final word
      setTimeout(() => speak(state.spellingWord), 400);
      
      setTimeout(nextSpellingWord, 2200);
    } else {
      updateSpellingPrompt();
    }
  } else {
    // Incorrect entry
    recordAnswer(false);
    recordLetterAttempt(targetChar, false);
    dom.spellingInput.classList.add('incorrect');
    dom.spellingFeedback.textContent = `Incorrect! Try again.`;
    dom.spellingFeedback.classList.add('incorrect');
    
    setTimeout(() => {
      dom.spellingInput.classList.remove('incorrect');
      dom.spellingInput.value = '';
      dom.spellingInput.focus();
    }, 1000);
  }
}

dom.btnSubmitSpelling.addEventListener('click', checkSpellingInput);
dom.spellingInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkSpellingInput();
});

// --- REFERENCE SHEET SYSTEM ---
function initReferenceSheet() {
  // Populate the cheat sheet grid
  renderReferenceGrid(NATO_ALPHABET);
  
  // Search listener
  dom.refSearch.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const filtered = NATO_ALPHABET.filter(item => 
      item.letter.toLowerCase().includes(query) || 
      item.word.toLowerCase().includes(query)
    );
    renderReferenceGrid(filtered);
  });
}

function renderReferenceGrid(data) {
  dom.refGrid.innerHTML = '';
  if (data.length === 0) {
    dom.refGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-muted);">No matching phonetic codes found.</div>';
    return;
  }
  
  data.forEach(item => {
    const itemEl = document.createElement('div');
    itemEl.className = 'ref-item';
    itemEl.setAttribute('role', 'listitem');
    itemEl.setAttribute('tabindex', '0');
    
    itemEl.innerHTML = `
      <span class="ref-letter">${item.letter}</span>
      <span class="ref-word">${item.word}</span>
      <span class="ref-sound">🔊</span>
    `;
    
    // Add audio click trigger
    itemEl.addEventListener('click', () => {
      speak(item.word);
    });

    itemEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        speak(item.word);
      }
    });
    
    dom.refGrid.appendChild(itemEl);
  });
}
