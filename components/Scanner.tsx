import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Loader2, AlertTriangle, Leaf, RefreshCw, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeWasteImage } from '../services/geminiService';
import { ScanResult, WasteCategory } from '../types';

interface ScannerProps {
  onScanComplete: (result: ScanResult, imageData?: string) => void;
  onRequestPickup: (wasteType: WasteCategory, address: string, imageUrl?: string) => void;
  setEcoPoints?: React.Dispatch<React.SetStateAction<number>>;
}

export const Scanner: React.FC<ScannerProps> = ({ onScanComplete, onRequestPickup, setEcoPoints }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [status, setStatus] = useState<'idle' | 'result' | 'searching' | 'assigned'>('idle');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [pointsGained, setPointsGained] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera on mount or when preview is cleared
  useEffect(() => {
    if (!preview && !isAnalyzing && status === 'idle') {
      startCamera();
    }
    return () => stopCamera();
  }, [preview, isAnalyzing, status]);

  const startCamera = async () => {
    try {
      stopCamera(); // Ensure any existing stream is stopped
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setHasCameraPermission(true);
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setHasCameraPermission(false);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg');
        setPreview(imageData);
        stopCamera();
        handleAnalysis(imageData);
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result as string;
      setPreview(imageData);
      stopCamera();
      handleAnalysis(imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleAnalysis = async (imageData: string) => {
    setError(null);
    setResult(null);
    setIsAnalyzing(true);
    setStatus('idle');

    try {
      const data = await analyzeWasteImage(imageData);
      const pointsEarned = Math.floor(Math.random() * 40) + 20;
      data.ecoPoints = pointsEarned;
      setResult(data);
      setStatus('result');
      
      if (setEcoPoints) {
        setEcoPoints(prev => prev + pointsEarned);
      }
      setPointsGained(pointsEarned);
      setTimeout(() => setPointsGained(0), 2000);
      
      onScanComplete(data, imageData);
    } catch (err: any) {
      console.error("Analysis error:", err);
      // Fallback on error
      const pointsEarned = Math.floor(Math.random() * 40) + 20;
      const fallbackResult: ScanResult = {
        wasteType: "Plastic Container",
        category: WasteCategory.Plastic,
        confidence: 0.85,
        disposalTip: "Rinse and place in the blue recycling bin.",
        isHazardous: false,
        ecoPoints: pointsEarned
      };
      setResult(fallbackResult);
      setStatus('result');
      setError("AI analysis failed. Using fallback identification.");
      
      if (setEcoPoints) {
        setEcoPoints(prev => prev + pointsEarned);
      }
      setPointsGained(pointsEarned);
      setTimeout(() => setPointsGained(0), 2000);
      
      onScanComplete(fallbackResult, imageData);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRequestPickup = () => {
    if (result) {
      onRequestPickup(result.category, "Current Location", preview || undefined);
    }
    setStatus('searching');
    setTimeout(() => {
      setStatus('assigned');
    }, 2000);
  };

  const handleReset = () => {
    setPreview(null);
    setResult(null);
    setError(null);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
    startCamera();
  };

  const getCategoryColor = (category: WasteCategory) => {
    switch (category) {
      case WasteCategory.Plastic: return 'bg-blue-100 text-blue-800 border-blue-200';
      case WasteCategory.Metal: return 'bg-gray-100 text-gray-800 border-gray-200';
      case WasteCategory.Glass: return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case WasteCategory.Paper: return 'bg-amber-100 text-amber-800 border-amber-200';
      case WasteCategory.Organic: return 'bg-green-100 text-green-800 border-green-200';
      case WasteCategory.EWaste: return 'bg-purple-100 text-purple-800 border-purple-200';
      case WasteCategory.Hazardous: return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      <AnimatePresence>
        {pointsGained > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: -50, scale: 1.2 }}
            exit={{ opacity: 0, y: -100 }}
            className="absolute z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-emerald-500 font-black text-4xl drop-shadow-lg"
          >
            +{pointsGained} pts
          </motion.div>
        )}
      </AnimatePresence>
      <div className="px-5 pt-6 pb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">GreenLens Scanner</h2>
        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <Zap size={14} className="text-emerald-600 fill-emerald-600" />
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">AI Powered</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-5 pb-8 overflow-y-auto no-scrollbar">
        <AnimatePresence mode="wait">
          {!preview && !isAnalyzing && status === 'idle' && (
            <motion.div 
              key="camera-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="relative flex-1 min-h-[400px] bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-emerald-500/20">
                {hasCameraPermission === false ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gray-900 text-white">
                    <AlertTriangle size={48} className="text-amber-500 mb-4" />
                    <h3 className="text-lg font-bold mb-2">Camera Access Denied</h3>
                    <p className="text-gray-400 text-sm mb-6">Please enable camera permissions in your browser settings to use the real-time scanner.</p>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center"
                    >
                      <Upload size={18} className="mr-2" />
                      Upload from Gallery
                    </button>
                  </div>
                ) : (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Overlay */}
                    <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                      <div className="w-full h-full border-2 border-emerald-400/50 rounded-2xl relative">
                        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />
                        
                        {/* Scanning Line Animation */}
                        <motion.div 
                          animate={{ top: ['10%', '90%', '10%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          className="absolute left-0 right-0 h-0.5 bg-emerald-400/50 shadow-[0_0_15px_rgba(52,211,153,0.8)]"
                        />
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center space-x-8 px-6">
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/30 transition-all"
                      >
                        <Upload size={24} />
                      </button>
                      
                      <button 
                        onClick={capturePhoto}
                        className="w-20 h-20 bg-white rounded-full p-1 shadow-xl active:scale-90 transition-transform"
                      >
                        <div className="w-full h-full rounded-full border-4 border-emerald-500 flex items-center justify-center">
                          <div className="w-14 h-14 bg-emerald-500 rounded-full" />
                        </div>
                      </button>
                      
                      <button 
                        onClick={startCamera}
                        className="bg-white/20 backdrop-blur-md text-white p-4 rounded-full hover:bg-white/30 transition-all"
                      >
                        <RefreshCw size={24} />
                      </button>
                    </div>
                  </>
                )}
              </div>
              <p className="text-center text-gray-500 text-sm mt-4 font-medium italic">
                Point your camera at any waste item to identify it
              </p>
            </motion.div>
          )}

          {isAnalyzing && (
            <motion.div 
              key="analyzing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center text-center p-8"
            >
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                <div className="relative bg-emerald-100 p-8 rounded-full text-emerald-600">
                  <Loader2 size={64} className="animate-spin" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Waste...</h3>
              <p className="text-gray-500 max-w-xs">Our GreenLens AI is identifying the material and calculating eco-impact.</p>
              
              <div className="mt-12 w-full max-w-xs bg-gray-100 h-2 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="h-full bg-emerald-500"
                />
              </div>
            </motion.div>
          )}

          {preview && !isAnalyzing && result && (
            <motion.div 
              key="result-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3] mb-6 border-4 border-white">
                <img src={preview} alt="Captured waste" className="w-full h-full object-cover" />
                <button 
                  onClick={handleReset}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-all"
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="mb-4 bg-amber-50 border border-amber-100 p-3 rounded-xl text-amber-800 text-xs flex items-center">
                  <AlertTriangle className="mr-2 flex-shrink-0" size={14} />
                  <p>{error}</p>
                </div>
              )}

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 space-y-6">
                {status === 'result' && (
                  <>
                    <div className="flex items-start justify-between">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-2 ${getCategoryColor(result.category)}`}>
                          {result.category}
                        </span>
                        <h3 className="text-3xl font-black text-gray-900 leading-tight">{result.wasteType}</h3>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                        <Leaf className="text-emerald-600" size={28} />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Confidence</p>
                        <p className="text-xl font-black text-gray-900">{(result.confidence * 100).toFixed(0)}%</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Eco Points</p>
                        <p className="text-xl font-black text-emerald-600">+{result.ecoPoints || 25}</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3 mt-0.5">
                        <RefreshCw size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-blue-800 mb-0.5">Disposal Tip</p>
                        <p className="text-sm text-blue-700 leading-relaxed">{result.disposalTip}</p>
                      </div>
                    </div>

                    <button 
                      onClick={handleRequestPickup}
                      className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-[0.98] transition-all"
                    >
                      Request Pickup
                    </button>
                  </>
                )}

                {status === 'searching' && (
                  <div className="text-center py-12">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" />
                      <Loader2 size={56} className="text-emerald-500 animate-spin relative" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Finding Nearby Driver...</h3>
                    <p className="text-gray-500 text-sm">Optimizing route for eco-friendly collection</p>
                  </div>
                )}

                {status === 'assigned' && (
                  <div className="text-center py-6 space-y-6">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto rotate-3">
                      <Check size={40} strokeWidth={3} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-gray-900 mb-1">Pickup Confirmed!</h3>
                      <p className="text-gray-500 text-sm font-medium">Driver Rahul is on the way</p>
                    </div>
                    
                    <div className="bg-gray-50 p-5 rounded-2xl text-left border border-gray-100 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Estimated Arrival</span>
                        <span className="text-sm font-black text-emerald-600">8 - 12 mins</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vehicle</span>
                        <span className="text-sm font-black text-gray-900">Eco-Truck #42</span>
                      </div>
                    </div>

                    <button 
                      onClick={handleReset}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all"
                    >
                      Return to Scanner
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};
