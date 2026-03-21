import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Zap, 
  Trash2, 
  Cpu, 
  Battery, 
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
  Signal,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { cn } from './utils';

// --- Types ---
type Tab = 'dashboard' | 'cleaner' | 'booster' | 'battery' | 'cooler' | 'storage' | 'apps' | 'network' | 'security' | 'game';

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
  <motion.div 
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={cn("glass rounded-2xl p-4 transition-all duration-300", className)}
  >
    {children}
  </motion.div>
);

const Header = ({ title, onBack }: { title: string; onBack?: () => void }) => (
  <div className="flex items-center gap-4 p-6 sticky top-0 bg-bg-deep/40 backdrop-blur-xl z-50 border-b border-white/5">
    {onBack && (
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onBack} 
        className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
      >
        <ArrowLeft size={20} />
      </motion.button>
    )}
    <h1 className="text-lg font-display font-bold tracking-tight text-white uppercase flex-1">
      {title.split(' ').map((word, i) => (
        <span key={i} className={cn(i === 1 && "text-neon-cyan")}>{word} </span>
      ))}
    </h1>
    {!onBack && (
      <motion.div 
        whileHover={{ rotate: 90 }}
        className="p-2 rounded-full bg-white/5 cursor-pointer"
      >
        <Settings size={20} />
      </motion.div>
    )}
  </div>
);

const BottomNav = ({ activeTab, onNavigate }: { activeTab: Tab; onNavigate: (tab: Tab) => void }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutGrid, label: 'Home' },
    { id: 'cleaner', icon: Trash2, label: 'Clean' },
    { id: 'booster', icon: Zap, label: 'Boost' },
    { id: 'security', icon: ShieldCheck, label: 'Safe' },
  ];

  return (
    <div className="fixed bottom-6 left-6 right-6 glass rounded-2xl px-6 py-3 flex justify-between items-center z-50 shadow-2xl">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id as Tab)}
          className={cn(
            "flex flex-col items-center gap-1 transition-all duration-300 relative",
            activeTab === item.id ? "text-neon-cyan scale-110" : "text-white/40 hover:text-white/60"
          )}
        >
          {activeTab === item.id && (
            <motion.div 
              layoutId="nav-active"
              className="absolute -top-1 w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_8px_rgba(0,245,255,1)]"
            />
          )}
          <item.icon size={22} className={cn(activeTab === item.id && "drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]")} />
          <span className="text-[9px] font-display uppercase tracking-widest font-bold">{item.label}</span>
        </button>
      ))}
    </div>
  );
};

// --- Views ---

