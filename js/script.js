const mainBtn = document.getElementById('mainBtn');
const playBtn = document.getElementById('playBtn');
const inputBox = document.getElementById('inputBox');
const userInput = document.getElementById('user-input');
const stopBtn = document.getElementById('stopBtn');
const roundBox = document.getElementById('roundBox');
const resumeBtn = document.getElementById('resumeBtn')

const fastest = document.getElementById('fastest-time');
const slowest = document.getElementById('slowest-time');
const average = document.getElementById('average-time');

const best = document.getElementById('best-time');

const timer = document.getElementById('timer');

const classContainer = ['btn-active-1', 'btn-active-2', 'btn-active-3', 'btn-active-4'];

let rounds = 0;
let passedRounds = 0;
let worstTime = 0;
let bestTime = Infinity;
let averagetime = 0;
let bestAveragetime = Infinity;
let paused = false;

mainBtn.addEventListener('click', () => {
    const inputValue = userInput.value;
    if (!isNaN(inputValue) && inputValue > 0) {
        rounds = parseInt(inputValue);
        gameStart(rounds);
    } else {
        alert('Please enter a valid number greater than 0.');
    }
    userInput.value = '';
});


stopBtn.addEventListener('click', () => {
    paused = true;
    timer.textContent = "00:000";
    playBtn.classList.add('hidden');
    resumeBtn.classList.remove('hidden');
    stopBtn.classList.add('hidden');
});

resumeBtn.addEventListener('click', () => {
    paused = false;
    playBtn.classList.remove('hidden');
    resumeBtn.classList.add('hidden');
    stopBtn.classList.remove('hidden');
});

function waitUntilResumed() {
    return new Promise(resolve => {
        const interval = setInterval(() => {
            if (!paused) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

async function gameStart(rounds) {
    inputBox.classList.add('hidden');
    roundBox.classList.remove('hidden');
    stopBtn.classList.remove('hidden');

    mainBtn.classList.add('hidden');
    playBtn.classList.remove('hidden');

    fastest.textContent = "00.000s"
    slowest.textContent = "00.000s"
    average.textContent = "00.000s"
    timer.textContent = "00:000";

    passedRounds = 0;
    worstTime = 0;
    bestTime = Infinity;
    averagetime = 0;
    
    let i = 0;
    while (i < rounds) {
        roundBox.querySelector('#rounds-left').textContent = rounds - i;
        console.log(`Round ${i + 1} goes`);

        const result = await handleRound();

        if (result === 1) {
            console.log(`Round ${i + 1} finished`);
            i++;
        } else {
            console.log(`Paused, waiting for resume...`);
            await waitUntilResumed();
        }
    }

    if (averagetime < bestAveragetime) {
        bestAveragetime = averagetime;
        best.textContent = average.textContent;
    }


    playBtn.classList.add('hidden');
    mainBtn.classList.remove('hidden');

    inputBox.classList.remove('hidden');
    stopBtn.classList.add('hidden');
    roundBox.classList.add('hidden');  
}

function handleRound() {
    return new Promise(resolve => {
        if (paused) { 
            resolve(0);
            return;
        }
        playBtn.classList.add('btn-waiting');
        playBtn.textContent = "Wait"
        let randomTime = Math.floor(Math.random() * 2000) + 2000;
        let startTime, timerInterval, totalTime;

        setTimeout(() => {
            console.log(`timeout ended`);
            if (paused) { 
                resolve(0); 
                return;
            }
            
            playBtn.classList.remove('btn-waiting');
            let rand = Math.floor(Math.random() * classContainer.length);
            playBtn.classList.add(classContainer[rand]);
            playBtn.textContent = "Click!"
            stopBtn.classList.add('hidden');

            startTime = Date.now();
            timerInterval = setInterval(() => {
                totalTime = updateTimer(startTime);
            }, 1);

            playBtn.addEventListener('click', function onClick() {
                let seconds = totalTime / 1000;
                let formattedSeconds = (seconds < 10 ? '0' : '') + seconds.toFixed(3);

                if (totalTime < bestTime) {
                    bestTime = totalTime;
                    if (totalTime > 59000) {
                        fastest.textContent = "59+ " + 's';
                    } else {
                        fastest.textContent = formattedSeconds + 's';
                    } 
                }

                if (totalTime > worstTime) {
                    worstTime = totalTime;
                    if (totalTime > 59000) {
                        slowest.textContent = "59+ " + 's';
                    } else {
                        slowest.textContent = formattedSeconds + 's';
                    } 
                }
                
                averagetime = ((averagetime*passedRounds)+totalTime)/(passedRounds+1);
                if (averagetime > 59000) {
                    average.textContent = "59+ " + 's';
                } else {
                    average.textContent = ((averagetime/1000) < 10 ? '0' : '') + (averagetime/1000).toFixed(3) + 's';
                } 
                passedRounds += 1;


                clearInterval(timerInterval);
                playBtn.classList.remove(classContainer[rand]);
                resolve(1);
            }, { once: true });   
        }, randomTime);
        stopBtn.classList.remove('hidden');
    });
}

function updateTimer(startTime) {
    const elapsed = Date.now() - startTime;
    const seconds = Math.floor((elapsed % 60000) / 1000);
    const milliseconds = elapsed % 1000;

    timer.textContent =
                    `${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(3, '0')}`;

    return elapsed;
}