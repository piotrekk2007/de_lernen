// ===== BADGES DEFINITION =====
const BADGES_DEF = [
  { id:'first_test',   icon:'🎯', name:'Pierwszy test',       desc:'Ukończ swój pierwszy test' },
  { id:'perfect',      icon:'💯', name:'Perfekcja!',          desc:'Zdobądź 100% w teście' },
  { id:'perfect3',     icon:'👑', name:'Trzy razy 100%',      desc:'Trzy razy z rzędu 100%' },
  { id:'streak3',      icon:'🔥', name:'3 dni z rzędu',       desc:'Ucz się 3 dni z rzędu' },
  { id:'streak7',      icon:'🌟', name:'Tygodniowa passa',    desc:'Ucz się 7 dni z rzędu' },
  { id:'streak14',     icon:'⚡', name:'Dwa tygodnie!',       desc:'Ucz się 14 dni z rzędu' },
  { id:'streak30',     icon:'🚀', name:'Miesiąc nauki!',      desc:'Ucz się 30 dni z rzędu' },
  { id:'five_tests',   icon:'📊', name:'5 testów',            desc:'Ukończ 5 testów' },
  { id:'twenty_tests', icon:'🏅', name:'20 testów',           desc:'Ukończ 20 testów' },
  { id:'fifty_tests',  icon:'🥇', name:'50 testów',           desc:'Ukończ 50 testów' },
  { id:'all_sets',     icon:'🏆', name:'Kolekcjoner',         desc:'Stwórz 3 zestawy słówek' },
  { id:'five_sets',    icon:'📚', name:'Biblioteka',          desc:'Stwórz 5 zestawów słówek' },
  { id:'words50',      icon:'✨', name:'50 słówek',           desc:'Miej 50 słówek w zestawach' },
  { id:'words100',     icon:'💎', name:'100 słówek!',         desc:'Miej 100 słówek w zestawach' },
  { id:'song_added',   icon:'🎵', name:'Muzyk',               desc:'Dodaj swoją pierwszą piosenkę' },
  { id:'songs3',       icon:'🎤', name:'Meloman',             desc:'Dodaj 3 piosenki' },
  { id:'text_added',   icon:'📰', name:'Czytelnik',           desc:'Dodaj swój pierwszy tekst' },
  { id:'texts3',       icon:'📖', name:'Bibliofil',           desc:'Dodaj 3 teksty' },
  { id:'three_good',   icon:'😎', name:'Passa wyników',       desc:'Trzy razy powyżej 80%' },
  { id:'improved',     icon:'📈', name:'Coraz lepiej!',       desc:'Popraw swój poprzedni wynik' },
];

// ===== STORAGE =====
const DB = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; } },
  set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
};

