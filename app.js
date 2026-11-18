/* ================================================================
   SEN Student Progress Tracker — app.js
   All data is stored in localStorage on this device only.
   Demo/sample data uses fictional students.
================================================================ */

const SKILLS = [
  { key: 'communication', label: 'Communication', icon: '💬', cls: 'skill-comm' },
  { key: 'social',        label: 'Social',        icon: '🤝', cls: 'skill-social' },
  { key: 'cognitive',     label: 'Cognitive',     icon: '🧠', cls: 'skill-cog' },
  { key: 'daily',         label: 'Daily Living',  icon: '🥣', cls: 'skill-daily' },
];
const SKILL_COLORS = { communication: '#2f6fed', social: '#7c3aed', cognitive: '#0d9488', daily: '#d97706' };
const AVATAR_COLORS = ['#2f6fed', '#7c3aed', '#0d9488', '#d97706', '#dc2626', '#16a34a', '#db2777', '#475569'];
const STORAGE_KEY = 'sen_tracker_v1';

/* ---------------- Seed sample data ---------------- */
function daysAgo(n) {
  const d = new Date(); d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function seedData() {
  const students = [
    {
      id: 's1', name: 'Alex T.', age: 8, group: 'Rainbow 2',
      notes: 'Responds well to visual schedules and first-then boards. Uses PECS to communicate.',
      goals: [
        { id: 'g1a', text: 'Request a break using picture card without prompting', area: 'communication' },
        { id: 'g1b', text: 'Take turns in a board game with one peer', area: 'social' },
        { id: 'g1c', text: 'Put on shoes independently', area: 'daily' },
      ],
    },
    {
      id: 's2', name: 'Bella R.', age: 7, group: 'Rainbow 2',
      notes: 'Very motivated by music. Benefits from short, chunked tasks and movement breaks.',
      goals: [
        { id: 'g2a', text: 'Answer simple "who/what" questions', area: 'communication' },
        { id: 'g2b', text: 'Join a group activity for 10 minutes', area: 'social' },
        { id: 'g2c', text: 'Count objects to 10 with one-to-one correspondence', area: 'cognitive' },
      ],
    },
    {
      id: 's3', name: 'Caleb L.', age: 9, group: 'Sunshine 1',
      notes: 'Strong reader. Can become anxious with unplanned changes; uses a worry thermometer.',
      goals: [
        { id: 'g3a', text: 'Write 3-sentence story with a beginning, middle and end', area: 'cognitive' },
        { id: 'g3b', text: 'Ask a peer to play using words', area: 'social' },
        { id: 'g3c', text: 'Pack school bag using checklist independently', area: 'daily' },
      ],
    },
    {
      id: 's4', name: 'Devi M.', age: 6, group: 'Sunshine 1',
      notes: 'Developing speech; enjoys sensory play. Gentle hand-over-hand support for self-care tasks.',
      goals: [
        { id: 'g4a', text: 'Use 2-word phrases to make requests', area: 'communication' },
        { id: 'g4b', text: 'Wash hands with minimal verbal prompts', area: 'daily' },
        { id: 'g4c', text: 'Sort objects by colour and size', area: 'cognitive' },
      ],
    },
    {
      id: 's5', name: 'Ethan K.', age: 10, group: 'Sunshine 1',
      notes: 'Likes routines and facts about transport. Working on flexible thinking and peer conversation.',
      goals: [
        { id: 'g5a', text: 'Stay on topic in a conversation for 3 exchanges', area: 'social' },
        { id: 'g5b', text: 'Solve two-step maths word problems', area: 'cognitive' },
        { id: 'g5c', text: 'Order own lunch at the canteen', area: 'daily' },
      ],
    },
  ];

  const entries = [];
  let rid = 1;
  const plans = {
    // gentle upward trends with day-to-day variation, plus a dip for Caleb (recent stress)
    s1: { base: [3.0, 2.4, 2.2, 2.6], wobble: 0.8, trend: 0.045 },
    s2: { base: [2.4, 2.0, 2.2, 2.0], wobble: 0.8, trend: 0.030 },
    s3: { base: [4.2, 3.6, 4.0, 3.4], wobble: 0.7, trend: 0.015, dipStart: 2, dipAmt: 1.3 },
    s4: { base: [2.0, 1.8, 1.9, 2.2], wobble: 0.9, trend: 0.055 },
    s5: { base: [3.6, 3.2, 3.8, 3.0], wobble: 0.7, trend: 0.020 },
  };
  const noteBank = {
    up: [
      'Great session today — needed fewer prompts than usual and stayed engaged for the whole activity.',
      'Used words/picture cards to ask for what was needed. Peers responded positively.',
      'Followed the visual schedule with only one reminder. Smiled and joined in group singing.',
      'Managed the transition to the next activity calmly after a two-minute warning.',
      'Completed the task almost independently; proud of himself/herself at the end!',
    ],
    flat: [
      'A steady day. Needed the usual level of prompting and support throughout activities.',
      'Participated in circle time but needed frequent redirection to stay with the group.',
      'Completed most of the task with adult support. No significant incidents.',
      'Average day overall — responded well to familiar routines.',
    ],
    down: [
      'A tricky day. Found transitions difficult and needed extra reassurance after the fire drill.',
      'Tired this morning; refused the first activity but re-engaged after a movement break.',
      'Some peer conflict during group work — supported to repair and take a break.',
      'Had difficulty concentrating; shortened tasks and offered sensory breaks which helped.',
    ],
  };

  students.forEach(st => {
    const p = plans[st.id];
    for (let d = 29; d >= 0; d--) {
      if ((st.id === 's2' || st.id === 's4') && d % 3 === 1) continue; // not every day for younger kids
      const scores = {};
      SKILLS.forEach((sk, i) => {
        let v = p.base[i] + (29 - d) * p.trend + (Math.random() * 2 - 1) * p.wobble;
        if (p.dipStart && d < p.dipStart) v -= p.dipAmt * (p.dipStart - d) / p.dipStart * (0.7 + Math.random() * 0.6);
        scores[sk.key] = Math.max(0, Math.min(5, Math.round(v)));
      });
      const avg = (scores.communication + scores.social + scores.cognitive + scores.daily) / 4;
      const bank = avg >= p.base.reduce((a, b) => a + b) / 4 + 0.7 ? 'up' : avg <= p.base.reduce((a, b) => a + b) / 4 - 0.7 ? 'down' : 'flat';
      entries.push({
        id: 'r' + rid++,
        studentId: st.id,
        date: daysAgo(d),
        scores,
        notes: noteBank[bank][Math.floor(Math.random() * noteBank[bank].length)],
      });
    }
  });

  return { students, entries, seeded: true };
}

/* ---------------- State ---------------- */
let DB = load();
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted storage -> reseed */ }
  const db = seedData();
  save(db);
  return db;
}
function save(db) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); }
  catch (e) { console.warn('Could not save to localStorage', e); }
}
const uid = () => 'id' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const studentById = id => DB.students.find(s => s.id === id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
const todayISO = () => new Date().toISOString().slice(0, 10);

/* ---------------- Router ---------------- */
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.view));
});
document.querySelectorAll('[data-goto]').forEach(btn => {
  btn.addEventListener('click', () => showView(btn.dataset.goto));
});
function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.view === name));
  if (name === 'dashboard') renderDashboard();
  if (name === 'students') renderStudents();
  if (name === 'daily') renderDaily();
}

