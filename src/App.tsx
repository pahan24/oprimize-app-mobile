import React, { useState, useEffect, useCallback, useMemo, useRef, ErrorInfo, ReactNode } from 'react';
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
  Layers,
  Crosshair,
  Sliders,
  Monitor,
  Gamepad2,
  MousePointer2,
  Target,
  ZapOff,
  Bell,
  Palette,
  HelpCircle,
  Share2,
  Star,
  Cpu as CpuIcon,
  Database,
  Wifi as WifiIcon,
  Battery as BatteryIcon,
  Smartphone as PhoneIcon,
  Globe,
  Image as ImageIcon,
  Music as MusicIcon,
  Users,
  Download,
  Loader2,
  ExternalLink,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
  Palette as PaletteIcon,
  Moon,
  Sun,
  Eye,
  EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { cn } from './utils';
import { DeviceService } from './services/deviceService';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg-deep flex flex-col items-center justify-center p-6 text-center">
          <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
            <AlertTriangle size={48} className="text-neon-red mx-auto" />
            <h1 className="text-xl font-display font-bold text-white uppercase">Something went wrong</h1>
            <p className="text-sm text-white/40">The app encountered an error. Please try refreshing.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-3 rounded-xl bg-neon-cyan text-bg-deep font-bold uppercase text-xs"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// --- Types ---
type Tab = 'dashboard' | 'gfx' | 'sensitivity' | 'crosshair' | 'booster' | 'cleaner' | 'battery' | 'cooler' | 'apps' | 'network' | 'settings' | 'browser' | 'editor' | 'music' | 'social';

interface AppInfo {
  id: string;
  name: string;
  size: string;
  icon: string;
  lastUsed: string;
  isGame?: boolean;
}

interface GFXSettings {
  resolution: string;
  fps: string;
  graphics: string;
  style: string;
  shadows: boolean;
  msaa: boolean;
}

interface SensitivitySettings {
  general: number;
  redDot: number;
  scope2x: number;
  scope4x: number;
  sniper: number;
  freeLook: number;
}

interface CrosshairSettings {
  type: string;
  color: string;
  size: number;
  opacity: number;
  thickness: number;
}

// --- Mock Data ---
const MOCK_APPS: AppInfo[] = [
  { id: '1', name: 'Free Fire', size: '1.8 GB', icon: '🔥', lastUsed: '2 mins ago', isGame: true },
  { id: '2', name: 'PUBG Mobile', size: '2.4 GB', icon: '🔫', lastUsed: '1 hour ago', isGame: true },
  { id: '3', name: 'Call of Duty', size: '3.1 GB', icon: '🎖️', lastUsed: 'Yesterday', isGame: true },
  { id: '4', name: 'Mobile Legends', size: '1.2 GB', icon: '⚔️', lastUsed: '3 hours ago', isGame: true },
  { id: '5', name: 'Social Connect', size: '1.2 GB', icon: '📱', lastUsed: '5 mins ago' },
  { id: '6', name: 'Fast Browser', size: '450 MB', icon: '🌐', lastUsed: '2 days ago' },
  { id: '7', name: 'Photo Editor', size: '890 MB', icon: '🎨', lastUsed: '5 days ago' },
  { id: '8', name: 'Music Stream', size: '320 MB', icon: '🎵', lastUsed: '1 week ago' },
];

const STORAGE_DATA = [
  { name: 'Games', value: 55, color: '#ff0055' },
  { name: 'Apps', value: 25, color: '#00f5ff' },
  { name: 'System', value: 15, color: '#00ff88' },
  { name: 'Free', value: 5, color: '#1d1d2c' },
];

// --- Components ---

const Card = ({ children, className, onClick, noHover = false }: { children: React.ReactNode; className?: string; onClick?: () => void; noHover?: boolean; key?: string | number }) => (
  <motion.div 
    whileHover={noHover ? {} : { scale: 1.02 }}
    whileTap={noHover ? {} : { scale: 0.98 }}
    onClick={onClick}
    className={cn("glass rounded-2xl p-4 transition-all duration-300", className)}
  >
    {children}
  </motion.div>
);

const Header = ({ title, onBack, rightElement }: { title: string; onBack?: () => void; rightElement?: React.ReactNode }) => (
  <div className="flex items-center justify-between p-6 sticky top-0 bg-bg-deep/60 backdrop-blur-2xl z-50 border-b border-white/5">
    <div className="flex items-center gap-4">
      {onBack && (
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} className="text-neon-cyan" />
        </button>
      )}
      <h1 className="text-xl font-display font-bold tracking-wider text-white uppercase">{title}</h1>
    </div>
    {rightElement}
  </div>
);

const StatItem = ({ icon: Icon, label, value, colorClass }: { icon: any; label: string; value: string; colorClass: string }) => (
  <div className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5">
    <Icon size={20} className={colorClass} />
    <span className="text-[10px] uppercase tracking-widest text-white/40 font-medium">{label}</span>
    <span className="text-lg font-display font-bold text-white">{value}</span>
  </div>
);

