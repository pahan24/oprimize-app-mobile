import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Trash2, 
  Cpu, 
  Battery as BatteryIcon, 
  HardDrive, 
  ShieldCheck, 
  Settings, 
  ChevronRight,
  LayoutGrid,
  Activity,
  Thermometer,
  Smartphone,
  CheckCircle2,
  X,
  ArrowLeft,
  Search,
  RefreshCw,
  Gauge,
  Wifi,
  ShieldAlert,
  Lock,
  History,
  Info,
  AlertTriangle,
  Play,
  Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from './utils';

// --- Types ---
type Tab = 'dashboard' | 'cleaner' | 'booster' | 'battery' | 'cooler' | 'storage' | 'apps' | 'network' | 'security';

interface AppInfo {
  id: string;
  name: string;
  size: string;
  icon: string;
  lastUsed: string;
  isGame?: boolean;
}

interface BatteryStatus {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

// --- Mock Data ---
const MOCK_APPS: AppInfo[] = [
  { id: '1', name: 'Social Connect', size: '1.2 GB', icon: '📱', lastUsed: '2 mins ago' },
  { id: '2', name: 'Fast Browser', size: '450 MB', icon: '🌐', lastUsed: '1 hour ago' },
  { id: '3', name: 'Photo Editor Pro', size: '890 MB', icon: '🎨', lastUsed: 'Yesterday' },
  { id: '4', name: 'Music Stream', size: '320 MB', icon: '🎵', lastUsed: '3 hours ago' },
  { id: '5', name: 'Video Player', size: '1.5 GB', icon: '🎬', lastUsed: '5 mins ago' },
  { id: '6', name: 'Game Master', size: '2.8 GB', icon: '🎮', lastUsed: '2 days ago', isGame: true },
  { id: '7', name: 'Shadow Fight', size: '1.1 GB', icon: '⚔️', lastUsed: '5 days ago', isGame: true },
  { id: '8', name: 'Racing Rivals', size: '1.4 GB', icon: '🏎️', lastUsed: '1 week ago', isGame: true },
];

const STORAGE_DATA = [
  { name: 'Apps', value: 45, color: '#00f5ff' },
  { name: 'Media', value: 30, color: '#bf00ff' },
  { name: 'System', value: 15, color: '#00ff88' },
  { name: 'Free', value: 10, color: '#1d1d2c' },
];

// --- Components ---

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void; key?: string | number }) => (
  <div 
    onClick={onClick}
    className={cn("bg-bg-card border border-white/5 rounded-2xl p-4 active:scale-95 transition-transform cursor-pointer", className)}
  >
    {children}
  </div>
);

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="flex items-center gap-4 p-6 sticky top-0 bg-bg-deep/80 backdrop-blur-md z-50">
    {onBack && (
      <button onClick={onBack} className="p-2 rounded-full bg-white/5 active:bg-white/10">
        <ArrowLeft size={20} />
      </button>
    )}
    <h1 className="text-xl font-display font-bold tracking-tight text-neon-cyan uppercase">{title}</h1>
    {!onBack && <div className="ml-auto p-2 rounded-full bg-white/5"><Settings size={20} /></div>}
  </div>
);

