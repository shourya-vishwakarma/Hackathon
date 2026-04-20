/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Shield, 
  AlertTriangle, 
  Activity, 
  Globe, 
  Lock, 
  Terminal, 
  Cpu, 
  Server,
  BarChart3,
  Wifi,
  Radio,
  Zap,
  Crosshair,
  ShieldAlert
} from "lucide-react";

// --- Types ---

type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface Alert {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  severity: Severity;
  message: string;
}

interface AttackStats {
  type: string;
  count: number;
}

// --- Constants ---

const COLORS = {
  bg: "#060e1a",
  accent: "#7ec8f0",
  low: "#3aa870",
  medium: "#f0a030",
  high: "#e05555",
  critical: "#cc2200",
  border: "#1a2b42",
  muted: "#5c708a",
  card_bg: "#0a1626",
  header_bg: "#142133",
  text: "#a0b0c0",
};

const ATTACK_TYPES = ["DDoS", "SQL Injection", "Brute Force", "Port Scan", "Malware"];
const COUNTRIES = [
  { name: "US", x: 10, y: 15, w: 20, h: 20 },
  { name: "CN", x: 70, y: 20, w: 20, h: 15 },
  { name: "RU", x: 50, y: 10, w: 25, h: 12 },
  { name: "BR", x: 25, y: 60, w: 10, h: 20 },
  { name: "DE", x: 45, y: 20, w: 5, h: 5 },
  { name: "IN", x: 65, y: 40, w: 8, h: 10 },
  { name: "AU", x: 75, y: 70, w: 15, h: 15 },
  { name: "CA", x: 10, y: 5, w: 20, h: 10 },
  { name: "GB", x: 40, y: 18, w: 3, h: 4 },
  { name: "FR", x: 42, y: 22, w: 3, h: 4 },
];

// --- Helpers ---

