import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getStats, getLogs, getToday, postLog } from './api'
import Vitality from './Vitality'

const RANKS = ['E','D','C','B','A','S','National']
const RANK_COLORS = {E:'#8888aa',D:'#44bb88',C:'#4488ff',B:'#aa44ff',A:'#ff8800',S:'#ffdd00',National:'#ff2244'}
const RANK_XP = [0,300,800,1800,3500,6000,10000]

const PILLARS = [
  {id:'grind',label:'Grind',icon:'⚔️',color:'#4fc3f7',
    habits:[{key:'grind_tasks',label:'Tasks / Work done'},{key:'grind_learning',label:'Self-learning / Building'}]},
  {id:'vitality',label:'Vitality',icon:'💪',color:'#81c784',
    habits:[{key:'vitality_workout',label:'Workout done'}]},
  {id:'sense',label:'Sense',icon:'🧠',color:'#ce93d8',
    habits:[{key:'sense_thinking',label:'Deep thinking / Reading'},{key:'sense_planning',label:'Planning done'}]},
  {id:'shadow',label:'Shadow',icon:'🌙',color:'#ffb74d',
    habits:[{key:'shadow_time',label:'Football / Friends / Family / Me time'}]},
]

function getRank(xp) {
  let r = 0
  for(let i = RANK_XP.length-1; i >= 0; i--) { if(xp >= RANK_XP[i]){ r=i; break; } }
  return r
}

function getXPInfo(xp) {
  const ri = getRank(xp)
  if(ri >= RANK_XP.length-1) return {current:xp-RANK_XP[ri],needed:999,pct:100}
  const base = RANK_XP[ri], next = RANK_XP[ri+1]
  return {current:xp-base, needed:next-base, pct:Math.floor(((xp-base)/(next-base))*100)}
}

// ── Components ──────────────────────────────────────────

function RankCard({ stats }) {
  const xp = stats?.total_xp || 0
  const ri = getRank(xp)
  const rank = RANKS[ri]
  const color = RANK_COLORS[rank]
  const xpInfo = getXPInfo(xp)

  return (
    <div style={{border:`1px solid ${color}44`,background:`linear-gradient(135deg,${color}11,#0a0a1e)`,padding:'20px 24px',marginBottom:20,animation:'fadeIn 0.5s ease'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:10,color:'#555',letterSpacing:3}}>CURRENT RANK</div>
          <div style={{fontSize:52,fontWeight:'bold',color,lineHeight:1,marginTop:4,animation:'glow 2.5s ease-in-out infinite'}}>{rank}</div>
          {ri < RANKS.length-1 && <div style={{fontSize:10,color:'#444',marginTop:4}}>→ {RANKS[ri+1]} in {xpInfo.needed-xpInfo.current} XP</div>}
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:10,color:'#555',letterSpacing:3}}>TOTAL XP</div>
          <div style={{fontSize:28,color:'#dde',fontWeight:'bold'}}>{xp}</div>
          <div style={{fontSize:10,color:'#555',marginTop:4}}>🔥 {stats?.streak || 0} day streak</div>
        </div>
      </div>
      <div style={{marginTop:16}}>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:'#444',marginBottom:4}}>
          <span>XP TO NEXT RANK</span><span>{xpInfo.current}/{xpInfo.needed}</span>
        </div>
        <div style={{height:4,background:'#111',borderRadius:2}}>
          <div style={{height:'100%',borderRadius:2,background:`linear-gradient(90deg,${color}88,${color})`,width:`${xpInfo.pct}%`,transition:'width 1s ease',boxShadow:`0 0 8px ${color}66`}}/>
        </div>
      </div>
    </div>
  )
}

