import { useState } from 'react';

// ── Icons ────────────────────────────────────────────────────────────────────
const BrainSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M15.5 13a3.5 3.5 0 0 0 -3.5 3.5v1a3.5 3.5 0 0 0 7 0v-1.8"/><path d="M8.5 13a3.5 3.5 0 0 1 3.5 3.5v1a3.5 3.5 0 0 1 -7 0v-1.8"/>
    <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"/><path d="M15.5 6.5a3.5 3.5 0 0 0 -3.5 -3.5h-1a3.5 3.5 0 0 0 0 7h1"/><path d="M8.5 6.5a3.5 3.5 0 0 1 3.5 -3.5h1a3.5 3.5 0 0 1 0 7h-1"/>
  </svg>
);
const LeafSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.5C7.5 18.5 3 14.5 3 9c7.5 0 12 4 12 9.5zM12 18.5V21M12 18.5C16.5 18.5 21 14.5 21 9c-7.5 0-12 4-12 9.5z"/>
  </svg>
);
const CheckSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
  </svg>
);
const BookSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
  </svg>
);

// ── Exercises ─────────────────────────────────────────────────────────────────
const EXERCISES = [
  {
    id:'thought-record', title:'Challenge Your Thoughts', desc:'Analyze and reframe negative thoughts.', icon:<BrainSvg/>,
    steps:[
      {title:'The Situation',content:'First, identify the situation that triggered your urge or negative feeling. Be specific. Where were you? Who were you with? What were you doing?'},
      {title:'Automatic Thoughts',content:"What was the very first thought that popped into your head? Don't filter it. It could be something like, 'I need a drink,' or 'I can't handle this.'"},
      {title:'Identify Emotions',content:'How did that automatic thought make you feel? Name the emotions. For example: Anxious, sad, angry, ashamed, bored.'},
      {title:'Evidence FOR',content:"Play devil's advocate. What evidence supports your automatic thought? Try to find facts, not feelings."},
      {title:'Evidence AGAINST',content:'What evidence contradicts your automatic thought? Think about your past successes, your goals, and the negative consequences of giving in.'},
      {title:'Balanced Thought',content:"Based on the evidence, what is a more balanced, realistic, and helpful thought? Example: 'Even though I feel an urge, I know it will pass, and I will be proud of myself for staying strong.'"},
    ]
  },
  {
    id:'surf-urge', title:'Surf the Urge', desc:'Ride out cravings like a wave.', icon:<LeafSvg/>,
    steps:[
      {title:'Acknowledge the Craving',content:"The first step is simply to notice the craving without judgment. Say to yourself, 'Okay, a craving is here.' Don't try to push it away or ignore it."},
      {title:'Observe the Sensation',content:'Get curious. Where do you feel the craving in your body? Is it a physical sensation (like a knot in your stomach) or a mental one (like obsessive thoughts)? Watch it as if you were a scientist.'},
      {title:'Breathe Into It',content:'Take slow, deep breaths. Imagine your breath flowing to the part of your body where you feel the urge. This helps you stay present and not get carried away by the thought.'},
      {title:"It's a Wave",content:'Remind yourself that cravings are like ocean waves. They build in intensity, they peak, and then they naturally fall away. Your job is not to stop the wave, but to ride it until it passes.'},
      {title:'The Urge Will Pass',content:'Research shows that most cravings peak and then subside within 15–30 minutes if you do not act on them. You have survived every craving so far. You can survive this one. The urge will pass.'},
    ]
  },
  {
    id:'distortions', title:'Identify Distortions', desc:'Spot common thinking traps.', icon:<BrainSvg/>,
    steps:[
      {title:'All-or-Nothing Thinking',content:'Seeing things in black and white categories. If your performance falls short of perfect, you see yourself as a total failure. Sobriety is not all-or-nothing — every sober moment counts.'},
      {title:'Overgeneralization',content:"Seeing a single negative event as a never-ending pattern of defeat. 'I always fail' or 'Nothing ever works out for me.' These are stories, not facts."},
      {title:'Mental Filter',content:'Picking out a single negative detail and dwelling on it exclusively so that your vision of reality becomes darkened, like a drop of ink discoloring a glass of water.'},
      {title:'Disqualifying the Positive',content:"Rejecting positive experiences by insisting they 'don't count' for some reason or other. This allows you to maintain a negative belief even when contradicted by experience."},
      {title:'Jumping to Conclusions',content:'Making a negative interpretation even though there are no definite facts that support your conclusion. You assume you know what others think, or predict negative outcomes.'},
    ]
  },
  {
    id:'behavioral-activation', title:'Behavioral Activation', desc:'Boost mood by scheduling rewarding activities.', icon:<CheckSvg/>,
    steps:[
      {title:'Identify Your Values',content:'What is truly important to you? Family, health, creativity, spirituality, friendship, career? Write down what matters most.'},
      {title:'List Activities',content:'Brainstorm activities that connect to your values. Even small things count — a short walk, calling a friend, cooking a healthy meal.'},
      {title:'Schedule It',content:'Put these activities into your calendar. Treat them like important appointments you cannot cancel. Action comes before motivation, not the other way around.'},
      {title:'Monitor Your Mood',content:'Notice how you feel before and after the activity. Even if you feel low going in, most people feel better coming out. This builds the evidence that action helps.'},
    ]
  },
  {
    id:'decatastrophizing', title:'Decatastrophizing', desc:'Stop imagining the worst-case scenario.', icon:<BrainSvg/>,
    steps:[
      {title:'Name Your Fear',content:'Clearly define the situation you are afraid of. Be as specific as possible. Vague fears feel bigger than named fears.'},
      {title:'How Likely Is It?',content:'Realistically, what are the actual chances of this happening? We often dramatically overestimate the probability of bad outcomes.'},
      {title:"What's the Worst?",content:'Even if it does happen, what is the absolute worst realistic outcome? When you spell it out, it is often more manageable than the vague dread in your mind.'},
      {title:'How Would You Cope?',content:'If the worst happened, what steps would you take to handle it? You have coped with hard things before. You would cope with this too. You are more resilient than you think.'},
    ]
  },
  {
    id:'fact-vs-opinion', title:'Fact vs. Opinion', desc:'Separate objective facts from subjective beliefs.', icon:<BookSvg/>,
    steps:[
      {title:'State the Thought',content:'Write down the thought that is bothering you. Try to write it exactly as it appears in your mind, without filtering it.'},
      {title:'Is It a Fact?',content:'Can this thought be proven in a court of law? Is it universally true, regardless of who is looking? Facts are verifiable and objective.'},
      {title:'Is It an Opinion?',content:"Is it an interpretation, a belief, or a judgment? Opinions are not facts. 'I am a failure' is an opinion. 'I made a mistake' is a fact."},
      {title:'Reframe',content:"If it's an opinion, reframe it as a hypothesis rather than a certainty. Instead of 'I am weak,' try 'I am having a hard time right now, and I am working on getting stronger.'"},
    ]
  },
  {
    id:'abc-model', title:'The ABC Model', desc:'Understand events, beliefs, and consequences.', icon:<BrainSvg/>,
    steps:[
      {title:'A — Activating Event',content:'What happened? Describe the objective situation — just the observable facts, as if a camera had recorded it.'},
      {title:'B — Beliefs',content:'What are your thoughts or beliefs about the event? What did you tell yourself? These interpretations are what drive your emotional response, not the event itself.'},
      {title:'C — Consequences',content:'What are the emotional and behavioral consequences of those beliefs? How did you feel? What did you do (or want to do)?'},
      {title:'D — Disputation',content:'Now challenge the beliefs in B. Are they accurate? Are they helpful? What would a calm, rational friend say? Replace them with more balanced beliefs.'},
    ]
  },
  {
    id:'cost-benefit', title:'Cost-Benefit Analysis', desc:'Evaluate the pros and cons of a habit.', icon:<CheckSvg/>,
    steps:[
      {title:'Name the Habit',content:'Identify what you are analyzing. Be honest and specific (e.g., "drinking alcohol," "reaching for my phone when stressed").'},
      {title:'Pros of Changing',content:'What are the genuine benefits of making a change? Think short-term and long-term: health, relationships, self-respect, finances, clarity.'},
      {title:'Cons of Changing',content:'What are the real difficulties of changing? Acknowledging these makes the analysis honest, not a cheerleading exercise.'},
      {title:'Pros of Staying the Same',content:'What do you currently get from the habit? Relief, pleasure, routine, social connection? Be honest — this is private.'},
      {title:'Cons of Staying the Same',content:'What is the true cost of not changing? This is often the most powerful column. Write honestly about what this habit is costing you.'},
    ]
  },
  {
    id:'grounding-54321', title:'5-4-3-2-1 Grounding', desc:'Bring yourself back to the present moment.', icon:<LeafSvg/>,
    steps:[
      {title:'5 Things You See',content:'Look around and slowly name 5 things you can see. Notice details — the color of a wall, dust in the light, the shape of a shadow.'},
      {title:'4 Things You Feel',content:'Notice 4 things you can physically feel right now — the weight of your body in the seat, the temperature of the air, the texture of your clothing.'},
      {title:'3 Things You Hear',content:'Listen carefully and name 3 distinct sounds you can hear. Background sounds count — traffic, a fan, your own breathing.'},
      {title:'2 Things You Smell',content:'Notice 2 things you can smell. If nothing is present, think of a scent you find comforting — fresh coffee, rain, pine trees.'},
      {title:'1 Thing You Taste',content:'Notice 1 thing you can taste. Even the neutral taste of your mouth. Take a breath. You are here. You are safe. The craving is just a feeling passing through.'},
    ]
  },
  {
    id:'problem-solving', title:'Problem Solving', desc:'A structured approach to challenges.', icon:<BrainSvg/>,
    steps:[
      {title:'Define the Problem',content:'Be specific and objective. "I feel overwhelmed" is too vague. "I have three urgent tasks, no energy, and no plan" is specific enough to work with.'},
      {title:'Brainstorm Solutions',content:'Generate as many ideas as possible without judging them. Wild ideas are fine at this stage. Quantity over quality. No criticism yet.'},
      {title:'Evaluate Solutions',content:'Now review each idea. What are the realistic pros and cons of each approach? Rate them by feasibility and likely effectiveness.'},
      {title:'Choose and Act',content:'Pick the most promising solution and commit to it. Break it into the smallest possible first step — one action you can take right now.'},
      {title:'Review',content:'After acting, review: did it work? If not, that is not failure — that is data. Try the next idea. Problem solving is a process, not a one-shot event.'},
    ]
  },
];