/* ---------------- Shared helpers ---------------- */
function avgScores(entries) {
  const out = {};
  SKILLS.forEach(sk => {
    const vals = entries.map(e => e.scores[sk.key]).filter(v => v != null);
    out[sk.key] = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  });
  return out;
}
function overall(avg) {
  const vals = Object.values(avg).filter(v => v != null);
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
function entriesInDays(entries, days) {
  if (days === 'all') return [...entries];
  const cut = new Date(); cut.setDate(cut.getDate() - Number(days));
  const cutISO = cut.toISOString().slice(0, 10);
  return entries.filter(e => e.date >= cutISO);
}
function barHTML(score, cls) {
  const pct = Math.round((score / 5) * 100);
  return `<div class="bar"><div class="bar-fill ${cls}" style="width:${pct}%"></div></div>
          <div class="bar-num">${score.toFixed(1)} / 5</div>`;
}
function pillFor(v) {
  if (v == null) return '<span class="pill pill-amber">no data</span>';
  if (v >= 3.5) return '<span class="pill pill-green">doing well</span>';
  if (v >= 2.5) return '<span class="pill pill-amber">building</span>';
  return '<span class="pill pill-red">needs focus</span>';
}
function fillStudentSelect(sel, includeAll) {
  sel.innerHTML = (includeAll ? '<option value="">All students</option>' : '') +
    DB.students.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join('');
}

/* ================= DASHBOARD ================= */
function renderDashboard() {
  // stat cards
  const week = entriesInDays(DB.entries, 7);
  const prevWeek = (() => {
    const cut = new Date(); cut.setDate(cut.getDate() - 7);
    const cut2 = new Date(); cut2.setDate(cut2.getDate() - 14);
    const a = cut.toISOString().slice(0, 10), b = cut2.toISOString().slice(0, 10);
    return DB.entries.filter(e => e.date >= b && e.date < a);
  })();
  const avgW = overall(avgScores(week));
  const avgP = overall(avgScores(prevWeek));
  const diff = (avgW != null && avgP != null) ? avgW - avgP : null;
  const trendHTML = diff == null ? '<span class="stat-trend trend-flat">—</span>'
    : `<span class="stat-trend ${diff > 0.05 ? 'trend-up' : diff < -0.05 ? 'trend-down' : 'trend-flat'}">
         ${diff > 0 ? '▲' : diff < 0 ? '▼' : '•'} ${Math.abs(diff).toFixed(1)} vs last week</span>`;

  const todayCount = DB.entries.filter(e => e.date === todayISO()).length;
  const goalCount = DB.students.reduce((n, s) => n + (s.goals || []).length, 0);

  document.getElementById('stat-grid').innerHTML = `
    <div class="stat-card"><div class="stat-top"><span class="stat-label">Students</span><span class="stat-ico">🧑‍🎓</span></div>
      <div class="stat-value">${DB.students.length}</div><div class="stat-trend trend-flat">${goalCount} learning goals</div></div>
    <div class="stat-card"><div class="stat-top"><span class="stat-label">Class average (7 days)</span><span class="stat-ico">📈</span></div>
      <div class="stat-value">${avgW == null ? '—' : avgW.toFixed(1)}<span class="muted" style="font-size:.5em"> /5</span></div>${trendHTML}</div>
    <div class="stat-card"><div class="stat-top"><span class="stat-label">Entries today</span><span class="stat-ico">📝</span></div>
      <div class="stat-value">${todayCount}</div><div class="stat-trend trend-flat">${DB.entries.length} entries total</div></div>
    <div class="stat-card"><div class="stat-top"><span class="stat-label">Highest skill</span><span class="stat-ico">⭐</span></div>
      <div class="stat-value" style="font-size:1.3rem; padding-top:.35rem;">${topSkillLabel(week)}</div></div>`;

  // chart
  drawAvgChart(prevWeek, week);

  // recent entries
  const recent = [...DB.entries].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6);
  document.getElementById('recent-list').innerHTML = recent.length ? recent.map(e => {
    const st = studentById(e.studentId);
    const o = overall(e.scores);
    return `<li><span><strong>${esc(st ? st.name : '?')}</strong> — ${fmtDate(e.date)}</span>
            <span>${pillFor(o)}</span></li>`;
  }).join('') : '<li class="recent-empty">No entries yet. Record today\'s progress to get started!</li>';

  // overview table (last 14 days per student)
  document.getElementById('overview-body').innerHTML = DB.students.map(s => {
    const av = avgScores(entriesInDays(DB.entries.filter(e => e.studentId === s.id), 14));
    const o = overall(av);
    return `<tr class="rowlink" data-student="${s.id}" tabindex="0" role="link" aria-label="Open profile for ${esc(s.name)}">
      <td><span class="student-chip"><span class="avatar" style="background:${avatarColor(s.name)}">${esc(initials(s.name))}</span> ${esc(s.name)}</span></td>
      ${SKILLS.map(sk => `<td class="bar-cell">${av[sk.key] == null ? '—' : barHTML(av[sk.key], sk.cls)}</td>`).join('')}
      <td>${o == null ? '—' : `<strong>${o.toFixed(1)}</strong> ${pillFor(o)}`}</td></tr>`;
  }).join('');

  document.querySelectorAll('#overview-body .rowlink').forEach(tr => {
    tr.addEventListener('click', () => openDetail(tr.dataset.student));
    tr.addEventListener('keydown', ev => { if (ev.key === 'Enter') openDetail(tr.dataset.student); });
  });
}
function topSkillLabel(entries) {
  const av = avgScores(entries);
  let best = null, bestV = -1;
  SKILLS.forEach(sk => { if (av[sk.key] != null && av[sk.key] > bestV) { bestV = av[sk.key]; best = sk; } });
  return best ? `${best.label} <span class="muted">${bestV.toFixed(1)}</span>` : '—';
}