const ProgressBar = ({ progress, colorClass, label }: { progress: number; colorClass: string; label?: string }) => (
  <div className="w-full space-y-2">
    {label && (
      <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold">
        <span className="text-white/60">{label}</span>
        <span className={colorClass}>{progress}%</span>
      </div>
    )}
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={cn("h-full rounded-full", colorClass.replace('text-', 'bg-'))}
      />
    </div>
  </div>
);

const Toggle = ({ active, onToggle, label }: { active: boolean; onToggle: () => void; label: string }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
    <span className="text-sm font-medium text-white/80">{label}</span>
    <button 
      onClick={onToggle}
      className={cn(
        "w-12 h-6 rounded-full transition-all duration-300 relative p-1",
        active ? "bg-neon-cyan neon-glow-cyan" : "bg-white/10"
      )}
    >
      <motion.div 
        animate={{ x: active ? 24 : 0 }}
        className="w-4 h-4 bg-white rounded-full shadow-lg"
      />
    </button>
  </div>
);

const Slider = ({ value, onChange, min = 0, max = 100, label, icon: Icon }: { value: number; onChange: (v: number) => void; min?: number; max?: number; label: string; icon?: any }) => (
  <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/5">
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        {Icon && <Icon size={16} className="text-neon-cyan" />}
        <span className="text-xs uppercase tracking-widest text-white/60 font-bold">{label}</span>
      </div>
      <span className="text-sm font-display font-bold text-neon-cyan">{value}</span>
    </div>
    <input 
      type="range" 
      min={min} 
      max={max} 
      value={value} 
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-neon-cyan"
    />
  </div>
);

