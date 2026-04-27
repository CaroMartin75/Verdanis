import { useState, useEffect, useCallback } from “react”;

// ─────────────────────────────────────────────────────────────
// GLOBAL SEED DATA — relational, plants are the single source of truth
// ─────────────────────────────────────────────────────────────
const SEED_PLANTS = [
{
id: “p1”, name: “Lavanda”, emoji: “💜”, family: “Lamiaceae”,
description: “Arbusto aromático mediterráneo. Ideal para bordes y atraer polinizadores.”,
heightCm: [60, 90], diameterCm: [60, 80],
floweringSeason: [“Primavera”, “Verano”], flowerColor: “#b39ddb”,
lifecycle: “perenne”, role: [“estructura”, “floración”, “aromática”],
offseason: “Mantiene follaje gris plateado en invierno. Pierde vigor pero no muere.”,
waterDays: 10, sunlight: “pleno sol”, zone: [“templada”, “mediterránea”],
tags: [“sequía”, “polinizadores”, “perfume”],
communityNotes: [
{ user: “MartaB”, date: “2024-08”, text: “Podé en agosto post-floración y brotó increíble en primavera.” },
{ user: “GardensBA”, date: “2024-03”, text: “En Buenos Aires conviene protegerla de heladas fuertes con mulch.” }
],
plantOfDay: false,
images: []
},
{
id: “p2”, name: “Tomate Cherry”, emoji: “🍅”, family: “Solanaceae”,
description: “Variedad pequeña y productiva. Ideal para macetas y huerta urbana.”,
heightCm: [100, 180], diameterCm: [40, 60],
floweringSeason: [“Verano”], flowerColor: “#fff176”,
lifecycle: “anual”, role: [“producción”, “floración”],
offseason: “Planta anual — muere con el frío. Recolectar semillas para próxima temporada.”,
waterDays: 2, sunlight: “pleno sol”, zone: [“templada”, “subtropical”],
tags: [“comestible”, “huerta”, “maceta”],
communityNotes: [
{ user: “HuertoFeliz”, date: “2024-12”, text: “Siembro en octubre en Buenos Aires. Primera cosecha en enero.” }
],
plantOfDay: true,
images: []
},
{
id: “p3”, name: “Jacarandá”, emoji: “🌳”, family: “Bignoniaceae”,
description: “Árbol ornamental de floración espectacular, violeta intenso. Caducifolio.”,
heightCm: [600, 1500], diameterCm: [400, 800],
floweringSeason: [“Primavera”], flowerColor: “#7c4dff”,
lifecycle: “perenne”, role: [“estructura”, “sombra”, “floración”],
offseason: “Pierde hojas en invierno. La copa desnuda muestra su estructura escultural.”,
waterDays: 14, sunlight: “pleno sol”, zone: [“templada”, “subtropical”],
tags: [“árbol”, “sombra”, “icónico”],
communityNotes: [],
plantOfDay: false,
images: []
},
{
id: “p4”, name: “Albahaca”, emoji: “🌿”, family: “Lamiaceae”,
description: “Hierba aromática esencial. Compañera perfecta del tomate en la huerta.”,
heightCm: [30, 60], diameterCm: [20, 40],
floweringSeason: [“Verano”], flowerColor: “#ffffff”,
lifecycle: “anual”, role: [“producción”, “aromática”],
offseason: “Muere con el frío. Dejar florecer al final para recolectar semillas.”,
waterDays: 2, sunlight: “semisombra”, zone: [“templada”, “subtropical”],
tags: [“comestible”, “aromática”, “compañera”],
communityNotes: [
{ user: “MartaB”, date: “2024-01”, text: “Pinchar las flores para que produzca más hojas durante más tiempo.” }
],
plantOfDay: false,
images: []
}
];

const SEED_GARDENS = [
{
id: “g1”, name: “Mi jardín principal”, location: “Buenos Aires”, zone: “templada”,
beds: [
{ id: “b1”, name: “Cantero frontal”, shape: “rect”, w: 4, h: 1.5, plantIds: [“p1”, “p3”] },
{ id: “b2”, name: “Huerta”, shape: “rect”, w: 3, h: 2, plantIds: [“p2”, “p4”] },
]
}
];

const SEED_TASKS = [
{ id: “t1”, plantId: “p1”, gardenId: “g1”, bedId: “b1”, type: “poda”, date: “2024-08-15”, note: “Poda post-floración. Quedó muy compacta.”, learnedPattern: true },
{ id: “t2”, plantId: “p2”, gardenId: “g1”, bedId: “b2”, type: “siembra”, date: “2024-10-10”, note: “Siembra en almácigo. Germinó en 8 días.”, learnedPattern: true },
{ id: “t3”, plantId: “p4”, gardenId: “g1”, bedId: “b2”, type: “poda”, date: “2025-01-20”, note: “Pinché flores para prolongar cosecha.”, learnedPattern: false },
];

const SEED_RECORDS = [
{ id: “r1”, plantId: “p1”, gardenId: “g1”, date: “2025-04-01”, text: “La lavanda comenzó a brotar con fuerza luego de la poda de agosto.”, evolution: “positiva” },
{ id: “r2”, plantId: “p2”, gardenId: “g1”, date: “2025-01-15”, text: “Primera cosecha de cherry, abundante. Unas 300g esta semana.”, evolution: “positiva” },
];

const SEED_PESTS = [
{ id: “pe1”, plantId: “p2”, name: “Mosca blanca”, date: “2024-12-20”, treatment: “Jabón potásico + agua. Aplicar cada 5 días x 2 semanas.”, resolved: true },
];

const MONTHS = [“Enero”,“Febrero”,“Marzo”,“Abril”,“Mayo”,“Junio”,“Julio”,“Agosto”,“Septiembre”,“Octubre”,“Noviembre”,“Diciembre”];
const SEASONS = { “Dic-Feb”: “Verano”, “Mar-May”: “Otoño”, “Jun-Ago”: “Invierno”, “Sep-Nov”: “Primavera” };
const TASK_TYPES = [“riego”, “poda”, “fertilización”, “siembra”, “trasplante”, “cosecha”, “tratamiento”, “observación”, “otro”];
const LIFECYCLE_LABEL = { anual: “🌱 Anual”, bianual: “🌿 Bianual”, perenne: “🌳 Perenne” };

