import { useEffect, useMemo, useState } from "react";

type Driver = {
  position: string;
  points: string;
  wins: string;
  Driver: { driverId: string; code?: string; givenName: string; familyName: string; nationality?: string };
  Constructors?: { name: string }[];
};
type Constructor = {
  position: string;
  points: string;
  wins: string;
  Constructor: { constructorId: string; name: string; nationality?: string };
};
type Race = {
  round: string;
  raceName: string;
  date: string;
  Circuit: {
    circuitName: string;
    circuitId: string;
    Location: { locality: string; country: string };
  };
  Results?: { position: string; Driver: { givenName: string; familyName: string }; Constructor: { name: string } }[];
};
type ApiResponse<T> = { MRData?: { StandingsTable?: { StandingsLists?: { DriverStandings?: Driver[]; ConstructorStandings?: Constructor[] }[] }; RaceTable?: { Races?: T[] } } };

const API = "https://api.jolpi.ca/ergast/f1";
const sampleDrivers: Driver[] = [
  { position: "1", points: "395", wins: "9", Driver: { driverId: "verstappen", code: "VER", givenName: "Max", familyName: "Verstappen" }, Constructors: [{ name: "Red Bull" }] },
  { position: "2", points: "374", wins: "7", Driver: { driverId: "norris", code: "NOR", givenName: "Lando", familyName: "Norris" }, Constructors: [{ name: "McLaren" }] },
  { position: "3", points: "356", wins: "6", Driver: { driverId: "leclerc", code: "LEC", givenName: "Charles", familyName: "Leclerc" }, Constructors: [{ name: "Ferrari" }] },
  { position: "4", points: "292", wins: "4", Driver: { driverId: "piastri", code: "PIA", givenName: "Oscar", familyName: "Piastri" }, Constructors: [{ name: "McLaren" }] },
  { position: "5", points: "245", wins: "3", Driver: { driverId: "sainz", code: "SAI", givenName: "Carlos", familyName: "Sainz" }, Constructors: [{ name: "Ferrari" }] },
];
const sampleConstructors: Constructor[] = [
  { position: "1", points: "666", wins: "13", Constructor: { constructorId: "mclaren", name: "McLaren" } },
  { position: "2", points: "652", wins: "8", Constructor: { constructorId: "ferrari", name: "Ferrari" } },
  { position: "3", points: "589", wins: "9", Constructor: { constructorId: "red_bull", name: "Red Bull" } },
  { position: "4", points: "468", wins: "4", Constructor: { constructorId: "mercedes", name: "Mercedes" } },
  { position: "5", points: "94", wins: "0", Constructor: { constructorId: "aston_martin", name: "Aston Martin" } },
];
const sampleRaces: Race[] = [
  { round: "1", raceName: "Australian Grand Prix", date: "2025-03-16", Circuit: { circuitName: "Albert Park Grand Prix Circuit", circuitId: "albert_park", Location: { locality: "Melbourne", country: "Australia" } } },
  { round: "2", raceName: "Chinese Grand Prix", date: "2025-03-23", Circuit: { circuitName: "Shanghai International Circuit", circuitId: "shanghai", Location: { locality: "Shanghai", country: "China" } } },
  { round: "3", raceName: "Japanese Grand Prix", date: "2025-04-06", Circuit: { circuitName: "Suzuka International Racing Course", circuitId: "suzuka", Location: { locality: "Suzuka", country: "Japan" } } },
  { round: "4", raceName: "Bahrain Grand Prix", date: "2025-04-13", Circuit: { circuitName: "Bahrain International Circuit", circuitId: "bahrain", Location: { locality: "Sakhir", country: "Bahrain" } } },
  { round: "5", raceName: "Saudi Arabian Grand Prix", date: "2025-04-20", Circuit: { circuitName: "Jeddah Corniche Circuit", circuitId: "jeddah", Location: { locality: "Jeddah", country: "Saudi Arabia" } } },
  { round: "6", raceName: "Miami Grand Prix", date: "2025-05-04", Circuit: { circuitName: "Miami International Autodrome", circuitId: "miami", Location: { locality: "Miami", country: "USA" } } },
  { round: "7", raceName: "Emilia Romagna Grand Prix", date: "2025-05-18", Circuit: { circuitName: "Autodromo Enzo e Dino Ferrari", circuitId: "imola", Location: { locality: "Imola", country: "Italy" } } },
  { round: "8", raceName: "Monaco Grand Prix", date: "2025-05-25", Circuit: { circuitName: "Circuit de Monaco", circuitId: "monaco", Location: { locality: "Monte Carlo", country: "Monaco" } } },
];