interface Props { onBack: () => void; }

export default function CBTScreen({ onBack }: Props) {
  const [selected, setSelected] = useState<typeof EXERCISES[0] | null>(null);
  const [step, setStep] = useState(0);

  function openExercise(ex: typeof EXERCISES[0]) { setSelected(ex); setStep(0); }
  function back() {
    if (selected) { setSelected(null); }
    else { onBack(); }
  }

  // ── Exercise step view ───────────────────────────────────────────────────
  if (selected) {
    const total = selected.steps.length;
    const s = selected.steps[step];
    const pct = ((step + 1) / total) * 100;
    return (
      <div className="flex flex-col h-full bg-gray-50">
        <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0 bg-white">
          <button onClick={back} className="p-2 text-slate-500 hover:text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="text-center flex-grow min-w-0">
            <h1 className="font-bold text-base text-gray-800 truncate px-2">{selected.title}</h1>
          </div>
          <div className="w-10" />
        </header>
        <div className="flex-grow p-5 flex flex-col overflow-hidden">
          {/* Progress */}
          <div className="mb-4 flex-shrink-0">
            <div className="flex justify-between items-center mb-1">
              <p className="text-sm font-semibold text-teal-600">Step {step + 1} of {total}</p>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-teal-500 h-2 rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
          {/* Content */}
          <div className="bg-white p-6 rounded-2xl shadow-sm flex-grow overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{s.title}</h2>
            <p className="text-gray-600 leading-relaxed text-base">{s.content}</p>
          </div>
          {/* Nav */}
          <div className="mt-4 flex justify-between items-center flex-shrink-0">
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-6 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors hover:bg-gray-50">
              Prev
            </button>
            {step < total - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                className="bg-teal-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-teal-700 transition-colors">
                Next
              </button>
            ) : (
              <button onClick={back}
                className="bg-emerald-600 text-white font-semibold py-2 px-6 rounded-xl hover:bg-emerald-700 transition-colors">
                ✓ Finish
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Exercise list ────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="flex items-center p-4 border-b border-gray-200 flex-shrink-0 bg-white">
        <button onClick={onBack} className="p-2 text-slate-500 hover:text-slate-800">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center flex-grow">
          <h1 className="font-bold text-lg text-gray-800">CBT Guides</h1>
        </div>
        <div className="w-10" />
      </header>
      <div className="flex-grow p-4 overflow-y-auto">
        <p className="text-gray-500 text-sm text-center mb-4">Interactive exercises to build powerful coping skills.</p>
        <div className="space-y-3">
          {EXERCISES.map(ex => (
            <button key={ex.id} onClick={() => openExercise(ex)}
              className="w-full bg-white p-4 rounded-2xl shadow-sm flex items-center text-left transition-transform duration-200 active:scale-95">
              <div className="bg-teal-100 text-teal-600 p-3 rounded-full mr-4 flex-shrink-0">{ex.icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800">{ex.title}</h3>
                <p className="text-sm text-gray-500">{ex.desc}</p>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