/* --- simple canvas bar chart (no external libs) --- */
function drawAvgChart(prev, curr) {
  const cv = document.getElementById('chart-avg');
  const dpr = window.devicePixelRatio || 1;
  const w = cv.clientWidth || 560, h = 230;
  cv.width = w * dpr; cv.height = h * dpr;
  const ctx = cv.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);

  const pA = avgScores(prev), cA = avgScores(curr);
  const padL = 30, padB = 30, padT = 12, padR = 8;
  const chartW = w - padL - padR, chartH = h - padT - padB;
  const groupW = chartW / SKILLS.length;
  const barW = Math.min(38, groupW / 3.4);

  // gridlines + y labels
  ctx.font = '11px Segoe UI, sans-serif';
  ctx.fillStyle = '#8a99ad';
  ctx.strokeStyle = '#eef2f7';
  ctx.textAlign = 'right';
  for (let v = 0; v <= 5; v++) {
    const y = padT + chartH - (v / 5) * chartH;
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(w - padR, y); ctx.stroke();
    ctx.fillText(String(v), padL - 6, y + 4);
  }

  SKILLS.forEach((sk, i) => {
    const cx = padL + groupW * i + groupW / 2;
    const drawBar = (val, off, color) => {
      if (val == null) return;
      const bh = (val / 5) * chartH;
      ctx.fillStyle = color;
      const x = cx + off - barW / 2, y = padT + chartH - bh;
      roundRect(ctx, x, y, barW, bh, 5);
      ctx.fill();
      ctx.fillStyle = '#5b6b7e';
      ctx.textAlign = 'center';
      ctx.fillText(val.toFixed(1), cx + off, y - 4);
    };
    drawBar(pA[sk.key], -barW * 0.62, '#c3d0e4');
    drawBar(cA[sk.key], barW * 0.62, SKILL_COLORS[sk.key]);
    ctx.fillStyle = '#1e2a38';
    ctx.textAlign = 'center';
    ctx.font = '600 12px Segoe UI, sans-serif';
    ctx.fillText(sk.label, cx, h - 10);
    ctx.font = '11px Segoe UI, sans-serif';
  });

  // legend
  const lx = padL, ly = padT + 2;
  ctx.fillStyle = '#c3d0e4'; ctx.fillRect(lx, ly, 12, 12);
  ctx.fillStyle = '#5b6b7e'; ctx.textAlign = 'left'; ctx.fillText('Last week', lx + 17, ly + 10);
  ctx.fillStyle = '#2f6fed'; ctx.fillRect(lx + 92, ly, 12, 12);
  ctx.fillStyle = '#5b6b7e'; ctx.fillText('This week', lx + 109, ly + 10);
}
function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, Math.max(h, 0.01) / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, Math.min(r, h / 2));
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
window.addEventListener('resize', () => {
  if (document.getElementById('view-dashboard').classList.contains('active')) renderDashboard();
});