const formatTime = (date: Date) => {
  return date.toLocaleTimeString("en-GB", { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

const generateRandomAlert = (forceSeverity?: Severity): Alert => {
  const severities: Severity[] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  const severity = forceSeverity || (Math.random() > 0.8 ? severities[Math.floor(Math.random() * 4)] : "LOW");
  
  const type = ATTACK_TYPES[Math.floor(Math.random() * ATTACK_TYPES.length)];
  const source = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  
  return {
    id: Math.random().toString(36).substr(2, 9),
    timestamp: formatTime(new Date()),
    type,
    source,
    severity,
    message: `Inbound ${type} detected from origin ${source}`,
  };
};

// --- Components ---

const StatusNode = ({ label, value, color }: any) => (
  <div className="bg-[#0a1626] border border-[#1a2b42] p-2 flex flex-col items-center justify-center">
    <span className="text-[10px] text-[#5c708a] uppercase font-mono">{label}</span>
    <span className="text-sm font-mono" style={{ color: color }}>{value}</span>
  </div>
);

const MetricCard = ({ title, value, color = COLORS.accent }: any) => (
  <div className="border border-[#1a2b42] bg-[#0a1626] p-3 flex flex-col justify-between h-[100px]">
    <div>
      <span className="text-[10px] text-[#5c708a] uppercase block mb-1 font-mono tracking-wider">{title}</span>
      <div className="h-px w-full bg-[#1a2b42]"></div>
    </div>
    <span className="text-3xl font-mono font-bold tracking-tighter" style={{ color }}>{value}</span>
  </div>
);

const LineChart = ({ data }: { data: { normal: number[], attack: number[] } }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = 10;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    ctx.clearRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = "#1a2b42";
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const drawLine = (vals: number[], color: string, lineWidth: number) => {
      if (vals.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      const step = chartWidth / (30 - 1);
      
      vals.forEach((v, i) => {
        const x = padding + i * step;
        const normalizedY = 1 - (v / 100);
        const y = padding + normalizedY * chartHeight;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    drawLine(data.normal, COLORS.accent, 2);
    drawLine(data.attack, COLORS.high, 2);

  }, [data]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
};

const Heatmap = ({ intensities }: { intensities: { [key: string]: number } }) => {
  return (
    <div className="grid grid-cols-10 grid-rows-6 gap-1 w-full h-full font-mono">
      {Array.from({ length: 60 }).map((_, i) => {
        const isActive = Math.random() > 0.8;
        const opacity = isActive ? 1 : 0.4;
        const bg = isActive ? (Math.random() > 0.5 ? COLORS.critical : COLORS.high) : "#1a2b42";
        return (
          <div 
            key={i} 
            className="transition-all duration-500" 
            style={{ backgroundColor: bg, opacity }}
          />
        );
      })}
    </div>
  );
};

const ThreatGauge = ({ level }: { level: number }) => {
  const getStatus = () => {
    if (level < 25) return { text: "SECURE", color: COLORS.low };
    if (level < 50) return { text: "GUARDED", color: COLORS.medium };
    if (level < 75) return { text: "ELEVATED", color: COLORS.high };
    return { text: "CRITICAL", color: COLORS.critical };
  };

  const status = getStatus();

  return (
    <div className="flex flex-col items-center justify-center p-4 h-full">
      <span className="text-[10px] uppercase font-bold mb-4 w-full text-left font-mono">Threat Level</span>
      <svg viewBox="0 0 100 60" className="w-full">
        <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#1a2b42" strokeWidth="8" />
        <path 
          d={`M10,50 A40,40 0 0,1 ${Math.cos(Math.PI - (level/100)*Math.PI)*40 + 50},${-Math.sin((level/100)*Math.PI)*40 + 50}`} 
          fill="none" 
          stroke={status.color} 
          strokeWidth="8" 
          strokeDasharray="125" 
          className="transition-all duration-1000"
        />
        <text x="50" y="45" text-anchor="middle" fill="white" className="text-[12px] font-mono font-bold uppercase">{status.text}</text>
      </svg>
      <div className="mt-4 text-2xl font-mono font-bold" style={{ color: status.color }}>{level}%</div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [now, setNow] = useState(new Date());
  const [stats, setStats] = useState({
    events: 1248302,
    attacks: 14281,
    blocked: 14192,
    perMin: 12.4,
  });
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [chartData, setChartData] = useState<{ normal: number[], attack: number[] }>({
    normal: Array(30).fill(0).map(() => 40 + Math.random() * 20),
    attack: Array(30).fill(0).map(() => 5 + Math.random() * 10),
  });
  const [intensities, setIntensities] = useState<{ [key: string]: number }>({});
  const [isDdosActive, setIsDdosActive] = useState(false);
  const [mitigationMessage, setMitigationMessage] = useState<string | null>(null);

  // Time update
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Data simulation
  useEffect(() => {
    const simulation = setInterval(() => {
      // Update counts
      setStats(prev => ({
        ...prev,
        events: prev.events + (Math.random() > 0.5 ? 42 : 12),
        attacks: prev.attacks + (Math.random() > 0.7 ? 1 : 0),
        blocked: prev.blocked + (Math.random() > 0.7 ? 1 : 0),
        perMin: Number((10 + Math.random() * 10).toFixed(1)),
      }));

      // New Alert
      if (Math.random() > 0.7) {
        const newAlert = generateRandomAlert();
        setAlerts(prev => [newAlert, ...prev].slice(0, 50));
      }

      // Update Chart
      setChartData(prev => ({
        normal: [...prev.normal.slice(1), 30 + Math.random() * 20],
        attack: [...prev.attack.slice(1), (isDdosActive ? 60 + Math.random() * 40 : 5 + Math.random() * 15)],
      }));

      // Update Intensities
      const newIntensities: { [key: string]: number } = {};
      COUNTRIES.forEach(c => {
        newIntensities[c.name] = Math.random() > 0.8 ? (isDdosActive ? 80 + Math.random() * 20 : Math.random() * 40) : (isDdosActive ? 60 : 0);
      });
      setIntensities(newIntensities);

    }, 2000);

    return () => clearInterval(simulation);
  }, [isDdosActive]);

  const runDdosSim = () => {
    if (isDdosActive) return;
    setIsDdosActive(true);
    setMitigationMessage("DETECTING FLOW ANOMALIES...");
    
    // Add 6 critical alerts
    const ddosAlerts = Array(6).fill(0).map(() => generateRandomAlert("CRITICAL"));
    setAlerts(prev => [...ddosAlerts, ...prev].slice(0, 50));

    // Sequence of mitigation messages
    setTimeout(() => setMitigationMessage("REDIRECTING TRAFFIC TO SCRUBBING CENTER..."), 1500);
    setTimeout(() => setMitigationMessage("ISOLATING BOTNET SIGNATURES..."), 3000);
    setTimeout(() => setMitigationMessage("DEPLOYING IP REPUTATION BLOCKLIST..."), 4500);
    setTimeout(() => {
      setMitigationMessage(null);
      setIsDdosActive(false);
      setStats(prev => ({ ...prev, blocked: prev.blocked + 184 }));
    }, 6000);
  };

  const threatLevel = useMemo(() => {
    const recentAttacks = alerts.filter(a => a.severity === "HIGH" || a.severity === "CRITICAL").length;
    let base = Math.min(100, recentAttacks * 8 + (isDdosActive ? 40 : 0));
    return Math.max(12, base);
  }, [alerts, isDdosActive]);

  return (
    <div className="h-screen w-full bg-[#060e1a] text-[#7ec8f0] font-mono p-4 flex flex-col gap-4 overflow-hidden select-none">
      
      {/* Top Bar */}
      <header className="flex items-center justify-between border border-[#1a2b42] px-4 py-2 bg-[#0a1626] shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-3 h-3 rounded-full bg-[#3aa870] animate-pulse shadow-[0_0_5px_#3aa870]"></div>
          <h1 className="text-lg font-bold tracking-widest uppercase">Cyber Threat Intelligence Dashboard</h1>
          <span className="text-[#5c708a] text-xs font-mono">| OP-NODE: 004-GAMMA</span>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#5c708a] uppercase tracking-tighter">System Clock</span>
            <span className="font-mono text-white">{formatTime(now)} UTC</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#5c708a] uppercase tracking-tighter">Node Status</span>
            <span className="text-[#3aa870] font-bold">SYNCHRONIZED</span>
          </div>
        </div>
      </header>

      {/* Node Status Grid */}
      <div className="grid grid-cols-6 gap-2 shrink-0">
        <StatusNode label="Uptime" value="99.98%" />
        <StatusNode label="Latency" value="14ms" />
        <StatusNode label="Active Nodes" value="42" />
        <StatusNode label="Encrypted" value="YES" color={COLORS.low} />
        <StatusNode label="Protocol" value="TLS 1.3" />
        <StatusNode label="Zone" value="DMZ-A" />
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-4 gap-4 shrink-0">
        <MetricCard title="Total Events" value={stats.events.toLocaleString()} />
        <MetricCard title="Attacks Detected" value={stats.attacks.toLocaleString()} color={COLORS.medium} />
        <MetricCard title="Threats Blocked" value={stats.blocked.toLocaleString()} color={COLORS.low} />
        <MetricCard title="Attacks per Min" value={stats.perMin} color={COLORS.high} />
      </div>

      {/* Grid Layout Container */}
      <div className="grid grid-cols-[1.5fr_1fr_1.5fr_0.8fr] gap-4 flex-1 overflow-hidden">
        
        {/* Col 1: Traffic Chart */}
        <div className="border border-[#1a2b42] bg-[#0a1626] flex flex-col overflow-hidden">
          <div className="p-2 border-b border-[#1a2b42] bg-[#142133] flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold font-mono tracking-widest">Traffic Analyzer (Normal vs Attack)</span>
            <span className="text-[10px] text-[#5c708a] font-mono">300ms Update</span>
          </div>
          <div className="flex-1 relative p-2 overflow-hidden">
            <LineChart data={chartData} />
          </div>
        </div>

        {/* Col 2: Alerts Feed */}
        <div className="border border-[#1a2b42] bg-[#0a1626] flex flex-col overflow-hidden">
          <div className="p-2 border-b border-[#1a2b42] bg-[#142133] flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold font-mono tracking-widest">Live Threat Feed</span>
            <span className="bg-[#1a2b42] px-1 text-[9px] text-[#7ec8f0] font-mono animate-pulse">LIVE</span>
          </div>
          <div className="flex-1 p-2 flex flex-col gap-1 overflow-hidden custom-scrollbar overflow-y-auto">
            {alerts.length === 0 && <div className="text-[#5c708a] font-mono text-[9px] animate-pulse">Establishing secure link...</div>}
            {alerts.map((alert) => (
              <div key={alert.id} className="text-[9px] border-l-2 p-1 bg-[#0d1c2e]" style={{ borderColor: COLORS[alert.severity.toLowerCase() as keyof typeof COLORS] }}>
                <div className="flex justify-between font-mono">
                  <span className="font-bold uppercase" style={{ color: COLORS[alert.severity.toLowerCase() as keyof typeof COLORS] }}>{alert.severity}</span>
                  <span className="text-[#5c708a]">{alert.timestamp}</span>
                </div>
                <div className="text-white opacity-90 truncate font-mono">{alert.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Col 3: Heatmap */}
        <div className="border border-[#1a2b42] bg-[#0a1626] flex flex-col overflow-hidden">
          <div className="p-2 border-b border-[#1a2b42] bg-[#142133] flex justify-between items-center">
            <span className="text-[10px] uppercase font-bold font-mono tracking-widest">Global Attack Heatmap</span>
            <span className="text-[10px] text-[#5c708a] font-mono">Geo-Spatial View</span>
          </div>
          <div className="flex-1 p-2 relative">
            <Heatmap intensities={intensities} />
            {isDdosActive && (
              <div className="absolute inset-0 bg-red-900/10 backdrop-blur-sm flex flex-col items-center justify-center p-4 border border-red-500/30 m-2 z-10">
                <span className="text-[12px] font-bold text-red-500 animate-pulse font-mono tracking-tighter">DDOS ALERT</span>
                <span className="text-[9px] text-white opacity-80 uppercase font-mono text-center mt-1">{mitigationMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Col 4: Sidebar Details */}
        <div className="flex flex-col gap-4 overflow-hidden">
          
          <div className="border border-[#1a2b42] bg-[#0a1626] flex flex-col items-center justify-center min-h-[140px]">
             <ThreatGauge level={threatLevel} />
          </div>

          <div className="border border-[#1a2b42] bg-[#0a1626] p-4 flex flex-col flex-1 gap-4 overflow-hidden">
            <span className="text-[10px] uppercase font-bold font-mono tracking-widest">Attack Distribution</span>
            <div className="flex-1 flex flex-col gap-3 justify-center min-h-0">
              {ATTACK_TYPES.map(type => {
                const val = Math.random() * (isDdosActive && type === "DDoS" ? 90 : 40);
                return (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span>{type}</span>
                      <span style={{ color: val > 60 ? COLORS.high : COLORS.accent }}>{Math.floor(val)}%</span>
                    </div>
                    <div className="h-1 w-full bg-[#1a2b42]">
                      <div className="h-full transition-all duration-1000" style={{ width: `${val}%`, backgroundColor: val > 60 ? COLORS.high : COLORS.accent }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button 
              onClick={runDdosSim}
              disabled={isDdosActive}
              className={`w-full py-2 text-white text-[10px] font-bold border active:scale-95 transition-all font-mono tracking-widest uppercase shrink-0 ${
                isDdosActive 
                ? "bg-slate-800 border-slate-700 text-slate-500 cursor-not-allowed" 
                : "bg-[#cc2200] border-[#cc2200] hover:bg-[#881100]"
              }`}
            >
              {isDdosActive ? "MITIGATION ACTIVE" : "SIMULATE DDOS ATTACK"}
            </button>
          </div>

        </div>

      </div>

      {/* Footer / Status Rail matches design vibe */}
      <footer className="h-6 border border-[#1a2b42] bg-[#0a1626] flex items-center px-4 justify-between shrink-0">
        <div className="flex gap-4 text-[9px] font-mono text-[#5c708a]">
          <span>ENCRYPTION: AES-256</span>
          <span>ZONE: DMZ-A</span>
          <span>KERNEL: AIS-0.9</span>
        </div>
        <div className="text-[9px] font-mono text-[#3aa870] animate-pulse">
           CONNECTED // SECURE CHANNEL IDENTIFIED
        </div>
      </footer>

      {/* Custom scrollbar style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0a1626;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a2b42;
        }
      `}</style>
    </div>
  );
}
