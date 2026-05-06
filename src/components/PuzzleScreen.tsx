import { useState, useEffect, useRef, useCallback } from 'react';

type Game = 'menu'|'wordScramble'|'memoryMatch'|'sequence'|'sudoku'|'tictactoe'|'mathQuiz'|'colorMatch'|'reactionTime'|'slidingPuzzle'|'guessNumber'|'hundredDay';

// ── Sudoku data ──────────────────────────────────────────────────────────────
const SUDOKU_PUZZLES = [
  { puzzle:[[5,3,null,null,7,null,null,null,null],[6,null,null,1,9,5,null,null,null],[null,9,8,null,null,null,null,6,null],[8,null,null,null,6,null,null,null,3],[4,null,null,8,null,3,null,null,1],[7,null,null,null,2,null,null,null,6],[null,6,null,null,null,null,2,8,null],[null,null,null,4,1,9,null,null,5],[null,null,null,null,8,null,null,7,9]],
    solution:[[5,3,4,6,7,8,9,1,2],[6,7,2,1,9,5,3,4,8],[1,9,8,3,4,2,5,6,7],[8,5,9,7,6,1,4,2,3],[4,2,6,8,5,3,7,9,1],[7,1,3,9,2,4,8,5,6],[9,6,1,5,3,7,2,8,4],[2,8,7,4,1,9,6,3,5],[3,4,5,2,8,6,1,7,9]] },
  { puzzle:[[null,2,null,6,null,8,null,null,null],[5,8,null,null,null,9,7,null,null],[null,null,null,null,4,null,null,null,null],[3,7,null,null,null,null,5,null,null],[6,null,null,null,null,null,null,null,4],[null,null,8,null,null,null,null,1,3],[null,null,null,null,2,null,null,null,null],[null,null,9,8,null,null,null,3,6],[null,null,null,3,null,6,null,9,null]],
    solution:[[1,2,3,6,7,8,9,4,5],[5,8,4,2,3,9,7,6,1],[9,6,7,1,4,5,3,2,8],[3,7,2,4,6,1,5,8,9],[6,9,1,5,8,3,2,7,4],[4,5,8,7,9,2,6,1,3],[7,1,5,9,2,4,8,3,6],[2,4,9,8,5,7,1,3,6],[8,3,6,3,1,6,4,9,2]] },
];

// ── Word Scramble data ───────────────────────────────────────────────────────
const WORDS = [
  {word:'STRENGTH',clue:'The power to face challenges'},
  {word:'COURAGE',clue:'Bravery to keep going'},
  {word:'HEALING',clue:'Getting better over time'},
  {word:'FREEDOM',clue:'Life without addiction'},
  {word:'PROGRESS',clue:'Moving forward every day'},
  {word:'MINDFUL',clue:'Aware of the present moment'},
  {word:'BALANCE',clue:'Stability in life'},
  {word:'CLARITY',clue:'Clear thinking and purpose'},
  {word:'RECOVER',clue:'To come back from hardship'},
  {word:'PEACEFUL',clue:'A state of calm'},
];

function scramble(word: string): string {
  const arr = word.split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('') === word ? scramble(word) : arr.join('');
}

// ── Back Button ──────────────────────────────────────────────────────────────
const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-2 text-slate-500 hover:text-slate-800">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  </button>
);

const Header = ({ title, onBack }: { title: string; onBack: () => void }) => (
  <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0 bg-white">
    <BackBtn onClick={onBack} />
    <div className="text-center flex-grow"><h1 className="font-bold text-lg text-gray-800">{title}</h1></div>
    <div className="w-10" />
  </header>
);