/* ================= STUDENTS ================= */
document.getElementById('btn-add-student').addEventListener('click', () => openStudentModal());
function avatarColor(name) {
  let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR_COLORS[h % AVATAR_COLORS.length];
}
const initials = name => name.split(/\s+/).map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

function renderStudents() {
  const grid = document.getElementById('student-grid');
  grid.innerHTML = DB.students.map(s => {
    const av = avgScores(entriesInDays(DB.entries.filter(e => e.studentId === s.id), 14));
    const o = overall(av);
    return `<div class="student-card">
      <div class="student-card-head">
        <span class="avatar" style="background:${avatarColor(s.name)}">${esc(initials(s.name))}</span>
        <div><div class="sc-name">${esc(s.name)}</div>
        <div class="sc-meta">${s.age ? esc(s.age) + ' years old' : ''}${s.age && s.group ? ' · ' : ''}${esc(s.group || '')}</div></div>
        <div class="sc-overall"><div class="num">${o == null ? '—' : o.toFixed(1)}</div><div class="lbl">overall</div></div>
      </div>
      <ul class="goal-list">
        ${(s.goals || []).slice(0, 3).map(g => `<li><span class="goal-dot">${goalAreaIcon(g.area)}</span><span>${esc(g.text)}</span></li>`).join('') || '<li class="muted">No goals yet — add some!</li>'}
      </ul>
      <div class="sc-actions">
        <button class="btn btn-ghost" data-detail="${s.id}">View profile</button>
        <button class="btn btn-ghost" data-edit="${s.id}">Edit</button>
      </div></div>`;
  }).join('');

  grid.querySelectorAll('[data-detail]').forEach(b => b.addEventListener('click', () => openDetail(b.dataset.detail)));
  grid.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', () => openStudentModal(b.dataset.edit)));
}
const goalAreaIcon = area => ({ communication: '💬', social: '🤝', cognitive: '🧠', daily: '🥣' }[area] || '🎯');

/* --- student add/edit modal --- */
const studentModal = document.getElementById('student-modal');
function openStudentModal(id) {
  const st = id ? studentById(id) : null;
  document.getElementById('modal-title').textContent = st ? 'Edit Student' : 'Add Student';
  document.getElementById('sf-id').value = st ? st.id : '';
  document.getElementById('sf-name').value = st ? st.name : '';
  document.getElementById('sf-age').value = st && st.age ? st.age : '';
  document.getElementById('sf-year').value = st ? (st.group || '') : '';
  document.getElementById('sf-notes').value = st ? (st.notes || '') : '';
  renderGoalsEditor(st ? st.goals : []);
  studentModal.hidden = false;
  document.getElementById('sf-name').focus();
}
function renderGoalsEditor(goals) {
  const wrap = document.getElementById('goals-editor');
  wrap.innerHTML = (goals || []).map(g => goalRowHTML(g)).join('');
  wrap.querySelectorAll('.goal-remove').forEach(b =>
    b.addEventListener('click', () => b.closest('.goal-inputs').remove()));
}
function goalRowHTML(g) {
  return `<div class="goal-inputs">
    <input type="text" class="goal-text" placeholder="e.g. Ask for help using words" value="${esc(g.text || '')}" aria-label="Goal description">
    <select class="goal-area" aria-label="Goal area">
      ${SKILLS.map(sk => `<option value="${sk.key}" ${g.area === sk.key ? 'selected' : ''}>${sk.icon} ${sk.label}</option>`).join('')}
    </select>
    <button type="button" class="goal-remove" aria-label="Remove goal">✕</button></div>`;
}
document.getElementById('btn-add-goal').addEventListener('click', () => {
  document.getElementById('goals-editor').insertAdjacentHTML('beforeend', goalRowHTML({}));
  const rows = document.querySelectorAll('#goals-editor .goal-inputs');
  rows[rows.length - 1].querySelector('.goal-text').focus();
});
document.getElementById('student-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const id = document.getElementById('sf-id').value;
  const goals = [...document.querySelectorAll('#goals-editor .goal-inputs')]
    .map(r => ({ text: r.querySelector('.goal-text').value.trim(), area: r.querySelector('.goal-area').value }))
    .filter(g => g.text);
  const data = {
    name: document.getElementById('sf-name').value.trim(),
    age: document.getElementById('sf-age').value ? Number(document.getElementById('sf-age').value) : null,
    group: document.getElementById('sf-year').value.trim(),
    notes: document.getElementById('sf-notes').value.trim(),
    goals,
  };
  if (!data.name) return;
  if (id) Object.assign(studentById(id), data);
  else DB.students.push({ id: uid(), ...data });
  save(DB);
  refreshAllSelects();
  studentModal.hidden = true;
  renderStudents();
});
['modal-close', 'modal-cancel'].forEach(idc =>
  document.getElementById(idc).addEventListener('click', () => { studentModal.hidden = true; }));

