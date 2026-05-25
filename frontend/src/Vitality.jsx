import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getFitnessLogs, getFitnessToday, postFitness } from './api'

const PROGRAM = {
  1:{label:"DAY A — PUSH STRENGTH",focus:"Chest · Shoulders · Triceps",color:"#f97316",icon:"🔥",sections:[
    {type:"warmup",label:"Warm-Up",duration:"5 min",color:"#facc15",exercises:[{name:"Arm Circles",reps:"20 each"},{name:"Shoulder Rolls",reps:"15 each"},{name:"Wrist Rolls",reps:"20 each"}]},
    {type:"strength",label:"Strength",duration:"20-25 min",color:"#f97316",exercises:[{name:"Push-Ups",sets:4,reps:"8-12",rest:"60s",note:"Control the descent"},{name:"Pike Push-Ups",sets:3,reps:"6-10",rest:"60s",note:"Shoulders forward"},{name:"Tricep Dips",sets:3,reps:"8-12",rest:"60s",note:"Elbows back"},{name:"Diamond Push-Ups",sets:3,reps:"6-10",rest:"60s",note:"Burnout"}]},
    {type:"flexibility",label:"Flexibility",duration:"5-8 min",color:"#38bdf8",exercises:[{name:"Chest Opener",reps:"45s"},{name:"Doorway Stretch",reps:"30s each"},{name:"Tricep Stretch",reps:"30s each"}]},
    {type:"breathing",label:"Breathing",duration:"3 min",color:"#a78bfa",exercises:[{name:"Box Breathing",reps:"5 rounds",note:"Inhale 4s · Hold 4s · Exhale 4s · Hold 4s"}]}
  ]},
  2:{label:"DAY B — PULL STRENGTH",focus:"Back · Biceps · Grip",color:"#22d3ee",icon:"⚡",sections:[
    {type:"warmup",label:"Warm-Up",duration:"5 min",color:"#facc15",exercises:[{name:"Scapular Retractions",reps:"15"},{name:"Band Pull-Aparts",reps:"15"},{name:"Cat-Cow",reps:"10 slow"}]},
    {type:"strength",label:"Strength",duration:"20-25 min",color:"#22d3ee",exercises:[{name:"Australian Pull-Ups",sets:4,reps:"8-12",rest:"60s",note:"Body straight"},{name:"Inverted Rows",sets:3,reps:"8-10",rest:"60s",note:"Chest to bar"},{name:"Towel Bicep Curls",sets:3,reps:"10-12",rest:"45s"},{name:"Dead Hang",sets:3,reps:"20-30s",rest:"60s",note:"Grip work"}]},
    {type:"flexibility",label:"Flexibility",duration:"5-8 min",color:"#38bdf8",exercises:[{name:"Child's Pose",reps:"45s"},{name:"Thread the Needle",reps:"30s each"},{name:"Lat Stretch",reps:"30s each"}]},
    {type:"breathing",label:"Breathing",duration:"3 min",color:"#a78bfa",exercises:[{name:"4-7-8 Breathing",reps:"4 rounds",note:"Inhale 4s · Hold 7s · Exhale 8s"}]}
  ]},
  3:{label:"DAY C — LEGS & CORE",focus:"Quads · Hamstrings · Abs",color:"#4ade80",icon:"💀",sections:[
    {type:"warmup",label:"Warm-Up",duration:"5 min",color:"#facc15",exercises:[{name:"Leg Swings",reps:"15 each"},{name:"Hip Circles",reps:"10 each"},{name:"Jumping Jacks",reps:"30s"}]},
    {type:"strength",label:"Strength",duration:"20-25 min",color:"#4ade80",exercises:[{name:"Bodyweight Squats",sets:4,reps:"15-20",rest:"45s",note:"Sit back"},{name:"Bulgarian Split Squats",sets:3,reps:"8-10 each",rest:"60s"},{name:"Glute Bridges",sets:3,reps:"15",rest:"45s"},{name:"Plank",sets:3,reps:"30-45s",rest:"45s"},{name:"Hollow Body Hold",sets:3,reps:"20-30s",rest:"45s"}]},
    {type:"flexibility",label:"Flexibility",duration:"5-8 min",color:"#38bdf8",exercises:[{name:"Quad Stretch",reps:"45s each"},{name:"Hamstring Stretch",reps:"45s each"},{name:"Pigeon Pose",reps:"45s each"}]},
    {type:"breathing",label:"Breathing",duration:"3 min",color:"#a78bfa",exercises:[{name:"Diaphragmatic Breathing",reps:"10 breaths",note:"Hand on belly"}]}
  ]},
  4:{label:"DAY D — FULL BODY + CARDIO",focus:"Endurance · Mobility · Flow",color:"#e879f9",icon:"🌊",sections:[
    {type:"warmup",label:"Warm-Up",duration:"5 min",color:"#facc15",exercises:[{name:"Inchworm",reps:"8 reps"},{name:"World's Greatest Stretch",reps:"5 each"}]},
    {type:"strength",label:"Cardio Circuit",duration:"15 min",color:"#e879f9",exercises:[{name:"Burpees",sets:3,reps:"8-10",rest:"30s"},{name:"Mountain Climbers",sets:3,reps:"20s",rest:"20s"},{name:"Jump Squats",sets:3,reps:"10",rest:"30s"},{name:"High Knees",sets:3,reps:"20s",rest:"20s"}]},
    {type:"flexibility",label:"Mobility Flow",duration:"10 min",color:"#38bdf8",exercises:[{name:"Deep Squat Hold",reps:"60s"},{name:"Thoracic Rotations",reps:"10 each"},{name:"Hip Flexor Stretch",reps:"45s each"},{name:"Spinal Twist",reps:"45s each"}]},
    {type:"breathing",label:"Breathing",duration:"5 min",color:"#a78bfa",exercises:[{name:"Wim Hof Round",reps:"1 round",note:"30 breaths → exhale hold → inhale hold 15s"},{name:"Recovery Breathing",reps:"5 min",note:"Slow nasal, eyes closed"}]}
  ]}
}

