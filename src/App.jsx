import { useState, useEffect, useRef } from "react";
import { Analytics } from "@vercel/analytics/react";

// ── Soft palette ────────────────────────────────────────────────────────────
const P = {
  cocoa:     "#4B342C",
  cocoaSoft: "#6B4F46",
  peach:     "#EFB39C",
  dream:     "#F59A7C",
  nude:      "#EAC8BE",
  mist:      "#E8D0B4",
  ivory:     "#FAF7F5",
  cream:     "#FDF5F0",
  teal:      "#85C9C9",   tealBg:  "#EFF8F8",
  gold:      "#F0C96A",   goldBg:  "#FDF8EC",
  lav:       "#C8B8E8",   lavBg:   "#F5F2FB",
  coral:     "#E8947A",   coralBg: "#FDF2EE",
  sage:      "#A8C5A0",   sageBg:  "#F0F6EF",
  white:     "#ffffff",
  dark:      "#2A1F1B",
};

const TABS = [
  { id:"planner", label:"📅 Daily Planner",          accent: P.teal,  bg: P.tealBg  },
  { id:"journal", label:"📓 Routine Journal",         accent: P.lav,   bg: P.lavBg   },
  { id:"exec",    label:"🧩 Exec Function",            accent: P.gold,  bg: P.goldBg  },
  { id:"focus",   label:"🍅 Focus Tracker",            accent: P.coral, bg: P.coralBg },
  { id:"rewards", label:"⭐ Reward System",            accent: P.dream, bg: P.cream   },
];

// ── Design tokens ────────────────────────────────────────────────────────────
const style = {
  card: (accent=P.nude) => ({
    background: P.white,
    borderRadius: 10,
    border: `1px solid ${P.mist}`,
    borderLeft: `4px solid ${accent}`,
    padding: "16px 18px",
    marginBottom: 14,
    boxShadow: "0 1px 6px rgba(75,52,44,.06)",
  }),
  sectionHead: (bg=P.cocoa, color=P.white) => ({
    background: bg, color,
    fontWeight: 800, fontSize: 12, letterSpacing: .8,
    padding: "7px 14px", borderRadius: 6, marginBottom: 12,
    display: "flex", alignItems: "center", gap: 8,
  }),
  label: (size=11) => ({
    fontSize: size, fontWeight: 700, color: P.cocoaSoft,
    letterSpacing: .4, marginBottom: 4, display: "block",
  }),
  input: {
    width: "100%", border: `1.5px solid ${P.mist}`, borderRadius: 6,
    padding: "7px 10px", fontSize: 13, color: P.dark,
    background: P.ivory, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%", border: `1.5px solid ${P.mist}`, borderRadius: 6,
    padding: "8px 10px", fontSize: 13, color: P.dark,
    background: P.ivory, outline: "none", fontFamily: "inherit",
    resize: "vertical", boxSizing: "border-box",
  },
  pill: (active, color) => ({
    padding: "4px 12px", borderRadius: 20, border: `1.5px solid ${color}`,
    background: active ? color : "transparent",
    color: active ? (color===P.gold ? P.cocoa : P.white) : P.cocoaSoft,
    fontWeight: 700, fontSize: 11, cursor: "pointer", transition: "all .15s",
    fontFamily: "inherit",
  }),
  row: (even) => ({
    background: even ? P.cream : P.white,
    borderBottom: `1px solid ${P.mist}`,
    display: "flex", alignItems: "center",
  }),
  tag: (color) => ({
    background: color, color: color===P.gold ? P.cocoa : P.white,
    fontSize: 10, fontWeight: 800, borderRadius: 10,
    padding: "2px 8px", whiteSpace: "nowrap",
  }),
};

// ── Shared components ────────────────────────────────────────────────────────
const Card = ({ children, accent=P.nude, style:s={} }) => (
  <div style={{...style.card(accent),...s}}>{children}</div>
);

const SHead = ({ children, bg=P.cocoa, color=P.white }) => (
  <div style={style.sectionHead(bg, color)}>{children}</div>
);

const Lbl = ({ children, size=11 }) => (
  <span style={style.label(size)}>{children}</span>
);

const Input = ({ value, onChange, placeholder, style:s={} }) => (
  <input value={value} onChange={onChange} placeholder={placeholder}
    style={{...style.input,...s}} />
);

const Textarea = ({ value, onChange, placeholder, rows=3 }) => (
  <textarea value={value} onChange={onChange} placeholder={placeholder}
    rows={rows} style={style.textarea} />
);

const Check = ({ checked, onChange, label:lbl, color=P.teal }) => (
  <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer",
    padding:"6px 8px", borderRadius:6,
    background: checked ? color+"18" : "transparent", transition:"background .12s",
    marginBottom:2, userSelect:"none" }}>
    <div onClick={onChange} style={{
      width:18, height:18, borderRadius:4, border:`2px solid ${color}`,
      background: checked ? color : P.white, flexShrink:0, marginTop:1,
      display:"flex", alignItems:"center", justifyContent:"center", transition:"all .12s",
    }}>
      {checked && <svg width="10" height="8" viewBox="0 0 10 8">
        <polyline points="1,4 4,7 9,1" stroke={color===P.gold?P.cocoa:P.white}
          strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>}
    </div>
    <span style={{ fontSize:13, color:P.dark,
      textDecoration: checked?"line-through":"none", opacity:checked?.55:1, lineHeight:1.4 }}>
      {lbl}
    </span>
  </label>
);

const Pill = ({ label:lbl, active, onClick, color }) => (
  <button onClick={onClick} style={style.pill(active,color)}>{lbl}</button>
);

const Tag = ({ children, color }) => (
  <span style={style.tag(color)}>{children}</span>
);

const FieldRow = ({ label:lbl, children, style:s={} }) => (
  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10, ...s }}>
    {lbl && <span style={{ fontSize:11, fontWeight:700, color:P.cocoaSoft, whiteSpace:"nowrap", minWidth:0 }}>{lbl}</span>}
    {children}
  </div>
);

