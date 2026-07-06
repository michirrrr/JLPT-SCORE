const totals = {
  N1: {lang: 44, read: 22, listen: 30},
  N2: {lang: 51, read: 20, listen: 30}
};

const container = document.getElementById('questions-container');
const calcBtn = document.getElementById('calc');
const resetBtn = document.getElementById('reset');
let currentLevel = 'N2';

const categories = [
  {key: 'lang', label: '语言知识'},
  {key: 'read', label: '阅读'},
  {key: 'listen', label: '听力'}
];

function clamp(value, min, max) {
  return Math.min(Math.max(Number(value) || 0, min), max);
}

function render(level) {
  container.innerHTML = '';
  categories.forEach(item => {
    const total = totals[level][item.key];
    const card = document.createElement('section');
    card.className = 'input-card';
    card.dataset.category = item.key;

    const head = document.createElement('div');
    head.className = 'input-head';
    const titleBlock = document.createElement('div');
    const title = document.createElement('p');
    title.className = 'input-title';
    title.innerText = item.label;
    const subtitle = document.createElement('p');
    subtitle.className = 'input-total';
    subtitle.innerText = `总计 ${total} 题`;
    titleBlock.appendChild(title);
    titleBlock.appendChild(subtitle);

    const control = document.createElement('div');
    control.className = 'input-control';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = total;
    input.value = '0';
    input.dataset.key = item.key;
    input.addEventListener('input', onInputChange);
    const suffix = document.createElement('span');
    suffix.innerText = `/ ${total}`;
    control.appendChild(input);
    control.appendChild(suffix);

    head.appendChild(titleBlock);
    head.appendChild(control);

    const progressGroup = document.createElement('div');
    progressGroup.className = 'progress-group';
    const progressLabel = document.createElement('div');
    progressLabel.className = 'progress-label';
    const labelText = document.createElement('span');
    labelText.innerText = '正确率';
    const labelPercent = document.createElement('span');
    labelPercent.id = `progress-${item.key}`;
    labelPercent.innerText = '0%';
    progressLabel.appendChild(labelText);
    progressLabel.appendChild(labelPercent);

    const track = document.createElement('div');
    track.className = 'progress-track';
    const fill = document.createElement('div');
    fill.className = 'progress-fill';
    fill.style.width = '0%';
    fill.dataset.key = item.key;
    track.appendChild(fill);
    progressGroup.appendChild(progressLabel);
    progressGroup.appendChild(track);

    card.appendChild(head);
    card.appendChild(progressGroup);
    container.appendChild(card);
  });
}

function onInputChange(e) {
  const input = e.target;
  const max = Number(input.max || 0);
  const value = clamp(input.value, 0, max);
  if (String(value) !== input.value) {
    input.value = value;
  }
  updateProgress(input.dataset.key, value, max);
}

function updateProgress(key, value, total) {
  const percent = total ? Math.round(value / total * 100) : 0;
  const fill = document.querySelector(`.progress-fill[data-key="${key}"]`);
  const label = document.getElementById(`progress-${key}`);
  if (fill) fill.style.width = `${percent}%`;
  if (label) label.innerText = `${percent}%`;
}

function getAnswers() {
  const values = {};
  container.querySelectorAll('input[type="number"]').forEach(input => {
    const key = input.dataset.key;
    const max = Number(input.max || 0);
    values[key] = clamp(input.value, 0, max);
  });
  return values;
}

function calcOfficial(values) {
  const langScore = Math.round(values.lang / totals[currentLevel].lang * 60);
  const readScore = Math.round(values.read / totals[currentLevel].read * 60);
  const listenScore = Math.round(values.listen / totals[currentLevel].listen * 60);
  return {
    langScore,
    readScore,
    listenScore,
    total: langScore + readScore + listenScore
  };
}

function calcQiyang(values) {
  const langScore = Math.round(Math.min(60, values.lang * 1.36));
  const readScore = Math.round(Math.min(60, values.read * 2.7));
  const listenScore = Math.round(Math.min(60, values.listen * 1.6));
  return {
    langScore,
    readScore,
    listenScore,
    total: langScore + readScore + listenScore
  };
}