const SECTION_KEYS = ['warmup','strength','flexibility','breathing']

export default function Vitality() {
  const qc = useQueryClient()
  const [activeDay, setActiveDay] = useState(1)
  const [checked, setChecked] = useState({})
  const [expandedSection, setExpandedSection] = useState(null)
  const [flash, setFlash] = useState(false)

  const { data: todayLog } = useQuery({ queryKey: ['fitnessToday'], queryFn: getFitnessToday })
  const { data: logs } = useQuery({ queryKey: ['fitnessLogs'], queryFn: getFitnessLogs })
  const [tab, setTab] = useState('session')

  const submitted = !!todayLog

  const day = PROGRAM[activeDay]
  const allEx = day.sections.flatMap(s => s.exercises.map(e => `${s.type}::${e.name}`))
  const checkedCount = Object.values(checked).filter(Boolean).length
  const pct = Math.round((checkedCount / allEx.length) * 100)

  const sectionDone = (type) => {
    const sec = day.sections.find(s => s.type === type)
    if (!sec) return false
    return sec.exercises.every(e => checked[`${type}::${e.name}`])
  }

  const mutation = useMutation({
    mutationFn: postFitness,
    onSuccess: () => {
      qc.invalidateQueries(['fitnessToday'])
      qc.invalidateQueries(['fitnessLogs'])
      setFlash(true)
      setTimeout(() => setFlash(false), 2000)
    }
  })

  const handleSubmit = () => {
    const today = new Date().toISOString().slice(0, 10)
    mutation.mutate({
      log_date: today,
      day_number: activeDay,
      pct_completed: pct,
      warmup_done: sectionDone('warmup'),
      strength_done: sectionDone('strength'),
      flexibility_done: sectionDone('flexibility'),
      breathing_done: sectionDone('breathing'),
    })
  }

  const toggle = (key) => { if (submitted) return; setChecked(p => ({ ...p, [key]: !p[key] })) }

  const weekLogs = (logs || []).slice(0, 7)

  return (
    <div style={{ minHeight: '100vh', background: '#05080f', fontFamily: 'Georgia, serif', color: '#ccd' }}>
      {flash && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000000cc', pointerEvents: 'none' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 56 }}>{day.icon}</div>
            <div style={{ fontSize: 11, letterSpacing: 5, color: day.color, marginTop: 12 }}>SESSION COMPLETE</div>
            <div style={{ fontSize: 9, color: '#555', marginTop: 6, letterSpacing: 3 }}>{pct}% EXECUTED</div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 9, letterSpacing: 5, color: '#333', marginBottom: 4 }}>VITALITY SYSTEM</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ fontSize: 20, letterSpacing: 2, color: '#dde', fontStyle: 'italic' }}>Body Protocol</div>
            <div style={{ fontSize: 9, color: '#444', letterSpacing: 2 }}>{new Date().toISOString().slice(0, 10)}</div>
          </div>
          <div style={{ height: 1, background: 'linear-gradient(90deg,#333,transparent)', marginTop: 12 }} />
        </div>

        {/* Week bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20, alignItems: 'center' }}>
          <span style={{ fontSize: 8, color: '#333', letterSpacing: 3, marginRight: 4 }}>WEEK</span>
          {[1, 2, 3, 4].map(d => {
            const logged = weekLogs.find(l => l.day_number === d)
            return <div key={d} style={{ flex: 1, height: 3, borderRadius: 1, background: logged ? PROGRAM[d].color : '#1a1a2a', boxShadow: logged ? `0 0 6px ${PROGRAM[d].color}66` : 'none', transition: 'all 0.3s' }} />
          })}
          <span style={{ fontSize: 8, color: '#444', marginLeft: 4 }}>{weekLogs.filter(l => [1,2,3,4].includes(l.day_number)).length}/4</span>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20 }}>
          {['session', 'history'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: '8px', fontSize: 8, letterSpacing: 4, background: tab === t ? '#ffffff08' : 'transparent', border: tab === t ? `1px solid ${day.color}55` : '1px solid #1a1a2a', color: tab === t ? day.color : '#333', fontFamily: 'inherit', transition: 'all 0.2s' }}>
              {t === 'session' ? "TODAY'S SESSION" : 'HISTORY'}
            </button>
          ))}
        </div>

        {tab === 'session' && <>
          {/* Day selector */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6, marginBottom: 20 }}>
            {[1, 2, 3, 4].map(d => {
              const isA = activeDay === d
              const c = PROGRAM[d].color
              const logged = weekLogs.find(l => l.day_number === d)
              return (
                <button key={d} onClick={() => { if (!submitted) { setActiveDay(d); setChecked({}) } }}
                  style={{ padding: '10px 6px', border: `1px solid ${isA ? c : '#1a1a2a'}`, background: isA ? `${c}15` : 'transparent', color: isA ? c : '#333', cursor: submitted ? 'default' : 'pointer', fontFamily: 'inherit', fontSize: 8, letterSpacing: 2, transition: 'all 0.2s', opacity: submitted && !isA ? 0.4 : 1, position: 'relative' }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{PROGRAM[d].icon}</div>
                  <div>DAY {d}</div>
                  {logged && <div style={{ position: 'absolute', top: 4, right: 4, width: 4, height: 4, borderRadius: '50%', background: c }} />}
                </button>
              )
            })}
          </div>

          {/* Day header + progress */}
          <div style={{ padding: '16px', marginBottom: 16, border: `1px solid ${day.color}33`, background: `linear-gradient(135deg,${day.color}0d,transparent)` }}>
            <div style={{ fontSize: 10, color: day.color, letterSpacing: 3 }}>{day.label}</div>
            <div style={{ fontSize: 12, color: '#667', marginTop: 4, fontStyle: 'italic' }}>{day.focus}</div>
            <div style={{ marginTop: 12, height: 2, background: '#0a0a1a', borderRadius: 1 }}>
              <div style={{ height: '100%', borderRadius: 1, transition: 'width 0.6s ease', background: `linear-gradient(90deg,${day.color}88,${day.color})`, width: `${submitted ? (todayLog?.pct_completed || 0) : pct}%`, boxShadow: `0 0 8px ${day.color}55` }} />
            </div>
            <div style={{ fontSize: 8, color: '#444', marginTop: 6, letterSpacing: 2 }}>
              {submitted ? `${todayLog?.pct_completed}% COMPLETED` : `${checkedCount}/${allEx.length} DONE · ${pct}%`}
              {submitted && <span style={{ color: day.color, marginLeft: 8 }}>✓ LOGGED</span>}
            </div>
          </div>

          {/* Sections */}
          {day.sections.map((section, si) => {
            const isOpen = expandedSection === si || expandedSection === null
            const secChecked = section.exercises.filter(e => checked[`${section.type}::${e.name}`]).length
            const secDoneFromDB = submitted && todayLog?.[`${section.type}_done`]
            return (
              <div key={si} style={{ marginBottom: 12 }}>
                <div onClick={() => setExpandedSection(isOpen && expandedSection === si ? null : si)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', cursor: 'pointer', background: '#0a0a1a', border: `1px solid ${section.color}33`, borderBottom: isOpen ? 'none' : `1px solid ${section.color}33` }}>
                  <div>
                    <div style={{ fontSize: 9, color: secDoneFromDB ? section.color : section.color + '88', letterSpacing: 3 }}>{section.label.toUpperCase()}</div>
                    <div style={{ fontSize: 8, color: '#444', marginTop: 1 }}>{section.duration}</div>
                  </div>
                  <div style={{ fontSize: 9, color: '#333' }}>
                    {submitted ? (secDoneFromDB ? '✓' : '—') : `${secChecked}/${section.exercises.length}`}
                  </div>
                </div>
                {isOpen && (
                  <div style={{ border: `1px solid ${section.color}22`, borderTop: 'none' }}>
                    {section.exercises.map((ex, ei) => {
                      const key = `${section.type}::${ex.name}`
                      const done = submitted ? secDoneFromDB : (checked[key] || false)
                      return (
                        <div key={ei} onClick={() => toggle(key)}
                          style={{ padding: '12px 14px', cursor: submitted ? 'default' : 'pointer', background: done ? `${section.color}08` : 'transparent', borderBottom: ei < section.exercises.length - 1 ? '1px solid #0f0f1a' : 'none', display: 'flex', gap: 12, alignItems: 'flex-start', transition: 'background 0.2s' }}>
                          <div style={{ width: 16, height: 16, border: `1px solid ${done ? section.color : '#222'}`, background: done ? `${section.color}33` : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: section.color, flexShrink: 0, marginTop: 1 }}>{done ? '✓' : ''}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontSize: 12, color: done ? '#dde' : '#667', transition: 'color 0.2s' }}>{ex.name}</span>
                              <span style={{ fontSize: 8, color: ex.sets ? section.color : '#445', letterSpacing: 1 }}>{ex.sets ? `${ex.sets}×${ex.reps}` : ex.reps}</span>
                            </div>
                            {(ex.rest || ex.note) && (
                              <div style={{ display: 'flex', gap: 12, marginTop: 3 }}>
                                {ex.rest && <span style={{ fontSize: 8, color: '#334' }}>rest {ex.rest}</span>}
                                {ex.note && <span style={{ fontSize: 8, color: '#445', fontStyle: 'italic' }}>{ex.note}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {!submitted ? (
            <button onClick={handleSubmit} disabled={mutation.isPending}
              style={{ width: '100%', marginTop: 16, padding: '14px', background: pct === 100 ? `${day.color}22` : '#0a0a1a', border: `1px solid ${pct > 50 ? day.color + '88' : '#222'}`, color: pct > 50 ? day.color : '#444', fontFamily: 'inherit', fontSize: 9, letterSpacing: 4, cursor: 'pointer', transition: 'all 0.3s', opacity: mutation.isPending ? 0.5 : 1 }}>
              {mutation.isPending ? 'LOGGING...' : pct === 100 ? `${day.icon} SESSION COMPLETE — LOG IT` : `LOG SESSION · ${pct}% DONE`}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px', marginTop: 16, border: `1px solid ${day.color}44`, color: day.color, fontSize: 9, letterSpacing: 4 }}>
              ✦ SESSION LOGGED — {todayLog?.pct_completed}% EXECUTED
            </div>
          )}
        </>}

        {tab === 'history' && (
          <div>
            {!logs?.length
              ? <div style={{ textAlign: 'center', color: '#222', fontSize: 11, padding: '48px 0', letterSpacing: 3 }}>NO SESSIONS YET</div>
              : logs.map((log, i) => {
                const d = PROGRAM[log.day_number]
                return (
                  <div key={i} style={{ marginBottom: 10, padding: '14px', border: `1px solid ${d.color}22`, background: `${d.color}05` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 9, color: d.color, letterSpacing: 2 }}>{d.icon} {d.label}</span>
                      <span style={{ fontSize: 8, color: '#444' }}>{log.log_date}</span>
                    </div>
                    <div style={{ height: 2, background: '#0a0a1a', borderRadius: 1, marginBottom: 6 }}>
                      <div style={{ height: '100%', background: d.color, width: `${log.pct_completed}%`, borderRadius: 1 }} />
                    </div>
                    <div style={{ fontSize: 8, color: '#445', letterSpacing: 2 }}>{log.pct_completed}% COMPLETED</div>
                  </div>
                )
              })
            }
          </div>
        )}
      </div>
    </div>
  )
}