const Dashboard = ({ onNavigate, battery }: { onNavigate: (tab: Tab) => void; battery: BatteryStatus | null }) => {
  const [healthScore, setHealthScore] = useState(85);
  const [isBoosting, setIsBoosting] = useState(false);
  const [memory, setMemory] = useState<{ used: number; total: number } | null>(null);

  useEffect(() => {
    const updateMemory = () => {
      try {
        if (window.performance && (window.performance as any).memory) {
          const mem = (window.performance as any).memory;
          setMemory({
            used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
            total: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))
          });
        } else {
          setMemory({ used: 420, total: 2048 });
        }
      } catch (e) {
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
    }, 2500);
  };

  return (
    <div className="pb-32 px-6 space-y-8">
      {/* Health Orb */}
      <div className="relative flex justify-center py-10">
        <div className="relative w-56 h-56">
          <motion.div 
            className="absolute inset-0 rounded-full border-[1px] border-neon-cyan/10"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <div className="absolute inset-4 rounded-full glass flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,245,255,0.1)]">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-neon-cyan border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: isBoosting ? 0.5 : 3, repeat: Infinity, ease: "linear" }}
            />
            <AnimatePresence mode="wait">
              <motion.span 
                key={healthScore}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-6xl font-display font-black text-white"
              >
                {healthScore}
              </motion.span>
            </AnimatePresence>
            <span className="text-[10px] font-display text-neon-cyan tracking-[0.3em] uppercase mt-2 font-bold">System Health</span>
          </div>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBoost}
        disabled={isBoosting}
        className={cn(
          "w-full py-5 rounded-2xl font-display font-bold text-lg tracking-[0.2em] uppercase transition-all relative overflow-hidden",
          isBoosting ? "bg-white/5 text-white/20" : "bg-neon-cyan text-bg-deep neon-glow-cyan"
        )}
      >
        {isBoosting && (
          <motion.div 
            className="absolute inset-0 bg-white/10"
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        <span className="relative z-10">{isBoosting ? "Optimizing..." : "One Tap Boost"}</span>
      </motion.button>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'RAM', value: memory ? `${Math.round((memory.used / memory.total) * 100)}%` : '--%', icon: Activity, color: 'text-neon-purple', bg: 'bg-neon-purple/10', tab: 'booster' },
          { label: 'Disk', value: '52%', icon: HardDrive, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', tab: 'storage' },
          { label: 'Power', value: battery ? `${battery.level}%` : '--%', icon: Battery, color: 'text-neon-green', bg: 'bg-neon-green/10', tab: 'battery' }
        ].map((stat) => (
          <Card key={stat.label} className="flex flex-col items-center gap-2 p-4" onClick={() => onNavigate(stat.tab as Tab)}>
            <div className={cn("p-2 rounded-xl", stat.bg, stat.color)}>
              <stat.icon size={18} />
            </div>
            <div className="text-center">
              <p className="text-[9px] font-display text-white/30 uppercase tracking-widest">{stat.label}</p>
              <p className="text-sm font-display font-bold text-white/90">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions Grid */}
      <div className="space-y-4">
        <h2 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">System Tools</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'cleaner', label: 'Cleaner', sub: '2.4 GB Junk', icon: Trash2, color: 'text-neon-cyan', bg: 'bg-neon-cyan/10' },
            { id: 'cooler', label: 'CPU Cooler', sub: '38°C Normal', icon: Thermometer, color: 'text-neon-orange', bg: 'bg-neon-orange/10' },
            { id: 'network', label: 'Network', sub: 'Speed Test', icon: Wifi, color: 'text-neon-purple', bg: 'bg-neon-purple/10' },
            { id: 'apps', label: 'Apps', sub: '8 Manager', icon: Smartphone, color: 'text-neon-green', bg: 'bg-neon-green/10' },
            { id: 'game', label: 'Game Boost', sub: '3 Games', icon: Play, color: 'text-neon-purple', bg: 'bg-neon-purple/10' }
          ].map((tool) => (
            <Card key={tool.id} className="flex items-center gap-4 p-4" onClick={() => onNavigate(tool.id as Tab)}>
              <div className={cn("p-3 rounded-2xl", tool.bg, tool.color)}>
                <tool.icon size={22} />
              </div>
              <div>
                <p className="font-display font-bold text-xs text-white/90">{tool.label}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{tool.sub}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

const JunkCleaner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [junkFound, setJunkFound] = useState<number | null>(null);
  const [isCleaning, setIsCleaning] = useState(false);
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

  const handleClean = () => {
    setIsCleaning(true);
    setTimeout(() => {
      setIsCleaning(false);
      setJunkFound(0);
      setCategories(prev => prev.map(c => ({ ...c, size: '0 MB' })));
    }, 2500);
  };

  return (
    <div className="px-6 space-y-8 pb-32">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-48 h-48 mb-8">
          <AnimatePresence mode="wait">
            {isScanning || isCleaning ? (
              <motion.div 
                key="active"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-2 border-neon-cyan/20 relative overflow-hidden glass">
                  <motion.div 
                    className="absolute top-0 left-0 w-full h-1.5 bg-neon-cyan shadow-[0_0_20px_rgba(0,245,255,1)]"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Trash2 size={48} className="text-neon-cyan/40 animate-pulse" />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="p-10 rounded-full bg-neon-cyan/10 text-neon-cyan shadow-[0_0_40px_rgba(0,245,255,0.1)] border border-neon-cyan/20">
                  <Trash2 size={64} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-3xl font-display font-black mb-2 text-white">
          {isScanning ? "Scanning..." : isCleaning ? "Cleaning..." : junkFound ? `${junkFound} GB Found` : "System Clean"}
        </h2>
        <p className="text-white/30 text-xs font-display uppercase tracking-widest max-w-[240px]">
          {junkFound ? "Optimization recommended" : "No junk files detected"}
        </p>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={junkFound ? handleClean : handleScan}
        disabled={isScanning || isCleaning}
        className={cn(
          "w-full py-5 rounded-2xl font-display font-bold text-lg tracking-[0.2em] uppercase transition-all",
          isScanning || isCleaning ? "bg-white/5 text-white/20" : "bg-neon-cyan text-bg-deep neon-glow-cyan"
        )}
      >
        {isScanning ? "Scanning..." : isCleaning ? "Cleaning..." : junkFound ? "Clean Now" : "Start Scan"}
      </motion.button>

      <div className="space-y-3">
        {categories.map((cat) => (
          <motion.div 
            key={cat.name} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 p-4 glass rounded-xl"
          >
            <div className="p-2 rounded-lg bg-white/5 text-neon-cyan">
              <cat.icon size={18} />
            </div>
            <span className="flex-1 text-sm font-display text-white/60 font-medium">{cat.name}</span>
            <span className="text-sm font-display font-bold text-neon-cyan">{cat.size}</span>
          </motion.div>
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
      try {
        if (window.performance && (window.performance as any).memory) {
          const mem = (window.performance as any).memory;
          setMemory({
            used: Math.round(mem.usedJSHeapSize / (1024 * 1024)),
            total: Math.round(mem.jsHeapSizeLimit / (1024 * 1024))
          });
        }
      } catch (e) {
        // Silently fail and keep previous state
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
    <div className="px-6 space-y-6 pb-32">
      <Card className="p-8 text-center space-y-6 relative overflow-hidden">
        <motion.div 
          className="absolute -right-10 -top-10 w-32 h-32 bg-neon-purple/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity }}
        />
        <div className="flex justify-center">
          <div className="p-5 rounded-full bg-neon-purple/10 text-neon-purple shadow-[0_0_20px_rgba(191,0,255,0.2)]">
            <Zap size={48} className={cn(isBoosting && "animate-bounce")} />
          </div>
        </div>
        <div>
          <p className="text-5xl font-display font-black text-white">{usagePercent}%</p>
          <p className="text-[10px] font-display text-white/30 uppercase tracking-[0.3em] mt-1 font-bold">RAM Usage</p>
        </div>
        <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden p-[2px]">
          <motion.div 
            className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${usagePercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-white/20 uppercase font-display tracking-widest">
          {memory.used} MB / {memory.total} MB
        </p>
      </Card>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBoost}
        disabled={isBoosting}
        className="w-full py-5 rounded-2xl bg-neon-purple text-white font-display font-bold text-lg tracking-[0.2em] uppercase neon-glow-purple"
      >
        {isBoosting ? "Boosting..." : freed ? `Freed ${freed} MB` : "Boost Now"}
      </motion.button>

      <div className="space-y-4">
        <h3 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">Active Processes</h3>
        <div className="space-y-3">
          {MOCK_APPS.slice(0, 5).map((app, i) => (
            <motion.div 
              key={app.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 p-4 glass rounded-xl"
            >
              <div className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-lg text-xl">
                {app.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-display font-bold text-white/90">{app.name}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{app.size}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-[10px] text-neon-purple font-display font-bold">{(Math.random() * 5 + 2).toFixed(1)}%</span>
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green shadow-[0_0_5px_rgba(0,255,136,1)]" />
              </div>
            </motion.div>
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
    <div className="px-6 space-y-8 pb-32">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-56 h-56 mb-8 flex items-center justify-center">
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-neon-purple/20"
            animate={isTesting ? { scale: [1, 1.1, 1], opacity: [0.2, 0.5, 0.2] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div 
            className="absolute inset-4 rounded-full border-[1px] border-neon-purple/10"
            animate={isTesting ? { rotate: 360 } : {}}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex flex-col items-center relative z-10">
            <Wifi size={48} className={cn(isTesting ? "text-neon-purple animate-pulse" : "text-white/20")} />
            {speed && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p className="text-5xl font-display font-black text-white mt-2">{speed}</p>
                <p className="text-[10px] font-display text-white/30 uppercase tracking-widest font-bold">Mbps</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 w-full gap-4">
          <Card className="text-center p-4">
            <p className="text-[9px] font-display text-white/30 uppercase tracking-widest mb-1 font-bold">Ping</p>
            <p className="text-xl font-display font-bold text-neon-purple">{ping ? `${ping} ms` : '--'}</p>
          </Card>
          <Card className="text-center p-4">
            <p className="text-[9px] font-display text-white/30 uppercase tracking-widest mb-1 font-bold">Jitter</p>
            <p className="text-xl font-display font-bold text-neon-purple">{ping ? `${Math.floor(ping/4)} ms` : '--'}</p>
          </Card>
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={startTest}
        disabled={isTesting}
        className="w-full py-5 rounded-2xl bg-neon-purple text-white font-display font-bold text-lg tracking-[0.2em] uppercase neon-glow-purple"
      >
        {isTesting ? "Testing..." : "Start Speed Test"}
      </motion.button>

      <div className="space-y-4">
        <h3 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">Network Info</h3>
        <Card className="space-y-4 p-5">
          {[
            { label: 'Connection', val: '4G / WiFi', color: 'text-neon-green' },
            { label: 'IP Address', val: '192.168.1.104', color: 'text-white/80' },
            { label: 'Security', val: 'WPA3 Secure', color: 'text-neon-green' }
          ].map((info) => (
            <div key={info.label} className="flex justify-between items-center">
              <span className="text-xs text-white/40 uppercase tracking-wider font-bold">{info.label}</span>
              <span className={cn("text-sm font-display font-bold", info.color)}>{info.val}</span>
            </div>
          ))}
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
    <div className="px-6 space-y-8 pb-32">
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="relative w-48 h-48 mb-8">
          <AnimatePresence mode="wait">
            {status === 'scanning' ? (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-full h-full rounded-full border-4 border-neon-green/20 border-t-neon-green shadow-[0_0_20px_rgba(0,255,136,0.3)]" />
                <motion.div 
                  className="absolute inset-4 rounded-full border-2 border-dashed border-neon-green/40"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            ) : status === 'safe' ? (
              <motion.div 
                key="safe"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="p-10 rounded-full bg-neon-green/10 text-neon-green shadow-[0_0_40px_rgba(0,255,136,0.2)] border border-neon-green/20">
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
                <div className="p-10 rounded-full bg-neon-green/10 text-neon-green shadow-[0_0_40px_rgba(0,255,136,0.1)] border border-neon-green/20">
                  <ShieldAlert size={64} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h2 className="text-3xl font-display font-black mb-2 text-white">
          {status === 'scanning' ? "Scanning..." : status === 'safe' ? "Device Secure" : "Security Check"}
        </h2>
        <p className="text-white/30 text-xs font-display uppercase tracking-widest max-w-[240px]">
          {status === 'safe' ? "No threats detected" : "Protect your device from malware"}
        </p>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleScan}
        disabled={isScanning}
        className="w-full py-5 rounded-2xl bg-neon-green text-bg-deep font-display font-bold text-lg tracking-[0.2em] uppercase neon-glow-green"
      >
        {isScanning ? "Scanning..." : "Start Security Scan"}
      </motion.button>

      <div className="space-y-3">
        {[
          { name: 'Malware Scan', status: status === 'safe' ? 'No threats' : 'Pending', icon: Lock },
          { name: 'Privacy Check', status: status === 'safe' ? 'Secure' : 'Pending', icon: ShieldCheck },
          { name: 'App Permissions', status: status === 'safe' ? 'Verified' : 'Pending', icon: Info },
        ].map((item, i) => (
          <motion.div 
            key={item.name} 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-4 p-4 glass rounded-xl"
          >
            <div className="p-2 rounded-lg bg-white/5 text-neon-green">
              <item.icon size={18} />
            </div>
            <span className="flex-1 text-sm font-display text-white/60 font-medium">{item.name}</span>
            <span className={cn(
              "text-[9px] font-display font-bold uppercase tracking-widest",
              status === 'safe' ? "text-neon-green" : "text-white/20"
            )}>
              {item.status}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [viewStack, setViewStack] = useState<Tab[]>(['dashboard']);
  const [isSplash, setIsSplash] = useState(true);
  const [battery, setBattery] = useState<BatteryStatus | null>(null);

  useEffect(() => {
    // Real Battery Data
    const initBattery = async () => {
      try {
        if ('getBattery' in navigator) {
          const batt = await (navigator as any).getBattery();
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
        }
      } catch (e) {
        console.warn("Battery API blocked or unavailable:", e);
        // Fallback to mock data if needed, but state already has default logic
      }
    };
    
    initBattery();

    const timer = setTimeout(() => setIsSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (tab: Tab) => {
    if (tab === activeTab) return;
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

  if (isSplash) {
    return (
      <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative"
        >
          <div className="w-32 h-32 rounded-3xl bg-neon-cyan/10 flex items-center justify-center mb-6 relative overflow-hidden border border-neon-cyan/20">
            <Zap size={64} className="text-neon-cyan drop-shadow-[0_0_15px_rgba(0,245,255,0.8)]" />
            <motion.div 
              className="absolute inset-0 bg-gradient-to-tr from-neon-cyan/20 to-transparent"
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-3xl font-display font-black text-white tracking-tighter uppercase"
        >
          Ultra <span className="text-neon-cyan">Optimize</span> X
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-white/40 text-xs font-display tracking-[0.3em] uppercase mt-2"
        >
          Powered by AI Engine
        </motion.p>
        
        <div className="absolute bottom-12 left-0 right-0 px-12">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-neon-cyan"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, ease: "easeInOut" }}
            />
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard onNavigate={navigateTo} battery={battery} />;
      case 'cleaner': return <JunkCleaner />;
      case 'booster': return <RAMBooster />;
      case 'network': return <NetworkSpeed />;
      case 'security': return <SecurityScan />;
      case 'game': return (
        <div className="px-6 space-y-8 pb-32">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="relative w-32 h-32 mb-6">
              <motion.div 
                className="absolute inset-0 bg-neon-green/10 rounded-full blur-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <Play size={80} className="text-neon-green relative z-10 drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]" />
            </div>
            <h2 className="text-3xl font-display font-black mb-1 text-white">Game Booster</h2>
            <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] font-bold">Max Performance Mode</p>
          </div>

          <Card className="flex items-center justify-between p-5">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-neon-cyan/10 text-neon-cyan">
                <ShieldAlert size={20} />
              </div>
              <div>
                <p className="text-sm font-display font-bold text-white/90">Do Not Disturb</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">Block notifications</p>
              </div>
            </div>
            <div className="w-12 h-6 bg-neon-cyan/10 rounded-full relative p-1 border border-neon-cyan/20">
              <motion.div 
                className="w-4 h-4 bg-neon-cyan rounded-full shadow-[0_0_10px_rgba(0,245,255,1)]"
                animate={{ x: 20 }}
              />
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">Installed Games</h3>
            <div className="grid grid-cols-1 gap-4">
              {MOCK_APPS.filter(app => app.isGame).map((game) => (
                <Card key={game.id} className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl text-3xl">
                    {game.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-white/90">{game.name}</p>
                    <p className="text-[9px] text-neon-green font-bold uppercase tracking-widest">Optimized</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 rounded-xl bg-neon-green text-bg-deep font-display font-bold text-[10px] uppercase tracking-widest shadow-[0_0_15px_rgba(0,255,136,0.3)]"
                  >
                    Launch
                  </motion.button>
                </Card>
              ))}
            </div>
          </div>
        </div>
      );
      case 'apps': return (
        <div className="px-6 space-y-6 pb-32">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
            <input 
              type="text" 
              placeholder="Search apps..."
              className="w-full glass border border-white/5 rounded-2xl py-4 pl-12 pr-4 font-display text-sm focus:outline-none focus:border-neon-cyan/50 transition-all"
            />
          </div>
          <div className="space-y-4">
            {MOCK_APPS.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="flex items-center gap-4 p-4">
                  <div className="w-14 h-14 flex items-center justify-center bg-white/5 rounded-2xl text-3xl">
                    {app.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold text-white/90">{app.name}</p>
                    <div className="flex items-center gap-2 text-[9px] text-white/30 uppercase tracking-widest font-bold">
                      <span>{app.size}</span>
                      <span className="text-neon-cyan">•</span>
                      <span>{app.lastUsed}</span>
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1, color: '#ff0055' }}
                    whileTap={{ scale: 0.9 }}
                    className="p-3 text-white/20 hover:bg-neon-red/10 rounded-xl transition-colors"
                  >
                    <Trash2 size={20} />
                  </motion.button>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      );
      case 'storage': return (
        <div className="px-6 space-y-10 pb-32">
          <div className="h-72 flex items-center justify-center relative">
            <motion.div 
              className="absolute w-64 h-64 rounded-full border border-white/5"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={STORAGE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {STORAGE_DATA.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      className="drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl font-display font-black text-white"
              >
                52%
              </motion.span>
              <span className="text-[10px] font-display text-white/30 uppercase tracking-[0.3em] font-bold">Used Space</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {STORAGE_DATA.map((item, i) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="flex items-center gap-4 p-4">
                  <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: item.color, color: item.color }} />
                  <div>
                    <p className="text-xs font-display font-bold text-white/90">{item.name}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{item.value}%</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
          <Card className="p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">Storage Health</h3>
              <span className="text-xs font-display font-bold text-neon-green">Good</span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-neon-green w-[85%] rounded-full" />
            </div>
          </Card>
        </div>
      );
      case 'battery': return (
        <div className="px-6 space-y-8 pb-32">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 bg-neon-orange/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <Battery size={80} className="text-neon-orange mb-4 drop-shadow-[0_0_20px_rgba(255,165,0,0.4)]" />
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-5xl font-display font-black text-white"
                >
                  {battery ? battery.level : 78}%
                </motion.span>
              </div>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle
                  cx="50%"
                  cy="50%"
                  r="90"
                  className="stroke-white/5 fill-none"
                  strokeWidth="4"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="90"
                  className="stroke-neon-orange fill-none"
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0 565" }}
                  animate={{ strokeDasharray: `${((battery ? battery.level : 78) / 100) * 565} 565` }}
                  transition={{ duration: 2, ease: "easeOut" }}
                />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-black text-white mb-1">Battery Health: Good</h2>
            <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] font-bold">Estimated: 14h 20m left</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {[
              { label: 'Power Saving Mode', desc: 'Extend battery life by 2 hours', active: true },
              { label: 'Ultra Power Saving', desc: 'Only essential apps', active: false },
              { label: 'Adaptive Battery', desc: 'Limit background apps', active: true },
            ].map((mode, i) => (
              <motion.div
                key={mode.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-sm font-display font-bold text-white/90">{mode.label}</p>
                    <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">{mode.desc}</p>
                  </div>
                  <div className={cn(
                    "w-12 h-6 rounded-full relative p-1 border transition-colors",
                    mode.active ? "bg-neon-orange/20 border-neon-orange/40" : "bg-white/5 border-white/10"
                  )}>
                    <motion.div 
                      className={cn(
                        "w-4 h-4 rounded-full shadow-lg",
                        mode.active ? "bg-neon-orange shadow-neon-orange/50" : "bg-white/20"
                      )}
                      animate={{ x: mode.active ? 20 : 0 }}
                    />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      );
      case 'cooler': return (
        <div className="px-6 space-y-8 pb-32">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <motion.div 
                className="absolute inset-0 bg-neon-cyan/5 rounded-full blur-3xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 5, repeat: Infinity }}
              />
              <div className="relative z-10 flex flex-col items-center">
                <Thermometer size={80} className="text-neon-cyan mb-4 drop-shadow-[0_0_20px_rgba(0,245,255,0.4)]" />
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-5xl font-display font-black text-white"
                >
                  34°C
                </motion.span>
              </div>
              <motion.div 
                className="absolute inset-0 rounded-full border border-neon-cyan/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              />
              <motion.div 
                className="absolute inset-4 rounded-full border border-dashed border-neon-cyan/10"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h2 className="text-2xl font-display font-black text-white mb-1">Temperature: Normal</h2>
            <p className="text-white/30 uppercase tracking-[0.3em] text-[10px] font-bold">CPU is running cool</p>
          </div>

          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-5 rounded-2xl bg-neon-cyan text-bg-deep font-display font-bold text-lg tracking-[0.2em] uppercase neon-glow-cyan"
          >
            Cool Down Now
          </motion.button>

          <div className="space-y-4">
            <h3 className="text-[10px] font-display font-bold text-white/30 uppercase tracking-[0.2em]">Heat Sources</h3>
            <div className="space-y-3">
              {[
                { name: 'System UI', impact: 'Low', icon: Cpu },
                { name: 'Background Apps', impact: 'Minimal', icon: Layers },
                { name: 'Display', impact: 'Moderate', icon: Info },
              ].map((item, i) => (
                <motion.div 
                  key={item.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-4 p-4 glass rounded-xl"
                >
                  <div className="p-2 rounded-lg bg-white/5 text-neon-cyan">
                    <item.icon size={18} />
                  </div>
                  <span className="flex-1 text-sm font-display text-white/60 font-medium">{item.name}</span>
                  <span className="text-[9px] font-display font-bold uppercase tracking-widest text-neon-cyan">
                    {item.impact}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      );
      default: return <Dashboard onNavigate={navigateTo} battery={battery} />;
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
      case 'game': return 'Game Booster';
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

      <BottomNav activeTab={activeTab} onNavigate={navigateTo} />
    </div>
  );
}