function evaluatePass(official) {
  const thresholds = {N1: 100, N2: 90};
  const minScore = 19;
  return official.total >= thresholds[currentLevel]
    && official.langScore >= minScore
    && official.readScore >= minScore
    && official.listenScore >= minScore;
}

function probabilityPercent(official) {
  const thresholds = {N1: 100, N2: 90};
  const percent = Math.round(Math.min(100, official.total / thresholds[currentLevel] * 100));
  return `${percent}%`;
}

function passText(official) {
  return evaluatePass(official)
    ? '当前分数接近合格线，保持节奏即可。'
    : '建议加强薄弱环节，提高稳定性。';
}

function teacherComment(official) {
  if (evaluatePass(official)) {
    return '当前状态已具备合格潜力，继续复习重点题型即可。';
  }
  const ratio = official.total / (currentLevel === 'N1' ? 100 : 90);
  if (ratio >= 0.9) return '非常接近合格标准，建议继续冲刺语言知识与阅读。';
  if (ratio >= 0.8) return '整体表现良好，需提高听力与阅读稳定性。';
  return '建议查漏补缺，夯实基础后再进行系统练习。';
}

function showResults() {
  const values = getAnswers();
  const official = calcOfficial(values);
  const qiyang = calcQiyang(values);

  document.getElementById('official-score').innerText = `${official.total} 分`;
  document.getElementById('qiyang-score').innerText = `${qiyang.total} 分`;
  document.getElementById('ring-score').innerText = `${official.total}`;

  document.getElementById('official-lang').innerText = `${official.langScore} 分`;
  document.getElementById('official-read').innerText = `${official.readScore} 分`;
  document.getElementById('official-listen').innerText = `${official.listenScore} 分`;
  document.getElementById('qiyang-lang').innerText = `启阳 ${qiyang.langScore} 分`;
  document.getElementById('qiyang-read').innerText = `启阳 ${qiyang.readScore} 分`;
  document.getElementById('qiyang-listen').innerText = `启阳 ${qiyang.listenScore} 分`;

  const percentText = probabilityPercent(official);
  document.getElementById('probability-percent').innerText = percentText;
  const progressFill = document.getElementById('probability-bar');
  progressFill.style.width = percentText;

  document.getElementById('pass-status').innerText = evaluatePass(official)
    ? '可能合格（仅供参考）'
    : '可能不合格（仅供参考）';
  document.getElementById('teacher-comment').innerText = teacherComment(official);
}

function resetAll() {
  container.querySelectorAll('input[type="number"]').forEach(input => input.value = '0');
  container.querySelectorAll('.progress-fill').forEach(fill => fill.style.width = '0%');
  document.getElementById('progress-lang').innerText = '0%';
  document.getElementById('progress-read').innerText = '0%';
  document.getElementById('progress-listen').innerText = '0%';

  document.getElementById('official-score').innerText = '—';
  document.getElementById('qiyang-score').innerText = '—';
  document.getElementById('ring-score').innerText = '—';
  document.getElementById('official-lang').innerText = '—';
  document.getElementById('official-read').innerText = '—';
  document.getElementById('official-listen').innerText = '—';
  document.getElementById('qiyang-lang').innerText = '—';
  document.getElementById('qiyang-read').innerText = '—';
  document.getElementById('qiyang-listen').innerText = '—';
  document.getElementById('probability-percent').innerText = '—';
  document.getElementById('probability-bar').style.width = '0%';
  document.getElementById('pass-status').innerText = '—';
  document.getElementById('teacher-comment').innerText = '—';
}

function initLevelSwitch() {
  document.querySelectorAll('input[name="level"]').forEach(radio => {
    radio.addEventListener('change', e => {
      currentLevel = e.target.value;
      render(currentLevel);
      resetAll();
    });
  });
}

calcBtn.addEventListener('click', showResults);
resetBtn.addEventListener('click', resetAll);

initLevelSwitch();
render(currentLevel);
