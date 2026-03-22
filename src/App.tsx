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
  EyeOff,
  Send,
  MessageSquare,
  Newspaper,
  Volume2,
  SkipBack,
  SkipForward,
  Pause,
  Upload,
  LogOut,
  LogIn,
  Phone,
  UserPlus,
  MoreVertical,
  ArrowRight,
  UserCircle,
  Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { cn } from './utils';
import { DeviceService } from './services/deviceService';
import { SplashScreen } from '@capacitor/splash-screen';
import { Network } from '@capacitor/network';
import { Device } from '@capacitor/device';
import { 
  auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, 
  collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp, 
  doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, User,
  RecaptchaVerifier, signInWithPhoneNumber, where, getDocs
} from './firebase';

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
type Tab = 'dashboard' | 'gfx' | 'sensitivity' | 'crosshair' | 'booster' | 'cleaner' | 'battery' | 'cooler' | 'apps' | 'network' | 'settings' | 'browser' | 'social' | 'music' | 'squad';

interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  timestamp: any;
  chatId: string;
}

interface ChatRoom {
  id: string;
  name: string;
  type: 'private' | 'group';
  participants: string[];
  lastMessage?: string;
  lastTimestamp?: any;
  createdBy?: string;
}

interface UserProfile {
  uid: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  status?: string;
  contacts?: string[];
  lastSeen?: number;
}

interface GameInfo {
  id: string;
  name: string;
  size: string;
  icon: string;
  description: string;
  rating: number;
}

