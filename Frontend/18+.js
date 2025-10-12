// script.js
const questions=[

 
  
  {question: "If you pass the second person in a race, what position are you in?",
    options: ["First", "Second", "Third", "Cannot say"],
answer:"Second",time:20},
 

 
  {
question: "If 3 cats can catch 3 mice in 3 minutes, how many cats are needed to catch 100 mice in 100 minutes?",
options: ["3", "9", "100", "6"], 
answer:"3",time:20
},

  {question: "If two’s company and three’s a crowd, what are four and five?",
    options: ["Nine", "A party", "Crowd", "Cannot say"],
answer:"Nine",time:20},

  {question: "Which one completes the series: O, T, T, F, F, S, S, ?",
    options: ["E", "O", "N", "S"],
answer:"E",time:200},

  {question: "A plane crashes on the border of two countries. Where do they bury the survivors?",options: ["In the country where the crash occurred", "In their home country", "Nowhere", "Cannot say"],
answer:"Nowhere",time:20},

  {question: "Before Mount Everest was discovered, what was the highest mountain on Earth?",
    options: ["K2", "Mount Everest", "Kangchenjunga", "Lhotse"],
answer:"Mount Everest",time:20},
  {
   question: "I speak without a mouth and hear without ears. I have nobody, but I come alive with wind. What am I?",
    options: ["Echo", "Shadow", "Whistle", "Cloud"],
answer:"Echo",time:30
  },
 {
question: "A man builds a house with all four sides facing south. A bear walks past the house. What color is the bear?",
    options: ["White", "Brown", "Black", "Cannot say"],
    answer: "White",
    time:20
},
 
  {
    question: "Find next number: 2, 3, 5, 9, 17, ?",
    options: ["31", "33", "35", "29"],
    answer: "33",
    time: 40
  },
  {
    question: "A rooster lays an egg on a flat roof. Which way does it roll?",
    options: ["Left", "Right", "Neither", "Cannot say"],
    answer: "Neither",
    time: 35
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