function getCurrentSeason() {
const m = new Date().getMonth();
if (m >= 11 || m <= 1) return “Verano”;
if (m >= 2 && m <= 4) return “Otoño”;
if (m >= 5 && m <= 7) return “Invierno”;
return “Primavera”;
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function JardinApp() {
const [plants, setPlants] = useState(SEED_PLANTS);
const [gardens, setGardens] = useState(SEED_GARDENS);
const [tasks, setTasks] = useState(SEED_TASKS);
const [records, setRecords] = useState(SEED_RECORDS);
const [pests, setPests] = useState(SEED_PESTS);

const [activeSection, setActiveSection] = useState(“inicio”);
const [activeGarden, setActiveGarden] = useState(“g1”);
const [selectedPlantId, setSelectedPlantId] = useState(null);
const [isPublicView, setIsPublicView] = useState(false);
const [searchQ, setSearchQ] = useState(””);

const garden = gardens.find(g => g.id === activeGarden);

// Relational helper — get all data about a plant across the app
const getPlantContext = useCallback((plantId) => {
const plant = plants.find(p => p.id === plantId);
const plantTasks = tasks.filter(t => t.plantId === plantId);
const plantRecords = records.filter(r => r.plantId === plantId);
const plantPests = pests.filter(p => p.plantId === plantId);
const inBeds = gardens.flatMap(g => g.beds.filter(b => b.plantIds.includes(plantId)).map(b => ({ …b, gardenName: g.name })));
return { plant, tasks: plantTasks, records: plantRecords, pests: plantPests, inBeds };
}, [plants, tasks, records, pests, gardens]);

const updatePlantNote = (plantId, note) => {
setPlants(prev => prev.map(p => p.id === plantId
? { …p, communityNotes: […p.communityNotes, { user: “Yo”, date: new Date().toISOString().slice(0,7), text: note }] }
: p
));
};

const addTask = (task) => {
const newTask = { …task, id: “t” + Date.now(), learnedPattern: true };
setTasks(prev => […prev, newTask]);
// If task has a note, also add as record
if (task.note) {
setRecords(prev => […prev, { id: “r” + Date.now(), plantId: task.plantId, gardenId: task.gardenId, date: task.date, text: `[${task.type.toUpperCase()}] ${task.note}`, evolution: “neutral” }]);
}
};

const plantOfDay = plants.find(p => p.plantOfDay) || plants[0];

const navItems = [
{ id: “inicio”, label: “Inicio”, icon: “🏡” },
{ id: “plantas”, label: “Plantas”, icon: “🌿” },
{ id: “tareas”, label: “Tareas”, icon: “✅” },
{ id: “calendario”, label: “Calendario”, icon: “📅” },
{ id: “diseno”, label: “Diseño”, icon: “📐” },
{ id: “plagas”, label: “Plagas”, icon: “🐛” },
{ id: “comunidad”, label: “Comunidad”, icon: “🌍” },
];

return (
<div style={{ minHeight: “100vh”, background: “#f5f0e8”, fontFamily: “‘Palatino Linotype’, ‘Book Antiqua’, Palatino, serif”, color: “#2c2416” }}>
<style>{`
* { box-sizing: border-box; }
::-webkit-scrollbar { width: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #b8a882; border-radius: 2px; }
input, textarea, select { font-family: inherit; }
.plant-link { color: #5a8a3c; text-decoration: underline dotted; cursor: pointer; }
.plant-link:hover { color: #3a6a20; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.fade-in { animation: fadeIn 0.35s ease; }
.tag { display: inline-block; background: #e8f0d8; border: 1px solid #c8d8a8; border-radius: 20px; padding: 2px 10px; font-size: 12px; color: #4a6a2a; margin: 2px; }
.card { background: #fff; border: 1px solid #e0d8c8; border-radius: 12px; padding: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
.btn-primary { background: #4a7a2a; border: none; color: #fff; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 14px; transition: background 0.2s; }
.btn-primary:hover { background: #3a6a1a; }
.btn-secondary { background: transparent; border: 1px solid #b8a882; color: #6a5a3a; padding: 8px 14px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 13px; transition: all 0.2s; }
.btn-secondary:hover { background: #f0e8d8; }
.section-title { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #9a8a6a; margin-bottom: 12px; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; }
label { display: block; font-size: 11px; letter-spacing: 1px; text-transform: uppercase; color: #8a7a5a; margin-bottom: 5px; }
input[type=text], input[type=date], select, textarea { width: 100%; background: #faf8f3; border: 1px solid #ddd4c0; border-radius: 8px; padding: 9px 12px; font-size: 14px; color: #2c2416; outline: none; }
input[type=text]:focus, input[type=date]:focus, select:focus, textarea:focus { border-color: #8ab860; }

```
    /* ── RESPONSIVE LAYOUT ── */
    .app-shell { display: flex; flex-direction: column; min-height: 100vh; }

    /* Desktop: sidebar on left */
    @media (min-width: 768px) {
      .app-body { display: flex; flex: 1; }
      .sidebar { display: flex; flex-direction: column; width: 200px; background: #2c2416; min-height: calc(100vh - 56px); position: sticky; top: 56px; align-self: flex-start; flex-shrink: 0; padding: 20px 0; }
      .bottom-nav { display: none; }
      .main-content { flex: 1; padding: 24px 28px; overflow-x: hidden; }
    }

    /* Mobile: bottom nav bar */
    @media (max-width: 767px) {
      .app-body { display: flex; flex: 1; flex-direction: column; }
      .sidebar { display: none; }
      .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #2c2416; border-top: 2px solid #4a7a2a; z-index: 100; padding: 6px 0 10px; }
      .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; cursor: pointer; padding: 4px 2px; font-family: inherit; }
      .bottom-nav-item .nav-icon { font-size: 20px; }
      .bottom-nav-item .nav-label { font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase; }
      .main-content { flex: 1; padding: 16px 14px 90px; overflow-x: hidden; }
      .card { padding: 14px; }
      /* Stack all grids on mobile */
      .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }
      .grid-auto { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
      h2 { font-size: 20px !important; }
      .hide-mobile { display: none !important; }
    }
  `}</style>

  {/* TOP BAR */}
  <header style={{ background: "#2c2416", color: "#f5f0e8", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, position: "sticky", top: 0, zIndex: 50, borderBottom: "3px solid #4a7a2a", flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 20 }}>🌱</span>
      <span style={{ fontSize: 17, letterSpacing: 1 }}>Jardín</span>
      <span style={{ fontSize: 10, opacity: 0.4, letterSpacing: 2 }}>STUDIO</span>
    </div>
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <select value={activeGarden} onChange={e => setActiveGarden(e.target.value)}
        style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f5f0e8", borderRadius: 6, padding: "4px 8px", fontSize: 12, maxWidth: 130 }}>
        {gardens.map(g => <option key={g.id} value={g.id} style={{ color: "#000" }}>{g.name}</option>)}
      </select>
      <button onClick={() => setIsPublicView(v => !v)}
        style={{ background: isPublicView ? "#4a7a2a" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f5f0e8", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", whiteSpace: "nowrap" }}>
        {isPublicView ? "🌍" : "🔒"}
      </button>
    </div>
  </header>

  <div className="app-shell">
    <div className="app-body">

      {/* SIDEBAR — desktop only */}
      <aside className="sidebar">
        {navItems.map(item => (
          <button key={item.id} onClick={() => { setActiveSection(item.id); setSelectedPlantId(null); }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 22px", background: activeSection === item.id ? "rgba(74,122,42,0.4)" : "transparent", border: "none", borderLeft: activeSection === item.id ? "3px solid #8ab860" : "3px solid transparent", color: activeSection === item.id ? "#d4f0a8" : "#a08870", cursor: "pointer", fontSize: 14, textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
        <div style={{ margin: "20px 20px 0", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 16 }}>
          <div style={{ fontSize: 10, letterSpacing: 2, color: "#6a5a3a", marginBottom: 8 }}>MIS JARDINES</div>
          {gardens.map(g => (
            <button key={g.id} onClick={() => setActiveGarden(g.id)}
              style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", background: activeGarden === g.id ? "rgba(74,122,42,0.2)" : "transparent", border: "none", borderRadius: 6, color: activeGarden === g.id ? "#8ab860" : "#706050", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
              🌿 {g.name}
            </button>
          ))}
          <button onClick={() => {
            const name = prompt("Nombre del nuevo jardín:");
            if (name) setGardens(prev => [...prev, { id: "g" + Date.now(), name, location: "", zone: "templada", beds: [] }]);
          }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", background: "transparent", border: "none", color: "#4a6a2a", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
            ＋ Nuevo jardín
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        {selectedPlantId
          ? <PlantSheet plantId={selectedPlantId} getPlantContext={getPlantContext} onBack={() => setSelectedPlantId(null)} updatePlantNote={updatePlantNote} addTask={addTask} gardenId={activeGarden} plants={plants} setPlants={setPlants} />
          : (
            <div className="fade-in">
              {activeSection === "inicio" && <HomeSection plants={plants} garden={garden} tasks={tasks} records={records} plantOfDay={plantOfDay} setActiveSection={setActiveSection} setSelectedPlantId={setSelectedPlantId} />}
              {activeSection === "plantas" && <PlantsSection plants={plants} setPlants={setPlants} setSelectedPlantId={setSelectedPlantId} garden={garden} searchQ={searchQ} setSearchQ={setSearchQ} getPlantContext={getPlantContext} />}
              {activeSection === "tareas" && <TasksSection tasks={tasks} plants={plants} gardens={gardens} garden={garden} addTask={addTask} setSelectedPlantId={setSelectedPlantId} />}
              {activeSection === "calendario" && <CalendarSection tasks={tasks} plants={plants} garden={garden} setSelectedPlantId={setSelectedPlantId} />}
              {activeSection === "diseno" && <DesignSection garden={garden} gardens={gardens} setGardens={setGardens} plants={plants} setSelectedPlantId={setSelectedPlantId} activeGarden={activeGarden} />}
              {activeSection === "plagas" && <PestsSection pests={pests} setPests={setPests} plants={plants} garden={garden} setSelectedPlantId={setSelectedPlantId} />}
              {activeSection === "comunidad" && <CommunitySection plants={plants} updatePlantNote={updatePlantNote} setSelectedPlantId={setSelectedPlantId} />}
            </div>
          )
        }
      </main>
    </div>

    {/* BOTTOM NAV — mobile only */}
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button key={item.id} className="bottom-nav-item"
          onClick={() => { setActiveSection(item.id); setSelectedPlantId(null); }}
          style={{ color: activeSection === item.id ? "#8ab860" : "#706050" }}>
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
function HomeSection({ plants, garden, tasks, records, plantOfDay, setActiveSection, setSelectedPlantId }) {
const season = getCurrentSeason();
const today = new Date().toISOString().slice(0, 10);
const recentTasks = tasks.slice(-3).reverse();
const recentRecords = records.slice(-2).reverse();

return (
<div>
<div style={{ marginBottom: 28 }}>
<div className="section-title">Panel principal</div>
<h2 style={{ margin: 0, fontSize: 28, fontWeight: 400 }}>{garden?.name} <span style={{ fontSize: 16, color: “#8a7a5a” }}>— {season}</span></h2>
<div style={{ color: “#8a7a5a”, fontSize: 14, marginTop: 4 }}>{garden?.location} · Zona {garden?.zone}</div>
</div>

```
  <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
    <div className="card" style={{ borderLeft: "4px solid #4a7a2a" }}>
      <div style={{ fontSize: 28 }}>🌿</div>
      <div style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>{plants.length}</div>
      <div style={{ fontSize: 13, color: "#8a7a5a" }}>Plantas registradas</div>
    </div>
    <div className="card" style={{ borderLeft: "4px solid #e8a020" }}>
      <div style={{ fontSize: 28 }}>✅</div>
      <div style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>{tasks.length}</div>
      <div style={{ fontSize: 13, color: "#8a7a5a" }}>Tareas realizadas</div>
    </div>
    <div className="card" style={{ borderLeft: "4px solid #5a8ab0" }}>
      <div style={{ fontSize: 28 }}>📖</div>
      <div style={{ fontSize: 32, fontWeight: 400, marginTop: 4 }}>{records.length}</div>
      <div style={{ fontSize: 13, color: "#8a7a5a" }}>Registros de evolución</div>
    </div>
  </div>

  <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {/* Planta del día */}
    <div className="card" style={{ background: "linear-gradient(135deg, #1a3010, #2a5020)", color: "#e8f5d8", border: "none" }}>
      <div style={{ fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: "#8ab860", marginBottom: 12 }}>🌟 Planta del día</div>
      <div style={{ fontSize: 36 }}>{plantOfDay.emoji}</div>
      <div style={{ fontSize: 22, fontWeight: 400, margin: "8px 0 4px" }}>{plantOfDay.name}</div>
      <div style={{ fontSize: 13, color: "#a8d880", lineHeight: 1.6 }}>{plantOfDay.description}</div>
      <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 4 }}>
        {plantOfDay.tags.map(t => <span key={t} style={{ background: "rgba(138,184,96,0.2)", border: "1px solid rgba(138,184,96,0.3)", borderRadius: 20, padding: "2px 10px", fontSize: 11, color: "#a8d880" }}>{t}</span>)}
      </div>
      <button onClick={() => setSelectedPlantId(plantOfDay.id)} style={{ marginTop: 14, background: "rgba(138,184,96,0.2)", border: "1px solid rgba(138,184,96,0.4)", color: "#a8d880", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
        Ver ficha completa →
      </button>
    </div>

    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Actividad reciente */}
      <div className="card">
        <div className="section-title">Actividad reciente</div>
        {recentTasks.map(t => {
          const pl = plants.find(p => p.id === t.plantId);
          return (
            <div key={t.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
              <span style={{ fontSize: 20 }}>{pl?.emoji}</span>
              <div>
                <span className="plant-link" onClick={() => setSelectedPlantId(t.plantId)} style={{ fontSize: 14, fontWeight: 600 }}>{pl?.name}</span>
                <span style={{ fontSize: 13, color: "#8a7a5a" }}> — {t.type}</span>
                <div style={{ fontSize: 12, color: "#aaa090" }}>{t.date}</div>
                {t.note && <div style={{ fontSize: 13, color: "#6a5a3a", marginTop: 2, fontStyle: "italic" }}>"{t.note}"</div>}
              </div>
            </div>
          );
        })}
      </div>

      {/* Registros recientes */}
      <div className="card">
        <div className="section-title">Últimas observaciones</div>
        {recentRecords.map(r => {
          const pl = plants.find(p => p.id === r.plantId);
          return (
            <div key={r.id} style={{ marginBottom: 8 }}>
              <span className="plant-link" onClick={() => setSelectedPlantId(r.plantId)} style={{ fontSize: 14 }}>{pl?.emoji} {pl?.name}</span>
              <div style={{ fontSize: 13, color: "#6a5a3a", fontStyle: "italic", marginTop: 2 }}>"{r.text}"</div>
              <div style={{ fontSize: 11, color: "#aaa090" }}>{r.date}</div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// PLANT SHEET — full relational view of a single plant
// ─────────────────────────────────────────────────────────────
function PlantSheet({ plantId, getPlantContext, onBack, updatePlantNote, addTask, gardenId, plants, setPlants }) {
const [newNote, setNewNote] = useState(””);
const [newTaskType, setNewTaskType] = useState(“poda”);
const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().slice(0,10));
const [newTaskNote, setNewTaskNote] = useState(””);
const [editMode, setEditMode] = useState(false);
const [editData, setEditData] = useState({});

const ctx = getPlantContext(plantId);
const { plant, tasks: ptasks, records: precords, pests: ppests, inBeds } = ctx;

useEffect(() => {
if (plant) setEditData({ description: plant.description, notes: plant.offseason });
}, [plant]);

if (!plant) return null;

const handleAddNote = () => {
if (!newNote.trim()) return;
updatePlantNote(plantId, newNote);
setNewNote(””);
};

const handleAddTask = () => {
addTask({ plantId, gardenId, bedId: inBeds[0]?.id || “”, type: newTaskType, date: newTaskDate, note: newTaskNote });
setNewTaskNote(””);
};

const taskTypes_es = { poda: “✂️”, riego: “💧”, fertilización: “🌾”, siembra: “🌱”, trasplante: “🪴”, cosecha: “🧺”, tratamiento: “💊”, observación: “👁”, otro: “📝” };

return (
<div className="fade-in">
<button onClick={onBack} className=“btn-secondary” style={{ marginBottom: 20 }}>← Volver</button>

```
  {/* Header */}
  <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
    <div style={{ fontSize: 64 }}>{plant.emoji}</div>
    <div style={{ flex: 1 }}>
      <div className="section-title">Ficha de planta</div>
      <h2 style={{ margin: 0, fontSize: 32, fontWeight: 400 }}>{plant.name}</h2>
      <div style={{ fontSize: 14, color: "#8a7a5a", fontStyle: "italic", marginTop: 2 }}>{plant.family}</div>
      <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
        <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{LIFECYCLE_LABEL[plant.lifecycle]}</span>
        {plant.role.map(r => <span key={r} className="badge" style={{ background: "#f0e8d8", color: "#7a5a2a" }}>{r}</span>)}
        {plant.tags.map(t => <span key={t} className="tag">{t}</span>)}
      </div>
    </div>
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn-secondary" onClick={() => setEditMode(v => !v)}>{editMode ? "Cancelar" : "✏️ Editar"}</button>
      {editMode && <button className="btn-primary" onClick={() => { setPlants(prev => prev.map(p => p.id === plantId ? { ...p, description: editData.description, offseason: editData.notes } : p)); setEditMode(false); }}>Guardar</button>}
    </div>
  </div>

  <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {/* Left column */}
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      
      {/* Ficha técnica */}
      <div className="card">
        <div className="section-title">Ficha técnica</div>
        {editMode
          ? <><label>Descripción</label><textarea value={editData.description} rows={3} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} /><label style={{ marginTop: 10 }}>Contraestación</label><textarea value={editData.notes} rows={2} onChange={e => setEditData(d => ({ ...d, notes: e.target.value }))} /></>
          : <>
            <p style={{ margin: "0 0 12px", lineHeight: 1.7, color: "#4a3a2a" }}>{plant.description}</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
              <InfoRow icon="📏" label="Alto" value={`${plant.heightCm[0]}–${plant.heightCm[1]} cm`} />
              <InfoRow icon="⭕" label="Diámetro" value={`${plant.diameterCm[0]}–${plant.diameterCm[1]} cm`} />
              <InfoRow icon="☀️" label="Sol" value={plant.sunlight} />
              <InfoRow icon="💧" label="Riego" value={`cada ${plant.waterDays}d`} />
              <InfoRow icon="🌸" label="Floración" value={plant.floweringSeason.join(", ")} />
              <InfoRow icon="🎨" label="Color flor" value={<span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: plant.flowerColor, border: "1px solid #ddd" }} />{plant.flowerColor}</span>} />
            </div>
            <div style={{ marginTop: 12, padding: "10px 12px", background: "#f8f4ec", borderRadius: 8, fontSize: 13 }}>
              <strong style={{ color: "#8a5a2a" }}>🍂 Contraestación:</strong>
              <p style={{ margin: "4px 0 0", color: "#6a5a3a" }}>{plant.offseason}</p>
            </div>
          </>
        }
      </div>

      {/* Ubicación en jardines */}
      <div className="card">
        <div className="section-title">Ubicación en jardines</div>
        {inBeds.length === 0
          ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>No está ubicada en ningún cantero todavía.</p>
          : inBeds.map(b => (
            <div key={b.id} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 18 }}>📐</span>
              <div><strong style={{ fontSize: 14 }}>{b.name}</strong> <span style={{ fontSize: 12, color: "#8a7a5a" }}>en {b.gardenName}</span></div>
            </div>
          ))
        }
      </div>

      {/* Plagas */}
      {ppests.length > 0 && (
        <div className="card" style={{ borderLeft: "4px solid #e87040" }}>
          <div className="section-title">Historial de plagas</div>
          {ppests.map(p => (
            <div key={p.id} style={{ marginBottom: 8 }}>
              <span style={{ fontWeight: 600 }}>{p.name}</span>
              <span style={{ marginLeft: 8 }} className="badge" style={{ background: p.resolved ? "#e8f0d8" : "#ffe0d0", color: p.resolved ? "#4a7a2a" : "#c04020" }}>{p.resolved ? "Resuelto" : "Activo"}</span>
              <div style={{ fontSize: 13, color: "#6a5a3a", marginTop: 4 }}>{p.treatment}</div>
              <div style={{ fontSize: 11, color: "#aaa090" }}>{p.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Right column */}
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Add task */}
      <div className="card">
        <div className="section-title">Registrar tarea</div>
        <label>Tipo</label>
        <select value={newTaskType} onChange={e => setNewTaskType(e.target.value)} style={{ marginBottom: 10 }}>
          {TASK_TYPES.map(t => <option key={t} value={t}>{taskTypes_es[t] || "📝"} {t}</option>)}
        </select>
        <label>Fecha</label>
        <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} style={{ marginBottom: 10 }} />
        <label>Nota / observación</label>
        <textarea value={newTaskNote} rows={2} onChange={e => setNewTaskNote(e.target.value)} placeholder="¿Cómo quedó? ¿Qué observaste?" style={{ marginBottom: 10 }} />
        <button className="btn-primary" onClick={handleAddTask}>Guardar tarea</button>
      </div>

      {/* Task history */}
      <div className="card">
        <div className="section-title">Historial de tareas ({ptasks.length})</div>
        {ptasks.length === 0
          ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin tareas registradas aún.</p>
          : ptasks.map(t => (
            <div key={t.id} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
              <span style={{ fontSize: 20 }}>{taskTypes_es[t.type] || "📝"}</span>
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3a2a" }}>{t.type}</span>
                {t.learnedPattern && <span style={{ marginLeft: 6, fontSize: 10, background: "#e8f0d8", color: "#4a7a2a", padding: "1px 6px", borderRadius: 10 }}>patrón aprendido</span>}
                <div style={{ fontSize: 11, color: "#aaa090" }}>{t.date}</div>
                {t.note && <div style={{ fontSize: 13, color: "#6a5a3a", fontStyle: "italic" }}>"{t.note}"</div>}
              </div>
            </div>
          ))
        }
      </div>

      {/* Evolution records */}
      <div className="card">
        <div className="section-title">Evolución ({precords.length})</div>
        {precords.map(r => (
          <div key={r.id} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span>{r.evolution === "positiva" ? "📈" : r.evolution === "negativa" ? "📉" : "📊"}</span>
              <span style={{ fontSize: 11, color: "#aaa090" }}>{r.date}</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4a3a2a", fontStyle: "italic" }}>"{r.text}"</p>
          </div>
        ))}
      </div>

      {/* Community notes */}
      <div className="card">
        <div className="section-title">🌍 Notas de la comunidad ({plant.communityNotes.length})</div>
        {plant.communityNotes.map((n, i) => (
          <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
            <strong style={{ fontSize: 13 }}>{n.user}</strong>
            <span style={{ fontSize: 11, color: "#aaa090", marginLeft: 8 }}>{n.date}</span>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4a3a2a" }}>{n.text}</p>
          </div>
        ))}
        <label>Agregar nota personal / comunidad</label>
        <textarea value={newNote} rows={2} onChange={e => setNewNote(e.target.value)} placeholder="Tu observación sobre esta planta..." style={{ marginBottom: 8 }} />
        <button className="btn-primary" onClick={handleAddNote}>Publicar nota</button>
      </div>
    </div>
  </div>
</div>
```

);
}

function InfoRow({ icon, label, value }) {
return (
<div style={{ padding: “6px 0”, borderBottom: “1px solid #f5f0e8” }}>
<span style={{ fontSize: 14 }}>{icon}</span>
<span style={{ fontSize: 11, color: “#8a7a5a”, marginLeft: 4 }}>{label}: </span>
<span style={{ fontSize: 13, color: “#4a3a2a” }}>{value}</span>
</div>
);
}

// ─────────────────────────────────────────────────────────────
// PLANTS SECTION
// ─────────────────────────────────────────────────────────────
function PlantsSection({ plants, setPlants, setSelectedPlantId, garden, searchQ, setSearchQ, getPlantContext }) {
const [showAdd, setShowAdd] = useState(false);
const [newPlant, setNewPlant] = useState({ name: “”, emoji: “🌿”, family: “”, description: “”, heightCm: [30, 60], diameterCm: [20, 40], floweringSeason: [], flowerColor: “#ffffff”, lifecycle: “perenne”, role: [], offseason: “”, waterDays: 3, sunlight: “pleno sol”, zone: [“templada”], tags: [], communityNotes: [], plantOfDay: false, images: [] });
const [filterLC, setFilterLC] = useState(“todos”);

const filtered = plants.filter(p => {
const q = searchQ.toLowerCase();
const matchQ = !q || p.name.toLowerCase().includes(q) || p.tags.join(” “).includes(q) || p.role.join(” “).includes(q);
const matchLC = filterLC === “todos” || p.lifecycle === filterLC;
return matchQ && matchLC;
});

const addPlant = () => {
if (!newPlant.name.trim()) return;
setPlants(prev => […prev, { …newPlant, id: “p” + Date.now() }]);
setShowAdd(false);
};

return (
<div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 20 }}>
<div>
<div className="section-title">Base de plantas</div>
<h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Mis plantas ({plants.length})</h2>
</div>
<button className=“btn-primary” onClick={() => setShowAdd(v => !v)}>＋ Agregar planta</button>
</div>

```
  <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
    <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar por nombre, etiqueta, rol…" style={{ flex: 1, minWidth: 200 }} />
    {["todos", "anual", "bianual", "perenne"].map(lc => (
      <button key={lc} onClick={() => setFilterLC(lc)} className="btn-secondary"
        style={{ background: filterLC === lc ? "#4a7a2a" : undefined, color: filterLC === lc ? "#fff" : undefined, borderColor: filterLC === lc ? "#4a7a2a" : undefined }}>
        {lc}
      </button>
    ))}
  </div>

  {showAdd && (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title">Nueva planta</div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[["Nombre", "name"], ["Emoji", "emoji"], ["Familia", "family"]].map(([l, k]) => (
          <div key={k}><label>{l}</label><input type="text" value={newPlant[k]} onChange={e => setNewPlant(p => ({ ...p, [k]: e.target.value }))} /></div>
        ))}
      </div>
      <div style={{ marginTop: 12 }}><label>Descripción</label><textarea value={newPlant.description} rows={2} onChange={e => setNewPlant(p => ({ ...p, description: e.target.value }))} /></div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 12 }}>
        <div><label>Ciclo de vida</label>
          <select value={newPlant.lifecycle} onChange={e => setNewPlant(p => ({ ...p, lifecycle: e.target.value }))}>
            <option value="anual">Anual</option><option value="bianual">Bianual</option><option value="perenne">Perenne</option>
          </select>
        </div>
        <div><label>Luz solar</label>
          <select value={newPlant.sunlight} onChange={e => setNewPlant(p => ({ ...p, sunlight: e.target.value }))}>
            {["pleno sol", "semisombra", "sombra", "luz indirecta"].map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div><label>Días entre riego</label><input type="text" value={newPlant.waterDays} onChange={e => setNewPlant(p => ({ ...p, waterDays: Number(e.target.value) }))} /></div>
      </div>
      <div style={{ marginTop: 12 }}><label>Contraestación</label><textarea value={newPlant.offseason} rows={2} onChange={e => setNewPlant(p => ({ ...p, offseason: e.target.value }))} /></div>
      <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={addPlant}>Agregar planta</button>
        <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
      </div>
    </div>
  )}

  <div className="grid-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
    {filtered.map(plant => {
      const ctx = getPlantContext(plant.id);
      return (
        <div key={plant.id} className="card" style={{ cursor: "pointer", transition: "box-shadow 0.2s" }}
          onClick={() => setSelectedPlantId(plant.id)}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(74,122,42,0.2)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <span style={{ fontSize: 36 }}>{plant.emoji}</span>
            <span className="badge" style={{ background: "#f0e8d8", color: "#7a5a2a", fontSize: 11 }}>{plant.lifecycle}</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{plant.name}</div>
          <div style={{ fontSize: 12, color: "#8a7a5a", fontStyle: "italic" }}>{plant.family}</div>
          <div style={{ fontSize: 13, color: "#6a5a3a", marginTop: 6, lineHeight: 1.5 }}>{plant.description.slice(0, 80)}…</div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 3 }}>
            {plant.role.slice(0,2).map(r => <span key={r} className="tag">{r}</span>)}
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#aaa090", display: "flex", gap: 12 }}>
            <span>✅ {ctx.tasks.length} tareas</span>
            <span>💬 {plant.communityNotes.length} notas</span>
          </div>
        </div>
      );
    })}
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// TASKS SECTION
// ─────────────────────────────────────────────────────────────
function TasksSection({ tasks, plants, gardens, garden, addTask, setSelectedPlantId }) {
const [filterType, setFilterType] = useState(“todos”);
const [newT, setNewT] = useState({ plantId: plants[0]?.id || “”, gardenId: garden?.id || “”, bedId: “”, type: “poda”, date: new Date().toISOString().slice(0,10), note: “” });
const [showAdd, setShowAdd] = useState(false);

const taskTypes_es = { poda: “✂️”, riego: “💧”, fertilización: “🌾”, siembra: “🌱”, trasplante: “🪴”, cosecha: “🧺”, tratamiento: “💊”, observación: “👁”, otro: “📝” };

const gardenTasks = tasks.filter(t => t.gardenId === garden?.id);
const filtered = filterType === “todos” ? gardenTasks : gardenTasks.filter(t => t.type === filterType);

// Group by month
const grouped = {};
filtered.forEach(t => {
const m = t.date.slice(0, 7);
if (!grouped[m]) grouped[m] = [];
grouped[m].push(t);
});
const months = Object.keys(grouped).sort().reverse();

return (
<div>
<div style={{ display: “flex”, alignItems: “center”, justifyContent: “space-between”, marginBottom: 20 }}>
<div><div className="section-title">Gestión de tareas</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Tareas — {garden?.name}</h2></div>
<button className=“btn-primary” onClick={() => setShowAdd(v => !v)}>＋ Nueva tarea</button>
</div>

```
  {showAdd && (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title">Registrar tarea</div>
      <div className="grid-4" className="grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
        <div><label>Planta</label>
          <select value={newT.plantId} onChange={e => setNewT(t => ({ ...t, plantId: e.target.value }))}>
            {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
          </select>
        </div>
        <div><label>Tipo</label>
          <select value={newT.type} onChange={e => setNewT(t => ({ ...t, type: e.target.value }))}>
            {TASK_TYPES.map(t => <option key={t} value={t}>{taskTypes_es[t]} {t}</option>)}
          </select>
        </div>
        <div><label>Fecha</label><input type="date" value={newT.date} onChange={e => setNewT(t => ({ ...t, date: e.target.value }))} /></div>
        <div style={{ gridColumn: "1 / -1" }}><label>Nota</label><input type="text" value={newT.note} onChange={e => setNewT(t => ({ ...t, note: e.target.value }))} placeholder="Observación, resultado, método usado…" /></div>
      </div>
      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={() => { addTask({ ...newT, gardenId: garden?.id }); setShowAdd(false); }}>Guardar</button>
        <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
      </div>
    </div>
  )}

  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
    {["todos", ...TASK_TYPES].map(t => (
      <button key={t} onClick={() => setFilterType(t)} className="btn-secondary"
        style={{ background: filterType === t ? "#4a7a2a" : undefined, color: filterType === t ? "#fff" : undefined, borderColor: filterType === t ? "#4a7a2a" : undefined, fontSize: 12, padding: "5px 12px" }}>
        {taskTypes_es[t] || "🌿"} {t}
      </button>
    ))}
  </div>

  {months.map(m => (
    <div key={m} style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 12, letterSpacing: 2, color: "#9a8a6a", textTransform: "uppercase", marginBottom: 10, borderBottom: "1px solid #e0d8c8", paddingBottom: 6 }}>
        {MONTHS[parseInt(m.slice(5,7)) - 1]} {m.slice(0,4)}
      </div>
      {grouped[m].map(t => {
        const pl = plants.find(p => p.id === t.plantId);
        return (
          <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f5f0e8" }}>
            <span style={{ fontSize: 22 }}>{taskTypes_es[t.type] || "📝"}</span>
            <div style={{ flex: 1 }}>
              <span className="plant-link" onClick={() => setSelectedPlantId(t.plantId)} style={{ fontSize: 15, fontWeight: 600 }}>{pl?.emoji} {pl?.name}</span>
              <span style={{ marginLeft: 8, fontSize: 13, color: "#8a7a5a" }}>{t.type}</span>
              {t.learnedPattern && <span style={{ marginLeft: 6, fontSize: 10, background: "#e8f0d8", color: "#4a7a2a", padding: "1px 6px", borderRadius: 10 }}>📚 patrón</span>}
              {t.note && <div style={{ fontSize: 13, color: "#6a5a3a", fontStyle: "italic", marginTop: 3 }}>"{t.note}"</div>}
            </div>
            <div style={{ fontSize: 12, color: "#aaa090", whiteSpace: "nowrap" }}>{t.date}</div>
          </div>
        );
      })}
    </div>
  ))}
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// CALENDAR SECTION — perpetual calendar + learned patterns
// ─────────────────────────────────────────────────────────────
function CalendarSection({ tasks, plants, garden, setSelectedPlantId }) {
const [viewMonth, setViewMonth] = useState(new Date().getMonth());
const [showGuru, setShowGuru] = useState(true);

// Learned patterns: what tasks happened in this month historically
const monthTasks = tasks.filter(t => {
const taskMonth = parseInt(t.date.slice(5, 7)) - 1;
return taskMonth === viewMonth;
});

// Group by plant
const byPlant = {};
monthTasks.forEach(t => {
if (!byPlant[t.plantId]) byPlant[t.plantId] = [];
byPlant[t.plantId].push(t);
});

// Guru calendar data (simulated community recommendations)
const guruCalendar = {
0: [{ plant: “Tomate Cherry”, action: “Siembra en almácigo en zonas cálidas”, source: “Calendario HBA” }],
1: [{ plant: “Albahaca”, action: “Trasplantar a exterior con calor estable”, source: “GardenBA” }],
2: [{ plant: “Lavanda”, action: “Poda leve post-verano”, source: “Calendario HBA” }],
3: [{ plant: “Tomate Cherry”, action: “Última cosecha antes del frío”, source: “GardenBA” }],
8: [{ plant: “Tomate Cherry”, action: “Preparar almácigos para siembra primaveral”, source: “Calendario HBA” }, { plant: “Jacarandá”, action: “Comenzará a florecer pronto. No podar.”, source: “GardenBA” }],
9: [{ plant: “Lavanda”, action: “Plantar nuevos ejemplares”, source: “Calendario HBA” }],
10: [{ plant: “Tomate Cherry”, action: “Siembra directa en climas cálidos”, source: “GardenBA” }],
11: [{ plant: “Albahaca”, action: “Siembra en maceta en interior”, source: “Calendario HBA” }],
};

const guruThisMonth = guruCalendar[viewMonth] || [];

const taskTypes_es = { poda: “✂️”, riego: “💧”, fertilización: “🌾”, siembra: “🌱”, trasplante: “🪴”, cosecha: “🧺”, tratamiento: “💊”, observación: “👁”, otro: “📝” };

return (
<div>
<div style={{ marginBottom: 20 }}>
<div className="section-title">Calendario perpetuo</div>
<h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Actividad por mes</h2>
<p style={{ margin: “4px 0 0”, color: “#8a7a5a”, fontSize: 13 }}>Patrones aprendidos de tus acciones + recomendaciones de expertos</p>
</div>

```
  {/* Month selector */}
  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
    {MONTHS.map((m, i) => (
      <button key={i} onClick={() => setViewMonth(i)} className="btn-secondary"
        style={{ background: viewMonth === i ? "#4a7a2a" : undefined, color: viewMonth === i ? "#fff" : undefined, borderColor: viewMonth === i ? "#4a7a2a" : undefined, fontSize: 12, padding: "6px 10px" }}>
        {m.slice(0,3)}
      </button>
    ))}
  </div>

  <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
    {/* My patterns */}
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>🔒 Mis registros — {MONTHS[viewMonth]}</div>
        <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{monthTasks.length} tareas</span>
      </div>
      {Object.keys(byPlant).length === 0
        ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin registros para este mes todavía.</p>
        : Object.entries(byPlant).map(([pid, ptasks]) => {
          const pl = plants.find(p => p.id === pid);
          return (
            <div key={pid} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0e8d8" }}>
              <span className="plant-link" onClick={() => setSelectedPlantId(pid)} style={{ fontSize: 15, fontWeight: 600 }}>{pl?.emoji} {pl?.name}</span>
              {ptasks.map(t => (
                <div key={t.id} style={{ marginTop: 4, display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 14 }}>{taskTypes_es[t.type] || "📝"}</span>
                  <span style={{ fontSize: 13, color: "#4a3a2a" }}>{t.type}</span>
                  <span style={{ fontSize: 11, color: "#aaa090" }}>{t.date.slice(8)} {MONTHS[viewMonth]}</span>
                </div>
              ))}
            </div>
          );
        })
      }
    </div>

    {/* Guru calendar */}
    <div className="card" style={{ borderLeft: "4px solid #5a8ab0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>🌍 Calendario expertos — {MONTHS[viewMonth]}</div>
        <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setShowGuru(v => !v)}>
          {showGuru ? "Ocultar" : "Mostrar"}
        </button>
      </div>
      {showGuru && (
        guruThisMonth.length === 0
          ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin recomendaciones para este mes.</p>
          : guruThisMonth.map((g, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f0e8d8" }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#3a5a80" }}>🌿 {g.plant}</div>
              <div style={{ fontSize: 13, color: "#4a3a2a", marginTop: 4 }}>{g.action}</div>
              <div style={{ fontSize: 11, color: "#aaa090", marginTop: 4 }}>Fuente: {g.source}</div>
            </div>
          ))
      )}
    </div>
  </div>

  {/* Season view */}
  <div className="card" style={{ marginTop: 20 }}>
    <div className="section-title">Vista por estación</div>
    <div className="grid-4" className="grid-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
      {[["🌸 Primavera", [8,9,10]], ["☀️ Verano", [11,0,1]], ["🍂 Otoño", [2,3,4]], ["❄️ Invierno", [5,6,7]]].map(([label, months]) => {
        const seasonTasks = tasks.filter(t => months.includes(parseInt(t.date.slice(5,7)) - 1) && t.gardenId === garden?.id);
        const uniquePlants = [...new Set(seasonTasks.map(t => t.plantId))];
        return (
          <div key={label} style={{ padding: 12, background: "#faf8f3", borderRadius: 8, border: "1px solid #e8e0d0" }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 12, color: "#8a7a5a" }}>{seasonTasks.length} tareas</div>
            <div style={{ marginTop: 6 }}>
              {uniquePlants.map(pid => {
                const pl = plants.find(p => p.id === pid);
                return pl ? <div key={pid} className="plant-link" onClick={() => setSelectedPlantId(pid)} style={{ fontSize: 12, marginTop: 2 }}>{pl.emoji} {pl.name}</div> : null;
              })}
            </div>
          </div>
        );
      })}
    </div>
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// DESIGN SECTION — bed layout
// ─────────────────────────────────────────────────────────────
function DesignSection({ garden, gardens, setGardens, plants, setSelectedPlantId, activeGarden }) {
const [selectedBed, setSelectedBed] = useState(null);
const [showAddBed, setShowAddBed] = useState(false);
const [newBed, setNewBed] = useState({ name: “”, w: 3, h: 2 });

const updateGarden = (updater) => {
setGardens(prev => prev.map(g => g.id === activeGarden ? updater(g) : g));
};

const addBed = () => {
if (!newBed.name.trim()) return;
updateGarden(g => ({ …g, beds: […g.beds, { id: “b” + Date.now(), name: newBed.name, shape: “rect”, w: parseFloat(newBed.w), h: parseFloat(newBed.h), plantIds: [] }] }));
setShowAddBed(false);
setNewBed({ name: “”, w: 3, h: 2 });
};

const addPlantToBed = (bedId, plantId) => {
updateGarden(g => ({ …g, beds: g.beds.map(b => b.id === bedId && !b.plantIds.includes(plantId) ? { …b, plantIds: […b.plantIds, plantId] } : b) }));
};

const removePlantFromBed = (bedId, plantId) => {
updateGarden(g => ({ …g, beds: g.beds.map(b => b.id === bedId ? { …b, plantIds: b.plantIds.filter(id => id !== plantId) } : b) }));
};

const bed = garden?.beds?.find(b => b.id === selectedBed);

return (
<div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20 }}>
<div><div className="section-title">Diseño del jardín</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>{garden?.name}</h2></div>
<button className=“btn-primary” onClick={() => setShowAddBed(v => !v)}>＋ Nuevo cantero</button>
</div>

```
  {showAddBed && (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title">Nuevo cantero / espacio</div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
        <div><label>Nombre</label><input type="text" value={newBed.name} onChange={e => setNewBed(b => ({ ...b, name: e.target.value }))} placeholder="Cantero frontal, huerta…" /></div>
        <div><label>Ancho (m)</label><input type="text" value={newBed.w} onChange={e => setNewBed(b => ({ ...b, w: e.target.value }))} /></div>
        <div><label>Alto (m)</label><input type="text" value={newBed.h} onChange={e => setNewBed(b => ({ ...b, h: e.target.value }))} /></div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={addBed}>Crear cantero</button>
        <button className="btn-secondary" onClick={() => setShowAddBed(false)}>Cancelar</button>
      </div>
    </div>
  )}

  {/* Visual layout */}
  <div className="card" style={{ marginBottom: 20 }}>
    <div className="section-title">Plano visual</div>
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
      {garden?.beds?.map(b => {
        const scale = 60;
        return (
          <div key={b.id} onClick={() => setSelectedBed(b.id === selectedBed ? null : b.id)}
            style={{ cursor: "pointer", width: b.w * scale, minWidth: 80, minHeight: 50, height: b.h * scale, background: selectedBed === b.id ? "#d4f0a8" : "#e8f5d8", border: `2px solid ${selectedBed === b.id ? "#4a7a2a" : "#a8c890"}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transition: "all 0.2s", position: "relative", padding: 6 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: "#4a7a2a", textAlign: "center" }}>{b.name}</div>
            <div style={{ fontSize: 11, color: "#8a7a5a", marginTop: 2 }}>{b.w}×{b.h}m</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4, justifyContent: "center" }}>
              {b.plantIds.map(pid => {
                const pl = plants.find(p => p.id === pid);
                return pl ? <span key={pid} style={{ fontSize: 16 }} title={pl.name}>{pl.emoji}</span> : null;
              })}
            </div>
          </div>
        );
      })}
      {!garden?.beds?.length && <p style={{ color: "#8a7a5a" }}>Sin canteros. Crea el primero arriba.</p>}
    </div>
  </div>

  {/* Bed detail */}
  {bed && (
    <div className="card">
      <div className="section-title">Cantero: {bed.name}</div>
      <div style={{ fontSize: 13, color: "#8a7a5a", marginBottom: 14 }}>Dimensiones: {bed.w} × {bed.h} m · Área: {(bed.w * bed.h).toFixed(1)} m²</div>

      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Plantas en este cantero</div>
          {bed.plantIds.length === 0 ? <p style={{ color: "#8a7a5a", fontSize: 13 }}>Vacío. Agrega plantas desde la lista.</p>
            : bed.plantIds.map(pid => {
              const pl = plants.find(p => p.id === pid);
              return pl ? (
                <div key={pid} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{pl.emoji}</span>
                  <span className="plant-link" onClick={() => setSelectedPlantId(pid)} style={{ fontSize: 14, flex: 1 }}>{pl.name}</span>
                  <button onClick={() => removePlantFromBed(bed.id, pid)} style={{ background: "none", border: "1px solid #e0c8b8", color: "#c06040", borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontSize: 12 }}>✕</button>
                </div>
              ) : null;
            })}
        </div>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 10 }}>Agregar planta</div>
          {plants.filter(p => !bed.plantIds.includes(p.id)).map(p => (
            <button key={p.id} onClick={() => addPlantToBed(bed.id, p.id)}
              style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "1px solid #e0d8c8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13, marginBottom: 6, fontFamily: "inherit", textAlign: "left", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0e8d8"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}>
              <span>{p.emoji}</span><span>{p.name}</span><span style={{ fontSize: 11, color: "#8a7a5a", marginLeft: "auto" }}>{p.lifecycle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )}
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// PESTS SECTION
// ─────────────────────────────────────────────────────────────
function PestsSection({ pests, setPests, plants, garden, setSelectedPlantId }) {
const [showAdd, setShowAdd] = useState(false);
const [newPest, setNewPest] = useState({ plantId: plants[0]?.id || “”, name: “”, date: new Date().toISOString().slice(0,10), treatment: “”, resolved: false });

const addPest = () => {
if (!newPest.name.trim()) return;
setPests(prev => […prev, { …newPest, id: “pe” + Date.now() }]);
setShowAdd(false);
};

const gardenPlantIds = garden?.beds?.flatMap(b => b.plantIds) || [];
const gardenPests = pests.filter(p => gardenPlantIds.includes(p.plantId) || true); // show all for now

return (
<div>
<div style={{ display: “flex”, justifyContent: “space-between”, alignItems: “center”, marginBottom: 20 }}>
<div><div className="section-title">Sanidad vegetal</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Plagas & tratamientos</h2></div>
<button className=“btn-primary” onClick={() => setShowAdd(v => !v)}>＋ Registrar plaga</button>
</div>

```
  {showAdd && (
    <div className="card" style={{ marginBottom: 20 }}>
      <div className="section-title">Nueva plaga / problema</div>
      <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div><label>Planta afectada</label>
          <select value={newPest.plantId} onChange={e => setNewPest(p => ({ ...p, plantId: e.target.value }))}>
            {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
          </select>
        </div>
        <div><label>Plaga / problema</label><input type="text" value={newPest.name} onChange={e => setNewPest(p => ({ ...p, name: e.target.value }))} placeholder="Mosca blanca, pulgón…" /></div>
        <div><label>Fecha detección</label><input type="date" value={newPest.date} onChange={e => setNewPest(p => ({ ...p, date: e.target.value }))} /></div>
        <div style={{ gridColumn: "1 / -1" }}><label>Tratamiento aplicado</label><textarea value={newPest.treatment} rows={2} onChange={e => setNewPest(p => ({ ...p, treatment: e.target.value }))} placeholder="Producto, dosis, frecuencia…" /></div>
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button className="btn-primary" onClick={addPest}>Guardar</button>
        <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
      </div>
    </div>
  )}

  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
    {gardenPests.map(p => {
      const pl = plants.find(pl => pl.id === p.plantId);
      return (
        <div key={p.id} className="card" style={{ borderLeft: `4px solid ${p.resolved ? "#4a7a2a" : "#c04020"}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 20 }}>🐛</span>
                <span style={{ fontWeight: 600, fontSize: 16 }}>{p.name}</span>
                <span className="badge" style={{ background: p.resolved ? "#e8f0d8" : "#ffe0d0", color: p.resolved ? "#4a7a2a" : "#c04020" }}>{p.resolved ? "✓ Resuelto" : "⚠ Activo"}</span>
              </div>
              <div style={{ marginTop: 4 }}>
                <span style={{ fontSize: 13, color: "#8a7a5a" }}>Planta: </span>
                <span className="plant-link" onClick={() => setSelectedPlantId(p.plantId)} style={{ fontSize: 13 }}>{pl?.emoji} {pl?.name}</span>
                <span style={{ fontSize: 12, color: "#aaa090", marginLeft: 10 }}>{p.date}</span>
              </div>
              {p.treatment && <div style={{ fontSize: 13, color: "#4a3a2a", marginTop: 8, fontStyle: "italic" }}>💊 {p.treatment}</div>}
            </div>
            {!p.resolved && (
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setPests(prev => prev.map(pe => pe.id === p.id ? { ...pe, resolved: true } : pe))}>
                ✓ Marcar resuelto
              </button>
            )}
          </div>
        </div>
      );
    })}
    {gardenPests.length === 0 && <div className="card" style={{ textAlign: "center", color: "#8a7a5a", padding: 40 }}>🌿 Sin plagas registradas. ¡Buen trabajo!</div>}
  </div>
</div>
```

);
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY SECTION
// ─────────────────────────────────────────────────────────────
function CommunitySection({ plants, updatePlantNote, setSelectedPlantId }) {
const [search, setSearch] = useState(””);
const allNotes = plants.flatMap(p => p.communityNotes.map(n => ({ …n, plantId: p.id, plantName: p.name, plantEmoji: p.emoji })));
const filteredPlants = plants.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.tags.join(” “).includes(search.toLowerCase()));

return (
<div>
<div style={{ marginBottom: 20 }}>
<div className="section-title">Espacio público</div>
<h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Comunidad</h2>
<p style={{ margin: “4px 0 0”, color: “#8a7a5a”, fontSize: 13 }}>Conocimiento compartido sobre plantas — visible para todos los usuarios</p>
</div>

```
  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
    <div>
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar planta en la comunidad…" style={{ marginBottom: 16 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {filteredPlants.map(p => (
          <div key={p.id} className="card">
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span style={{ fontSize: 32 }}>{p.emoji}</span>
              <div style={{ flex: 1 }}>
                <span className="plant-link" onClick={() => setSelectedPlantId(p.id)} style={{ fontSize: 17, fontWeight: 600 }}>{p.name}</span>
                <span style={{ marginLeft: 8, fontSize: 12, color: "#8a7a5a" }}>{p.communityNotes.length} notas</span>
                <div style={{ marginTop: 6 }}>
                  {p.communityNotes.slice(0, 2).map((n, i) => (
                    <div key={i} style={{ fontSize: 13, color: "#4a3a2a", padding: "6px 0", borderBottom: "1px solid #f5f0e8" }}>
                      <strong>{n.user}</strong> <span style={{ color: "#aaa090", fontSize: 11 }}>{n.date}</span>
                      <p style={{ margin: "2px 0 0" }}>{n.text}</p>
                    </div>
                  ))}
                  {p.communityNotes.length > 2 && <button className="btn-secondary" style={{ fontSize: 12, marginTop: 6 }} onClick={() => setSelectedPlantId(p.id)}>Ver todas las notas →</button>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Feed reciente */}
    <div>
      <div className="card">
        <div className="section-title">Actividad reciente</div>
        {allNotes.slice(-8).reverse().map((n, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f5f0e8" }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{ fontSize: 18 }}>{n.plantEmoji}</span>
              <span className="plant-link" onClick={() => setSelectedPlantId(n.plantId)} style={{ fontSize: 13, fontWeight: 600 }}>{n.plantName}</span>
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#4a3a2a" }}>{n.text}</p>
            <div style={{ fontSize: 11, color: "#aaa090" }}>{n.user} · {n.date}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: 16, background: "#f0f8e8" }}>
        <div className="section-title">🌟 Planta más activa</div>
        {(() => {
          const counts = plants.map(p => ({ p, n: p.communityNotes.length })).sort((a, b) => b.n - a.n)[0];
          return counts ? (
            <div onClick={() => setSelectedPlantId(counts.p.id)} style={{ cursor: "pointer" }}>
              <span style={{ fontSize: 32 }}>{counts.p.emoji}</span>
              <div style={{ fontWeight: 600, fontSize: 16, marginTop: 4 }}>{counts.p.name}</div>
              <div style={{ fontSize: 13, color: "#6a9a4a" }}>{counts.n} notas de la comunidad</div>
            </div>
          ) : null;
        })()}
      </div>
    </div>
  </div>
</div>
```

);
}
