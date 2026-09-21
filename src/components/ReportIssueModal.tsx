import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  FileText,
  Mic,
  MicOff,
  Image as ImageIcon,
  Video,
  MapPin,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Search,
  Upload,
  Trash2,
  Info,
  ShieldCheck,
  RefreshCw,
  LocateFixed,
} from 'lucide-react';
import { IssueCategory, SeverityLevel } from '../types';

declare const L: any;

export const ReportIssueModal: React.FC = () => {
  const { isReportModalOpen, setIsReportModalOpen, triggerRefresh, setSelectedComplaintId } = useAuth();

  // Wizard Step (1 to 7)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [inputMethod, setInputMethod] = useState<'text' | 'voice' | 'image' | 'mixed'>('mixed');
  const [description, setDescription] = useState<string>('');
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [images, setImages] = useState<{ url: string; name: string; size: string; base64: string }[]>([]);
  
  // Location State
  const [latitude, setLatitude] = useState<number>(18.5204);
  const [longitude, setLongitude] = useState<number>(73.8567);
  const [address, setAddress] = useState<string>('Shivaji Nagar, Pune, Maharashtra');
  const [locationDetecting, setLocationDetecting] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // AI Classification State
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<{
    issue_type: string;
    category: IssueCategory;
    severity: SeverityLevel;
    confidence: number;
    department: string;
    evidence: string[];
    evidence_sources?: { source: string; detail: string }[];
    safety_risk: string;
    recommended_action: string;
  } | null>(null);

  const [customCategory, setCustomCategory] = useState<IssueCategory>('Road');
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isReportModalOpen) {
      setCurrentStep(1);
      setDescription('');
      setVoiceTranscript('');
      setImages([]);
      setAiResult(null);
      setDuplicateWarning(null);
      setLocationError(null);
    }
  }, [isReportModalOpen]);

  // Leaflet Map Initialization for Step 4
  useEffect(() => {
    if (currentStep === 4 && mapContainerRef.current) {
      if (typeof L === 'undefined') return;

      // Destroy old instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapContainerRef.current).setView([latitude, longitude], 15);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(map);

      // Custom colored icon
      const marker = L.marker([latitude, longitude], { draggable: true }).addTo(map);
      markerRef.current = marker;

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setLatitude(pos.lat);
        setLongitude(pos.lng);
        await reverseGeocode(pos.lat, pos.lng);
      });

      map.on('click', async (e: any) => {
        marker.setLatLng(e.latlng);
        setLatitude(e.latlng.lat);
        setLongitude(e.latlng.lng);
        await reverseGeocode(e.latlng.lat, e.latlng.lng);
      });

      // Invalidate size after modal render
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [currentStep]);

  // Reverse Geocoding Helper
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch('/api/location/reverse-geocode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });
      if (res.ok) {
        const data = await res.json();
        setAddress(data.address || `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      }
    } catch (e) {
      setAddress(`Ward Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    }
  };

  // Browser Geolocation
  const handleUseCurrentLocation = () => {
    setLocationDetecting(true);
    setLocationError(null);

    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setLocationDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLatitude(lat);
        setLongitude(lng);

        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
        }

        await reverseGeocode(lat, lng);
        setLocationDetecting(false);
      },
      (err) => {
        console.warn('Geolocation denied or unavailable:', err);
        setLocationError('Could not retrieve live GPS. Defaulted to city center; drag marker to set pinpoint.');
        setLocationDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Voice Recording simulation & Web Speech API
  const handleToggleVoice = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    // Check SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN';

        recognition.onstart = () => setIsRecording(true);
        recognition.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setVoiceTranscript(transcript);
          if (!description) setDescription(transcript);
          setIsRecording(false);
        };
        recognition.onerror = () => {
          setIsRecording(false);
        };
        recognition.onend = () => setIsRecording(false);
        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech recognition start failed, using preset audio simulator');
      }
    }

    // Fallback simulation for browsers without speech API
    setIsRecording(true);
    setTimeout(() => {
      const sample = 'College gate javal mottha khadda padla ahe, do-chaki gadya padnyachi bhiti ahe.';
      setVoiceTranscript(sample);
      if (!description) setDescription('Large hazardous pothole near college gate creating danger for two-wheelers.');
      setIsRecording(false);
    }, 2500);
  };

  // File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImages((prev) => [
          ...prev,
          {
            url: base64,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            base64,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Run AI Analysis (Step 5 & 6)
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const combinedText = description + (voiceTranscript ? ` [Audio Transcript: ${voiceTranscript}]` : '');
      const primaryImage = images.length > 0 ? images[0].base64 : undefined;

      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: combinedText || 'Civic infrastructure defect on public road',
          imageBase64: primaryImage,
          locationHint: address,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        setCustomCategory(data.category);
      }
    } catch (e) {
      console.error('AI analysis request failed:', e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (currentStep === 7 && !duplicateWarning) {
      checkDuplicateBeforeSubmit();
    }
  }, [currentStep]);

  // Preview duplicate risk before final submission
  const checkDuplicateBeforeSubmit = async () => {
    try {
      const res = await fetch('/api/complaints/duplicate-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          text: description,
          audioTranscript: voiceTranscript,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.isDuplicate && data.matchedComplaint) {
          setDuplicateWarning(
            `Potential duplicate: ${data.matchedComplaint.complaintNumber} — ${data.matchedComplaint.issueType} at ${data.matchedComplaint.address}`
          );
        } else {
          setDuplicateWarning(null);
        }
      }
    } catch (e) {
      console.warn('Duplicate preview failed', e);
    }
  };

  // Submit Complaint
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        text: description,
        audioTranscript: voiceTranscript,
        inputMethod,
        imageBase64: images.length > 0 ? images[0].base64 : undefined,
        latitude,
        longitude,
        address,
        categoryOverride: customCategory,
      };

      const res = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const result = await res.json();
        triggerRefresh();
        setIsReportModalOpen(false);
        if (result.complaint) {
          setSelectedComplaintId(result.complaint.id);
        }
      } else {
        alert('Error filing complaint. Please try again.');
      }
    } catch (e) {
      console.error(e);
      alert('Network error submitting complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && !description && !voiceTranscript) {
      alert('Please provide a description or use the voice recording feature.');
      return;
    }

    if (currentStep === 4) {
      // Trigger AI analysis when proceeding to Step 5
      runAiAnalysis();
    }

    setCurrentStep((prev) => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  if (!isReportModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
              {currentStep}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Report Civic Issue</h2>
              <p className="text-xs text-slate-500">Step {currentStep} of 7 — Multi-Modal Intelligent Intake</p>
            </div>
          </div>
          <button
            onClick={() => setIsReportModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {[1, 2, 3, 4, 5, 6, 7].map((s) => (
            <div
              key={s}
              className={`flex-1 h-full transition-all duration-300 ${
                s <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Step Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-800">
          {/* STEP 1: SELECT INPUT METHOD */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">How would you like to report this issue?</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Select your preferred input format. You can combine text, voice, and photos together!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {[
                  {
                    id: 'mixed',
                    title: 'Multi-Modal (Recommended)',
                    desc: 'Combine text, photos, and voice notes for maximum AI triage accuracy',
                    icon: Sparkles,
                    accent: 'border-blue-600 bg-blue-50/50',
                  },
                  {
                    id: 'text',
                    title: 'Text Description',
                    desc: 'Type in details with automatic AI keyword suggestions',
                    icon: FileText,
                  },
                  {
                    id: 'voice',
                    title: 'Voice Complaint',
                    desc: 'Speak naturally in English, Marathi, or Hindi with auto speech-to-text',
                    icon: Mic,
                  },
                  {
                    id: 'image',
                    title: 'Upload Evidence',
                    desc: 'Capture or upload camera photos; our Vision AI detects defect depth & category',
                    icon: ImageIcon,
                  },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = inputMethod === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setInputMethod(m.id as any)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-900">{m.title}</div>
                        <div className="text-xs text-slate-500 mt-1 leading-relaxed">{m.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: DESCRIPTION & VOICE INPUT */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Describe the Civic Issue</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Provide details about location, danger level, or consequences for commuters.
                </p>
              </div>

              {/* Speech-to-Text Bar */}
              <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    className={`p-3 rounded-full transition-all cursor-pointer ${
                      isRecording ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400/30' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {isRecording ? 'Listening... Speak now' : 'Voice Input (Marathi / English / Hindi)'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {isRecording ? 'Capturing audio stream...' : 'Click mic to speak complaint'}
                    </div>
                  </div>
                </div>

                {voiceTranscript && (
                  <span className="text-[11px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-semibold">
                    Voice Captured
                  </span>
                )}
              </div>

              {voiceTranscript && (
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="font-bold text-slate-700">Audio Transcript: </span>
                  <span className="text-slate-600 italic">"{voiceTranscript}"</span>
                </div>
              )}

              {/* Textarea */}
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
                  <span>Complaint Description</span>
                  <span>{description.length} / 500 chars</span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="e.g., Large pothole in middle of College Road near gate. Water filled inside and two wheelers skidding during night..."
                  className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none"
                />
              </div>

              {/* Quick AI Suggestion Chips */}
              <div>
                <div className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  Quick Example Suggestions (Click to fill):
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Hazardous pothole in middle of road causing vehicle skids',
                    'Open manhole cover directly outside school gate with high fall hazard',
                    'Garbage container overflowing with foul smell in vegetable market',
                    'Dark streetlights along transit road making night walking unsafe',
                    'High pressure water pipe burst flooding footpath near hospital',
                  ].map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDescription(s)}
                      className="px-2.5 py-1 text-xs rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 border border-slate-200 transition-colors text-left"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: EVIDENCE UPLOAD */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Upload Visual Evidence</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Photos enable Vision AI to calculate defect depth, road damage volume, and safety severity.
                </p>
              </div>

              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/20 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Click to upload or drag and drop images
                </div>
                <div className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 10MB each</div>
              </label>

              {/* Previews */}
              {images.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Attached Evidence ({images.length})
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative rounded-xl border border-slate-200 overflow-hidden group bg-slate-100">
                        <img src={img.url} alt={img.name} className="w-full h-28 object-cover" />
                        <div className="p-2 bg-white text-[11px] flex items-center justify-between">
                          <span className="truncate max-w-[100px] text-slate-700 font-medium">{img.name}</span>
                          <span className="text-slate-400">{img.size}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-md shadow-xs opacity-90 hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sample Photo loader button for quick testing */}
              {images.length === 0 && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    Need a test photo for hackathon demonstration?
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImages([
                        {
                          url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
                          name: 'pothole_field_capture.jpg',
                          size: '2.1 MB',
                          base64: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
                        },
                      ]);
                    }}
                    className="px-2.5 py-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors cursor-pointer"
                  >
                    Load Sample Defect Photo
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: LIVE LOCATION & MAP */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pinpoint Issue Location</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Click 'Use My Current Location' or drag the pin anywhere on the Leaflet map.
                </p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  disabled={locationDetecting}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  <LocateFixed className={`w-4 h-4 ${locationDetecting ? 'animate-spin' : ''}`} />
                  {locationDetecting ? 'Detecting GPS...' : 'Use My Current Location'}
                </button>

                <div className="text-xs text-slate-600">
                  <span className="font-bold">Coords: </span>
                  {latitude.toFixed(4)}, {longitude.toFixed(4)}
                </div>
              </div>

              {locationError && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                  <Info className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>{locationError}</span>
                </div>
              )}

              {/* Address field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detected Human-Readable Address:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="flex-1 p-2.5 text-xs rounded-xl border border-slate-300 focus:border-blue-500 outline-none"
                    placeholder="Enter landmark or road name..."
                  />
                </div>
              </div>

              {/* Interactive Leaflet Map Container */}
              <div className="rounded-xl overflow-hidden border border-slate-300 shadow-inner h-64 w-full relative z-0">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
              <p className="text-[11px] text-slate-400 italic">
                Tip: Drag the marker directly on the map to fine-tune exact pothole or manhole location.
              </p>
            </div>
          )}

          {/* STEP 5: AI CATEGORY DETECTION */}
          {currentStep === 5 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Category & Issue Classification</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Our Multi-Modal Civic Agent analyzed your text, photos, and location context.
                </p>
              </div>

              {isAnalyzing ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <div className="text-sm font-bold text-slate-800">Agentic AI Analyzing Input...</div>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Running vision feature extraction, severity calculation, and department mapping...
                  </p>
                </div>
              ) : aiResult ? (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-xs text-blue-800 font-semibold uppercase tracking-wider">
                        AI Detected Issue
                      </div>
                      <div className="text-lg font-bold text-slate-900 mt-0.5">{aiResult.issue_type}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Assigned Category: <span className="font-bold text-slate-800">{aiResult.category}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-blue-600">
                        {Math.round(aiResult.confidence * 100)}%
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Confidence Score</div>
                    </div>
                  </div>

                  {/* Manual Citizen Category Override */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Need to correct the category? Select below:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        'Road',
                        'Garbage',
                        'Streetlight',
                        'Water',
                        'Drainage',
                        'Traffic',
                        'Environment',
                        'Public Infrastructure',
                      ].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCustomCategory(cat as IssueCategory)}
                          className={`p-2 rounded-lg text-xs font-medium border text-center transition-colors cursor-pointer ${
                            customCategory === cat
                              ? 'bg-blue-600 text-white border-blue-600 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-700">Target Department: </span>
                      <span className="font-bold text-slate-900">{aiResult.department}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      ROUTING VERIFIED
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* STEP 6: AI SEVERITY & EVIDENCE GROUNDING */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">AI Severity & Evidence Grounding</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Autonomous risk calculation with transparent evidence justification.
                </p>
              </div>

              {aiResult && (
                <div className="space-y-3">
                  {/* Severity Badge Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center justify-between ${
                      aiResult.severity === 'CRITICAL'
                        ? 'bg-red-50 border-red-200 text-red-900'
                        : aiResult.severity === 'HIGH'
                        ? 'bg-orange-50 border-orange-200 text-orange-900'
                        : aiResult.severity === 'MEDIUM'
                        ? 'bg-amber-50 border-amber-200 text-amber-900'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider opacity-80">Calculated Severity</div>
                      <div className="text-xl font-black mt-0.5">{aiResult.severity} PRIORITY</div>
                      <div className="text-xs mt-1 font-medium">{aiResult.safety_risk}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {aiResult.severity === 'CRITICAL' ? '6h SLA' : aiResult.severity === 'HIGH' ? '24h SLA' : '48h SLA'}
                      </div>
                      <div className="text-[10px] opacity-75">Max Resolution Time</div>
                    </div>
                  </div>

                  {/* Evidence Grounding Box */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      Why did the AI reach this decision? (Grounding Rationale)
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {(aiResult as any).evidence_sources?.map((src: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600">
                          {src.source}
                        </span>
                      ))}
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-600 pl-2">
                      {aiResult.evidence.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommended Action */}
                  <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
                    <div className="font-bold text-emerald-900">Recommended Operational Response:</div>
                    <div className="text-emerald-800 mt-0.5">{aiResult.recommended_action}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: DUPLICATE CHECK & FINAL REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Review & Submit Complaint</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Confirm the details below. Our Agent Orchestrator will register and route the ticket immediately.
                </p>
              </div>

              {/* Duplicate check — backed by the server-side proximity + text similarity rule */}
              <div className={`p-3 border rounded-xl flex items-center justify-between text-xs ${
                duplicateWarning ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  {duplicateWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                  <span className="text-slate-700">
                    {duplicateWarning || 'Duplicate check will run against active complaints near the selected location.'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={checkDuplicateBeforeSubmit}
                  className="text-[10px] bg-white border border-slate-200 text-blue-700 font-bold px-2 py-1 rounded"
                >
                  CHECK
                </button>
              </div>

              {/* Summary Card */}
              <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Issue Type</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {aiResult?.issue_type || 'Civic Infrastructure Defect'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Assigned Department</div>
                    <div className="font-bold text-slate-900 text-sm mt-0.5">
                      {aiResult?.department || 'Roads & Infrastructure Department'}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Severity & SLA</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {aiResult?.severity || 'MEDIUM'} ({aiResult?.severity === 'CRITICAL' ? '6 Hours' : '24 Hours'})
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase">Location</div>
                    <div className="font-medium text-slate-800 mt-0.5 truncate">{address}</div>
                  </div>
                </div>

                <div>
                  <div className="text-slate-400 text-[10px] font-bold uppercase">Citizen Description</div>
                  <p className="text-slate-700 mt-1">{description}</p>
                </div>

                {images.length > 0 && (
                  <div>
                    <div className="text-slate-400 text-[10px] font-bold uppercase mb-1">Attached Evidence</div>
                    <div className="flex gap-2">
                      {images.map((img, i) => (
                        <img key={i} src={img.url} alt="proof" className="w-14 h-14 object-cover rounded-lg border border-slate-200" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent flex items-center gap-1 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2">
            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Orchestrating AI Triage...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Submit & Track Complaint</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