const BottomNav = ({ activeTab, setActiveTab }: { activeTab: Tab; setActiveTab: (tab: Tab) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
    { id: 'cleaner', icon: Trash2, label: 'Clean' },
    { id: 'booster', icon: Zap, label: 'Boost' },
    { id: 'security', icon: ShieldCheck, label: 'Safe' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-bg-card border-t border-white/5 px-6 py-3 flex justify-between items-center z-50">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id as Tab)}
          className={cn(
            "flex flex-col items-center gap-1 transition-colors",
            activeTab === item.id ? "text-neon-cyan" : "text-white/40"
          )}
        >
          <item.icon size={24} className={cn(activeTab === item.id && "drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]")} />
          <span className="text-[10px] font-display uppercase tracking-wider font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Views ---

const Dashboard = ({ onNavigate }: { onNavigate: (tab: Tab) => void }) => {
  const [healthScore, setHealthScore] = useState(85);
  const [isBoosting, setIsBoosting] = useState(false);
  const [battery, setBattery] = useState<BatteryStatus | null>(null);
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    // Real Battery Data
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((batt: any) => {
        const updateBattery = () => {
          setBattery({
            level: Math.round(batt.level * 100),
            charging: batt.charging,
            chargingTime: batt.chargingTime,
            dischargingTime: batt.dischargingTime
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      });
    }

    // Real Memory Data (Chrome only)
    const updateMemory = () => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        setMemory({
          used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
          total: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))
        });
      } else {
        // Fallback simulated memory
        setMemory({ used: 420, total: 2048 });
      }
    };
    updateMemory();
    const interval = setInterval(updateMemory, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleBoost = () => {
    setIsBoosting(true);
    setTimeout(() => {
      setHealthScore(100);
      setIsBoosting(false);
    }, 2000);
  };

  return (
    <div className="pb-24 px-6 space-y-6">
      {/* Health Orb */}
      <div className="relative flex justify-center py-8">
        <div className="w-48 h-48 rounded-full border-4 border-neon-cyan/20 flex flex-col items-center justify-center relative">
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-neon-cyan border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <span className="text-5xl font-display font-black text-white">{healthScore}</span>
          <span className="text-xs font-display text-neon-cyan tracking-widest uppercase mt-1">Health</span>
        </div>
      </div>

      <button 
        onClick={handleBoost}
        disabled={isBoosting}
        className={cn(
          "w-full py-4 rounded-2xl font-display font-bold text-lg tracking-widest uppercase transition-all",
          isBoosting ? "bg-white/10 text-white/40" : "bg-neon-cyan text-bg-deep neon-glow-cyan"
        )}
      >
        {isBoosting ? "Optimizing..." : "One Tap Boost"}
      </button>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex flex-col items-center gap-2" onClick={() => onNavigate('booster')}>
          <div className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple">
            <Activity size={20} />
          </div>
          <div className="text-center">
            <p className="text-xs font-display text-white/40 uppercase">RAM</p>
            <p className="text-sm font-display font-bold">
              {memory ? `${Math.round((memory.used / memory.total) * 100)}%` : '--%'}
            </p>
          </div>
        </Card>
        <Card className="flex flex-col items-center gap-2" onClick={() => onNavigate('storage')}>
          <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan">
            <HardDrive size={20} />
          </div>
          <div className="text-center">
            <p className="text-xs font-display text-white/40 uppercase">Disk</p>
            <p className="text-sm font-display font-bold">52%</p>
          </div>
        </Card>
        <Card className="flex flex-col items-center gap-2" onClick={() => onNavigate('battery')}>
          <div className="p-2 rounded-xl bg-neon-green/10 text-neon-green">
            <BatteryIcon size={20} />
          </div>
          <div className="text-center">
            <p className="text-xs font-display text-white/40 uppercase">Power</p>
            <p className="text-sm font-display font-bold">{battery ? `${battery.level}%` : '--%'}</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-xs font-display font-bold text-white/40 uppercase tracking-widest">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          <Card className="flex items-center gap-4" onClick={() => onNavigate('cleaner')}>
            <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
              <Trash2 size={24} />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Cleaner</p>
              <p className="text-[10px] text-white/40 uppercase">2.4 GB Junk</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4" onClick={() => onNavigate('cooler')}>
            <div className="p-3 rounded-2xl bg-neon-orange/10 text-neon-orange">
              <Thermometer size={24} />
            </div>
            <div>
              <p className="font-display font-bold text-sm">CPU Cooler</p>
              <p className="text-[10px] text-white/40 uppercase">38°C Normal</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4" onClick={() => onNavigate('network')}>
            <div className="p-3 rounded-2xl bg-neon-purple/10 text-neon-purple">
              <Wifi size={24} />
            </div>
            <div>
              <p className="font-display font-bold text-sm">Network</p>
              <p className="text-[10px] text-white/40 uppercase">Speed Test</p>
            </div>
          </Card>
          <Card className="flex items-center gap-4" onClick={() => onNavigate('apps')}>
            <div className="p-3 rounded-2xl bg-neon-green/10 text-neon-green">
              <Smartphone size={24} />
            </div>
            <div>
              <p className="font-display font-bold text-sm">App Manager</p>
              <p className="text-[10px] text-white/40 uppercase">8 Apps</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

const JunkCleaner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [junkFound, setJunkFound] = useState<number | null>(null);
  const [categories, setCategories] = useState<{ name: string; size: string; icon: any }[]>([
    { name: 'System Cache', size: '0 MB', icon: Trash2 },
    { name: 'App Logs', size: '0 MB', icon: History },
    { name: 'Temp Files', size: '0 MB', icon: RefreshCw },
    { name: 'Ad Junk', size: '0 MB', icon: AlertTriangle },
  ]);

  const handleScan = () => {
    setIsScanning(true);
    setJunkFound(null);
    setTimeout(() => {
      setIsScanning(false);
      setJunkFound(2.4);
      setCategories([
        { name: 'System Cache', size: '840 MB', icon: Trash2 },
        { name: 'App Logs', size: '320 MB', icon: History },
        { name: 'Temp Files', size: '1.1 GB', icon: RefreshCw },
        { name: 'Ad Junk', size: '140 MB', icon: AlertTriangle },
      ]);
    }, 3000);
  };

  return (
    <div className="px-6 space-y-8 pb-24">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-40 h-40 mb-8">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-neon-cyan/20 relative overflow-hidden">
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1 bg-neon-cyan shadow-[0_0_15px_rgba(0,245,255,0.8)]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="p-8 rounded-full bg-neon-cyan/10 text-neon-cyan">
                  <Trash2 size={64} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2">
          {isScanning ? "Scanning for Junk..." : junkFound ? `${junkFound} GB Junk Found` : "Ready to Clean"}
        </h2>
        <p className="text-white/40 text-sm max-w-[240px]">
          Remove cache, temporary files and system logs to free up space.
        </p>
      </div>

      <button 
        onClick={junkFound ? () => setJunkFound(0) : handleScan}
        className="w-full py-4 rounded-2xl bg-neon-cyan text-bg-deep font-display font-bold text-lg tracking-widest uppercase neon-glow-cyan"
      >
        {junkFound ? "Clean Now" : "Start Scan"}
      </button>

      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.name} className="flex items-center gap-4 p-4 bg-bg-card rounded-xl border border-white/5">
            <div className="p-2 rounded-lg bg-white/5 text-neon-cyan">
              <cat.icon size={18} />
            </div>
            <span className="flex-1 text-sm font-display text-white/60">{cat.name}</span>
            <span className="text-sm font-display font-bold text-neon-cyan">{cat.size}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RAMBooster = () => {
  const [isBoosting, setIsBoosting] = useState(false);
  const [freed, setFreed] = useState<number | null>(null);
  const [memory, setMemory] = useState<{ used: number; total: number }>({ used: 420, total: 2048 });

  useEffect(() => {
    const updateMemory = () => {
      if ((performance as any).memory) {
        const mem = (performance as any).memory;
        setMemory({
          used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
          total: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))
        });
      }
    };
    updateMemory();
    const interval = setInterval(updateMemory, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBoost = () => {
    setIsBoosting(true);
    setTimeout(() => {
      setIsBoosting(false);
      setFreed(Math.floor(Math.random() * 200) + 300);
    }, 2000);
  };

  const usagePercent = Math.round((memory.used / memory.total) * 100);

  return (
    <div className="px-6 space-y-6 pb-24">
      <Card className="p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-4 rounded-full bg-neon-purple/10 text-neon-purple">
            <Zap size={48} />
          </div>
        </div>
        <div>
          <p className="text-3xl font-display font-black">{usagePercent}%</p>
          <p className="text-xs font-display text-white/40 uppercase tracking-widest">RAM Usage</p>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-neon-purple"
            initial={{ width: '0%' }}
            animate={{ width: `${usagePercent}%` }}
            transition={{ duration: 1 }}
          />
        </div>
        <p className="text-[10px] text-white/20 uppercase font-display">
          {memory.used} MB / {memory.total} MB
        </p>
      </Card>

      <button 
        onClick={handleBoost}
        disabled={isBoosting}
        className="w-full py-4 rounded-2xl bg-neon-purple text-white font-display font-bold text-lg tracking-widest uppercase neon-glow-purple"
      >
        {isBoosting ? "Boosting..." : freed ? `Freed ${freed} MB` : "Boost Now"}
      </button>

      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-white/40 uppercase tracking-widest">Active Processes</h3>
        <div className="space-y-3">
          {MOCK_APPS.slice(0, 5).map((app) => (
            <div key={app.id} className="flex items-center gap-4 p-3 bg-bg-card rounded-xl border border-white/5">
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-xl">
                {app.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-bold">{app.name}</p>
                <p className="text-[10px] text-white/40 uppercase">{app.size}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] text-neon-purple font-display font-bold">{(Math.random() * 5 + 2).toFixed(1)}%</span>
                <div className="w-2 h-2 rounded-full bg-neon-green" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NetworkSpeed = () => {
  const [isTesting, setIsTesting] = useState(false);
  const [speed, setSpeed] = useState<number | null>(null);
  const [ping, setPing] = useState<number | null>(null);

  const startTest = () => {
    setIsTesting(true);
    setSpeed(null);
    setPing(null);
    setTimeout(() => {
      setPing(Math.floor(Math.random() * 20) + 10);
      setSpeed(Math.floor(Math.random() * 50) + 40);
      setIsTesting(false);
    }, 3000);
  };

  return (
    <div className="px-6 space-y-8 pb-24">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 rounded-full border-4 border-neon-purple/20"
            animate={isTesting ? { scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <div className="flex flex-col items-center">
            <Wifi size={48} className={cn(isTesting ? "text-neon-purple animate-pulse" : "text-white/20")} />
            {speed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-4xl font-display font-black text-white mt-2">{speed}</p>
                <p className="text-[10px] font-display text-white/40 uppercase">Mbps</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 w-full gap-4">
          <Card className="text-center">
            <p className="text-[10px] font-display text-white/40 uppercase mb-1">Ping</p>
            <p className="text-lg font-display font-bold text-neon-purple">{ping ? `${ping} ms` : '--'}</p>
          </Card>
          <Card className="text-center">
            <p className="text-[10px] font-display text-white/40 uppercase mb-1">Jitter</p>
            <p className="text-lg font-display font-bold text-neon-purple">{ping ? `${Math.floor(ping/4)} ms` : '--'}</p>
          </Card>
        </div>
      </div>

      <button 
        onClick={startTest}
        disabled={isTesting}
        className="w-full py-4 rounded-2xl bg-neon-purple text-white font-display font-bold text-lg tracking-widest uppercase neon-glow-purple"
      >
        {isTesting ? "Testing..." : "Start Speed Test"}
      </button>

      <div className="space-y-4">
        <h3 className="text-xs font-display font-bold text-white/40 uppercase tracking-widest">Network Info</h3>
        <Card className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Connection</span>
            <span className="text-sm font-bold text-neon-green">4G / WiFi</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">IP Address</span>
            <span className="text-sm font-bold text-white/80">192.168.1.104</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/60">Security</span>
            <span className="text-sm font-bold text-neon-green">WPA3 Secure</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

const SecurityScan = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [status, setStatus] = useState<'idle' | 'scanning' | 'safe'>('idle');

  const handleScan = () => {
    setIsScanning(true);
    setStatus('scanning');
    setTimeout(() => {
      setIsScanning(false);
      setStatus('safe');
    }, 4000);
  };

  return (
    <div className="px-6 space-y-8 pb-24">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-40 h-40 mb-8">
          <AnimatePresence mode="wait">
            {status === 'scanning' ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-4 border-neon-green/20 border-t-neon-green shadow-[0_0_15px_rgba(0,255,136,0.3)]" />
              </motion.div>
            ) : status === 'safe' ? (
              <motion.div 
                key="safe"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="p-8 rounded-full bg-neon-green/10 text-neon-green">
                  <ShieldCheck size={64} />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="p-8 rounded-full bg-neon-green/10 text-neon-green">
                  <ShieldAlert size={64} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-2xl font-display font-bold mb-2">
          {status === 'scanning' ? "Scanning for Threats..." : status === 'safe' ? "Device is Secure" : "Security Check"}
        </h2>
        <p className="text-white/40 text-sm max-w-[240px]">
          Check for malicious apps, system vulnerabilities and privacy risks.
        </p>
      </div>

      <button 
        onClick={handleScan}
        disabled={isScanning}
        className="w-full py-4 rounded-2xl bg-neon-green text-bg-deep font-display font-bold text-lg tracking-widest uppercase neon-glow-green"
      >
        {isScanning ? "Scanning..." : "Start Security Scan"}
      </button>

      <div className="space-y-3">
        {[
          { name: 'Malware Scan', status: status === 'safe' ? 'No threats' : 'Pending', icon: Lock },
          { name: 'Privacy Check', status: status === 'safe' ? 'Secure' : 'Pending', icon: ShieldCheck },
          { name: 'App Permissions', status: status === 'safe' ? 'Verified' : 'Pending', icon: Info },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-4 p-4 bg-bg-card rounded-xl border border-white/5">
            <div className="p-2 rounded-lg bg-white/5 text-neon-green">
              <item.icon size={18} />
            </div>
            <span className="flex-1 text-sm font-display text-white/60">{item.name}</span>
            <span className={cn(
              "text-[10px] font-display font-bold uppercase tracking-wider",
              status === 'safe' ? "text-neon-green" : "text-white/20"
            )}>
              {item.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [viewStack, setViewStack] = useState<Tab[]>(['dashboard']);

  const navigateTo = (tab: Tab) => {
    setActiveTab(tab);
    setViewStack(prev => [...prev, tab]);
  };

  const goBack = () => {
    if (viewStack.length > 1) {
      const newStack = [...viewStack];
      newStack.pop();
      const prevTab = newStack[newStack.length - 1];
      setActiveTab(prevTab);
      setViewStack(newStack);
    } else {
      setActiveTab('dashboard');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={navigateTo} />;
      case 'cleaner': return <JunkCleaner />;
      case 'booster': return <RAMBooster />;
      case 'network': return <NetworkSpeed />;
      case 'security': return <SecurityScan />;
      case 'apps': return (
        <div className="px-6 space-y-6 pb-24">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search apps..."
              className="w-full bg-bg-card border border-white/5 rounded-xl py-3 pl-12 pr-4 font-display text-sm focus:outline-none focus:border-neon-cyan/50"
            />
          </div>
          <div className="space-y-3">
            {MOCK_APPS.map((app) => (
              <Card key={app.id} className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-white/5 rounded-xl text-2xl">
                  {app.icon}
                </div>
                <div className="flex-1">
                  <p className="font-display font-bold">{app.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-white/40 uppercase">
                    <span>{app.size}</span>
                    <span>•</span>
                    <span>{app.lastUsed}</span>
                  </div>
                </div>
                <button className="p-2 text-neon-red active:scale-90 transition-transform">
                  <Trash2 size={20} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      );
      case 'storage': return (
        <div className="px-6 space-y-8 pb-24">
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STORAGE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {STORAGE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-display font-black">52%</span>
              <span className="text-[10px] font-display text-white/40 uppercase">Used</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STORAGE_DATA.map((item) => (
              <Card key={item.name} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <div>
                  <p className="text-xs font-display font-bold">{item.name}</p>
                  <p className="text-[10px] text-white/40 uppercase">{item.value}%</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      );
      case 'battery': return (
        <div className="px-6 flex flex-col items-center justify-center py-20 text-center pb-24">
          <BatteryIcon size={80} className="text-neon-green mb-6" />
          <h2 className="text-3xl font-display font-black mb-2">78%</h2>
          <p className="text-white/40 uppercase tracking-widest text-xs mb-8">Battery Health: Good</p>
          <div className="grid grid-cols-1 w-full gap-4">
            <Card className="flex items-center justify-between">
              <span className="font-display font-bold">Ultra Saving Mode</span>
              <div className="w-10 h-5 bg-white/10 rounded-full relative">
                <div className="absolute left-1 top-1 w-3 h-3 bg-white/20 rounded-full" />
              </div>
            </Card>
            <Card className="flex items-center justify-between">
              <span className="font-display font-bold">Smart Optimization</span>
              <div className="w-10 h-5 bg-neon-green/20 rounded-full relative">
                <div className="absolute right-1 top-1 w-3 h-3 bg-neon-green rounded-full" />
              </div>
            </Card>
          </div>
        </div>
      );
      case 'cooler': return (
        <div className="px-6 flex flex-col items-center justify-center py-20 text-center pb-24">
          <Thermometer size={80} className="text-neon-orange mb-6" />
          <h2 className="text-3xl font-display font-black mb-2">38°C</h2>
          <p className="text-white/40 uppercase tracking-widest text-xs mb-8">CPU Status: Normal</p>
          <button className="w-full py-4 rounded-2xl bg-neon-orange text-white font-display font-bold text-lg tracking-widest uppercase neon-glow-orange">
            Cool Down
          </button>
        </div>
      );
      default: return <Dashboard onNavigate={navigateTo} />;
    }
  };

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Ultra Optimize X';
      case 'cleaner': return 'Junk Cleaner';
      case 'booster': return 'RAM Booster';
      case 'apps': return 'App Manager';
      case 'storage': return 'Storage Analyzer';
      case 'battery': return 'Battery Saver';
      case 'cooler': return 'CPU Cooler';
      case 'network': return 'Network Speed';
      case 'security': return 'Security Center';
      default: return 'Ultra Optimize X';
    }
  };

  return (
    <div className="min-h-screen bg-bg-deep pb-24 max-w-md mx-auto relative overflow-x-hidden">
      <Header 
        title={getTitle()} 
        onBack={activeTab !== 'dashboard' ? goBack : undefined} 
      />
      
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        {renderContent()}
      </motion.div>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
