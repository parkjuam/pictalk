import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Play, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

type Item = {
  id: string;
  name: string;
  emojiUrl: string;
  customUrl?: string;
  audioUrl?: string;
};

const ALL_ITEMS: Item[] = [
  { id: '1', name: '과자', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f36a/512.webp', customUrl: '/1.png', audioUrl: '/1.mp3' },
  { id: '2', name: '마이쮸', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f36c/512.webp', customUrl: '/2.png', audioUrl: '/2.mp3' },
  { id: '3', name: '물', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a7/512.webp', customUrl: '/3.png', audioUrl: '/3.mp3' },
  { id: '4', name: '급식', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f371/512.webp', customUrl: '/4.png', audioUrl: '/4.mp3' },
  { id: '5', name: '베이글', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f96f/512.webp', customUrl: '/5.png', audioUrl: '/5.mp3' },
  { id: '6', name: '아이스크림', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f366/512.webp', customUrl: '/6.png', audioUrl: '/6.mp3' },
  { id: '7', name: '요거트', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f368/512.webp', customUrl: '/7.png', audioUrl: '/7.mp3' },
  { id: '8', name: '우유', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f95b/512.webp', customUrl: '/8.png', audioUrl: '/8.mp3' },
  { id: '9', name: '음료수', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f964/512.webp', customUrl: '/9.png', audioUrl: '/9.mp3' },
  { id: '10', name: '젤리', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9f8/512.webp', customUrl: '/10.png', audioUrl: '/10.mp3' },
  { id: '11', name: '초콜릿', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f36b/512.webp', customUrl: '/11.png', audioUrl: '/11.mp3' },
  { id: '12', name: '치즈', emojiUrl: 'https://fonts.gstatic.com/s/e/notoemoji/latest/1f9c0/512.webp', customUrl: '/12.png', audioUrl: '/12.mp3' },
];

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generateQuiz = () => {
  const shuffledItems = shuffle(ALL_ITEMS);
  const targets = shuffledItems.slice(0, 10);
  
  return targets.map(target => {
    const others = shuffle(ALL_ITEMS.filter(item => item.id !== target.id)).slice(0, 2);
    const options = shuffle([target, ...others]);
    return { target, options };
  });
};

const playDingDong = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const playTone = (freq: number, startTime: number, duration: number, type: OscillatorType = 'sine') => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playTone(880, ctx.currentTime, 0.4); 
  playTone(659.25, ctx.currentTime + 0.3, 0.6); 
};

const playWrongSound = () => {
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();

  const playTone = (freq: number, startTime: number, duration: number) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + duration / 4);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  playTone(200, ctx.currentTime, 0.3); 
  playTone(150, ctx.currentTime + 0.2, 0.4);
};

const speakBrowserTTS = (text: string) => {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.9; 
  const voices = window.speechSynthesis.getVoices();
  const koVoice = voices.find((v) => v.lang.includes('ko'));
  if (koVoice) {
    utterance.voice = koVoice;
  }
  window.speechSynthesis.speak(utterance);
};

// mp3 파일을 재생하는 함수
const speakItem = (item: Item) => {
  if (item.audioUrl) {
    const audio = new Audio(item.audioUrl);
    audio.play().catch(e => {
      console.warn("Failed to play audio file, falling back to TTS:", e);
      speakBrowserTTS(item.name); // 파일 재생 실패 시 원래 로봇 목소리로 대체
    });
  } else {
    speakBrowserTTS(item.name);
  }
};

type GameState = 'START' | 'PLAYING' | 'END';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'O' | 'X' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  useEffect(() => {
    if (gameState === 'PLAYING' && questions[currentIndex]) {
      const timer = setTimeout(() => {
        speakItem(questions[currentIndex].target);
      }, 500); // 0.5초 뒤에 바로 읽어주기 (다음 문제 넘어간 직후)
      return () => clearTimeout(timer);
    }
  }, [currentIndex, gameState, questions]);

  useEffect(() => {
    if (gameState === 'END') {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        speakBrowserTTS(`10문제 중 ${score}문제를 맞췄어요!`);
      }, 500);
    }
  }, [gameState, score]);

  const startGame = () => {
    setQuestions(generateQuiz());
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setSelectedOption(null);
    setGameState('PLAYING');
  };

  const handleOptionClick = (option: Item) => {
    if (feedback !== null) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = option.id === currentQuestion.target.id;
    
    setSelectedOption(option.id);

    if (isCorrect) {
      setFeedback('O');
      setScore(s => s + 1);
      playDingDong();
    } else {
      setFeedback('X');
      playWrongSound();
    }

    setTimeout(() => {
      setFeedback(null);
      setSelectedOption(null);
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(i => i + 1);
      } else {
        setGameState('END');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFF9E6] flex flex-col items-center justify-center font-sans overflow-x-hidden overflow-y-auto text-[#333]">
      {gameState === 'START' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center font-bold px-4 w-full max-w-2xl py-12"
        >
          <div className="bg-white p-10 md:p-14 rounded-[40px] shadow-2xl text-center w-full flex flex-col items-center gap-6 border-4 border-transparent">
             <div className="text-xl md:text-2xl text-[#FFD93D] font-black tracking-widest bg-[#FFD93D]/10 px-6 py-2 rounded-full border-2 border-[#FFD93D]">
                경은 그림말
             </div>
             <h1 className="text-5xl md:text-7xl font-black tracking-tight flex flex-col gap-4">
               <span className="text-[#333]">그림말 듣고</span>
               <span className="text-[#FF6B6B]">그림 찾기</span>
             </h1>
          </div>

          <button onClick={startGame} className="mt-12 group flex items-center gap-4 bg-[#4D96FF] text-white border-4 border-white font-black text-3xl md:text-4xl px-12 py-5 rounded-full shadow-xl hover:scale-105 transition-transform">
             <Play size={40} className="fill-white" strokeWidth={0} />
             시작하기
          </button>
        </motion.div>
      )}

      {gameState === 'PLAYING' && questions[currentIndex] && (
        <div className="w-full min-h-screen flex flex-col py-8 px-4 max-w-5xl mx-auto justify-center gap-8">
          {/* Header section translated to Vibrant Palette */}
          <div className="w-full flex justify-between items-center mb-2 shrink-0">
            <div className="flex items-center gap-4">
              <div className="bg-[#FF6B6B] text-white px-5 sm:px-6 py-2 rounded-full font-black text-lg sm:text-lg shadow-lg border-4 border-white whitespace-nowrap">
                QUIZ {String(currentIndex + 1).padStart(2, '0')} / 10
              </div>
              <div className="hidden sm:block text-[#FF6B6B] font-bold text-lg whitespace-nowrap">경은의 그림말 교실</div>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 sm:px-6 py-2 rounded-full shadow-md border-2 border-[#FFD93D]">
              <span className="text-[#FFD93D] text-xl sm:text-2xl">⭐</span>
              <span className="font-black text-xl sm:text-xl whitespace-nowrap text-[#333]">{score * 100} pts</span>
            </div>
          </div>

          <div className="flex-1 w-full flex flex-col items-center justify-center gap-10">
            {/* Speaker Icon / Voice Prompt */}
            <div className="relative flex flex-col items-center mt-4">
              <button 
                onClick={() => speakItem(questions[currentIndex].target)}
                className="w-24 h-24 sm:w-32 sm:h-32 bg-[#4D96FF] rounded-full flex items-center justify-center shadow-xl border-8 border-white cursor-pointer hover:scale-105 transition-transform z-10"
                aria-label="단어 다시 듣기"
              >
                <Volume2 size={48} className="text-white fill-white" />
              </button>
              <motion.div 
                 key={questions[currentIndex].target.id}
                 initial={{ scale: 0.8, opacity: 0, y: -20 }}
                 animate={{ scale: 1, opacity: 1, y: 0 }}
                 className="mt-6 bg-white px-8 py-4 rounded-2xl shadow-lg relative min-w-[200px] text-center"
              >
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rotate-45"></div>
                <p className="text-2xl sm:text-3xl font-black text-[#4D96FF]">"{questions[currentIndex].target.name}"</p>
              </motion.div>
            </div>

            {/* Image Options */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 w-full max-w-4xl mx-auto px-2">
              {questions[currentIndex].options.map((option: Item, i: number) => {
                 let borderClass = "border-transparent hover:border-[#6BCB77]";
                 let isCorrect = option.id === questions[currentIndex].target.id;
                 
                 if (feedback !== null) {
                    if (isCorrect) borderClass = "border-[#6BCB77]";
                    else if (selectedOption === option.id) borderClass = "border-[#FF6B6B]";
                    else borderClass = "border-transparent opacity-50";
                 }

                 return (
                   <motion.div
                     key={`${currentIndex}-${option.id}`}
                     initial={{ opacity: 0, scale: 0.9 }}
                     animate={{ opacity: 1, scale: 1, transition: { delay: i * 0.1 } }}
                     whileHover={feedback === null ? { scale: 1.05 } : {}}
                     whileTap={feedback === null ? { scale: 0.95 } : {}}
                     onClick={() => handleOptionClick(option)}
                     className={`relative bg-white p-6 rounded-[40px] shadow-2xl border-4 ${borderClass} cursor-pointer transition-all flex flex-col items-center select-none`}
                   >
                     <div className={`w-full aspect-square ${feedback === 'O' && selectedOption === option.id ? 'bg-[#EAF9EE]' : feedback === 'X' && selectedOption === option.id ? 'bg-[#FDF0F0]' : 'bg-[#E6F4F1]'} rounded-[30px] mb-4 flex items-center justify-center p-6 transition-colors`}>
                        <img 
                          src={option.customUrl || option.emojiUrl} 
                          alt={option.name} 
                          className="w-full h-full object-contain drop-shadow-xl" 
                          draggable={false} 
                          onError={(e) => {
                            if (e.currentTarget.src !== option.emojiUrl) {
                              e.currentTarget.src = option.emojiUrl;
                            }
                          }}
                          onDragStart={(e) => e.preventDefault()} 
                        />
                     </div>
                     <span className="text-xl sm:text-2xl font-bold">{i + 1}번 보기</span>

                     {/* Overlay Feedback inside the card */}
                     <AnimatePresence>
                       {feedback !== null && selectedOption === option.id && (
                         <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }} 
                           exit={{ opacity: 0 }}
                           className={`absolute inset-0 rounded-[35px] flex items-center justify-center z-20 pointer-events-none ${feedback === 'O' ? 'bg-[#6BCB77]/10' : 'bg-[#FF6B6B]/10'}`}
                         >
                           {feedback === 'O' ? (
                             <>
                              <motion.div 
                                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.8, 1] }} 
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="w-32 h-32 sm:w-48 sm:h-48 border-[20px] sm:border-[24px] border-[#6BCB77] rounded-full"
                              />
                              <div className="absolute -top-6 bg-[#6BCB77] text-white px-6 py-2 rounded-full font-black text-xl sm:text-2xl shadow-lg whitespace-nowrap animate-bounce">
                                정답! 띵동! 👏
                              </div>
                             </>
                           ) : (
                             <>
                              <svg viewBox="0 0 100 100" className="w-32 h-32 sm:w-48 sm:h-48 drop-shadow-md">
                                <line x1="25" y1="25" x2="75" y2="75" stroke="#FF6B6B" strokeWidth="16" strokeLinecap="round" />
                                <line x1="75" y1="25" x2="25" y2="75" stroke="#FF6B6B" strokeWidth="16" strokeLinecap="round" />
                              </svg>
                              <div className="absolute -top-6 bg-[#FF6B6B] text-white px-6 py-2 rounded-full font-black text-xl sm:text-2xl shadow-lg whitespace-nowrap">
                                앗, 다시! 🥲
                              </div>
                             </>
                           )}
                         </motion.div>
                       )}
                       
                       {/* Indicator for the correct answer if the user clicked the wrong one */}
                       {feedback !== null && selectedOption !== option.id && isCorrect && feedback === 'X' && (
                         <motion.div 
                           initial={{ opacity: 0 }} 
                           animate={{ opacity: 1 }}
                           className="absolute inset-0 rounded-[35px] flex flex-col items-center justify-center z-20 bg-[#6BCB77]/10 border-4 border-dashed border-[#6BCB77] pointer-events-none"
                         >
                           <motion.div 
                             animate={{ scale: [1, 1.1, 1] }} 
                             transition={{ repeat: Infinity, duration: 1 }}
                             className="w-32 h-32 sm:w-48 sm:h-48 border-[20px] sm:border-[24px] border-[#6BCB77] rounded-full opacity-60"
                           />
                           <div className="absolute -top-6 bg-[#6BCB77] text-white px-6 py-2 rounded-full font-black text-lg sm:text-xl shadow-md whitespace-nowrap animate-bounce">
                             이게 정답! ⭐
                           </div>
                         </motion.div>
                       )}
                     </AnimatePresence>
                   </motion.div>
                 );
              })}
            </div>
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-full max-w-3xl mx-auto mt-4 shrink-0 hidden sm:block">
            <div className="h-6 bg-white rounded-full overflow-hidden border-4 border-white shadow-inner relative">
              <div className="absolute inset-0 bg-[#EEE] rounded-full"></div>
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD93D] to-[#FF6B6B] rounded-full shadow-md"
                initial={{ width: `${(currentIndex / 10) * 100}%` }}
                animate={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <div className="flex justify-between mt-3 px-2">
              <span className="font-bold text-[#FF6B6B]">시작</span>
              <span className="font-bold text-[#FF6B6B]">결과보기</span>
            </div>
          </div>
        </div>
      )}

      {gameState === 'END' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center bg-white rounded-[40px] shadow-2xl p-10 md:p-20 m-4 text-center max-w-2xl w-full border-4 border-transparent my-12"
        >
          <div className="text-7xl mb-6 drop-shadow-lg">🎯</div>
          <h2 className="text-4xl md:text-5xl font-black text-[#FF6B6B] mb-8 tracking-tight">참 잘했어요!</h2>
          <div className="bg-[#FFF9E6] w-full rounded-3xl py-10 mb-10 border-4 border-[#FFD93D] shadow-inner relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#FFD93D] text-[#333] px-6 py-1 rounded-full font-black text-lg shadow-md border-2 border-white whitespace-nowrap">
               최종 결과
            </div>
            <p className="text-2xl md:text-3xl font-bold mt-2">
              총 <span className="text-[#333]">10문제</span> 중
            </p>
            <div className="mt-4 flex items-center justify-center">
              <span className="text-7xl md:text-8xl font-black text-[#4D96FF]">{score}</span>
              <span className="text-2xl md:text-3xl font-bold ml-2">문제 정답!</span>
            </div>
          </div>
          
          <button onClick={startGame} className="group flex items-center justify-center gap-3 bg-[#FFD93D] text-[#333] border-4 border-white font-black text-2xl md:text-3xl px-12 py-5 rounded-full shadow-xl hover:scale-105 transition-transform">
             <RotateCcw strokeWidth={4} size={32} className="group-hover:-rotate-90 transition-transform duration-300" />
             다시 하기
          </button>
        </motion.div>
      )}
    </div>
  );
}
