import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import './App.css';

// --- SUB-COMPONENT: TYPEWRITER LOG ---
const TypewriterLog = ({ text, type }) => {
  const [displayedText, setDisplayedText] = useState("");
  
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText(text.slice(0, i));
      i++;
      if (i > text.length) clearInterval(interval);
    }, 20);
    return () => clearInterval(interval);
  }, [text]);

  return <div className={`log-entry log-${type}`}>{'>'} {displayedText}</div>;
};

function App() {
  // --- STATE MANAGEMENT ---
  const [token, setToken] = useState(localStorage.getItem('crawler_token'));
  const [username, setUsername] = useState(localStorage.getItem('crawler_user'));
  const [gameState, setGameState] = useState(token ? 'START' : 'AUTH'); 
  const [authMode, setAuthMode] = useState('LOGIN'); 
  
  const [hp, setHp] = useState(100);
  const [floor, setFloor] = useState(1);
  const [runId, setRunId] = useState(null);
  const [problem, setProblem] = useState(null);
  
  const [code, setCode] = useState("");
  const [logs, setLogs] = useState([]);
  const [isExecuting, setIsExecuting] = useState(false);
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [authError, setAuthError] = useState('');

  const scrollRef = useRef(null);

  // Auto-scroll combat log
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getAuthHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });
  const addLog = (type, text) => setLogs(prev => [...prev, { type, text }]);

  // --- AUTHENTICATION LOGIC ---
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const endpoint = authMode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, authForm);
      if (authMode === 'REGISTER') {
        setAuthMode('LOGIN');
        setAuthError('Identity established. Please login.');
      } else {
        setToken(res.data.token);
        setUsername(res.data.username);
        localStorage.setItem('crawler_token', res.data.token);
        localStorage.setItem('crawler_user', res.data.username);
        setGameState('START');
      }
    } catch (err) {
      setAuthError(err.response?.data?.error || 'Auth system offline.');
    }
  };

  const logout = () => {
    localStorage.clear();
    setToken(null);
    setGameState('AUTH');
  };

  // --- GAMEPLAY ENGINE ---
  const startGame = async () => {
    setGameState('LOADING');
    setLogs([]);
    try {
      const res = await axios.post('http://localhost:5000/api/game/start', {}, getAuthHeaders());
      setRunId(res.data._id);
      setFloor(res.data.currentFloor);
      setHp(res.data.currentHP);
      await fetchEncounter(res.data._id);
    } catch (err) {
      logout();
    }
  };

  const fetchEncounter = async (currentRunId) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/game/${currentRunId}/encounter`, getAuthHeaders());
      setProblem(res.data.problem);
      setCode(res.data.problem.boilerplateCode);
      setGameState('PLAYING');
      addLog('system', `Encounter engaged: ${res.data.problem.title}`);
    } catch (err) {
      setGameState('START');
    }
  };

  const handleSubmit = async () => {
    if (!code || isExecuting) return;
    setIsExecuting(true);
    addLog('system', 'Compiling local source code...');

    try {
      const response = await axios.post('http://localhost:5000/api/execute', {
        runId, problemId: problem._id, code
      }, getAuthHeaders());

      const report = response.data;
      setHp(report.hpRemaining);

      if (report.status === 'VICTORY') {
        addLog('victory', report.message);
        setFloor(report.currentFloor);
        
        if (report.currentFloor > 3) {
          setTimeout(() => setGameState('GAME_WON'), 2000);
        } else {
          addLog('system', 'Proceeding to next floor...');
          setTimeout(() => {
            setGameState('LOADING');
            fetchEncounter(runId);
          }, 2000);
        }
      } else {
        addLog('damage', report.message);
        if (report.status === 'GAME_OVER') {
          setTimeout(() => setGameState('GAME_OVER'), 2000);
        }
      }
    } catch (err) {
      addLog('damage', 'Buffer overflow: Request failed.');
    } finally {
      setIsExecuting(false);
    }
  };

  // --- RENDER SCREENS ---
  if (gameState === 'AUTH') {
    return (
      <div className="battle-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <h1 className="blinking-cursor">ALGOCRAWLER_OS</h1>
        <form className="auth-form" onSubmit={handleAuthSubmit}>
          <input className="auth-input" placeholder="USERNAME" onChange={e => setAuthForm({...authForm, username: e.target.value})} />
          <input className="auth-input" type="password" placeholder="PASSWORD" onChange={e => setAuthForm({...authForm, password: e.target.value})} />
          {authError && <div className="auth-error">{authError}</div>}
          <button className="submit-btn">{authMode === 'LOGIN' ? 'LOGIN' : 'REGISTER'}</button>
        </form>
        <button className="text-btn" onClick={() => setAuthMode(authMode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}>
          {authMode === 'LOGIN' ? 'New Identity?' : 'Back to Login'}
        </button>
      </div>
    );
  }

  if (gameState === 'LOADING') {
    return (
      <div className="battle-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h2 className="animate-pulse">ESTABLISHING NEURAL LINK...</h2>
      </div>
    );
  }

  if (gameState === 'START') {
    return (
      <div className="battle-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 10 }}>
        <pre className="ascii-art" style={{fontSize: '10px'}}>{`
    ___    __             ______                     __          
   /   |  / /___ _____   / ____/________ __      __/ /__  _____
  / /| | / / __ \`/ __ \\ / /   / ___/ __ \`/ | /| / / / _ \\/ ___/
 / ___ |/ / /_/ / /_/ // /___/ /  / /_/ /| |/ |/ / /  __/ /    
/_/  |_/_/\\__, /\\____/ \\____/_/   \\__,_/ |__/|__/_/\\___/_/     
         /____/                                                
        `}</pre>
        <p style={{ zIndex: 10 }}>Welcome back, <span style={{color: 'var(--text-cyan)'}}>{username}</span></p>
        <button className="submit-btn blinking-cursor" onClick={startGame}>INITIALIZE RUN</button>
        <button className="text-btn" onClick={logout}>[LOGOUT]</button>
      </div>
    );
  }

  if (gameState === 'GAME_OVER' || gameState === 'GAME_WON') {
    const won = gameState === 'GAME_WON';
    return (
      <div className="battle-container" style={{ justifyContent: 'center', alignItems: 'center', flexDirection: 'column', zIndex: 10 }}>
        <h1 style={{ color: won ? 'var(--text-primary)' : 'var(--text-danger)', fontSize: '4rem', margin: '0 0 1rem 0', lineHeight: 1.2 }}>
          {won ? 'DUNGEON CLEARED' : 'SYSTEM FAILURE'}
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '2rem', marginTop: 0 }}>
          {won ? 'Algorithms optimized. Massive XP awarded.' : `You reached Floor ${floor}. Your XP has been saved.`}
        </p>
        <button className="submit-btn" onClick={() => setGameState('START')}>
          {won ? 'PLAY AGAIN' : 'REBOOT SEQUENCE'}
        </button>
      </div>
    );
  }

  // --- MAIN COMBAT LOOP ---
  return (
    <div className="battle-container">
      <div className="encounter-panel">
        <div className="hud">
          <div style={{ color: '#888', wordBreak: 'break-all' }}>
            USER: <span style={{ color: 'var(--text-cyan)' }}>{username}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>FLOOR: {floor}</span>
            <span style={{ color: hp <= 30 ? 'var(--text-danger)' : 'inherit' }}>HP: {hp}/100</span>
          </div>
        </div>
        
        <div className="monster-display">
          <pre className="ascii-art">{problem?.asciiArt.replace(/\\n/g, '\n').replace(/\\\\/g, '\\')}</pre>
        </div>
        
        <div className="problem-prompt">
          <h3 style={{ color: 'var(--text-cyan)' }}>{problem?.title}</h3>
          <p>{problem?.promptText}</p>
        </div>
      </div>

      <div className="editor-panel">
        <div className="action-bar">
          <span style={{ color: '#888' }}>target: algorithm.py</span>
          <button className="submit-btn" onClick={handleSubmit} disabled={isExecuting}>
            {isExecuting ? 'EXECUTING...' : 'SUBMIT'}
          </button>
        </div>
        
        <div style={{ flexGrow: 1, minHeight: 0, overflow: 'hidden' }}>
          <Editor 
            height="100%" 
            defaultLanguage="python" 
            theme="hc-black" 
            value={code} 
            onChange={setCode} 
            options={{ 
              fontSize: 16, 
              minimap: { enabled: false },
              lineNumbers: "on",
              renderLineHighlight: "none",
              hideCursorInOverviewRuler: true
            }} 
          />
        </div>
        
        <div className="combat-log" ref={scrollRef}>
          {logs.map((log, i) => <TypewriterLog key={i} {...log} />)}
        </div>
      </div>
    </div>
  );
}

export default App;