/* --- student detail modal --- */
const detailModal = document.getElementById('detail-modal');
function openDetail(id) {
  const s = studentById(id);
  if (!s) return;
  const entries = DB.entries.filter(e => e.studentId === id).sort((a, b) => a.date.localeCompare(b.date));
  const av = avgScores(entriesInDays(entries, 14));
  const o = overall(av);

  document.getElementById('detail-title').textContent = s.name;
  document.getElementById('detail-body').innerHTML = `
    <div class="student-card-head" style="margin-bottom:1rem;">
      <span class="avatar" style="background:${avatarColor(s.name)}">${esc(initials(s.name))}</span>
      <div><div class="sc-name">${esc(s.name)}</div>
      <div class="sc-meta">${s.age ? s.age + ' years old' : ''}${s.age && s.group ? ' · ' : ''}${esc(s.group || '')} · ${entries.length} entries</div></div>
      <div class="sc-overall"><div class="num">${o == null ? '—' : o.toFixed(1)}</div><div class="lbl">overall</div></div>
    </div>
    ${s.notes ? `<p class="hist-notes" style="margin-bottom:1rem;">${esc(s.notes)}</p>` : ''}
    <h3 style="font-size:.95rem; margin-bottom:.6rem;">Skill averages (last 14 days)</h3>
    <div class="table-wrap"><table class="table"><tbody>
      ${SKILLS.map(sk => `<tr><td style="width:150px"><strong>${sk.icon} ${sk.label}</strong></td><td class="bar-cell">${av[sk.key] == null ? '—' : barHTML(av[sk.key], sk.cls)}</td><td>${pillFor(av[sk.key])}</td></tr>`).join('')}
    </tbody></table></div>
    <h3 style="font-size:.95rem; margin:1rem 0 .6rem;">Learning goals</h3>
    <ul class="goal-list">${(s.goals || []).map(g => `<li><span class="goal-dot">${goalAreaIcon(g.area)}</span><span>${esc(g.text)}</span></li>`).join('') || '<li class="muted">No goals yet.</li>'}</ul>
    <div class="form-actions" style="margin-top:1.2rem;">
      <button class="btn btn-primary" id="detail-insight-btn">🤖 AI Insights</button>
      <button class="btn btn-ghost" id="detail-report-btn">📄 Report</button>
    </div>`;

  document.getElementById('detail-insight-btn').addEventListener('click', () => {
    detailModal.hidden = true;
    document.getElementById('ins-student').value = s.id;
    showView('insights');
    generateInsight();
  });
  document.getElementById('detail-report-btn').addEventListener('click', () => {
    detailModal.hidden = true;
    document.getElementById('rep-student').value = s.id;
    showView('reports');
    generateReport();
  });

  detailModal.hidden = false;
}
document.getElementById('detail-close').addEventListener('click', () => { detailModal.hidden = true; });

/* close modals on Escape / backdrop */
[studentModal, detailModal].forEach(m => {
  m.addEventListener('click', ev => { if (ev.target === m) m.hidden = true; });
});
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') { studentModal.hidden = true; detailModal.hidden = true; }
});

/* ================= DAILY PROGRESS ================= */
let ratingState = { communication: null, social: null, cognitive: null, daily: null };

function renderDaily() {
  fillStudentSelect(document.getElementById('df-student'));
  fillStudentSelect(document.getElementById('filter-student'), true);
  document.getElementById('df-date').value = document.getElementById('df-date').value || todayISO();
  renderHistory();
}

function buildStars(container, skillKey) {
  container.innerHTML = '';
  for (let v = 1; v <= 5; v++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'star';
    b.dataset.value = v;
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', 'false');
    b.setAttribute('aria-label', `${v} out of 5`);
    b.textContent = '★';
    b.addEventListener('click', () => { ratingState[skillKey] = v; paintStars(container, v, 5); });
    container.appendChild(b);
  }
  const clear = document.createElement('button');
  clear.type = 'button';
  clear.className = 'clear-btn';
  clear.textContent = 'clear';
  clear.addEventListener('click', () => { ratingState[skillKey] = null; container.querySelectorAll('.star').forEach(s => { s.classList.remove('on'); s.setAttribute('aria-checked', 'false'); }); });
  container.appendChild(clear);
}
function paintStars(container, upto, total) {
  container.querySelectorAll('.star').forEach(s => {
    const v = Number(s.dataset.value);
    s.classList.toggle('on', v <= upto);
    s.setAttribute('aria-checked', String(v === upto));
  });
}
document.querySelectorAll('.rating-row').forEach(row => {
  buildStars(row.querySelector('.stars'), row.dataset.skill);
});