function getSets()     { return DB.get('de_sets') || []; }
function saveSets(s)   { DB.set('de_sets', s); }
function getSongs()    { return DB.get('de_songs') || []; }
function saveSongs(s)  { DB.set('de_songs', s); }
function getTexts()    { return DB.get('de_texts') || []; }
function saveTexts(t)  { DB.set('de_texts', t); }
function getProgress() { return DB.get('de_progress') || { streak: { lastDate: null, count: 0 }, badges: [], history: [] }; }
function saveProgress(p) { DB.set('de_progress', p); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

// ===== STREAK =====
function updateStreak() {
  const prog = getProgress();
  const today = new Date().toISOString().slice(0, 10);
  const last = prog.streak.lastDate;
  if (last === today) return prog;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (last === yesterday) { prog.streak.count += 1; }
  else { prog.streak.count = 1; }
  prog.streak.lastDate = today;
  saveProgress(prog);
  return prog;
}

// ===== ROUTER =====
let currentSetId  = null;
let currentSongId = null;
let currentTextId = null;

function showView(name, params = {}) {
  document.querySelectorAll('.view').forEach(v => v.style.display = 'none');
  const el = document.getElementById('view-' + name);
  if (!el) return;
  el.style.display = '';

  if (name === 'home')           renderHome();
  if (name === 'sets-list')      renderSetsList();
  if (name === 'set-edit')       initSetEdit(params.id || null);
  if (name === 'set-detail')     { currentSetId = params.id; renderSetDetail(params.id); }
  if (name === 'songs-list')     renderSongsList();
  if (name === 'song-edit')      initSongEdit(params.id || null);
  if (name === 'song-detail')    { currentSongId = params.id; renderSongDetail(params.id); }
  if (name === 'song-translate') { currentSongId = params.id; renderTranslate(params.id); }
  if (name === 'song-extract')   { currentSongId = params.id; renderExtract(params.id); }
  if (name === 'texts-list')     renderTextsList();
  if (name === 'text-edit')      initTextEdit(params.id || null);
  if (name === 'text-detail')    { currentTextId = params.id; renderTextDetail(params.id); }
  if (name === 'text-translate') { currentTextId = params.id; renderTextTranslate(params.id); }
  if (name === 'text-extract')   { currentTextId = params.id; renderTextExtract(params.id); }
  if (name === 'hangman')        {} // initialized by startHangman()
  if (name === 'match')          {} // initialized by startMatch()
  if (name === 'progress')       renderProgress();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== HOME =====
function renderHome() {
  const prog = updateStreak();
  const streak = prog.streak.count;
  document.getElementById('hero-greeting').textContent = 'Guten Tag! 👋';
  document.getElementById('hero-streak').textContent =
    streak > 1 ? `🔥 ${streak} dni z rzędu! Weiter so!`
    : streak === 1 ? '🌟 Zaczynamy dzisiaj!'
    : 'Ucz się codziennie, żeby zbudować passę!';

  const sets = getSets();
  const recent = document.getElementById('home-recent');
  if (sets.length === 0) { recent.innerHTML = ''; return; }
  const lastSet = [...sets].sort((a, b) => (b.lastUsed || 0) - (a.lastUsed || 0))[0];
  recent.innerHTML = `
    <h2>Ostatnio ćwiczone</h2>
    <div class="sets-grid" style="max-width:300px">
      ${renderSetCard(lastSet)}
    </div>`;
}

// ===== SETS LIST =====
function renderSetsList() {
  const sets = getSets();
  const grid = document.getElementById('sets-grid');
  if (sets.length === 0) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📚</div>
      <p>Nie masz jeszcze żadnych zestawów.<br>Stwórz pierwszy!</p>
      <button class="btn btn-primary btn-large" onclick="showView('set-edit',{id:null})">+ Nowy zestaw</button>
    </div>`;
    return;
  }
  grid.innerHTML = sets.map(renderSetCard).join('');
}

function renderSetCard(s) {
  const best = s.results && s.results.length ? Math.max(...s.results.map(r => r.score)) : 0;
  return `<div class="set-card" onclick="showView('set-detail',{id:'${s.id}'})">
    <div class="set-card-icon">${s.icon || '📚'}</div>
    <div class="set-card-name">${esc(s.name)}</div>
    <div class="set-card-count">${s.words.length} słówek</div>
    <div class="set-card-bar"><div class="set-card-fill" style="width:${best}%"></div></div>
    <div style="font-size:.78rem;color:var(--text-muted);margin-top:4px">Najlepszy wynik: ${best}%</div>
  </div>`;
}

// ===== SET EDIT =====
const EMOJIS = ['📚','🌍','🏛️','✈️','🏠','🍺','🎭','⚽','🎨','📰','🎓','💼','🔢','🗺️','🌱','🎯','🏅','💡'];
let editingSetId = null;
let selectedEmoji = '📚';

function initSetEdit(id) {
  editingSetId = id;
  selectedEmoji = '📚';
  document.getElementById('set-edit-title').textContent = id ? 'Edytuj zestaw' : 'Nowy zestaw';
  document.getElementById('delete-set-btn').style.display = id ? '' : 'none';
  document.getElementById('bulk-input').value = '';

  const emojiPicker = document.getElementById('emoji-picker');
  emojiPicker.innerHTML = EMOJIS.map(e =>
    `<span class="emoji-opt${e === selectedEmoji ? ' selected' : ''}" onclick="selectEmoji('${e}')">${e}</span>`
  ).join('');

  if (id) {
    const set = getSets().find(s => s.id === id);
    if (!set) return;
    document.getElementById('set-name-input').value = set.name;
    selectedEmoji = set.icon || '📚';
    document.querySelectorAll('.emoji-opt').forEach(el => {
      el.classList.toggle('selected', el.textContent === selectedEmoji);
    });
    renderWordRows(set.words);
  } else {
    document.getElementById('set-name-input').value = '';
    renderWordRows([{ id: uid(), en: '', pl: '' }, { id: uid(), en: '', pl: '' }]);
  }
}

function selectEmoji(e) {
  selectedEmoji = e;
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.toggle('selected', el.textContent === e));
}

function renderWordRows(words) {
  const table = document.getElementById('words-table');
  table.innerHTML = words.map((w) => `
    <div class="word-row" id="row-${w.id}">
      <input type="text" value="${esc(w.en)}" placeholder="Deutsch" class="word-en-input" data-id="${w.id}"
        onkeydown="if(event.key==='Enter')addWordRow()" />
      <input type="text" value="${esc(w.pl)}" placeholder="Polski" class="word-pl-input" data-id="${w.id}"
        onkeydown="if(event.key==='Enter')addWordRow()" />
      <button class="delete-word-btn" onclick="removeWordRow('${w.id}')">✕</button>
    </div>`).join('');
}

function getWordRowsData() {
  return Array.from(document.querySelectorAll('.word-row')).map(row => ({
    id: row.id.replace('row-', ''),
    en: row.querySelector('.word-en-input').value.trim(),
    pl: row.querySelector('.word-pl-input').value.trim(),
  })).filter(w => w.en || w.pl);
}

function addWordRow() {
  const newId = uid();
  const row = document.createElement('div');
  row.className = 'word-row';
  row.id = 'row-' + newId;
  row.innerHTML = `
    <input type="text" placeholder="Deutsch" class="word-en-input" data-id="${newId}"
      onkeydown="if(event.key==='Enter')addWordRow()" />
    <input type="text" placeholder="Polski" class="word-pl-input" data-id="${newId}"
      onkeydown="if(event.key==='Enter')addWordRow()" />
    <button class="delete-word-btn" onclick="removeWordRow('${newId}')">✕</button>`;
  document.getElementById('words-table').appendChild(row);
  row.querySelector('.word-en-input').focus();
}

function removeWordRow(id) {
  const row = document.getElementById('row-' + id);
  if (row) row.remove();
}

function parseBulk() {
  const raw = document.getElementById('bulk-input').value;
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  const words = lines.map(l => {
    const sep = l.includes('=') ? '=' : l.includes('-') ? '-' : null;
    if (!sep) return null;
    const [en, ...rest] = l.split(sep);
    return { id: uid(), en: en.trim(), pl: rest.join(sep).trim() };
  }).filter(Boolean);
  if (!words.length) { showToast('Nie znaleziono słówek. Użyj formatu: deutsch = polski'); return; }
  const existing = getWordRowsData();
  renderWordRows([...existing, ...words]);
  document.getElementById('bulk-input').value = '';
  showToast(`Dodano ${words.length} słówek!`);
}

function saveSet() {
  const name = document.getElementById('set-name-input').value.trim();
  if (!name) { showToast('Podaj nazwę zestawu!'); return; }
  const words = getWordRowsData();
  if (!words.length) { showToast('Dodaj przynajmniej jedno słówko!'); return; }

  const sets = getSets();
  if (editingSetId) {
    const idx = sets.findIndex(s => s.id === editingSetId);
    if (idx >= 0) {
      sets[idx] = { ...sets[idx], name, icon: selectedEmoji, words };
    }
  } else {
    sets.push({ id: uid(), name, icon: selectedEmoji, words, results: [], createdAt: today(), lastUsed: Date.now() });
  }
  saveSets(sets);
  showToast('Zestaw zapisany!');
  showView('sets-list');
}

function deleteSet() {
  showModal('Usuń zestaw', 'Na pewno chcesz usunąć ten zestaw? Nie można tego cofnąć.', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveSets(getSets().filter(s => s.id !== editingSetId));
      closeModal();
      showView('sets-list');
      showToast('Zestaw usunięty.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

function deleteCurrentSet() {
  showModal('Usuń zestaw', 'Na pewno chcesz usunąć ten zestaw? Nie można tego cofnąć.', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveSets(getSets().filter(s => s.id !== currentSetId));
      closeModal();
      showView('sets-list');
      showToast('Zestaw usunięty.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

function exportSet() {
  const words = getWordRowsData();
  const name = document.getElementById('set-name-input').value.trim() || 'zestaw';
  const data = { name, icon: selectedEmoji, words };
  downloadJSON(data, `zestaw_${slug(name)}.json`);
  showToast('Plik pobrany!');
}

function importSet() { document.getElementById('import-file').click(); }

function handleImport(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.words || !Array.isArray(data.words)) throw new Error();
      const sets = getSets();
      const newSet = {
        id: uid(),
        name: data.name || 'Importowany zestaw',
        icon: data.icon || '📚',
        words: data.words.map(w => ({ id: uid(), en: w.en || '', pl: w.pl || '' })),
        results: [],
        createdAt: today(),
        lastUsed: Date.now(),
      };
      sets.push(newSet);
      saveSets(sets);
      showToast(`Zaimportowano "${newSet.name}"!`);
      renderSetsList();
    } catch { showToast('Błędny plik JSON!'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ===== SET DETAIL =====
function renderSetDetail(id) {
  const set = getSets().find(s => s.id === id);
  if (!set) { showView('sets-list'); return; }
  document.getElementById('set-detail-title').textContent = `${set.icon || '📚'} ${set.name}`;

  const best = set.results && set.results.length ? Math.max(...set.results.map(r => r.score)) : null;
  const attempts = set.results ? set.results.length : 0;
  document.getElementById('set-detail-stats').innerHTML = `
    <div class="stat-badge"><div class="stat-num">${set.words.length}</div><div class="stat-label">Słówek</div></div>
    <div class="stat-badge"><div class="stat-num">${attempts}</div><div class="stat-label">Testów</div></div>
    <div class="stat-badge"><div class="stat-num">${best !== null ? best + '%' : '—'}</div><div class="stat-label">Najlepszy wynik</div></div>`;

  document.getElementById('set-words-preview').innerHTML = `
    <div class="words-preview-header">
      <h3>Wszystkie słówka (${set.words.length})</h3>
      <button class="btn btn-ghost" id="toggle-words-btn" onclick="toggleWordsList()">Pokaż</button>
    </div>
    <div id="words-list-body" style="display:none">
      ${set.words.map(w => `<div class="words-list-item">
        <span class="word-en">${esc(w.en)}</span>
        <span class="word-pl">${esc(w.pl)}</span>
      </div>`).join('')}
    </div>`;
}

function editCurrentSet() { showView('set-edit', { id: currentSetId }); }

function toggleWordsList() {
  const body = document.getElementById('words-list-body');
  const btn  = document.getElementById('toggle-words-btn');
  const hidden = body.style.display === 'none';
  body.style.display = hidden ? '' : 'none';
  btn.textContent = hidden ? 'Ukryj' : 'Pokaż';
}

// ===== LEARN MODE =====
let learnQueue   = [];
let learnSetId   = null;
let learnCorrect = 0;
let learnTotal   = 0;
let learnReverse = false; // false = DE→PL, true = PL→DE

function startLearn(reverse) {
  const set = getSets().find(s => s.id === currentSetId);
  if (!set || !set.words.length) { showToast('Brak słówek!'); return; }
  learnSetId   = currentSetId;
  learnReverse = reverse || false;
  learnQueue   = shuffle([...set.words]);
  learnCorrect = 0;
  learnTotal   = learnQueue.length;

  document.getElementById('learn-title').textContent = `📖 ${set.name}`;
  updateDirectionBadge('learn');
  showView('learn');
  showLearnWord();
}

function toggleLearnSwap() {
  learnReverse = !learnReverse;
  updateDirectionBadge('learn');
  learnQueue   = shuffle([...getSets().find(s => s.id === learnSetId).words]);
  learnCorrect = 0;
  learnTotal   = learnQueue.length;
  showLearnWord();
}

function updateDirectionBadge(mode) {
  const id = mode === 'learn' ? 'learn-direction-badge' : 'test-direction-badge';
  const rev = mode === 'learn' ? learnReverse : testReverse;
  document.getElementById(id).textContent = rev
    ? '🇵🇱 Polski → 🇩🇪 Deutsch'
    : '🇩🇪 Deutsch → 🇵🇱 Polski';
}

function showLearnWord() {
  if (learnQueue.length === 0) {
    showToast('Koniec! Wszystkie słówka nauczone!');
    showView('set-detail', { id: learnSetId });
    return;
  }
  const word = learnQueue[0];
  const done = learnTotal - learnQueue.length;
  document.getElementById('learn-progress-fill').style.width = (done / learnTotal * 100) + '%';
  document.getElementById('learn-counter').textContent = `${done} / ${learnTotal}`;
  document.getElementById('learn-word').textContent = learnReverse ? word.pl.split('/')[0].trim() : word.en;
  document.getElementById('learn-hint').textContent = learnReverse ? 'Jak to jest po niemiecku?' : 'Jak to jest po polsku?';
  document.getElementById('learn-input').placeholder = learnReverse ? 'Wpisz po niemiecku...' : 'Wpisz po polsku...';
  document.getElementById('learn-input').value = '';
  document.getElementById('learn-input').className = 'learn-answer-input';
  document.getElementById('learn-feedback').style.display = 'none';
  document.getElementById('learn-check-btn').style.display = '';
  setTimeout(() => document.getElementById('learn-input').focus(), 50);
}

function checkLearnAnswer() {
  const word  = learnQueue[0];
  const input = document.getElementById('learn-input');
  const ans   = input.value.trim();
  if (!ans) return;

  const expected = learnReverse ? word.en : word.pl;
  const correct  = isCorrectAnswer(ans, expected);
  document.getElementById('learn-check-btn').style.display = 'none';
  document.getElementById('learn-feedback').style.display = '';
  setTimeout(() => document.getElementById('learn-input').focus(), 50);

  if (correct) {
    input.className = 'learn-answer-input correct';
    document.getElementById('feedback-icon').textContent = '✅';
    document.getElementById('feedback-text').innerHTML = `<span class="correct-answer">Ausgezeichnet!</span> Dokładnie tak!`;
    learnCorrect++;
    learnQueue.shift();
  } else {
    input.className = 'learn-answer-input incorrect';
    document.getElementById('feedback-icon').textContent = '❌';
    document.getElementById('feedback-text').innerHTML = `Twoja odpowiedź: <b style="color:var(--red)">${esc(ans)}</b>`;
    document.getElementById('learn-word').innerHTML =
      `<span style="font-size:0.82rem;color:var(--text-muted);display:block;margin-bottom:4px">Poprawna odpowiedź:</span>` +
      `<span style="color:var(--green);font-size:2rem;font-weight:900">${esc(formatExpected(expected))}</span>`;
    learnQueue.push(learnQueue.shift());
  }
}

function nextLearnWord() { showLearnWord(); }
function exitLearn() { showView('set-detail', { id: learnSetId }); }

// ===== TEST MODE =====
let testQueue    = [];
let testResults  = [];
let testSetId    = null;
let testCurrent  = 0;
let testReverse  = false;

function startTest(reverse) {
  const set = getSets().find(s => s.id === currentSetId);
  if (!set || !set.words.length) { showToast('Brak słówek!'); return; }
  testSetId   = currentSetId;
  testReverse = reverse || false;
  testQueue   = shuffle([...set.words]);
  testResults = [];
  testCurrent = 0;

  document.getElementById('test-title').textContent = `✏️ ${set.name}`;
  updateDirectionBadge('test');
  showView('test');
  showTestWord();
}

function toggleTestSwap() {
  testReverse = !testReverse;
  updateDirectionBadge('test');
  testQueue   = shuffle([...getSets().find(s => s.id === testSetId).words]);
  testResults = [];
  testCurrent = 0;
  showTestWord();
}

function showTestWord() {
  if (testCurrent >= testQueue.length) { finishTest(); return; }
  const word  = testQueue[testCurrent];
  const total = testQueue.length;
  document.getElementById('test-progress-fill').style.width = (testCurrent / total * 100) + '%';
  document.getElementById('test-counter').textContent = `${testCurrent + 1} / ${total}`;
  document.getElementById('test-word').textContent = testReverse ? word.pl.split('/')[0].trim() : word.en;
  document.getElementById('test-input').value = '';
  document.getElementById('test-input').placeholder = testReverse ? 'Wpisz po niemiecku...' : 'Wpisz po polsku...';
  document.getElementById('test-input').className = 'learn-answer-input';
  document.getElementById('test-feedback').style.display = 'none';
  document.getElementById('test-check-btn').style.display = '';
  setTimeout(() => document.getElementById('test-input').focus(), 50);
}

function checkTestAnswer() {
  const word     = testQueue[testCurrent];
  const input    = document.getElementById('test-input');
  const ans      = input.value.trim();
  if (!ans) return;

  const expected = testReverse ? word.en : word.pl;
  const correct  = isCorrectAnswer(ans, expected);
  testResults.push({ word, ans, correct, expected });
  document.getElementById('test-check-btn').style.display = 'none';
  document.getElementById('test-feedback').style.display = '';

  if (correct) {
    input.className = 'learn-answer-input correct';
    document.getElementById('test-feedback-icon').textContent = '✅';
    document.getElementById('test-feedback-text').innerHTML = `<span class="correct-answer">Richtig!</span>`;
  } else {
    input.className = 'learn-answer-input incorrect';
    document.getElementById('test-feedback-icon').textContent = '❌';
    document.getElementById('test-feedback-text').innerHTML = `Poprawnie: <span class="correct-answer">${esc(formatExpected(expected))}</span>`;
  }
}

function nextTestWord() { testCurrent++; showTestWord(); }

function finishTest() {
  const total   = testResults.length;
  const correct = testResults.filter(r => r.correct).length;
  const pct     = Math.round(correct / total * 100);
  const stars   = pct >= 90 ? 3 : pct >= 60 ? 2 : 1;

  const sets = getSets();
  const idx  = sets.findIndex(s => s.id === testSetId);
  if (idx >= 0) {
    if (!sets[idx].results) sets[idx].results = [];
    sets[idx].results.push({ date: today(), score: pct, total, correct });
    sets[idx].lastUsed = Date.now();
    saveSets(sets);
  }

  const prog = getProgress();
  const set  = getSets().find(s => s.id === testSetId);
  prog.history.unshift({ date: today(), setName: set ? set.name : '?', score: pct, correct, total, stars });
  prog.history = prog.history.slice(0, 50);
  checkBadges(prog, pct, getSets());
  saveProgress(prog);

  document.getElementById('result-emoji').textContent = pct === 100 ? '🎉' : pct >= 80 ? '😄' : pct >= 50 ? '🙂' : '💪';
  document.getElementById('result-title').textContent = pct === 100 ? 'Perfekt!' : pct >= 80 ? 'Sehr gut!' : pct >= 50 ? 'Nicht schlecht!' : 'Weiter üben!';
  document.getElementById('result-score').textContent = pct + '%';
  document.getElementById('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  const details = testResults.map(r => `
    <div class="result-row ${r.correct ? 'correct' : 'incorrect'}">
      <span><b>${esc(testReverse ? r.word.pl : r.word.en)}</b> → ${esc(formatExpected(r.expected))}</span>
      <span class="result-row-status">${r.correct ? '✅' : '❌ ' + esc(r.ans)}</span>
    </div>`).join('');
  document.getElementById('result-details').innerHTML = details;

  showView('test-result');
}

function exitTest() { showView('set-detail', { id: testSetId }); }

// ===== SONGS LIST =====
function renderSongsList() {
  const songs = getSongs();
  const grid  = document.getElementById('songs-grid');
  if (!songs.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🎵</div>
      <p>Nie masz jeszcze żadnych piosenek.</p>
      <button class="btn btn-primary btn-large" onclick="showView('song-edit',{id:null})">+ Dodaj piosenkę</button>
    </div>`;
    return;
  }
  grid.innerHTML = songs.map(s => `
    <div class="song-card" onclick="showView('song-detail',{id:'${s.id}'})">
      <div class="song-card-icon">🎵</div>
      <div class="song-card-title">${esc(s.title)}</div>
      <div class="song-card-artist">${esc(s.artist || '')}</div>
    </div>`).join('');
}

// ===== SONG EDIT =====
let editingSongId = null;

function initSongEdit(id) {
  editingSongId = id;
  document.getElementById('song-edit-title').textContent = id ? 'Edytuj piosenkę' : 'Nowa piosenka';
  document.getElementById('delete-song-btn').style.display = id ? '' : 'none';
  if (id) {
    const song = getSongs().find(s => s.id === id);
    if (!song) return;
    document.getElementById('song-title-input').value  = song.title || '';
    document.getElementById('song-artist-input').value = song.artist || '';
    document.getElementById('song-yt-input').value     = song.ytUrl || '';
    document.getElementById('song-de-input').value     = song.verses.map(v => v.en).join('\n\n');
    document.getElementById('song-pl-input').value     = song.verses.map(v => v.pl).join('\n\n');
  } else {
    ['song-title-input','song-artist-input','song-yt-input','song-de-input','song-pl-input']
      .forEach(id => document.getElementById(id).value = '');
  }
}

function saveSong() {
  const title  = document.getElementById('song-title-input').value.trim();
  const artist = document.getElementById('song-artist-input').value.trim();
  const ytRaw  = document.getElementById('song-yt-input').value.trim();
  const iframeSrc = ytRaw.match(/src=["']([^"']+)["']/);
  const ytUrl  = iframeSrc ? iframeSrc[1] : ytRaw;
  const deRaw  = document.getElementById('song-de-input').value.trim();
  const plRaw  = document.getElementById('song-pl-input').value.trim();

  if (!title) { showToast('Podaj tytuł piosenki!'); return; }
  if (!deRaw) { showToast('Dodaj tekst piosenki po niemiecku!'); return; }

  const deVerses = splitVerses(deRaw);
  const plVerses = splitVerses(plRaw);
  const verses   = deVerses.map((en, i) => ({ en, pl: plVerses[i] || '' }));

  const songs = getSongs();
  if (editingSongId) {
    const idx = songs.findIndex(s => s.id === editingSongId);
    if (idx >= 0) songs[idx] = { ...songs[idx], title, artist, ytUrl, verses };
  } else {
    songs.push({ id: uid(), title, artist, ytUrl, verses, createdAt: today() });
  }
  saveSongs(songs);
  checkBadgesSongs();
  showToast('Piosenka zapisana!');
  showView('songs-list');
}

function checkBadgesSongs() {
  const prog = getProgress();
  const add = id => { if (!prog.badges.includes(id)) { prog.badges.push(id); showToast(`Nowa odznaka: ${BADGES_DEF.find(b=>b.id===id)?.name || id}!`); } };
  if (getSongs().length >= 1) add('song_added');
  if (getSongs().length >= 3) add('songs3');
  saveProgress(prog);
}

function deleteSong() {
  showModal('Usuń piosenkę', 'Na pewno chcesz usunąć tę piosenkę?', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveSongs(getSongs().filter(s => s.id !== editingSongId));
      closeModal();
      showView('songs-list');
      showToast('Piosenka usunięta.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

function editCurrentSong() { showView('song-edit', { id: currentSongId }); }

function deleteCurrentSong() {
  showModal('Usuń piosenkę', 'Na pewno chcesz usunąć tę piosenkę?', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveSongs(getSongs().filter(s => s.id !== currentSongId));
      closeModal();
      showView('songs-list');
      showToast('Piosenka usunięta.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

// ===== SONG DETAIL =====
function renderSongDetail(id) {
  const song = getSongs().find(s => s.id === id);
  if (!song) { showView('songs-list'); return; }
  document.getElementById('song-detail-title').textContent = `🎵 ${song.title}`;

  renderYtPlayer('song-yt-player', song.ytUrl);

  const versesEl = document.getElementById('song-verses');
  versesEl.innerHTML = song.verses.map((v, i) => `
    <div class="verse-block" id="verse-${i}">
      <div class="verse-de">${esc(v.en)}</div>
      ${v.pl ? `
        <button class="verse-reveal-btn" onclick="revealVerse(${i})">Pokaż tłumaczenie</button>
        <div class="verse-pl" id="verse-pl-${i}">${esc(v.pl)}</div>` : ''}
    </div>`).join('');
}

function renderYtPlayer(elId, ytUrl) {
  const el = document.getElementById(elId);
  if (!ytUrl) { el.innerHTML = ''; return; }
  const ytId = extractYtId(ytUrl);
  if (!ytId) {
    el.innerHTML = `<a href="${esc(ytUrl)}" target="_blank" class="btn btn-secondary yt-open-btn">Otwórz na YouTube</a>`;
    return;
  }
  el.innerHTML = `
    <iframe src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      referrerpolicy="strict-origin-when-cross-origin"
      allowfullscreen></iframe>
    <div class="yt-fallback-bar">
      <span class="yt-fallback-hint">Jeśli widzisz błąd 153 → film ma zablokowane osadzanie, szukaj innej wersji</span>
      <a href="${esc(ytUrl.replace('youtube-nocookie.com','youtube.com'))}" target="_blank" class="btn btn-secondary" style="padding:5px 12px;font-size:0.82rem">Otwórz w YouTube</a>
    </div>`;
}

function revealVerse(i) {
  const plEl = document.getElementById('verse-pl-' + i);
  const btn  = plEl ? plEl.previousElementSibling : null;
  if (plEl) { plEl.style.display = 'block'; if (btn) btn.style.display = 'none'; }
}

function revealAll() {
  document.querySelectorAll('.verse-pl').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.verse-reveal-btn').forEach(el => el.style.display = 'none');
}

function hideAll() {
  document.querySelectorAll('.verse-pl').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.verse-reveal-btn').forEach(el => el.style.display = '');
}

// ===== SONG TRANSLATE MODE =====
function renderTranslate(id) {
  const song = getSongs().find(s => s.id === id);
  if (!song) return;
  document.getElementById('translate-title').textContent = `✍️ ${song.title}`;
  renderYtPlayer('translate-yt-player', song.ytUrl);

  const verses = (song.verses || []);
  document.getElementById('translate-verses').innerHTML = verses.map((v, i) => `
    <div class="translate-verse">
      <div class="verse-de translate-de-clickable">${makeClickableWords(v.en)}</div>
      <div class="translate-hint">Kliknij na słowo, żeby sprawdzić tłumaczenie</div>
      <textarea id="tr-input-${i}" placeholder="Wpisz tutaj swoje tłumaczenie po polsku...">${esc(v.pl || '')}</textarea>
      ${v.pl ? '<div class="verse-saved-badge">Tłumaczenie zapisane</div>' : ''}
    </div>`).join('');
}

function makeClickableWords(text) {
  if (!text) return '';
  return text.split(/(\s+)/).map(token => {
    const clean = token.replace(/[^a-zA-ZäöüÄÖÜß'-]/g, '');
    if (!clean) return esc(token);
    const url = `https://translate.google.com/?sl=de&tl=pl&text=${encodeURIComponent(clean)}&op=translate`;
    return `<a href="${url}" target="_blank" class="clickable-word" title="Sprawdź w Google Translate"
      onclick="if(window.getSelection().toString().trim().length>1){event.preventDefault();}">${esc(token)}</a>`;
  }).join('');
}

function saveTranslation() {
  const songs = getSongs();
  const idx   = songs.findIndex(s => s.id === currentSongId);
  if (idx < 0) return;
  songs[idx].verses = songs[idx].verses.map((v, i) => {
    const input = document.getElementById('tr-input-' + i);
    return { ...v, pl: input ? input.value.trim() : v.pl };
  });
  saveSongs(songs);
  showToast('Tłumaczenie zapisane!');
  showView('song-detail', { id: currentSongId });
}

// ===== EXTRACT WORDS FROM SONG =====
let extractSelectedWords = {};

function extractWordsFromSong() {
  showView('song-extract', { id: currentSongId });
}

function renderExtract(id) {
  const song = getSongs().find(s => s.id === id);
  if (!song) return;
  extractSelectedWords = {};

  const extractEl = document.getElementById('extract-text');
  extractEl.innerHTML = song.verses.map((v) =>
    '<p>' + v.en.split(/\s+/).map(raw => {
      const clean = raw.replace(/[^a-zA-ZäöüÄÖÜß'-]/g, '').toLowerCase();
      if (!clean) return esc(raw) + ' ';
      return `<span class="extract-word" data-word="${clean}" onclick="toggleExtractWord('${clean}', this)">${esc(raw)}</span> `;
    }).join('') + '</p>'
  ).join('<br>');

  document.getElementById('selected-words-list').innerHTML = '';
  document.getElementById('extract-set-name').value = song.title ? `Słówka z "${song.title}"` : 'Słówka z piosenki';
}

async function fetchTranslation(word) {
  const w = word.toLowerCase();
  if (typeof OFFLINE_DICT !== 'undefined' && OFFLINE_DICT[w]) return OFFLINE_DICT[w];
  try {
    const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=de|pl`);
    const data = await res.json();
    const t = data?.responseData?.translatedText;
    if (t && t.toLowerCase() !== w) return t;
  } catch {}
  return '';
}

async function toggleExtractWord(word, el) {
  if (extractSelectedWords[word] !== undefined) {
    delete extractSelectedWords[word];
    document.querySelectorAll(`.extract-word[data-word="${word}"]`).forEach(e => e.classList.remove('selected'));
    renderSelectedChips();
  } else {
    extractSelectedWords[word] = '';
    document.querySelectorAll(`.extract-word[data-word="${word}"]`).forEach(e => e.classList.add('selected'));
    renderSelectedChips();
    const pl = await fetchTranslation(word);
    if (extractSelectedWords[word] !== undefined && extractSelectedWords[word] === '') {
      extractSelectedWords[word] = pl;
      renderSelectedChips();
    }
  }
}

function renderSelectedChips() {
  const list = document.getElementById('selected-words-list');
  list.innerHTML = Object.keys(extractSelectedWords).map(w => `
    <span class="selected-word-chip">
      <b>${esc(w)}</b> =
      <input type="text" placeholder="tłumaczenie" value="${esc(extractSelectedWords[w])}"
        oninput="extractSelectedWords[${JSON.stringify(w)}]=this.value" />
      <span class="chip-remove" onclick="removeExtractChip(${JSON.stringify(w)})">✕</span>
    </span>`).join('');
}

function removeExtractChip(word) {
  delete extractSelectedWords[word];
  document.querySelectorAll(`.extract-word[data-word="${word}"]`).forEach(e => e.classList.remove('selected'));
  renderSelectedChips();
}

function saveExtractedWords() {
  const entries = Object.entries(extractSelectedWords).filter(([w]) => w);
  if (!entries.length) { showToast('Wybierz przynajmniej jedno słówko!'); return; }
  const name  = document.getElementById('extract-set-name').value.trim() || 'Słówka z piosenki';
  const words = entries.map(([en, pl]) => ({ id: uid(), en, pl }));
  const sets  = getSets();
  sets.push({ id: uid(), name, icon: '🎵', words, results: [], createdAt: today(), lastUsed: Date.now() });
  saveSets(sets);
  showToast(`Zestaw "${name}" zapisany!`);
  showView('sets-list');
}

// ===== TEXTS LIST =====
function renderTextsList() {
  const texts = getTexts();
  const grid  = document.getElementById('texts-grid');
  if (!texts.length) {
    grid.innerHTML = `<div class="empty-state">
      <div class="empty-icon">📰</div>
      <p>Nie masz jeszcze żadnych tekstów.<br>Dodaj artykuł lub fragment książki!</p>
      <button class="btn btn-primary btn-large" onclick="showView('text-edit',{id:null})">+ Dodaj tekst</button>
    </div>`;
    return;
  }
  grid.innerHTML = texts.map(t => `
    <div class="text-card" onclick="showView('text-detail',{id:'${t.id}'})">
      <div class="text-card-icon">📰</div>
      <div class="text-card-title">${esc(t.title)}</div>
      ${t.source ? `<div class="text-card-source">${esc(t.source)}</div>` : ''}
      <div class="text-card-meta">${t.paragraphs.length} akapitów · ${t.createdAt}</div>
    </div>`).join('');
}

// ===== TEXT EDIT =====
let editingTextId = null;

function initTextEdit(id) {
  editingTextId = id;
  document.getElementById('text-edit-title').textContent = id ? 'Edytuj tekst' : 'Nowy tekst';
  document.getElementById('delete-text-btn').style.display = id ? '' : 'none';
  if (id) {
    const text = getTexts().find(t => t.id === id);
    if (!text) return;
    document.getElementById('text-title-input').value  = text.title || '';
    document.getElementById('text-source-input').value = text.source || '';
    document.getElementById('text-de-input').value     = text.paragraphs.map(p => p.de).join('\n\n');
    document.getElementById('text-pl-input').value     = text.paragraphs.map(p => p.pl).join('\n\n');
  } else {
    ['text-title-input','text-source-input','text-de-input','text-pl-input']
      .forEach(eid => document.getElementById(eid).value = '');
  }
}

function saveText() {
  const title  = document.getElementById('text-title-input').value.trim();
  const source = document.getElementById('text-source-input').value.trim();
  const deRaw  = document.getElementById('text-de-input').value.trim();
  const plRaw  = document.getElementById('text-pl-input').value.trim();

  if (!title) { showToast('Podaj tytuł tekstu!'); return; }
  if (!deRaw) { showToast('Dodaj treść tekstu po niemiecku!'); return; }

  const deParas = splitVerses(deRaw);
  const plParas = splitVerses(plRaw);
  const paragraphs = deParas.map((de, i) => ({ de, pl: plParas[i] || '' }));

  const texts = getTexts();
  if (editingTextId) {
    const idx = texts.findIndex(t => t.id === editingTextId);
    if (idx >= 0) texts[idx] = { ...texts[idx], title, source, paragraphs };
  } else {
    texts.push({ id: uid(), title, source, paragraphs, createdAt: today() });
  }
  saveTexts(texts);
  checkBadgesTexts();
  showToast('Tekst zapisany!');
  showView('texts-list');
}

function checkBadgesTexts() {
  const prog = getProgress();
  const add = id => { if (!prog.badges.includes(id)) { prog.badges.push(id); showToast(`Nowa odznaka: ${BADGES_DEF.find(b=>b.id===id)?.name || id}!`); } };
  if (getTexts().length >= 1) add('text_added');
  if (getTexts().length >= 3) add('texts3');
  saveProgress(prog);
}

function deleteText() {
  showModal('Usuń tekst', 'Na pewno chcesz usunąć ten tekst?', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveTexts(getTexts().filter(t => t.id !== editingTextId));
      closeModal();
      showView('texts-list');
      showToast('Tekst usunięty.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

function editCurrentText() { showView('text-edit', { id: currentTextId }); }

function deleteCurrentText() {
  showModal('Usuń tekst', 'Na pewno chcesz usunąć ten tekst?', [
    { label: 'Tak, usuń', cls: 'btn-danger', action: () => {
      saveTexts(getTexts().filter(t => t.id !== currentTextId));
      closeModal();
      showView('texts-list');
      showToast('Tekst usunięty.');
    }},
    { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
  ]);
}

// ===== TEXT DETAIL =====
function renderTextDetail(id) {
  const text = getTexts().find(t => t.id === id);
  if (!text) { showView('texts-list'); return; }
  document.getElementById('text-detail-title').textContent = text.title;
  const srcEl = document.getElementById('text-detail-source');
  srcEl.textContent = text.source ? `Źródło: ${text.source}` : '';
  srcEl.style.display = text.source ? '' : 'none';

  const parasEl = document.getElementById('text-paragraphs');
  parasEl.innerHTML = text.paragraphs.map((p, i) => `
    <div class="para-block" id="para-${i}">
      <div class="para-de">${esc(p.de)}</div>
      ${p.pl ? `
        <button class="para-reveal-btn" onclick="revealPara(${i})">Pokaż tłumaczenie</button>
        <div class="para-pl" id="para-pl-${i}">${esc(p.pl)}</div>` : ''}
    </div>`).join('');
}

function revealPara(i) {
  const plEl = document.getElementById('para-pl-' + i);
  const btn  = plEl ? plEl.previousElementSibling : null;
  if (plEl) { plEl.style.display = 'block'; if (btn) btn.style.display = 'none'; }
}

function revealAllParas() {
  document.querySelectorAll('.para-pl').forEach(el => el.style.display = 'block');
  document.querySelectorAll('.para-reveal-btn').forEach(el => el.style.display = 'none');
}

function hideAllParas() {
  document.querySelectorAll('.para-pl').forEach(el => el.style.display = 'none');
  document.querySelectorAll('.para-reveal-btn').forEach(el => el.style.display = '');
}

// ===== TEXT TRANSLATE =====
function renderTextTranslate(id) {
  const text = getTexts().find(t => t.id === id);
  if (!text) return;
  document.getElementById('text-translate-title').textContent = `✍️ ${text.title}`;

  document.getElementById('text-translate-paras').innerHTML = text.paragraphs.map((p, i) => `
    <div class="translate-para">
      <div class="para-de translate-de-clickable">${makeClickableWords(p.de)}</div>
      <div class="translate-hint">Kliknij na słowo, żeby sprawdzić tłumaczenie</div>
      <textarea id="ttr-input-${i}" placeholder="Wpisz swoje tłumaczenie po polsku...">${esc(p.pl || '')}</textarea>
      ${p.pl ? '<div class="verse-saved-badge">Tłumaczenie zapisane</div>' : ''}
    </div>`).join('');
}

function saveTextTranslation() {
  const texts = getTexts();
  const idx   = texts.findIndex(t => t.id === currentTextId);
  if (idx < 0) return;
  texts[idx].paragraphs = texts[idx].paragraphs.map((p, i) => {
    const input = document.getElementById('ttr-input-' + i);
    return { ...p, pl: input ? input.value.trim() : p.pl };
  });
  saveTexts(texts);
  showToast('Tłumaczenie zapisane!');
  showView('text-detail', { id: currentTextId });
}

// ===== TEXT EXTRACT (words AND phrases via drag) =====
let extractTextSelectedItems = {}; // { "słowo_lub_fraza": "tłumaczenie" }
let extractTextWords = [];          // [{ raw, clean, idx }]
let extractDragStart = null;        // index słowa gdzie zaczął drag
let extractIsDragging = false;

function extractWordsFromText() {
  showView('text-extract', { id: currentTextId });
}

function renderTextExtract(id) {
  const text = getTexts().find(t => t.id === id);
  if (!text) return;
  extractTextSelectedItems = {};
  extractTextWords = [];
  extractDragStart = null;
  extractIsDragging = false;

  // Build word array with indices across all paragraphs
  let globalIdx = 0;
  const parasHtml = text.paragraphs.map((p, pi) => {
    const tokens = p.de.split(/(\s+)/);
    const paraHtml = tokens.map(token => {
      const clean = token.replace(/[^a-zA-ZäöüÄÖÜß'-]/g, '').toLowerCase();
      if (!clean) return esc(token);
      const idx = globalIdx;
      extractTextWords.push({ raw: token, clean, idx });
      globalIdx++;
      return `<span class="extract-word" data-idx="${idx}" data-clean="${clean}"
        onmousedown="textExtractMouseDown(event, ${idx})"
        onmouseup="textExtractMouseUp(event, ${idx})"
      >${esc(token)}</span>`;
    }).join('');
    return `<p style="margin-bottom:12px">${paraHtml}</p>`;
  }).join('');

  document.getElementById('text-extract-content').innerHTML = parasHtml;
  document.getElementById('text-selected-list').innerHTML = '';
  document.getElementById('text-extract-set-name').value = text.title ? `Słówka z "${text.title}"` : 'Słówka z tekstu';

  // Global mouseup to handle drag ending outside a word span
  document.getElementById('text-extract-content')._cleanupHandler &&
    document.removeEventListener('mouseup', document.getElementById('text-extract-content')._cleanupHandler);
  const handler = (e) => {
    if (extractIsDragging && extractDragStart !== null) {
      // ended outside a word — treat as drag to last hovered word
      extractIsDragging = false;
      extractDragStart = null;
    }
  };
  document.getElementById('text-extract-content')._cleanupHandler = handler;
  document.addEventListener('mouseup', handler);
}

function textExtractMouseDown(event, idx) {
  event.preventDefault();
  extractDragStart = idx;
  extractIsDragging = true;
}

function textExtractMouseUp(event, idx) {
  if (!extractIsDragging || extractDragStart === null) return;
  event.preventDefault();
  extractIsDragging = false;

  const startIdx = extractDragStart;
  const endIdx   = idx;
  extractDragStart = null;

  if (startIdx === endIdx) {
    // Single word — toggle
    const wordObj = extractTextWords.find(w => w.idx === startIdx);
    if (!wordObj) return;
    const key = wordObj.clean;
    if (extractTextSelectedItems[key] !== undefined) {
      delete extractTextSelectedItems[key];
      document.querySelectorAll(`.extract-word[data-clean="${key}"]`).forEach(e => e.classList.remove('selected'));
    } else {
      extractTextSelectedItems[key] = '';
      document.querySelectorAll(`.extract-word[data-clean="${key}"]`).forEach(e => e.classList.add('selected'));
      fetchTranslation(key).then(pl => {
        if (extractTextSelectedItems[key] !== undefined && extractTextSelectedItems[key] === '') {
          extractTextSelectedItems[key] = pl;
          renderTextChips();
        }
      });
    }
  } else {
    // Phrase — select range from min to max idx
    const minIdx = Math.min(startIdx, endIdx);
    const maxIdx = Math.max(startIdx, endIdx);
    const phraseWords = extractTextWords.filter(w => w.idx >= minIdx && w.idx <= maxIdx);
    if (!phraseWords.length) return;
    const phrase = phraseWords.map(w => w.raw).join(' ').trim();
    const phraseClean = phraseWords.map(w => w.clean).join(' ').trim();
    if (!phraseClean) return;

    if (extractTextSelectedItems[phrase] !== undefined) {
      // deselect phrase
      delete extractTextSelectedItems[phrase];
      phraseWords.forEach(w => {
        document.querySelectorAll(`.extract-word[data-idx="${w.idx}"]`).forEach(e => e.classList.remove('in-phrase','selected'));
      });
    } else {
      extractTextSelectedItems[phrase] = '';
      phraseWords.forEach(w => {
        document.querySelectorAll(`.extract-word[data-idx="${w.idx}"]`).forEach(e => {
          e.classList.add('in-phrase');
          e.classList.remove('selected');
        });
      });
      fetchTranslation(phraseClean).then(pl => {
        if (extractTextSelectedItems[phrase] !== undefined && extractTextSelectedItems[phrase] === '') {
          extractTextSelectedItems[phrase] = pl;
          renderTextChips();
        }
      });
    }
  }
  renderTextChips();
}

function renderTextChips() {
  const list = document.getElementById('text-selected-list');
  list.innerHTML = Object.keys(extractTextSelectedItems).map(key => `
    <span class="selected-word-chip">
      <b>${esc(key)}</b> =
      <input type="text" placeholder="tłumaczenie" value="${esc(extractTextSelectedItems[key])}"
        oninput="extractTextSelectedItems[${JSON.stringify(key)}]=this.value" />
      <span class="chip-remove" onclick="removeTextChip(${JSON.stringify(key)})">✕</span>
    </span>`).join('');
}

function removeTextChip(key) {
  delete extractTextSelectedItems[key];
  // Remove visual selection for matching words/phrases
  document.querySelectorAll('.extract-word.selected, .extract-word.in-phrase').forEach(el => {
    // re-check all remaining phrases/words
  });
  renderTextChips();
  // Rebuild visual state from scratch
  document.querySelectorAll('.extract-word').forEach(el => {
    el.classList.remove('selected','in-phrase');
  });
  // Re-highlight remaining selections
  Object.keys(extractTextSelectedItems).forEach(phrase => {
    const words = phrase.split(' ');
    if (words.length === 1) {
      document.querySelectorAll(`.extract-word[data-clean="${phrase}"]`).forEach(e => e.classList.add('selected'));
    } else {
      // find span with matching content sequence — mark all spans in extractTextWords that match
      extractTextWords.forEach(w => {
        if (phrase.split(' ').some(pw => pw.toLowerCase() === w.clean)) {
          // simple: mark all spans whose clean value appears in the phrase
          document.querySelectorAll(`.extract-word[data-clean="${w.clean}"]`).forEach(e => {
            if (phrase.includes(w.clean)) e.classList.add('in-phrase');
          });
        }
      });
    }
  });
}

function saveExtractedTextWords() {
  const entries = Object.entries(extractTextSelectedItems).filter(([k]) => k);
  if (!entries.length) { showToast('Wybierz przynajmniej jedno słówko lub frazę!'); return; }
  const name  = document.getElementById('text-extract-set-name').value.trim() || 'Słówka z tekstu';
  const words = entries.map(([en, pl]) => ({ id: uid(), en, pl }));
  const sets  = getSets();
  sets.push({ id: uid(), name, icon: '📰', words, results: [], createdAt: today(), lastUsed: Date.now() });
  saveSets(sets);
  showToast(`Zestaw "${name}" zapisany!`);
  showView('sets-list');
}

// ===== PROGRESS =====
function renderProgress() {
  const prog   = getProgress();
  const streak = prog.streak.count;

  document.getElementById('progress-streak').innerHTML =
    `🔥 Passa: <b>${streak} ${streak === 1 ? 'dzień' : 'dni'} z rzędu!</b>
    <div style="font-size:1rem;font-weight:400;margin-top:6px;opacity:0.9">Ucz się codziennie, żeby utrzymać passę!</div>`;

  document.getElementById('badges-grid').innerHTML = BADGES_DEF.map(b => `
    <div class="badge-item ${prog.badges.includes(b.id) ? '' : 'locked'}">
      <div class="badge-icon">${b.icon}</div>
      <div class="badge-name">${b.name}</div>
      <div class="badge-desc">${b.desc}</div>
    </div>`).join('');

  if (!prog.history || !prog.history.length) {
    document.getElementById('test-history').innerHTML = '<p style="color:var(--text-muted)">Brak historii testów. Rozwiąż swój pierwszy test!</p>';
    return;
  }
  document.getElementById('test-history').innerHTML = prog.history.map(h => `
    <div class="history-item">
      <span class="history-date">${h.date}</span>
      <span class="history-set">${esc(h.setName)}</span>
      <span class="history-score">${h.score}%</span>
      <span class="history-stars">${'⭐'.repeat(h.stars || 1)}</span>
    </div>`).join('');
}

function checkBadges(prog, pct, sets) {
  const add = id => { if (!prog.badges.includes(id)) { prog.badges.push(id); showToast(`Nowa odznaka: ${BADGES_DEF.find(b=>b.id===id)?.name || id}!`); } };
  const history = prog.history;
  const totalWords = sets.reduce((s, set) => s + (set.words?.length || 0), 0);
  if (history.length >= 1)  add('first_test');
  if (pct === 100)           add('perfect');
  if (history.filter(h=>h.score===100).length >= 3) add('perfect3');
  if (prog.streak.count >= 3)  add('streak3');
  if (prog.streak.count >= 7)  add('streak7');
  if (prog.streak.count >= 14) add('streak14');
  if (prog.streak.count >= 30) add('streak30');
  if (history.length >= 5)   add('five_tests');
  if (history.length >= 20)  add('twenty_tests');
  if (history.length >= 50)  add('fifty_tests');
  if (sets.length >= 3)      add('all_sets');
  if (sets.length >= 5)      add('five_sets');
  if (totalWords >= 50)      add('words50');
  if (totalWords >= 100)     add('words100');
  if (getSongs().length >= 1) add('song_added');
  if (getSongs().length >= 3) add('songs3');
  if (getTexts().length >= 1) add('text_added');
  if (getTexts().length >= 3) add('texts3');
  if (pct >= 80 && history.length >= 3 && history.slice(0,3).every(h=>h.score>=80)) add('three_good');
  const setResults = sets.find(s=>s.id===testSetId)?.results || [];
  if (setResults.length >= 2 && pct > (setResults[setResults.length-2]?.score||0)) add('improved');
}

// ===== MODAL =====
function showModal(title, body, buttons) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').textContent  = body;
  document.getElementById('modal-actions').innerHTML = buttons.map((b, i) =>
    `<button class="btn ${b.cls}" onclick="modalActions[${i}]()">${b.label}</button>`
  ).join('');
  window.modalActions = buttons.map(b => b.action);
  document.getElementById('modal-overlay').style.display = 'flex';
}
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

// ===== TOAST =====
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.display = 'block';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.style.display = 'none', 2800);
}

// ===== HELPERS =====
function esc(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function today() { return new Date().toISOString().slice(0, 10); }

function slug(s) { return s.toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,''); }

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isCorrectAnswer(ans, expected) {
  const variants = expected.split('/').map(v => v.trim()).filter(Boolean);
  return variants.some(v => isSimilar(ans, v));
}

function formatExpected(expected) {
  return expected.split('/').map(v => v.trim()).join(' / ');
}

function isSimilar(a, b) {
  a = a.trim().toLowerCase().replace(/[^a-zäöüßąćęłńóśźż\s]/gi, '');
  b = b.trim().toLowerCase().replace(/[^a-zäöüßąćęłńóśźż\s]/gi, '');
  if (a === b) return true;
  if (b.length >= 4 && levenshtein(a, b) <= 1) return true;
  return false;
}

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({length: m+1}, (_, i) => Array.from({length: n+1}, (_, j) => i ? (j ? 0 : i) : j));
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[m][n];
}

function splitVerses(text) {
  return text.split(/\n\n+/).map(v => v.trim()).filter(Boolean);
}

function extractYtId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}

// ===== HANGMAN =====
const HANGMAN_PARTS = ['h-head','h-body','h-larm','h-rarm','h-lleg','h-rleg'];
let hangmanSetId   = null;
let hangmanQueue   = [];
let hangmanWord    = '';
let hangmanGuessed = [];
let hangmanWrong   = 0;
let hangmanCorrect = 0;
let hangmanTotal   = 0;
const MAX_WRONG    = 6;

function startHangman() {
  const set = getSets().find(s => s.id === currentSetId);
  if (!set || !set.words.length) { showToast('Brak słówek!'); return; }
  hangmanSetId   = currentSetId;
  hangmanQueue   = shuffle([...set.words]);
  hangmanCorrect = 0;
  hangmanWrong   = 0;
  hangmanTotal   = hangmanQueue.length;
  document.getElementById('hangman-title').textContent = `🪢 ${set.name}`;
  showView('hangman');
  nextHangmanWord();
}

function nextHangmanWord() {
  if (!hangmanQueue.length) {
    showHangmanGameOver();
    return;
  }
  const word = hangmanQueue.shift();
  hangmanWord    = word.en.toLowerCase();
  hangmanGuessed = [];

  HANGMAN_PARTS.forEach((id, i) => {
    document.getElementById(id).style.display = i < hangmanWrong ? '' : 'none';
  });
  document.getElementById('hangman-result').style.display = 'none';
  document.getElementById('hangman-keyboard').style.display = '';

  document.getElementById('hangman-clue').textContent = `Znaczenie: ${word.pl}`;
  document.getElementById('hangman-score-badge').textContent = `${hangmanCorrect} odgadniętych`;
  renderHangmanWord();
  renderHangmanWrong();
  renderHangmanKeyboard();
}

function renderHangmanWord() {
  const letters = hangmanWord.split('');
  document.getElementById('hangman-word').innerHTML = letters.map(l => {
    if (l === ' ') return `<span class="hangman-letter space"></span>`;
    const shown = hangmanGuessed.includes(l) ? l : '';
    return `<span class="hangman-letter">${shown}</span>`;
  }).join('');
}

function renderHangmanWrong() {
  const wrongThisWord = hangmanGuessed.filter(l => !hangmanWord.includes(l));
  document.getElementById('hangman-wrong-letters').textContent = wrongThisWord.length ? '✗ ' + wrongThisWord.join('  ') : '';
  document.getElementById('hangman-wrong-count').textContent = `Błędy: ${hangmanWrong} / ${MAX_WRONG}`;
}

function renderHangmanKeyboard() {
  // Latin A-Z
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  // German special chars
  const deLetters = ['ä','ö','ü','ß'];

  const makeKey = (l) => {
    const used    = hangmanGuessed.includes(l);
    const correct = used && hangmanWord.includes(l);
    const wrong   = used && !hangmanWord.includes(l);
    return `<button class="hangman-key ${correct?'correct':''} ${wrong?'wrong':''}"
      onclick="guessLetter('${l}')" ${used?'disabled':''}>${l}</button>`;
  };

  document.getElementById('hangman-keyboard').innerHTML =
    letters.map(makeKey).join('') +
    `<div class="hangman-de-row">` +
    deLetters.map(makeKey).join('') +
    `</div>`;
}

function guessLetter(l) {
  if (hangmanGuessed.includes(l)) return;
  hangmanGuessed.push(l);

  if (!hangmanWord.includes(l)) {
    hangmanWrong++;
    const part = document.getElementById(HANGMAN_PARTS[hangmanWrong - 1]);
    if (part) part.style.display = '';
  }

  renderHangmanWord();
  renderHangmanWrong();
  renderHangmanKeyboard();

  const allGuessed = hangmanWord.split('').every(l => l === ' ' || hangmanGuessed.includes(l));
  if (allGuessed) {
    hangmanCorrect++;
    showHangmanResult(true);
    return;
  }
  if (hangmanWrong >= MAX_WRONG) {
    showHangmanResult(false);
  }
}

function showHangmanResult(won) {
  document.getElementById('hangman-keyboard').style.display = 'none';
  document.getElementById('hangman-result').style.display = '';
  document.getElementById('hangman-word').innerHTML = hangmanWord.split('').map(l =>
    l === ' ' ? `<span class="hangman-letter space"></span>`
              : `<span class="hangman-letter" style="color:${won?'var(--green)':'var(--red)'}">${l}</span>`
  ).join('');

  if (won) {
    document.getElementById('hangman-result-icon').textContent = '🎉';
    document.getElementById('hangman-result-text').innerHTML =
      `<span style="color:var(--green);font-size:1.2rem">Gut gemacht! Odgadłeś!</span>`;
    document.querySelector('#hangman-result button').textContent =
      hangmanQueue.length ? 'Następne słówko →' : 'Zakończ grę';
    document.querySelector('#hangman-result button').onclick = hangmanQueue.length
      ? nextHangmanWord : showHangmanGameOver;
  } else {
    document.getElementById('hangman-result-icon').textContent = '💀';
    document.getElementById('hangman-result-text').innerHTML =
      `Słówko to: <span style="color:var(--amber);font-size:1.3rem;font-weight:900">${hangmanWord}</span><br>` +
      `<span style="font-size:1rem">Odgadłeś <b>${hangmanCorrect}</b> z <b>${hangmanTotal}</b> słówek</span>`;
    document.querySelector('#hangman-result button').textContent = '← Wróć do zestawu';
    document.querySelector('#hangman-result button').onclick = exitHangman;
  }
}

function showHangmanGameOver() {
  document.getElementById('hangman-keyboard').style.display = 'none';
  document.getElementById('hangman-result').style.display = '';
  document.getElementById('hangman-result-icon').textContent = '🏆';
  document.getElementById('hangman-result-text').innerHTML =
    `<span style="color:var(--green);font-size:1.1rem">Alle Wörter erraten!</span><br>` +
    `Odgadłeś <b>${hangmanCorrect}</b> z <b>${hangmanTotal}</b> słówek!`;
  document.querySelector('#hangman-result button').textContent = '← Wróć do zestawu';
  document.querySelector('#hangman-result button').onclick = exitHangman;
}

document.addEventListener('keydown', e => {
  const view = document.getElementById('view-hangman');
  if (!view || view.style.display === 'none') return;
  if (document.getElementById('hangman-result').style.display !== 'none') return;
  const l = e.key.toLowerCase();
  if (/^[a-z]$/.test(l) || ['ä','ö','ü','ß'].includes(l)) guessLetter(l);
});

function exitHangman() { showView('set-detail', { id: hangmanSetId }); }

// ===== MATCH PAIRS =====
let matchSetId     = null;
let matchSelected  = null;
let matchMoves     = 0;
let matchMatched   = 0;
let matchPairs     = 0;
let matchStartTime = 0;

function startMatch() {
  const set = getSets().find(s => s.id === currentSetId);
  if (!set || set.words.length < 2) { showToast('Potrzebujesz minimum 2 słówka!'); return; }
  matchSetId    = currentSetId;
  matchSelected = null;
  matchMoves    = 0;
  matchMatched  = 0;
  matchStartTime = Date.now();

  const words = shuffle([...set.words]).slice(0, 6);
  matchPairs = words.length;

  document.getElementById('match-title').textContent = `🃏 ${set.name}`;
  document.getElementById('match-complete').style.display = 'none';
  document.getElementById('match-grid').style.display = '';
  updateMatchInfo();

  const cards = shuffle([
    ...words.map((w, i) => ({ id: i, lang: 'de', text: w.en })),
    ...words.map((w, i) => ({ id: i, lang: 'pl', text: w.pl.split('/')[0].trim() })),
  ]);

  document.getElementById('match-grid').innerHTML = cards.map((c, ci) => `
    <div class="match-card ${c.lang}" id="mc-${ci}" data-id="${c.id}" data-lang="${c.lang}" data-idx="${ci}"
      onclick="selectMatchCard(${ci}, ${c.id}, '${c.lang}')">
      ${esc(c.text)}
    </div>`).join('');

  showView('match');
}

function selectMatchCard(idx, id, lang) {
  const el = document.getElementById('mc-' + idx);
  if (!el || el.classList.contains('matched') || el.classList.contains('selected')) return;

  if (!matchSelected) {
    matchSelected = { idx, id, lang };
    el.classList.add('selected');
    return;
  }

  const first = document.getElementById('mc-' + matchSelected.idx);
  matchMoves++;
  updateMatchInfo();

  if (matchSelected.id === id && matchSelected.lang !== lang) {
    el.classList.add('matched');
    first.classList.remove('selected');
    first.classList.add('matched');
    matchMatched++;
    matchSelected = null;
    updateMatchInfo();
    if (matchMatched === matchPairs) {
      setTimeout(showMatchComplete, 400);
    }
  } else {
    el.classList.add('wrong');
    first.classList.remove('selected');
    first.classList.add('wrong');
    matchSelected = null;
    setTimeout(() => {
      el.classList.remove('wrong');
      first.classList.remove('wrong');
    }, 600);
  }
}

function updateMatchInfo() {
  document.getElementById('match-pairs-left').textContent = `Dopasowane: ${matchMatched} / ${matchPairs}`;
  document.getElementById('match-moves').textContent      = `Próby: ${matchMoves}`;
  document.getElementById('match-score-badge').textContent = `${matchMatched}/${matchPairs}`;
}

function showMatchComplete() {
  const secs    = Math.round((Date.now() - matchStartTime) / 1000);
  const mins    = Math.floor(secs / 60);
  const timeStr = mins > 0 ? `${mins} min ${secs % 60} sek` : `${secs} sek`;
  const perfect = matchMoves === matchPairs;

  document.getElementById('match-grid').style.display = 'none';
  document.getElementById('match-complete').style.display = '';
  document.getElementById('match-result-emoji').textContent  = perfect ? '🏆' : matchMoves <= matchPairs * 1.5 ? '🌟' : '😄';
  document.getElementById('match-result-title').textContent  = perfect ? 'Perfekt!' : 'Alle Paare!';
  document.getElementById('match-result-stats').textContent  = `${matchMoves} prób · ${timeStr}`;
}

function exitMatch() { showView('set-detail', { id: matchSetId }); }

// ===== SAVE / LOAD ALL =====
function saveAll() {
  const data = {
    version: 1,
    savedAt: new Date().toISOString(),
    sets: getSets(),
    songs: getSongs(),
    texts: getTexts(),
    progress: getProgress(),
  };
  downloadJSON(data, `mein_deutsch_backup_${today()}.json`);
  showToast('Zapisano wszystko! Plik pobrany.');
}

function loadAll() { document.getElementById('load-all-file').click(); }

function handleLoadAll(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = ev => {
    try {
      const data = JSON.parse(ev.target.result);
      if (!data.sets) throw new Error();
      showModal('Wczytaj zapisany stan', 'To zastąpi wszystkie obecne dane (słówka, piosenki, teksty, postępy). Na pewno?', [
        { label: 'Tak, wczytaj', cls: 'btn-primary', action: () => {
          if (data.sets)     saveSets(data.sets);
          if (data.songs)    saveSongs(data.songs);
          if (data.texts)    saveTexts(data.texts);
          if (data.progress) saveProgress(data.progress);
          closeModal();
          showToast('Dane wczytane!');
          showView('home');
        }},
        { label: 'Anuluj', cls: 'btn-secondary', action: closeModal },
      ]);
    } catch { showToast('Błędny plik kopii zapasowej!'); }
  };
  reader.readAsText(file);
  e.target.value = '';
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const learnFeedback = document.getElementById('learn-feedback');
    const testFeedback  = document.getElementById('test-feedback');
    if (learnFeedback && learnFeedback.style.display !== 'none') { nextLearnWord(); return; }
    if (testFeedback  && testFeedback.style.display  !== 'none') { nextTestWord();  return; }
  }
});

// ===== SELECTION TRANSLATE BUTTON =====
(function() {
  const btn = document.getElementById('selection-translate-btn');
  let hideTimer = null;

  document.addEventListener('mouseup', e => {
    if (e.target === btn) return;
    clearTimeout(hideTimer);
    setTimeout(() => {
      const sel = window.getSelection();
      const text = sel ? sel.toString().trim() : '';
      const translateSong = document.getElementById('view-song-translate');
      const translateText = document.getElementById('view-text-translate');
      const songVisible = translateSong && translateSong.style.display !== 'none';
      const textVisible = translateText && translateText.style.display !== 'none';
      if (text.length >= 2 && (songVisible || textVisible)) {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        let top  = rect.top - 42;
        let left = rect.left + rect.width / 2 - 70;
        left = Math.max(8, Math.min(left, window.innerWidth - 160));
        btn.style.top  = top + 'px';
        btn.style.left = left + 'px';
        btn.style.display = 'block';
        btn._text = text;
      } else {
        btn.style.display = 'none';
      }
    }, 10);
  });

  btn.addEventListener('mousedown', e => { e.preventDefault(); });

  btn.addEventListener('click', () => {
    if (!btn._text) return;
    const url = `https://translate.google.com/?sl=de&tl=pl&text=${encodeURIComponent(btn._text)}&op=translate`;
    window.open(url, '_blank');
    btn.style.display = 'none';
    window.getSelection()?.removeAllRanges();
  });

  document.addEventListener('mousedown', e => {
    if (e.target !== btn) {
      hideTimer = setTimeout(() => btn.style.display = 'none', 200);
    }
  });

  document.addEventListener('scroll', () => { btn.style.display = 'none'; }, true);
})();

// ===== DEFAULT SETS (German vocabulary) =====
const DEFAULT_SETS_VERSION = 1;
const DEFAULT_SETS_DATA = [
  { name: 'Dom i mieszkanie', icon: '🏠', words: [
    {en:'das Haus',pl:'dom'},{en:'die Wohnung',pl:'mieszkanie'},{en:'das Zimmer',pl:'pokój'},
    {en:'die Küche',pl:'kuchnia'},{en:'das Badezimmer',pl:'łazienka'},{en:'das Schlafzimmer',pl:'sypialnia'},
    {en:'das Wohnzimmer',pl:'salon'},{en:'der Garten',pl:'ogród'},{en:'das Fenster',pl:'okno'},
    {en:'die Tür',pl:'drzwi'},{en:'der Boden',pl:'podłoga'},{en:'die Decke',pl:'sufit'},
    {en:'die Wand',pl:'ściana'},{en:'der Tisch',pl:'stół'},{en:'der Stuhl',pl:'krzesło'},
    {en:'das Sofa',pl:'sofa/kanapa'},{en:'das Bett',pl:'łóżko'},{en:'die Lampe',pl:'lampa'},
    {en:'der Spiegel',pl:'lustro'},{en:'das Regal',pl:'półka'},{en:'der Schrank',pl:'szafa'},
    {en:'der Kühlschrank',pl:'lodówka'},{en:'der Herd',pl:'kuchenka'},{en:'der Ofen',pl:'piekarnik'},
    {en:'das Waschbecken',pl:'zlew'},{en:'die Toilette',pl:'toaleta'},{en:'die Dusche',pl:'prysznic'},
    {en:'die Badewanne',pl:'wanna'},{en:'die Treppe',pl:'schody'},{en:'die Garage',pl:'garaż'},
    {en:'der Balkon',pl:'balkon'},{en:'der Keller',pl:'piwnica'},{en:'der Dachboden',pl:'strych'},
    {en:'das Dach',pl:'dach'},{en:'der Zaun',pl:'płot'},{en:'das Tor',pl:'brama'},
    {en:'der Schlüssel',pl:'klucz'},{en:'das Schloss',pl:'zamek'},{en:'der Vorhang',pl:'zasłona'},
    {en:'der Teppich',pl:'dywan'},
  ]},
  { name: 'Rodzina', icon: '👨‍👩‍👧', words: [
    {en:'die Mutter',pl:'mama/matka'},{en:'der Vater',pl:'tata/ojciec'},{en:'die Schwester',pl:'siostra'},
    {en:'der Bruder',pl:'brat'},{en:'die Großmutter',pl:'babcia'},{en:'der Großvater',pl:'dziadek'},
    {en:'die Tante',pl:'ciocia'},{en:'der Onkel',pl:'wujek'},{en:'der Cousin',pl:'kuzyn'},
    {en:'die Cousine',pl:'kuzynka'},{en:'die Tochter',pl:'córka'},{en:'der Sohn',pl:'syn'},
    {en:'die Ehefrau',pl:'żona'},{en:'der Ehemann',pl:'mąż'},{en:'die Eltern',pl:'rodzice'},
    {en:'die Kinder',pl:'dzieci'},{en:'das Baby',pl:'niemowlę'},{en:'die Familie',pl:'rodzina'},
    {en:'die Geschwister',pl:'rodzeństwo'},{en:'der Neffe',pl:'siostrzeniec/bratanek'},
    {en:'die Nichte',pl:'siostrzenica/bratanica'},{en:'die Schwiegermutter',pl:'teściowa'},
    {en:'der Schwiegervater',pl:'teść'},{en:'der Zwilling',pl:'bliźniak'},
    {en:'der Verwandte',pl:'krewny'},{en:'der Enkel',pl:'wnuk'},{en:'die Enkelin',pl:'wnuczka'},
    {en:'das Einzelkind',pl:'jedynak'},{en:'die Generation',pl:'pokolenie'},
    {en:'der Teenager',pl:'nastolatek'},{en:'der Erwachsene',pl:'dorosły'},
    {en:'der Säugling',pl:'noworodek'},{en:'das Kleinkind',pl:'maluch'},
    {en:'die Patentante',pl:'matka chrzestna'},{en:'der Patenonkel',pl:'ojciec chrzestny'},
    {en:'verheiratet',pl:'żonaty/zamężna'},{en:'ledig',pl:'wolny/niezamężna'},
    {en:'geschieden',pl:'rozwiedziony'},{en:'verlobt',pl:'zaręczony'},
    {en:'die Hochzeit',pl:'ślub/wesele'},
  ]},
  { name: 'Podstawowe czasowniki', icon: '⚡', words: [
    {en:'sein',pl:'być'},{en:'haben',pl:'mieć'},{en:'werden',pl:'stawać się/zostać'},
    {en:'gehen',pl:'iść'},{en:'kommen',pl:'przychodzić'},{en:'machen',pl:'robić'},
    {en:'sagen',pl:'mówić/powiedzieć'},{en:'geben',pl:'dawać'},{en:'nehmen',pl:'brać'},
    {en:'sehen',pl:'widzieć'},{en:'wissen',pl:'wiedzieć'},{en:'denken',pl:'myśleć'},
    {en:'fragen',pl:'pytać'},{en:'antworten',pl:'odpowiadać'},{en:'sprechen',pl:'mówić'},
    {en:'hören',pl:'słyszeć'},{en:'lesen',pl:'czytać'},{en:'schreiben',pl:'pisać'},
    {en:'lernen',pl:'uczyć się'},{en:'arbeiten',pl:'pracować'},{en:'wohnen',pl:'mieszkać'},
    {en:'leben',pl:'żyć'},{en:'kaufen',pl:'kupować'},{en:'essen',pl:'jeść'},
    {en:'trinken',pl:'pić'},{en:'schlafen',pl:'spać'},{en:'spielen',pl:'grać/bawić się'},
    {en:'laufen',pl:'biec/chodzić'},{en:'fahren',pl:'jechać'},{en:'finden',pl:'znajdować'},
    {en:'kennen',pl:'znać'},{en:'verstehen',pl:'rozumieć'},{en:'helfen',pl:'pomagać'},
    {en:'brauchen',pl:'potrzebować'},{en:'bleiben',pl:'pozostawać'},{en:'heißen',pl:'nazywać się'},
    {en:'öffnen',pl:'otwierać'},{en:'schließen',pl:'zamykać'},{en:'beginnen',pl:'zaczynać'},
    {en:'enden',pl:'kończyć'},{en:'glauben',pl:'wierzyć/sądzić'},
  ]},
  { name: 'Liczby i czas', icon: '⏰', words: [
    {en:'null',pl:'zero'},{en:'eins',pl:'jeden'},{en:'zwei',pl:'dwa'},{en:'drei',pl:'trzy'},
    {en:'vier',pl:'cztery'},{en:'fünf',pl:'pięć'},{en:'sechs',pl:'sześć'},{en:'sieben',pl:'siedem'},
    {en:'acht',pl:'osiem'},{en:'neun',pl:'dziewięć'},{en:'zehn',pl:'dziesięć'},
    {en:'zwanzig',pl:'dwadzieścia'},{en:'hundert',pl:'sto'},{en:'tausend',pl:'tysiąc'},
    {en:'die Zeit',pl:'czas'},{en:'die Stunde',pl:'godzina'},{en:'die Minute',pl:'minuta'},
    {en:'der Tag',pl:'dzień'},{en:'die Woche',pl:'tydzień'},{en:'der Monat',pl:'miesiąc'},
    {en:'das Jahr',pl:'rok'},{en:'der Morgen',pl:'ranek'},{en:'der Abend',pl:'wieczór'},
    {en:'die Nacht',pl:'noc'},{en:'heute',pl:'dzisiaj'},{en:'morgen',pl:'jutro'},
    {en:'gestern',pl:'wczoraj'},{en:'jetzt',pl:'teraz'},{en:'Montag',pl:'poniedziałek'},
    {en:'Dienstag',pl:'wtorek'},{en:'Mittwoch',pl:'środa'},{en:'Donnerstag',pl:'czwartek'},
    {en:'Freitag',pl:'piątek'},{en:'Samstag',pl:'sobota'},{en:'Sonntag',pl:'niedziela'},
    {en:'Januar',pl:'styczeń'},{en:'Februar',pl:'luty'},{en:'März',pl:'marzec'},
    {en:'April',pl:'kwiecień'},{en:'Mai',pl:'maj'},{en:'Juni',pl:'czerwiec'},
  ]},
  { name: 'Kolory i przymiotniki', icon: '🎨', words: [
    {en:'rot',pl:'czerwony'},{en:'blau',pl:'niebieski'},{en:'grün',pl:'zielony'},
    {en:'gelb',pl:'żółty'},{en:'weiß',pl:'biały'},{en:'schwarz',pl:'czarny'},
    {en:'grau',pl:'szary'},{en:'braun',pl:'brązowy'},{en:'orange',pl:'pomarańczowy'},
    {en:'lila',pl:'fioletowy'},{en:'rosa',pl:'różowy'},{en:'gut',pl:'dobry'},
    {en:'schlecht',pl:'zły/niedobry'},{en:'groß',pl:'duży/wielki'},{en:'klein',pl:'mały'},
    {en:'alt',pl:'stary'},{en:'neu',pl:'nowy'},{en:'jung',pl:'młody'},
    {en:'schön',pl:'piękny/ładny'},{en:'schnell',pl:'szybki'},{en:'langsam',pl:'powolny'},
    {en:'leicht',pl:'łatwy/lekki'},{en:'schwer',pl:'trudny/ciężki'},{en:'billig',pl:'tani'},
    {en:'teuer',pl:'drogi'},{en:'richtig',pl:'prawidłowy'},{en:'falsch',pl:'błędny'},
    {en:'wichtig',pl:'ważny'},{en:'interessant',pl:'interesujący'},{en:'langweilig',pl:'nudny'},
    {en:'müde',pl:'zmęczony'},{en:'krank',pl:'chory'},{en:'gesund',pl:'zdrowy'},
    {en:'glücklich',pl:'szczęśliwy'},{en:'traurig',pl:'smutny'},{en:'warm',pl:'ciepły'},
    {en:'kalt',pl:'zimny'},{en:'heiß',pl:'gorący'},{en:'sauber',pl:'czysty'},
    {en:'schmutzig',pl:'brudny'},{en:'voll',pl:'pełny'},{en:'leer',pl:'pusty'},
  ]},
  { name: 'Jedzenie i picie', icon: '🍺', words: [
    {en:'das Brot',pl:'chleb'},{en:'die Butter',pl:'masło'},{en:'die Milch',pl:'mleko'},
    {en:'das Ei',pl:'jajko'},{en:'der Käse',pl:'ser'},{en:'das Fleisch',pl:'mięso'},
    {en:'das Hähnchen',pl:'kurczak'},{en:'der Fisch',pl:'ryba'},{en:'der Apfel',pl:'jabłko'},
    {en:'die Banane',pl:'banan'},{en:'die Orange',pl:'pomarańcza'},{en:'die Erdbeere',pl:'truskawka'},
    {en:'die Tomate',pl:'pomidor'},{en:'die Kartoffel',pl:'ziemniak'},{en:'die Karotte',pl:'marchewka'},
    {en:'die Zwiebel',pl:'cebula'},{en:'der Knoblauch',pl:'czosnek'},{en:'der Reis',pl:'ryż'},
    {en:'die Nudeln',pl:'makaron'},{en:'die Suppe',pl:'zupa'},{en:'der Salat',pl:'sałatka'},
    {en:'die Pizza',pl:'pizza'},{en:'das Sandwich',pl:'kanapka'},{en:'der Kuchen',pl:'ciasto'},
    {en:'die Schokolade',pl:'czekolada'},{en:'das Eis',pl:'lody'},{en:'das Wasser',pl:'woda'},
    {en:'der Saft',pl:'sok'},{en:'der Kaffee',pl:'kawa'},{en:'der Tee',pl:'herbata'},
    {en:'das Bier',pl:'piwo'},{en:'der Wein',pl:'wino'},{en:'der Zucker',pl:'cukier'},
    {en:'das Salz',pl:'sól'},{en:'der Pfeffer',pl:'pieprz'},{en:'das Öl',pl:'olej/oliwa'},
    {en:'die Marmelade',pl:'dżem'},{en:'der Honig',pl:'miód'},{en:'der Joghurt',pl:'jogurt'},
    {en:'die Sahne',pl:'śmietana'},{en:'der Pilz',pl:'grzyb'},
  ]},
  { name: 'Transport i miasto', icon: '🚂', words: [
    {en:'das Auto',pl:'samochód'},{en:'der Zug',pl:'pociąg'},{en:'der Bus',pl:'autobus'},
    {en:'das Flugzeug',pl:'samolot'},{en:'das Fahrrad',pl:'rower'},{en:'das Motorrad',pl:'motocykl'},
    {en:'die U-Bahn',pl:'metro'},{en:'die Straßenbahn',pl:'tramwaj'},{en:'das Taxi',pl:'taksówka'},
    {en:'der Bahnhof',pl:'dworzec'},{en:'der Flughafen',pl:'lotnisko'},{en:'die Haltestelle',pl:'przystanek'},
    {en:'die Straße',pl:'ulica'},{en:'der Weg',pl:'droga/ścieżka'},{en:'die Brücke',pl:'most'},
    {en:'der Tunnel',pl:'tunel'},{en:'die Kreuzung',pl:'skrzyżowanie'},{en:'der Parkplatz',pl:'parking'},
    {en:'die Stadt',pl:'miasto'},{en:'das Dorf',pl:'wieś'},{en:'das Zentrum',pl:'centrum'},
    {en:'der Marktplatz',pl:'rynek'},{en:'das Rathaus',pl:'ratusz'},{en:'die Kirche',pl:'kościół'},
    {en:'das Museum',pl:'muzeum'},{en:'die Bibliothek',pl:'biblioteka'},{en:'das Krankenhaus',pl:'szpital'},
    {en:'die Polizei',pl:'policja'},{en:'die Feuerwehr',pl:'straż pożarna'},
    {en:'das Kaufhaus',pl:'dom handlowy'},{en:'der Supermarkt',pl:'supermarket'},
    {en:'die Apotheke',pl:'apteka'},{en:'die Bank',pl:'bank'},{en:'das Hotel',pl:'hotel'},
    {en:'das Restaurant',pl:'restauracja'},{en:'das Café',pl:'kawiarnia'},
    {en:'der Park',pl:'park'},{en:'der Friedhof',pl:'cmentarz'},{en:'die Schule',pl:'szkoła'},
  ]},
  { name: 'Ciało i zdrowie', icon: '🏥', words: [
    {en:'der Kopf',pl:'głowa'},{en:'das Haar',pl:'włosy'},{en:'das Auge',pl:'oko'},
    {en:'das Ohr',pl:'ucho'},{en:'die Nase',pl:'nos'},{en:'der Mund',pl:'usta'},
    {en:'der Zahn',pl:'ząb'},{en:'die Zunge',pl:'język'},{en:'die Lippe',pl:'warga'},
    {en:'das Kinn',pl:'broda'},{en:'die Wange',pl:'policzek'},{en:'die Stirn',pl:'czoło'},
    {en:'der Hals',pl:'szyja/kark'},{en:'die Schulter',pl:'ramię/bark'},{en:'der Arm',pl:'ramię'},
    {en:'der Ellbogen',pl:'łokieć'},{en:'das Handgelenk',pl:'nadgarstek'},{en:'die Hand',pl:'dłoń'},
    {en:'der Finger',pl:'palec'},{en:'der Daumen',pl:'kciuk'},{en:'die Brust',pl:'klatka piersiowa'},
    {en:'der Rücken',pl:'plecy'},{en:'der Bauch',pl:'brzuch'},{en:'die Hüfte',pl:'biodro'},
    {en:'das Bein',pl:'noga'},{en:'das Knie',pl:'kolano'},{en:'der Knöchel',pl:'kostka'},
    {en:'der Fuß',pl:'stopa'},{en:'die Haut',pl:'skóra'},{en:'der Knochen',pl:'kość'},
    {en:'der Muskel',pl:'mięsień'},{en:'das Herz',pl:'serce'},{en:'die Lunge',pl:'płuco'},
    {en:'das Gehirn',pl:'mózg'},{en:'das Blut',pl:'krew'},{en:'der Arzt',pl:'lekarz'},
    {en:'die Ärztin',pl:'lekarka'},{en:'das Medikament',pl:'lekarstwo'},{en:'das Rezept',pl:'recepta'},
    {en:'die Krankheit',pl:'choroba'},{en:'der Schmerz',pl:'ból'},
  ]},
  { name: 'Praca i edukacja', icon: '💼', words: [
    {en:'die Arbeit',pl:'praca'},{en:'der Beruf',pl:'zawód'},{en:'der Chef',pl:'szef'},
    {en:'der Kollege',pl:'kolega z pracy'},{en:'die Kollegin',pl:'koleżanka z pracy'},
    {en:'das Büro',pl:'biuro'},{en:'die Firma',pl:'firma'},{en:'das Gehalt',pl:'wynagrodzenie'},
    {en:'die Stelle',pl:'posada/etat'},{en:'der Vertrag',pl:'umowa'},{en:'die Kündigung',pl:'wypowiedzenie'},
    {en:'die Schule',pl:'szkoła'},{en:'die Universität',pl:'uniwersytet'},{en:'der Lehrer',pl:'nauczyciel'},
    {en:'der Schüler',pl:'uczeń'},{en:'der Student',pl:'student'},{en:'die Note',pl:'ocena'},
    {en:'die Prüfung',pl:'egzamin'},{en:'die Hausaufgabe',pl:'zadanie domowe'},
    {en:'das Fach',pl:'przedmiot'},{en:'die Mathematik',pl:'matematyka'},
    {en:'die Geschichte',pl:'historia'},{en:'die Sprache',pl:'język'},{en:'die Physik',pl:'fizyka'},
    {en:'die Biologie',pl:'biologia'},{en:'die Chemie',pl:'chemia'},{en:'der Abschluss',pl:'dyplom/zakończenie'},
    {en:'das Zeugnis',pl:'świadectwo'},{en:'der Stundenplan',pl:'plan lekcji'},
    {en:'die Pause',pl:'przerwa'},{en:'die Bibliothek',pl:'biblioteka'},
    {en:'das Lehrbuch',pl:'podręcznik'},{en:'das Heft',pl:'zeszyt'},{en:'der Stift',pl:'długopis/ołówek'},
    {en:'das Wörterbuch',pl:'słownik'},{en:'die Grammatik',pl:'gramatyka'},
    {en:'der Aufsatz',pl:'wypracowanie'},{en:'der Kurs',pl:'kurs'},
    {en:'das Zertifikat',pl:'certyfikat'},{en:'die Fortbildung',pl:'szkolenie/doskonalenie'},
  ]},
  { name: 'Zwroty codzienne', icon: '💬', words: [
    {en:'Guten Morgen',pl:'Dzień dobry (rano)'},{en:'Guten Tag',pl:'Dzień dobry'},
    {en:'Guten Abend',pl:'Dobry wieczór'},{en:'Gute Nacht',pl:'Dobranoc'},
    {en:'Auf Wiedersehen',pl:'Do widzenia'},{en:'Tschüss',pl:'Pa/Cześć (na odchodne)'},
    {en:'Hallo',pl:'Cześć'},{en:'Bitte',pl:'Proszę'},{en:'Danke',pl:'Dziękuję'},
    {en:'Danke schön',pl:'Dziękuję bardzo'},{en:'Bitte schön',pl:'Proszę/Nie ma za co'},
    {en:'Entschuldigung',pl:'Przepraszam'},{en:'Es tut mir leid',pl:'Przykro mi'},
    {en:'Ja',pl:'Tak'},{en:'Nein',pl:'Nie'},{en:'Vielleicht',pl:'Może'},
    {en:'Ich verstehe',pl:'Rozumiem'},{en:'Ich verstehe nicht',pl:'Nie rozumiem'},
    {en:'Können Sie das wiederholen?',pl:'Czy może Pan/Pani powtórzyć?'},
    {en:'Sprechen Sie Polnisch?',pl:'Czy mówi Pan/Pani po polsku?'},
    {en:'Ich lerne Deutsch',pl:'Uczę się niemieckiego'},
    {en:'Wie heißen Sie?',pl:'Jak Pan/Pani się nazywa?'},
    {en:'Ich heiße...',pl:'Nazywam się...'},{en:'Woher kommen Sie?',pl:'Skąd Pan/Pani pochodzi?'},
    {en:'Ich komme aus Polen',pl:'Pochodzę z Polski'},
    {en:'Wie geht es Ihnen?',pl:'Jak się Pan/Pani miewa?'},
    {en:'Mir geht es gut',pl:'Dobrze mi/Czuję się dobrze'},
    {en:'Was kostet das?',pl:'Ile to kosztuje?'},{en:'Wo ist...?',pl:'Gdzie jest...?'},
    {en:'Ich hätte gern...',pl:'Chciałbym/Chciałabym...'},{en:'Die Rechnung bitte',pl:'Rachunek proszę'},
    {en:'Hilfe!',pl:'Pomocy!'},{en:'Achtung!',pl:'Uwaga!'},
    {en:'Natürlich',pl:'Oczywiście'},{en:'Genau',pl:'Dokładnie'},
    {en:'Sehr gut!',pl:'Bardzo dobrze!'},{en:'Super!',pl:'Super!'},
    {en:'Kein Problem',pl:'Żaden problem'},{en:'Alles klar',pl:'Wszystko jasne'},
  ]},
  { name: 'Niemcy — kultura i realia', icon: '🇩🇪', words: [
    {en:'Deutschland',pl:'Niemcy'},{en:'Berlin',pl:'Berlin (stolica)'},{en:'Bayern',pl:'Bawaria'},
    {en:'die Bundesrepublik',pl:'Republika Federalna'},{en:'das Bundesland',pl:'kraj związkowy'},
    {en:'der Bundestag',pl:'Bundestag (parlament)'},{en:'der Kanzler',pl:'kanclerz'},
    {en:'die Autobahn',pl:'autostrada'},{en:'das Oktoberfest',pl:'Oktoberfest'},
    {en:'die Bratwurst',pl:'kiełbasa z grilla'},{en:'das Sauerkraut',pl:'kiszona kapusta'},
    {en:'das Schnitzel',pl:'sznycel'},{en:'das Weißbier',pl:'piwo pszeniczne'},
    {en:'der Schwarzwald',pl:'Schwarzwald (Czarny Las)'},{en:'der Rhein',pl:'Ren (rzeka)'},
    {en:'die Alpen',pl:'Alpy'},{en:'das Schloss',pl:'zamek'},{en:'die Burg',pl:'twierdza'},
    {en:'der Dom',pl:'katedra'},{en:'der Weihnachtsmarkt',pl:'jarmark bożonarodzeniowy'},
    {en:'das Recycling',pl:'recykling'},{en:'die Mülltrennung',pl:'segregacja odpadów'},
    {en:'die Krankenversicherung',pl:'ubezpieczenie zdrowotne'},
    {en:'die Rentenversicherung',pl:'ubezpieczenie emerytalne'},
    {en:'das Finanzamt',pl:'urząd skarbowy'},{en:'die Anmeldung',pl:'zameldowanie'},
    {en:'das Rathaus',pl:'ratusz'},{en:'der Personalausweis',pl:'dowód osobisty'},
    {en:'die Steuern',pl:'podatki'},{en:'die Miete',pl:'czynsz'},
    {en:'die Nebenkosten',pl:'koszty dodatkowe (opłaty)'},{en:'die Müllabfuhr',pl:'wywóz śmieci'},
    {en:'die Ruhezeit',pl:'cisza nocna'},{en:'das Pfand',pl:'kaucja/klapsy (za butelki)'},
    {en:'pünktlich',pl:'punktualny'},{en:'die Pünktlichkeit',pl:'punktualność'},
    {en:'gründlich',pl:'dokładny/gruntowny'},{en:'ordentlich',pl:'porządny/schludny'},
    {en:'gemütlich',pl:'przytulny/wygodny'},{en:'der Heimweh',pl:'tęsknota za domem'},
    {en:'die Weltanschauung',pl:'weltanszauung/pogląd na świat'},
  ]},
  { name: 'Emocje i charakter', icon: '😊', words: [
    {en:'glücklich',pl:'szczęśliwy'},{en:'traurig',pl:'smutny'},{en:'wütend',pl:'wściekły/zły'},
    {en:'ängstlich',pl:'przestraszony'},{en:'überrascht',pl:'zaskoczony'},{en:'begeistert',pl:'podekscytowany'},
    {en:'gelangweilt',pl:'znudzony'},{en:'müde',pl:'zmęczony'},{en:'nervös',pl:'zdenerwowany'},
    {en:'ruhig',pl:'spokojny'},{en:'stolz',pl:'dumny'},{en:'verlegen',pl:'zawstydzony'},
    {en:'eifersüchtig',pl:'zazdrosny'},{en:'die Liebe',pl:'miłość'},{en:'der Hass',pl:'nienawiść'},
    {en:'die Hoffnung',pl:'nadzieja'},{en:'die Angst',pl:'strach/lęk'},{en:'die Freude',pl:'radość'},
    {en:'die Trauer',pl:'smutek/żal'},{en:'die Einsamkeit',pl:'samotność'},
    {en:'das Vertrauen',pl:'zaufanie'},{en:'die Neugier',pl:'ciekawość'},
    {en:'die Enttäuschung',pl:'rozczarowanie'},{en:'die Frustration',pl:'frustracja'},
    {en:'die Dankbarkeit',pl:'wdzięczność'},{en:'das Verständnis',pl:'zrozumienie'},
    {en:'freundlich',pl:'przyjazny/miły'},{en:'hilfsbereit',pl:'pomocny'},
    {en:'zuverlässig',pl:'niezawodny'},{en:'ehrlich',pl:'szczery/uczciwy'},
    {en:'geduldig',pl:'cierpliwy'},{en:'ungeduldig',pl:'niecierpliwy'},
    {en:'mutig',pl:'odważny'},{en:'schüchtern',pl:'nieśmiały'},
    {en:'selbstbewusst',pl:'pewny siebie'},{en:'bescheiden',pl:'skromny'},
    {en:'großzügig',pl:'hojny'},{en:'geizig',pl:'skąpy'},
    {en:'neugierig',pl:'ciekawski'},{en:'kreativ',pl:'kreatywny'},
  ]},
];

function seedDefaultSets() {
  if ((DB.get('de_defaultSetsVersion') || 0) >= DEFAULT_SETS_VERSION) return;
  const existing = getSets();
  const seeded = DEFAULT_SETS_DATA.map(s => ({
    id: uid(),
    name: s.name,
    icon: s.icon,
    words: s.words.map(w => ({ id: uid(), en: w.en, pl: w.pl })),
    results: [],
    createdAt: today(),
    lastUsed: 0,
  }));
  saveSets([...seeded, ...existing]);
  DB.set('de_defaultSetsVersion', DEFAULT_SETS_VERSION);
}

// ===== INIT =====
seedDefaultSets();
showView('home');