// ══════════════════════════════════════════════════════════════
// WORD SCRAMBLE
// ══════════════════════════════════════════════════════════════
function WordScramble({ onBack }: { onBack: () => void }) {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * WORDS.length));
  const [scrambled] = useState(() => scramble(WORDS[idx].word));
  const [input, setInput] = useState('');
  const [result, setResult] = useState<'correct'|'wrong'|null>(null);
  const [wins, setWins] = useState(0);
  const [current, setCurrent] = useState({ word: WORDS[idx].word, clue: WORDS[idx].clue, sc: scramble(WORDS[idx].word) });

  function check() {
    if (input.trim().toUpperCase() === current.word) { setResult('correct'); setWins(w => w + 1); }
    else setResult('wrong');
  }
  function next() {
    const ni = Math.floor(Math.random() * WORDS.length);
    setCurrent({ word: WORDS[ni].word, clue: WORDS[ni].clue, sc: scramble(WORDS[ni].word) });
    setInput(''); setResult(null);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Word Unscramble" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center bg-white p-6 rounded-2xl shadow-sm w-full">
          <p className="text-gray-500 text-sm mb-2">Clue: <span className="font-medium text-gray-700">{current.clue}</span></p>
          <div className="text-4xl font-bold tracking-widest text-teal-600 my-4">{current.sc}</div>
          <p className="text-xs text-gray-400">{current.word.length} letters · Score: {wins}</p>
        </div>
        {result === 'correct' ? (
          <div className="text-center space-y-3">
            <div className="text-2xl">🎉 Correct!</div>
            <button onClick={next} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">Next Word</button>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {result === 'wrong' && <p className="text-center text-rose-500 font-medium">Not quite, try again!</p>}
            <input value={input} onChange={e => setInput(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && check()}
              className="w-full text-center text-xl p-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none uppercase font-mono"
              placeholder="Your answer" autoFocus />
            <button onClick={check} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold">Submit</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MEMORY MATCH
// ══════════════════════════════════════════════════════════════
const EMOJIS = ['🌟','💪','🌱','❤️','🎯','🏆','🌈','🦋'];
function MemoryMatch({ onBack }: { onBack: () => void }) {
  const makeBoard = () => [...EMOJIS, ...EMOJIS].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  const [cards, setCards] = useState(makeBoard);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  function flip(id: number) {
    if (selected.length === 2 || cards[id].flipped || cards[id].matched) return;
    const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c);
    const newSel = [...selected, id];
    setSelected(newSel);
    setCards(newCards);
    if (newSel.length === 2) {
      setMoves(m => m + 1);
      const [a, b] = newSel;
      if (newCards[a].emoji === newCards[b].emoji) {
        const matched = newCards.map(c => newSel.includes(c.id) ? { ...c, matched: true } : c);
        setCards(matched);
        setSelected([]);
        if (matched.every(c => c.matched)) setWon(true);
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => newSel.includes(c.id) ? { ...c, flipped: false } : c));
          setSelected([]);
        }, 800);
      }
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Memory Match" onBack={onBack} />
      <div className="flex-grow p-4 flex flex-col items-center justify-center">
        {won ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">🏆</div>
            <div className="text-2xl font-bold text-gray-800">You won in {moves} moves!</div>
            <button onClick={() => { setCards(makeBoard()); setMoves(0); setWon(false); setSelected([]); }}
              className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">Play Again</button>
          </div>
        ) : (
          <>
            <p className="text-gray-500 mb-4 text-sm">Moves: <span className="font-bold text-teal-600">{moves}</span></p>
            <div className="grid grid-cols-4 gap-2 w-full max-w-xs">
              {cards.map(c => (
                <button key={c.id} onClick={() => flip(c.id)}
                  className={`aspect-square rounded-xl text-2xl flex items-center justify-center transition-all duration-200 ${c.flipped || c.matched ? 'bg-teal-100 scale-95' : 'bg-teal-600 hover:bg-teal-700'} ${c.matched ? 'opacity-40' : ''}`}>
                  {(c.flipped || c.matched) ? c.emoji : ''}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SEQUENCE GAME (Pattern Match)
// ══════════════════════════════════════════════════════════════
const SEQ_COLORS = ['bg-rose-400','bg-blue-400','bg-yellow-400','bg-green-400'];
function SequenceGame({ onBack }: { onBack: () => void }) {
  const [seq, setSeq] = useState<number[]>([]);
  const [playerSeq, setPlayerSeq] = useState<number[]>([]);
  const [phase, setPhase] = useState<'start'|'showing'|'input'|'win'|'lose'>('start');
  const [active, setActive] = useState<number | null>(null);
  const [level, setLevel] = useState(1);

  const startLevel = useCallback((lvl: number) => {
    const s = Array.from({ length: lvl + 2 }, () => Math.floor(Math.random() * 4));
    setSeq(s); setPlayerSeq([]); setPhase('showing');
    let i = 0;
    const show = () => {
      if (i >= s.length) { setActive(null); setTimeout(() => setPhase('input'), 500); return; }
      setActive(s[i]); i++;
      setTimeout(() => { setActive(null); setTimeout(show, 400); }, 600);
    };
    setTimeout(show, 500);
  }, []);

  function pressBtn(id: number) {
    if (phase !== 'input') return;
    const next = [...playerSeq, id];
    setActive(id); setTimeout(() => setActive(null), 200);
    if (next[next.length - 1] !== seq[next.length - 1]) { setPhase('lose'); return; }
    if (next.length === seq.length) {
      setPhase('win'); setLevel(l => l + 1);
    } else {
      setPlayerSeq(next);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Pattern Match" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-700">Level {level}</p>
          <p className="text-sm text-gray-500">{phase === 'showing' ? 'Watch the sequence...' : phase === 'input' ? 'Repeat the sequence!' : phase === 'win' ? '✓ Correct!' : phase === 'lose' ? 'Wrong! Try again.' : 'Press Start to begin'}</p>
        </div>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
          {[0,1,2,3].map(id => (
            <button key={id} onClick={() => pressBtn(id)}
              className={`h-32 rounded-2xl transition-all duration-100 ${SEQ_COLORS[id]} ${active === id ? 'opacity-100 scale-95 shadow-lg' : 'opacity-60'} ${phase === 'input' ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`} />
          ))}
        </div>
        {(phase === 'start' || phase === 'win' || phase === 'lose') && (
          <button onClick={() => startLevel(phase === 'lose' ? 1 : level)} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">
            {phase === 'start' ? 'Start Game' : phase === 'win' ? 'Next Level' : 'Try Again'}
          </button>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SUDOKU
// ══════════════════════════════════════════════════════════════
function SudokuGame({ onBack }: { onBack: () => void }) {
  const [pIdx, setPIdx] = useState(0);
  const puzzle = SUDOKU_PUZZLES[pIdx % SUDOKU_PUZZLES.length];
  const [board, setBoard] = useState<(number|null)[][]>(() => puzzle.puzzle.map(r => [...r]));
  const [sel, setSel] = useState<{r:number;c:number}|null>(null);
  const [errors, setErrors] = useState<boolean[][]>(() => Array(9).fill(null).map(() => Array(9).fill(false)));
  const [complete, setComplete] = useState(false);

  function selectCell(r: number, c: number) { if (puzzle.puzzle[r][c] === null) setSel({r,c}); }
  function inputNum(n: number|null) {
    if (!sel) return;
    const nb = board.map(row => [...row]);
    nb[sel.r][sel.c] = n;
    setBoard(nb);
    if (n !== null) {
      const ne = errors.map(row => [...row]);
      ne[sel.r][sel.c] = n !== puzzle.solution[sel.r][sel.c];
      setErrors(ne);
      if (nb.every((row, ri) => row.every((v, ci) => v === puzzle.solution[ri][ci]))) setComplete(true);
    }
  }
  function newPuzzle() { setPIdx(p => p + 1); const np = SUDOKU_PUZZLES[(pIdx+1) % SUDOKU_PUZZLES.length]; setBoard(np.puzzle.map(r=>[...r])); setErrors(Array(9).fill(null).map(()=>Array(9).fill(false))); setComplete(false); setSel(null); }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Sober Sudoku" onBack={onBack} />
      <div className="flex-grow p-4 flex flex-col items-center overflow-y-auto">
        {complete && <div className="mb-4 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold text-center">🎉 Puzzle Complete!</div>}
        <div className="grid grid-cols-9 border-2 border-gray-400 mb-4" style={{width:'min(100%,320px)'}}>
          {board.map((row, ri) => row.map((val, ci) => {
            const isInit = puzzle.puzzle[ri][ci] !== null;
            const isSel = sel?.r === ri && sel?.c === ci;
            const isErr = errors[ri][ci];
            return (
              <button key={`${ri}-${ci}`} onClick={() => selectCell(ri, ci)}
                className={`aspect-square flex items-center justify-center text-sm font-bold border transition-colors
                  ${ci % 3 === 2 && ci < 8 ? 'border-r-2 border-r-gray-400' : 'border-r border-r-gray-200'}
                  ${ri % 3 === 2 && ri < 8 ? 'border-b-2 border-b-gray-400' : 'border-b border-b-gray-200'}
                  ${isSel ? 'bg-teal-100' : isInit ? 'bg-white' : 'bg-gray-50'}
                  ${isErr ? 'text-rose-500' : isInit ? 'text-gray-800' : 'text-teal-600'}`}>
                {val || ''}
              </button>
            );
          }))}
        </div>
        <div className="grid grid-cols-5 gap-2 w-full" style={{maxWidth:'320px'}}>
          {[1,2,3,4,5,6,7,8,9].map(n => (
            <button key={n} onClick={() => inputNum(n)} className="aspect-square bg-white rounded-xl shadow-sm font-bold text-lg text-teal-700 hover:bg-teal-50 active:scale-95">{n}</button>
          ))}
          <button onClick={() => inputNum(null)} className="aspect-square bg-white rounded-xl shadow-sm font-bold text-xs text-gray-500 hover:bg-gray-100 active:scale-95">✕</button>
        </div>
        <button onClick={newPuzzle} className="mt-4 bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-bold">New Puzzle</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// TIC TAC TOE
// ══════════════════════════════════════════════════════════════
function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<(string|null)[]>(Array(9).fill(null));
  const [xNext, setXNext] = useState(true);
  const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  const winner = lines.reduce<string|null>((w, [a,b,c]) => w || (board[a] && board[a]===board[b] && board[a]===board[c] ? board[a] : null), null);
  const isDraw = !winner && board.every(Boolean);
  function click(i: number) {
    if (winner || board[i]) return;
    const nb = [...board]; nb[i] = xNext ? 'X' : 'O';
    setBoard(nb); setXNext(!xNext);
  }
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Tic-Tac-Toe" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <p className="font-semibold text-gray-700 text-lg">{winner ? `Winner: ${winner} 🎉` : isDraw ? "It's a draw!" : `Next: ${xNext ? 'X' : 'O'}`}</p>
        <div className="grid grid-cols-3 gap-2 bg-gray-300 p-2 rounded-2xl">
          {board.map((v, i) => (
            <button key={i} onClick={() => click(i)}
              className={`w-24 h-24 bg-white rounded-xl text-4xl font-bold flex items-center justify-center transition-all active:scale-95 ${v === 'X' ? 'text-teal-600' : 'text-rose-500'}`}>
              {v}
            </button>
          ))}
        </div>
        {(winner || isDraw) && <button onClick={() => { setBoard(Array(9).fill(null)); setXNext(true); }} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">Play Again</button>}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// MATH QUIZ
// ══════════════════════════════════════════════════════════════
function MathQuiz({ onBack }: { onBack: () => void }) {
  const gen = () => {
    const ops = ['+','-','×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 20) + 1;
    let n2 = Math.floor(Math.random() * 20) + 1;
    if (op === '-' && n2 > n1) { [n1, n2] = [n2, n1]; }
    if (op === '×') { n1 = Math.floor(Math.random() * 10) + 1; n2 = Math.floor(Math.random() * 10) + 1; }
    const ans = op === '+' ? n1+n2 : op === '-' ? n1-n2 : n1*n2;
    return { n1, n2, op, ans };
  };
  const [q, setQ] = useState(gen);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [msg, setMsg] = useState('');

  function check() {
    if (parseInt(input) === q.ans) { setScore(s=>s+1); setMsg('✓ Correct!'); }
    else { setMsg(`✗ The answer was ${q.ans}`); }
    setTimeout(() => { setQ(gen()); setInput(''); setMsg(''); }, 1200);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Math Quiz" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center space-y-4">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Score: {score}</p>
          <div className="text-5xl font-bold text-gray-800 font-mono">{q.n1} {q.op} {q.n2} = ?</div>
          {msg && <p className={`font-bold text-lg ${msg.startsWith('✓') ? 'text-emerald-600' : 'text-rose-500'}`}>{msg}</p>}
          <input type="number" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && check()}
            className="w-full text-center text-3xl p-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none font-mono" placeholder="?" autoFocus />
          <button onClick={check} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg">Submit</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// COLOR MATCH
// ══════════════════════════════════════════════════════════════
const COLORS_CM = [
  { name:'RED', hex:'#EF4444' },{ name:'BLUE', hex:'#3B82F6' },
  { name:'GREEN', hex:'#10B981' },{ name:'YELLOW', hex:'#F59E0B' },{ name:'PURPLE', hex:'#8B5CF6' },
];
function ColorMatch({ onBack }: { onBack: () => void }) {
  const [wordColor, setWordColor] = useState(COLORS_CM[0]);
  const [textColor, setTextColor] = useState(COLORS_CM[0]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    if (timeLeft === 0) { setPlaying(false); return; }
    const t = setTimeout(() => setTimeLeft(tl => tl - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, playing]);

  function next() {
    setWordColor(COLORS_CM[Math.floor(Math.random()*COLORS_CM.length)]);
    setTextColor(COLORS_CM[Math.floor(Math.random()*COLORS_CM.length)]);
  }
  function start() { setScore(0); setTimeLeft(30); setPlaying(true); next(); }
  function choose(match: boolean) {
    if (!playing) return;
    if (match === (wordColor.name === textColor.name)) setScore(s=>s+1);
    next();
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Color Match" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        {!playing && timeLeft === 0 ? (
          <div className="text-center space-y-4">
            <div className="text-5xl">🎨</div>
            <p className="text-2xl font-bold text-gray-800">Final Score: {score}</p>
            <button onClick={start} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold">Play Again</button>
          </div>
        ) : !playing ? (
          <div className="text-center space-y-4 max-w-sm">
            <p className="text-gray-600">Does the <strong>color of the text</strong> match the <strong>word</strong>?</p>
            <button onClick={start} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold w-full">Start Game</button>
          </div>
        ) : (
          <>
            <div className="flex justify-between w-full max-w-sm">
              <span className="font-bold text-gray-700">Score: {score}</span>
              <span className={`font-bold ${timeLeft <= 10 ? 'text-rose-500' : 'text-gray-700'}`}>⏱ {timeLeft}s</span>
            </div>
            <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center">
              <p className="text-5xl font-black tracking-widest" style={{color: textColor.hex}}>{wordColor.name}</p>
            </div>
            <div className="flex gap-4 w-full max-w-sm">
              <button onClick={() => choose(true)} className="flex-1 bg-emerald-500 text-white py-4 rounded-2xl font-bold text-lg">✓ Match</button>
              <button onClick={() => choose(false)} className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-bold text-lg">✕ No Match</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// REACTION TIME
// ══════════════════════════════════════════════════════════════
function ReactionTime({ onBack }: { onBack: () => void }) {
  const [state, setState] = useState<'idle'|'waiting'|'go'|'done'|'early'>('idle');
  const [ms, setMs] = useState<number|null>(null);
  const t = useRef<ReturnType<typeof setTimeout>|null>(null);
  const start = useRef(0);

  function begin() {
    setState('waiting'); setMs(null);
    const delay = Math.random() * 3000 + 2000;
    t.current = setTimeout(() => { setState('go'); start.current = Date.now(); }, delay);
  }
  function tap() {
    if (state === 'waiting') { if(t.current) clearTimeout(t.current); setState('early'); }
    else if (state === 'go') { setMs(Date.now() - start.current); setState('done'); }
    else begin();
  }
  useEffect(() => () => { if(t.current) clearTimeout(t.current); }, []);

  const bg = state === 'go' ? 'bg-emerald-500 border-emerald-600' : state === 'early' ? 'bg-amber-500 border-amber-600' : state === 'done' ? 'bg-teal-500 border-teal-600' : 'bg-rose-500 border-rose-600';
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Reaction Time" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-6">
        <p className="text-gray-600 text-center">Wait for green, then tap as fast as you can!</p>
        <button onClick={state === 'idle' ? begin : tap}
          className={`w-full max-w-sm h-56 rounded-3xl border-4 ${bg} flex flex-col items-center justify-center text-white font-bold text-2xl transition-colors shadow-lg`}>
          {state === 'idle' && 'Tap to Start'}
          {state === 'waiting' && 'Wait...'}
          {state === 'go' && 'TAP NOW!'}
          {state === 'early' && <><span className="mb-1">Too Early!</span><span className="text-base font-normal opacity-80">Tap to retry</span></>}
          {state === 'done' && ms && <><span className="text-5xl mb-1">{ms}ms</span><span className="text-base font-normal opacity-80">Tap to play again</span></>}
        </button>
        {state === 'done' && ms && (
          <p className="text-gray-500 text-sm">{ms < 200 ? '⚡ Lightning fast!' : ms < 300 ? '👏 Great reflexes!' : ms < 400 ? '👍 Good reaction!' : '🙂 Keep practicing!'}</p>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// SLIDING PUZZLE
// ══════════════════════════════════════════════════════════════
function SlidingPuzzle({ onBack }: { onBack: () => void }) {
  const init = () => {
    let b = [1,2,3,4,5,6,7,8,0];
    for (let i=b.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [b[i],b[j]]=[b[j],b[i]]; }
    return b;
  };
  const [board, setBoard] = useState(init);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState(false);

  function click(i: number) {
    if (solved) return;
    const empty = board.indexOf(0);
    const r=Math.floor(i/3),c=i%3,er=Math.floor(empty/3),ec=empty%3;
    if (!((Math.abs(r-er)===1&&c===ec)||(Math.abs(c-ec)===1&&r===er))) return;
    const nb=[...board]; [nb[i],nb[empty]]=[nb[empty],nb[i]];
    setBoard(nb); setMoves(m=>m+1);
    if (nb.every((v,idx)=>v===[1,2,3,4,5,6,7,8,0][idx])) setSolved(true);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Sliding Puzzle" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center space-y-4">
        {solved && <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-bold">🎉 Solved in {moves} moves!</div>}
        <p className="text-gray-500 text-sm">Moves: <span className="font-bold text-teal-600">{moves}</span></p>
        <div className="grid grid-cols-3 gap-2 bg-gray-300 p-3 rounded-2xl shadow-inner" style={{width:'min(100%,280px)'}}>
          {board.map((tile,i) => (
            <button key={i} onClick={()=>click(i)}
              className={`aspect-square text-3xl font-bold flex items-center justify-center rounded-xl transition-all duration-150 ${tile===0?'bg-transparent cursor-default':'bg-white text-teal-600 shadow-sm hover:bg-teal-50 active:scale-95'}`}>
              {tile || ''}
            </button>
          ))}
        </div>
        <button onClick={()=>{setBoard(init());setMoves(0);setSolved(false);}} className="bg-teal-600 text-white px-6 py-2 rounded-xl text-sm font-bold">New Game</button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// GUESS NUMBER
// ══════════════════════════════════════════════════════════════
function GuessNumber({ onBack }: { onBack: () => void }) {
  const [target] = useState(() => Math.floor(Math.random()*100)+1);
  const [t, setT] = useState(target);
  const [guess, setGuess] = useState('');
  const [msg, setMsg] = useState('Guess a number between 1 and 100');
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);
  const [key, setKey] = useState(0);

  function newGame() { setKey(k=>k+1); }

  function check() {
    const n = parseInt(guess);
    if (isNaN(n)) { setMsg('Enter a valid number.'); return; }
    setAttempts(a=>a+1);
    if (n === t) { setMsg(`Correct! Guessed in ${attempts+1} tries! 🎉`); setWon(true); }
    else setMsg(n < t ? '📈 Too low! Go higher.' : '📉 Too high! Go lower.');
    setGuess('');
  }

  // Use key to remount
  return <GuessNumberInner key={key} onBack={onBack} />;
}

function GuessNumberInner({ onBack }: { onBack: () => void }) {
  const [target] = useState(() => Math.floor(Math.random()*100)+1);
  const [guess, setGuess] = useState('');
  const [msg, setMsg] = useState('Guess a number between 1 and 100');
  const [attempts, setAttempts] = useState(0);
  const [won, setWon] = useState(false);

  function check() {
    const n = parseInt(guess);
    if (isNaN(n)) { setMsg('Enter a valid number.'); return; }
    const a = attempts + 1; setAttempts(a);
    if (n === target) { setMsg(`Correct! You guessed it in ${a} tries! 🎉`); setWon(true); }
    else setMsg(n < target ? '📈 Too low! Go higher.' : '📉 Too high! Go lower.');
    setGuess('');
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="Guess the Number" onBack={onBack} />
      <div className="flex-grow p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-3xl shadow-sm w-full max-w-sm text-center space-y-4">
          <div className="text-5xl mb-2">🤔</div>
          <p className={`text-lg font-medium ${won?'text-emerald-600':'text-gray-600'}`}>{msg}</p>
          {!won ? (
            <>
              <input type="number" value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==='Enter'&&check()}
                className="w-full text-center text-3xl p-4 border-2 border-gray-200 rounded-xl focus:border-teal-500 outline-none font-mono" placeholder="?" autoFocus />
              <button onClick={check} className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold text-lg">Submit</button>
              <p className="text-sm text-gray-400">Attempts: {attempts}</p>
            </>
          ) : (
            <button onClick={() => window.location.reload()} className="hidden" />
          )}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// 100 DAY CHALLENGE
// ══════════════════════════════════════════════════════════════
function HundredDay({ onBack, completedDays, onToggleDay }: { onBack:()=>void; completedDays:number[]; onToggleDay:(d:number)=>void }) {
  const days = Array.from({length:100},(_,i)=>completedDays.includes(i));
  const count = days.filter(Boolean).length;
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <Header title="100 Day Challenge" onBack={onBack} />
      <div className="flex-grow p-4 overflow-y-auto">
        <div className="bg-white p-4 rounded-2xl shadow-sm mb-4 text-center">
          <p className="text-gray-500 text-sm mb-3">Mark your progress one day at a time!</p>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-1">
            <div className="bg-gradient-to-r from-teal-400 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{width:`${count}%`}} />
          </div>
          <p className="text-sm font-bold text-teal-600 mt-1">{count} / 100 Days</p>
        </div>
        <div className="grid grid-cols-10 gap-1.5">
          {days.map((done,i) => (
            <button key={i} onClick={()=>onToggleDay(i)}
              className={`aspect-square rounded-full flex items-center justify-center font-bold text-xs transition-all duration-150 ${done?'bg-teal-500 text-white shadow-sm':'bg-white text-gray-400 shadow-sm hover:bg-gray-100'}`}>
              {done ? '✓' : i+1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// PUZZLE MENU
// ══════════════════════════════════════════════════════════════
// ── Puzzle SVG Icons ─────────────────────────────────────────────────────────
const PatternIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8"/>
    <path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8"/>
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/>
    <path d="M15.5 6.5a3.5 3.5 0 0 0 -3.5 -3.5h-1a3.5 3.5 0 0 0 0 7h1"/>
    <path d="M8.5 6.5a3.5 3.5 0 0 1 3.5 -3.5h1a3.5 3.5 0 0 1 0 7h-1"/>
  </svg>
);
const WordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M3 16v-6a2 2 0 1 1 4 0v6"/><path d="M3 13h4"/>
    <path d="M10 16v-6a2 2 0 1 1 4 0v6"/><path d="M10 13h4"/>
    <path d="M17 16v-6l4 6v-6"/>
  </svg>
);
const SudokuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1 -1 1h-16a1 1 0 0 1 -1 -1v-16a1 1 0 0 1 1 -1z"/>
    <path d="M4 12h16"/><path d="M12 4v16"/><path d="M4 8h16"/><path d="M8 4v16"/><path d="M4 16h16"/><path d="M16 4v16"/>
  </svg>
);
const MemoryIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/>
  </svg>
);
const TicTacToeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h16M4 16h16M8 4v16M16 4v16"/>
  </svg>
);
const MathIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
  </svg>
);
const ColorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"/>
  </svg>
);
const ReactionIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/>
  </svg>
);
const SlidingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 12h16M12 4v16"/>
  </svg>
);
const GuessIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const ChallengeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M11.5 21h-5.5a2 2 0 0 1 -2 -2v-12a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v6"/>
    <path d="M16 3v4"/><path d="M8 3v4"/><path d="M4 11h11"/><path d="M15 19l2 2l4 -4"/>
  </svg>
);

const PUZZLE_CARDS = [
  { game:'sequence' as Game, title:'Pattern Match', desc:'Follow the sequence to sharpen focus.', icon:<PatternIcon/> },
  { game:'wordScramble' as Game, title:'Word Unscramble', desc:'Unscramble recovery words.', icon:<WordIcon/> },
  { game:'sudoku' as Game, title:'Sober Sudoku', desc:'A classic logic puzzle.', icon:<SudokuIcon/> },
  { game:'memoryMatch' as Game, title:'Memory Match', desc:'Test your memory and focus.', icon:<MemoryIcon/> },
  { game:'tictactoe' as Game, title:'Tic-Tac-Toe', desc:'A quick game of strategy.', icon:<TicTacToeIcon/> },
  { game:'mathQuiz' as Game, title:'Math Quiz', desc:'Solve math problems quickly.', icon:<MathIcon/> },
  { game:'colorMatch' as Game, title:'Color Match', desc:"Don't get tricked by colors!", icon:<ColorIcon/> },
  { game:'reactionTime' as Game, title:'Reaction Time', desc:'Test how fast you can react.', icon:<ReactionIcon/> },
  { game:'slidingPuzzle' as Game, title:'Sliding Puzzle', desc:'Slide tiles to form the picture.', icon:<SlidingIcon/> },
  { game:'guessNumber' as Game, title:'Guess the Number', desc:'Can you guess the secret number?', icon:<GuessIcon/> },
  { game:'hundredDay' as Game, title:'100 Day Challenge', desc:'Commit to 100 days of progress.', icon:<ChallengeIcon/> },
];

interface Props { onBack: () => void; completedDays?: number[]; onToggleDay?: (d: number) => void; }

export default function PuzzleScreen({ onBack, completedDays = [], onToggleDay = () => {} }: Props) {
  const [game, setGame] = useState<Game>('menu');

  if (game === 'wordScramble') return <WordScramble onBack={() => setGame('menu')} />;
  if (game === 'memoryMatch') return <MemoryMatch onBack={() => setGame('menu')} />;
  if (game === 'sequence') return <SequenceGame onBack={() => setGame('menu')} />;
  if (game === 'sudoku') return <SudokuGame onBack={() => setGame('menu')} />;
  if (game === 'tictactoe') return <TicTacToe onBack={() => setGame('menu')} />;
  if (game === 'mathQuiz') return <MathQuiz onBack={() => setGame('menu')} />;
  if (game === 'colorMatch') return <ColorMatch onBack={() => setGame('menu')} />;
  if (game === 'reactionTime') return <ReactionTime onBack={() => setGame('menu')} />;
  if (game === 'slidingPuzzle') return <SlidingPuzzle onBack={() => setGame('menu')} />;
  if (game === 'guessNumber') return <GuessNumberInner onBack={() => setGame('menu')} />;
  if (game === 'hundredDay') return <HundredDay onBack={() => setGame('menu')} completedDays={completedDays} onToggleDay={onToggleDay} />;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <BackBtn onClick={onBack} />
        <div className="text-center flex-grow"><h1 className="font-bold text-lg text-gray-800">Interactive Puzzles</h1></div>
        <div className="w-10" />
      </header>
      <div className="flex-grow p-4 overflow-y-auto">
        <p className="text-gray-500 text-sm text-center mb-4">Engage your mind to distract from cravings.</p>
        <div className="space-y-3">
          {PUZZLE_CARDS.map(({ game: g, title, desc, icon }) => (
            <button key={g} onClick={() => setGame(g)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center text-left transition-transform duration-200 active:scale-95">
              <div className="bg-teal-100 text-teal-600 p-3 rounded-full mr-4 flex-shrink-0">{icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