document.getElementById('daily-form').addEventListener('submit', ev => {
  ev.preventDefault();
  const studentId = document.getElementById('df-student').value;
  const msg = document.getElementById('daily-form-msg');
  if (!studentId) { msg.style.color = 'var(--red)'; msg.textContent = 'Please choose a student (add one under Students if the list is empty).'; return; }
  if (Object.values(ratingState).every(v => v == null)) { msg.style.color = 'var(--red)'; msg.textContent = 'Please rate at least one skill area.'; return; }
  DB.entries.push({
    id: uid(),
    studentId,
    date: document.getElementById('df-date').value || todayISO(),
    scores: { ...ratingState },
    notes: document.getElementById('df-notes').value.trim(),
  });
  save(DB);
  ratingState = { communication: null, social: null, cognitive: null, daily: null };
  document.querySelectorAll('.stars').forEach(st => st.querySelectorAll('.star').forEach(s => { s.classList.remove('on'); s.setAttribute('aria-checked', 'false'); }));
  document.getElementById('df-notes').value = '';
  msg.style.color = 'var(--green)';
  msg.textContent = '✓ Entry saved';
  renderHistory();
  setTimeout(() => { msg.textContent = ''; }, 3000);
});

document.getElementById('filter-student').addEventListener('change', renderHistory);

