import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://zhmlpojlrxarqvnllfug.supabase.co";
const SUPABASE_KEY = "sb_publishable_UbPnRU29NAgE5udCVYkvgQ_DPXYp9NE";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────────────────────────
// SEED DATA — cargado solo si la base está vacía
// ─────────────────────────────────────────────────────────────
const SEED_PLANTS = [
  { id: "p1", name: "Lavanda", emoji: "💜", family: "Lamiaceae", description: "Arbusto aromático mediterráneo. Ideal para bordes y atraer polinizadores.", height_min: 60, height_max: 90, diameter_min: 60, diameter_max: 80, flowering_season: ["Primavera","Verano"], flower_color: "#b39ddb", lifecycle: "perenne", role: ["estructura","floración","aromática"], offseason: "Mantiene follaje gris plateado en invierno. Pierde vigor pero no muere.", water_days: 10, sunlight: "pleno sol", zone: ["templada","mediterránea"], tags: ["sequía","polinizadores","perfume"], plant_of_day: false, community_notes: [{ user: "MartaB", date: "2024-08", text: "Podé en agosto post-floración y brotó increíble en primavera." },{ user: "GardensBA", date: "2024-03", text: "En Buenos Aires conviene protegerla de heladas fuertes con mulch." }] },
  { id: "p2", name: "Tomate Cherry", emoji: "🍅", family: "Solanaceae", description: "Variedad pequeña y productiva. Ideal para macetas y huerta urbana.", height_min: 100, height_max: 180, diameter_min: 40, diameter_max: 60, flowering_season: ["Verano"], flower_color: "#fff176", lifecycle: "anual", role: ["producción","floración"], offseason: "Planta anual — muere con el frío. Recolectar semillas para próxima temporada.", water_days: 2, sunlight: "pleno sol", zone: ["templada","subtropical"], tags: ["comestible","huerta","maceta"], plant_of_day: true, community_notes: [{ user: "HuertoFeliz", date: "2024-12", text: "Siembro en octubre en Buenos Aires. Primera cosecha en enero." }] },
  { id: "p3", name: "Jacarandá", emoji: "🌳", family: "Bignoniaceae", description: "Árbol ornamental de floración espectacular, violeta intenso. Caducifolio.", height_min: 600, height_max: 1500, diameter_min: 400, diameter_max: 800, flowering_season: ["Primavera"], flower_color: "#7c4dff", lifecycle: "perenne", role: ["estructura","sombra","floración"], offseason: "Pierde hojas en invierno. La copa desnuda muestra su estructura escultural.", water_days: 14, sunlight: "pleno sol", zone: ["templada","subtropical"], tags: ["árbol","sombra","icónico"], plant_of_day: false, community_notes: [] },
  { id: "p4", name: "Albahaca", emoji: "🌿", family: "Lamiaceae", description: "Hierba aromática esencial. Compañera perfecta del tomate en la huerta.", height_min: 30, height_max: 60, diameter_min: 20, diameter_max: 40, flowering_season: ["Verano"], flower_color: "#ffffff", lifecycle: "anual", role: ["producción","aromática"], offseason: "Muere con el frío. Dejar florecer al final para recolectar semillas.", water_days: 2, sunlight: "semisombra", zone: ["templada","subtropical"], tags: ["comestible","aromática","compañera"], plant_of_day: false, community_notes: [{ user: "MartaB", date: "2024-01", text: "Pinchar las flores para que produzca más hojas durante más tiempo." }] }
];

const SEED_GARDENS = [
  { id: "g1", name: "Mi jardín principal", location: "Buenos Aires", zone: "templada", beds: [{ id: "b1", name: "Cantero frontal", shape: "rect", w: 4, h: 1.5, plantIds: ["p1","p3"] },{ id: "b2", name: "Huerta", shape: "rect", w: 3, h: 2, plantIds: ["p2","p4"] }] }
];

const SEED_TASKS = [
  { id: "t1", plant_id: "p1", garden_id: "g1", bed_id: "b1", type: "poda", date: "2024-08-15", note: "Poda post-floración. Quedó muy compacta.", learned_pattern: true },
  { id: "t2", plant_id: "p2", garden_id: "g1", bed_id: "b2", type: "siembra", date: "2024-10-10", note: "Siembra en almácigo. Germinó en 8 días.", learned_pattern: true },
  { id: "t3", plant_id: "p4", garden_id: "g1", bed_id: "b2", type: "poda", date: "2025-01-20", note: "Pinché flores para prolongar cosecha.", learned_pattern: false }
];

const SEED_RECORDS = [
  { id: "r1", plant_id: "p1", garden_id: "g1", date: "2025-04-01", text: "La lavanda comenzó a brotar con fuerza luego de la poda de agosto.", evolution: "positiva" },
  { id: "r2", plant_id: "p2", garden_id: "g1", date: "2025-01-15", text: "Primera cosecha de cherry, abundante. Unas 300g esta semana.", evolution: "positiva" }
];

const SEED_PESTS = [
  { id: "pe1", plant_id: "p2", name: "Mosca blanca", date: "2024-12-20", treatment: "Jabón potásico + agua. Aplicar cada 5 días x 2 semanas.", resolved: true }
];

const MONTHS = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const TASK_TYPES = ["riego","poda","fertilización","siembra","trasplante","cosecha","tratamiento","observación","otro"];
const LIFECYCLE_LABEL = { anual: "🌱 Anual", bianual: "🌿 Bianual", perenne: "🌳 Perenne" };
const BITACORA_CATEGORIES = ["clima", "flora silvestre", "fauna", "comunidad", "observación general", "otro"];
const BITACORA_CATEGORY_ICON = { clima: "🌦", "flora silvestre": "🌼", fauna: "🐝", comunidad: "🏘️", "observación general": "🔎", otro: "📝" };
const PLANT_STATUSES = ["en tierra", "en maceta", "en espera de plantar", "deseada"];
const PLANT_STATUS_ICON = { "en tierra": "🌱", "en maceta": "🪴", "en espera de plantar": "⏳", "deseada": "💭" };
const LEAF_SHAPES = ["acintada", "lobulada", "redondeada", "compuesta", "acicular", "lanceolada"];
const PLANT_HABITS = ["columnar", "esférico", "rastrero", "trepador", "arbustivo", "arborescente"];
const GURU_CALENDAR = {
  0: [{ plant: "Tomate Cherry", action: "Siembra en almácigo en zonas cálidas", source: "Calendario HBA" }],
  2: [{ plant: "Lavanda", action: "Poda leve post-verano", source: "Calendario HBA" }],
  8: [{ plant: "Tomate Cherry", action: "Preparar almácigos para siembra primaveral", source: "Calendario HBA" }],
  9: [{ plant: "Lavanda", action: "Plantar nuevos ejemplares", source: "Calendario HBA" }],
  10: [{ plant: "Tomate Cherry", action: "Siembra directa en climas cálidos", source: "GardenBA" }],
};

function getCurrentSeason() {
  const m = new Date().getMonth();
  if (m >= 11 || m <= 1) return "Verano";
  if (m >= 2 && m <= 4) return "Otoño";
  if (m >= 5 && m <= 7) return "Invierno";
  return "Primavera";
}

// Convertir planta de DB a formato app
function dbToPlant(p) {
  return {
    id: p.id, name: p.name, emoji: p.emoji, family: p.family,
    description: p.description,
    heightCm: [p.height_min, p.height_max],
    diameterCm: [p.diameter_min, p.diameter_max],
    floweringSeason: p.flowering_season || [],
    flowerColor: p.flower_color,
    foliageColor: p.foliage_color || "",
    leafShape: p.leaf_shape || "",
    habit: p.habit || "",
    lifecycle: p.lifecycle, role: p.role || [],
    offseason: p.offseason, waterDays: p.water_days,
    sunlight: p.sunlight, zone: p.zone || [],
    tags: p.tags || [], plantOfDay: p.plant_of_day,
    communityNotes: p.community_notes || [], images: [],
    inGarden: p.in_garden !== false,
    status: p.status || "en tierra"
  };
}

// Convertir planta de app a formato DB
function plantToDb(p) {
  return {
    id: p.id, name: p.name, emoji: p.emoji, family: p.family,
    description: p.description,
    height_min: p.heightCm[0], height_max: p.heightCm[1],
    diameter_min: p.diameterCm[0], diameter_max: p.diameterCm[1],
    flowering_season: p.floweringSeason,
    flower_color: p.flowerColor,
    foliage_color: p.foliageColor || "",
    leaf_shape: p.leafShape || "",
    habit: p.habit || "",
    lifecycle: p.lifecycle, role: p.role,
    offseason: p.offseason, water_days: p.waterDays,
    sunlight: p.sunlight, zone: p.zone,
    tags: p.tags, plant_of_day: p.plantOfDay,
    community_notes: p.communityNotes,
    in_garden: p.inGarden !== false,
    status: p.status || "en tierra"
  };
}

