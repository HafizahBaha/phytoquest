import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Shield, Bug, Droplet, Map as MapIcon, Award, User, MessageSquare, ChevronRight, CheckCircle2, XCircle, Search, Wind, Activity, Lock } from 'lucide-react';

// --- DATA & CONFIGURATION ---
const COURSE_INFO = {
  code: 'BAPS 2211',
  title: 'Plant Pathology',
  university: 'IIUM'
};

const BADGES = {
  novice: { id: 'novice', name: 'Novice Diagnostician', icon: Search, color: 'text-blue-600', bg: 'bg-blue-100' },
  bacteria: { id: 'bacteria', name: 'Bacterial Buster', icon: Bug, color: 'text-green-600', bg: 'bg-green-100' },
  fungal: { id: 'fungal', name: 'Fungal Forecaster', icon: Droplet, color: 'text-purple-600', bg: 'bg-purple-100' },
  vector: { id: 'vector', name: 'Vector Vanguard', icon: Activity, color: 'text-red-600', bg: 'bg-red-100' },
  epi: { id: 'epi', name: 'Epidemiology Expert', icon: Wind, color: 'text-teal-600', bg: 'bg-teal-100' },
  master: { id: 'master', name: 'Master of Management', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100' }
};

const MISSION_META = [
  { id: 'phase1', title: 'The Gombak Durian', desc: 'Phase 1: Disease Concepts', reqBadge: null, awardBadge: 'novice', loc: 'Gombak, Selangor' },
  { id: 'phase2', title: 'The Kedah Paddy Crisis', desc: 'Phase 2: Bacterial Outbreak', reqBadge: 'novice', awardBadge: 'bacteria', loc: 'Kuala Muda, Kedah' },
  { id: 'phase3', title: 'The Estate Emergency', desc: 'Phase 3: Fungal Threat', reqBadge: 'bacteria', awardBadge: 'fungal', loc: 'Banting, Selangor' },
  { id: 'phase4', title: 'The Greenhouse Mystery', desc: 'Phase 4: Viruses & Nematodes', reqBadge: 'fungal', awardBadge: 'vector', loc: 'Cameron Highlands' },
  { id: 'phase5', title: 'The Monsoon Modeler', desc: 'Phase 5: Epidemiology', reqBadge: 'vector', awardBadge: 'epi', loc: 'Pasir Mas, Kelantan' },
  { id: 'phase6', title: 'The Final Strategy', desc: 'Phase 6: Disease Management', reqBadge: 'epi', awardBadge: 'master', loc: 'Putrajaya (HQ)' },
];

// Complete Branching dialogue logic for ALL phases
const SCENARIOS = {
  phase1: {
    start: {
      character: 'Pakcik Ahmad (Gardener)',
      text: "Assalamualaikum. The Durian tree in our community garden is dying. The leaves are yellowing and dropping off, and a branch just died completely. Is it lacking fertilizer?",
      options: [
        { text: "Ask about watering routine.", next: 'water' },
        { text: "Examine the trunk and roots.", next: 'roots' }
      ]
    },
    water: {
      character: 'Pakcik Ahmad',
      text: "I water it every day, heavily! Especially since the weather has been hot. The soil is always wet.",
      clue: "Overwatering creates waterlogged soil, favoring certain soil-borne pathogens.",
      options: [
        { text: "Examine the trunk and roots.", next: 'roots' }
      ]
    },
    roots: {
      character: 'System Observation',
      text: "You dig slightly around the base. The roots are dark brown and mushy instead of firm and white. You also notice dark, weeping cankers (lesions) on the lower trunk.",
      clue: "Mushy roots and trunk cankers in waterlogged soil are classic signs of Phytophthora species.",
      options: [
        { text: "Make a diagnosis.", next: 'diagnosis' }
      ]
    },
    diagnosis: {
      character: 'Diagnostic Lab',
      text: "Based on the waterlogged soil, mushy root rot, and trunk cankers, what is the primary cause?",
      options: [
        { text: "A) Abiotic: Nutrient Deficiency", next: 'wrong_abiotic' },
        { text: "B) Biotic: Phytophthora palmivora (Oomycete)", next: 'correct' },
        { text: "C) Biotic: Leaf-eating Insects", next: 'wrong_insect' }
      ]
    },
    wrong_abiotic: { character: 'System Result', text: "Incorrect. Nutrient deficiency wouldn't cause mushy, rotting roots or oozing cankers.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    wrong_insect: { character: 'System Result', text: "Incorrect. There are no signs of chewed leaves or insect presence.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    correct: { character: 'System Result', text: "Correct! Phytophthora palmivora thrives in overly wet conditions causing root rot and patch canker. You advise him to improve drainage.", isSuccess: true, options: [{ text: "Claim Novice Badge", next: 'finish' }] }
  },

  phase2: {
    start: {
      character: 'Pak Abu (Farmer)',
      text: "My paddy field in Kedah is dying. The leaves have these weird yellow-orange stripes and they are withering away. I'm losing my crop!",
      options: [
        { text: "Ask about recent weather.", next: 'weather' },
        { text: "Ask about fertilizer usage.", next: 'fertilizer' },
        { text: "Inspect the leaves closely.", next: 'inspect_leaves' }
      ]
    },
    weather: { character: 'Pak Abu', text: "It's been raining heavily the past two weeks, with very strong winds.", clue: "Strong winds and rain splash spread bacterial pathogens.", options: [{ text: "Ask about fertilizer usage.", next: 'fertilizer' }, { text: "Inspect the leaves closely.", next: 'inspect_leaves' }] },
    fertilizer: { character: 'Pak Abu', text: "I applied double the usual amount of Urea (Nitrogen) fertilizer last month.", clue: "Excessive nitrogen makes plant tissues softer and more susceptible to bacterial infection.", options: [{ text: "Ask about recent weather.", next: 'weather' }, { text: "Inspect the leaves closely.", next: 'inspect_leaves' }] },
    inspect_leaves: {
      character: 'System Observation',
      text: "You see water-soaked lesions turning yellow-white. You notice a cloudy, milky drop of liquid oozing from the cut edges of the leaves.",
      clue: "Milky ooze is a classic sign of bacterial ooze.",
      options: [{ text: "Make a diagnosis.", next: 'diagnosis' }, { text: "Ask more questions.", next: 'start' }]
    },
    diagnosis: {
      character: 'Diagnostic Lab',
      text: "Based on the symptoms and history, what is the pathogen?",
      options: [
        { text: "A) Rice Blast (Magnaporthe oryzae)", next: 'wrong_fungal' },
        { text: "B) Bacterial Leaf Blight (Xanthomonas oryzae)", next: 'correct' }
      ]
    },
    wrong_fungal: { character: 'System Result', text: "Incorrect. Rice Blast typically presents with diamond-shaped lesions, not bacterial ooze.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    correct: { character: 'System Result', text: "Correct! The milky ooze is a definitive sign of Bacterial Leaf Blight. High nitrogen and wind exacerbated the spread.", isSuccess: true, options: [{ text: "Claim Bacterial Badge", next: 'finish' }] }
  },

  phase3: {
    start: {
      character: 'Manager Lim (Estate Manager)',
      text: "We have an emergency at Ladang Sawit Sejahtera. Several mature oil palms have collapsing fronds (skirt-like appearance), and some have died completely.",
      options: [
        { text: "Inspect the base of the dying trunks.", next: 'base' },
        { text: "Ask about the previous crop planted here.", next: 'history' }
      ]
    },
    history: {
      character: 'Manager Lim',
      text: "This is a second-generation planting. The previous crop was also oil palm. We didn't fully clear the old stumps.",
      clue: "Old rotting stumps act as a massive inoculum source for soil-borne fungi.",
      options: [{ text: "Inspect the base of the trunks.", next: 'base' }]
    },
    base: {
      character: 'System Observation',
      text: "At the base of the infected palms, you find hard, woody, bracket-like structures growing out of the trunk. They have a shiny, reddish-brown upper surface and a white margin.",
      clue: "These are basidiocarps (fruiting bodies) of a white-rot fungus.",
      options: [{ text: "Make a diagnosis.", next: 'diagnosis' }]
    },
    diagnosis: {
      character: 'Diagnostic Lab',
      text: "What is causing the Basal Stem Rot in these oil palms?",
      options: [
        { text: "A) Ganoderma boninense", next: 'correct' },
        { text: "B) Fusarium oxysporum", next: 'wrong_fusarium' }
      ]
    },
    wrong_fusarium: { character: 'System Result', text: "Incorrect. Fusarium causes vascular wilt, but does not produce large woody brackets at the trunk base.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    correct: { character: 'System Result', text: "Correct! Ganoderma boninense causes Basal Stem Rot, the most devastating disease of oil palm in Malaysia.", isSuccess: true, options: [{ text: "Claim Fungal Badge", next: 'finish' }] }
  },

  phase4: {
    start: {
      character: 'Makcik Kiah (Hydroponic Farmer)',
      text: "My greenhouse is a disaster! The papaya leaves are mottled with light and dark green patches, and my tomato plants look stunted and wilted during the day.",
      options: [
        { text: "Inspect papaya leaves for insects.", next: 'insects' },
        { text: "Pull up a tomato plant and check roots.", next: 'roots' }
      ]
    },
    insects: {
      character: 'System Observation',
      text: "You find clusters of tiny, soft-bodied green insects (Aphids) on the underside of the papaya leaves. The leaves show a distinct 'mosaic' pattern.",
      clue: "Aphids are notorious vectors for plant viruses.",
      options: [{ text: "Check the tomato roots.", next: 'roots' }, { text: "Make diagnosis.", next: 'diagnosis' }]
    },
    roots: {
      character: 'System Observation',
      text: "The tomato roots are not smooth. They are covered in large, irregular swollen knots or galls.",
      clue: "Root galls block water uptake, causing the daytime wilting.",
      options: [{ text: "Check papaya for insects.", next: 'insects' }, { text: "Make diagnosis.", next: 'diagnosis' }]
    },
    diagnosis: {
      character: 'Diagnostic Lab',
      text: "You have identified two different pathogens. What are they?",
      options: [
        { text: "A) Papaya Ringspot Virus & Root-Knot Nematodes", next: 'correct' },
        { text: "B) Fungal Leaf Spot & Bacterial Wilt", next: 'wrong' }
      ]
    },
    wrong: { character: 'System Result', text: "Incorrect. Fungi and bacteria don't typically cause mosaic leaf patterns or large root galls.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    correct: { character: 'System Result', text: "Correct! The aphids transmitted the PRSV to the papaya, while Meloidogyne nematodes caused the galls on the tomatoes.", isSuccess: true, options: [{ text: "Claim Vector Badge", next: 'finish' }] }
  },

  phase5: {
    start: {
      character: 'Met Dept. Alert System',
      text: "ALERT: Continuous heavy monsoon rain forecasted for Pasir Mas for the next 7 days. Relative humidity expected to remain >90%. Temperature 25-28°C.",
      options: [
        { text: "Check local crop status.", next: 'crop' }
      ]
    },
    crop: {
      character: 'DOA Database',
      text: "Pasir Mas region: 500 hectares of Paddy currently in the highly susceptible 'tillering' to 'panicle initiation' stage. Variety planted: MR219.",
      clue: "The Disease Triangle (Susceptible Host + Favorable Environment + Pathogen presence) is complete.",
      options: [{ text: "Run Epidemiology Model.", next: 'diagnosis' }]
    },
    diagnosis: {
      character: 'Epidemiology Simulator',
      text: "Given the high humidity (>90%) and susceptible growth stage, what epidemic is at highest risk of explosive polycyclic spread right now?",
      options: [
        { text: "A) Tungro Virus", next: 'wrong_tungro' },
        { text: "B) Rice Blast (Magnaporthe oryzae)", next: 'correct' }
      ]
    },
    wrong_tungro: { character: 'System Result', text: "Incorrect. Tungro spread depends on leafhopper vector populations, not just high humidity and rain.", isError: true, options: [{ text: "Try Again", next: 'diagnosis' }] },
    correct: { character: 'System Result', text: "Correct! Rice Blast spores require high humidity to infect. A polycyclic epidemic is imminent. You must issue an early warning!", isSuccess: true, options: [{ text: "Claim Epidemiology Badge", next: 'finish' }] }
  },

  phase6: {
    start: {
      character: 'Director General of Agriculture',
      text: "Welcome to HQ. We are facing a severe Ganoderma outbreak in a region mixed with oil palm and cash crops. We cannot rely solely on chemical fungicides anymore. We need an Integrated Pest Management (IPM) strategy.",
      options: [
        { text: "Draft IPM Proposal.", next: 'draft' }
      ]
    },
    draft: {
      character: 'Strategy Board',
      text: "Which combination represents the most effective and sustainable IPM strategy for soil-borne diseases like Ganoderma?",
      options: [
        { text: "A) Increase fertilizer, spray systemic fungicides monthly, ignore weeds.", next: 'wrong' },
        { text: "B) Proper sanitation (stump removal), planting tolerant varieties, and applying Trichoderma (biocontrol).", next: 'correct' }
      ]
    },
    wrong: { character: 'System Result', text: "Incorrect. Heavy chemical use is unsustainable, expensive, and does not address the inoculum source in the old stumps.", isError: true, options: [{ text: "Revise Strategy", next: 'draft' }] },
    correct: { character: 'System Result', text: "Excellent! Sanitation removes the inoculum, tolerant genes provide defense, and Trichoderma acts as a biological antagonist. This aligns perfectly with sustainable agriculture.", isSuccess: true, options: [{ text: "Claim Master Badge", next: 'finish' }] }
  }
};

// --- COMPONENTS ---

export default function App() {
  const [currentView, setCurrentView] = useState('home'); 
  const [earnedBadges, setEarnedBadges] = useState([]); // Start with empty array
  const [activePhase, setActivePhase] = useState(null);
  const [missionState, setMissionState] = useState('start');
  const [chatHistory, setChatHistory] = useState([]);
  
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  // Navigation handlers
  const goHome = () => setCurrentView('home');
  const goDashboard = () => setCurrentView('dashboard');
  
  const startPhase = (phaseId) => {
    setActivePhase(phaseId);
    setMissionState('start');
    setChatHistory([{ ...SCENARIOS[phaseId]['start'], id: Date.now() }]);
    setCurrentView('mission');
  };

  const handleMissionChoice = (nextStepKey) => {
    if (nextStepKey === 'finish') {
      const awardBadge = MISSION_META.find(m => m.id === activePhase).awardBadge;
      if (!earnedBadges.includes(awardBadge)) {
        setEarnedBadges([...earnedBadges, awardBadge]);
      }
      setCurrentView('dashboard');
      return;
    }

    const nextStep = SCENARIOS[activePhase][nextStepKey];
    setMissionState(nextStepKey);
    setChatHistory([...chatHistory, { ...nextStep, id: Date.now() }]);
  };

  const resetProgress = () => {
    if(window.confirm("Are you sure you want to reset all your progress?")) {
      setEarnedBadges([]);
      setCurrentView('home');
    }
  };

  return (
    <div className="min-h-screen bg-green-50 text-gray-800 font-sans">
      {/* Top Navigation */}
      <nav className="bg-green-700 text-white p-4 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}>
          <Leaf className="w-6 h-6" />
          <span className="font-bold text-xl tracking-wide flex items-center gap-2">
            PhytoQuest
          </span>
        </div>
        <div className="flex space-x-4">
          <button onClick={goDashboard} className="hover:text-green-200 transition-colors flex items-center text-sm font-medium">
            <User className="w-4 h-4 mr-1" /> Profile
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="max-w-md mx-auto bg-white min-h-[calc(100vh-64px)] shadow-lg overflow-hidden relative">
        
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <div className="p-8 flex flex-col items-center justify-center text-center h-[calc(100vh-64px)] overflow-y-auto">
            <div className="bg-green-100 p-6 rounded-full mb-6 mt-4 shadow-inner">
              <Leaf className="w-16 h-16 text-green-600" />
            </div>
            <h1 className="text-3xl font-extrabold text-green-800 mb-2">PhytoQuest</h1>
            <h2 className="text-sm text-gray-500 font-bold mb-6 uppercase tracking-wider">{COURSE_INFO.university} • {COURSE_INFO.code}</h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-sm">
              Welcome to your interactive plant pathology lab. Complete all 6 phases to master disease diagnosis, epidemiology, and management.
            </p>
            <button 
              onClick={goDashboard}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transition-transform transform hover:scale-105 flex items-center justify-center text-lg"
            >
              Enter Dashboard <ChevronRight className="ml-2 w-5 h-5" />
            </button>
          </div>
        )}

        {/* VIEW: DASHBOARD */}
        {currentView === 'dashboard' && (
          <div className="p-6 bg-gray-50 h-[calc(100vh-64px)] overflow-y-auto">
            
            {/* Badges Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-200 pb-2 inline-block mb-4">Your Badges ({earnedBadges.length}/6)</h2>
              <div className="grid grid-cols-3 gap-3">
                {Object.values(BADGES).map(badge => {
                  const isEarned = earnedBadges.includes(badge.id);
                  const Icon = badge.icon;
                  return (
                    <div key={badge.id} className={`p-3 rounded-xl border-2 flex flex-col items-center text-center transition-all ${isEarned ? `${badge.bg} border-transparent shadow-sm transform hover:scale-105` : 'bg-white border-dashed border-gray-300 opacity-50 grayscale'}`}>
                      <Icon className={`w-6 h-6 mb-2 ${isEarned ? badge.color : 'text-gray-400'}`} />
                      <span className={`text-[10px] leading-tight font-bold ${isEarned ? 'text-gray-800' : 'text-gray-400'}`}>{badge.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Missions List */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 border-b-2 border-green-200 pb-2 inline-block mb-4">Field Missions</h2>
              
              <div className="space-y-4">
                {MISSION_META.map((mission, idx) => {
                  const isCompleted = earnedBadges.includes(mission.awardBadge);
                  const isUnlocked = mission.reqBadge === null || earnedBadges.includes(mission.reqBadge);
                  
                  return (
                    <div key={mission.id} className={`bg-white rounded-xl shadow-sm border p-4 relative overflow-hidden transition-all ${isUnlocked ? 'border-gray-200' : 'border-gray-100 opacity-60'}`}>
                      
                      {!isUnlocked && (
                        <div className="absolute inset-0 bg-gray-50/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
                           <div className="bg-white p-2 rounded-full shadow-sm"><Lock className="w-5 h-5 text-gray-400" /></div>
                        </div>
                      )}

                      {isUnlocked && !isCompleted && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg">URGENT</div>
                      )}

                      <h3 className="font-bold text-md text-gray-800 mb-1">{mission.title}</h3>
                      <p className="text-xs text-green-700 font-semibold mb-3">{mission.desc}</p>
                      
                      <div className="flex items-center text-xs text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <MapIcon className="w-3 h-3 mr-2 text-green-600" /> {mission.loc}
                      </div>
                      
                      {isCompleted ? (
                        <button disabled className="w-full bg-green-50 text-green-700 text-sm font-bold py-2.5 px-4 rounded-lg flex items-center justify-center border border-green-200">
                          <CheckCircle2 className="w-4 h-4 mr-2" /> Completed
                        </button>
                      ) : (
                        <button 
                          disabled={!isUnlocked}
                          onClick={() => startPhase(mission.id)}
                          className={`w-full text-white text-sm font-bold py-2.5 px-4 rounded-lg flex items-center justify-center shadow-md transition-colors ${isUnlocked ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-300'}`}
                        >
                          Start Phase <ChevronRight className="w-4 h-4 ml-1" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {earnedBadges.length === 6 && (
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl p-6 text-white text-center shadow-lg animate-bounce mt-4">
                <Award className="w-16 h-16 mx-auto mb-2 text-yellow-100" />
                <h2 className="text-2xl font-bold">Course Completed!</h2>
                <p className="text-sm mt-2 opacity-90">You are a Master Plant Pathologist.</p>
              </div>
            )}

            <button onClick={resetProgress} className="text-xs text-gray-400 underline w-full text-center mt-12 mb-4 pb-4">Reset Course Progress</button>
          </div>
        )}

        {/* VIEW: MISSION (INTERACTIVE CHAT) */}
        {currentView === 'mission' && activePhase && (
          <div className="flex flex-col h-[calc(100vh-64px)] bg-gray-50">
            {/* Chat Header */}
            <div className="bg-white border-b px-4 py-3 flex items-center shadow-sm z-10">
               <button onClick={goDashboard} className="mr-3 text-gray-500 hover:text-green-600">
                 <ChevronRight className="w-6 h-6 rotate-180" />
               </button>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 leading-tight text-sm">{MISSION_META.find(m=>m.id === activePhase).title}</h3>
                <span className="text-xs text-green-600 font-medium">Live connection...</span>
              </div>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-[200px]">
              {chatHistory.map((chat) => (
                <div key={chat.id} className={`flex flex-col ${chat.character === 'System Result' ? 'items-center' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  
                  {chat.character !== 'System Result' && (
                    <span className="text-[10px] font-bold text-gray-400 ml-1 mb-1 uppercase tracking-wider">{chat.character}</span>
                  )}
                  
                  <div className={`p-4 rounded-2xl max-w-[92%] shadow-sm ${
                    chat.character.includes('(Farmer)') || chat.character.includes('(Gardener)') || chat.character.includes('(Estate Manager)') 
                      ? 'bg-white border border-gray-200 rounded-tl-none text-gray-700' : 
                    chat.character === 'System Observation' || chat.character === 'DOA Database' || chat.character === 'Met Dept. Alert System'
                      ? 'bg-blue-50 border border-blue-200 text-blue-900 rounded-tl-none' :
                    chat.character === 'Diagnostic Lab' || chat.character === 'Epidemiology Simulator' || chat.character === 'Strategy Board'
                      ? 'bg-purple-50 border border-purple-200 text-purple-900' :
                    chat.isSuccess ? 'bg-green-50 border-2 border-green-500 text-green-900 text-center w-full shadow-md' :
                    chat.isError ? 'bg-red-50 border border-red-200 text-red-900 text-center w-full' :
                    'bg-white'
                  }`}>
                    
                    {chat.isSuccess && <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />}
                    {chat.isError && <XCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />}
                    
                    <p className="text-sm leading-relaxed">{chat.text}</p>
                    
                    {chat.clue && (
                      <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 flex items-start shadow-inner">
                        <span className="font-bold mr-1 block mt-0.5">💡 Note:</span> 
                        <span>{chat.clue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Options Panel (Fixed at bottom) */}
            <div className="bg-white border-t p-4 absolute bottom-0 w-full rounded-t-2xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-20">
              <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-wide">Select your action:</p>
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 pb-2">
                {SCENARIOS[activePhase][missionState]?.options.map((option, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleMissionChoice(option.next)}
                    className="w-full text-left bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-400 text-gray-700 hover:text-green-800 font-medium py-3 px-4 rounded-xl text-sm transition-all shadow-sm active:scale-[0.98]"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}