function renderHistory() {
  const filter = document.getElementById('filter-student').value;
  const list = DB.entries
    .filter(e => !filter || e.studentId === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .slice(0, 40);
  document.getElementById('history-list').innerHTML = list.length ? list.map(e => {
    const st = studentById(e.studentId);
    return `<li>
      <div class="hist-head"><span class="hist-name">${esc(st ? st.name : '?')}</span>
        <span class="hist-date">${fmtDate(e.date)} · overall ${(overall(e.scores) || 0).toFixed(1)}</span></div>
      <div class="hist-scores">${SKILLS.map(sk => `<span>${sk.icon} ${sk.label}: <strong>${e.scores[sk.key] ?? '—'}</strong></span>`).join('')}</div>
      ${e.notes ? `<div class="hist-notes">${esc(e.notes)}</div>` : ''}
      <button class="hist-del" data-del="${e.id}" aria-label="Delete entry for ${esc(st ? st.name : '')} on ${e.date}">Delete entry</button>
    </li>`;
  }).join('') : '<li class="recent-empty">No entries found.</li>';

  document.querySelectorAll('.hist-del').forEach(b =>
    b.addEventListener('click', () => {
      DB.entries = DB.entries.filter(e => e.id !== b.dataset.del);
      save(DB);
      renderHistory();
    }));
}

/* ================= AI INSIGHT ENGINE =================
   Rule-based analyser: works offline, keeps all data local.
======================================================= */
function analyze(student, entries, rangeDays) {
  if (!entries.length) return null;
  const av = avgScores(entries);
  const o = overall(av);

  // compare first half vs second half of the period to detect trend
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const half = Math.floor(sorted.length / 2);
  const older = sorted.slice(0, Math.max(1, half));
  const newer = sorted.slice(half);
  const avOld = avgScores(older), avNew = avgScores(newer);
  const delta = {};
  SKILLS.forEach(sk => { delta[sk.key] = (avNew[sk.key] ?? 0) - (avOld[sk.key] ?? 0); });
  const overallDelta = (overall(avNew) ?? 0) - (overall(avOld) ?? 0);

  // strongest / focus skills
  const ranked = SKILLS.filter(sk => av[sk.key] != null).sort((a, b) => av[b.key] - av[a.key]);
  const strongest = ranked[0], focus = ranked[ranked.length - 1];

  // keyword scan of observations
  const notes = entries.filter(e => e.notes).map(e => e.notes.toLowerCase());
  const word = re => notes.some(n => re.test(n));
  const themes = [];
  if (word(/\bprompt|remind|support|help|cuing|hand-over-hand/)) themes.push('still benefits from adult prompting and support during activities');
  if (word(/\bpeer|friend|turn.?tak|group|play|share/)) themes.push('peer interaction and group activities are a recurring theme in your notes');
  if (word(/\btransition|change|unexpected|switch/)) themes.push('transitions and changes to routine appear to be a challenge');
  if (word(/\bindependen|by (him|her)self|on (his|her) own|without prompt/)) themes.push('there are positive signs of growing independence');
  if (word(/\bvisual|picture|pecs|schedule|first.?then|checklist/)) themes.push('visual supports (schedules, picture cards, checklists) are working well');
  if (word(/\btired|anxious|upset|refus|frustrat|meltdown|cry|worr/)) themes.push('some days were affected by tiredness, anxiety or difficulty regulating emotions');
  if (word(/\bmusic|sensory|movement|break/)) themes.push('sensory or movement breaks seem to help re-engagement');

  return { av, o, delta, overallDelta, strongest, focus, themes, ranked, notesCount: notes.length, entries, sorted };
}

function generateInsightText(student, entries, rangeDays) {
  if (!entries.length) return null;
  const A = analyze(student, entries, rangeDays);
  const { av, o, delta, overallDelta, strongest, focus, themes } = A;

  // goal-linked hints
  const goalHints = (student.goals || []).slice(0, 2).map(g => {
    const sk = SKILLS.find(s => s.key === g.area);
    const v = av[g.area];
    const state = v == null ? 'no recent data' : v >= 3.5 ? 'good progress is being made' : v >= 2.5 ? 'steady progress with support' : 'this remains a key focus area';
    return `${sk ? sk.icon : '🎯'} "${g.text}" — ${state}.`;
  });

  const rangeLabel = rangeDays === 'all' ? 'the whole record' : `the last ${rangeDays} days`;
  const banner = overallDelta >= 0.25 ? ['banner-green', '📈 Trending up — scores improved over this period.']
    : overallDelta <= -0.25 ? ['banner-amber', '📉 Trending down — scores dipped over this period. It may be worth looking at what changed (routine, health, environment).']
    : ['banner-blue', '➡️ Steady — performance has been broadly consistent over this period.'];

  const trendLine = SKILLS.map(sk => {
    const d = delta[sk.key];
    const arrow = d >= 0.3 ? '▲ improving' : d <= -0.3 ? '▼ dipping' : '• steady';
    return `<li>${sk.icon} <strong>${sk.label}</strong>: ${av[sk.key].toFixed(1)} avg — ${arrow} (${d >= 0 ? '+' : ''}${d.toFixed(1)} between the earlier and later half of the period)</li>`;
  }).join('');

  const recs = [];
  if (focus && av[focus.key] < 3) recs.push(`Continue targeted practice for <strong>${focus.label.toLowerCase()}</strong> — it is currently the lowest-scoring area (${av[focus.key].toFixed(1)}). Short, frequent sessions with preferred activities tend to work best.`);
  if (themes.some(t => t.includes('visual'))) recs.push('Keep using the visual supports noted in observations — they appear consistently in positive entries.');
  if (themes.some(t => t.includes('transitions'))) recs.push('Consider pre-warning strategies (timers, countdowns, first-then boards) before transitions, since several notes mention them as difficult.');
  if (themes.some(t => t.includes('prompting')) && overallDelta > 0) recs.push('Scores are improving while prompting is still frequent — try fading prompts gradually (e.g. verbal → gesture → visual) to build independence.');
  if (strongest && av[strongest.key] >= 3.5) recs.push(`Use <strong>${strongest.label.toLowerCase()}</strong> (${av[strongest.key].toFixed(1)}, the strongest area) as a strength and entry point — e.g. let the student lead activities that draw on it.`);
  if (themes.some(t => t.includes('regulat'))) recs.push('Watch for patterns around tiredness or anxiety in the notes; a consistent morning routine or sensory break schedule may help on harder days.');
  if (!recs.length) recs.push('Keep recording daily entries — a few more days of data will make trend analysis much more reliable.');

  return `
    <div class="card">
      <h2>🤖 AI Progress Insights — ${esc(student.name)}</h2>
      <p class="card-sub">${entries.length} entries · ${rangeLabel} · overall average <strong>${o.toFixed(1)} / 5</strong> ${pillFor(o)}</p>

      <div class="insight-banner ${banner[0]}"><span>${banner[1]}</span></div>

      <div class="insight-block">
        <h3>📋 Summary</h3>
        <p>Over ${rangeLabel}, ${esc(student.name)}'s overall average is <strong>${o.toFixed(1)} / 5</strong>.
        ${strongest ? `<strong>${strongest.label}</strong> is the strongest area at ${av[strongest.key].toFixed(1)}, while <strong>${focus.label}</strong> is the current focus at ${av[focus.key].toFixed(1)}.` : ''}
        ${themes.length ? ` Your observation notes suggest that ${themes.slice(0, 3).join('; and ')}.` : ' No significant themes were detected in the observation notes yet — adding short notes each day makes these insights much richer.'}
        </p>
      </div>

      <div class="insight-block">
        <h3>📊 Skill breakdown & trend</h3>
        <ul>${trendLine}</ul>
      </div>

      ${goalHints.length ? `<div class="insight-block"><h3>🎯 Progress toward learning goals</h3><ul>${goalHints.map(h => `<li>${h}</li>`).join('')}</ul></div>` : ''}

      <div class="insight-block">
        <h3>💡 Suggested next steps</h3>
        <ul>${recs.map(r => `<li>${r}</li>`).join('')}</ul>
      </div>

      <p class="insight-meta">🔒 Generated on-device from your own records — nothing was sent to the internet. AI summaries are a support tool for teacher reflection, not an assessment or diagnosis.</p>
    </div>`;
}

function generateInsight() {
  const sid = document.getElementById('ins-student').value;
  const range = document.getElementById('ins-range').value;
  const out = document.getElementById('insight-output');
  const student = studentById(sid);
  if (!student) {
    out.innerHTML = `<div class="card empty-state">No students yet — add one under <strong>Students</strong> first.</div>`;
    return;
  }
  const entries = entriesInDays(DB.entries.filter(e => e.studentId === sid), range);
  const html = generateInsightText(student, entries, range);
  out.innerHTML = html || `<div class="card empty-state"><span class="empty-ico">🤖</span>
    <p>No entries for <strong>${esc(student.name)}</strong> in this period yet. Record some daily progress first.</p></div>`;
}
document.getElementById('btn-generate-insight').addEventListener('click', generateInsight);

/* ================= REPORTS ================= */
function generateReport() {
  const sid = document.getElementById('rep-student').value;
  const range = document.getElementById('rep-range').value;
  const out = document.getElementById('report-output');
  const student = studentById(sid);
  if (!student) { out.innerHTML = '<div class="card empty-state">No students yet — add one under <strong>Students</strong> first.</div>'; return; }
  const entries = entriesInDays(DB.entries.filter(e => e.studentId === sid), range).sort((a, b) => a.date.localeCompare(b.date));
  if (!entries.length) {
    out.innerHTML = `<div class="card empty-state">No entries for <strong>${esc(student.name)}</strong> in this period.</div>`;
    return;
  }
  const av = avgScores(entries);
  const o = overall(av);
  const A = analyze(student, entries, range);

  // friendly note sentences for parents (plain language)
  const parentLine = SKILLS.map(sk => {
    const v = av[sk.key];
    if (v == null) return '';
    const phrase = v >= 4 ? 'working confidently and often independently'
      : v >= 3 ? 'making steady progress and managing most steps with light support'
      : v >= 2 ? 'developing this skill and doing well with regular adult support'
      : 'working on early steps of this skill with lots of encouragement';
    return `${sk.label}: ${phrase} (average ${v.toFixed(1)} of 5).`;
  }).filter(Boolean).join(' ');

  const bestNotes = entries.filter(e => e.notes).slice(-3);

  out.innerHTML = `
    <div class="report-doc" id="report-doc">
      <h2>Student Progress Report</h2>
      <p class="report-meta">Generated ${new Date().toLocaleDateString()} · covers ${range === 'all' ? 'all recorded data' : 'the last ' + range + ' days'} (${fmtDate(entries[0].date)} – ${fmtDate(entries[entries.length - 1].date)}) · ${entries.length} daily entries</p>

      <div class="report-section">
        <h3>Student</h3>
        <p><strong>${esc(student.name)}</strong>${student.age ? ` · Age ${student.age}` : ''}${student.group ? ` · Class: ${esc(student.group)}` : ''}</p>
      </div>

      <div class="report-section">
        <h3>Overall progress</h3>
        <p>Overall average <strong>${o.toFixed(1)} / 5</strong> ${pillFor(o)} across ${entries.length} recorded days.</p>
        <table class="report-skills">
          <tr><th>Skill area</th><th>Average</th><th>Indicator</th></tr>
          ${SKILLS.map(sk => `<tr><td>${sk.icon} ${sk.label}</td><td>${av[sk.key] == null ? '—' : av[sk.key].toFixed(1)} / 5</td><td>${av[sk.key] == null ? '—' : (av[sk.key] >= 3.5 ? 'Doing well' : av[sk.key] >= 2.5 ? 'Building skills' : 'Needs focus')}</td></tr>`).join('')}
        </table>
      </div>

      <div class="report-section">
        <h3>Summary</h3>
        <p>${esc(student.name)} ${o >= 3 ? 'has made good overall progress' : 'has been working steadily'} during this period. ${parentLine}</p>
        ${insight ? '' : ''}
      </div>

      ${A && A.themes.length ? `<div class="report-section"><h3>Key patterns observed</h3>
        <ul>${A.themes.slice(0, 3).map(t => `<li>${t.charAt(0).toUpperCase() + t.slice(1)}.</li>`).join('')}</ul></div>` : ''}

      <div class="report-section">
        <h3>Recent highlights from teacher observations</h3>
        <ul>${bestNotes.map(e => `<li>${fmtDate(e.date)} — ${esc(e.notes)}</li>`).join('') || '<li>No observation notes recorded in this period.</li>'}</ul>
      </div>

      ${(student.goals || []).length ? `<div class="report-section"><h3>Current learning goals</h3>
        <ul>${student.goals.map(g => `<li>${goalAreaIcon(g.area)} ${esc(g.text)}</li>`).join('')}</ul></div>` : ''}

      <div class="report-footer">
        <span>SEN Student Progress Tracker · generated by class teacher</span>
        <span>Sample/demo data — no personal information</span>
      </div>
    </div>
    <div class="report-actions">
      <button class="btn btn-primary" id="btn-print-report">🖨️ Print / Save as PDF</button>
    </div>`;

  document.getElementById('btn-print-report').addEventListener('click', () => window.print());
}
document.getElementById('btn-generate-report').addEventListener('click', generateReport);

/* ================= INIT ================= */
function refreshAllSelects() {
  fillStudentSelect(document.getElementById('ins-student'));
  fillStudentSelect(document.getElementById('rep-student'));
}
refreshAllSelects();
showView('dashboard');
