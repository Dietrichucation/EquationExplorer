import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { ArrowRight, Check, X, BookOpen, Calculator, Trophy, Info, RefreshCw, Hash, Settings } from 'lucide-react';

// --- Components ---

// 1. Simple Button Component
const Button = ({ onClick, children, variant = 'primary', className = '', disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 shadow-md flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300",
    secondary: "bg-purple-600 text-white hover:bg-purple-700 disabled:bg-purple-300",
    success: "bg-green-500 text-white hover:bg-green-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
    outline: "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-500 hover:text-blue-500 disabled:bg-gray-100 disabled:text-gray-400",
  };

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyle} ${variants[variant]} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// 2. Card Component
const Card = ({ children, className = "", title }) => (
  <div className={`bg-white rounded-xl shadow-lg border-b-4 border-gray-200 overflow-hidden ${className}`}>
    {title && <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 font-bold text-gray-700 text-lg">{title}</div>}
    <div className="p-6">{children}</div>
  </div>
);

// 3. Slider Component (For Explore Mode)
const VariableSlider = ({ label, value, onChange, color }) => (
  <div className="flex flex-col gap-1 mb-4">
    <div className="flex justify-between items-center">
      <label className={`font-bold text-lg`} style={{ color }}>{label}</label>
      <span className="font-mono bg-gray-100 px-2 py-1 rounded text-gray-800 font-bold">{value}</span>
    </div>
    <input
      type="range"
      min="-10"
      max="10"
      step="1"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
    />
  </div>
);

// 4. Input Component (For Challenge Mode)
const VariableInput = ({ label, value, onChange, color }) => {
  const [localVal, setLocalVal] = useState(value.toString());

  useEffect(() => {
    setLocalVal(value.toString());
  }, [value]);

  const handleChange = (e) => {
    const val = e.target.value;
    setLocalVal(val);
    if (val === '' || val === '-') return;
    const num = parseInt(val);
    if (!isNaN(num)) onChange(num);
  };

  const handleBlur = () => {
    const num = parseInt(localVal);
    if (isNaN(num)) {
      setLocalVal(value.toString());
    } else {
      onChange(num);
      setLocalVal(num.toString());
    }
  };

  return (
    <div className="flex flex-col gap-1 mb-4">
      <label className={`font-bold text-sm uppercase tracking-wide`} style={{ color }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9-]*"
          value={localVal}
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full p-3 text-lg font-mono font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
          placeholder="?"
        />
      </div>
    </div>
  );
};

// --- Main Application ---

const App = () => {
  const [mode, setMode] = useState('explore'); 
  
  // State for Equation: ax + b = cx + d
  const [a, setA] = useState(2);
  const [b, setB] = useState(1);
  const [c, setC] = useState(-1);
  const [d, setD] = useState(4);

  // State for Graph Settings
  const [graphLimit, setGraphLimit] = useState(10);
  
  // State for Practice Quiz
  const [quizProblem, setQuizProblem] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const TOTAL_QUESTIONS = 10;

  // State for Challenge
  const [challenge, setChallenge] = useState(null);
  const [challengeSuccess, setChallengeSuccess] = useState(false);
  const [challengeFeedback, setChallengeFeedback] = useState(null);

  // --- Logic Helpers ---

  const getSolutionType = (m1, b1, m2, b2) => {
    if (m1 === m2) {
      return b1 === b2 ? 'Infinite Solutions' : 'No Solution';
    }
    return 'One Solution';
  };

  const getIntersectionPoint = (m1, b1, m2, b2) => {
    if (m1 === m2) return null;
    const x = (b2 - b1) / (m1 - m2);
    const y = m1 * x + b1;
    return { x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) };
  };

  const generateDataPoints = (m1, b1, m2, b2, limit) => {
    const data = [];
    const range = limit + 2; 
    for (let x = -range; x <= range; x++) {
      data.push({
        x,
        y1: m1 * x + b1,
        y2: m2 * x + b2,
      });
    }
    return data;
  };

  // --- Quiz Logic ---
  const startQuiz = () => {
    setScore(0);
    setQuestionCount(0);
    setQuizFinished(false);
    generateQuizProblem();
  };

  const generateQuizProblem = () => {
    const types = ['one', 'no', 'infinite'];
    const type = types[Math.floor(Math.random() * types.length)];
    const style = Math.random() > 0.5 ? 'equation' : 'graph';

    let newA, newB, newC, newD;

    if (type === 'one') {
      newA = Math.floor(Math.random() * 8) - 4; 
      newC = newA + (Math.floor(Math.random() * 3) + 1) * (Math.random() > 0.5 ? 1 : -1); 
      newB = Math.floor(Math.random() * 10) - 5;
      newD = Math.floor(Math.random() * 10) - 5;
    } else if (type === 'no') {
      newA = Math.floor(Math.random() * 8) - 4;
      newC = newA;
      newB = Math.floor(Math.random() * 10) - 5;
      do { newD = Math.floor(Math.random() * 10) - 5; } while (newD === newB);
    } else {
      newA = Math.floor(Math.random() * 8) - 4;
      newC = newA;
      newB = Math.floor(Math.random() * 10) - 5;
      newD = newB;
    }
    
    setQuizProblem({ a: newA, b: newB, c: newC, d: newD, type, style });
    setQuizFeedback(null);
  };

  const checkQuiz = (selectedType) => {
    const correctType = quizProblem.type === 'one' ? 'One Solution' : quizProblem.type === 'no' ? 'No Solution' : 'Infinite Solutions';
    const isCorrect = selectedType.startsWith(correctType);
    
    if (isCorrect) {
      setScore(s => s + 1);
      setQuizFeedback({ correct: true, msg: "Correct! You're getting it!" });
    } else {
      setQuizFeedback({ 
        correct: false, 
        msg: quizProblem.style === 'graph' 
          ? "Look closely at the lines. Do they cross, never touch, or overlap?" 
          : `Not quite. Look closely at the variable terms (${quizProblem.a}x and ${quizProblem.c}x).` 
      });
    }
  };

  const nextQuestion = () => {
    const nextCount = questionCount + 1;
    setQuestionCount(nextCount);
    if (nextCount >= TOTAL_QUESTIONS) {
      setQuizFinished(true);
      setQuizProblem(null);
    } else {
      generateQuizProblem();
    }
  };

  // --- Challenge Logic ---
  const generateChallenge = () => {
    const goals = ['No Solution', 'Infinite Solutions', 'One Solution'];
    const selectedGoal = goals[Math.floor(Math.random() * goals.length)];
    const editMode = Math.floor(Math.random() * 3); 
    
    let newA = Math.floor(Math.random() * 10) - 5;
    let newB = Math.floor(Math.random() * 20) - 10;
    let newC = Math.floor(Math.random() * 10) - 5;
    let newD = Math.floor(Math.random() * 20) - 10;
    
    let locked = [];
    if (editMode === 0) { // Edit Right
        locked = ['a', 'b'];
        newC = 0; newD = 0;
    } else if (editMode === 1) { // Edit Left
        locked = ['c', 'd'];
        newA = 0; newB = 0; 
    } else { // Edit Both
        locked = [];
        newA = 0; newB = 0; newC = 0; newD = 0;
    }

    let targetFunc;
    if (selectedGoal === 'No Solution') {
        targetFunc = (curr) => curr.a === curr.c && curr.b !== curr.d;
    } else if (selectedGoal === 'Infinite Solutions') {
        targetFunc = (curr) => curr.a === curr.c && curr.b === curr.d;
    } else { // One Solution
        targetFunc = (curr) => curr.a !== curr.c;
    }
    
    setChallenge({ goal: selectedGoal, locked: locked, target: targetFunc });
    setA(newA); setB(newB); setC(newC); setD(newD);
    setChallengeSuccess(false);
    setChallengeFeedback(null);
  };

  const submitChallenge = () => {
    if (!challenge) return;
    if (challenge.target({ a, b, c, d })) {
      setChallengeSuccess(true);
      setChallengeFeedback('success');
    } else {
      setChallengeSuccess(false);
      setChallengeFeedback('error');
    }
  };

  // --- Render Helpers ---

  const renderEquation = (valA, valB, valC, valD) => {
    const formatSide = (m, k) => {
      const mStr = m === 0 ? "" : m === 1 ? "x" : m === -1 ? "-x" : `${m}x`;
      const kStr = k === 0 && m !== 0 ? "" : k > 0 && m !== 0 ? `+ ${k}` : `${k}`;
      if (m === 0 && k === 0) return "0";
      return `${mStr} ${kStr}`;
    };
    return (
      <div className="flex items-center justify-center gap-4 text-2xl md:text-4xl font-black font-mono my-4 bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300">
        <span className="text-red-500">{formatSide(valA, valB)}</span>
        <span className="text-gray-400">=</span>
        <span className="text-blue-500">{formatSide(valC, valD)}</span>
      </div>
    );
  };

  // --- Views ---

  const renderExplore = () => {
    const solutionType = getSolutionType(a, b, c, d);
    const data = generateDataPoints(a, b, c, d, graphLimit);

    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4">
          <Card className="bg-yellow-50 border-yellow-200">
            <h3 className="font-bold text-yellow-800 flex items-center gap-2"><Info size={18} /> Tip</h3>
            <p className="text-sm text-yellow-800 mt-2">Experiment with the sliders to see how the lines change.</p>
          </Card>

          {/* New Graph Settings Control */}
          <Card className="bg-gray-50 border-gray-200">
            <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-2"><Settings size={18} /> Graph Axis Range</h3>
            <div className="flex items-center gap-4">
              <span className="font-mono font-bold text-gray-500">-{graphLimit}</span>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={graphLimit}
                onChange={(e) => setGraphLimit(Number(e.target.value))}
                className="flex-grow h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-gray-600"
              />
              <span className="font-mono font-bold text-gray-500">+{graphLimit}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">Adjust to zoom in or out.</p>
          </Card>

          <Card title="Left Side (Red Line)">
            <p className="text-sm text-gray-500 mb-4">Equation: <span className="font-mono text-red-500 font-bold">y = {a}x + {b}</span></p>
            {/* UPDATED LABEL: Slope (m) */}
            <VariableSlider label="Slope (m)" value={a} onChange={setA} color="#ef4444" />
            <VariableSlider label="Y-Intercept (b)" value={b} onChange={setB} color="#ef4444" />
          </Card>
          
          <Card title="Right Side (Blue Line)">
            <p className="text-sm text-gray-500 mb-4">Equation: <span className="font-mono text-blue-500 font-bold">y = {c}x + {d}</span></p>
            {/* UPDATED LABELS: Slope (m) and Intercept (b) */}
            <VariableSlider label="Slope (m)" value={c} onChange={setC} color="#3b82f6" />
            <VariableSlider label="Y-Intercept (b)" value={d} onChange={setD} color="#3b82f6" />
          </Card>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-4">
          <Card className="flex-grow flex flex-col items-center justify-center min-h-[400px]">
             {renderEquation(a, b, c, d)}
             <div className="text-center mb-4">
                <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold shadow-sm border ${
                  solutionType === 'One Solution' ? 'bg-green-100 text-green-700 border-green-200' :
                  solutionType === 'No Solution' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-purple-100 text-purple-700 border-purple-200'
                }`}>{solutionType}</span>
             </div>
             <div className="w-full h-[350px] bg-white rounded-lg border border-gray-100 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                   <XAxis 
                     dataKey="x" 
                     type="number" 
                     domain={[-graphLimit, graphLimit]} 
                     allowDataOverflow={true} 
                     stroke="#9ca3af" 
                   />
                   <YAxis 
                     type="number" 
                     domain={[-graphLimit, graphLimit]} 
                     allowDataOverflow={true} 
                     stroke="#9ca3af" 
                   />
                   <ReferenceLine x={0} stroke="#9ca3af" />
                   <ReferenceLine y={0} stroke="#9ca3af" />
                   <Line type="monotone" dataKey="y1" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                   <Line type="monotone" dataKey="y2" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className={`p-4 rounded-lg border-2 ${solutionType === 'One Solution' ? 'bg-green-50 border-green-500 opacity-100 ring-2 ring-green-200' : 'bg-gray-50 border-transparent opacity-50'}`}>
               <h4 className="font-bold mb-1">One Solution</h4>
               <p className="text-xs">Lines cross once.</p>
             </div>
             <div className={`p-4 rounded-lg border-2 ${solutionType === 'No Solution' ? 'bg-red-50 border-red-500 opacity-100 ring-2 ring-red-200' : 'bg-gray-50 border-transparent opacity-50'}`}>
               <h4 className="font-bold mb-1">No Solution</h4>
               <p className="text-xs">Parallel lines.</p>
             </div>
             <div className={`p-4 rounded-lg border-2 ${solutionType === 'Infinite Solutions' ? 'bg-purple-50 border-purple-500 opacity-100 ring-2 ring-purple-200' : 'bg-gray-50 border-transparent opacity-50'}`}>
               <h4 className="font-bold mb-1">Infinite Solutions</h4>
               <p className="text-xs">Same line.</p>
             </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPractice = () => {
    if (!quizProblem && !quizFinished) return (
      <div className="text-center py-20 bg-white rounded-xl shadow-lg border-b-4 border-gray-200">
        <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} className="text-blue-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-4">Quiz Time</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          Predict solution types from equations AND analyze graphs to explain why!
        </p>
        <Button onClick={startQuiz} className="mx-auto text-xl py-4 px-12">Start Quiz</Button>
      </div>
    );

    if (quizFinished) return (
      <div className="text-center py-20 bg-white rounded-xl shadow-lg border-b-4 border-gray-200 animate-in zoom-in duration-300">
        <h2 className="text-3xl font-black text-gray-800 mb-6">Quiz Complete!</h2>
        <div className="flex justify-center items-center gap-4 mb-8">
           <div className="text-6xl font-black text-blue-600">{score}/{TOTAL_QUESTIONS}</div>
        </div>
        <p className="text-xl text-gray-600 mb-8">
          {score === TOTAL_QUESTIONS ? "Perfect Score! You are a master!" : 
           score >= 7 ? "Great job! You really know your stuff." : 
           "Keep practicing! You'll get it."}
        </p>
        <Button onClick={startQuiz} variant="secondary" className="mx-auto text-lg py-3 px-8">
          <RefreshCw size={20} /> Play Again
        </Button>
      </div>
    );

    const options = quizProblem.style === 'equation' 
      ? ['One Solution', 'No Solution', 'Infinite Solutions']
      : [
          'One Solution: Lines Intersect', 
          'No Solution: Lines are Parallel', 
          'Infinite Solutions: Lines are Identical'
        ];

    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="text-gray-500 font-bold">Question {questionCount + 1} of {TOTAL_QUESTIONS}</div>
          <div className="flex items-center gap-2 text-blue-600 font-black text-xl">
            <Trophy size={20} /> {score}
          </div>
        </div>

        <Card className="text-center py-12">
          <p className="text-gray-500 mb-6 font-medium uppercase tracking-wider">
            {quizProblem.style === 'equation' ? 'Predict the solution type' : 'Analyze the graph & Explain Why'}
          </p>
          
          {quizProblem.style === 'equation' ? (
             renderEquation(quizProblem.a, quizProblem.b, quizProblem.c, quizProblem.d)
          ) : (
             <div className="w-full h-[250px] mb-8 bg-white rounded-lg border border-gray-200">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={generateDataPoints(quizProblem.a, quizProblem.b, quizProblem.c, quizProblem.d, 10)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                   <CartesianGrid strokeDasharray="3 3" />
                   <XAxis dataKey="x" type="number" domain={[-10, 10]} allowDataOverflow={true} stroke="#9ca3af" />
                   <YAxis type="number" domain={[-10, 10]} allowDataOverflow={true} stroke="#9ca3af" />
                   <ReferenceLine x={0} stroke="#9ca3af" />
                   <ReferenceLine y={0} stroke="#9ca3af" />
                   <Line type="monotone" dataKey="y1" stroke="#ef4444" strokeWidth={3} dot={false} isAnimationActive={false} />
                   <Line type="monotone" dataKey="y2" stroke="#3b82f6" strokeWidth={3} dot={false} isAnimationActive={false} />
                 </LineChart>
               </ResponsiveContainer>
             </div>
          )}
          
          <div className="flex flex-col md:flex-row justify-center gap-4 mt-8">
             {options.map((option) => (
               <Button 
                key={option}
                variant="outline" 
                className={`py-4 text-md flex-1 ${quizFeedback && quizFeedback.correct && option.startsWith(quizProblem.type === 'one' ? 'One' : quizProblem.type === 'no' ? 'No' : 'Infinite') ? 'bg-green-500 border-green-500 text-white hover:text-white' : ''}`}
                onClick={() => checkQuiz(option)}
                disabled={!!quizFeedback}
              >
                 {option}
               </Button>
             ))}
          </div>

          {quizFeedback && (
             <div className={`mt-8 p-4 rounded-lg animate-in fade-in slide-in-from-bottom-4 ${quizFeedback.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
               <div className="flex items-center justify-center gap-2 text-lg font-bold mb-1">
                 {quizFeedback.correct ? <Check /> : <X />}
                 {quizFeedback.correct ? "Great Job!" : "Oops!"}
               </div>
               <p>{quizFeedback.msg}</p>
               <div className="mt-4">
                 <Button onClick={nextQuestion} variant="secondary" className="mx-auto">Next Question <ArrowRight size={16} /></Button>
               </div>
             </div>
          )}
        </Card>
      </div>
    );
  };

  const renderChallenge = () => {
    if (!challenge) return (
      <div className="text-center py-20 bg-white rounded-xl shadow-lg border-b-4 border-gray-200">
        <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <Hash size={40} className="text-purple-600" />
        </div>
        <h2 className="text-3xl font-black text-gray-800 mb-4">Fix the Equation</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          I'll give you a broken equation and a goal. You must <strong>type in the numbers</strong> to make it work.
        </p>
        <Button onClick={generateChallenge} variant="secondary" className="mx-auto text-xl py-4 px-12">Start Challenge</Button>
      </div>
    );

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card title="Mission Briefing">
            <p className="text-gray-600 mb-4">Make this equation have:</p>
            <div className="text-2xl font-black text-purple-600 bg-purple-50 p-4 rounded-lg text-center border-2 border-purple-100 mb-4">
              {challenge.goal.toUpperCase()}
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* UPDATED LABELS HERE TOO: m and b */}
            {!challenge.locked.includes('a') && <VariableInput label="Left Slope (m)" value={a} onChange={setA} color="#ef4444" />}
            {!challenge.locked.includes('b') && <VariableInput label="Left Intercept (b)" value={b} onChange={setB} color="#ef4444" />}
            {!challenge.locked.includes('c') && <VariableInput label="Right Slope (m)" value={c} onChange={setC} color="#3b82f6" />}
            {!challenge.locked.includes('d') && <VariableInput label="Right Intercept (b)" value={d} onChange={setD} color="#3b82f6" />}
          </div>
          
          <Button onClick={submitChallenge} className="w-full py-4 text-lg shadow-lg" variant={challengeSuccess ? "success" : "primary"}>
            {challengeSuccess ? "Correct! Next Level?" : "Submit Answer"}
          </Button>

          {challengeFeedback === 'error' && (
             <div className="bg-red-100 text-red-800 p-4 rounded-lg text-center font-bold animate-in shake">
               <span className="flex items-center justify-center gap-2"><X /> Not quite right. Try again!</span>
             </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
           <Card className="flex-grow flex flex-col items-center justify-center text-center">
              {renderEquation(a, b, c, d)}
              <div className="w-full h-[200px] mt-4 opacity-75">
                 <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={generateDataPoints(a, b, c, d, 10)} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" />
                     <XAxis hide type="number" domain={[-10, 10]} allowDataOverflow={true} />
                     <YAxis hide type="number" domain={[-10, 10]} allowDataOverflow={true} />
                     <Line type="monotone" dataKey="y1" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
                     <Line type="monotone" dataKey="y2" stroke="#3b82f6" strokeWidth={2} dot={false} isAnimationActive={false} />
                   </LineChart>
                 </ResponsiveContainer>
              </div>
              {challengeSuccess ? (
                <div className="mt-6 animate-in zoom-in duration-300">
                  <div className="text-green-600 font-black text-2xl mb-2 flex items-center justify-center gap-2"><Trophy size={32} /> SUCCESS!</div>
                  <Button onClick={generateChallenge} variant="success" className="w-full py-3">Next Level</Button>
                </div>
              ) : (
                <div className="mt-6 text-gray-400 italic">Type your numbers and click Submit.</div>
              )}
           </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 pb-12">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg"><Calculator size={24} /></div>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 hidden sm:block">Equation Explorer</h1>
            <h1 className="text-xl font-bold tracking-tight text-gray-800 sm:hidden">Eq. Explorer</h1>
          </div>
          <nav className="flex gap-2">
             <button onClick={() => setMode('explore')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'explore' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><BookOpen size={18} /> <span className="hidden sm:inline">Learn</span></button>
             <button onClick={() => setMode('practice')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'practice' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><Check size={18} /> <span className="hidden sm:inline">Quiz</span></button>
             <button onClick={() => setMode('challenge')} className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${mode === 'challenge' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:bg-gray-50'}`}><Trophy size={18} /> <span className="hidden sm:inline">Play</span></button>
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {mode === 'explore' && renderExplore()}
          {mode === 'practice' && renderPractice()}
          {mode === 'challenge' && renderChallenge()}
        </div>
      </main>
    </div>
  );
};

export default App;