interface MusicTrack {
  id: string;
  name: string;
  artist: string;
  url: string;
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
const GAME_STORE: GameInfo[] = [
  { id: 'apex', name: 'Apex Legends', size: '2.1 GB', icon: '🎮', description: 'High-octane battle royale action.', rating: 4.8 },
  { id: 'ff', name: 'Free Fire Max', size: '1.2 GB', icon: '🔥', description: 'The ultimate survival shooter.', rating: 4.5 },
  { id: 'cod', name: 'COD Mobile', size: '3.4 GB', icon: '🎖️', description: 'Classic Call of Duty on the go.', rating: 4.7 },
  { id: 'pubg', name: 'PUBG Mobile', size: '2.8 GB', icon: '🔫', description: 'The original battle royale.', rating: 4.6 },
  { id: 'genshin', name: 'Genshin Impact', size: '15 GB', icon: '✨', description: 'Open-world action RPG.', rating: 4.9 },
];

const NEWS_FEED = [
  { id: '1', title: 'New Season in Free Fire!', date: '2 hours ago', content: 'Get ready for the new ranked season with exclusive rewards.', image: 'https://picsum.photos/seed/ff/400/200' },
  { id: '2', title: 'Pro Sensitivity Tips', date: '5 hours ago', content: 'Learn how the pros set their sensitivity for perfect headshots.', image: 'https://picsum.photos/seed/pro/400/200' },
  { id: '3', title: 'Battery Saving Guide', date: '1 day ago', content: 'Max out your gaming time with these simple battery tweaks.', image: 'https://picsum.photos/seed/battery/400/200' },
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
        return <div className="rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" style={{ width: settings.size, height: settings.size, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />;
      case 'Classic':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute shadow-[0_0_5px_rgba(0,0,0,0.3)]" style={{ width: settings.size * 2, height: settings.thickness, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />
            <div className="absolute shadow-[0_0_5px_rgba(0,0,0,0.3)]" style={{ width: settings.thickness, height: settings.size * 2, backgroundColor: settings.color, opacity: settings.opacity / 100 }} />
          </div>
        );
      case 'Circle':
        return (
          <div className="rounded-full border shadow-[0_0_5px_rgba(0,0,0,0.3)]" style={{ 
            width: settings.size * 2, 
            height: settings.size * 2, 
            borderColor: settings.color, 
            borderWidth: settings.thickness,
            opacity: settings.opacity / 100 
          }} />
        );
      case 'Cross':
        return (
          <div className="relative flex items-center justify-center">
            <div className="absolute" style={{ width: settings.thickness, height: settings.size, backgroundColor: settings.color, opacity: settings.opacity / 100, transform: 'translateY(-50%)' }} />
            <div className="absolute" style={{ width: settings.thickness, height: settings.size, backgroundColor: settings.color, opacity: settings.opacity / 100, transform: 'translateY(50%)' }} />
            <div className="absolute" style={{ width: settings.size, height: settings.thickness, backgroundColor: settings.color, opacity: settings.opacity / 100, transform: 'translateX(-50%)' }} />
            <div className="absolute" style={{ width: settings.size, height: settings.thickness, backgroundColor: settings.color, opacity: settings.opacity / 100, transform: 'translateX(50%)' }} />
          </div>
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

  // Firebase State
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [activeChatRoom, setActiveChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [contacts, setContacts] = useState<UserProfile[]>([]);

  // Phone Auth State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [verificationId, setVerificationId] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Feature State
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [browserSearch, setBrowserSearch] = useState('');
  const [crosshairEnabled, setCrosshairEnabled] = useState(false);
  const [installedGames, setInstalledGames] = useState<string[]>(['ff']);
  const [musicList, setMusicList] = useState<MusicTrack[]>([
    { id: '1', name: 'Cyberpunk Beat', artist: 'Neon Rider', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', name: 'Synthwave Drive', artist: 'Retro Wave', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  ]);
  const [currentTrack, setCurrentTrack] = useState<MusicTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // New settings
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
        setLoadingProgress(20);
        
        setLoadingText('Requesting System Permissions...');
        const granted = await DeviceService.requestPermissions();
        setPermissionsGranted(granted);
        setLoadingProgress(40);

        const savedSens = await DeviceService.getSettings('sens_settings');
        if (savedSens) setSens(savedSens);
        setLoadingProgress(50);
        
        const savedCrosshair = await DeviceService.getSettings('crosshair_settings');
        if (savedCrosshair) setCrosshair(savedCrosshair);
        setLoadingProgress(60);
        
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

    // Firebase Auth Listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setIsAuthLoading(false);
      if (u) {
        // Sync user to Firestore
        const userRef = doc(db, 'users', u.uid);
        const userSnap = await getDoc(userRef);
        
        const profileData: UserProfile = {
          uid: u.uid,
          displayName: u.displayName || u.phoneNumber || 'Pro Gamer',
          photoURL: u.photoURL || `https://ui-avatars.com/api/?name=${u.displayName || 'P'}&background=00f5ff&color=1d1d2c`,
          phoneNumber: u.phoneNumber || undefined,
          lastSeen: Date.now(),
          status: 'Gaming with Ultra Optimize X'
        };

        if (!userSnap.exists()) {
          await setDoc(userRef, profileData);
          setUserProfile(profileData);
        } else {
          await updateDoc(userRef, { lastSeen: Date.now() });
          setUserProfile({ ...userSnap.data(), ...profileData } as UserProfile);
        }

        // Fetch Chat Rooms
        const roomsQuery = query(
          collection(db, 'chats'),
          where('participants', 'array-contains', u.uid),
          orderBy('lastTimestamp', 'desc')
        );
        
        onSnapshot(roomsQuery, (snapshot) => {
          const rooms = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatRoom[];
          setChatRooms(rooms);
        });
      } else {
        setUserProfile(null);
        setChatRooms([]);
      }
    });

    // Chat Listener
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

    let unsubscribeMessages: (() => void) | null = null;
    if (activeChatRoom) {
      const msgsQuery = query(
        collection(db, 'chats', activeChatRoom.id, 'messages'),
        orderBy('timestamp', 'asc'),
        limit(100)
      );
      unsubscribeMessages = onSnapshot(msgsQuery, (snapshot) => {
        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ChatMessage[];
        setMessages(msgs);
      });
    }

    return () => {
      clearInterval(batteryInterval);
      clearInterval(statsInterval);
      networkListenerPromise.then(h => h.remove());
      if (unsubscribeMessages) unsubscribeMessages();
    };
  }, [activeChatRoom]);

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
      setRamUsage(prev => Math.max(prev - 15, 30));
      setCpuTemp(prev => Math.max(prev - 5, 32));
      setCpuUsage(prev => Math.max(prev - 10, 12));
      setPing(prev => Math.max(prev - 8, 15));
      setIsOptimizing(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }, 3000);
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Sign In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setActiveTab('dashboard');
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {}
      });
    }
  };

  const handlePhoneLogin = async () => {
    if (!phoneNumber) return;
    try {
      setupRecaptcha();
      const verifier = (window as any).recaptchaVerifier;
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      (window as any).confirmationResult = confirmationResult;
      setIsOtpSent(true);
    } catch (error) {
      console.error("Phone Login Error:", error);
      alert("Failed to send code. Please check number format (e.g., +94771234567)");
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return;
    setIsVerifying(true);
    try {
      const result = await (window as any).confirmationResult.confirm(otp);
      setUser(result.user);
    } catch (error) {
      console.error("OTP Verification Error:", error);
      alert("Invalid code.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user || !activeChatRoom) return;

    try {
      const msgData = {
        text: chatInput,
        senderId: user.uid,
        senderName: userProfile?.displayName || 'Pro Gamer',
        senderPhoto: userProfile?.photoURL || '',
        timestamp: serverTimestamp(),
        chatId: activeChatRoom.id
      };

      await addDoc(collection(db, 'chats', activeChatRoom.id, 'messages'), msgData);
      await updateDoc(doc(db, 'chats', activeChatRoom.id), {
        lastMessage: chatInput,
        lastTimestamp: serverTimestamp()
      });
      setChatInput('');
    } catch (error) {
      console.error("Send Message Error:", error);
    }
  };

  const createChatRoom = async (targetUser: UserProfile) => {
    if (!user) return;
    
    // Check if room already exists
    const existing = chatRooms.find(r => 
      r.type === 'private' && r.participants.includes(targetUser.uid)
    );

    if (existing) {
      setActiveChatRoom(existing);
      return;
    }

    try {
      const roomData = {
        name: targetUser.displayName,
        type: 'private',
        participants: [user.uid, targetUser.uid],
        lastTimestamp: serverTimestamp(),
        createdBy: user.uid
      };
      const docRef = await addDoc(collection(db, 'chats'), roomData);
      setActiveChatRoom({ id: docRef.id, ...roomData } as ChatRoom);
    } catch (error) {
      console.error("Create Room Error:", error);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) return;
    try {
      const q = query(
        collection(db, 'users'),
        where('phoneNumber', '==', searchQuery.trim())
      );
      const snap = await getDocs(q);
      const found = snap.docs.map(doc => doc.data() as UserProfile);
      setContacts(found);
    } catch (error) {
      console.error("Search Users Error:", error);
    }
  };

  const togglePlay = () => {
    if (!currentTrack) {
      setCurrentTrack(musicList[0]);
      setIsPlaying(true);
      return;
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Audio Play Error:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  const handleDownload = (appId: string) => {
    setDownloadingApp(appId);
    setDownloadProgress(0);
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setDownloadingApp(null);
          setInstalledGames(prevGames => [...prevGames, appId]);
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
      {/* Permission Banner */}
      {!permissionsGranted && (
        <Card className="p-4 bg-neon-red/10 border-neon-red/20 flex items-center gap-4">
          <div className="p-2 rounded-xl bg-neon-red/20">
            <ShieldAlert size={20} className="text-neon-red" />
          </div>
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-widest">Permissions Required</h4>
            <p className="text-[10px] text-white/60">Allow system access for 100% optimization accuracy.</p>
          </div>
          <button 
            onClick={async () => {
              await DeviceService.requestPermissions();
              setPermissionsGranted(true);
            }}
            className="px-4 py-2 rounded-xl bg-neon-red text-white text-[10px] font-bold uppercase tracking-widest neon-glow-red"
          >
            Grant
          </button>
        </Card>
      )}

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
            onClick={() => setActiveTab('booster')}
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

  const renderCleaner = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-xl bg-white/5">
          <ArrowLeft size={20} className="text-neon-red" />
        </button>
        <h3 className="text-xl font-display font-bold text-white uppercase italic">Junk Cleaner</h3>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 bg-neon-red/20 blur-3xl rounded-full" 
          />
          <div className="w-48 h-48 rounded-full border-4 border-neon-red/40 flex items-center justify-center relative z-10">
            <div className="text-center">
              <span className="text-4xl font-display font-black text-white">2.4</span>
              <p className="text-xs uppercase tracking-widest text-white/40 font-bold">GB</p>
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-lg font-bold text-white uppercase tracking-tighter italic">Junk Files Detected</h4>
          <p className="text-xs text-white/40">Temporary files, cache, and residual data found.</p>
        </div>
      </div>

      <div className="space-y-3">
        {['System Cache', 'App Data', 'Residual Files', 'Ad Junk'].map(item => (
          <Card key={item} className="flex items-center justify-between p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-red" />
              <span className="text-sm font-bold text-white">{item}</span>
            </div>
            <span className="text-xs font-bold text-white/40">{(Math.random() * 800).toFixed(0)} MB</span>
          </Card>
        ))}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={async () => {
          setIsOptimizing(true);
          await DeviceService.cleanJunk();
          setIsOptimizing(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }}
        className="w-full py-4 rounded-2xl bg-neon-red text-white font-display font-bold uppercase tracking-widest neon-glow-red"
      >
        Clean Junk Now
      </motion.button>
    </div>
  );

  const renderBattery = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-xl bg-white/5">
          <ArrowLeft size={20} className="text-neon-green" />
        </button>
        <h3 className="text-xl font-display font-bold text-white uppercase italic">Battery Saver</h3>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-neon-green/20 blur-3xl rounded-full" />
          <div className="w-48 h-48 rounded-full border-4 border-neon-green/40 flex items-center justify-center relative z-10">
            <div className="text-center">
              <span className="text-4xl font-display font-black text-white">{batteryLevel}%</span>
              <p className="text-xs uppercase tracking-widest text-white/40 font-bold">{isCharging ? 'Charging' : 'Remaining'}</p>
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-lg font-bold text-white uppercase tracking-tighter italic">Power Optimization</h4>
          <p className="text-xs text-white/40">Extend your gaming sessions with smart power management.</p>
        </div>
      </div>

      <div className="space-y-3">
        <Toggle label="Ultra Power Saving" active={false} onToggle={() => {}} />
        <Toggle label="Background App Freeze" active={true} onToggle={() => {}} />
        <Toggle label="Brightness Auto-Adjust" active={true} onToggle={() => {}} />
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleOptimize}
        className="w-full py-4 rounded-2xl bg-neon-green text-bg-deep font-display font-bold uppercase tracking-widest neon-glow-green"
      >
        Optimize Battery
      </motion.button>
    </div>
  );

  const renderCooler = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="flex items-center gap-3">
        <button onClick={() => setActiveTab('dashboard')} className="p-2 rounded-xl bg-white/5">
          <ArrowLeft size={20} className="text-neon-cyan" />
        </button>
        <h3 className="text-xl font-display font-bold text-white uppercase italic">Phone Cooler</h3>
      </div>

      <div className="flex flex-col items-center justify-center py-12 space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute inset-0 bg-neon-cyan/20 blur-3xl rounded-full" 
          />
          <div className="w-48 h-48 rounded-full border-4 border-neon-cyan/40 flex items-center justify-center relative z-10">
            <div className="text-center">
              <span className="text-4xl font-display font-black text-white">{cpuTemp}°C</span>
              <p className="text-xs uppercase tracking-widest text-white/40 font-bold">CPU Temp</p>
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <h4 className="text-lg font-bold text-white uppercase tracking-tighter italic">Temperature Normal</h4>
          <p className="text-xs text-white/40">Closing background apps to reduce heat.</p>
        </div>
      </div>

      <div className="space-y-3">
        {['GPU Overclock Control', 'CPU Core Management', 'Fan Speed Simulation'].map(item => (
          <Card key={item} className="flex items-center justify-between p-4 border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-neon-cyan" />
              <span className="text-sm font-bold text-white">{item}</span>
            </div>
            <span className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Active</span>
          </Card>
        ))}
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={async () => {
          setIsOptimizing(true);
          await DeviceService.coolPhone();
          setCpuTemp(prev => prev - 2);
          setIsOptimizing(false);
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }}
        className="w-full py-4 rounded-2xl bg-neon-cyan text-bg-deep font-display font-bold uppercase tracking-widest neon-glow-cyan"
      >
        Cool Down Now
      </motion.button>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-display font-bold text-white uppercase italic">Game Store</h3>
        <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">{GAME_STORE.length} Games Available</span>
      </div>
      
      <div className="space-y-4">
        {GAME_STORE.map((game) => (
          <Card key={game.id} className="p-4 flex gap-4 items-center">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-3xl">
              {game.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h4 className="text-sm font-bold text-white truncate">{game.name}</h4>
                <div className="flex items-center gap-1 text-neon-orange">
                  <Star size={10} fill="currentColor" />
                  <span className="text-[10px] font-bold">{game.rating}</span>
                </div>
              </div>
              <p className="text-[10px] text-white/40 truncate mt-0.5">{game.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] text-white/60 font-bold uppercase tracking-tighter">{game.size}</span>
                <span className="w-1 h-1 rounded-full bg-white/10" />
                <span className="text-[10px] text-neon-cyan font-bold uppercase tracking-tighter">Action</span>
              </div>
            </div>
            <button 
              onClick={() => !installedGames.includes(game.id) && handleDownload(game.id)}
              disabled={downloadingApp === game.id || installedGames.includes(game.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300",
                installedGames.includes(game.id) 
                  ? "bg-neon-green/10 text-neon-green border border-neon-green/20" 
                  : downloadingApp === game.id 
                    ? "bg-white/5 text-white/40" 
                    : "bg-neon-cyan text-bg-deep neon-glow-cyan"
              )}
            >
              {installedGames.includes(game.id) ? "Installed" : downloadingApp === game.id ? `${Math.round(downloadProgress)}%` : "Install"}
            </button>
          </Card>
        ))}
      </div>

      <h3 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1 mt-6">Mini Apps</h3>
      <div className="grid grid-cols-2 gap-3">
        <Card onClick={() => setActiveTab('browser')} className="flex flex-col items-center gap-3 py-6 border border-white/5 hover:border-neon-cyan/20 transition-all">
          <Globe size={28} className="text-neon-cyan" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Fast Browser</span>
        </Card>
        <Card onClick={() => setActiveTab('social')} className="flex flex-col items-center gap-3 py-6 border border-white/5 hover:border-neon-orange/20 transition-all">
          <Users size={28} className="text-neon-orange" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Social Connect</span>
        </Card>
        <Card onClick={() => setActiveTab('music')} className="flex flex-col items-center gap-3 py-6 border border-white/5 hover:border-neon-green/20 transition-all">
          <MusicIcon size={28} className="text-neon-green" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Music Stream</span>
        </Card>
        <Card onClick={() => setActiveTab('squad')} className="flex flex-col items-center gap-3 py-6 border border-white/5 hover:border-neon-purple/20 transition-all">
          <UserPlus size={28} className="text-neon-purple" />
          <span className="text-[10px] font-bold uppercase tracking-widest">Squad Hub</span>
        </Card>
      </div>
    </div>
  );

  const renderBrowser = () => (
    <div className="h-full flex flex-col bg-bg-deep">
      <div className="p-4 border-b border-white/5 flex gap-2 bg-bg-deep/80 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex-1 h-10 bg-white/5 rounded-xl flex items-center px-4 gap-3 border border-white/10 focus-within:border-neon-cyan/40 transition-colors">
          <Globe size={16} className="text-neon-cyan" />
          <input 
            type="text" 
            placeholder="Search or enter URL" 
            value={browserUrl}
            onChange={(e) => setBrowserUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && window.open(browserUrl.startsWith('http') ? browserUrl : `https://www.google.com/search?q=${browserUrl}`, '_blank')}
            className="bg-transparent border-none outline-none text-xs text-white w-full"
          />
        </div>
        <button 
          onClick={() => window.open(browserUrl.startsWith('http') ? browserUrl : `https://www.google.com/search?q=${browserUrl}`, '_blank')}
          className="p-2 rounded-xl bg-neon-cyan text-bg-deep neon-glow-cyan"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-8">
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-neon-cyan/10 blur-3xl rounded-full" 
          />
          <Globe size={80} className="text-neon-cyan relative z-10" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">Fast Browser</h3>
          <p className="text-sm text-white/40">Ultra-fast, low-latency browsing optimized for pro gamers.</p>
        </div>
        
        <div className="w-full max-w-sm grid grid-cols-3 gap-4">
          {[
            { name: 'Google', icon: <Search size={16} />, url: 'https://www.google.com' },
            { name: 'YouTube', icon: <Play size={16} />, url: 'https://www.youtube.com' },
            { name: 'Twitch', icon: <Activity size={16} />, url: 'https://www.twitch.tv' },
            { name: 'Discord', icon: <MessageSquare size={16} />, url: 'https://www.discord.com' },
            { name: 'Reddit', icon: <Globe size={16} />, url: 'https://www.reddit.com' },
            { name: 'Wiki', icon: <Newspaper size={16} />, url: 'https://www.wikipedia.org' },
          ].map(site => (
            <button 
              key={site.name} 
              onClick={() => window.open(site.url, '_blank')}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-neon-cyan/20 hover:bg-white/10 transition-all group"
            >
              <div className="text-white/40 group-hover:text-neon-cyan transition-colors">{site.icon}</div>
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">{site.name}</span>
            </button>
          ))}
        </div>

        <div className="pt-8 flex items-center gap-4 text-[10px] text-white/20 uppercase tracking-[0.3em] font-bold">
          <Shield size={12} /> Secure Browsing Active
        </div>
      </div>
    </div>
  );

  const renderSquad = () => (
    <div className="space-y-6 p-6 pb-32">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-display font-bold text-white uppercase italic">Squad & Friends</h3>
        <Users size={20} className="text-neon-purple" />
      </div>

      <div className="space-y-4">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="tel" 
              placeholder="Search by phone number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white outline-none focus:border-neon-purple/40 transition-colors"
            />
          </div>
          <button 
            onClick={handleSearchUsers}
            className="p-3 rounded-2xl bg-neon-purple text-white neon-glow-purple"
          >
            <Search size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">Search Results</h4>
          {contacts.length === 0 ? (
            <div className="p-8 text-center text-xs text-white/20 italic border border-dashed border-white/5 rounded-2xl">
              Enter a phone number to find other gamers
            </div>
          ) : (
            contacts.map(contact => (
              <Card key={contact.uid} className="flex items-center gap-4 p-4 border border-white/5">
                <img src={contact.photoURL} alt={contact.displayName} className="w-12 h-12 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                <div className="flex-1">
                  <h4 className="text-sm font-bold text-white">{contact.displayName}</h4>
                  <p className="text-[10px] text-white/40 truncate">{contact.status || 'Gaming...'}</p>
                </div>
                <button 
                  onClick={() => {
                    createChatRoom(contact);
                    setActiveTab('social');
                  }}
                  className="p-2 rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20"
                >
                  <MessageSquare size={18} />
                </button>
              </Card>
            ))
          )}
        </div>

        <div className="space-y-3 pt-4">
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold ml-1">Gaming Groups</h4>
          <Card className="flex items-center gap-4 p-4 border border-white/5 opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan">
              <Users size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Free Fire Pro Squad</h4>
              <p className="text-[10px] text-white/40">1,240 Members • 45 Online</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest">Join</button>
          </Card>
          <Card className="flex items-center gap-4 p-4 border border-white/5 opacity-50">
            <div className="w-12 h-12 rounded-2xl bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple">
              <Target size={24} />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-white">Sniper Elite Hub</h4>
              <p className="text-[10px] text-white/40">850 Members • 12 Online</p>
            </div>
            <button className="px-4 py-2 rounded-xl bg-white/5 text-[10px] font-bold uppercase tracking-widest">Join</button>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderMusic = () => (
    <div className="h-full flex flex-col bg-bg-deep p-6 pb-32 space-y-8">
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        <motion.div 
          animate={{ rotate: isPlaying ? 360 : 0 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="relative w-64 h-64 rounded-full p-1 bg-gradient-to-br from-neon-cyan via-neon-purple to-neon-cyan shadow-[0_0_50px_rgba(0,245,255,0.2)]"
        >
          <div className="w-full h-full rounded-full bg-bg-deep flex items-center justify-center overflow-hidden border-8 border-bg-deep">
            <img 
              src={`https://picsum.photos/seed/${currentTrack?.id || 'music'}/400/400`} 
              alt="Album Art" 
              className="w-full h-full object-cover opacity-60"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-bg-deep border-4 border-white/10" />
            </div>
          </div>
        </motion.div>

        <div className="text-center space-y-2">
          <h3 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">
            {currentTrack?.name || 'Select a Track'}
          </h3>
          <p className="text-sm text-neon-cyan font-bold uppercase tracking-widest">
            {currentTrack?.artist || 'No Artist'}
          </p>
        </div>

        <div className="w-full max-w-xs space-y-4">
          <div className="flex items-center justify-between gap-6">
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipBack size={28} />
            </button>
            <button 
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-neon-cyan text-bg-deep flex items-center justify-center neon-glow-cyan transition-transform active:scale-90"
            >
              {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
            </button>
            <button className="text-white/40 hover:text-white transition-colors">
              <SkipForward size={28} />
            </button>
          </div>
          <div className="space-y-2">
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                animate={{ width: isPlaying ? '100%' : '0%' }}
                transition={{ duration: 180, ease: "linear" }}
                className="h-full bg-neon-cyan"
              />
            </div>
            <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest">
              <span>0:45</span>
              <span>3:20</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Playlist</h4>
          <button className="p-2 rounded-xl bg-white/5 text-neon-cyan">
            <Plus size={16} />
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
          {musicList.map(track => (
            <button 
              key={track.id}
              onClick={() => { setCurrentTrack(track); setIsPlaying(true); }}
              className={cn(
                "w-full p-3 rounded-xl flex items-center gap-4 transition-all duration-300",
                currentTrack?.id === track.id ? "bg-neon-cyan/10 border border-neon-cyan/20" : "bg-white/5 border border-transparent hover:bg-white/10"
              )}
            >
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">
                <MusicIcon size={16} className={currentTrack?.id === track.id ? "text-neon-cyan" : "text-white/40"} />
              </div>
              <div className="flex-1 text-left">
                <h5 className={cn("text-xs font-bold", currentTrack?.id === track.id ? "text-neon-cyan" : "text-white")}>{track.name}</h5>
                <p className="text-[10px] text-white/40 uppercase tracking-widest">{track.artist}</p>
              </div>
              {currentTrack?.id === track.id && isPlaying && (
                <div className="flex gap-0.5 items-end h-3">
                  {[1, 2, 3].map(i => (
                    <motion.div 
                      key={i}
                      animate={{ height: [4, 12, 4] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                      className="w-0.5 bg-neon-cyan"
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <audio ref={audioRef} src={currentTrack?.url} loop />
    </div>
  );

  const renderSocial = () => {
    if (!user) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-8 space-y-8 bg-bg-deep">
          <div className="relative">
            <div className="absolute inset-0 bg-neon-purple/20 blur-3xl rounded-full" />
            <div className="w-24 h-24 rounded-3xl bg-neon-purple/10 border-2 border-neon-purple flex items-center justify-center neon-glow-purple">
              <MessageSquare size={48} className="text-neon-purple" />
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-display font-bold text-white uppercase italic tracking-tighter">Social Connect</h3>
            <p className="text-sm text-white/40">Connect with pro gamers worldwide. Login with your phone number to start chatting.</p>
          </div>

          <div className="w-full max-w-xs space-y-4">
            {!isOtpSent ? (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Phone Number</label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="tel" 
                      placeholder="+94 77 123 4567" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-neon-purple/40 transition-colors"
                    />
                  </div>
                </div>
                <div id="recaptcha-container"></div>
                <button 
                  onClick={handlePhoneLogin}
                  disabled={!phoneNumber}
                  className="w-full py-4 rounded-2xl bg-neon-purple text-white font-bold uppercase tracking-widest neon-glow-purple disabled:opacity-50 disabled:neon-glow-none transition-all active:scale-95"
                >
                  Send Verification Code
                </button>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-white/40 font-bold ml-1">Verification Code</label>
                  <div className="relative">
                    <ShieldCheck size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <input 
                      type="text" 
                      placeholder="Enter 6-digit code" 
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white outline-none focus:border-neon-purple/40 transition-colors"
                    />
                  </div>
                </div>
                <button 
                  onClick={handleVerifyOtp}
                  disabled={!otp || isVerifying}
                  className="w-full py-4 rounded-2xl bg-neon-purple text-white font-bold uppercase tracking-widest neon-glow-purple disabled:opacity-50 transition-all active:scale-95"
                >
                  {isVerifying ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Login"}
                </button>
                <button 
                  onClick={() => setIsOtpSent(false)}
                  className="w-full text-[10px] text-white/40 uppercase tracking-widest font-bold hover:text-white transition-colors"
                >
                  Change Phone Number
                </button>
              </>
            )}
          </div>

          <div className="pt-8">
            <button 
              onClick={handleSignIn}
              className="flex items-center gap-2 text-[10px] text-white/40 uppercase tracking-widest font-bold hover:text-white transition-colors"
            >
              <Globe size={14} /> Or Sign in with Google
            </button>
          </div>
        </div>
      );
    }

    if (activeChatRoom) {
      return (
        <div className="h-full flex flex-col bg-bg-deep">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-bg-deep/80 backdrop-blur-xl sticky top-0 z-10">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveChatRoom(null)} className="p-2 rounded-xl bg-white/5">
                <ArrowLeft size={20} className="text-neon-purple" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neon-purple/20 border border-neon-purple/40 flex items-center justify-center text-neon-purple font-bold">
                  {activeChatRoom.name[0]}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{activeChatRoom.name}</h4>
                  <p className="text-[10px] text-neon-green font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
            </div>
            <button className="p-2 rounded-xl bg-white/5 text-white/40">
              <MoreVertical size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-3", msg.senderId === user.uid ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "max-w-[75%] p-3 rounded-2xl text-xs relative",
                  msg.senderId === user.uid 
                    ? "bg-neon-purple text-white rounded-br-none" 
                    : "bg-white/5 text-white/80 rounded-bl-none border border-white/5"
                )}>
                  {msg.senderId !== user.uid && <p className="text-[10px] font-bold text-neon-purple mb-1">{msg.senderName}</p>}
                  <p className="leading-relaxed">{msg.text}</p>
                  <p className="text-[8px] opacity-40 mt-1 text-right">
                    {msg.timestamp ? new Date(msg.timestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-bg-deep/80 backdrop-blur-xl border-t border-white/5 flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs text-white outline-none focus:border-neon-purple/40 transition-colors"
            />
            <button 
              type="submit"
              disabled={!chatInput.trim()}
              className="p-3 rounded-xl bg-neon-purple text-white neon-glow-purple disabled:opacity-50 disabled:neon-glow-none"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col bg-bg-deep">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-white uppercase italic">Social Connect</h3>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab('squad')} className="p-2 rounded-xl bg-white/5 text-neon-purple">
                <UserPlus size={20} />
              </button>
              <button className="p-2 rounded-xl bg-white/5 text-white/40">
                <Settings size={20} />
              </button>
            </div>
          </div>

          <div className="flex border-b border-white/5">
            {['Chats', 'Status', 'Calls'].map(tab => (
              <button 
                key={tab}
                className={cn(
                  "flex-1 py-3 text-[10px] font-bold uppercase tracking-widest transition-all relative",
                  tab === 'Chats' ? "text-neon-purple" : "text-white/40"
                )}
              >
                {tab}
                {tab === 'Chats' && <motion.div layoutId="social-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-neon-purple" />}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
            <input 
              type="text" 
              placeholder="Search chats..." 
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-xs text-white outline-none focus:border-neon-purple/40 transition-colors"
            />
          </div>

          <div className="space-y-2">
            {chatRooms.length === 0 ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
                  <MessageSquare size={24} className="text-white/20" />
                </div>
                <p className="text-sm text-white/40">No active chats. Start a new conversation!</p>
                <button 
                  onClick={() => setActiveTab('squad')}
                  className="px-6 py-2 rounded-xl bg-neon-purple/10 text-neon-purple font-bold uppercase text-[10px] tracking-widest border border-neon-purple/20"
                >
                  Find Friends
                </button>
              </div>
            ) : (
              chatRooms.map(room => (
                <Card key={room.id} onClick={() => setActiveChatRoom(room)} className="flex items-center gap-4 p-4 border border-white/5 hover:border-neon-purple/20 transition-all">
                  <div className="w-12 h-12 rounded-full bg-neon-purple/10 border border-neon-purple/20 flex items-center justify-center text-neon-purple font-bold text-lg">
                    {room.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-sm font-bold text-white truncate">{room.name}</h4>
                      <span className="text-[8px] text-white/20 uppercase font-bold">
                        {room.lastTimestamp ? new Date(room.lastTimestamp.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate mt-0.5">{room.lastMessage || 'No messages yet'}</p>
                  </div>
                  <ChevronRight size={16} className="text-white/10" />
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

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
              title={
                activeTab === 'dashboard' ? 'Ultra Optimize X' : 
                activeTab === 'apps' ? 'Game Store' :
                activeTab === 'social' ? 'Social Connect' :
                activeTab === 'music' ? 'Music Stream' :
                activeTab === 'news' ? 'Game News' :
                activeTab.toUpperCase()
              } 
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
                  {activeTab === 'music' && renderMusic()}
                  {activeTab === 'social' && renderSocial()}
                  {activeTab === 'squad' && renderSquad()}
                  {activeTab === 'settings' && renderSettings()}
                  {activeTab === 'cleaner' && renderCleaner()}
                  {activeTab === 'battery' && renderBattery()}
                  {activeTab === 'cooler' && renderCooler()}
                  {activeTab === 'booster' && (
                    <div className="flex flex-col items-center justify-center h-[70vh] p-6 text-center space-y-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-neon-cyan/20 blur-3xl animate-pulse" />
                        <div className="w-48 h-48 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                          <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full border-t-2 border-neon-cyan"
                          />
                          <Zap size={64} className="text-neon-cyan" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h2 className="text-2xl font-display font-bold uppercase tracking-widest">System Boost</h2>
                        <p className="text-sm text-white/40">Optimizing system resources for peak performance</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleOptimize}
                        className="px-12 py-4 rounded-2xl bg-neon-cyan text-bg-deep font-bold uppercase tracking-widest text-xs neon-glow-cyan"
                      >
                        Start Boost
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
                <NavButton icon={Gamepad2} active={activeTab === 'apps'} onClick={() => setActiveTab('apps')} />
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
                <NavButton icon={MessageSquare} active={activeTab === 'social'} onClick={() => setActiveTab('social')} />
                <NavButton icon={MusicIcon} active={activeTab === 'music'} onClick={() => setActiveTab('music')} />
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </ErrorBoundary>
  );
}