function StatBars({ stats }) {
  const bars = [
    {label:'GRIND',icon:'⚔️',color:'#4fc3f7',xp:stats?.grind_xp||0},
    {label:'VITALITY',icon:'💪',color:'#81c784',xp:stats?.vitality_xp||0},
    {label:'SENSE',icon:'🧠',color:'#ce93d8',xp:stats?.sense_xp||0},
    {label:'SHADOW',icon:'🌙',color:'#ffb74d',xp:stats?.shadow_xp||0},
  ]
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:20}}>
      {bars.map(b => {
        const lvl = Math.floor(b.xp/100)+1
        const pct = b.xp%100
        return (
          <div key={b.label} style={{border:`1px solid ${b.color}33`,background:`${b.color}08`,padding:'10px 12px'}}>
            <div style={{fontSize:11,marginBottom:4}}>{b.icon} <span style={{color:b.color,letterSpacing:1}}>{b.label}</span><span style={{float:'right',color:'#555',fontSize:9}}>LVL {lvl}</span></div>
            <div style={{height:2,background:'#111'}}><div style={{height:'100%',background:b.color,width:`${pct}%`,transition:'width 0.8s ease',boxShadow:`0 0 4px ${b.color}`}}/></div>
            <div style={{fontSize:8,color:'#444',marginTop:3}}>{b.xp} XP</div>
          </div>
        )
      })}
    </div>
  )
}