const Table = ({ cols, rows, accent=P.teal, renderRow }) => (
  <div style={{ overflowX:"auto", borderRadius:8, border:`1px solid ${P.mist}`, marginBottom:12 }}>
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
      <thead>
        <tr style={{ background:accent }}>
          {cols.map((col,i)=>(
            <th key={i} style={{ padding:"8px 10px", color:col.hColor||(accent===P.gold?P.cocoa:P.white),
              fontWeight:800, textAlign:"left", whiteSpace:"nowrap",
              width:col.width||"auto", fontSize:11 }}>{col.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row,i)=>(
          <tr key={i} style={{ background:i%2===0?P.cream:P.white, borderBottom:`1px solid ${P.mist}` }}>
            {renderRow(row,i)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. DAILY PLANNER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const HOURS = [
  "6:00 AM","7:00 AM","8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
  "6:00 PM","7:00 PM","8:00 PM","9:00 PM",
];
const MOODS = [["😴","Tired"],["😤","Frustrated"],["😊","Good"],["🔥","On Fire"],["😰","Anxious"]];

function DailyPlanner() {
  const today = new Date().toLocaleDateString("en-US",
    { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const [name, setName] = useState("");
  const [mood, setMood] = useState(null);
  const [priorities, setPriorities] = useState([
    {text:"",time:"",done:false},{text:"",time:"",done:false},{text:"",time:"",done:false}
  ]);
  const [schedule, setSchedule] = useState({});
  const [brainDump, setBrainDump] = useState("");
  const [win, setWin] = useState("");
  const [tomorrow, setTomorrow] = useState("");
  const [notes, setNotes] = useState("");

  const setP = (i, key, val) => {
    const n=[...priorities]; n[i]={...n[i],[key]:val}; setPriorities(n);
  };
  const completed = priorities.filter(p=>p.done).length;

  return (
    <div>
      {/* Header fields */}
      <Card accent={P.teal}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr auto 1fr", gap:16, alignItems:"end", marginBottom:14 }}>
          <div>
            <Lbl>DATE</Lbl>
            <div style={{ fontSize:15, fontWeight:800, color:P.cocoa }}>{today}</div>
          </div>
          <div>
            <Lbl>MOOD CHECK-IN</Lbl>
            <div style={{ display:"flex", gap:6 }}>
              {MOODS.map(([em,lbl])=>(
                <button key={lbl} onClick={()=>setMood(lbl)} title={lbl} style={{
                  fontSize:20, background:mood===lbl?P.tealBg:P.cream,
                  border:`2px solid ${mood===lbl?P.teal:P.mist}`,
                  borderRadius:8, padding:"4px 6px", cursor:"pointer",
                }}>{em}</button>
              ))}
            </div>
            {mood && <div style={{ fontSize:10, color:P.teal, marginTop:3, fontWeight:700 }}>Feeling {mood} ✓</div>}
          </div>
          <div>
            <Lbl>YOUR NAME</Lbl>
            <Input value={name} onChange={e=>setName(e.target.value)} placeholder="Write your name..." />
          </div>
        </div>
      </Card>

      {/* Top 3 Priorities */}
      <Card accent={P.gold}>
        <SHead bg={P.cocoa}>★ TODAY'S TOP 3 PRIORITIES</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 90px 36px", gap:8,
          alignItems:"center", marginBottom:6, paddingRight:4 }}>
          <div/>
          <Lbl>TASK / GOAL</Lbl>
          <Lbl>TIME (min)</Lbl>
          <Lbl>✓</Lbl>
        </div>
        {priorities.map((p,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 1fr 90px 36px",
            gap:8, alignItems:"center", marginBottom:8, paddingRight:4 }}>
            <div style={{
              width:28, height:28, borderRadius:"50%",
              background:i===0?P.gold:P.nude, display:"flex", alignItems:"center",
              justifyContent:"center", fontWeight:900, fontSize:13,
              color:P.cocoa, flexShrink:0,
            }}>{i+1}</div>
            <Input value={p.text} onChange={e=>setP(i,"text",e.target.value)}
              placeholder={i===0?"Most important task today...":"Next priority..."} />
            <Input value={p.time} onChange={e=>setP(i,"time",e.target.value)}
              placeholder="e.g. 30" style={{ textAlign:"center" }} />
            <div style={{ display:"flex", justifyContent:"center" }}>
              <Check checked={p.done} onChange={()=>setP(i,"done",!p.done)} label="" color={P.gold} />
            </div>
          </div>
        ))}
        <div style={{ fontSize:11, color:P.cocoaSoft, marginTop:4 }}>
          Progress: <strong>{completed}/3</strong> priorities complete
          {completed===3 && <Tag color={P.gold}> 🏆 All done!</Tag>}
        </div>
      </Card>

      {/* Hourly Schedule */}
      <Card accent={P.teal}>
        <SHead bg={P.teal}>🕐 HOURLY SCHEDULE</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4px 20px" }}>
          {HOURS.map(hr=>(
            <div key={hr} style={{ display:"flex", alignItems:"center", gap:8,
              padding:"3px 0", borderBottom:`1px solid ${P.mist}` }}>
              <span style={{ fontSize:11, fontWeight:800, color:P.teal,
                minWidth:54, flexShrink:0 }}>{hr}</span>
              <input value={schedule[hr]||""} onChange={e=>setSchedule({...schedule,[hr]:e.target.value})}
                placeholder="—" style={{ ...style.input, height:28, fontSize:12, flex:1,
                  border:"none", background:"transparent", padding:"0 4px",
                  borderBottom:`1.5px solid ${P.mist}`, borderRadius:0 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Brain Dump */}
      <Card accent={P.lav} style={{ background:P.lavBg }}>
        <SHead bg={P.lav}>🧠 BRAIN DUMP — Capture everything. Don't organize, just release.</SHead>
        <Textarea value={brainDump} onChange={e=>setBrainDump(e.target.value)}
          placeholder="Every thought, worry, task, idea... dump it all here. Clear your mental cache."
          rows={5} />
      </Card>

      {/* Win + Tomorrow */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        <Card accent={P.coral} style={{ marginBottom:0 }}>
          <SHead bg={P.coral}>⚡ WIN OF THE DAY</SHead>
          <Textarea value={win} onChange={e=>setWin(e.target.value)}
            placeholder="What's something that went well? Celebrate it — even the small stuff." rows={3} />
        </Card>
        <Card accent={P.sage} style={{ marginBottom:0 }}>
          <SHead bg={P.sage}>🌅 TOMORROW'S MUST-DO</SHead>
          <Textarea value={tomorrow} onChange={e=>setTomorrow(e.target.value)}
            placeholder="The ONE thing you cannot skip tomorrow. Write it now." rows={3} />
        </Card>
      </div>

      {/* Notes */}
      <Card accent={P.mist}>
        <Lbl>NOTES / REMINDERS</Lbl>
        <Textarea value={notes} onChange={e=>setNotes(e.target.value)}
          placeholder="Anything else on your mind — ideas, reminders, random thoughts..." rows={3} />
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. ROUTINE JOURNAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const MORNING = [
  "Wake up — no snooze","Drink 16 oz water","Take meds / supplements",
  "Wash face & brush teeth","Get dressed","Eat a real breakfast",
  "Review today's top 3 priorities","5-min affirmation or breathwork",
  "Check calendar & schedule",
];
const EVENING = [
  "Wrap up open tasks","Write tomorrow's top 3","Prepare bag & lay out clothes",
  "Tidy workspace (5 minutes)","Gratitude — write 3 things","Screen-free wind-down begins",
  "Skincare & hygiene routine","Read or journal","Lights out by your goal time",
];
const HABIT_LIST = [
  "💊 Meds / Supplements","💧 Water (8+ cups)","🏃 Movement / Exercise",
  "📋 Planned my day","📵 No doom scroll before noon","🛌 In bed by goal time",
  "🥗 Ate a real meal","🧘 Mindfulness / Breathwork","⭐ Custom Habit:_________",
];
const WDAYS = ["MON","TUE","WED","THU","FRI","SAT","SUN"];

function RoutineJournal() {
  const [intention, setIntention] = useState("");
  const [weekNum, setWeekNum] = useState("");
  const [morn, setMorn] = useState(MORNING.map(()=>false));
  const [eve, setEve] = useState(EVENING.map(()=>false));
  const [habits, setHabits] = useState(HABIT_LIST.map(()=>WDAYS.map(()=>false)));
  const [refl, setRefl] = useState({well:"",hard:"",diff:"",gratitude:""});

  const tog = (arr,setArr,i) => { const n=[...arr]; n[i]=!n[i]; setArr(n); };
  const togHabit = (hi,di) => {
    const n=habits.map((row,r)=>r===hi?row.map((v,c)=>c===di?!v:v):row);
    setHabits(n);
  };
  const pct = (arr) => Math.round(arr.filter(Boolean).length/arr.length*100);

  return (
    <div>
      {/* Top fields */}
      <Card accent={P.lav}>
        <div style={{ display:"grid", gridTemplateColumns:"auto auto 1fr", gap:16, alignItems:"end" }}>
          <div><Lbl>DATE</Lbl>
            <Input value="" onChange={()=>{}} placeholder={new Date().toLocaleDateString()} style={{ width:130 }} /></div>
          <div><Lbl>WEEK #</Lbl>
            <Input value={weekNum} onChange={e=>setWeekNum(e.target.value)} placeholder="e.g. 12" style={{ width:70 }} /></div>
          <div><Lbl>INTENTION FOR TODAY</Lbl>
            <Input value={intention} onChange={e=>setIntention(e.target.value)}
              placeholder="My intention is to..." /></div>
        </div>
      </Card>

      {/* Morning + Evening side by side */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
        {[
          ["☀️ MORNING ROUTINE", MORNING, morn, setMorn, P.gold, P.goldBg],
          ["🌙 EVENING ROUTINE", EVENING, eve, setEve, P.lav, P.lavBg],
        ].map(([title, items, state, setState, accent, bg])=>(
          <Card key={title} accent={accent} style={{ marginBottom:0, background:bg }}>
            <SHead bg={accent} color={accent===P.gold?P.cocoa:P.white}>{title}</SHead>
            {items.map((item,i)=>(
              <Check key={i} checked={state[i]} onChange={()=>tog(state,setState,i)}
                label={item} color={accent} />
            ))}
            <div style={{ marginTop:10, padding:"6px 10px", borderRadius:6,
              background:accent+"22", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:700, color:P.cocoaSoft }}>
                {state.filter(Boolean).length}/{items.length} complete
              </span>
              <div style={{ background:accent, borderRadius:10, padding:"2px 10px",
                fontSize:11, fontWeight:800, color:accent===P.gold?P.cocoa:P.white }}>
                {pct(state)}%
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Habit Tracker */}
      <Card accent={P.cocoa}>
        <SHead bg={P.cocoa}>📊 WEEKLY HABIT TRACKER</SHead>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ borderBottom:`2px solid ${P.mist}` }}>
                <th style={{ textAlign:"left", padding:"8px 12px", fontSize:12,
                  fontWeight:800, color:P.cocoa, minWidth:200 }}>HABIT</th>
                {WDAYS.map((d,i)=>(
                  <th key={d} style={{ padding:"8px 10px", textAlign:"center", fontWeight:800,
                    color:P.white, background:i<5?P.teal:P.coral,
                    fontSize:11, minWidth:40 }}>{d}</th>
                ))}
                <th style={{ padding:"8px 10px", textAlign:"center", background:P.gold,
                  fontWeight:800, color:P.cocoa, fontSize:12 }}>🔥</th>
              </tr>
            </thead>
            <tbody>
              {HABIT_LIST.map((habit,hi)=>(
                <tr key={hi} style={{ background:hi%2===0?P.cream:P.white,
                  borderBottom:`1px solid ${P.mist}` }}>
                  <td style={{ padding:"9px 12px", color:P.dark, fontSize:13 }}>{habit}</td>
                  {WDAYS.map((_,di)=>(
                    <td key={di} style={{ textAlign:"center", padding:"6px 10px" }}>
                      <button onClick={()=>togHabit(hi,di)} style={{
                        width:26, height:26, borderRadius:"50%",
                        background:habits[hi][di]?(di<5?P.teal:P.coral):P.white,
                        border:`2px solid ${habits[hi][di]?(di<5?P.teal:P.coral):P.mist}`,
                        cursor:"pointer", fontSize:12, transition:"all .12s",
                        display:"flex", alignItems:"center", justifyContent:"center", margin:"auto",
                      }}>{habits[hi][di]&&<svg width="10" height="8" viewBox="0 0 10 8">
                        <polyline points="1,4 4,7 9,1" stroke={P.white}
                          strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}</button>
                    </td>
                  ))}
                  <td style={{ textAlign:"center", padding:6 }}>
                    <span style={{ background:P.gold, color:P.cocoa, borderRadius:10,
                      padding:"3px 8px", fontSize:12, fontWeight:900 }}>
                      {habits[hi].filter(Boolean).length}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Reflection */}
      <Card accent={P.dream} style={{ background:P.coralBg }}>
        <SHead bg={P.dream}>✨ DAILY REFLECTION</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {[
            ["well","🌟 What went WELL today?","Celebrate even the small wins..."],
            ["hard","💪 What was HARD? (no judgment)","Be honest with yourself..."],
            ["diff","🔄 What will I do DIFFERENTLY?","One small adjustment..."],
            ["gratitude","🙏 3 Things I'm GRATEFUL for","What are you thankful for?"],
          ].map(([key,lbl,ph])=>(
            <div key={key}>
              <Lbl>{lbl}</Lbl>
              <Textarea value={refl[key]} onChange={e=>setRefl({...refl,[key]:e.target.value})}
                placeholder={ph} rows={3} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. EXECUTIVE FUNCTION WORKBOOK
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const STEP_HINTS = [
  "Step 1: Start here — 5 minutes or less. Make it impossible to fail.",
  "Step 2: What logically comes after Step 1?",
  "Step 3: Keep the momentum going...",
  "Step 4: You're halfway there!",
  "Step 5: Almost at the finish line...",
  "Step 6: Final step — declare it done!",
];
const STEP_COLORS = [P.gold, P.teal, P.teal, P.sage, P.sage, P.coral];
const BODY_OPTS = ["Energized 🔋","Tired 😴","Wired ⚡","Calm 😌","Anxious 😰","Overwhelmed 🌊"];
const DIST_OPTS = ["Very Low 🟢","Low 🟡","Medium 🟠","High 🔴","Very High 🚨"];
const NEED_OPTS = ["🎵 Music","🤫 Silence","☕ Break","🍎 Snack","🏃 Movement","💧 Water","🙏 Breathwork"];
const IMPULSE_QS = [
  "Is this URGENT — or does it just FEEL urgent right now?",
  "Will this still matter in 1 hour? 1 day? 1 week?",
  "What is the absolute WORST that happens if I wait 10 minutes?",
  "Is there a BETTER, more aligned use of this energy right now?",
  "Am I running TOWARD something productive — or AWAY from something uncomfortable?",
];

function ExecFunctionWorkbook() {
  const [bigTask, setBigTask] = useState("");
  const [why, setWhy] = useState("");
  const [startWhen, setStartWhen] = useState("");
  const [doneBy, setDoneBy] = useState("");
  const [reward, setReward] = useState("");
  const [steps, setSteps] = useState(STEP_HINTS.map(()=>({text:"",done:false})));
  const [body, setBody] = useState(null);
  const [dist, setDist] = useState(null);
  const [needs, setNeeds] = useState([]);
  const [times, setTimes] = useState(Array(6).fill(null).map(()=>({task:"",est:"",actual:"",learned:""})));
  const [impulse, setImpulse] = useState({});

  const setStep = (i,key,val)=>{ const n=[...steps]; n[i]={...n[i],[key]:val}; setSteps(n); };
  const setTime = (i,key,val)=>{ const n=[...times]; n[i]={...n[i],[key]:val}; setTimes(n); };
  const diff = (t) => {
    const e=parseInt(t.est), a=parseInt(t.actual);
    if (!e||!a) return "—";
    const d=a-e; return d===0?"✓ Exact":d>0?`+${d}m over`:`${Math.abs(d)}m under`;
  };
  const diffColor = (t) => {
    const e=parseInt(t.est), a=parseInt(t.actual);
    if (!e||!a) return P.mist;
    return a>e?P.coral:a<e?P.sage:P.teal;
  };

  return (
    <div>
      {/* Task Breakdown */}
      <Card accent={P.gold}>
        <SHead bg={P.cocoa}>🧩 TASK BREAKDOWN — Break it until it's stupidly small</SHead>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
          <div>
            <Lbl>BIG TASK — What needs to get done?</Lbl>
            <Input value={bigTask} onChange={e=>setBigTask(e.target.value)}
              placeholder="The thing you've been avoiding or feeling stuck on..." />
          </div>
          <div>
            <Lbl>WHY IT MATTERS — Connect it to something you care about</Lbl>
            <Input value={why} onChange={e=>setWhy(e.target.value)}
              placeholder="Because..." style={{ background:P.goldBg, borderColor:P.gold }} />
          </div>
          <div>
            <Lbl>WHEN WILL I START?</Lbl>
            <Input value={startWhen} onChange={e=>setStartWhen(e.target.value)}
              placeholder="e.g. After lunch at 1:00 PM" />
          </div>
          <div>
            <Lbl>DONE BY?</Lbl>
            <Input value={doneBy} onChange={e=>setDoneBy(e.target.value)}
              placeholder="e.g. 3:00 PM today" />
          </div>
        </div>

        <div>
          <Lbl>REWARD I'LL GIVE MYSELF WHEN DONE 🎁</Lbl>
          <Input value={reward} onChange={e=>setReward(e.target.value)}
            placeholder="Pick something specific you're looking forward to..."
            style={{ background:P.goldBg, borderColor:P.gold }} />
        </div>

        <div style={{ marginTop:14 }}>
          <Lbl>MICRO-STEPS — Make each one impossible to fail</Lbl>
          {steps.map((s,i)=>(
            <div key={i} style={{ display:"grid", gridTemplateColumns:"auto 1fr auto",
              gap:10, alignItems:"center", marginBottom:8 }}>
              <div style={{ width:30, height:30, borderRadius:"50%",
                background:STEP_COLORS[i], display:"flex", alignItems:"center",
                justifyContent:"center", fontWeight:900, fontSize:12,
                color:STEP_COLORS[i]===P.gold?P.cocoa:P.white, flexShrink:0 }}>{i+1}</div>
              <div>
                <Input value={s.text} onChange={e=>setStep(i,"text",e.target.value)}
                  placeholder={STEP_HINTS[i]}
                  style={{ borderColor:s.done?P.sage:P.mist, background:s.done?P.sageBg:P.ivory }} />
              </div>
              <Check checked={s.done} onChange={()=>setStep(i,"done",!s.done)} label="" color={STEP_COLORS[i]} />
            </div>
          ))}
          <div style={{ fontSize:12, fontWeight:700, color:P.cocoaSoft, marginTop:4 }}>
            {steps.filter(s=>s.done).length}/{steps.length} steps complete
          </div>
        </div>
      </Card>

      {/* Emotional Regulation */}
      <Card accent={P.coral} style={{ background:P.coralBg }}>
        <SHead bg={P.coral}>💭 BEFORE I START — Emotional Regulation Check</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <div>
            <Lbl>How does my BODY feel right now?</Lbl>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {BODY_OPTS.map(o=><Pill key={o} label={o} active={body===o} color={P.coral} onClick={()=>setBody(o)} />)}
            </div>
          </div>
          <div>
            <Lbl>DISTRACTION level?</Lbl>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {DIST_OPTS.map(o=><Pill key={o} label={o} active={dist===o} color={P.teal} onClick={()=>setDist(o)} />)}
            </div>
          </div>
          <div>
            <Lbl>What do I NEED right now?</Lbl>
            <div style={{ display:"flex", flexWrap:"wrap", gap:5 }}>
              {NEED_OPTS.map(o=>(
                <Pill key={o} label={o} color={P.lav}
                  active={needs.includes(o)} onClick={()=>setNeeds(needs.includes(o)?needs.filter(x=>x!==o):[...needs,o])} />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Time Blindness Buster */}
      <Card accent={P.teal}>
        <SHead bg={P.teal}>⏰ TIME BLINDNESS BUSTER — Train yourself to estimate accurately</SHead>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:P.teal }}>
                {["Task / Activity","My Estimate","Actual Time","Off By","What I Learned"].map((h,i)=>(
                  <th key={i} style={{ padding:"8px 10px", color:P.white, fontWeight:800,
                    textAlign:"left", whiteSpace:"nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((t,i)=>(
                <tr key={i} style={{ background:i%2===0?P.cream:P.white, borderBottom:`1px solid ${P.mist}` }}>
                  <td style={{ padding:"6px 8px" }}>
                    <Input value={t.task} onChange={e=>setTime(i,"task",e.target.value)} placeholder="Task..." /></td>
                  <td style={{ padding:"6px 8px" }}>
                    <Input value={t.est} onChange={e=>setTime(i,"est",e.target.value)}
                      placeholder="min" style={{ width:70, textAlign:"center" }} /></td>
                  <td style={{ padding:"6px 8px" }}>
                    <Input value={t.actual} onChange={e=>setTime(i,"actual",e.target.value)}
                      placeholder="min" style={{ width:70, textAlign:"center" }} /></td>
                  <td style={{ padding:"6px 8px", fontWeight:800, color:diffColor(t), fontSize:11, whiteSpace:"nowrap" }}>
                    {diff(t)}</td>
                  <td style={{ padding:"6px 8px" }}>
                    <Input value={t.learned} onChange={e=>setTime(i,"learned",e.target.value)} placeholder="Insight..." /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Impulse Pause */}
      <Card accent={P.lav} style={{ background:P.lavBg }}>
        <SHead bg={P.lav}>🛑 IMPULSE PAUSE PROTOCOL — Before you act, ask yourself:</SHead>
        {IMPULSE_QS.map((q,i)=>(
          <div key={i} style={{ display:"grid", gridTemplateColumns:"36px 1fr auto",
            gap:12, alignItems:"center", marginBottom:10, padding:"10px 12px",
            background:P.white, borderRadius:8, border:`1px solid ${P.lav}` }}>
            <div style={{ width:30, height:30, borderRadius:"50%", background:P.lav,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontWeight:900, color:P.white, fontSize:13 }}>{i+1}</div>
            <span style={{ fontSize:13, color:P.dark, fontWeight:500 }}>{q}</span>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setImpulse({...impulse,[i]:"yes"})} style={{
                padding:"5px 12px", borderRadius:6, border:`1.5px solid ${P.sage}`,
                background:impulse[i]==="yes"?P.sage:P.white,
                color:impulse[i]==="yes"?P.white:P.cocoaSoft,
                fontWeight:700, fontSize:11, cursor:"pointer",
              }}>✓ YES</button>
              <button onClick={()=>setImpulse({...impulse,[i]:"no"})} style={{
                padding:"5px 12px", borderRadius:6, border:`1.5px solid ${P.coral}`,
                background:impulse[i]==="no"?P.coral:P.white,
                color:impulse[i]==="no"?P.white:P.cocoaSoft,
                fontWeight:700, fontSize:11, cursor:"pointer",
              }}>✗ NO</button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. FOCUS TRACKER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const ENV_ITEMS = [
  "📵 Phone away or on Do Not Disturb",
  "🎧 Headphones / music / white noise ready",
  "💧 Water & snacks within reach",
  "📝 Task written out clearly and specifically",
  "🖥️ Unnecessary browser tabs closed",
  "🧹 Workspace surface cleared",
  "💺 Body positioned comfortably",
  "⏱️ Timer / alarm set for focus block",
  "🤝 Accountability partner notified (if using)",
];
const DIST_TYPES = ["Internal","External","Digital","Urgent","Other"];

function FocusTracker() {
  const [sessions, setSessions] = useState(Array(10).fill(null).map((_,i)=>({
    task:"", focus:0, tallies:0, status:"pending",
  })));
  const [activeIdx, setActiveIdx] = useState(null);
  const [timerSecs, setTimerSecs] = useState(25*60);
  const [running, setRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPoms, setCompletedPoms] = useState(0);
  const [env, setEnv] = useState({});
  const [distrLog, setDistrLog] = useState(Array(8).fill(null).map(()=>({time:"",what:"",type:"",action:"",returned:""})));
  const [focusScore, setFocusScore] = useState(0);
  const [scoreNote, setScoreNote] = useState("");
  const timerRef = useRef(null);

  useEffect(()=>{
    if(running && timerSecs>0) {
      timerRef.current = setTimeout(()=>setTimerSecs(t=>t-1), 1000);
    } else if(running && timerSecs===0) {
      setRunning(false);
      if(!isBreak) {
        setCompletedPoms(n=>n+1);
        if(activeIdx!==null){ const n=[...sessions]; n[activeIdx].status="done"; setSessions(n); }
        setIsBreak(true); setTimerSecs(5*60);
      } else { setIsBreak(false); setTimerSecs(25*60); }
    }
    return ()=>clearTimeout(timerRef.current);
  },[running,timerSecs]);

  const mm = String(Math.floor(timerSecs/60)).padStart(2,"0");
  const ss = String(timerSecs%60).padStart(2,"0");
  const totalSecs = isBreak?5*60:25*60;
  const progress = 1 - timerSecs/totalSecs;
  const circ = 2*Math.PI*52;

  const setSession=(i,key,val)=>{ const n=[...sessions]; n[i]={...n[i],[key]:val}; setSessions(n); };
  const setDistr=(i,key,val)=>{ const n=[...distrLog]; n[i]={...n[i],[key]:val}; setDistrLog(n); };
  const envScore = Object.values(env).filter(Boolean).length;

  return (
    <div>
      {/* Pomodoro Timer */}
      <Card accent={P.coral}>
        <SHead bg={P.coral}>🍅 POMODORO TIMER — 25 min focus / 5 min break</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"auto 1fr", gap:24, alignItems:"center" }}>
          {/* Circle timer */}
          <div style={{ position:"relative", width:140, height:140 }}>
            <svg width="140" height="140" style={{ transform:"rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="52" fill="none" stroke={P.mist} strokeWidth="10"/>
              <circle cx="70" cy="70" r="52" fill="none"
                stroke={isBreak?P.teal:P.coral} strokeWidth="10"
                strokeDasharray={circ} strokeDashoffset={circ*(1-progress)}
                strokeLinecap="round" style={{ transition:"stroke-dashoffset .5s" }}/>
            </svg>
            <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column",
              alignItems:"center", justifyContent:"center" }}>
              <div style={{ fontSize:30, fontWeight:900, color:P.cocoa, lineHeight:1 }}>{mm}:{ss}</div>
              <div style={{ fontSize:10, fontWeight:800, color:isBreak?P.teal:P.coral, marginTop:2 }}>
                {isBreak?"BREAK TIME":"FOCUS MODE"}
              </div>
            </div>
          </div>

          <div>
            <div style={{ marginBottom:12 }}>
              <Lbl>ACTIVE TASK (Session {activeIdx!==null?activeIdx+1:"—"})</Lbl>
              <Input value={activeIdx!==null?sessions[activeIdx].task:""}
                placeholder="Select a session row below, then type your task..."
                onChange={e=>{if(activeIdx!==null)setSession(activeIdx,"task",e.target.value)}} />
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:12 }}>
              <button onClick={()=>setRunning(r=>!r)} style={{
                padding:"9px 20px", borderRadius:8, fontWeight:800, fontSize:13, border:"none",
                cursor:"pointer", background:running?P.coral:P.teal, color:P.white,
              }}>{running?"⏸ Pause":"▶ Start Focus"}</button>
              <button onClick={()=>{ setRunning(false); setTimerSecs(25*60); setIsBreak(false); }} style={{
                padding:"9px 16px", borderRadius:8, fontWeight:700, fontSize:13,
                border:`1.5px solid ${P.mist}`, background:P.cream, color:P.cocoaSoft, cursor:"pointer",
              }}>↺ Reset</button>
              <button onClick={()=>{ setRunning(false); setTimerSecs(5*60); setIsBreak(true); }} style={{
                padding:"9px 16px", borderRadius:8, fontWeight:700, fontSize:13,
                border:`1.5px solid ${P.teal}`, background:P.tealBg, color:P.teal, cursor:"pointer",
              }}>☕ Break</button>
            </div>
            <div style={{ display:"flex", gap:16, fontSize:12, color:P.cocoaSoft }}>
              <span>🍅 Completed today: <strong style={{ color:P.coral }}>{completedPoms}</strong></span>
              <span>⚙️ Setup: <strong style={{ color:envScore>=7?P.sage:P.coral }}>{envScore}/9</strong></span>
            </div>
          </div>
        </div>
      </Card>

      {/* Session Log */}
      <Card accent={P.teal}>
        <SHead bg={P.teal}>📋 SESSION LOG — Click # to activate session</SHead>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:P.teal }}>
                {["#","Task / Project","Focus ★★★★★","Tallies","Status"].map((h,i)=>(
                  <th key={i} style={{ padding:"8px 10px", color:P.white, fontWeight:800, textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map((s,i)=>(
                <tr key={i} style={{
                  background:activeIdx===i?P.tealBg:i%2===0?P.cream:P.white,
                  borderBottom:`1px solid ${P.mist}`,
                  outline:activeIdx===i?`2px solid ${P.teal}`:"none",
                }}>
                  <td style={{ padding:"6px 10px" }}>
                    <button onClick={()=>setActiveIdx(i)} style={{
                      width:28, height:28, borderRadius:"50%",
                      background:activeIdx===i?P.coral:s.status==="done"?P.sage:P.nude,
                      border:"none", color:P.white, fontWeight:800, cursor:"pointer", fontSize:11,
                    }}>{i+1}</button>
                  </td>
                  <td style={{ padding:"6px 8px", minWidth:160 }}>
                    <Input value={s.task} onChange={e=>setSession(i,"task",e.target.value)}
                      placeholder="What are you working on?" style={{ fontSize:12 }} /></td>
                  <td style={{ padding:"6px 8px", whiteSpace:"nowrap" }}>
                    {[1,2,3,4,5].map(star=>(
                      <button key={star} onClick={()=>setSession(i,"focus",star)} style={{
                        background:"none", border:"none", cursor:"pointer",
                        fontSize:16, padding:"0 1px",
                        color:star<=s.focus?P.gold:P.mist,
                      }}>★</button>
                    ))}
                  </td>
                  <td style={{ padding:"6px 8px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <button onClick={()=>setSession(i,"tallies",(s.tallies||0)+1)} style={{
                        background:P.coralBg, border:`1px solid ${P.coral}`,
                        borderRadius:4, padding:"2px 8px", cursor:"pointer", fontSize:11,
                      }}>+1</button>
                      <span style={{ fontWeight:700, color:P.coral }}>{s.tallies||0}</span>
                    </div>
                  </td>
                  <td style={{ padding:"6px 8px" }}>
                    <select value={s.status} onChange={e=>setSession(i,"status",e.target.value)}
                      style={{ border:`1px solid ${P.mist}`, borderRadius:6,
                        padding:"4px 6px", fontSize:11, background:P.white }}>
                      <option value="pending">⏳ Pending</option>
                      <option value="done">✅ Done</option>
                      <option value="partial">🔶 Partial</option>
                      <option value="skipped">⏭ Skipped</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Environment Setup */}
      <Card accent={P.gold}>
        <SHead bg={P.cocoa}>⚙️ FOCUS ENVIRONMENT SETUP — Do this FIRST</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
          {ENV_ITEMS.map(item=>(
            <Check key={item} checked={!!env[item]} color={P.gold} label={item}
              onChange={()=>setEnv({...env,[item]:!env[item]})} />
          ))}
        </div>
        <div style={{ marginTop:10, padding:"8px 12px", borderRadius:6,
          background:envScore>=7?P.sageBg:envScore>=4?P.goldBg:P.coralBg,
          border:`1px solid ${envScore>=7?P.sage:envScore>=4?P.gold:P.coral}`,
          fontSize:12, fontWeight:700,
          color:envScore>=7?P.sage:envScore>=4?P.cocoaSoft:P.coral }}>
          {envScore}/9 ready · {envScore>=7?"🔥 You're set up for deep focus!":
            envScore>=4?"🟡 Getting there — a few more to go":
            "🔴 Set up your environment before you start"}
        </div>
      </Card>

      {/* Distraction Log */}
      <Card accent={P.teal}>
        <SHead bg={P.teal}>🚨 DISTRACTION CAPTURE LOG — Catch it, park it, return</SHead>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
            <thead>
              <tr style={{ background:P.teal }}>
                {["Time","What Distracted Me","Type","Action Taken","Back In"].map((h,i)=>(
                  <th key={i} style={{ padding:"8px 10px", color:P.white, fontWeight:800, textAlign:"left" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {distrLog.map((d,i)=>(
                <tr key={i} style={{ background:i%2===0?P.cream:P.white, borderBottom:`1px solid ${P.mist}` }}>
                  <td style={{ padding:"5px 8px" }}>
                    <Input value={d.time} onChange={e=>setDistr(i,"time",e.target.value)}
                      placeholder="2:14 PM" style={{ width:70, fontSize:11 }} /></td>
                  <td style={{ padding:"5px 8px" }}>
                    <Input value={d.what} onChange={e=>setDistr(i,"what",e.target.value)}
                      placeholder="What happened?" style={{ fontSize:11 }} /></td>
                  <td style={{ padding:"5px 8px" }}>
                    <select value={d.type} onChange={e=>setDistr(i,"type",e.target.value)}
                      style={{ fontSize:11, border:`1px solid ${P.mist}`, borderRadius:6,
                        padding:"4px 5px", background:P.white }}>
                      <option value="">—</option>
                      {DIST_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{ padding:"5px 8px" }}>
                    <Input value={d.action} onChange={e=>setDistr(i,"action",e.target.value)}
                      placeholder="What did I do?" style={{ fontSize:11 }} /></td>
                  <td style={{ padding:"5px 8px" }}>
                    <Input value={d.returned} onChange={e=>setDistr(i,"returned",e.target.value)}
                      placeholder="__ min" style={{ width:60, fontSize:11 }} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Focus Score */}
      <Card accent={P.dream}>
        <SHead bg={P.cocoa}>🏆 TODAY'S OVERALL FOCUS SCORE</SHead>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:12 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(n=>(
            <button key={n} onClick={()=>setFocusScore(n)} style={{
              width:40, height:40, borderRadius:"50%", fontWeight:900, fontSize:14,
              background:n<=focusScore?(n<=3?P.coral:n<=6?P.gold:P.sage):P.cream,
              color:n<=focusScore?P.white:P.mist,
              border:`2px solid ${n<=focusScore?(n<=3?P.coral:n<=6?P.gold:P.sage):P.mist}`,
              cursor:"pointer", transition:"all .12s",
            }}>{n}</button>
          ))}
        </div>
        {focusScore>0 && (
          <div style={{ padding:"8px 12px", borderRadius:6, marginBottom:10,
            background:focusScore>=8?P.sageBg:focusScore>=5?P.goldBg:P.coralBg,
            fontSize:13, fontWeight:700,
            color:focusScore>=8?P.sage:focusScore>=5?P.cocoaSoft:P.coral }}>
            {focusScore>=8?"🔥 Incredible focus day! You showed up and delivered.":
             focusScore>=5?"👍 Solid effort — more good days like this coming.":
             "💙 Every day is data. Tomorrow is a completely fresh start."}
          </div>
        )}
        <Lbl>NOTES — What affected your focus today?</Lbl>
        <Textarea value={scoreNote} onChange={e=>setScoreNote(e.target.value)}
          placeholder="Sleep, stress, meds, environment, mood — what was the key factor today?" rows={2} />
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. REWARD SYSTEM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const EARN_CATS = [
  { name:"📅 Daily Habits", color:P.teal, bg:P.tealBg, items:[
    {label:"Completed full morning routine",pts:10},
    {label:"Took meds / supplements on time",pts:5},
    {label:"No doom scroll before noon",pts:10},
    {label:"Followed schedule (80%+ compliance)",pts:15},
    {label:"Completed evening routine",pts:10},
    {label:"Drank 8+ cups of water",pts:5},
    {label:"Movement / exercise done",pts:10},
    {label:"Custom:___________________",pts:10},
  ]},
  { name:"✅ Task Wins", color:P.sage, bg:P.sageBg, items:[
    {label:"Finished today's #1 priority",pts:20},
    {label:"Completed a long-avoided task",pts:25},
    {label:"Zero late deliverables today",pts:15},
    {label:"Completed 4+ Pomodoro sessions",pts:20},
    {label:"Helped or supported someone",pts:10},
    {label:"Tried something new or scary",pts:20},
    {label:"Custom:___________________",pts:10},
  ]},
  { name:"⚡ Bonus Points", color:P.coral, bg:P.coralBg, items:[
    {label:"Full zero-distraction hour",pts:30},
    {label:"Caught impulse & chose to pause",pts:15},
    {label:"Journaled (morning or evening)",pts:10},
    {label:"Celebrated a small win out loud",pts:10},
    {label:"7-day habit streak achieved",pts:50},
    {label:"Custom:___________________",pts:15},
  ]},
];
const REWARD_TIERS = [
  { name:"🍬 Small Rewards", range:"25–75 pts", color:P.teal, bg:P.tealBg, items:[
    {label:"15 min guilt-free social scroll",pts:25},
    {label:"Favorite snack or treat",pts:30},
    {label:"One episode of your show",pts:35},
    {label:"Dance break — full song",pts:25},
    {label:"10-minute nap pass",pts:40},
    {label:"Custom:___________________",pts:30},
  ]},
  { name:"🎁 Medium Rewards", range:"100–200 pts", color:P.dream, bg:P.cream, items:[
    {label:"Buy something small ($10–25)",pts:100},
    {label:"Special outing (coffee, park)",pts:120},
    {label:"Spa or self-care evening",pts:150},
    {label:"Favorite takeout night",pts:100},
    {label:"Movie night — your pick",pts:125},
    {label:"Custom:___________________",pts:100},
  ]},
  { name:"🏆 Big Rewards", range:"300+ pts", color:P.lav, bg:P.lavBg, items:[
    {label:"Day trip or mini adventure",pts:300},
    {label:"New outfit, shoes, or accessory",pts:350},
    {label:"Full spa or salon day",pts:400},
    {label:"Concert, event, or experience",pts:350},
    {label:"Splurge purchase — guilt-free",pts:500},
    {label:"Custom:___________________",pts:300},
  ]},
];

function RewardSystem() {
  const [earned, setEarned] = useState({});
  const [redeemed, setRedeemed] = useState({});
  const [weekPts, setWeekPts] = useState([0,0,0,0]);
  const [goalPts, setGoalPts] = useState(300);
  const [journalNote, setJournalNote] = useState("");

  const totalEarned = Object.entries(earned).reduce((s,[k,count])=>{
    for(const cat of EARN_CATS) {
      const item=cat.items.find(i=>i.label===k);
      if(item) return s+item.pts*count;
    }
    return s;
  }, 0);
  const totalSpent = Object.entries(redeemed).reduce((s,[k,v])=>{
    if(!v) return s;
    for(const tier of REWARD_TIERS) {
      const item=tier.items.find(i=>i.label===k);
      if(item) return s+item.pts;
    }
    return s;
  }, 0);
  const balance = totalEarned - totalSpent;
  const progressPct = Math.min(100, (balance/goalPts)*100);

  const tap = (label, pts) => setEarned({...earned,[label]:(earned[label]||0)+1});
  const redeem = (label, pts) => {
    if(balance>=pts && !redeemed[label]) setRedeemed({...redeemed,[label]:true});
  };

  return (
    <div>
      {/* Balance Dashboard */}
      <Card accent={P.gold} style={{ background:P.goldBg }}>
        <SHead bg={P.cocoa}>⭐ POINTS BALANCE DASHBOARD</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", gap:12, marginBottom:16 }}>
          {[
            ["EARNED","⬆",totalEarned,P.teal],
            ["SPENT","⬇",totalSpent,P.coral],
            ["BALANCE","💰",balance,P.gold],
            ["GOAL 🎯","📍",goalPts,P.lav],
          ].map(([lbl,icon,val,color])=>(
            <div key={lbl} style={{ textAlign:"center", padding:"12px 8px",
              background:P.white, borderRadius:8, border:`1px solid ${P.mist}` }}>
              <div style={{ fontSize:10, fontWeight:800, color:P.cocoaSoft, letterSpacing:.8 }}>{lbl}</div>
              <div style={{ fontSize:32, fontWeight:900, color, lineHeight:1.1 }}>{val}</div>
              <div style={{ fontSize:10, color:P.cocoaSoft }}>pts</div>
              {lbl==="GOAL 🎯" && (
                <input type="range" min={50} max={500} step={25} value={goalPts}
                  onChange={e=>setGoalPts(+e.target.value)}
                  style={{ width:"100%", marginTop:4, accentColor:P.lav }} />
              )}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", justifyContent:"space-between", fontSize:11,
            color:P.cocoaSoft, marginBottom:4 }}>
            <span>Progress to goal</span>
            <span><strong>{Math.round(progressPct)}%</strong> · {Math.max(0,goalPts-balance)} pts to go</span>
          </div>
          <div style={{ height:16, background:P.mist, borderRadius:8, overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:8, transition:"width .4s",
              width:`${progressPct}%`,
              background:`linear-gradient(90deg, ${P.teal}, ${P.gold}, ${P.coral})` }}/>
          </div>
        </div>

        {progressPct>=100 && (
          <div style={{ padding:"10px 14px", background:P.sageBg, borderRadius:8,
            border:`1px solid ${P.sage}`, fontSize:13, fontWeight:700, color:P.sage }}>
            🏆 Goal reached! Time to redeem a reward. You earned it!
          </div>
        )}
      </Card>

      {/* Earn Points */}
      <Card accent={P.teal}>
        <SHead bg={P.teal}>💪 EARN POINTS — Tap each action you completed</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          {EARN_CATS.map(cat=>(
            <div key={cat.name} style={{ background:cat.bg, borderRadius:8,
              border:`1px solid ${cat.color}22`, padding:"12px" }}>
              <div style={{ fontSize:12, fontWeight:800, color:cat.color,
                marginBottom:10, borderBottom:`2px solid ${cat.color}44`, paddingBottom:6 }}>
                {cat.name}
              </div>
              {cat.items.map(item=>(
                <button key={item.label} onClick={()=>tap(item.label,item.pts)} style={{
                  width:"100%", textAlign:"left", padding:"6px 8px", marginBottom:4,
                  borderRadius:6, border:`1px solid ${earned[item.label]?cat.color:P.mist}`,
                  background:earned[item.label]?cat.color+"22":P.white,
                  cursor:"pointer", display:"flex", justifyContent:"space-between",
                  alignItems:"center", gap:6, transition:"all .12s",
                }}>
                  <span style={{ fontSize:11, color:P.dark, flex:1, textAlign:"left" }}>{item.label}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:4, flexShrink:0 }}>
                    <span style={{ fontSize:10, fontWeight:800, color:cat.color }}>+{item.pts}</span>
                    {earned[item.label]>0 && (
                      <span style={{ background:cat.color, color:cat.color===P.gold?P.cocoa:P.white,
                        borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:900,
                        display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {earned[item.label]}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </Card>

      {/* Reward Menu */}
      <Card accent={P.dream}>
        <SHead bg={P.dream}>🎁 REWARD MENU — Redeem when you've earned it</SHead>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          {REWARD_TIERS.map(tier=>(
            <div key={tier.name} style={{ background:tier.bg, borderRadius:8,
              border:`1px solid ${tier.color}22`, padding:"12px" }}>
              <div style={{ fontSize:12, fontWeight:800, color:tier.color, marginBottom:2 }}>
                {tier.name}</div>
              <div style={{ fontSize:10, color:P.cocoaSoft, marginBottom:10,
                borderBottom:`2px solid ${tier.color}44`, paddingBottom:6 }}>{tier.range}</div>
              {tier.items.map(item=>{
                const canRedeem = balance>=item.pts;
                const isRedeemed = !!redeemed[item.label];
                return (
                  <button key={item.label} onClick={()=>redeem(item.label,item.pts)}
                    disabled={!canRedeem&&!isRedeemed} style={{
                    width:"100%", textAlign:"left", padding:"6px 8px", marginBottom:4,
                    borderRadius:6, border:`1px solid ${isRedeemed?tier.color:canRedeem?tier.color+"66":P.mist}`,
                    background:isRedeemed?tier.color+"33":canRedeem?P.white:P.cream,
                    cursor:canRedeem&&!isRedeemed?"pointer":"default",
                    display:"flex", justifyContent:"space-between", alignItems:"center",
                    gap:6, opacity:!canRedeem&&!isRedeemed?.5:1, transition:"all .12s",
                  }}>
                    <span style={{ fontSize:10, flex:1, textAlign:"left", color:P.dark }}>
                      {isRedeemed?"✅ ":canRedeem?"🔓 ":"🔒 "}{item.label}
                    </span>
                    <span style={{ fontSize:10, fontWeight:800, color:tier.color,
                      flexShrink:0 }}>{item.pts}p</span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly Tracker */}
      <Card accent={P.cocoa}>
        <SHead bg={P.cocoa}>📈 WEEKLY POINTS TRACKER</SHead>
        <div style={{ display:"flex", alignItems:"flex-end", gap:12, height:140,
          padding:"0 20px", borderBottom:`2px solid ${P.mist}`, marginBottom:8 }}>
          {weekPts.map((pts,i)=>{
            const colors=[P.teal,P.sage,P.gold,P.coral];
            const h = Math.max(8,(pts/500)*120);
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column",
                alignItems:"center", gap:4 }}>
                <span style={{ fontSize:12, fontWeight:800, color:colors[i] }}>{pts}</span>
                <div style={{ width:"100%", height:h, background:colors[i],
                  borderRadius:"6px 6px 0 0", transition:"height .3s", cursor:"pointer",
                  opacity:.85 }} onClick={()=>{ const n=[...weekPts]; n[i]=Math.min(500,n[i]+25); setWeekPts(n); }}/>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:12 }}>
          {weekPts.map((_,i)=>(
            <div key={i} style={{ flex:1, textAlign:"center" }}>
              <div style={{ fontSize:11, fontWeight:800, color:P.cocoaSoft }}>WK {i+1}</div>
              <input type="number" value={weekPts[i]} min={0} max={500}
                onChange={e=>{ const n=[...weekPts]; n[i]=Math.max(0,+e.target.value); setWeekPts(n); }}
                style={{ width:"100%", textAlign:"center", border:`1px solid ${P.mist}`,
                  borderRadius:6, padding:"4px", fontSize:12, background:P.ivory }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop:10, fontSize:12, color:P.cocoaSoft, fontWeight:600 }}>
          Monthly Total: <strong style={{ color:P.gold }}>{weekPts.reduce((a,b)=>a+b,0)} pts</strong>
          {" "}· Click bars or edit numbers below to track
        </div>
      </Card>

      {/* Progress journal */}
      <Card accent={P.lav} style={{ background:P.lavBg }}>
        <SHead bg={P.lav}>📝 PROGRESS NOTES — Celebrate your journey</SHead>
        <Textarea value={journalNote} onChange={e=>setJournalNote(e.target.value)}
          placeholder="What patterns are you noticing? What's helping? What rewards are motivating you most?"
          rows={3} />
      </Card>
    </div>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROOT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const COMPONENTS = { planner:DailyPlanner, journal:RoutineJournal,
  exec:ExecFunctionWorkbook, focus:FocusTracker, rewards:RewardSystem };

export default function ADHDBundle() {
  const [tab, setTab] = useState("planner");
  const active = TABS.find(t=>t.id===tab);
  const Component = COMPONENTS[tab];

  return (
    <div style={{ fontFamily:"'Georgia', serif", background:"#F0E8E4", minHeight:"100vh" }}>
      {/* Header */}
      <div style={{ background:P.cocoa, position:"sticky", top:0, zIndex:100,
        boxShadow:"0 2px 16px rgba(0,0,0,.2)" }}>
        <div style={{ padding:"14px 24px 0" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
            marginBottom:12, flexWrap:"wrap", gap:8 }}>
            <div>
              <div style={{ fontSize:9, color:P.peach, fontWeight:700, letterSpacing:2 }}>
                JONES & CO SIGNATURE SERVICES
              </div>
              <div style={{ fontSize:20, fontWeight:900, color:P.white }}>
                ADHD Success Bundle
              </div>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ fontSize:11, color:P.nude, fontWeight:600 }}>
                {active.label}
              </div>
              <div style={{ background:P.gold, borderRadius:20, padding:"5px 14px",
                fontWeight:900, fontSize:12, color:P.cocoa }}>⭐ $63 Bundle</div>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:2, overflowX:"auto" }}>
            {TABS.map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{
                padding:"8px 14px", border:"none", borderRadius:"8px 8px 0 0",
                background:tab===t.id?P.ivory:"transparent",
                color:tab===t.id?t.accent:P.nude,
                fontWeight:tab===t.id?800:600, fontSize:12, cursor:"pointer",
                whiteSpace:"nowrap", transition:"all .15s",
                borderTop:tab===t.id?`3px solid ${t.accent}`:"3px solid transparent",
                fontFamily:"inherit",
              }}>{t.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:900, margin:"0 auto", padding:"20px 16px 48px" }}>
        <Component />
      </div>

      {/* Footer */}
      <div style={{ background:P.cocoa, textAlign:"center", padding:"14px",
        fontSize:10, color:P.nude, letterSpacing:1 }}>
        JONES & CO SIGNATURE SERVICES · ADHD SUCCESS BUNDLE · © 2025 · jonesandcosignatureservices.com
      </div>

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}
