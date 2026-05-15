import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Pill, 
  Sparkles, 
  BrainCircuit, 
  Terminal,
  Activity,
  History,
  Info
} from 'lucide-react'
import Layout from '../components/Layout'
import { advancedAPI } from '../services/api'
import toast from 'react-hot-toast'

const SUGGESTED = [
  "How is ROR calculated in signal detection?",
  "Analyze current FAERS signals for Warfarin",
  "Explain disproportionality in clinical reports",
  "What criteria defines a 'Serious' adverse event?",
  "Show signal momentum for recent FDA alerts",
]

function MessageBubble({ msg }) {
  const isUser = msg.role === 'user'
  
  return (
    <div className={`flex gap-4 animate-safemed-fadein ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Dynamic Avatar Node */}
      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg border transition-transform hover:scale-110
                       ${isUser 
                          ? 'bg-brand-blue border-brand-blue/30 text-white' 
                          : 'bg-white dark:bg-brand-navy border-black/5 dark:border-white/10 text-brand-blue dark:text-brand-cyan'}`}>
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Neural Logic Bubble */}
      <div className={`max-w-[85%] rounded-[1.5rem] px-6 py-4 shadow-xl border relative transition-all
                       ${isUser
                         ? 'bg-brand-blue text-white border-brand-blue/20 rounded-tr-sm'
                         : 'bg-white dark:bg-white/[0.03] border-black/5 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-tl-sm'
                       }`}>
        
        {/* Content Node */}
        <div className="space-y-2 text-[13px] leading-relaxed font-medium">
          {msg.content.split('\n').map((line, i) => {
            // Header Logic
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-sm font-black uppercase tracking-widest mt-4 mb-2 text-brand-blue dark:text-brand-cyan">{line.replace('### ', '')}</h3>
            }
            // Bold Logic
            if (line.includes('**')) {
                const parts = line.split('**');
                return (
                  <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                    {parts.map((part, index) => index % 2 === 1 ? <b key={index} className="font-black text-brand-blue dark:text-brand-cyan">{part}</b> : part)}
                  </p>
                )
            }
            // Bullet Logic
            if (line.startsWith('- ') || line.startsWith('• ')) {
              return (
                <div key={i} className="flex gap-3 mt-2 pl-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-blue dark:bg-brand-cyan mt-1.5 flex-shrink-0" />
                  <p className="font-semibold italic">{line.slice(2)}</p>
                </div>
              )
            }
            if (line.trim() === '') return <div key={i} className="h-2" />
            return <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
          })}
        </div>

        {msg.isLoading && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-black/5 dark:border-white/10">
            <Loader2 className="w-4 h-4 animate-spin text-brand-blue dark:text-brand-cyan" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-blue dark:text-brand-cyan animate-pulse">Synchronizing Neural Logic...</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ChatbotPage() {
  const location    = useLocation()
  const drugContext = location.state?.drugContext || null

  const [messages,  setMessages]  = useState([
    {
      role: 'assistant',
      content: drugContext
        ? `### PV ANALYST INITIALIZED\nI have established a contextual link with **${drugContext}**. I am now correlating FAERS signal vectors and ROR disproportionality data for this compound. How should we proceed with the safety audit?`
        : "### ANALYST STANDBY\nWelcome to the SafeMedAI Neural Intelligence Node. I am calibrated to assist with pharmacovigilance data interpretation, signal detection queries (ROR/FAERS), and clinical safety evidence synthesis. Provide a compound signature or query to begin analysis.",
    }
  ])
  const [input,     setInput]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const userText = (text || input).trim()
    if (!userText || loading) return

    setInput('')
    setLoading(true)

    const userMsg = { role: 'user', content: userText }
    setMessages(prev => [...prev, userMsg])

    const loadingMsg = { role: 'assistant', content: '', isLoading: true }
    setMessages(prev => [...prev, loadingMsg])

    try {
      const history = messages
        .filter(m => !m.isLoading)
        .map(m => ({ role: m.role, content: m.content }))

      const res = await advancedAPI.chat(userText, history, drugContext)

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', content: res.data.reply }
      ])
    } catch (err) {
      toast.error("Neural Node Connection Failure")
      setMessages(prev => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: "### SYSTEM OVERLOAD\nI have encountered an anomaly in the neural link. Please verify backend synchronization and clinical node integrity. (GOOGLE_API_KEY validation may be required)."
        }
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <Layout title="AI Clinical Intelligence Agent">
      <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-14rem)] animate-safemed-fadein">

        {/* Intelligence Link Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-black/5 dark:border-white/10 pb-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-brand-blue/10 border border-brand-blue/20 rounded-[1.5rem] flex items-center justify-center shadow-glow-blue/10">
              <BrainCircuit className="w-8 h-8 text-brand-blue" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                Neural <span className="text-brand-blue">PV Analyst</span> Node
              </h1>
              <div className="flex items-center gap-3 mt-3">
                 <div className="status-dot text-brand-emerald" />
                 <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Quantum Engine: Gemini 2.0 Flash</span>
              </div>
            </div>
          </div>
          
          {drugContext && (
            <div className="flex items-center gap-4 bg-brand-blue/10 border border-brand-blue/20 rounded-2xl px-6 py-3 shadow-lg group">
              <Pill className="w-5 h-5 text-brand-blue group-hover:rotate-12 transition-transform" />
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-brand-blue uppercase tracking-widest">Active Focus Context</span>
                 <span className="text-xs font-black text-slate-900 dark:text-white capitalize">{drugContext}</span>
              </div>
            </div>
          )}
        </div>

        {/* Surveillance Feed (Messages) */}
        <div className="flex-1 overflow-y-auto space-y-8 pr-6 mb-8 custom-scrollbar">
          {messages.map((msg, i) => (
            <MessageBubble key={i} msg={msg} />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Command Interface */}
        <div className="bg-white dark:bg-white/[0.03] border border-black/10 dark:border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-xl">
          
          {/* Intelligence Probes (Suggested Chips) */}
          <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
               <Sparkles className="w-3.5 h-3.5" />
               <span className="text-[9px] font-black uppercase tracking-widest">Suggested Probes:</span>
            </div>
            <div className="flex gap-3">
              {SUGGESTED.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  disabled={loading}
                  className="whitespace-nowrap text-[10px] font-black bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10
                             hover:border-brand-blue/40 hover:bg-brand-blue/5 dark:hover:bg-brand-blue/10
                             text-slate-600 dark:text-slate-400 hover:text-brand-blue transition-all px-4 py-2.5 rounded-xl uppercase tracking-widest"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1 relative group">
               <Terminal className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-brand-blue transition-colors" />
               <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder="EXECUTE CLINICAL QUERY OR SIGNAL ANALYSIS..."
                disabled={loading}
                className="w-full bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl
                           pl-16 pr-6 py-5 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs font-black
                           focus:outline-none focus:border-brand-blue/50 focus:bg-white dark:focus:bg-white/10
                           disabled:opacity-50 transition-all uppercase tracking-widest"
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-brand-blue hover:bg-brand-blue/90 disabled:opacity-50
                         text-white w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-xl shadow-brand-blue/20 active:scale-95 group"
            >
              {loading
                ? <Loader2 className="w-6 h-6 animate-spin" />
                : <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              }
            </button>
          </div>
          
          <div className="flex items-center justify-between mt-6 px-4">
             <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 opacity-50">
                   <History className="w-3.5 h-3.5" />
                   <span className="text-[9px] font-black uppercase tracking-widest">History Log Active</span>
                </div>
                <div className="flex items-center gap-2 opacity-50">
                   <Activity className="w-3.5 h-3.5" />
                   <span className="text-[9px] font-black uppercase tracking-widest">Neural Link SECURE</span>
                </div>
             </div>
             <div className="flex items-center gap-2 text-slate-400">
                <Info className="w-3 h-3" />
                <span className="text-[8px] font-black uppercase tracking-widest">Clinical Decision Support Node</span>
             </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