function TodayGate({ todayLog }) {
  const qc = useQueryClient()
  const [checked, setChecked] = useState({})
  const [journal, setJournal] = useState('')
  const [levelUp, setLevelUp] = useState(false)

  const allHabits = PILLARS.flatMap(p => p.habits)
  const checkedCount = Object.values(checked).filter(Boolean).length
  const cleared = checkedCount >= 4
  const submitted = !!todayLog

  const mutation = useMutation({
    mutationFn: postLog,
    onSuccess: () => {
      qc.invalidateQueries(['stats'])
      qc.invalidateQueries(['logs'])
      qc.invalidateQueries(['today'])
      setLevelUp(true)
      setTimeout(() => setLevelUp(false), 2500)
    }
  })

  const handleSubmit = () => {
    if(!journal.trim()) return
    const today = new Date().toISOString().slice(0,10)
    const payload = { log_date: today, journal, habits_checked:0, cleared:false, xp_earned:0, ...checked }
    mutation.mutate(payload)
  }

  const xpPreview = checkedCount*7 + (cleared?50:0)

  return (
    <div style={{animation:'fadeIn 0.3s ease'}}>
      {levelUp && (
        <div style={{position:'fixed',inset:0,zIndex:100,display:'flex',alignItems:'center',justifyContent:'center',background:'#000000cc',animation:'levelUp 2.5s forwards',pointerEvents:'none'}}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:14,letterSpacing:6,color:'#888',marginBottom:12}}>DUNGEON CLEARED</div>
            <div style={{fontSize:64,color:'#44ff88'}}>✦</div>
            <div style={{fontSize:11,color:'#44ff88',marginTop:12,letterSpacing:4}}>+{xpPreview} XP EARNED</div>
          </div>
        </div>
      )}

      <div style={{textAlign:'center',padding:'8px',marginBottom:16,fontSize:10,letterSpacing:3,
        color: submitted ? (todayLog.cleared?'#44ff88':'#ff4455') : cleared?'#44ff88':checkedCount>=2?'#ffaa44':'#ff4455',
        border:`1px solid ${submitted?(todayLog.cleared?'#44ff8844':'#ff445533'):cleared?'#44ff8844':'#ff445533'}`,
        background: submitted?(todayLog.cleared?'#44ff8808':'#ff445508'):cleared?'#44ff8808':'#ff445508'
      }}>
        {submitted
          ? (todayLog.cleared ? '✦ DUNGEON CLEARED' : '✦ DUNGEON FAILED')
          : `${checkedCount}/6 · ${cleared?'DUNGEON CLEARED':`${4-checkedCount} MORE TO CLEAR`}`}
      </div>

      {PILLARS.map(p => (
        <div key={p.id} style={{marginBottom:16}}>
          <div style={{fontSize:9,color:p.color,letterSpacing:3,marginBottom:6,paddingLeft:4}}>{p.icon} {p.label.toUpperCase()}</div>
          {p.habits.map(h => {
            const isChecked = submitted ? (todayLog[h.key]||false) : (checked[h.key]||false)
            return (
              <div key={h.key} onClick={() => !submitted && setChecked(prev => ({...prev,[h.key]:!prev[h.key]}))}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 10px',marginBottom:3,
                  border:`1px solid ${isChecked?p.color+'66':'#1a1a2e'}`,
                  background:isChecked?`${p.color}0d`:'transparent',
                  cursor:submitted?'default':'pointer',transition:'all 0.2s'}}>
                <div style={{width:14,height:14,border:`1px solid ${isChecked?p.color:'#333'}`,display:'flex',alignItems:'center',justifyContent:'center',background:isChecked?`${p.color}33`:'transparent',flexShrink:0,fontSize:9,color:p.color}}>
                  {isChecked?'✓':''}
                </div>
                <span style={{fontSize:11,color:isChecked?'#dde':'#555'}}>{h.label}</span>
              </div>
            )
          })}
        </div>
      ))}

      <div style={{marginTop:20}}>
        <div style={{fontSize:9,color:'#555',letterSpacing:3,marginBottom:8}}>◆ QUEST LOG — TODAY</div>
        {submitted
          ? <div style={{padding:'12px 14px',background:'#0a0a1a',border:'1px solid #1a1a2e',fontSize:11,color:'#889',lineHeight:1.7,whiteSpace:'pre-wrap'}}>{todayLog.journal}</div>
          : <textarea value={journal} onChange={e=>setJournal(e.target.value)}
              placeholder="Write your entry for today. No labels. Just the truth."
              style={{width:'100%',minHeight:100,background:'#0a0a1a',border:'1px solid #1a1a2e',color:'#aab',fontSize:11,padding:'12px 14px',lineHeight:1.7,boxSizing:'border-box'}}/>
        }
      </div>

      {!submitted && (
        <>
          <div style={{fontSize:9,color:'#444',textAlign:'center',margin:'10px 0',letterSpacing:2}}>
            {cleared ? `+${xpPreview} XP on clear (50 bonus)` : `+${xpPreview} XP · no clear bonus`}
          </div>
          <button onClick={handleSubmit} disabled={!journal.trim() || mutation.isPending}
            style={{width:'100%',padding:'12px',marginTop:8,
              background:cleared?'#44ff8822':'#0a0a1a',
              border:`1px solid ${cleared?'#44ff88':'#333'}`,
              color:cleared?'#44ff88':'#555',fontSize:10,letterSpacing:4,
              opacity:mutation.isPending?0.5:1,transition:'all 0.2s'}}>
            {mutation.isPending ? '◆ SUBMITTING...' : cleared ? '◆ GATE CLEAR — SUBMIT' : '◆ SUBMIT DAY'}
          </button>
          {mutation.isError && <div style={{color:'#ff4455',fontSize:9,textAlign:'center',marginTop:8}}>
            {mutation.error?.response?.data?.detail || 'Something went wrong'}
          </div>}
        </>
      )}
    </div>
  )
}

