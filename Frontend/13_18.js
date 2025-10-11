// script.js
const questions=[

 
  
  {question:"Find the missing number: 7, 14, 28, 56, 112, ?", answer:"224", time:30},
 

 
  {
question: "In a village a farmer has 17 sheep,One day 9 of them die. How many of them are  left alive?",
options: ["8", "9", "17", "None"],
answer: "9",
time: 40
},

  {question:"Next number in series: 11,22,44,88,?", answer:"176", time:30},

  {question:"Rearrange 'TNEITNOC' to form a meaningful word", answer:"CONTENT", time:25},
 
  {question:"Find the missing number: 5,25,125, ?", answer:"625", time:30},

 
  
  {question:"Sum of odd numbers from 1 to 39", answer:"400", time:35},
  {
    question: "If all roses are flowers and some flowers fade quickly, is it true that some roses fade quickly?",
    options: ["Yes", "No", "Not necessarily", "Cannot say"],
    answer: "Not necessarily",
    time: 40
  },
 {
question: "A man looks at a painting in the museum and says, 'Brothers and sisters, I have none, but that man’s father is my father’s son.' Who is in the painting?",
options: ["His son", "His father", "His brother", "Himself"],
answer: "His son",
time: 40
},
 
  {
    question: "Find the next in pattern: 2, 4, 8, 16, 32, ?",
    options: ["48", "64", "34", "50"],
    answer: "64",
    time: 30
  },
  {
    question: "If Monday is the first day of the week, what day will be 17 days later?",
    options: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    answer: "Thursday",
    time: 15
  }
];

const qEl = document.getElementById('question');
const ansEl = document.getElementById('answer');
const timerEl = document.getElementById('timer');
const qNo = document.getElementById('qNo');
const progress = document.getElementById('progress');
const results = document.getElementById('results');
const showAnswersBtn = document.getElementById('showAnswersBtn');
const modal = document.getElementById('modal');
const allAnswers = document.getElementById('allAnswers');
const closeModal = document.getElementById('closeModal');
const nextBtn = document.getElementById('nextBtn');
const skipBtn = document.getElementById('skipBtn');
const restartBtn = document.getElementById('restartBtn');
const homeBtn = document.getElementById('homeBtn');

let current=0, score=0, timerInt, timeLeft, responses=[];

function startQuiz(){
  current=0; score=0; responses=[];
  results.style.display='none';
  ansEl.style.display='block';
  document.querySelector('.controls').style.display='flex';
  timerEl.style.display='inline-block';
  showAnswersBtn.style.display='none';
  document.querySelector('.footer-buttons').style.display='none';
  showQuestion();
}

function showQuestion(){
  if(current >= questions.length){ showResult(); return; }
  const q = questions[current];
  qEl.textContent = q.question;
  qNo.textContent = current+1;
  ansEl.value = '';
  timeLeft = q.time;
  progress.style.width = `${(current)/questions.length*100}%`;
  updateTimer();
  startTimer();

  // Display options if they exist
  if(q.options){
    ansEl.style.display='none';
    let optionHtml = '';
    q.options.forEach((opt, idx)=>{
      optionHtml += `<button class='option-btn' data-value='${opt}'>${opt}</button>`;
    });
    document.getElementById('optionsContainer')?.remove();
    const div = document.createElement('div');
    div.id = 'optionsContainer';
    div.innerHTML = optionHtml;
    qEl.insertAdjacentElement('afterend', div);

    document.querySelectorAll('.option-btn').forEach(btn=>{
      btn.onclick = ()=>checkAnswer(false, btn.dataset.value);
    });
  } else {
    ansEl.style.display='block';
    document.getElementById('optionsContainer')?.remove();
  }
}

function startTimer(){
  clearInterval(timerInt);
  timerInt = setInterval(()=>{
    timeLeft--;
    updateTimer();
    if(timeLeft <= 0){ clearInterval(timerInt); checkAnswer(true); }
  },1000);
}

function updateTimer(){ timerEl.textContent = timeLeft+'s'; }

function checkAnswer(auto=false, option=null){
  const q = questions[current];
  const userAns = option || ansEl.value.trim();
  responses.push({question: q.question, user: userAns || '<em>Skipped</em>', correct: q.answer, isCorrect: !auto && userAns.toLowerCase() === q.answer.toLowerCase()});
  if(!auto && userAns.toLowerCase() === q.answer.toLowerCase()) score++;
  current++;
  clearInterval(timerInt);
  showQuestion();
}

function showResult(){
  qEl.textContent='Quiz Completed!';
  ansEl.style.display='none';
  document.querySelector('.controls').style.display='none';
  timerEl.style.display='none';
  progress.style.width='100%';
  results.style.display='block';
  results.innerHTML=`<div class='row'><span class='Total_Score'>Total Score:</span><span class='tag ${score>7?'good':'bad'}'>${score}/10</span></div>`;
  showAnswersBtn.style.display='inline-block';
  document.querySelector('.footer-buttons').style.display='block';
}

showAnswersBtn.onclick = ()=>{
  allAnswers.innerHTML='';
  responses.forEach(r=>{
    const div=document.createElement('div');
    div.className='answer-row '+(r.isCorrect?'correct':'wrong');
    div.innerHTML=`<span><strong>Q:</strong> ${r.question}</span><span><strong>Your:</strong> ${r.user}</span><span><strong>Correct:</strong> ${r.correct}</span>`;
    allAnswers.appendChild(div);
  });
  modal.style.display='flex';
}
closeModal.onclick = ()=>{ modal.style.display='none'; }
nextBtn.onclick = ()=>checkAnswer();
skipBtn.onclick = ()=>checkAnswer(true);
restartBtn.onclick = ()=>startQuiz();
homeBtn.onclick = ()=>window.location.href='../index.html';

startQuiz();