const OptionGrid = ({ options, selected, onSelect, label }: { options: string[]; selected: string; onSelect: (s: string) => void; label: string }) => (
  <div className="space-y-3">
    <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">{label}</span>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(opt)}
          className={cn(
            "py-3 px-4 rounded-xl text-xs font-bold transition-all duration-300 border",
            selected === opt 
              ? "bg-neon-cyan/20 border-neon-cyan text-neon-cyan neon-glow-cyan" 
              : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10"
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

const NavButton = ({ icon: Icon, active, onClick }: { icon: any; active: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-3 rounded-2xl transition-all duration-300 relative group",
      active ? "text-neon-cyan" : "text-white/20 hover:text-white/40"
    )}
  >
    <Icon size={24} />
    {active && (
      <motion.div 
        layoutId="nav-glow"
        className="absolute inset-0 bg-neon-cyan/10 blur-xl rounded-full"
      />
    )}
  </button>
);

const CrosshairOverlay = ({ settings, enabled }: { settings: CrosshairSettings; enabled: boolean }) => {
  if (!enabled) return null;

  const renderCrosshair = () => {
    switch (settings.type) {
      case 'Dot':
        return <div className="rounded-full" style={{ width: settings.size, height: settings.size, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />;
      case 'Classic':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute bg-current" style={{ width: settings.size * 2, height: settings.thickness, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />
            <div className="absolute bg-current" style={{ width: settings.thickness, height: settings.size * 2, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />
          </div>
        );
      case 'Circle':
        return (
          <div className="rounded-full border" style={{ 
            width: settings.size * 2, 
            height: settings.size * 2, 
            borderColor: settings.color, 
            borderWidth: settings.thickness,
            opacity: settings.opacity / 100 
          }} />
        );
      case 'Square':
        return (
          <div className="border" style={{ 
            width: settings.size * 2, 
            height: settings.size * 2, 
            borderColor: settings.color, 
            borderWidth: settings.thickness,
            opacity: settings.opacity / 100 
          }} />
        );
      default:
        return <div className="w-1 h-1 bg-white rounded-full" />;
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] flex items-center justify-center">
      {renderCrosshair()}
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing Pro Engine...');
  const { width, height } = useWindowSize();
  
  // Stats
  const [ramUsage, setRamUsage] = useState(64);
  const [cpuTemp, setCpuTemp] = useState(42);
  const [cpuUsage, setCpuUsage] = useState(24.5);
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [ping, setPing] = useState(45);
  const [networkType, setNetworkType] = useState('WIFI');
  const [deviceModel, setDeviceModel] = useState('Unknown Device');
  const [platform, setPlatform] = useState('android');

  // New settings
  const [crosshairEnabled, setCrosshairEnabled] = useState(false);
  const [themeColor, setThemeColor] = useState('cyan'); 
  const [downloadingApp, setDownloadingApp] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // GFX Settings
  const [gfx, setGfx] = useState<GFXSettings>({
    resolution: '1920x1080',
    fps: '60 FPS',
    graphics: 'Smooth',
    style: 'Colorful',
    shadows: true,
    msaa: false
  });

  // Sensitivity Settings
  const [sens, setSens] = useState<SensitivitySettings>({
    general: 85,
    redDot: 70,
    scope2x: 65,
    scope4x: 55,
    sniper: 40,
    freeLook: 50
  });

  // Crosshair Settings
  const [crosshair, setCrosshair] = useState<CrosshairSettings>({
    type: 'Classic',
    color: '#00f5ff',
    size: 15,
    opacity: 100,
    thickness: 2
  });

  // Simulation & Real Data Effects
  useEffect(() => {
    const initApp = async () => {
      try {
        setLoadingProgress(10);
        setLoadingText('Connecting to Hardware...');
        
        // Load saved settings
        const savedGfx = await DeviceService.getSettings('gfx_settings');
        if (savedGfx) setGfx(savedGfx);
        setLoadingProgress(30);
        
        const savedSens = await DeviceService.getSettings('sens_settings');
        if (savedSens) setSens(savedSens);
        setLoadingProgress(50);
        
        const savedCrosshair = await DeviceService.getSettings('crosshair_settings');
        if (savedCrosshair) setCrosshair(savedCrosshair);
        setLoadingProgress(70);
        
        setLoadingText('Optimizing RAM Buffers...');
        
        // Get initial device info
        const info = await DeviceService.getDeviceInfo();
        setDeviceModel(`${info.manufacturer} ${info.model}`);
        setPlatform(info.platform);
        
        const battery = await DeviceService.getBatteryInfo();
        setBatteryLevel(Math.round((battery.batteryLevel || 0.85) * 100));
        setIsCharging(battery.isCharging || false);
        
        const network = await DeviceService.getNetworkStatus();
        setNetworkType(network.connectionType.toUpperCase());
        
        setLoadingProgress(90);
        setLoadingText('Ready for Battle!');
        
        setTimeout(async () => {
          setLoadingProgress(100);
          setIsLoading(false);
          await SplashScreen.hide();
        }, 1000);
      } catch (error) {
        console.error("Init Error:", error);
        setIsLoading(false);
      }
    };

    initApp();

    // Real-time updates
    const batteryInterval = setInterval(async () => {
      const battery = await DeviceService.getBatteryInfo();
      setBatteryLevel(Math.round((battery.batteryLevel || 0.85) * 100));
      setIsCharging(battery.isCharging || false);
    }, 10000);

    const statsInterval = setInterval(async () => {
      setRamUsage(DeviceService.getRamUsage());
      setCpuTemp(DeviceService.getCpuTemp());
      setCpuUsage(DeviceService.getCpuUsage());
      const network = await DeviceService.getNetworkStatus();
      setPing(await DeviceService.getPing(network));
      setNetworkType(network.connectionType.toUpperCase());
    }, 3000);

    // Network listener
    const networkListenerPromise = Network.addListener('networkStatusChange', (status) => {
      setNetworkType(status.connectionType.toUpperCase());
    });

    return () => {
      clearInterval(batteryInterval);
      clearInterval(statsInterval);
      networkListenerPromise.then(h => h.remove());
    };
  }, []);

  const saveGfx = async (newGfx: GFXSettings) => {
    setGfx(newGfx);
    await DeviceService.saveSettings('gfx_settings', newGfx);
  };

  const saveSens = async (newSens: SensitivitySettings) => {
    setSens(newSens);
    await DeviceService.saveSettings('sens_settings', newSens);
  };

  const saveCrosshair = async (newCrosshair: CrosshairSettings) => {
    setCrosshair(newCrosshair);
    await DeviceService.saveSettings('crosshair_settings', newCrosshair);
  };

  const handleOptimize = useCallback(() => {
    setIsOptimizing(true);
    // Simulate optimization steps
    setTimeout(() => {
      setRamUsage(42);
      setCpuTemp(36);
      setCpuUsage(18.2);
      setPing(24);
      setIsOptimizing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }, 3000);
  }, []);

  const handleDownload = (appId: string) => {
    setDownloadingApp(appId);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingApp(null);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 500);
  };

  const renderDashboard = () => (
    <div className="space-y-6 p-6 pb-32">
      {/* Hero Section */}
      <div className="relative h-48 rounded-3xl overflow-hidden group">
        <img 
          src="https://picsum.photos/seed/gaming/800/400" 
          alt="Gaming" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-deep via-bg-deep/40 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-2xl font-display font-black tracking-tighter text-white uppercase italic">{deviceModel}</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-neon-cyan font-bold">Optimization Active • {networkType}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleOptimize}
            disabled={isOptimizing}
            className={cn(
              "px-6 py-3 rounded-2xl font-display font-bold text-xs tracking-widest uppercase transition-all duration-500",
              isOptimizing ? "bg-white/10 text-white/40" : "bg-neon-cyan text-bg-deep neon-glow-cyan"
            )}
          >
            {isOptimizing ? "Optimizing..." : "Boost Now"}
          </motion.button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex justify-between items-center">
            <div className="p-2 rounded-xl bg-neon-cyan/10">
              <Cpu size={20} className="text-neon-cyan" />
            </div>
            <span className="text-xs font-display font-bold text-neon-cyan">{cpuUsage}%</span>
          </div>
          <ProgressBar progress={cpuUsage} colorClass="text-neon-cyan" label="CPU Usage" />
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex justify-between items-center">
            <div className="p-2 rounded-xl bg-neon-purple/10">
              <Layers size={20} className="text-neon-purple" />
            </div>
            <span className="text-xs font-display font-bold text-neon-purple">{Math.round(ramUsage)}%</span>
          </div>
          <ProgressBar progress={ramUsage} colorClass="text-neon-purple" label="RAM Usage" />
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex justify-between items-center">
            <div className="p-2 rounded-xl bg-neon-green/10">
              <BatteryIcon size={20} className="text-neon-green" />
            </div>
            <span className="text-xs font-display font-bold text-neon-green">{batteryLevel}%</span>
          </div>
          <ProgressBar progress={batteryLevel} colorClass="text-neon-green" label="Battery" />
        </Card>
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex justify-between items-center">
            <div className="p-2 rounded-xl bg-neon-orange/10">
              <Thermometer size={20} className="text-neon-orange" />
            </div>
            <span className="text-xs font-display font-bold text-neon-orange">{cpuTemp}°C</span>
          </div>
          <ProgressBar progress={(cpuTemp / 100) * 100} colorClass="text-neon-orange" label="CPU Temp" />
        </Card>
      </div>

      {/* Main Tools */}
      <div className="grid grid-cols-2 gap-4">
        <Card onClick={() => setActiveTab('gfx')} className="flex flex-col items-center gap-3 py-6">
          <Monitor size={28} className="text-neon-cyan" />
          <span className="text-xs font-bold uppercase tracking-widest">GFX Tool</span>
        </Card>
        <Card onClick={() => setActiveTab('sensitivity')} className="flex flex-col items-center gap-3 py-6">
          <Sliders size={28} className="text-neon-purple" />
          <span className="text-xs font-bold uppercase tracking-widest">Sensitivity</span>
        </Card>
        <Card onClick={() => setActiveTab('crosshair')} className="flex flex-col items-center gap-3 py-6">
          <Target size={28} className="text-neon-green" />
          <span className="text-xs font-bold uppercase tracking-widest">Crosshair</span>
        </Card>
        <Card onClick={() => setActiveTab('network')} className="flex flex-col items-center gap-3 py-6">
          <Wifi size={28} className="text-neon-orange" />
          <span className="text-xs font-bold uppercase tracking-widest">Ping Fix</span>
        </Card>
      </div>

      {/* System Tools */}
      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">System Optimization</h3>
      <div className="space-y-3">
        <Card onClick={() => setActiveTab('cleaner')} className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-2xl bg-neon-red/10">
            <Trash2 size={24} className="text-neon-red" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">Junk Cleaner</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">2.4 GB Cache Found</p>
          </div>
          <ChevronRight size={20} className="text-white/20" />
        </Card>
        <Card onClick={() => setActiveTab('battery')} className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-2xl bg-neon-green/10">
            <Battery size={24} className="text-neon-green" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">Battery Saver</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">{batteryLevel}% • {isCharging ? 'Charging' : 'Discharging'}</p>
          </div>
          <ChevronRight size={20} className="text-white/20" />
        </Card>
        <Card onClick={() => setActiveTab('cooler')} className="flex items-center gap-4 p-4">
          <div className="p-3 rounded-2xl bg-neon-cyan/10">
            <Thermometer size={24} className="text-neon-cyan" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-white">Phone Cooler</h4>
            <p className="text-[10px] text-white/40 uppercase tracking-wider">Normal Temperature</p>
          </div>
          <ChevronRight size={20} className="text-white/20" />
        </Card>
      </div>
    </div>
  );

  const renderGFX = () => (
    <div className="space-y-6 p-6 pb-32">
      <OptionGrid 
        label="Resolution" 
        options={['960x540', '1280x720', '1920x1080', '2560x1440']} 
        selected={gfx.resolution} 
        onSelect={(s) => saveGfx({...gfx, resolution: s})} 
      />
      <OptionGrid 
        label="FPS Limit" 
        options={['30 FPS', '40 FPS', '60 FPS', '90 FPS']} 
        selected={gfx.fps} 
        onSelect={(s) => saveGfx({...gfx, fps: s})} 
      />
      <OptionGrid 
        label="Graphics" 
        options={['Smooth', 'Balanced', 'HD', 'HDR']} 
        selected={gfx.graphics} 
        onSelect={(s) => saveGfx({...gfx, graphics: s})} 
      />
      <OptionGrid 
        label="Style" 
        options={['Classic', 'Colorful', 'Realistic', 'Soft']} 
        selected={gfx.style} 
        onSelect={(s) => saveGfx({...gfx, style: s})} 
      />
      
      <div className="space-y-3">
        <Toggle label="Shadows" active={gfx.shadows} onToggle={() => saveGfx({...gfx, shadows: !gfx.shadows})} />
        <Toggle label="Anti-Aliasing (MSAA)" active={gfx.msaa} onToggle={() => saveGfx({...gfx, msaa: !gfx.msaa})} />
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOptimize}
        className="w-full py-4 rounded-2xl bg-neon-cyan text-bg-deep font-display font-bold uppercase tracking-widest neon-glow-cyan"
      >
        Apply Settings
      </motion.button>
    </div>
  );

  const renderSensitivity = () => (
    <div className="space-y-4 p-6 pb-32">
      <div className="p-6 rounded-3xl bg-neon-purple/5 border border-neon-purple/20 flex flex-col items-center gap-4">
        <div className="p-4 rounded-full bg-neon-purple/10">
          <MousePointer2 size={32} className="text-neon-purple" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-display font-bold text-white uppercase italic">Pro Sensitivity</h3>
          <p className="text-[10px] text-white/40 uppercase tracking-widest">Optimized for Free Fire Headshots</p>
        </div>
      </div>

      <Slider label="General" value={sens.general} onChange={(v) => saveSens({...sens, general: v})} icon={Activity} />
      <Slider label="Red Dot" value={sens.redDot} onChange={(v) => saveSens({...sens, redDot: v})} icon={Target} />
      <Slider label="2x Scope" value={sens.scope2x} onChange={(v) => saveSens({...sens, scope2x: v})} icon={Search} />
      <Slider label="4x Scope" value={sens.scope4x} onChange={(v) => saveSens({...sens, scope4x: v})} icon={Search} />
      <Slider label="Sniper Scope" value={sens.sniper} onChange={(v) => saveSens({...sens, sniper: v})} icon={Crosshair} />
      <Slider label="Free Look" value={sens.freeLook} onChange={(v) => saveSens({...sens, freeLook: v})} icon={Activity} />

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOptimize}
        className="w-full py-4 rounded-2xl bg-neon-purple text-white font-display font-bold uppercase tracking-widest neon-glow-purple"
      >
        Save Sensitivity
      </motion.button>
    </div>
  );

  const renderCrosshair = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="h-48 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center relative overflow-hidden cyber-grid">
        <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-transparent" />
        {/* Preview Crosshair */}
        <div className="relative z-10">
          {crosshair.type === 'Classic' && <div className="w-1 h-1 bg-neon-cyan rounded-full shadow-[0_0_10px_#00f5ff]" style={{ backgroundColor: crosshair.color, width: crosshair.size/2, height: crosshair.size/2, opacity: crosshair.opacity/100 }} />}
          {crosshair.type === 'Circle' && <div className="rounded-full border-2" style={{ borderColor: crosshair.color, width: crosshair.size, height: crosshair.size, opacity: crosshair.opacity/100, borderWidth: crosshair.thickness }} />}
          {crosshair.type === 'Dot' && <div className="rounded-full" style={{ backgroundColor: crosshair.color, width: crosshair.size/3, height: crosshair.size/3, opacity: crosshair.opacity/100 }} />}
          {crosshair.type === 'Cross' && (
            <div className="relative" style={{ opacity: crosshair.opacity/100 }}>
              <div className="absolute left-1/2 -translate-x-1/2" style={{ backgroundColor: crosshair.color, width: crosshair.thickness, height: crosshair.size }} />
              <div className="absolute top-1/2 -translate-y-1/2" style={{ backgroundColor: crosshair.color, width: crosshair.size, height: crosshair.thickness }} />
            </div>
          )}
        </div>
      </div>

      <OptionGrid 
        label="Crosshair Type" 
        options={['Classic', 'Circle', 'Dot', 'Cross']} 
        selected={crosshair.type} 
        onSelect={(s) => saveCrosshair({...crosshair, type: s})} 
      />

      <div className="space-y-4">
        <Slider label="Size" value={crosshair.size} onChange={(v) => saveCrosshair({...crosshair, size: v})} min={5} max={50} />
        <Slider label="Opacity" value={crosshair.opacity} onChange={(v) => saveCrosshair({...crosshair, opacity: v})} />
        <Slider label="Thickness" value={crosshair.thickness} onChange={(v) => saveCrosshair({...crosshair, thickness: v})} min={1} max={10} />
      </div>

      <div className="space-y-3">
        <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Color</span>
        <div className="flex gap-3">
          {['#00f5ff', '#bf00ff', '#00ff88', '#ff6b00', '#ff0055', '#f0ff00'].map(c => (
            <button 
              key={c}
              onClick={() => saveCrosshair({...crosshair, color: c})}
              className={cn(
                "w-10 h-10 rounded-full border-2 transition-all duration-300",
                crosshair.color === c ? "border-white scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderNetwork = () => (
    <div className="space-y-6 p-6 pb-32">
      <Card className="p-8 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-orange/20 blur-3xl rounded-full" />
          <div className={cn(
            "w-32 h-32 rounded-full border-4 flex items-center justify-center transition-all duration-500",
            ping < 50 ? "border-neon-green neon-glow-green" : ping < 100 ? "border-neon-orange neon-glow-orange" : "border-neon-red neon-glow-red"
          )}>
            <div className="text-center">
              <span className="text-3xl font-display font-black text-white">{Math.round(ping)}</span>
              <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">ms</p>
            </div>
          </div>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-lg font-display font-bold text-white uppercase italic">Ping Stabilizer</h3>
          <p className="text-xs text-white/60">Optimizing network packets for low latency</p>
        </div>
      </Card>

      <div className="space-y-3">
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <WifiIcon size={20} className="text-neon-cyan" />
            <span className="text-sm font-bold text-white">Network Type</span>
          </div>
          <span className="text-xs font-display font-bold text-neon-cyan">{networkType}</span>
        </Card>
        <Card className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-neon-purple" />
            <span className="text-sm font-bold text-white">Packet Loss</span>
          </div>
          <span className="text-xs font-display font-bold text-neon-purple">0.0%</span>
        </Card>
      </div>

      <div className="space-y-3">
        <Toggle label="DNS Optimization" active={true} onToggle={() => {}} />
        <Toggle label="Background Data Restrict" active={true} onToggle={() => {}} />
        <Toggle label="Gaming Mode Network" active={true} onToggle={() => {}} />
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOptimize}
        className="w-full py-4 rounded-2xl bg-neon-orange text-white font-display font-bold uppercase tracking-widest neon-glow-orange"
      >
        Stabilize Connection
      </motion.button>
    </div>
  );

  const renderApps = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={20} />
        <input 
          type="text" 
          placeholder="Search Games & Apps..." 
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-neon-cyan/50 transition-colors"
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">Installed Games</h3>
        <div className="grid grid-cols-1 gap-3">
          {MOCK_APPS.filter(a => a.isGame).map(app => (
            <Card key={app.id} className="flex items-center gap-4 p-4">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">
                {app.icon}
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-white">{app.name}</h4>
                <p className="text-[10px] text-white/40 uppercase tracking-wider">{app.size} • {app.lastUsed}</p>
              </div>
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan"
              >
                <Play size={20} fill="currentColor" />
              </motion.button>
            </Card>
          ))}
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1 mt-6">Available to Download</h3>
        <div className="grid grid-cols-1 gap-3">
          <Card className="flex items-center gap-4 p-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-2xl">🎮</div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Apex Legends Mobile</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">2.1 GB • High Performance</p>
            </div>
            <motion.button 
              onClick={() => handleDownload('apex')}
              disabled={downloadingApp === 'apex'}
              className="p-2 rounded-xl bg-neon-cyan text-bg-deep"
            >
              {downloadingApp === 'apex' ? <Loader2 size={20} className="animate-spin" /> : <Download size={20} />}
            </motion.button>
          </Card>
          {downloadingApp === 'apex' && (
            <div className="px-4">
              <ProgressBar progress={Math.round(downloadProgress)} colorClass="text-neon-cyan" label="Downloading..." />
            </div>
          )}
        </div>

        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1 mt-6">Mini Apps</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card onClick={() => setActiveTab('browser')} className="flex flex-col items-center gap-3 py-6">
            <Globe size={28} className="text-neon-cyan" />
            <span className="text-xs font-bold uppercase tracking-widest">Fast Browser</span>
          </Card>
          <Card onClick={() => setActiveTab('editor')} className="flex flex-col items-center gap-3 py-6">
            <ImageIcon size={28} className="text-neon-purple" />
            <span className="text-xs font-bold uppercase tracking-widest">Photo Editor</span>
          </Card>
          <Card onClick={() => setActiveTab('music')} className="flex flex-col items-center gap-3 py-6">
            <MusicIcon size={28} className="text-neon-green" />
            <span className="text-xs font-bold uppercase tracking-widest">Music Stream</span>
          </Card>
          <Card onClick={() => setActiveTab('social')} className="flex flex-col items-center gap-3 py-6">
            <Users size={28} className="text-neon-orange" />
            <span className="text-xs font-bold uppercase tracking-widest">Social Connect</span>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderBrowser = () => (
    <div className="h-full flex flex-col p-6 space-y-6">
      <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
        <Globe size={20} className="text-neon-cyan" />
        <input type="text" placeholder="https://google.com" className="bg-transparent border-none outline-none flex-1 text-sm text-white" defaultValue="https://google.com" />
        <ExternalLink size={18} className="text-white/40" />
      </div>
      <div className="flex-1 glass rounded-3xl border border-white/5 flex flex-col items-center justify-center p-12 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-neon-cyan/10 flex items-center justify-center">
          <ShieldCheck size={40} className="text-neon-cyan" />
        </div>
        <h3 className="text-xl font-display font-bold text-white uppercase italic">Secure Browser Active</h3>
        <p className="text-sm text-white/40">Your connection is encrypted and optimized for low latency gaming.</p>
        <div className="grid grid-cols-2 gap-3 w-full pt-6">
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Ad Block</p>
            <p className="text-sm font-bold text-neon-green">ENABLED</p>
          </div>
          <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Safe Browsing</p>
            <p className="text-sm font-bold text-neon-green">ACTIVE</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="p-6 space-y-6">
      <Card className="p-8 flex flex-col items-center gap-6">
        <div className="w-full aspect-square rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
          <img src="https://picsum.photos/seed/editor/400/400" alt="Edit" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-neon-purple/20 mix-blend-overlay" />
        </div>
        <div className="grid grid-cols-4 gap-4 w-full">
          <button className="p-3 rounded-xl bg-white/5 flex flex-col items-center gap-2">
            <Maximize2 size={18} className="text-neon-purple" />
            <span className="text-[8px] uppercase font-bold">Crop</span>
          </button>
          <button className="p-3 rounded-xl bg-white/5 flex flex-col items-center gap-2">
            <PaletteIcon size={18} className="text-neon-purple" />
            <span className="text-[8px] uppercase font-bold">Filter</span>
          </button>
          <button className="p-3 rounded-xl bg-white/5 flex flex-col items-center gap-2">
            <Sun size={18} className="text-neon-purple" />
            <span className="text-[8px] uppercase font-bold">Bright</span>
          </button>
          <button className="p-3 rounded-xl bg-white/5 flex flex-col items-center gap-2">
            <Download size={18} className="text-neon-purple" />
            <span className="text-[8px] uppercase font-bold">Save</span>
          </button>
        </div>
      </Card>
    </div>
  );

  const renderMusic = () => (
    <div className="p-6 space-y-6">
      <Card className="p-8 flex flex-col items-center gap-8">
        <div className="w-48 h-48 rounded-full bg-white/5 border-4 border-neon-green/20 flex items-center justify-center relative overflow-hidden">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-gradient-to-tr from-neon-green/20 to-transparent"
          />
          <MusicIcon size={64} className="text-neon-green relative z-10" />
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-xl font-display font-bold text-white uppercase italic">Gaming Lo-Fi Beats</h3>
          <p className="text-sm text-white/40">Ultra Optimize X Radio</p>
        </div>
        <div className="flex items-center gap-8">
          <button className="p-2 text-white/40"><Minus size={24} /></button>
          <button className="w-16 h-16 rounded-full bg-neon-green text-bg-deep flex items-center justify-center neon-glow-green">
            <Play size={32} fill="currentColor" />
          </button>
          <button className="p-2 text-white/40"><Plus size={24} /></button>
        </div>
      </Card>
    </div>
  );

  const renderSocial = () => (
    <div className="p-6 space-y-4">
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">👤</div>
            <div>
              <h4 className="text-sm font-bold text-white">ProGamer_{i}</h4>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">2 hours ago</p>
            </div>
          </div>
          <p className="text-xs text-white/80 leading-relaxed">Just optimized my device with Ultra Optimize X! My ping dropped from 120ms to 24ms. Highly recommended for all competitive players! 🔥🎮</p>
          <div className="flex gap-4">
            <button className="text-[10px] uppercase font-bold text-neon-orange">Like</button>
            <button className="text-[10px] uppercase font-bold text-white/40">Comment</button>
            <button className="text-[10px] uppercase font-bold text-white/40">Share</button>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">Personalization</h3>
        <Card className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-neon-cyan" />
              <span className="text-sm font-bold text-white">Theme Color</span>
            </div>
            <div className="flex gap-2">
              {['cyan', 'purple', 'green', 'orange', 'red'].map(c => (
                <button 
                  key={c}
                  onClick={() => setThemeColor(c)}
                  className={cn(
                    "w-6 h-6 rounded-full border transition-all",
                    themeColor === c ? "border-white scale-110" : "border-transparent",
                    c === 'cyan' ? "bg-neon-cyan" : 
                    c === 'purple' ? "bg-neon-purple" : 
                    c === 'green' ? "bg-neon-green" : 
                    c === 'orange' ? "bg-neon-orange" : "bg-neon-red"
                  )}
                />
              ))}
            </div>
          </div>
          <Toggle label="Push Notifications" active={true} onToggle={() => {}} />
          <Toggle label="Auto Optimization" active={true} onToggle={() => {}} />
        </Card>
      </div>

      <div className="space-y-3">
        <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">Privacy & Security</h3>
        <Card className="p-0 overflow-hidden">
          <div className="divide-y divide-white/5">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Lock size={20} className="text-neon-green" />
                <span className="text-sm font-bold text-white">App Lock</span>
              </div>
              <Toggle active={false} onToggle={() => {}} label="" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck size={20} className="text-neon-cyan" />
                <span className="text-sm font-bold text-white">Safe Browsing</span>
              </div>
              <span className="text-[10px] text-neon-green font-bold">ACTIVE</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center pt-6">
        <p className="text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">Ultra Optimize X v2.0.5</p>
        <p className="text-[8px] uppercase tracking-[0.2em] text-white/10 mt-2">Designed for Pro Gamers</p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <CrosshairOverlay settings={crosshair} enabled={crosshairEnabled} />
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[100] bg-bg-deep flex flex-col items-center justify-center p-8"
          >
            <div className="absolute inset-0 cyber-grid opacity-20" />
            <div className="relative z-10 w-full max-w-xs space-y-12">
              <div className="flex flex-col items-center gap-4">
                <motion.div 
                  animate={{ 
                    rotate: 360,
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ 
                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-24 h-24 rounded-3xl bg-neon-cyan/10 border-2 border-neon-cyan flex items-center justify-center neon-glow-cyan"
                >
                  <Zap size={48} className="text-neon-cyan" fill="currentColor" />
                </motion.div>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-display font-black tracking-tighter text-white uppercase italic">Ultra Optimize X</h1>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-neon-cyan font-bold">Pro Gaming Engine</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{loadingText}</span>
                  <span className="text-lg font-display font-bold text-neon-cyan">{loadingProgress}%</span>
                </div>
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${loadingProgress}%` }}
                    className="h-full bg-neon-cyan neon-glow-cyan"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-bg-deep text-white font-sans relative"
          >
            {showConfetti && width > 0 && height > 0 && (
              <Confetti 
                width={width} 
                height={height} 
                recycle={false} 
                numberOfPieces={200} 
                colors={['#00f5ff', '#bf00ff', '#00ff88']} 
              />
            )}
            
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-cyan/5 blur-[120px] rounded-full" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-neon-purple/5 blur-[120px] rounded-full" />
            </div>

            <Header 
              title={activeTab === 'dashboard' ? 'Ultra Optimize X' : activeTab.toUpperCase()} 
              onBack={activeTab !== 'dashboard' ? () => setActiveTab('dashboard') : undefined}
              rightElement={
                <button onClick={() => setActiveTab('settings')} className="p-2 rounded-xl bg-white/5 relative">
                  <Settings size={20} className={activeTab === 'settings' ? 'text-neon-cyan' : 'text-white/60'} />
                </button>
              }
            />

            <main className="max-w-md mx-auto relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {activeTab === 'dashboard' && renderDashboard()}
                  {activeTab === 'gfx' && renderGFX()}
                  {activeTab === 'sensitivity' && renderSensitivity()}
                  {activeTab === 'crosshair' && renderCrosshair()}
                  {activeTab === 'network' && renderNetwork()}
                  {activeTab === 'apps' && renderApps()}
                  {activeTab === 'browser' && renderBrowser()}
                  {activeTab === 'editor' && renderEditor()}
                  {activeTab === 'music' && renderMusic()}
                  {activeTab === 'social' && renderSocial()}
                  {activeTab === 'settings' && renderSettings()}
                  {['cleaner', 'battery', 'cooler'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl animate-pulse" />
                        <div className="w-48 h-48 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-neon-cyan"
                          />
                          {activeTab === 'cleaner' && <Trash2 size={64} className="text-neon-cyan" />}
                          {activeTab === 'battery' && <BatteryIcon size={64} className="text-neon-green" />}
                          {activeTab === 'cooler' && <Thermometer size={64} className="text-neon-cyan" />}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-display font-bold uppercase tracking-widest">
                          {activeTab === 'cleaner' ? 'Cleaning Junk...' : activeTab === 'battery' ? 'Saving Power...' : 'Cooling Down...'}
                        </h2>
                        <p className="text-sm text-white/40">Optimizing system resources for peak performance</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOptimize}
                        className="px-12 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold uppercase tracking-widest text-xs"
                      >
                        Start Scan
                      </motion.button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>

            {/* Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 p-4 pb-8 bg-gradient-to-t from-bg-deep via-bg-deep/95 to-transparent z-50">
              <div className="max-w-md mx-auto glass rounded-3xl p-2 flex justify-between items-center">
                <NavButton icon={LayoutGrid} active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <NavButton icon={PhoneIcon} active={activeTab === 'apps'} onClick={() => setActiveTab('apps')} />
                <div className="relative -top-6">
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleOptimize}
                    className="w-14 h-14 rounded-2xl bg-neon-cyan text-bg-deep flex items-center justify-center neon-glow-cyan shadow-2xl"
                  >
                    <Zap size={28} fill="currentColor" />
                  </motion.button>
                </div>
                <NavButton icon={Activity} active={activeTab === 'network'} onClick={() => setActiveTab('network')} />
                <NavButton icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