function QuestLog({ logs }) {
  if(!logs?.length) return <div style={{textAlign:'center',color:'#333',fontSize:11,padding:'40px 0',letterSpacing:2}}>NO ENTRIES YET</div>
  return (
    <div style={{animation:'fadeIn 0.3s ease'}}>
      {logs.map((log,i) => (
        <div key={i} style={{marginBottom:12,padding:'14px',border:`1px solid ${log.cleared?'#44ff8822':'#ff445522'}`,background:log.cleared?'#44ff8805':'#ff445505'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
            <span style={{fontSize:9,letterSpacing:3,color:log.cleared?'#44ff88':'#ff4455'}}>{log.cleared?'✦ CLEARED':'✦ FAILED'} · {log.habits_checked}/6</span>
            <span style={{fontSize:9,color:'#444'}}>+{log.xp_earned}xp · {log.log_date}</span>
          </div>
          <div style={{fontSize:11,color:'#778',lineHeight:1.6,whiteSpace:'pre-wrap'}}>{log.journal}</div>
        </div>
      ))}
    </div>
  )
}

// ── Main App ─────────────────────────────────────────────

export default function App() {
  const [tab, setTab] = useState('today')
  const { data:stats } = useQuery({queryKey:['stats'], queryFn:getStats})
  const { data:logs } = useQuery({queryKey:['logs'], queryFn:getLogs})
  const { data:todayLog } = useQuery({queryKey:['today'], queryFn:getToday})

  const rank = RANKS[getRank(stats?.total_xp||0)]
  const rankColor = RANK_COLORS[rank]

  return (
  <div style={{ minHeight: '100vh', background: '#060610', overflowX: 'hidden' }}>
    {/* Particles */}
    <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
      {[...Array(16)].map((_, i) => (
        <div key={i} style={{ position: 'absolute', width: 2, height: 2, borderRadius: '50%', background: rankColor, opacity: 0.3, left: `${(i * 17 + 13) % 100}%`, top: `${(i * 23 + 7) % 100}%`, animation: `pulse ${2 + i % 3}s ease-in-out infinite`, animationDelay: `${i % 3}s` }} />
      ))}
    </div>

    {/* Top Nav */}
    <div style={{ position: 'sticky', top: 0, zIndex: 10, background: '#060610ee', backdropFilter: 'blur(8px)', borderBottom: '1px solid #1a1a2e', display: 'flex', justifyContent: 'center', gap: 2, padding: '8px 16px' }}>
      {['hunter', 'vitality'].map(p => (
        <button key={p} onClick={() => setTab(p === 'hunter' ? 'today' : 'vitality')}
          style={{ padding: '6px 20px', fontSize: 8, letterSpacing: 4, background: (p === 'hunter' ? tab !== 'vitality' : tab === 'vitality') ? '#ffffff0f' : 'transparent', border: (p === 'hunter' ? tab !== 'vitality' : tab === 'vitality') ? `1px solid ${rankColor}55` : '1px solid #1a1a2a', color: (p === 'hunter' ? tab !== 'vitality' : tab === 'vitality') ? rankColor : '#333', fontFamily: 'inherit', transition: 'all 0.2s' }}>
          {p === 'hunter' ? '⚔️ HUNTER' : '💪 VITALITY'}
        </button>
      ))}
    </div>

    {tab === 'vitality'
      ? <Vitality />
      : (
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 480, margin: '0 auto', padding: '24px 16px 60px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 10, letterSpacing: 6, color: '#555', marginBottom: 6 }}>SYSTEM INTERFACE</div>
            <div style={{ fontSize: 13, letterSpacing: 4, fontWeight: 'bold', color: rankColor, animation: 'glow 2.5s ease-in-out infinite' }}>◆ HUNTER PROTOCOL ◆</div>
          </div>
          <RankCard stats={stats} />
          <StatBars stats={stats} />
          <div style={{ display: 'flex', gap: 2, marginBottom: 16 }}>
            {['today', 'log'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px 0', fontSize: 9, letterSpacing: 3, background: tab === t ? '#ffffff0f' : 'transparent', border: tab === t ? `1px solid ${rankColor}55` : '1px solid #222', color: tab === t ? rankColor : '#444' }}>
                {t === 'today' ? "TODAY'S GATE" : 'QUEST LOG'}
              </button>
            ))}
          </div>
          {tab === 'today' && <TodayGate todayLog={todayLog} />}
          {tab === 'log' && <QuestLog logs={logs} />}
        </div>
      )
    }
  </div>
)
}