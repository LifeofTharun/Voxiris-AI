/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, Mic, MicOff, Send, Upload, Sparkles, RefreshCw, 
  Layers, Cpu, Activity, Info, X, Zap, ArrowRight, HelpCircle, 
  Trash2, Sliders, Volume2, ShieldAlert
} from "lucide-react";
import DbViewer from "./components/DbViewer";
import MathMatrix from "./components/MathMatrix";
import AudioPlayer from "./components/AudioPlayer";
import { Product, RecommendationResponse } from "./types";

export default function App() {
  // Application file states
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  
  // Audio recordings
  const [recordedAudioFile, setRecordedAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  
  // Direct criteria fallback text query
  const [textQuery, setTextQuery] = useState("");
  
  // Hardware toggles
  const [isStreamingCamera, setIsStreamingCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  // Endpoint loading state
  const [pipelineLoading, setPipelineLoading] = useState(false);
  const [pipelineResponse, setPipelineResponse] = useState<RecommendationResponse | null>(null);
  const [pipelineError, setPipelineError] = useState<{ title: string; message: string; advice: string[]; type: 'warning' | 'error' | 'missing_inputs' } | null>(null);
  
  // Selection drawer
  const [selectedProductPreviewId, setSelectedProductPreviewId] = useState<string | undefined>(undefined);

  // Platform server state monitoring
  const [serverStatus, setServerStatus] = useState<{ online: boolean; geminiKeyBound: boolean } | null>(null);
  
  // DOM References
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Ping back server on first load to verify integration state
  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => {
        setServerStatus({
          online: data.status === "online",
          geminiKeyBound: data.geminiKeyBound
        });
      })
      .catch((err) => {
        console.error("Platform healthcheck failed to connect:", err);
        setServerStatus({ online: false, geminiKeyBound: false });
      });
  }, []);

  // Audio timer trigger loops
  useEffect(() => {
    if (isRecordingAudio) {
      setRecordingDuration(0);
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
        durationIntervalRef.current = null;
      }
    }
    return () => {
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    };
  }, [isRecordingAudio]);

  // Clean stream on toggles or unmount
  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Handle static file selection dialog
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProductPreviewId(undefined); // Reset pre-selected DB stock links
      setUploadedImage(file);
      const url = URL.createObjectURL(file);
      setImagePreviewUrl(url);
    }
  };

  // Convert Unsplash assets dynamically into binary File streams for precise backend parsing
  const selectProductAsReference = async (product: Product) => {
    setSelectedProductPreviewId(product.id);
    setImagePreviewUrl(product.imageUrl);
    setUploadedImage(null); // Reset manually uploaded image
    
    // Auto-prompt details matching clothes configuration criteria
    const defaultQueries = [
      `Show me matching trousers under 2000 rupees to styling coordination with this ${product.name}`,
      `Identify this ${product.name} and recommend matching shoes under 2500 rupees`,
      `Recommend a formal jacket or blazer under 4000 rupees for this style profile`
    ];
    // Randomize or select recommendation queries for variety
    const querySeed = product.category === "Trousers" ? defaultQueries[1] : defaultQueries[0];
    setTextQuery(querySeed);

    try {
      setPipelineLoading(true);
      const response = await fetch(product.imageUrl);
      const blob = await response.blob();
      const refFile = new File([blob], `ref_${product.id}.jpg`, { type: "image/jpeg" });
      setUploadedImage(refFile);
    } catch (err) {
      console.warn("Reference fetching CORS restriction. Resorting to filename query mapping.", err);
    } finally {
      setPipelineLoading(false);
    }
  };

  // Turn on device live video lenses
  const startCameraStream = async () => {
    setCameraError(null);
    setIsStreamingCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: "user" }
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Lenses stream activation failed:", err);
      setCameraError("Camera access rejected. Verify device browser lens permissions.");
      setIsStreamingCamera(false);
    }
  };

  // Shutdown running video streams
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsStreamingCamera(false);
  };

  // Snaps frame from flowing coordinate stream
  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
          if (blob) {
            const snapFile = new File([blob], "lens_capture.jpg", { type: "image/jpeg" });
            setSelectedProductPreviewId(undefined);
            setUploadedImage(snapFile);
            setImagePreviewUrl(URL.createObjectURL(blob));
          }
        }, "image/jpeg", 0.9);
      }
      stopCameraStream();
    } catch (err) {
      console.error("Webcam snapshot write failed:", err);
      setCameraError("Snapshot process failed.");
    }
  };

  // Activates voice digitization recorder
  const startMicRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const voiceFile = new File([audioBlob], "audiotransfer.webm", { type: "audio/webm" });
        setRecordedAudioFile(voiceFile);
        setAudioPreviewUrl(URL.createObjectURL(audioBlob));
        
        // Clear active recording track streams safely
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingAudio(true);
    } catch (err: any) {
      console.error("Microphone hardware failed to initialize:", err);
      setMicError("Microphone block detected. Use text search prompt instead.");
    }
  };

  // Halt voice records
  const stopMicRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  // Delete records
  const resetAudioRecord = () => {
    setRecordedAudioFile(null);
    setAudioPreviewUrl(null);
  };

  // Remove uploaded/captured references
  const clearUploadedImage = () => {
    setUploadedImage(null);
    setImagePreviewUrl(null);
    setSelectedProductPreviewId(undefined);
  };

  // Process the multimodal server pipeline inference
  const executePipelineInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setPipelineError(null); // Clear previous errors

    if (!uploadedImage && !textQuery) {
      setPipelineError({
        title: "Input Context Missing",
        message: "The recommendation engine needs visual or textual reference tags in order to execute cosine scoring loops.",
        advice: [
          "Choose any card inside the 'Stock Database' list on the right to instantly load a reference style profile.",
          "Click 'Browse Apparel' to upload a locally saved clothing image (jpg, png).",
          "Click 'Use Lens' to stream input from your device's web camera.",
          "Directly enter instructions into the manual prompt text input field (e.g., 'Recommend trousers under 2000 rupees')."
        ],
        type: "missing_inputs"
      });
      return;
    }

    setPipelineLoading(true);
    setPipelineResponse(null);

    try {
      const payload = new FormData();
      
      // Inject apparel reference image binary
      if (uploadedImage) {
        payload.append("image", uploadedImage);
      }
      
      // Inject microphone voice file stream
      if (recordedAudioFile) {
        payload.append("audio", recordedAudioFile);
      }

      // Inject criteria descriptors instructions
      payload.append("textQuery", textQuery);

      const res = await fetch("/api/voxiris/recommend", {
        method: "POST",
        body: payload
      });

      if (!res.ok) {
        let errorMsg = `Server reported state exception Code ${res.status} (${res.statusText})`;
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errorMsg = errData.error;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const parsedOutcome: RecommendationResponse = await res.json();
      
      if (!parsedOutcome.recommendations || parsedOutcome.recommendations.length === 0) {
        setPipelineError({
          title: "Zero Matching Products Found",
          message: "Calculations ran successfully, but no clothing items were found matching your filters.",
          advice: [
            "Increase your pricing filter budget (e.g., raise limits from 'under 2000' to an option with greater span).",
            "Simplify custom styling tags or try alternative fabric styles description keywords.",
            "Select other products from the Stock Database to run scoring across alternative categories."
          ],
          type: "warning"
        });
      }
      
      setPipelineResponse(parsedOutcome);
    } catch (err: any) {
      console.error("Multi-modal inference pipeline crashed:", err);
      const isMissingKey = err.message.toLowerCase().includes("key") || err.message.toLowerCase().includes("gemini");
      
      setPipelineError({
        title: "Calculations Disrupted",
        message: err.message || "An unexpected error occurred during the multi-modal recommendation analysis.",
        advice: [
          "Check whether your internet connection is active.",
          isMissingKey 
            ? "Ensure your 'GEMINI_API_KEY' environment variable is correctly configured in your project settings." 
            : "Ensure that local server ports and proxy layers are functioning correctly.",
          "Clear the workbench and load a default Stock Database profile to isolate configuration issues."
        ],
        type: "error"
      });
    } finally {
      setPipelineLoading(false);
    }
  };

  const handleReset = () => {
    setPipelineResponse(null);
    setPipelineError(null);
    clearUploadedImage();
    resetAudioRecord();
    setTextQuery("");
  };

  // Format recording times neatly
  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1a1a1a] pb-16 font-sans selection:bg-black selection:text-white" id="main-app-container">
      
      {/* Dynamic Header Frame */}
      <header className="border-b-2 border-black bg-white sticky top-0 z-50 py-4 px-4 sm:px-6" id="global-header">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Branded Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-black bg-black flex items-center justify-center text-white font-bold relative overflow-hidden animate-pulse" id="app-logo-badge">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black tracking-tighter text-black uppercase flex items-center gap-2" id="app-header-title">
                VoxIris AI <span className="text-[10px] font-mono px-2 py-0.5 tracking-normal font-bold bg-black text-white">V1.0.4-STABLE</span>
              </h1>
              <p className="text-xs uppercase tracking-widest opacity-60 font-mono text-zinc-600 mt-0.5">Multi-Modal Recommendation Ecosystem & Cosine Similarity Engine</p>
            </div>
          </div>

          {/* Connected environment monitors */}
          <div className="flex items-center gap-3" id="system-dashboard-pills">
            {/* Status indicators */}
            <div className="flex items-center gap-2 bg-white border-2 border-black px-3 py-1 font-mono text-[10px] font-bold text-black" id="server-status-pill">
              <span className={`inline-block w-2.5 h-2.5 rounded-full ${serverStatus?.online !== false ? "bg-emerald-600" : "bg-red-600"} animate-ping`} />
              <span>SERVER: {serverStatus?.online !== false ? "LOCALLY ACTIVE" : "OFFLINE"}</span>
            </div>

            <div className={`flex items-center gap-1.5 bg-white border-2 border-black px-3 py-1 font-mono text-[10px] font-bold ${
              serverStatus?.geminiKeyBound ? "text-emerald-700" : "text-amber-700"
            }`} id="api-status-pill">
              <Zap className="w-3 h-3 text-current fill-current" />
              <span>{serverStatus?.geminiKeyBound ? "GEMINI SECURE" : "SIMULATION ACTIVE"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Sandbox Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8" id="workbench-layout">
        
        {/* Left column: Workbench Input Control center */}
        <div className="lg:col-span-8 space-y-8" id="control-workspace-column">
          
          <form onSubmit={executePipelineInference} className="bg-white border-2 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-6" id="inference-input-card">
            <div className="border-b-2 border-black pb-4">
              <h2 className="text-md font-display font-bold text-black uppercase tracking-tight flex items-center gap-2">
                <Activity className="text-black w-5 h-5 animate-pulse" />
                Multi-Modal Aggregation Workbench
              </h2>
              <p className="text-xs text-zinc-600 mt-1">Capture reference apparel images and record design directives to build your vector search criteria.</p>
            </div>

            {/* Stage 1: Iris Computer Vision upload/snap panel */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-black text-black uppercase tracking-widest border-l-2 border-black pl-2" id="vision-stage-label">
                Stage 1 — Iris Computer Vision (Outfit Reference)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="vision-uploader-blocks">
                
                {/* Upload Workspace Box */}
                <div className={`border-2 border-dashed p-6 flex flex-col items-center justify-center text-center transition-all min-h-[220px] ${
                  imagePreviewUrl 
                    ? "border-black bg-zinc-50" 
                    : "border-zinc-300 hover:border-black hover:bg-zinc-50/50"
                }`} id="vision-photo-dropper">
                  
                  {isStreamingCamera ? (
                    /* Streaming webcam viewport */
                    <div className="w-full h-full flex flex-col justify-between" id="video-lens-active">
                      <div className="relative border border-black bg-black aspect-video max-h-[150px] overflow-hidden">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover" 
                          id="lens-stream"
                        />
                        <span className="absolute left-2 top-2 px-1.5 py-0.5 bg-black text-[9px] font-mono text-white animate-pulse">
                          LIVE LENS FEED
                        </span>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={captureCameraFrame}
                          className="flex-grow py-2 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase border-2 border-black"
                          id="btn-lens-capture"
                        >
                          Snap Frame Capture
                        </button>
                        <button
                          type="button"
                          onClick={stopCameraStream}
                          className="px-3 py-2 bg-white text-black text-xs font-mono font-bold uppercase border-2 border-black hover:bg-zinc-50"
                          id="btn-lens-abort"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : imagePreviewUrl ? (
                    /* Uploaded image render */
                    <div className="relative w-full h-full flex flex-col items-center justify-center" id="photo-rendered-space">
                      <div className="relative w-36 h-36 border-2 border-black bg-zinc-200" id="crop-photo-preview">
                        <img 
                          src={imagePreviewUrl} 
                          alt="Wardrobe snapshot" 
                          className="w-full h-full object-cover grayscale-25"
                          referrerPolicy="no-referrer"
                          id="photo-preview"
                        />
                        <button
                          type="button"
                          onClick={clearUploadedImage}
                          className="absolute right-1 top-1 bg-black hover:bg-zinc-800 text-white p-1 border border-black shadow-md transition-all"
                          title="Purge apparel asset"
                          id="btn-photo-purge"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[10px] font-mono text-black font-bold mt-2 uppercase tracking-wide truncate max-w-[200px]" id="photo-filename">
                        {selectedProductPreviewId ? "Preloaded Stock Model" : uploadedImage?.name || "CapturesSnap.jpg"}
                      </span>
                    </div>
                  ) : (
                    /* Default Drag space */
                    <div className="space-y-4" id="photo-default-landing">
                      <div className="w-12 h-12 border-2 border-black bg-white flex items-center justify-center text-black mx-auto" id="uploader-icon-box">
                        <Upload className="w-5 h-5" />
                      </div>
                      
                      <div className="text-xs text-black font-bold" id="drag-copy-options">
                        <label className="text-white hover:bg-zinc-800 bg-black border border-black px-3 py-1.5 font-mono uppercase cursor-pointer" id="btn-browse-file">
                          Browse Apparel
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleFileChange} 
                          />
                        </label>
                        <span className="mx-2 text-zinc-500 font-normal">or</span>
                        <button
                          type="button"
                          onClick={startCameraStream}
                          className="text-black bg-white hover:bg-zinc-50 border border-black px-3 py-1.5 font-mono uppercase gap-1 inline-flex items-center"
                          id="btn-camera-activate"
                        >
                          <Camera className="w-3.5 h-3.5" /> Use Lens
                        </button>
                      </div>
                      <p className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono font-bold">Supports PNG, JPEG up to 10MB</p>
                    </div>
                  )}

                  {cameraError && (
                    <div className="mt-3 text-xs text-red-600 font-mono flex items-center gap-1.5 bg-red-50 p-2 border border-red-300" id="camera-error-bubble">
                      <ShieldAlert className="w-3.5 h-3.5" /> {cameraError}
                    </div>
                  )}
                </div>

                {/* Stock instruction box */}
                <div className="bg-zinc-50 border-2 border-black p-5 flex flex-col justify-between" id="vision-instructions">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-mono font-black text-black uppercase tracking-wider flex items-center gap-1" id="instr-header">
                      <Info className="w-3.5 h-3.5 text-black" /> TESTING BENCH TIP
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed font-sans" id="instr-text">
                      No matching wardrobe files handy? Check out our <strong className="text-black font-bold">Stock Database</strong> panel on the right! Click index boxes to instantly load color spectrums, coordinate layouts, and style parameters.
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-black/10 text-[9px] font-mono text-zinc-500 leading-normal uppercase select-none" id="instr-coordinates">
                    Continuous ResNet pipeline evaluates texture details and hue temperatures for coordinate projections.
                  </div>
                </div>
              </div>
            </div>

            {/* Stage 2: Voice control options */}
            <div className="space-y-3">
              <label className="block text-[10px] font-mono font-black text-black uppercase tracking-widest border-l-2 border-black pl-2" id="voice-stage-label">
                Stage 2 — Vox Speech input (Natural Query Rules)
              </label>

              <div className="space-y-4" id="speech-control-box">
                {/* Microphones trigger layout */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-zinc-50 p-4 border-2 border-black" id="microphone-layout">
                  <div className="flex items-center gap-3">
                    {isRecordingAudio ? (
                      <button
                        type="button"
                        onClick={stopMicRecording}
                        className="w-12 h-12 bg-black text-white hover:bg-zinc-800 flex items-center justify-center animate-voice-pulse border border-black"
                        title="Halt microphone audio buffers"
                        id="btn-mic-record-stop"
                      >
                        <MicOff className="w-5 h-5 text-white" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={startMicRecording}
                        className="w-12 h-12 bg-white hover:bg-zinc-50 text-black flex items-center justify-center border-2 border-black transition-all duration-150"
                        title="Deploy offline Whisper listener stream"
                        id="btn-mic-record-start"
                      >
                        <Mic className="w-5 h-5 text-black" />
                      </button>
                    )}

                    <div id="mic-status-readout">
                      <span className="text-xs font-bold text-black uppercase tracking-tight block" id="speech-recorder-title">
                        {isRecordingAudio ? "Vox Microphone Recording..." : recordedAudioFile ? "Vox Audio Buffer Loaded" : "Synthesize Vocals command"}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wide block font-bold mt-0.5" id="speech-recorder-details">
                        {isRecordingAudio 
                          ? `Recording: ${formatTimer(recordingDuration)}` 
                          : recordedAudioFile 
                            ? `File: ${(recordedAudioFile.size / 1024).toFixed(1)} KB (WAV)` 
                            : "Click mic to speak matching styling filter guidelines"}
                      </span>
                    </div>
                  </div>

                  {/* Audio player preview */}
                  {audioPreviewUrl && (
                    <div className="flex-grow flex items-center gap-2 bg-white border border-black px-3 py-1.5" id="mic-playback-player">
                      <Volume2 className="w-4 h-4 text-black" />
                      <audio src={audioPreviewUrl} controls className="h-6 max-w-[180px] sm:max-w-full" />
                      <button
                        type="button"
                        onClick={resetAudioRecord}
                        className="p-1 hover:bg-zinc-50 text-black border border-black ml-auto"
                        title="Purge audio reference buffer"
                        id="btn-aud-purge"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {micError && (
                    <div className="text-xs text-red-600 font-mono bg-red-50 p-2 border border-red-300" id="mic-error-bubble">
                      {micError}
                    </div>
                  )}
                </div>

                {/* Criteria manual textbox input */}
                <div id="text-prompt-search">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2" id="textbox-labels-row">
                    <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest block" id="text-input-field-label">
                      Manual Context Descriptor / Query text
                    </label>
                    <span className="text-[10px] text-zinc-500 italic block font-sans" id="text-input-instructions">
                      E.g. &ldquo;Show me matching trousers under 2000 rupees&rdquo;
                    </span>
                  </div>
                  
                  <div className="relative" id="text-input-wrapper">
                    <input
                      type="text"
                      value={textQuery}
                      onChange={(e) => setTextQuery(e.target.value)}
                      placeholder="Input search guidelines or type instructions manually..."
                      className="w-full bg-white border-2 border-black px-4 py-3 text-sm text-black rounded-none placeholder-zinc-400 focus:outline-none focus:bg-zinc-50/50 transition-all duration-150 pr-12 font-mono"
                      id="text-input-field"
                    />
                    
                    <button
                      type="submit"
                      disabled={pipelineLoading}
                      className="absolute right-2 top-2 p-1.5 bg-black hover:bg-zinc-800 text-white disabled:bg-zinc-100 disabled:text-zinc-400 border border-black transition-all"
                      title="Initiate Scoring Calculations"
                      id="text-btn-recommend-send"
                    >
                      {pipelineLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Run Action Bar */}
            <div className="flex items-center justify-between gap-4 border-t-2 border-black pt-5" id="runs-cta-wrapper">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 hover:bg-zinc-100 text-black text-xs font-mono font-bold uppercase border-2 border-black transition-colors"
                id="btn-sandbox-reset"
              >
                Clear Workbench
              </button>

              <button
                type="submit"
                disabled={pipelineLoading || (!uploadedImage && !textQuery)}
                className="px-6 py-3 bg-black hover:bg-zinc-800 disabled:bg-zinc-100 disabled:text-zinc-400 disabled:border-zinc-300 text-white border-2 border-black font-mono font-bold text-xs uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all duration-150 flex items-center gap-2"
                id="btn-scoring-dispatch"
              >
                {pipelineLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Calculating Cosine Weights...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white fill-current" />
                    Compute Recommendations
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Enhanced Pipeline Diagnostics Error Board */}
          {pipelineError && (
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] space-y-4" id="pipeline-debugger-console">
              <div className="flex items-start justify-between gap-4 border-b-2 border-black pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 border-2 border-black ${
                    pipelineError.type === 'error' ? 'bg-red-50 text-red-600' :
                    pipelineError.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                    'bg-zinc-100 text-black'
                  }`} id="err-icon-box">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-mono font-black uppercase tracking-wider text-black" id="err-title">
                      {pipelineError.title}
                    </h3>
                    <span className="text-[9px] font-mono uppercase bg-black text-white px-2 py-0.5 mt-1 inline-block font-bold">
                      {pipelineError.type.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => setPipelineError(null)} 
                  className="p-1 hover:bg-zinc-100 border-2 border-black transition-none text-black"
                  title="Dismiss debugger console"
                  id="btn-err-dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-zinc-800 font-medium font-serif leading-relaxed" id="err-message-desc">
                  &ldquo;{pipelineError.message}&rdquo;
                </p>

                {pipelineError.advice && pipelineError.advice.length > 0 && (
                  <div className="bg-zinc-50 border border-black p-4 space-y-2" id="err-advice-board">
                    <span className="text-[10px] font-mono font-bold text-zinc-700 uppercase tracking-widest block">
                      Actionable Remediation Checklist
                    </span>
                    <ul className="space-y-2">
                      {pipelineError.advice.map((item, idx) => (
                        <li key={idx} className="text-xs text-zinc-600 flex items-start gap-2" id={`err-adv-item-${idx}`}>
                          <span className="font-mono text-black font-extrabold select-none">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Diagnostic Math matrices & TTS Player outcomes */}
          {pipelineResponse && (
            <div className="space-y-8" id="diagnostic-outcomes">
              {/* Text-to-Speech playback block */}
              <AudioPlayer 
                voiceText={pipelineResponse.voiceText}
                audioVoiceBase64={pipelineResponse.audioVoiceBase64}
                audioMimeType={pipelineResponse.audioMimeType}
              />

              {/* 5D scoring evaluations mapping */}
              <MathMatrix 
                vision={pipelineResponse.vision}
                nlu={pipelineResponse.nlu}
                recommendations={pipelineResponse.recommendations}
                onReset={handleReset}
              />

              {/* Matching clothing grid output cards */}
              <div className="space-y-4" id="styling-results-showcase">
                <div className="flex items-center gap-2 border-l-4 border-black pl-3" id="results-descriptor">
                  <h3 className="text-sm font-mono font-black uppercase tracking-widest text-black">Synthesized Styling Matches</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6" id="results-product-grid">
                  {pipelineResponse.recommendations.map((recommendation, idx) => {
                    const prod = recommendation.product;
                    return (
                      <div 
                        key={prod.id}
                        className="bg-white border-2 border-black flex flex-col justify-between group relative shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-150"
                        id={`card-${prod.id}`}
                      >
                        {/* Cosine similarity percentage badge */}
                        <div className="absolute right-3 top-3 bg-black text-white border border-white font-bold font-mono text-[9px] px-2 py-0.5 z-10 shadow uppercase tracking-wider" id={`rank-badge-${prod.id}`}>
                          Match: {(recommendation.cosineSimilarity * 100).toFixed(0)}%
                        </div>

                        {/* Image viewer */}
                        <div className="relative aspect-square overflow-hidden bg-zinc-150 border-b-2 border-black" id={`card-image-wrapper-${prod.id}`}>
                          <img 
                            src={prod.imageUrl} 
                            alt={prod.name} 
                            className="w-full h-full object-cover grayscale-10 group-hover:scale-105 transition-transform duration-300"
                            referrerPolicy="no-referrer"
                            id={`card-img-${prod.id}`}
                          />
                        </div>

                        {/* Dynamic Metadata */}
                        <div className="p-4 flex-grow flex flex-col justify-between" id={`card-meta-box-${prod.id}`}>
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider block">
                              Rank #{idx + 1} • {prod.fabric} {prod.category}
                            </span>
                            <h4 className="text-xs font-bold text-black uppercase tracking-tight line-clamp-2 leading-tight group-hover:text-zinc-600 transition-colors" id={`card-title-${prod.id}`}>
                              {prod.name}
                            </h4>
                          </div>

                          <div className="mt-3 pt-3 border-t border-black/10" id={`card-pricing-panel-${prod.id}`}>
                            <div className="flex items-center justify-between font-mono">
                              <span className="text-xs font-bold text-black">
                                ₹{prod.price}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-bold">
                                θ: {recommendation.cosineSimilarity.toFixed(4)}
                              </span>
                            </div>
                            
                            {prod.buyUrl ? (
                              <a 
                                href={prod.buyUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 block w-full text-center py-2 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase border border-black transition-all"
                                id={`card-btn-buy-${prod.id}`}
                              >
                                Buy on {prod.fabric || "Platform"} ↗
                              </a>
                            ) : (
                              <button 
                                type="button" 
                                onClick={() => alert(`Purchasing ${prod.name} at ₹${prod.price} - Ecosystem mock checkout.`)}
                                className="mt-3 w-full py-2 bg-black hover:bg-zinc-800 text-white text-xs font-mono font-bold uppercase border border-black transition-all"
                                id={`card-btn-buy-${prod.id}`}
                              >
                                Buy Product
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right column: stock database viewer drawer */}
        <div className="lg:col-span-4" id="selection-drawer-column">
          <DbViewer 
            onSelectProduct={selectProductAsReference}
            selectedProductId={selectedProductPreviewId}
          />
        </div>

      </main>
    </div>
  );
}