function App() {
  const [season, setSeason] = useState("2026");
  const [page, setPage] = useState<"dashboard" | "explorer">("dashboard");
  const [drivers, setDrivers] = useState<Driver[]>(sampleDrivers);
  const [constructors, setConstructors] = useState<Constructor[]>(sampleConstructors);
  const [races, setRaces] = useState<Race[]>(sampleRaces);
  const [source, setSource] = useState<"api" | "sample" | "loading">("loading");
  const [search, setSearch] = useState("");
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function loadSeason() {
      setSource("loading");
      setError("");
      try {
        const [driverRes, constructorRes, raceRes] = await Promise.all([
          fetch(`${API}/${season}/driverStandings/1.json`),
          fetch(`${API}/${season}/constructorStandings/1.json`),
          fetch(`${API}/${season}/races.json?limit=100`),
        ]);
        if (!driverRes.ok || !constructorRes.ok || !raceRes.ok) throw new Error("The F1 data service is temporarily unavailable.");
        const [driverJson, constructorJson, raceJson] = await Promise.all([
          driverRes.json() as Promise<ApiResponse<Race>>,
          constructorRes.json() as Promise<ApiResponse<Race>>,
          raceRes.json() as Promise<ApiResponse<Race>>,
        ]);
        if (!active) return;
        const nextDrivers = driverJson.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
        const nextConstructors = constructorJson.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings ?? [];
        const nextRaces = raceJson.MRData?.RaceTable?.Races ?? [];
        setDrivers(nextDrivers.length ? nextDrivers : sampleDrivers);
        setConstructors(nextConstructors.length ? nextConstructors : sampleConstructors);
        setRaces(nextRaces.length ? nextRaces : sampleRaces);
        setSource(nextDrivers.length && nextConstructors.length ? "api" : "sample");
      } catch {
        if (!active) return;
        setDrivers(sampleDrivers);
        setConstructors(sampleConstructors);
        setRaces(sampleRaces);
        setSource("sample");
        setError("Could not reach the live results service. Showing clearly labelled example data instead.");
      }
    }
    loadSeason();
    return () => { active = false; };
  }, [season]);

  const filteredRaces = useMemo(() => races.filter((race) =>
    `${race.raceName} ${race.Circuit.circuitName} ${race.Circuit.Location.country} ${race.Circuit.Location.locality}`.toLowerCase().includes(search.toLowerCase())
  ), [races, search]);

  const completedRaces = races.filter((race) => new Date(race.date) < new Date()).length;
  const leader = drivers[0];
  const maxPoints = Math.max(...drivers.map((d) => Number(d.points)), 1);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setPage("dashboard"); }}>
          <span className="brand-mark">A</span><span>APEX<span className="brand-muted">REPLAY</span><small>F1 INTELLIGENCE</small></span>
        </a>
        <div className="side-label">WORKSPACE</div>
        <button className={`nav-link ${page === "dashboard" ? "active" : ""}`} onClick={() => setPage("dashboard")}><span>▦</span> Overview</button>
        <button className={`nav-link ${page === "explorer" ? "active" : ""}`} onClick={() => setPage("explorer")}><span>◎</span> Race & Circuit Explorer</button>
        <div className="sidebar-bottom">
          <div className="status-dot" />
          <div><strong>DATA CONNECTION</strong><small>{source === "api" ? "Jolpica API connected" : source === "loading" ? "Connecting…" : "Sample mode"}</small></div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">APEXREPLAY <span>/</span> {page === "dashboard" ? "OVERVIEW" : "RACE EXPLORER"}</div>
          <div className="top-actions">
            <span className={`data-pill ${source}`}><i />{source === "api" ? "API DATA" : source === "loading" ? "LOADING" : "DEMO DATA"}</span>
            <label className="season-select"><span>SEASON</span><select value={season} onChange={(e) => setSeason(e.target.value)}><option value="2026">2026</option><option value="2025">2025</option><option value="2024">2024</option><option value="2023">2023</option></select></label>
          </div>
        </header>

        <section className="page-heading">
          <div><div className="eyebrow"><span /> THE DATA-DRIVEN SIDE OF FORMULA 1</div><h1>{page === "dashboard" ? "Race intelligence." : "Every circuit. Every story."}</h1><p>{page === "dashboard" ? "The season at a glance. Performance, points and the details behind every result." : "Explore the calendar, discover legendary circuits and dive into each race weekend."}</p></div>
          <div className="heading-season"><span>SEASON</span><strong>{season}</strong><small>FIA FORMULA ONE WORLD CHAMPIONSHIP</small></div>
        </section>

        {error && <div className="notice">ⓘ {error}</div>}

        {page === "dashboard" ? (
          <>
            <section className="metric-grid">
              <Metric label="CHAMPIONSHIP LEADER" value={leader ? `${leader.Driver.givenName} ${leader.Driver.familyName}` : "—"} detail={leader ? `${leader.points} points · P1` : "Standings not available"} accent="red" />
              <Metric label="ROUNDS IN CALENDAR" value={String(races.length).padStart(2, "0")} detail="Scheduled race weekends" />
              <Metric label="ROUNDS COMPLETED" value={String(completedRaces).padStart(2, "0")} detail="Based on race dates" />
              <Metric label="CONSTRUCTORS TRACKED" value={String(constructors.length).padStart(2, "0")} detail="Teams in championship table" />
            </section>

            <section className="content-grid">
              <div className="panel standings-panel">
                <div className="panel-heading"><div><span className="eyebrow">THE GRID</span><h2>Driver standings</h2></div><span className="panel-tag">{season} SEASON</span></div>
                <div className="table-wrap"><table><thead><tr><th>POS</th><th>DRIVER</th><th>TEAM</th><th>WINS</th><th>POINTS</th></tr></thead><tbody>
                  {drivers.slice(0, 10).map((driver) => <tr key={driver.Driver.driverId}><td className="position">{String(driver.position).padStart(2, "0")}</td><td><strong>{driver.Driver.givenName} {driver.Driver.familyName}</strong><small className="driver-code">{driver.Driver.code ?? driver.Driver.nationality ?? "F1"}</small></td><td className="team-name">{driver.Constructors?.[0]?.name ?? "—"}</td><td>{driver.wins}</td><td className="points">{driver.points}</td></tr>)}
                </tbody></table>{drivers.length === 0 && <div className="empty-state">No driver standings have been published for this season yet.</div>}</div>
                <div className="panel-foot">Official championship order · Jolpica-compatible F1 data</div>
              </div>
              <div className="panel performance-panel">
                <div className="panel-heading"><div><span className="eyebrow">POINTS BATTLE</span><h2>Top driver form</h2></div><span className="chart-unit">PTS</span></div>
                <div className="bar-chart">{drivers.slice(0, 6).map((driver, i) => <div className="bar-row" key={driver.Driver.driverId}><span className="bar-name">{driver.Driver.code ?? driver.Driver.familyName.slice(0, 3).toUpperCase()}</span><div className="bar-track"><div className={`bar-fill ${i === 0 ? "leader" : ""}`} style={{ width: `${Math.max(3, Number(driver.points) / maxPoints * 100)}%` }} /></div><strong>{driver.points}</strong></div>)}</div>
                <div className="chart-caption">Championship points · top six drivers</div>
                <div className="constructor-mini"><div className="mini-heading"><span className="eyebrow">TEAM CHAMPIONSHIP</span><span>TOP 5</span></div>{constructors.slice(0, 5).map((team) => <div className="team-row" key={team.Constructor.constructorId}><span>{team.position.padStart(2, "0")}</span><strong>{team.Constructor.name}</strong><b>{team.points}<small> PTS</small></b></div>)}</div>
              </div>
            </section>
            <section className="panel upcoming-panel">
              <div className="panel-heading"><div><span className="eyebrow">THE CALENDAR</span><h2>Race weekend radar</h2></div><button className="text-button" onClick={() => setPage("explorer")}>EXPLORE ALL RACES ↗</button></div>
              <div className="race-strip">{races.slice(0, 4).map((race) => <button className="race-tile" key={race.round} onClick={() => { setSelectedRace(race); setPage("explorer"); }}><span className="round">ROUND {race.round.padStart(2, "0")}</span><strong>{race.raceName}</strong><span>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</span><small>{new Date(race.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</small></button>)}</div>
            </section>
          </>
        ) : (
          <section className="explorer-layout">
            <div className="explorer-toolbar"><div><span className="eyebrow">RACE DIRECTORY</span><h2>{races.length} race weekends</h2></div><div className="search-box"><span>⌕</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search race, circuit or country…" /></div></div>
            <div className="explorer-grid">
              <div className="race-list">{filteredRaces.map((race) => <button key={race.round} className={`explorer-race ${selectedRace?.round === race.round ? "selected" : ""}`} onClick={() => setSelectedRace(race)}><span className="race-round">R{race.round.padStart(2, "0")}</span><span className="race-info"><strong>{race.raceName}</strong><small>{race.Circuit.circuitName}</small><small>{race.Circuit.Location.locality}, {race.Circuit.Location.country}</small></span><span className="race-date">{new Date(race.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span></button>)}{filteredRaces.length === 0 && <div className="empty-state">No races match that search. Try another circuit or country.</div>}</div>
              <div className="panel circuit-detail">
                {selectedRace ? <>
                  <div className="detail-top"><span className="eyebrow">ROUND {selectedRace.round.padStart(2, "0")} · {season} SEASON</span><span className="detail-date">{new Date(selectedRace.date + "T12:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span></div>
                  <h2>{selectedRace.raceName}</h2><p className="detail-location">{selectedRace.Circuit.Location.locality}, {selectedRace.Circuit.Location.country}</p>
                  <div className="track-art"><svg viewBox="0 0 520 250" role="img" aria-label="Decorative circuit route illustration"><path d="M55 145 C42 100 82 54 143 68 L188 81 C220 90 230 37 279 37 L375 40 C420 42 460 72 445 111 L430 145 C418 177 380 181 348 163 L300 135 C266 115 248 164 221 190 L169 217 C124 240 78 209 55 145Z" fill="none" stroke="#292e38" strokeWidth="18" strokeLinecap="round"/><path d="M55 145 C42 100 82 54 143 68 L188 81 C220 90 230 37 279 37 L375 40 C420 42 460 72 445 111 L430 145 C418 177 380 181 348 163 L300 135 C266 115 248 164 221 190 L169 217 C124 240 78 209 55 145Z" fill="none" stroke="#f0444c" strokeWidth="3" strokeDasharray="8 7" strokeLinecap="round"/><circle cx="55" cy="145" r="7" fill="#f0444c"/><text x="67" y="132" fill="#9ca3af" fontSize="11" letterSpacing="2">START / FINISH</text></svg><span className="track-caption">CIRCUIT PROFILE · SCHEMATIC</span></div>
                  <div className="detail-stats"><div><span>VENUE</span><strong>{selectedRace.Circuit.circuitName}</strong></div><div><span>LOCATION</span><strong>{selectedRace.Circuit.Location.locality}</strong></div><div><span>COUNTRY</span><strong>{selectedRace.Circuit.Location.country}</strong></div></div>
                  <div className="detail-note">Race results and lap-by-lap telemetry can be connected here as the web backend is integrated with the existing FastF1 analysis modules.</div>
                </> : <div className="select-prompt"><span>◎</span><h3>Select a race weekend</h3><p>Choose a round from the calendar to inspect its circuit and event details.</p></div>}
              </div>
            </div>
          </section>
        )}
        <footer><span>APEXREPLAY F1</span><span>BUILT FOR THE DATA BEHIND THE RACING.</span><span>UNOFFICIAL FAN PROJECT · NOT AFFILIATED WITH FORMULA 1</span></footer>
      </main>
    </div>
  );
}

function Metric({ label, value, detail, accent }: { label: string; value: string; detail: string; accent?: string }) {
  return <div className="metric-card"><span className="metric-label">{label}</span><strong className={accent === "red" ? "metric-highlight" : ""}>{value}</strong><small>{detail}</small><span className="metric-corner" /></div>;
}

export default App;