function dbToTask(t) {
  return { id: t.id, plantId: t.plant_id, gardenId: t.garden_id, bedId: t.bed_id, type: t.type, date: t.date, note: t.note, learnedPattern: t.learned_pattern };
}
function dbToRecord(r) {
  return { id: r.id, plantId: r.plant_id, gardenId: r.garden_id, date: r.date, text: r.text, evolution: r.evolution };
}
function dbToPest(p) {
  return { id: p.id, plantId: p.plant_id, name: p.name, date: p.date, treatment: p.treatment, resolved: p.resolved };
}
function dbToBitacora(b) {
  return { id: b.id, date: b.date, category: b.category, text: b.text, gardenId: b.garden_id || "", plantId: b.plant_id || "" };
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function JardinApp() {
  const [plants, setPlants] = useState([]);
  const [gardens, setGardens] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [records, setRecords] = useState([]);
  const [pests, setPests] = useState([]);
  const [bitacora, setBitacora] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [activeSection, setActiveSection] = useState("inicio");
  const [activeGarden, setActiveGarden] = useState("g1");
  const [selectedPlantId, setSelectedPlantId] = useState(null);
  const [isPublicView, setIsPublicView] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [autoOpenAdd, setAutoOpenAdd] = useState(false);

  const garden = gardens.find(g => g.id === activeGarden);

  // Cargar datos de Supabase al inicio
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // Verificar si hay datos
        const { data: existingPlants } = await supabase.from("plants").select("id");

        if (!existingPlants || existingPlants.length === 0) {
          // Insertar datos semilla
          await supabase.from("plants").insert(SEED_PLANTS);
          await supabase.from("gardens").insert(SEED_GARDENS);
          await supabase.from("tasks").insert(SEED_TASKS);
          await supabase.from("records").insert(SEED_RECORDS);
          await supabase.from("pests").insert(SEED_PESTS);
        }

        // Cargar todos los datos
        const [p, g, t, r, pe, bt] = await Promise.all([
          supabase.from("plants").select("*"),
          supabase.from("gardens").select("*"),
          supabase.from("tasks").select("*"),
          supabase.from("records").select("*"),
          supabase.from("pests").select("*"),
          supabase.from("bitacora").select("*")
        ]);

        setPlants((p.data || []).map(dbToPlant));
        setGardens(g.data || []);
        setTasks((t.data || []).map(dbToTask));
        setRecords((r.data || []).map(dbToRecord));
        setPests((pe.data || []).map(dbToPest));
        setBitacora((bt.data || []).map(dbToBitacora));
        if (g.data && g.data.length > 0) setActiveGarden(g.data[0].id);
      } catch (err) {
        console.error("Error cargando datos:", err);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const getPlantContext = useCallback((plantId) => {
    const plant = plants.find(p => p.id === plantId);
    const plantTasks = tasks.filter(t => t.plantId === plantId);
    const plantRecords = records.filter(r => r.plantId === plantId);
    const plantPests = pests.filter(p => p.plantId === plantId);
    const inBeds = gardens.flatMap(g => (g.beds || []).filter(b => b.plantIds && b.plantIds.includes(plantId)).map(b => ({ ...b, gardenName: g.name })));
    const plantBitacora = bitacora.filter(b => b.plantId === plantId);
    return { plant, tasks: plantTasks, records: plantRecords, pests: plantPests, inBeds, bitacora: plantBitacora };
  }, [plants, tasks, records, pests, gardens, bitacora]);

  const updatePlantNote = async (plantId, note) => {
    const plant = plants.find(p => p.id === plantId);
    if (!plant) return;
    const newNote = { user: "Yo", date: new Date().toISOString().slice(0, 7), text: note };
    const updatedNotes = [...plant.communityNotes, newNote];
    setSaving(true);
    try {
      await supabase.from("plants").update({ community_notes: updatedNotes }).eq("id", plantId);
      setPlants(prev => prev.map(p => p.id === plantId ? { ...p, communityNotes: updatedNotes } : p));
    } finally { setSaving(false); }
  };

  const addTask = async (task) => {
    const newTask = { id: "t" + Date.now(), plant_id: task.plantId, garden_id: task.gardenId, bed_id: task.bedId || "", type: task.type, date: task.date, note: task.note, learned_pattern: true };
    setSaving(true);
    try {
      await supabase.from("tasks").insert(newTask);
      setTasks(prev => [...prev, dbToTask(newTask)]);
      if (task.note) {
        const newRecord = { id: "r" + Date.now(), plant_id: task.plantId, garden_id: task.gardenId, date: task.date, text: "[" + task.type.toUpperCase() + "] " + task.note, evolution: "neutral" };
        await supabase.from("records").insert(newRecord);
        setRecords(prev => [...prev, dbToRecord(newRecord)]);
      }
    } finally { setSaving(false); }
  };

  const addBitacoraEntry = async (entry) => {
    const newEntry = { id: "bt" + Date.now(), date: entry.date, category: entry.category, text: entry.text, garden_id: entry.gardenId || null, plant_id: entry.plantId || null };
    setSaving(true);
    try {
      await supabase.from("bitacora").insert(newEntry);
      setBitacora(prev => [...prev, dbToBitacora(newEntry)]);
    } finally { setSaving(false); }
  };

  const promoteToGarden = async (plantId) => {
    setSaving(true);
    try {
      await supabase.from("plants").update({ in_garden: true }).eq("id", plantId);
      setPlants(prev => prev.map(p => p.id === plantId ? { ...p, inGarden: true } : p));
    } finally { setSaving(false); }
  };

  const deletePlant = async (plantId) => {
    setSaving(true);
    try {
      await supabase.from("plants").delete().eq("id", plantId);
      const affectedGardens = gardens.filter(g => (g.beds || []).some(b => b.plantIds && b.plantIds.includes(plantId)));
      for (const g of affectedGardens) {
        const beds = g.beds.map(b => b.plantIds && b.plantIds.includes(plantId) ? { ...b, plantIds: b.plantIds.filter(id => id !== plantId) } : b);
        await supabase.from("gardens").update({ beds }).eq("id", g.id);
      }
      setGardens(prev => prev.map(g => ({ ...g, beds: (g.beds || []).map(b => b.plantIds && b.plantIds.includes(plantId) ? { ...b, plantIds: b.plantIds.filter(id => id !== plantId) } : b) })));
      setPlants(prev => prev.filter(p => p.id !== plantId));
    } finally { setSaving(false); }
  };

  const addPest = async (pest) => {
    const newPest = { id: "pe" + Date.now(), plant_id: pest.plantId, name: pest.name, date: pest.date, treatment: pest.treatment, resolved: false };
    setSaving(true);
    try {
      await supabase.from("pests").insert(newPest);
      setPests(prev => [...prev, dbToPest(newPest)]);
    } finally { setSaving(false); }
  };

  const gardenPlants = plants.filter(p => p.inGarden);
  const encyclopediaPlants = plants.filter(p => !p.inGarden);

  const navItems = [
    { id: "inicio", label: "Inicio", icon: "🏡" },
    { id: "plantas", label: "Plantas", icon: "🌿" },
    { id: "tareas", label: "Tareas", icon: "✅" },
    { id: "calendario", label: "Calendario", icon: "📅" },
    { id: "bitacora", label: "Bitácora", icon: "📓" },
    { id: "diseno", label: "Diseño", icon: "📐" },
    { id: "enciclopedia", label: "Enciclopedia", icon: "📚" },
    { id: "plagas", label: "Plagas", icon: "🐛" },
    { id: "comunidad", label: "Comunidad", icon: "🌍" },
  ];

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', -apple-system, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
        <div style={{ fontSize: 18, color: "#4a7a2a" }}>Cargando Verdanis...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f5f0e8", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", color: "#2c2416" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #b8a882; border-radius: 2px; }
        input, textarea, select { font-family: inherit; }
        h2 { font-family: 'Cormorant Garamond', serif; }
        .plant-name-font { font-family: 'Cormorant Garamond', serif; }
        .logo-font { font-family: 'Libre Baskerville', serif; }
        .plant-link { color: #5a8a3c; text-decoration: underline dotted; cursor: pointer; }
        .plant-link:hover { color: #3a6a20; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display: inline-block; width: 12px; height: 12px; border: 2px solid rgba(245,240,232,0.3); border-top-color: #f5f0e8; border-radius: 50%; animation: spin 0.7s linear infinite; }
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
        .app-shell { display: flex; flex-direction: column; min-height: 100vh; }
        @media (min-width: 768px) {
          .app-body { display: flex; flex: 1; }
          .sidebar { display: flex; flex-direction: column; width: 200px; background: #2c2416; min-height: calc(100vh - 56px); position: sticky; top: 56px; align-self: flex-start; flex-shrink: 0; padding: 20px 0; }
          .bottom-nav { display: none; }
          .main-content { flex: 1; padding: 24px 28px; overflow-x: hidden; }
        }
        @media (max-width: 767px) {
          .app-body { display: flex; flex: 1; flex-direction: column; }
          .sidebar { display: none; }
          .bottom-nav { display: flex; position: fixed; bottom: 0; left: 0; right: 0; background: #2c2416; border-top: 2px solid #4a7a2a; z-index: 100; padding: 6px 0 10px; }
          .bottom-nav-item { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 2px; background: none; border: none; cursor: pointer; padding: 4px 2px; font-family: inherit; }
          .bottom-nav-item .nav-icon { font-size: 20px; }
          .bottom-nav-item .nav-label { font-size: 9px; letter-spacing: 0.5px; text-transform: uppercase; }
          .main-content { flex: 1; padding: 16px 14px 90px; overflow-x: hidden; }
          .card { padding: 14px; }
          .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr !important; }
          .grid-auto { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important; }
          h2 { font-size: 20px !important; }
          .hide-mobile { display: none !important; }
        }
      `}</style>

      <header style={{ background: "#2c2416", color: "#f5f0e8", padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 52, position: "sticky", top: 0, zIndex: 50, borderBottom: "3px solid #4a7a2a", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>🌱</span>
          <span className="logo-font" style={{ fontSize: 17, letterSpacing: 1 }}>Verdanis</span>
          <span style={{ fontSize: 10, opacity: 0.4, letterSpacing: 2 }}>STUDIO</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <select value={activeGarden} onChange={e => setActiveGarden(e.target.value)}
            style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f5f0e8", borderRadius: 6, padding: "4px 8px", fontSize: 12, maxWidth: 130 }}>
            {gardens.map(g => <option key={g.id} value={g.id} style={{ color: "#000" }}>{g.name}</option>)}
          </select>
          <button onClick={() => setIsPublicView(v => !v)}
            style={{ background: isPublicView ? "#4a7a2a" : "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "#f5f0e8", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer" }}>
            {isPublicView ? "🌍" : "🔒"}
          </button>
        </div>
      </header>

      <div className="app-shell">
        <div className="app-body">
          <aside className="sidebar">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setSelectedPlantId(null); }}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 22px", background: activeSection === item.id ? "rgba(74,122,42,0.4)" : "transparent", border: "none", borderLeft: activeSection === item.id ? "3px solid #8ab860" : "3px solid transparent", color: activeSection === item.id ? "#d4f0a8" : "#a08870", cursor: "pointer", fontSize: 14, textAlign: "left", transition: "all 0.15s", fontFamily: "inherit" }}>
                <span>{item.icon}</span><span>{item.label}</span>
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
              <button onClick={async () => {
                const name = prompt("Nombre del nuevo jardín:");
                if (name) {
                  const newG = { id: "g" + Date.now(), name, location: "", zone: "templada", beds: [] };
                  setSaving(true);
                  try {
                    await supabase.from("gardens").insert(newG);
                    setGardens(prev => [...prev, newG]);
                  } finally { setSaving(false); }
                }
              }} style={{ display: "block", width: "100%", textAlign: "left", padding: "6px 8px", background: "transparent", border: "none", color: "#4a6a2a", cursor: "pointer", fontSize: 12, fontFamily: "inherit" }}>
                ＋ Nuevo jardín
              </button>
            </div>
          </aside>

          <main className="main-content">
            {selectedPlantId
              ? <PlantSheet plantId={selectedPlantId} getPlantContext={getPlantContext} onBack={() => setSelectedPlantId(null)} updatePlantNote={updatePlantNote} addTask={addTask} gardenId={activeGarden} plants={plants} setPlants={setPlants} supabase={supabase} plantToDb={plantToDb} promoteToGarden={promoteToGarden} deletePlant={deletePlant} setSaving={setSaving} />
              : (
                <div className="fade-in">
                  {activeSection === "inicio" && <HomeSection plants={gardenPlants} garden={garden} gardens={gardens} tasks={tasks} addTask={addTask} addBitacoraEntry={addBitacoraEntry} addPest={addPest} setActiveSection={setActiveSection} setAutoOpenAdd={setAutoOpenAdd} activeGarden={activeGarden} />}
                  {activeSection === "plantas" && <PlantsSection plants={gardenPlants} setPlants={setPlants} setSelectedPlantId={setSelectedPlantId} garden={garden} searchQ={searchQ} setSearchQ={setSearchQ} getPlantContext={getPlantContext} supabase={supabase} plantToDb={plantToDb} setSaving={setSaving} autoOpenAdd={autoOpenAdd} setAutoOpenAdd={setAutoOpenAdd} />}
                  {activeSection === "tareas" && <TasksSection tasks={tasks} plants={gardenPlants} gardens={gardens} garden={garden} addTask={addTask} setSelectedPlantId={setSelectedPlantId} />}
                  {activeSection === "calendario" && <CalendarSection tasks={tasks} plants={plants} garden={garden} setSelectedPlantId={setSelectedPlantId} bitacora={bitacora} gardens={gardens} />}
                  {activeSection === "bitacora" && <BitacoraSection bitacora={bitacora} addBitacoraEntry={addBitacoraEntry} gardens={gardens} plants={gardenPlants} setSelectedPlantId={setSelectedPlantId} />}
                  {activeSection === "diseno" && <DesignSection garden={garden} gardens={gardens} setGardens={setGardens} plants={gardenPlants} encyclopediaPlants={encyclopediaPlants} promoteToGarden={promoteToGarden} setSelectedPlantId={setSelectedPlantId} activeGarden={activeGarden} supabase={supabase} setSaving={setSaving} />}
                  {activeSection === "enciclopedia" && <EncyclopediaSection plants={encyclopediaPlants} setPlants={setPlants} setSelectedPlantId={setSelectedPlantId} supabase={supabase} setSaving={setSaving} />}
                  {activeSection === "plagas" && <PestsSection pests={pests} setPests={setPests} plants={gardenPlants} garden={garden} setSelectedPlantId={setSelectedPlantId} supabase={supabase} addPest={addPest} setSaving={setSaving} autoOpenAdd={autoOpenAdd} setAutoOpenAdd={setAutoOpenAdd} />}
                  {activeSection === "comunidad" && <CommunitySection plants={gardenPlants} updatePlantNote={updatePlantNote} setSelectedPlantId={setSelectedPlantId} />}
                </div>
              )
            }
          </main>
        </div>

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

      {saving && (
        <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 200, background: "#2c2416", color: "#f5f0e8", padding: "10px 18px", borderRadius: 20, fontSize: 13, boxShadow: "0 4px 16px rgba(0,0,0,0.25)", display: "flex", alignItems: "center", gap: 8 }}>
          <span className="spinner" />
          Guardando...
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// HOME
// ─────────────────────────────────────────────────────────────
function HomeSection({ plants, garden, gardens, tasks, addTask, addBitacoraEntry, addPest, setActiveSection, setAutoOpenAdd, activeGarden }) {
  const season = getCurrentSeason();
  const monthIdx = new Date().getMonth();
  const guruThisMonth = GURU_CALENDAR[monthIdx] || [];
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickModal, setQuickModal] = useState(null); // 'tarea' | 'observacion' | 'plaga' | 'nota'

  const REGISTER_OPTIONS = [
    { id: "tarea", label: "Tarea", icon: "✅" },
    { id: "planta", label: "Planta nueva", icon: "🌿" },
    { id: "observacion", label: "Observación", icon: "🔎" },
    { id: "plaga", label: "Plaga", icon: "🐛" },
    { id: "nota", label: "Nota de calendario", icon: "📓" },
  ];

  const selectOption = (id) => {
    setMenuOpen(false);
    if (id === "planta") { setActiveSection("plantas"); setAutoOpenAdd(true); return; }
    setQuickModal(id);
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Panel principal</div>
        <h2 style={{ margin: 0, fontSize: 28, fontWeight: 400 }}>{garden?.name} <span style={{ fontSize: 16, color: "#8a7a5a" }}>— {season}</span></h2>
        <div style={{ color: "#8a7a5a", fontSize: 14, marginTop: 4 }}>{garden?.location} · Zona {garden?.zone}</div>
      </div>

      <div className="card" style={{ marginBottom: 28, borderLeft: "4px solid #5a8ab0" }}>
        <div className="section-title">🌍 Resumen de expertos — {MONTHS[monthIdx]}</div>
        {guruThisMonth.length === 0
          ? <p style={{ color: "#8a7a5a", fontSize: 14, margin: 0 }}>Sin recomendaciones este mes.</p>
          : guruThisMonth.map((g, i) => (
            <div key={i} style={{ marginBottom: i < guruThisMonth.length - 1 ? 12 : 0 }}>
              <div style={{ fontWeight: 600, fontSize: 14, color: "#3a5a80" }}>🌿 {g.plant}</div>
              <div style={{ fontSize: 13, marginTop: 2 }}>{g.action}</div>
              <div style={{ fontSize: 11, color: "#aaa090" }}>Fuente: {g.source}</div>
            </div>
          ))
        }
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 0", position: "relative" }}>
        <button className="btn-primary" onClick={() => setMenuOpen(v => !v)}
          style={{ fontSize: 17, padding: "16px 36px", borderRadius: 40, boxShadow: "0 4px 16px rgba(74,122,42,0.3)" }}>
          ＋ Registrar
        </button>
        {menuOpen && (
          <div style={{ position: "absolute", top: "calc(100% - 10px)", background: "#fff", border: "1px solid #e0d8c8", borderRadius: 12, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", minWidth: 220, zIndex: 60 }}>
            {REGISTER_OPTIONS.map(opt => (
              <button key={opt.id} onClick={() => selectOption(opt.id)}
                style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "12px 18px", background: "none", border: "none", borderBottom: "1px solid #f5f0e8", cursor: "pointer", fontSize: 14, fontFamily: "inherit", textAlign: "left", color: "#2c2416" }}>
                <span style={{ fontSize: 18 }}>{opt.icon}</span>{opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {quickModal && (
        <QuickRegisterModal
          type={quickModal}
          plants={plants}
          gardens={gardens}
          activeGarden={activeGarden}
          addTask={addTask}
          addBitacoraEntry={addBitacoraEntry}
          addPest={addPest}
          onClose={() => setQuickModal(null)}
        />
      )}
    </div>
  );
}

function QuickRegisterModal({ type, plants, gardens, activeGarden, addTask, addBitacoraEntry, addPest, onClose }) {
  const today = new Date().toISOString().slice(0, 10);
  const taskTypes_es = { poda: "✂️", riego: "💧", fertilización: "🌾", siembra: "🌱", trasplante: "🪴", cosecha: "🧺", tratamiento: "💊", observación: "👁", otro: "📝" };
  const [taskForm, setTaskForm] = useState({ plantId: plants[0]?.id || "", type: "observación", date: today, note: "" });
  const [noteForm, setNoteForm] = useState({ date: today, category: type === "nota" ? "otro" : "observación general", text: "", gardenId: activeGarden || "", plantId: "" });
  const [pestForm, setPestForm] = useState({ plantId: plants[0]?.id || "", name: "", date: today, treatment: "" });

  const titles = { tarea: "Registrar tarea", observacion: "Registrar observación", plaga: "Registrar plaga", nota: "Nota de calendario" };

  const handleSubmit = () => {
    if (type === "tarea") {
      if (!taskForm.plantId) return;
      addTask({ plantId: taskForm.plantId, gardenId: activeGarden, bedId: "", type: taskForm.type, date: taskForm.date, note: taskForm.note });
    } else if (type === "observacion" || type === "nota") {
      if (!noteForm.text.trim()) return;
      addBitacoraEntry(noteForm);
    } else if (type === "plaga") {
      if (!pestForm.name.trim() || !pestForm.plantId) return;
      addPest(pestForm);
    }
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(44,36,22,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }} onClick={onClose}>
      <div className="card" style={{ maxWidth: 440, width: "100%", borderLeft: "4px solid #4a7a2a" }} onClick={e => e.stopPropagation()}>
        <div className="section-title">{titles[type]}</div>

        {type === "tarea" && (
          <>
            <label>Planta</label>
            <select value={taskForm.plantId} onChange={e => setTaskForm(f => ({ ...f, plantId: e.target.value }))} style={{ marginBottom: 10 }}>
              {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
            <label>Tipo</label>
            <select value={taskForm.type} onChange={e => setTaskForm(f => ({ ...f, type: e.target.value }))} style={{ marginBottom: 10 }}>
              {TASK_TYPES.map(t => <option key={t} value={t}>{taskTypes_es[t] || "📝"} {t}</option>)}
            </select>
            <label>Fecha</label>
            <input type="date" value={taskForm.date} onChange={e => setTaskForm(f => ({ ...f, date: e.target.value }))} style={{ marginBottom: 10 }} />
            <label>Nota</label>
            <textarea rows={2} value={taskForm.note} onChange={e => setTaskForm(f => ({ ...f, note: e.target.value }))} placeholder="¿Qué observaste?" style={{ marginBottom: 10 }} />
          </>
        )}

        {(type === "observacion" || type === "nota") && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label>Fecha</label><input type="date" value={noteForm.date} onChange={e => setNoteForm(f => ({ ...f, date: e.target.value }))} /></div>
              <div><label>Categoría</label>
                <select value={noteForm.category} onChange={e => setNoteForm(f => ({ ...f, category: e.target.value }))}>
                  {BITACORA_CATEGORIES.map(c => <option key={c} value={c}>{BITACORA_CATEGORY_ICON[c]} {c}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 10 }}>
              <div><label>Jardín</label>
                <select value={noteForm.gardenId} onChange={e => setNoteForm(f => ({ ...f, gardenId: e.target.value }))}>
                  <option value="">🌍 General</option>
                  {gardens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div><label>Planta (opcional)</label>
                <select value={noteForm.plantId} onChange={e => setNoteForm(f => ({ ...f, plantId: e.target.value }))}>
                  <option value="">— Sin planta —</option>
                  {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
                </select>
              </div>
            </div>
            <label style={{ marginTop: 10 }}>Texto</label>
            <textarea rows={3} value={noteForm.text} onChange={e => setNoteForm(f => ({ ...f, text: e.target.value }))} placeholder="¿Qué observaste?" style={{ marginBottom: 10 }} />
          </>
        )}

        {type === "plaga" && (
          <>
            <label>Planta</label>
            <select value={pestForm.plantId} onChange={e => setPestForm(f => ({ ...f, plantId: e.target.value }))} style={{ marginBottom: 10 }}>
              {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
            </select>
            <label>Plaga</label>
            <input type="text" value={pestForm.name} onChange={e => setPestForm(f => ({ ...f, name: e.target.value }))} placeholder="Mosca blanca, pulgón…" style={{ marginBottom: 10 }} />
            <label>Fecha</label>
            <input type="date" value={pestForm.date} onChange={e => setPestForm(f => ({ ...f, date: e.target.value }))} style={{ marginBottom: 10 }} />
            <label>Tratamiento</label>
            <textarea rows={2} value={pestForm.treatment} onChange={e => setPestForm(f => ({ ...f, treatment: e.target.value }))} style={{ marginBottom: 10 }} />
          </>
        )}

        <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
          <button className="btn-primary" onClick={handleSubmit}>Guardar</button>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLANT SHEET
// ─────────────────────────────────────────────────────────────
// PLANT SHEET — formulario de edicion completo
function PlantSheet({ plantId, getPlantContext, onBack, updatePlantNote, addTask, gardenId, plants, setPlants, supabase, promoteToGarden, deletePlant, setSaving }) {
  const [newNote, setNewNote] = useState("");
  const [newTaskType, setNewTaskType] = useState("observacion");
  const [newTaskDate, setNewTaskDate] = useState(new Date().toISOString().slice(0, 10));
  const [newTaskNote, setNewTaskNote] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  const ctx = getPlantContext(plantId);
  const { plant, tasks: ptasks, records: precords, pests: ppests, inBeds, bitacora: pbitacora } = ctx;

  useEffect(() => {
    if (plant) setEditData({
      name: plant.name || "",
      emoji: plant.emoji || "🌿",
      family: plant.family || "",
      description: plant.description || "",
      offseason: plant.offseason || "",
      lifecycle: plant.lifecycle || "perenne",
      status: plant.status || "en tierra",
      sunlight: plant.sunlight || "pleno sol",
      waterDays: plant.waterDays || 3,
      heightMin: plant.heightCm ? plant.heightCm[0] : 30,
      heightMax: plant.heightCm ? plant.heightCm[1] : 60,
      diameterMin: plant.diameterCm ? plant.diameterCm[0] : 20,
      diameterMax: plant.diameterCm ? plant.diameterCm[1] : 40,
      flowerColor: plant.flowerColor || "#ffffff",
      foliageColor: plant.foliageColor || "#4a7a2a",
      leafShape: plant.leafShape || "",
      habit: plant.habit || "",
      floweringSeason: (plant.floweringSeason || []).join(", "),
      sowingSeason: (plant.sowingSeason || []).join(", "),
      transplantSeason: (plant.transplantSeason || []).join(", "),
      tags: (plant.tags || []).join(", "),
      role: (plant.role || []).join(", "),
    });
  }, [plant]);

  if (!plant) return null;

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    updatePlantNote(plantId, newNote);
    setNewNote("");
  };

  const handleAddTask = () => {
    addTask({ plantId, gardenId, bedId: inBeds[0]?.id || "", type: newTaskType, date: newTaskDate, note: newTaskNote });
    setNewTaskNote("");
  };

  const handleSaveEdit = async () => {
    const updated = {
      ...plant,
      name: editData.name,
      emoji: editData.emoji,
      family: editData.family,
      description: editData.description,
      offseason: editData.offseason,
      lifecycle: editData.lifecycle,
      status: editData.status,
      sunlight: editData.sunlight,
      waterDays: Number(editData.waterDays),
      heightCm: [Number(editData.heightMin), Number(editData.heightMax)],
      diameterCm: [Number(editData.diameterMin), Number(editData.diameterMax)],
      flowerColor: editData.flowerColor,
      foliageColor: editData.foliageColor,
      leafShape: editData.leafShape,
      habit: editData.habit,
      floweringSeason: editData.floweringSeason.split(",").map(s => s.trim()).filter(Boolean),
      sowingSeason: editData.sowingSeason.split(",").map(s => s.trim()).filter(Boolean),
      transplantSeason: editData.transplantSeason.split(",").map(s => s.trim()).filter(Boolean),
      tags: editData.tags.split(",").map(s => s.trim()).filter(Boolean),
      role: editData.role.split(",").map(s => s.trim()).filter(Boolean),
    };
    setSaving(true);
    try {
      await supabase.from("plants").update({
        name: updated.name,
        emoji: updated.emoji,
        family: updated.family,
        description: updated.description,
        offseason: updated.offseason,
        lifecycle: updated.lifecycle,
        status: updated.status,
        sunlight: updated.sunlight,
        water_days: updated.waterDays,
        height_min: updated.heightCm[0],
        height_max: updated.heightCm[1],
        diameter_min: updated.diameterCm[0],
        diameter_max: updated.diameterCm[1],
        flower_color: updated.flowerColor,
        foliage_color: updated.foliageColor,
        leaf_shape: updated.leafShape,
        habit: updated.habit,
        flowering_season: updated.floweringSeason,
        sowing_season: updated.sowingSeason,
        transplant_season: updated.transplantSeason,
        tags: updated.tags,
        role: updated.role,
      }).eq("id", plantId);
      setPlants(prev => prev.map(p => p.id === plantId ? updated : p));
      setEditMode(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm(`¿Borrar "${plant.name}" definitivamente? Esta acción no se puede deshacer.`)) return;
    await deletePlant(plantId);
    onBack();
  };

  const TASK_TYPES = ["riego", "poda", "fertilizacion", "siembra", "trasplante", "cosecha", "tratamiento", "observacion", "otro"];
  const taskTypes_es = { poda: "✂️", riego: "💧", fertilizacion: "🌾", siembra: "🌱", trasplante: "🪴", cosecha: "🧺", tratamiento: "💊", observacion: "👁", otro: "📝" };
  const LIFECYCLE_LABEL = { anual: "🌱 Anual", bianual: "🌿 Bianual", perenne: "🌳 Perenne" };
  const inp = { width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#2c2416", outline: "none", fontFamily: "inherit" };
  const Lbl = ({ children }) => <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#8a7a5a", marginBottom: 5 }}>{children}</div>;
  const Field = ({ label, children }) => <div style={{ marginBottom: 12 }}><Lbl>{label}</Lbl>{children}</div>;

  return (
    <div className="fade-in">
      <button onClick={onBack} className="btn-secondary" style={{ marginBottom: 20 }}>← Volver</button>

      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 28 }}>
        <div style={{ fontSize: 64 }}>{plant.emoji}</div>
        <div style={{ flex: 1 }}>
          <div className="section-title">{plant.inGarden ? "Ficha de planta" : "Ficha de enciclopedia"}</div>
          <h2 style={{ margin: 0, fontSize: 32, fontWeight: 400 }}>{plant.name}</h2>
          <div style={{ fontSize: 14, color: "#8a7a5a", fontStyle: "italic", marginTop: 2 }}>{plant.family}</div>
          <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 4 }}>
            {!plant.inGarden && <span className="badge" style={{ background: "#e8e0f5", color: "#5a4a8a" }}>📚 Enciclopedia</span>}
            <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{LIFECYCLE_LABEL[plant.lifecycle]}</span>
            <span className="badge" style={{ background: "#f0e8d8", color: "#7a5a2a" }}>{PLANT_STATUS_ICON[plant.status] || "🌱"} {plant.status || "en tierra"}</span>
            {(plant.role || []).map(r => <span key={r} className="badge" style={{ background: "#f0e8d8", color: "#7a5a2a" }}>{r}</span>)}
            {(plant.tags || []).map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {!plant.inGarden && <button className="btn-primary" onClick={() => promoteToGarden(plantId)}>🌱 Sumar a mi jardín</button>}
          <button className="btn-secondary" onClick={() => setEditMode(v => !v)}>{editMode ? "Cancelar" : "✏️ Editar"}</button>
          {editMode && <button className="btn-primary" onClick={handleSaveEdit}>💾 Guardar</button>}
          <button className="btn-secondary" onClick={handleDelete} style={{ color: "#c04020", borderColor: "#e0c8b8" }}>🗑 Borrar</button>
        </div>
      </div>

      {editMode && (
        <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid #8ab860" }}>
          <div className="section-title">Editar planta</div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Nombre"><input style={inp} value={editData.name} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))} /></Field>
            <Field label="Emoji"><input style={inp} value={editData.emoji} onChange={e => setEditData(d => ({ ...d, emoji: e.target.value }))} /></Field>
            <Field label="Familia botánica"><input style={inp} value={editData.family} onChange={e => setEditData(d => ({ ...d, family: e.target.value }))} /></Field>
          </div>

          <Field label="Descripción general">
            <textarea style={{ ...inp, resize: "vertical" }} rows={3} value={editData.description} onChange={e => setEditData(d => ({ ...d, description: e.target.value }))} placeholder="Descripción de la planta, usos, características principales..." />
          </Field>

          <Field label="🍂 Contraestación — comportamiento fuera de temporada">
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={editData.offseason} onChange={e => setEditData(d => ({ ...d, offseason: e.target.value }))} placeholder="¿Pierde hojas? ¿Descansa? ¿Qué cuidados necesita?" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="Ciclo de vida">
              <select style={inp} value={editData.lifecycle} onChange={e => setEditData(d => ({ ...d, lifecycle: e.target.value }))}>
                <option value="anual">🌱 Anual</option>
                <option value="bianual">🌿 Bianual</option>
                <option value="perenne">🌳 Perenne</option>
              </select>
            </Field>
            <Field label="🪴 Estado">
              <select style={inp} value={editData.status} onChange={e => setEditData(d => ({ ...d, status: e.target.value }))}>
                {PLANT_STATUSES.map(s => <option key={s} value={s}>{PLANT_STATUS_ICON[s]} {s}</option>)}
              </select>
            </Field>
            <Field label="☀️ Luz solar">
              <select style={inp} value={editData.sunlight} onChange={e => setEditData(d => ({ ...d, sunlight: e.target.value }))}>
                {["pleno sol", "semisombra", "sombra", "luz indirecta"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="💧 Días entre riego">
              <input style={inp} type="number" min="1" value={editData.waterDays} onChange={e => setEditData(d => ({ ...d, waterDays: e.target.value }))} />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>📏 Altura final (cm) — mínima / máxima</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={editData.heightMin} onChange={e => setEditData(d => ({ ...d, heightMin: e.target.value }))} />
                <input style={inp} type="number" placeholder="Máx" value={editData.heightMax} onChange={e => setEditData(d => ({ ...d, heightMax: e.target.value }))} />
              </div>
            </div>
            <div>
              <Lbl>⭕ Diámetro final (cm) — mínimo / máximo</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={editData.diameterMin} onChange={e => setEditData(d => ({ ...d, diameterMin: e.target.value }))} />
                <input style={inp} type="number" placeholder="Máx" value={editData.diameterMax} onChange={e => setEditData(d => ({ ...d, diameterMax: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="🌸 Época de floración (meses, separados por coma)">
              <input style={inp} value={editData.floweringSeason} onChange={e => setEditData(d => ({ ...d, floweringSeason: e.target.value }))} placeholder="Agosto, Septiembre, Primavera..." />
            </Field>
            <Field label="🎨 Color de flor">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={editData.flowerColor} onChange={e => setEditData(d => ({ ...d, flowerColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={editData.flowerColor} onChange={e => setEditData(d => ({ ...d, flowerColor: e.target.value }))} placeholder="#ffffff" />
              </div>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="🍃 Color de follaje">
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={editData.foliageColor} onChange={e => setEditData(d => ({ ...d, foliageColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={editData.foliageColor} onChange={e => setEditData(d => ({ ...d, foliageColor: e.target.value }))} placeholder="#4a7a2a" />
              </div>
            </Field>
            <Field label="🍁 Forma de hoja">
              <select style={inp} value={editData.leafShape} onChange={e => setEditData(d => ({ ...d, leafShape: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {LEAF_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="🌳 Porte">
              <select style={inp} value={editData.habit} onChange={e => setEditData(d => ({ ...d, habit: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {PLANT_HABITS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <Field label="🌱 Época de siembra (meses, separados por coma)">
              <input style={inp} value={editData.sowingSeason} onChange={e => setEditData(d => ({ ...d, sowingSeason: e.target.value }))} placeholder="Marzo, Abril, Otoño..." />
            </Field>
            <Field label="🪴 Época de trasplante (meses, separados por coma)">
              <input style={inp} value={editData.transplantSeason} onChange={e => setEditData(d => ({ ...d, transplantSeason: e.target.value }))} placeholder="Septiembre, Octubre..." />
            </Field>
          </div>

          <Field label="🏷️ Etiquetas (separadas por coma — para búsqueda y filtros)">
            <input style={inp} value={editData.tags} onChange={e => setEditData(d => ({ ...d, tags: e.target.value }))} placeholder="aromática, comestible, polinizadores, sombra, sequía..." />
          </Field>

          <Field label="🌿 Roles en el jardín (separados por coma)">
            <input style={inp} value={editData.role} onChange={e => setEditData(d => ({ ...d, role: e.target.value }))} placeholder="estructura, floración, producción, aromática, sombra..." />
          </Field>

          <div style={{ marginTop: 16, display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleSaveEdit}>💾 Guardar cambios</button>
            <button className="btn-secondary" onClick={() => setEditMode(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {!editMode && (
        <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card">
              <div className="section-title">Ficha técnica</div>
              <p style={{ margin: "0 0 12px", lineHeight: 1.7, color: "#4a3a2a" }}>{plant.description}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, fontSize: 13 }}>
                <InfoRow icon="📏" label="Alto" value={plant.heightCm ? `${plant.heightCm[0]}–${plant.heightCm[1]} cm` : "—"} />
                <InfoRow icon="⭕" label="Diámetro" value={plant.diameterCm ? `${plant.diameterCm[0]}–${plant.diameterCm[1]} cm` : "—"} />
                <InfoRow icon="☀️" label="Sol" value={plant.sunlight || "—"} />
                <InfoRow icon="💧" label="Riego" value={plant.waterDays ? `cada ${plant.waterDays}d` : "—"} />
                <InfoRow icon="🌸" label="Floración" value={(plant.floweringSeason || []).join(", ") || "—"} />
                <InfoRow icon="🌱" label="Siembra" value={(plant.sowingSeason || []).join(", ") || "—"} />
                <InfoRow icon="🪴" label="Trasplante" value={(plant.transplantSeason || []).join(", ") || "—"} />
                <InfoRow icon="🎨" label="Color flor" value={
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: plant.flowerColor, border: "1px solid #ddd" }} />
                    {plant.flowerColor}
                  </span>
                } />
                {plant.foliageColor && (
                  <InfoRow icon="🍃" label="Color follaje" value={
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: plant.foliageColor, border: "1px solid #ddd" }} />
                      {plant.foliageColor}
                    </span>
                  } />
                )}
                {plant.leafShape && <InfoRow icon="🍁" label="Forma de hoja" value={plant.leafShape} />}
                {plant.habit && <InfoRow icon="🌳" label="Porte" value={plant.habit} />}
              </div>
              {plant.offseason && (
                <div style={{ marginTop: 12, padding: "10px 12px", background: "#f8f4ec", borderRadius: 8, fontSize: 13 }}>
                  <strong style={{ color: "#8a5a2a" }}>🍂 Contraestación:</strong>
                  <p style={{ margin: "4px 0 0", color: "#6a5a3a" }}>{plant.offseason}</p>
                </div>
              )}
            </div>

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

            {pbitacora.length > 0 && (
              <div className="card">
                <div className="section-title">📓 Bitácora relacionada ({pbitacora.length})</div>
                {pbitacora.slice().sort((a, b) => b.date.localeCompare(a.date)).map(b => (
                  <div key={b.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
                    <span style={{ fontSize: 18 }}>{BITACORA_CATEGORY_ICON[b.category] || "📝"}</span>
                    <div>
                      <div style={{ fontSize: 13, color: "#4a3a2a" }}>{b.text}</div>
                      <div style={{ fontSize: 11, color: "#aaa090", marginTop: 2 }}>{b.date} · {b.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {plant.inGarden && (
              <div className="card">
                <div className="section-title">Registrar tarea</div>
                <label>Tipo</label>
                <select value={newTaskType} onChange={e => setNewTaskType(e.target.value)} style={{ width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, fontFamily: "inherit" }}>
                  {TASK_TYPES.map(t => <option key={t} value={t}>{taskTypes_es[t] || "📝"} {t}</option>)}
                </select>
                <label>Fecha</label>
                <input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} style={{ width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, fontFamily: "inherit" }} />
                <label>Nota / observación</label>
                <textarea value={newTaskNote} rows={2} onChange={e => setNewTaskNote(e.target.value)} placeholder="¿Qué observaste? ¿Cómo quedó?" style={{ width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 10, fontFamily: "inherit", resize: "vertical" }} />
                <button className="btn-primary" onClick={handleAddTask}>Guardar tarea</button>
              </div>
            )}

            {plant.inGarden && (
              <div className="card">
                <div className="section-title">Historial de tareas ({ptasks.length})</div>
                {ptasks.length === 0
                  ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin tareas registradas aún.</p>
                  : ptasks.slice().sort((a, b) => b.date.localeCompare(a.date)).map(t => (
                    <div key={t.id} style={{ display: "flex", gap: 10, marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
                      <span style={{ fontSize: 20 }}>{taskTypes_es[t.type] || "📝"}</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#4a3a2a" }}>{t.type}</span>
                        <div style={{ fontSize: 11, color: "#aaa090" }}>{t.date}</div>
                        {t.note && <div style={{ fontSize: 13, color: "#6a5a3a", fontStyle: "italic" }}>"{t.note}"</div>}
                      </div>
                    </div>
                  ))
                }
              </div>
            )}

            <div className="card">
              <div className="section-title">📝 Notas ({(plant.communityNotes || []).length})</div>
              {(plant.communityNotes || []).map((n, i) => (
                <div key={i} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
                  <strong style={{ fontSize: 13 }}>{n.user}</strong>
                  <span style={{ fontSize: 11, color: "#aaa090", marginLeft: 8 }}>{n.date}</span>
                  <p style={{ margin: "4px 0 0", fontSize: 13, color: "#4a3a2a" }}>{n.text}</p>
                </div>
              ))}
              <label>Agregar nota</label>
              <textarea value={newNote} rows={2} onChange={e => setNewNote(e.target.value)} placeholder="Tu observación sobre esta planta..." style={{ width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, marginBottom: 8, fontFamily: "inherit", resize: "vertical" }} />
              <button className="btn-primary" onClick={handleAddNote}>Publicar nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function InfoRow({ icon, label, value }) {
  return (
    <div style={{ padding: "6px 0", borderBottom: "1px solid #f5f0e8" }}>
      <span style={{ fontSize: 14 }}>{icon}</span>
      <span style={{ fontSize: 11, color: "#8a7a5a", marginLeft: 4 }}>{label}: </span>
      <span style={{ fontSize: 13, color: "#4a3a2a" }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PLANTS SECTION
// ─────────────────────────────────────────────────────────────
function PlantsSection({ plants, setPlants, setSelectedPlantId, garden, searchQ, setSearchQ, getPlantContext, supabase, plantToDb, setSaving, autoOpenAdd, setAutoOpenAdd }) {
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      setAutoOpenAdd(false);
    }
  }, [autoOpenAdd, setAutoOpenAdd]);
  const emptyPlant = { name: "", emoji: "", family: "", description: "", heightCm: ["", ""], diameterCm: ["", ""], floweringSeason: [], sowingSeason: [], transplantSeason: [], flowerColor: "", foliageColor: "", leafShape: "", habit: "", lifecycle: "", role: [], offseason: "", waterDays: "", sunlight: "", zone: ["templada"], tags: [], communityNotes: [], plantOfDay: false, images: [], inGarden: true, status: "" };
  const [newPlant, setNewPlant] = useState(emptyPlant);
  const [newFloweringSeason, setNewFloweringSeason] = useState("");
  const [newSowingSeason, setNewSowingSeason] = useState("");
  const [newTransplantSeason, setNewTransplantSeason] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newRole, setNewRole] = useState("");
  const [filterLC, setFilterLC] = useState("todos");
  const [filterSun, setFilterSun] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = plants.filter(p => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.tags || []).join(" ").toLowerCase().includes(q) || (p.role || []).join(" ").toLowerCase().includes(q) || (p.floweringSeason || []).join(" ").toLowerCase().includes(q);
    const matchLC = filterLC === "todos" || p.lifecycle === filterLC;
    const matchSun = filterSun === "todos" || p.sunlight === filterSun;
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    return matchQ && matchLC && matchSun && matchStatus;
  });

  const addPlant = async () => {
    if (!newPlant.name.trim()) return;
    const plant = {
      ...newPlant,
      id: "p" + Date.now(),
      emoji: newPlant.emoji || "🌿",
      lifecycle: newPlant.lifecycle || "perenne",
      sunlight: newPlant.sunlight || "pleno sol",
      status: newPlant.status || "en tierra",
      flowerColor: newPlant.flowerColor || "#ffffff",
      foliageColor: newPlant.foliageColor || "",
      leafShape: newPlant.leafShape || "",
      habit: newPlant.habit || "",
      waterDays: Number(newPlant.waterDays) || 3,
      heightCm: [Number(newPlant.heightCm[0]) || 30, Number(newPlant.heightCm[1]) || 60],
      diameterCm: [Number(newPlant.diameterCm[0]) || 20, Number(newPlant.diameterCm[1]) || 40],
      floweringSeason: newFloweringSeason.split(",").map(s => s.trim()).filter(Boolean),
      sowingSeason: newSowingSeason.split(",").map(s => s.trim()).filter(Boolean),
      transplantSeason: newTransplantSeason.split(",").map(s => s.trim()).filter(Boolean),
      tags: newTags.split(",").map(s => s.trim()).filter(Boolean),
      role: newRole.split(",").map(s => s.trim()).filter(Boolean),
    };
    const dbPlant = {
      id: plant.id, name: plant.name, emoji: plant.emoji, family: plant.family,
      description: plant.description, offseason: plant.offseason,
      lifecycle: plant.lifecycle, sunlight: plant.sunlight,
      water_days: plant.waterDays,
      height_min: plant.heightCm[0], height_max: plant.heightCm[1],
      diameter_min: plant.diameterCm[0], diameter_max: plant.diameterCm[1],
      flower_color: plant.flowerColor,
      foliage_color: plant.foliageColor,
      leaf_shape: plant.leafShape,
      habit: plant.habit,
      flowering_season: plant.floweringSeason,
      sowing_season: plant.sowingSeason,
      transplant_season: plant.transplantSeason,
      tags: plant.tags, role: plant.role,
      plant_of_day: false, community_notes: [], in_garden: true, status: plant.status
    };
    setSaving(true);
    try {
      await supabase.from("plants").insert(dbPlant);
      setPlants(prev => [...prev, plant]);
      setShowAdd(false);
      setNewPlant(emptyPlant);
      setNewFloweringSeason(""); setNewSowingSeason(""); setNewTransplantSeason("");
      setNewTags(""); setNewRole("");
    } finally { setSaving(false); }
  };

  const inp = { width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#2c2416", outline: "none", fontFamily: "inherit" };
  const Lbl = ({ children }) => <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#8a7a5a", marginBottom: 5 }}>{children}</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="section-title">Base de plantas</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Mis plantas ({plants.length})</h2>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>＋ Agregar planta</button>
      </div>

      {/* Búsqueda y filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar por nombre, etiqueta, rol, floración…" style={{ ...inp, flex: 1, minWidth: 200 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center" }}>Ciclo:</span>
        {["todos", "anual", "bianual", "perenne"].map(lc => (
          <button key={lc} onClick={() => setFilterLC(lc)} className="btn-secondary"
            style={{ background: filterLC === lc ? "#4a7a2a" : undefined, color: filterLC === lc ? "#fff" : undefined, borderColor: filterLC === lc ? "#4a7a2a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {lc}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center", marginLeft: 8 }}>Luz:</span>
        {["todos", "pleno sol", "semisombra", "sombra"].map(s => (
          <button key={s} onClick={() => setFilterSun(s)} className="btn-secondary"
            style={{ background: filterSun === s ? "#4a7a2a" : undefined, color: filterSun === s ? "#fff" : undefined, borderColor: filterSun === s ? "#4a7a2a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {s === "todos" ? "todos" : s === "pleno sol" ? "☀️ sol" : s === "semisombra" ? "🌤 semisombra" : "🌑 sombra"}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center", marginLeft: 8 }}>Estado:</span>
        {["todos", ...PLANT_STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className="btn-secondary"
            style={{ background: filterStatus === s ? "#4a7a2a" : undefined, color: filterStatus === s ? "#fff" : undefined, borderColor: filterStatus === s ? "#4a7a2a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {s === "todos" ? "todos" : `${PLANT_STATUS_ICON[s]} ${s}`}
          </button>
        ))}
      </div>

      {/* Formulario nueva planta */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #8ab860" }}>
          <div className="section-title">Nueva planta</div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>Nombre</Lbl><input style={inp} value={newPlant.name} onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))} placeholder="Magnolia Soulangeana, Lavanda..." /></div>
            <div><Lbl>Emoji</Lbl><input style={inp} value={newPlant.emoji} onChange={e => setNewPlant(p => ({ ...p, emoji: e.target.value }))} /></div>
            <div><Lbl>Familia botánica</Lbl><input style={inp} value={newPlant.family} onChange={e => setNewPlant(p => ({ ...p, family: e.target.value }))} placeholder="Magnoliaceae..." /></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🪴 Estado</Lbl>
            <select style={inp} value={newPlant.status} onChange={e => setNewPlant(p => ({ ...p, status: e.target.value }))}>
              <option value="">— Elegir —</option>
              {PLANT_STATUSES.map(s => <option key={s} value={s}>{PLANT_STATUS_ICON[s]} {s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>Descripción general</Lbl>
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={newPlant.description} onChange={e => setNewPlant(p => ({ ...p, description: e.target.value }))} placeholder="Características principales, origen, usos..." />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🍂 Contraestación</Lbl>
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={newPlant.offseason} onChange={e => setNewPlant(p => ({ ...p, offseason: e.target.value }))} placeholder="¿Pierde hojas? ¿Descansa? ¿Qué cuidados necesita fuera de temporada?" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>Ciclo de vida</Lbl>
              <select style={inp} value={newPlant.lifecycle} onChange={e => setNewPlant(p => ({ ...p, lifecycle: e.target.value }))}>
                <option value="">— Elegir —</option>
                <option value="anual">🌱 Anual</option>
                <option value="bianual">🌿 Bianual</option>
                <option value="perenne">🌳 Perenne</option>
              </select>
            </div>
            <div><Lbl>☀️ Luz solar</Lbl>
              <select style={inp} value={newPlant.sunlight} onChange={e => setNewPlant(p => ({ ...p, sunlight: e.target.value }))}>
                <option value="">— Elegir —</option>
                {["pleno sol", "semisombra", "sombra", "luz indirecta"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div><Lbl>💧 Días entre riego</Lbl>
              <input style={inp} type="number" min="1" value={newPlant.waterDays} onChange={e => setNewPlant(p => ({ ...p, waterDays: e.target.value === "" ? "" : Number(e.target.value) }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>🍁 Forma de hoja</Lbl>
              <select style={inp} value={newPlant.leafShape} onChange={e => setNewPlant(p => ({ ...p, leafShape: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {LEAF_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Lbl>🌳 Porte</Lbl>
              <select style={inp} value={newPlant.habit} onChange={e => setNewPlant(p => ({ ...p, habit: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {PLANT_HABITS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div><Lbl>🍃 Color de follaje</Lbl>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={newPlant.foliageColor || "#4a7a2a"} onChange={e => setNewPlant(p => ({ ...p, foliageColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={newPlant.foliageColor} onChange={e => setNewPlant(p => ({ ...p, foliageColor: e.target.value }))} placeholder="#4a7a2a" />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>📏 Altura final (cm) — mínima / máxima</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={newPlant.heightCm[0]} onChange={e => setNewPlant(p => ({ ...p, heightCm: [e.target.value === "" ? "" : Number(e.target.value), p.heightCm[1]] }))} />
                <input style={inp} type="number" placeholder="Máx" value={newPlant.heightCm[1]} onChange={e => setNewPlant(p => ({ ...p, heightCm: [p.heightCm[0], e.target.value === "" ? "" : Number(e.target.value)] }))} />
              </div>
            </div>
            <div>
              <Lbl>⭕ Diámetro final (cm) — mínimo / máximo</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={newPlant.diameterCm[0]} onChange={e => setNewPlant(p => ({ ...p, diameterCm: [e.target.value === "" ? "" : Number(e.target.value), p.diameterCm[1]] }))} />
                <input style={inp} type="number" placeholder="Máx" value={newPlant.diameterCm[1]} onChange={e => setNewPlant(p => ({ ...p, diameterCm: [p.diameterCm[0], e.target.value === "" ? "" : Number(e.target.value)] }))} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>🌸 Época de floración (separadas por coma)</Lbl>
              <input style={inp} value={newFloweringSeason} onChange={e => setNewFloweringSeason(e.target.value)} placeholder="Agosto, Septiembre, Primavera..." />
            </div>
            <div>
              <Lbl>🎨 Color de flor</Lbl>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={newPlant.flowerColor} onChange={e => setNewPlant(p => ({ ...p, flowerColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={newPlant.flowerColor} onChange={e => setNewPlant(p => ({ ...p, flowerColor: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>🌱 Época de siembra (separadas por coma)</Lbl>
              <input style={inp} value={newSowingSeason} onChange={e => setNewSowingSeason(e.target.value)} placeholder="Marzo, Abril, Otoño..." />
            </div>
            <div>
              <Lbl>🪴 Época de trasplante (separadas por coma)</Lbl>
              <input style={inp} value={newTransplantSeason} onChange={e => setNewTransplantSeason(e.target.value)} placeholder="Septiembre, Octubre..." />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🏷️ Etiquetas (separadas por coma)</Lbl>
            <input style={inp} value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="aromática, comestible, polinizadores, sequía, sombra..." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Lbl>🌿 Roles en el jardín (separados por coma)</Lbl>
            <input style={inp} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="estructura, floración, producción, aromática, cobertura..." />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={addPlant}>＋ Agregar planta</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}

      {/* Grid de plantas */}
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
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <span className="badge" style={{ background: "#f0e8d8", color: "#7a5a2a", fontSize: 11 }}>{plant.lifecycle}</span>
                  {plant.flowerColor && plant.flowerColor !== "#ffffff" && (
                    <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: plant.flowerColor, border: "1px solid #ddd" }} title="Color de flor" />
                  )}
                </div>
              </div>
              <div className="plant-name-font" style={{ fontSize: 19, fontWeight: 600, marginTop: 8 }}>{plant.name}</div>
              <div style={{ fontSize: 12, color: "#8a7a5a", fontStyle: "italic" }}>{plant.family}</div>
              <div style={{ marginTop: 6 }}>
                <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{PLANT_STATUS_ICON[plant.status] || "🌱"} {plant.status || "en tierra"}</span>
              </div>
              {(plant.floweringSeason || []).length > 0 && (
                <div style={{ fontSize: 12, color: "#6a8a4a", marginTop: 4 }}>🌸 {plant.floweringSeason.join(", ")}</div>
              )}
              <div style={{ fontSize: 13, color: "#6a5a3a", marginTop: 4, lineHeight: 1.5 }}>{(plant.description || "").slice(0, 70)}{plant.description?.length > 70 ? "…" : ""}</div>
              <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
                {(plant.role || []).slice(0, 2).map(r => <span key={r} className="tag">{r}</span>)}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 8, fontSize: 12, color: "#aaa090" }}>
                <span>☀️ {plant.sunlight || "—"}</span>
                {plant.heightCm && <span>📏 {plant.heightCm[1]}cm</span>}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, color: "#aaa090", display: "flex", gap: 12 }}>
                <span>✅ {ctx.tasks.length} tareas</span>
                <span>💬 {(plant.communityNotes || []).length} notas</span>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8a7a5a", padding: 40 }}>
            🌿 No hay plantas que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ENCYCLOPEDIA SECTION — fichas de plantas que no están en el jardín
// ─────────────────────────────────────────────────────────────
function EncyclopediaSection({ plants, setPlants, setSelectedPlantId, supabase, setSaving }) {
  const [showAdd, setShowAdd] = useState(false);
  const emptyPlant = { name: "", emoji: "", family: "", description: "", heightCm: ["", ""], diameterCm: ["", ""], floweringSeason: [], sowingSeason: [], transplantSeason: [], flowerColor: "", foliageColor: "", leafShape: "", habit: "", lifecycle: "", role: [], offseason: "", waterDays: "", sunlight: "", zone: ["templada"], tags: [], communityNotes: [], plantOfDay: false, images: [], inGarden: false, status: "" };
  const [newPlant, setNewPlant] = useState(emptyPlant);
  const [newFloweringSeason, setNewFloweringSeason] = useState("");
  const [newSowingSeason, setNewSowingSeason] = useState("");
  const [newTransplantSeason, setNewTransplantSeason] = useState("");
  const [newTags, setNewTags] = useState("");
  const [newRole, setNewRole] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [filterLC, setFilterLC] = useState("todos");
  const [filterSun, setFilterSun] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filtered = plants.filter(p => {
    const q = searchQ.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.tags || []).join(" ").toLowerCase().includes(q) || (p.role || []).join(" ").toLowerCase().includes(q) || (p.floweringSeason || []).join(" ").toLowerCase().includes(q);
    const matchLC = filterLC === "todos" || p.lifecycle === filterLC;
    const matchSun = filterSun === "todos" || p.sunlight === filterSun;
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    return matchQ && matchLC && matchSun && matchStatus;
  });

  const addPlant = async () => {
    if (!newPlant.name.trim()) return;
    const plant = {
      ...newPlant,
      id: "p" + Date.now(),
      emoji: newPlant.emoji || "🌿",
      lifecycle: newPlant.lifecycle || "perenne",
      sunlight: newPlant.sunlight || "pleno sol",
      status: newPlant.status || "deseada",
      flowerColor: newPlant.flowerColor || "#ffffff",
      foliageColor: newPlant.foliageColor || "",
      leafShape: newPlant.leafShape || "",
      habit: newPlant.habit || "",
      waterDays: Number(newPlant.waterDays) || 3,
      heightCm: [Number(newPlant.heightCm[0]) || 30, Number(newPlant.heightCm[1]) || 60],
      diameterCm: [Number(newPlant.diameterCm[0]) || 20, Number(newPlant.diameterCm[1]) || 40],
      floweringSeason: newFloweringSeason.split(",").map(s => s.trim()).filter(Boolean),
      sowingSeason: newSowingSeason.split(",").map(s => s.trim()).filter(Boolean),
      transplantSeason: newTransplantSeason.split(",").map(s => s.trim()).filter(Boolean),
      tags: newTags.split(",").map(s => s.trim()).filter(Boolean),
      role: newRole.split(",").map(s => s.trim()).filter(Boolean),
    };
    const dbPlant = {
      id: plant.id, name: plant.name, emoji: plant.emoji, family: plant.family,
      description: plant.description, offseason: plant.offseason,
      lifecycle: plant.lifecycle, sunlight: plant.sunlight,
      water_days: plant.waterDays,
      height_min: plant.heightCm[0], height_max: plant.heightCm[1],
      diameter_min: plant.diameterCm[0], diameter_max: plant.diameterCm[1],
      flower_color: plant.flowerColor,
      foliage_color: plant.foliageColor,
      leaf_shape: plant.leafShape,
      habit: plant.habit,
      flowering_season: plant.floweringSeason,
      sowing_season: plant.sowingSeason,
      transplant_season: plant.transplantSeason,
      tags: plant.tags, role: plant.role,
      plant_of_day: false, community_notes: [], in_garden: false, status: plant.status
    };
    setSaving(true);
    try {
      await supabase.from("plants").insert(dbPlant);
      setPlants(prev => [...prev, plant]);
      setShowAdd(false);
      setNewPlant(emptyPlant);
      setNewFloweringSeason(""); setNewSowingSeason(""); setNewTransplantSeason("");
      setNewTags(""); setNewRole("");
    } finally { setSaving(false); }
  };

  const inp = { width: "100%", background: "#faf8f3", border: "1px solid #ddd4c0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#2c2416", outline: "none", fontFamily: "inherit" };
  const Lbl = ({ children }) => <div style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#8a7a5a", marginBottom: 5 }}>{children}</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div className="section-title">Fichas botánicas de referencia</div>
          <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Enciclopedia ({plants.length})</h2>
          <div style={{ fontSize: 13, color: "#8a7a5a", marginTop: 4 }}>Plantas que no tenés todavía, guardadas para diseño futuro.</div>
        </div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>＋ Nueva ficha</button>
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar por nombre, etiqueta, rol, floración…" style={{ ...inp, flex: 1, minWidth: 200 }} />
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center" }}>Ciclo:</span>
        {["todos", "anual", "bianual", "perenne"].map(lc => (
          <button key={lc} onClick={() => setFilterLC(lc)} className="btn-secondary"
            style={{ background: filterLC === lc ? "#5a4a8a" : undefined, color: filterLC === lc ? "#fff" : undefined, borderColor: filterLC === lc ? "#5a4a8a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {lc}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center", marginLeft: 8 }}>Luz:</span>
        {["todos", "pleno sol", "semisombra", "sombra"].map(s => (
          <button key={s} onClick={() => setFilterSun(s)} className="btn-secondary"
            style={{ background: filterSun === s ? "#5a4a8a" : undefined, color: filterSun === s ? "#fff" : undefined, borderColor: filterSun === s ? "#5a4a8a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {s === "todos" ? "todos" : s === "pleno sol" ? "☀️ sol" : s === "semisombra" ? "🌤 semisombra" : "🌑 sombra"}
          </button>
        ))}
        <span style={{ fontSize: 12, color: "#8a7a5a", alignSelf: "center", marginLeft: 8 }}>Estado:</span>
        {["todos", ...PLANT_STATUSES].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className="btn-secondary"
            style={{ background: filterStatus === s ? "#5a4a8a" : undefined, color: filterStatus === s ? "#fff" : undefined, borderColor: filterStatus === s ? "#5a4a8a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {s === "todos" ? "todos" : `${PLANT_STATUS_ICON[s]} ${s}`}
          </button>
        ))}
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #5a4a8a" }}>
          <div className="section-title">Nueva ficha de enciclopedia</div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>Nombre</Lbl><input style={inp} value={newPlant.name} onChange={e => setNewPlant(p => ({ ...p, name: e.target.value }))} placeholder="Magnolia Soulangeana, Salvia..." /></div>
            <div><Lbl>Emoji</Lbl><input style={inp} value={newPlant.emoji} onChange={e => setNewPlant(p => ({ ...p, emoji: e.target.value }))} /></div>
            <div><Lbl>Familia botánica</Lbl><input style={inp} value={newPlant.family} onChange={e => setNewPlant(p => ({ ...p, family: e.target.value }))} placeholder="Magnoliaceae..." /></div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🪴 Estado</Lbl>
            <select style={inp} value={newPlant.status} onChange={e => setNewPlant(p => ({ ...p, status: e.target.value }))}>
              <option value="">— Elegir —</option>
              {PLANT_STATUSES.map(s => <option key={s} value={s}>{PLANT_STATUS_ICON[s]} {s}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>Descripción general</Lbl>
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={newPlant.description} onChange={e => setNewPlant(p => ({ ...p, description: e.target.value }))} placeholder="Características principales, origen, usos..." />
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🍂 Contraestación</Lbl>
            <textarea style={{ ...inp, resize: "vertical" }} rows={2} value={newPlant.offseason} onChange={e => setNewPlant(p => ({ ...p, offseason: e.target.value }))} placeholder="¿Pierde hojas? ¿Descansa? ¿Qué cuidados necesita fuera de temporada?" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>Ciclo de vida</Lbl>
              <select style={inp} value={newPlant.lifecycle} onChange={e => setNewPlant(p => ({ ...p, lifecycle: e.target.value }))}>
                <option value="">— Elegir —</option>
                <option value="anual">🌱 Anual</option>
                <option value="bianual">🌿 Bianual</option>
                <option value="perenne">🌳 Perenne</option>
              </select>
            </div>
            <div><Lbl>☀️ Luz solar</Lbl>
              <select style={inp} value={newPlant.sunlight} onChange={e => setNewPlant(p => ({ ...p, sunlight: e.target.value }))}>
                <option value="">— Elegir —</option>
                {["pleno sol", "semisombra", "sombra", "luz indirecta"].map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div><Lbl>💧 Días entre riego</Lbl>
              <input style={inp} type="number" min="1" value={newPlant.waterDays} onChange={e => setNewPlant(p => ({ ...p, waterDays: e.target.value === "" ? "" : Number(e.target.value) }))} />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div><Lbl>🍁 Forma de hoja</Lbl>
              <select style={inp} value={newPlant.leafShape} onChange={e => setNewPlant(p => ({ ...p, leafShape: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {LEAF_SHAPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><Lbl>🌳 Porte</Lbl>
              <select style={inp} value={newPlant.habit} onChange={e => setNewPlant(p => ({ ...p, habit: e.target.value }))}>
                <option value="">— Sin especificar —</option>
                {PLANT_HABITS.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div><Lbl>🍃 Color de follaje</Lbl>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={newPlant.foliageColor || "#4a7a2a"} onChange={e => setNewPlant(p => ({ ...p, foliageColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={newPlant.foliageColor} onChange={e => setNewPlant(p => ({ ...p, foliageColor: e.target.value }))} placeholder="#4a7a2a" />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>📏 Altura final (cm) — mínima / máxima</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={newPlant.heightCm[0]} onChange={e => setNewPlant(p => ({ ...p, heightCm: [e.target.value === "" ? "" : Number(e.target.value), p.heightCm[1]] }))} />
                <input style={inp} type="number" placeholder="Máx" value={newPlant.heightCm[1]} onChange={e => setNewPlant(p => ({ ...p, heightCm: [p.heightCm[0], e.target.value === "" ? "" : Number(e.target.value)] }))} />
              </div>
            </div>
            <div>
              <Lbl>⭕ Diámetro final (cm) — mínimo / máximo</Lbl>
              <div style={{ display: "flex", gap: 8 }}>
                <input style={inp} type="number" placeholder="Mín" value={newPlant.diameterCm[0]} onChange={e => setNewPlant(p => ({ ...p, diameterCm: [e.target.value === "" ? "" : Number(e.target.value), p.diameterCm[1]] }))} />
                <input style={inp} type="number" placeholder="Máx" value={newPlant.diameterCm[1]} onChange={e => setNewPlant(p => ({ ...p, diameterCm: [p.diameterCm[0], e.target.value === "" ? "" : Number(e.target.value)] }))} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>🌸 Época de floración (separadas por coma)</Lbl>
              <input style={inp} value={newFloweringSeason} onChange={e => setNewFloweringSeason(e.target.value)} placeholder="Agosto, Septiembre, Primavera..." />
            </div>
            <div>
              <Lbl>🎨 Color de flor</Lbl>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={newPlant.flowerColor} onChange={e => setNewPlant(p => ({ ...p, flowerColor: e.target.value }))} style={{ width: 46, height: 40, border: "1px solid #ddd4c0", borderRadius: 8, cursor: "pointer", padding: 2 }} />
                <input style={{ ...inp, flex: 1 }} value={newPlant.flowerColor} onChange={e => setNewPlant(p => ({ ...p, flowerColor: e.target.value }))} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <Lbl>🌱 Época de siembra (separadas por coma)</Lbl>
              <input style={inp} value={newSowingSeason} onChange={e => setNewSowingSeason(e.target.value)} placeholder="Marzo, Abril, Otoño..." />
            </div>
            <div>
              <Lbl>🪴 Época de trasplante (separadas por coma)</Lbl>
              <input style={inp} value={newTransplantSeason} onChange={e => setNewTransplantSeason(e.target.value)} placeholder="Septiembre, Octubre..." />
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <Lbl>🏷️ Etiquetas (separadas por coma)</Lbl>
            <input style={inp} value={newTags} onChange={e => setNewTags(e.target.value)} placeholder="aromática, comestible, polinizadores, sequía, sombra..." />
          </div>

          <div style={{ marginBottom: 16 }}>
            <Lbl>🌿 Roles en el jardín (separados por coma)</Lbl>
            <input style={inp} value={newRole} onChange={e => setNewRole(e.target.value)} placeholder="estructura, floración, producción, aromática, cobertura..." />
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={addPlant}>＋ Agregar ficha</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="grid-auto" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
        {filtered.map(plant => (
          <div key={plant.id} className="card" style={{ cursor: "pointer", transition: "box-shadow 0.2s", borderTop: "3px solid #5a4a8a" }}
            onClick={() => setSelectedPlantId(plant.id)}
            onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 20px rgba(90,74,138,0.2)"}
            onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.05)"}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span style={{ fontSize: 36 }}>{plant.emoji}</span>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span className="badge" style={{ background: "#e8e0f5", color: "#5a4a8a", fontSize: 11 }}>📚 enciclopedia</span>
                {plant.flowerColor && plant.flowerColor !== "#ffffff" && (
                  <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: plant.flowerColor, border: "1px solid #ddd" }} title="Color de flor" />
                )}
              </div>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, marginTop: 8 }}>{plant.name}</div>
            <div style={{ fontSize: 12, color: "#8a7a5a", fontStyle: "italic" }}>{plant.family}</div>
            <div style={{ marginTop: 6 }}>
              <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{PLANT_STATUS_ICON[plant.status] || "💭"} {plant.status || "deseada"}</span>
            </div>
            {(plant.floweringSeason || []).length > 0 && (
              <div style={{ fontSize: 12, color: "#6a8a4a", marginTop: 4 }}>🌸 {plant.floweringSeason.join(", ")}</div>
            )}
            <div style={{ fontSize: 13, color: "#6a5a3a", marginTop: 4, lineHeight: 1.5 }}>{(plant.description || "").slice(0, 70)}{plant.description?.length > 70 ? "…" : ""}</div>
            <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 3 }}>
              {(plant.role || []).slice(0, 2).map(r => <span key={r} className="tag">{r}</span>)}
            </div>
            <div style={{ marginTop: 8, display: "flex", gap: 8, fontSize: 12, color: "#aaa090" }}>
              <span>☀️ {plant.sunlight || "—"}</span>
              {plant.heightCm && <span>📏 {plant.heightCm[1]}cm</span>}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#8a7a5a", padding: 40 }}>
            📚 Sin fichas que coincidan con tu búsqueda.
          </div>
        )}
      </div>
    </div>
  );
}

function TasksSection({ tasks, plants, gardens, garden, addTask, setSelectedPlantId }) {
  const [filterType, setFilterType] = useState("todos");
  const [newT, setNewT] = useState({ plantId: plants[0]?.id || "", gardenId: garden?.id || "", bedId: "", type: "poda", date: new Date().toISOString().slice(0, 10), note: "" });
  const [showAdd, setShowAdd] = useState(false);
  const taskTypes_es = { poda: "✂️", riego: "💧", fertilización: "🌾", siembra: "🌱", trasplante: "🪴", cosecha: "🧺", tratamiento: "💊", observación: "👁", otro: "📝" };
  const gardenTasks = tasks.filter(t => t.gardenId === garden?.id);
  const filtered = filterType === "todos" ? gardenTasks : gardenTasks.filter(t => t.type === filterType);
  const grouped = {};
  filtered.forEach(t => { const m = t.date.slice(0, 7); if (!grouped[m]) grouped[m] = []; grouped[m].push(t); });
  const months = Object.keys(grouped).sort().reverse();

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div><div className="section-title">Gestión de tareas</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Tareas — {garden?.name}</h2></div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>＋ Nueva tarea</button>
      </div>
      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Registrar tarea</div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
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
            <div style={{ gridColumn: "1 / -1" }}><label>Nota</label><input type="text" value={newT.note} onChange={e => setNewT(t => ({ ...t, note: e.target.value }))} placeholder="Observación, resultado…" /></div>
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
            {MONTHS[parseInt(m.slice(5, 7)) - 1]} {m.slice(0, 4)}
          </div>
          {grouped[m].map(t => {
            const pl = plants.find(p => p.id === t.plantId);
            return (
              <div key={t.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 0", borderBottom: "1px solid #f5f0e8" }}>
                <span style={{ fontSize: 22 }}>{taskTypes_es[t.type] || "📝"}</span>
                <div style={{ flex: 1 }}>
                  <span className="plant-link" onClick={() => setSelectedPlantId(t.plantId)} style={{ fontSize: 15, fontWeight: 600 }}>{pl?.emoji} {pl?.name}</span>
                  <span style={{ marginLeft: 8, fontSize: 13, color: "#8a7a5a" }}>{t.type}</span>
                  {t.note && <div style={{ fontSize: 13, color: "#6a5a3a", fontStyle: "italic", marginTop: 3 }}>"{t.note}"</div>}
                </div>
                <div style={{ fontSize: 12, color: "#aaa090", whiteSpace: "nowrap" }}>{t.date}</div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CALENDAR SECTION
// ─────────────────────────────────────────────────────────────
function CalendarSection({ tasks, plants, garden, setSelectedPlantId, bitacora = [], gardens = [] }) {
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [showGuru, setShowGuru] = useState(true);
  const monthTasks = tasks.filter(t => parseInt(t.date.slice(5, 7)) - 1 === viewMonth);
  const monthBitacora = bitacora.filter(b => parseInt(b.date.slice(5, 7)) - 1 === viewMonth).slice().sort((a, b) => b.date.localeCompare(a.date));
  const byPlant = {};
  monthTasks.forEach(t => { if (!byPlant[t.plantId]) byPlant[t.plantId] = []; byPlant[t.plantId].push(t); });
  const guruThisMonth = GURU_CALENDAR[viewMonth] || [];
  const taskTypes_es = { poda: "✂️", riego: "💧", fertilización: "🌾", siembra: "🌱", trasplante: "🪴", cosecha: "🧺", tratamiento: "💊", observación: "👁", otro: "📝" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Calendario perpetuo</div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Actividad por mes</h2>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
        {MONTHS.map((m, i) => (
          <button key={i} onClick={() => setViewMonth(i)} className="btn-secondary"
            style={{ background: viewMonth === i ? "#4a7a2a" : undefined, color: viewMonth === i ? "#fff" : undefined, borderColor: viewMonth === i ? "#4a7a2a" : undefined, fontSize: 12, padding: "6px 10px" }}>
            {m.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="card">
          <div className="section-title">🔒 Mis registros — {MONTHS[viewMonth]}</div>
          {Object.keys(byPlant).length === 0
            ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin registros para este mes.</p>
            : Object.entries(byPlant).map(([pid, ptasks]) => {
              const pl = plants.find(p => p.id === pid);
              return (
                <div key={pid} style={{ marginBottom: 14 }}>
                  <span className="plant-link" onClick={() => setSelectedPlantId(pid)} style={{ fontSize: 15, fontWeight: 600 }}>{pl?.emoji} {pl?.name}</span>
                  {ptasks.map(t => (
                    <div key={t.id} style={{ marginTop: 4, display: "flex", gap: 8 }}>
                      <span>{taskTypes_es[t.type] || "📝"}</span>
                      <span style={{ fontSize: 13 }}>{t.type}</span>
                    </div>
                  ))}
                </div>
              );
            })
          }
        </div>
        <div className="card" style={{ borderLeft: "4px solid #5a8ab0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <div className="section-title" style={{ margin: 0 }}>🌍 Expertos — {MONTHS[viewMonth]}</div>
            <button className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }} onClick={() => setShowGuru(v => !v)}>{showGuru ? "Ocultar" : "Mostrar"}</button>
          </div>
          {showGuru && (guruThisMonth.length === 0
            ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin recomendaciones este mes.</p>
            : guruThisMonth.map((g, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#3a5a80" }}>🌿 {g.plant}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{g.action}</div>
                <div style={{ fontSize: 11, color: "#aaa090" }}>Fuente: {g.source}</div>
              </div>
            ))
          )}
        </div>
        <div className="card" style={{ gridColumn: "1 / -1", borderLeft: "4px solid #8ab860" }}>
          <div className="section-title">📓 Bitácora — {MONTHS[viewMonth]}</div>
          {monthBitacora.length === 0
            ? <p style={{ color: "#8a7a5a", fontSize: 14 }}>Sin anotaciones para este mes.</p>
            : monthBitacora.map(b => {
              const g = gardens.find(gd => gd.id === b.gardenId);
              const pl = plants.find(p => p.id === b.plantId);
              return (
                <div key={b.id} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #f0e8d8" }}>
                  <span style={{ fontSize: 18 }}>{BITACORA_CATEGORY_ICON[b.category] || "📝"}</span>
                  <div>
                    <div style={{ fontSize: 13, color: "#4a3a2a" }}>{b.text}</div>
                    <div style={{ fontSize: 11, color: "#aaa090", marginTop: 2 }}>
                      {b.date} · {g ? `🌿 ${g.name}` : "🌍 General"}
                      {pl && <> · <span className="plant-link" onClick={() => setSelectedPlantId(pl.id)}>{pl.emoji} {pl.name}</span></>}
                    </div>
                  </div>
                </div>
              );
            })
          }
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// BITÁCORA SECTION
// ─────────────────────────────────────────────────────────────
function BitacoraSection({ bitacora, addBitacoraEntry, gardens, plants = [], setSelectedPlantId }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState({ date: new Date().toISOString().slice(0, 10), category: "observación general", text: "", gardenId: "", plantId: "" });
  const [filterCat, setFilterCat] = useState("todas");

  const handleAdd = () => {
    if (!newEntry.text.trim()) return;
    addBitacoraEntry(newEntry);
    setNewEntry(e => ({ ...e, text: "", plantId: "" }));
    setShowAdd(false);
  };

  const sorted = bitacora.slice().sort((a, b) => b.date.localeCompare(a.date));
  const filtered = filterCat === "todas" ? sorted : sorted.filter(b => b.category === filterCat);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div className="section-title">Diario del jardín</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Bitácora</h2></div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>＋ Nueva anotación</button>
      </div>

      {showAdd && (
        <div className="card" style={{ marginBottom: 20, borderLeft: "4px solid #8ab860" }}>
          <div className="section-title">Nueva anotación</div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
            <div><label>Fecha</label><input type="date" value={newEntry.date} onChange={e => setNewEntry(x => ({ ...x, date: e.target.value }))} /></div>
            <div><label>Categoría</label>
              <select value={newEntry.category} onChange={e => setNewEntry(x => ({ ...x, category: e.target.value }))}>
                {BITACORA_CATEGORIES.map(c => <option key={c} value={c}>{BITACORA_CATEGORY_ICON[c]} {c}</option>)}
              </select>
            </div>
            <div><label>Jardín</label>
              <select value={newEntry.gardenId} onChange={e => setNewEntry(x => ({ ...x, gardenId: e.target.value }))}>
                <option value="">🌍 General / fuera del jardín</option>
                {gardens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div><label>Planta (opcional)</label>
              <select value={newEntry.plantId} onChange={e => setNewEntry(x => ({ ...x, plantId: e.target.value }))}>
                <option value="">— Sin planta puntual —</option>
                {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label>Observación</label>
              <textarea rows={3} value={newEntry.text} onChange={e => setNewEntry(x => ({ ...x, text: e.target.value }))} placeholder="Florecieron los ciruelos en el barrio, helada fuerte esta noche, llegaron las primeras golondrinas…" />
            </div>
          </div>
          <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleAdd}>Guardar</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {["todas", ...BITACORA_CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)} className="btn-secondary"
            style={{ background: filterCat === c ? "#4a7a2a" : undefined, color: filterCat === c ? "#fff" : undefined, borderColor: filterCat === c ? "#4a7a2a" : undefined, fontSize: 12, padding: "5px 12px" }}>
            {c === "todas" ? "🌿 todas" : `${BITACORA_CATEGORY_ICON[c]} ${c}`}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filtered.map(b => {
          const g = gardens.find(gd => gd.id === b.gardenId);
          const pl = plants.find(p => p.id === b.plantId);
          return (
            <div key={b.id} className="card">
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: 22 }}>{BITACORA_CATEGORY_ICON[b.category] || "📝"}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                    <span className="badge" style={{ background: "#e8f0d8", color: "#4a7a2a" }}>{b.category}</span>
                    <span style={{ fontSize: 12, color: "#aaa090" }}>{b.date}</span>
                    <span style={{ fontSize: 12, color: "#8a7a5a" }}>{g ? `🌿 ${g.name}` : "🌍 General"}</span>
                    {pl && <span className="plant-link" onClick={() => setSelectedPlantId(pl.id)} style={{ fontSize: 12 }}>{pl.emoji} {pl.name}</span>}
                  </div>
                  <p style={{ margin: "6px 0 0", fontSize: 14, color: "#4a3a2a", lineHeight: 1.6 }}>{b.text}</p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="card" style={{ textAlign: "center", color: "#8a7a5a", padding: 40 }}>📓 Sin anotaciones todavía. Empezá a registrar lo que observás.</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DESIGN SECTION
// ─────────────────────────────────────────────────────────────
function DesignSection({ garden, gardens, setGardens, plants, encyclopediaPlants = [], promoteToGarden, setSelectedPlantId, activeGarden, supabase, setSaving }) {
  const [selectedBed, setSelectedBed] = useState(null);
  const [showAddBed, setShowAddBed] = useState(false);
  const [newBed, setNewBed] = useState({ name: "", w: 3, h: 2 });
  const [showEncyclopedia, setShowEncyclopedia] = useState(false);
  const [addPlantQuery, setAddPlantQuery] = useState("");

  const updateGardenBeds = async (newBeds) => {
    setSaving(true);
    try {
      await supabase.from("gardens").update({ beds: newBeds }).eq("id", activeGarden);
      setGardens(prev => prev.map(g => g.id === activeGarden ? { ...g, beds: newBeds } : g));
    } finally { setSaving(false); }
  };

  const addBed = async () => {
    if (!newBed.name.trim()) return;
    const beds = [...(garden?.beds || []), { id: "b" + Date.now(), name: newBed.name, shape: "rect", w: parseFloat(newBed.w), h: parseFloat(newBed.h), plantIds: [] }];
    await updateGardenBeds(beds);
    setShowAddBed(false);
    setNewBed({ name: "", w: 3, h: 2 });
  };

  const addPlantToBed = async (bedId, plantId, fromEncyclopedia) => {
    if (fromEncyclopedia) await promoteToGarden(plantId);
    const beds = (garden?.beds || []).map(b => b.id === bedId && !b.plantIds.includes(plantId) ? { ...b, plantIds: [...b.plantIds, plantId] } : b);
    await updateGardenBeds(beds);
  };

  const removePlantFromBed = async (bedId, plantId) => {
    const beds = (garden?.beds || []).map(b => b.id === bedId ? { ...b, plantIds: b.plantIds.filter(id => id !== plantId) } : b);
    await updateGardenBeds(beds);
  };

  const bed = (garden?.beds || []).find(b => b.id === selectedBed);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div className="section-title">Diseño del jardín</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>{garden?.name}</h2></div>
        <button className="btn-primary" onClick={() => setShowAddBed(v => !v)}>＋ Nuevo cantero</button>
      </div>
      {showAddBed && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Nuevo cantero</div>
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
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="section-title">Plano visual</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-end" }}>
          {(garden?.beds || []).map(b => (
            <div key={b.id} onClick={() => setSelectedBed(b.id === selectedBed ? null : b.id)}
              style={{ cursor: "pointer", width: b.w * 60, minWidth: 80, minHeight: 50, height: b.h * 60, background: selectedBed === b.id ? "#d4f0a8" : "#e8f5d8", border: `2px solid ${selectedBed === b.id ? "#4a7a2a" : "#a8c890"}`, borderRadius: 8, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#4a7a2a", textAlign: "center" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "#8a7a5a", marginTop: 2 }}>{b.w}×{b.h}m</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 2, marginTop: 4, justifyContent: "center" }}>
                {(b.plantIds || []).map(pid => { const pl = plants.find(p => p.id === pid); return pl ? <span key={pid} style={{ fontSize: 16 }} title={pl.name}>{pl.emoji}</span> : null; })}
              </div>
            </div>
          ))}
          {!(garden?.beds?.length) && <p style={{ color: "#8a7a5a" }}>Sin canteros. Crea el primero arriba.</p>}
        </div>
      </div>
      {bed && (
        <div className="card">
          <div className="section-title">Cantero: {bed.name}</div>
          <div style={{ fontSize: 13, color: "#8a7a5a", marginBottom: 14 }}>Dimensiones: {bed.w} × {bed.h} m · Área: {(bed.w * bed.h).toFixed(1)} m²</div>
          <div className="grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 10 }}>Plantas en este cantero</div>
              {(bed.plantIds || []).length === 0 ? <p style={{ color: "#8a7a5a", fontSize: 13 }}>Vacío.</p>
                : (bed.plantIds || []).map(pid => {
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
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontWeight: 600 }}>Agregar planta</div>
                <button className="btn-secondary" onClick={() => setShowEncyclopedia(v => !v)} style={{ fontSize: 11, padding: "4px 10px", background: showEncyclopedia ? "#5a4a8a" : undefined, color: showEncyclopedia ? "#fff" : undefined, borderColor: showEncyclopedia ? "#5a4a8a" : undefined }}>
                  📚 {showEncyclopedia ? "Ocultar enciclopedia" : "Incluir enciclopedia"}
                </button>
              </div>
              <input type="text" value={addPlantQuery} onChange={e => setAddPlantQuery(e.target.value)} placeholder="Buscar planta…" style={{ marginBottom: 10 }} />
              {[...plants, ...(showEncyclopedia ? encyclopediaPlants : [])]
                .filter(p => !(bed.plantIds || []).includes(p.id))
                .filter(p => !addPlantQuery || p.name.toLowerCase().includes(addPlantQuery.toLowerCase()))
                .map(p => (
                  <button key={p.id} onClick={() => addPlantToBed(bed.id, p.id, !p.inGarden)}
                    style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", background: "none", border: "1px solid #e0d8c8", borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 13, marginBottom: 6, fontFamily: "inherit", textAlign: "left" }}>
                    <span>{p.emoji}</span><span style={{ flex: 1 }}>{p.name}</span>
                    {!p.inGarden && <span className="badge" style={{ background: "#e8e0f5", color: "#5a4a8a", fontSize: 10 }}>📚</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PESTS SECTION
// ─────────────────────────────────────────────────────────────
function PestsSection({ pests, setPests, plants, garden, setSelectedPlantId, supabase, addPest, setSaving, autoOpenAdd, setAutoOpenAdd }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newPest, setNewPest] = useState({ plantId: plants[0]?.id || "", name: "", date: new Date().toISOString().slice(0, 10), treatment: "", resolved: false });

  useEffect(() => {
    if (autoOpenAdd) {
      setShowAdd(true);
      setAutoOpenAdd(false);
    }
  }, [autoOpenAdd, setAutoOpenAdd]);

  const handleAddPest = async () => {
    if (!newPest.name.trim()) return;
    await addPest(newPest);
    setShowAdd(false);
  };

  const markResolved = async (id) => {
    setSaving(true);
    try {
      await supabase.from("pests").update({ resolved: true }).eq("id", id);
      setPests(prev => prev.map(p => p.id === id ? { ...p, resolved: true } : p));
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div><div className="section-title">Sanidad vegetal</div><h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Plagas & tratamientos</h2></div>
        <button className="btn-primary" onClick={() => setShowAdd(v => !v)}>＋ Registrar plaga</button>
      </div>
      {showAdd && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="section-title">Nueva plaga</div>
          <div className="grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div><label>Planta</label>
              <select value={newPest.plantId} onChange={e => setNewPest(p => ({ ...p, plantId: e.target.value }))}>
                {plants.map(p => <option key={p.id} value={p.id}>{p.emoji} {p.name}</option>)}
              </select>
            </div>
            <div><label>Plaga</label><input type="text" value={newPest.name} onChange={e => setNewPest(p => ({ ...p, name: e.target.value }))} placeholder="Mosca blanca, pulgón…" /></div>
            <div><label>Fecha</label><input type="date" value={newPest.date} onChange={e => setNewPest(p => ({ ...p, date: e.target.value }))} /></div>
            <div style={{ gridColumn: "1 / -1" }}><label>Tratamiento</label><textarea value={newPest.treatment} rows={2} onChange={e => setNewPest(p => ({ ...p, treatment: e.target.value }))} /></div>
          </div>
          <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
            <button className="btn-primary" onClick={handleAddPest}>Guardar</button>
            <button className="btn-secondary" onClick={() => setShowAdd(false)}>Cancelar</button>
          </div>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {pests.map(p => {
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
                  <span className="plant-link" onClick={() => setSelectedPlantId(p.plantId)} style={{ fontSize: 13 }}>{pl?.emoji} {pl?.name}</span>
                  <span style={{ fontSize: 12, color: "#aaa090", marginLeft: 10 }}>{p.date}</span>
                  {p.treatment && <div style={{ fontSize: 13, marginTop: 8, fontStyle: "italic" }}>💊 {p.treatment}</div>}
                </div>
                {!p.resolved && <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => markResolved(p.id)}>✓ Marcar resuelto</button>}
              </div>
            </div>
          );
        })}
        {pests.length === 0 && <div className="card" style={{ textAlign: "center", color: "#8a7a5a", padding: 40 }}>🌿 Sin plagas registradas. ¡Buen trabajo!</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY SECTION
// ─────────────────────────────────────────────────────────────
function CommunitySection({ plants, updatePlantNote, setSelectedPlantId }) {
  const [search, setSearch] = useState("");
  const allNotes = plants.flatMap(p => (p.communityNotes || []).map(n => ({ ...n, plantId: p.id, plantName: p.name, plantEmoji: p.emoji })));
  const filteredPlants = plants.filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="section-title">Espacio público</div>
        <h2 style={{ margin: 0, fontSize: 24, fontWeight: 400 }}>Comunidad</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div>
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar planta…" style={{ marginBottom: 16 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {filteredPlants.map(p => (
              <div key={p.id} className="card">
                <div style={{ display: "flex", gap: 12 }}>
                  <span style={{ fontSize: 32 }}>{p.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <span className="plant-link" onClick={() => setSelectedPlantId(p.id)} style={{ fontSize: 17, fontWeight: 600 }}>{p.name}</span>
                    <span style={{ marginLeft: 8, fontSize: 12, color: "#8a7a5a" }}>{(p.communityNotes || []).length} notas</span>
                    <div style={{ marginTop: 6 }}>
                      {(p.communityNotes || []).slice(0, 2).map((n, i) => (
                        <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f5f0e8" }}>
                          <strong>{n.user}</strong> <span style={{ color: "#aaa090", fontSize: 11 }}>{n.date}</span>
                          <p style={{ margin: "2px 0 0" }}>{n.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <div className="section-title">Actividad reciente</div>
          {allNotes.slice(-8).reverse().map((n, i) => (
            <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: "1px solid #f5f0e8" }}>
              <span className="plant-link" onClick={() => setSelectedPlantId(n.plantId)} style={{ fontSize: 13, fontWeight: 600 }}>{n.plantEmoji} {n.plantName}</span>
              <p style={{ margin: "4px 0 0", fontSize: 12 }}>{n.text}</p>
              <div style={{ fontSize: 11, color: "#aaa090" }}>{n.user} · {n.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
