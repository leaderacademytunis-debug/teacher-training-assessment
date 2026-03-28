import { useState, useRef, useCallback, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Mic, MicOff, Play, Pause, Trash2, Upload, CheckCircle2,
  AlertCircle, Loader2, ArrowRight, Coins, Volume2, StopCircle,
  RefreshCw, ChevronRight, Home
} from "lucide-react";
import useI18n from "@/i18n";


const SAMPLE_TEXT_AR = `بسم الله الرحمن الرحيم. مرحباً بكم في هذا الدرس التعليمي. سنتعلم اليوم كيف نستخدم التكنولوجيا الحديثة في خدمة التعليم. إن الذكاء الاصطناعي يفتح آفاقاً جديدة أمام المعلمين والمتعلمين على حد سواء. دعونا نبدأ رحلتنا في عالم التعليم الرقمي المبتكر.`;

const SAMPLE_TEXT_FR = `Bonjour et bienvenue dans cette leçon éducative. Aujourd'hui, nous allons découvrir comment utiliser les technologies modernes au service de l'enseignement. L'intelligence artificielle ouvre de nouveaux horizons pour les enseignants et les apprenants. Commençons notre voyage dans le monde de l'éducation numérique innovante.`;

const MIN_DURATION = 15; // minimum 15 seconds
const MAX_DURATION = 90; // maximum 90 seconds
const RECOMMENDED_DURATION = 60; // recommended 60 seconds

type RecordingState = "idle" | "recording" | "recorded" | "uploading" | "processing";

export default function MyDigitalVoice() {
  const { t, lang, isRTL, dir } = useI18n();
  const { user, isLoading: authLoading } = useAuth();
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sampleLang, setSampleLang] = useState<"ar" | "fr">("ar");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // tRPC queries
  const voiceCloneQuery = trpc.voiceCloning.getMyVoiceClone.useQuery(undefined, {
    enabled: !!user,
  });
  const pointsQuery = trpc.voiceCloning.getMyPoints.useQuery(undefined, {
    enabled: !!user,
  });
  
  const uploadMutation = trpc.voiceCloning.uploadVoiceSample.useMutation({
    onSuccess: () => {
      toast.success("تم رفع العينة الصوتية بنجاح!");
      voiceCloneQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "فشل في رفع العينة الصوتية");
      setRecordingState("recorded");
    },
  });
  
  const createCloneMutation = trpc.voiceCloning.createVoiceClone.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء البصمة الصوتية بنجاح! يمكنك الآن استخدامها في Edu-Studio.");
      voiceCloneQuery.refetch();
      setRecordingState("idle");
    },
    onError: (err) => {
      toast.error(err.message || "فشل في إنشاء البصمة الصوتية");
      voiceCloneQuery.refetch();
    },
  });
  
  const deleteMutation = trpc.voiceCloning.deleteVoiceClone.useMutation({
    onSuccess: () => {
      toast.success("تم حذف البصمة الصوتية");
      voiceCloneQuery.refetch();
      setRecordingState("idle");
      setAudioBlob(null);
      setAudioUrl(null);
      setDuration(0);
    },
  });
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);
  
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      
      chunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setRecordingState("recorded");
        
        // Stop all tracks
        stream.getTracks().forEach(t => t.stop());
      };
      
      mediaRecorder.start(1000); // collect data every second
      setRecordingState("recording");
      setDuration(0);
      
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const next = prev + 1;
          if (next >= MAX_DURATION) {
            // Auto-stop at max duration
            mediaRecorder.stop();
            if (timerRef.current) clearInterval(timerRef.current);
          }
          return next;
        });
      }, 1000);
    } catch (err: any) {
      if (err.name === "NotAllowedError") {
        toast.error("يرجى السماح بالوصول إلى الميكروفون لتسجيل صوتك");
      } else {
        toast.error("حدث خطأ في الوصول إلى الميكروفون");
      }
    }
  }, []);
  
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, []);
  
  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => setIsPlaying(false);
      audio.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);
  
  const resetRecording = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState("idle");
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, [audioUrl]);
  
  const uploadAndCreateClone = useCallback(async () => {
    if (!audioBlob || duration < MIN_DURATION) {
      toast.error(`يجب أن يكون التسجيل ${MIN_DURATION} ثانية على الأقل`);
      return;
    }
    
    setRecordingState("uploading");
    
    try {
      // Convert blob to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(audioBlob);
      const base64 = await base64Promise;
      
      // Upload to S3
      const result = await uploadMutation.mutateAsync({
        audioBase64: base64,
        durationSeconds: duration,
        mimeType: "audio/webm",
      });
      
      // Create voice clone
      setRecordingState("processing");
      await createCloneMutation.mutateAsync({ voiceCloneId: result.id });
    } catch {
      // Error handled in mutation callbacks
    }
  }, [audioBlob, duration, uploadMutation, createCloneMutation]);
  
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  
  const existingClone = voiceCloneQuery.data;
  const points = pointsQuery.data;
  
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen" dir="rtl">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-lg">يرجى تسجيل الدخول للوصول إلى هذه الميزة</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-sky-50/20" dir="rtl">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/teacher-tools">
              <Button variant="ghost" size="sm">
                <Home className="h-4 w-4 ms-1" />
                الأدوات
              </Button>
            </Link>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <h1 className="text-lg font-bold bg-gradient-to-l from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              🎙️ صوتي الرقمي
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/my-points">
              <Button variant="outline" size="sm" className="gap-1">
                <Coins className="h-4 w-4 text-amber-500" />
                <span className="font-bold text-amber-600">{points?.balance ?? "..."}</span>
                <span className="text-xs text-muted-foreground">نقطة</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Info Banner */}
        <Card className="border-violet-200 bg-gradient-to-l from-violet-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <div className="shrink-0 w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center">
                <Volume2 className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h2 className="font-bold text-lg text-violet-900 mb-1">استنساخ صوتك الشخصي</h2>
                <p className="text-sm text-violet-700 leading-relaxed">
                  سجّل صوتك مرة واحدة (60 ثانية على الأقل) واستخدمه لتوليد التعليق الصوتي في 
                  <Link href="/edu-studio" className="font-bold underline mx-1">Edu-Studio</Link>
                  بصوتك الخاص! هذه الميزة الفريدة تجعل دروسك أكثر شخصية وتأثيراً.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Existing Voice Clone Status */}
        {existingClone && existingClone.status === "ready" && (
          <Card className="border-emerald-200 bg-gradient-to-l from-emerald-50 to-green-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  <CardTitle className="text-emerald-800">بصمتك الصوتية جاهزة!</CardTitle>
                </div>
                <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                  جاهزة للاستخدام
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">مدة العينة</p>
                  <p className="font-bold text-lg">{existingClone.sampleDurationSeconds}s</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">عدد الاستخدامات</p>
                  <p className="font-bold text-lg">{existingClone.totalGenerations}</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">الحالة</p>
                  <p className="font-bold text-lg text-emerald-600">نشطة</p>
                </div>
                <div className="text-center p-3 bg-white/60 rounded-lg">
                  <p className="text-xs text-muted-foreground">التكلفة</p>
                  <p className="font-bold text-lg text-amber-600">5 نقاط/مرة</p>
                </div>
              </div>
              
              {existingClone.sampleAudioUrl && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">العينة الصوتية المسجلة:</p>
                  <audio controls className="w-full" src={existingClone.sampleAudioUrl}>
                    المتصفح لا يدعم تشغيل الصوت
                  </audio>
                </div>
              )}
              
              <div className="flex gap-2">
                <Link href="/edu-studio">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                    استخدم في Edu-Studio
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => {
                    resetRecording();
                  }}
                  className="gap-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  إعادة التسجيل
                </Button>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1"
                  onClick={() => {
                    if (confirm("هل أنت متأكد من حذف البصمة الصوتية؟")) {
                      deleteMutation.mutate({ voiceCloneId: existingClone.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Processing State */}
        {existingClone && existingClone.status === "processing" && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <h3 className="font-bold text-lg text-blue-800">جارٍ معالجة البصمة الصوتية...</h3>
              <p className="text-sm text-blue-600 mt-2">قد يستغرق هذا بضع دقائق. يرجى الانتظار.</p>
            </CardContent>
          </Card>
        )}
        
        {/* Failed State */}
        {existingClone && existingClone.status === "failed" && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-red-800">فشل في إنشاء البصمة الصوتية</h3>
                  <p className="text-sm text-red-600 mt-1">{existingClone.errorMessage || "حدث خطأ غير متوقع"}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 gap-1"
                    onClick={resetRecording}
                  >
                    <RefreshCw className="h-4 w-4" />
                    إعادة المحاولة
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recording Interface - Show when no ready clone or re-recording */}
        {(!existingClone || existingClone.status !== "ready" || recordingState !== "idle") && recordingState !== "processing" && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Sample Text */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">النص المرجعي للقراءة</CardTitle>
                <CardDescription>
                  اقرأ هذا النص بصوت واضح وطبيعي أثناء التسجيل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={sampleLang === "ar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSampleLang("ar")}
                  >
                    عربي
                  </Button>
                  <Button
                    variant={sampleLang === "fr" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSampleLang("fr")}
                  >
                    Français
                  </Button>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border text-base leading-loose" style={{ fontFamily: sampleLang === "ar" ? "inherit" : "serif" }}>
                  {sampleLang === "ar" ? SAMPLE_TEXT_AR : SAMPLE_TEXT_FR}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  💡 نصيحة: يمكنك قراءة أي نص تريده. المهم أن يكون صوتك واضحاً ومستمراً لمدة {MIN_DURATION} ثانية على الأقل.
                </p>
              </CardContent>
            </Card>
            
            {/* Right: Recording Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">التسجيل الصوتي</CardTitle>
                <CardDescription>
                  سجّل عينة صوتية واضحة (الحد الأدنى {MIN_DURATION} ثانية، الموصى به {RECOMMENDED_DURATION} ثانية)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Timer Display */}
                <div className="text-center">
                  <div className={`text-5xl font-mono font-bold ${
                    recordingState === "recording" 
                      ? duration >= RECOMMENDED_DURATION ? "text-emerald-600" : duration >= MIN_DURATION ? "text-blue-600" : "text-red-500"
                      : "text-slate-400"
                  }`}>
                    {formatTime(duration)}
                  </div>
                  <div className="mt-2">
                    <Progress 
                      value={Math.min((duration / RECOMMENDED_DURATION) * 100, 100)} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>0s</span>
                      <span className={duration >= MIN_DURATION ? "text-emerald-600 font-bold" : ""}>
                        {MIN_DURATION}s (الحد الأدنى)
                      </span>
                      <span className={duration >= RECOMMENDED_DURATION ? "text-emerald-600 font-bold" : ""}>
                        {RECOMMENDED_DURATION}s (موصى)
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Recording Animation */}
                {recordingState === "recording" && (
                  <div className="flex items-center justify-center gap-1 h-12">
                    {[...Array(20)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-red-500 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: `${0.5 + Math.random() * 0.5}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Controls */}
                <div className="flex items-center justify-center gap-3">
                  {recordingState === "idle" && (
                    <Button
                      size="lg"
                      className="bg-red-600 hover:bg-red-700 rounded-full h-16 w-16 p-0"
                      onClick={startRecording}
                    >
                      <Mic className="h-7 w-7" />
                    </Button>
                  )}
                  
                  {recordingState === "recording" && (
                    <Button
                      size="lg"
                      variant="destructive"
                      className="rounded-full h-16 w-16 p-0 animate-pulse"
                      onClick={stopRecording}
                    >
                      <StopCircle className="h-7 w-7" />
                    </Button>
                  )}
                  
                  {recordingState === "recorded" && (
                    <>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full h-14 w-14 p-0"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full h-14 w-14 p-0 text-red-600"
                        onClick={resetRecording}
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Status Messages */}
                {recordingState === "idle" && (
                  <p className="text-center text-sm text-muted-foreground">
                    اضغط على زر الميكروفون لبدء التسجيل
                  </p>
                )}
                {recordingState === "recording" && (
                  <p className="text-center text-sm text-red-600 font-medium animate-pulse">
                    🔴 جارٍ التسجيل... اقرأ النص بصوت واضح
                  </p>
                )}
                {recordingState === "recorded" && duration < MIN_DURATION && (
                  <p className="text-center text-sm text-red-600">
                    ⚠️ التسجيل قصير جداً ({duration}s). يجب أن يكون {MIN_DURATION} ثانية على الأقل.
                  </p>
                )}
                {recordingState === "recorded" && duration >= MIN_DURATION && (
                  <p className="text-center text-sm text-emerald-600">
                    ✅ تسجيل ممتاز! ({duration}s) يمكنك الآن إنشاء البصمة الصوتية.
                  </p>
                )}
                
                {/* Upload Button */}
                {recordingState === "recorded" && duration >= MIN_DURATION && (
                  <Button
                    className="w-full bg-gradient-to-l from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 gap-2"
                    size="lg"
                    onClick={uploadAndCreateClone}
                    disabled={uploadMutation.isPending || createCloneMutation.isPending}
                  >
                    {uploadMutation.isPending || createCloneMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        جارٍ المعالجة...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        إنشاء البصمة الصوتية
                      </>
                    )}
                  </Button>
                )}
                
                {recordingState === "uploading" && (
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-violet-600 mx-auto mb-2" />
                    <p className="text-sm text-violet-600">جارٍ رفع العينة الصوتية...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Tips Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">💡 نصائح للحصول على أفضل نتيجة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h4 className="font-bold text-blue-800 mb-2">🎤 البيئة</h4>
                <p className="text-sm text-blue-700">سجّل في مكان هادئ بعيداً عن الضوضاء. استخدم سماعات مع ميكروفون إن أمكن.</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h4 className="font-bold text-green-800 mb-2">🗣️ الأداء</h4>
                <p className="text-sm text-green-700">تحدث بوتيرة طبيعية وواضحة. لا تتسرع ولا تبطئ كثيراً. حافظ على نبرة ثابتة.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                <h4 className="font-bold text-purple-800 mb-2">⏱️ المدة</h4>
                <p className="text-sm text-purple-700">60 ثانية هي المدة المثالية. كلما زادت مدة التسجيل، كانت جودة الاستنساخ أفضل.</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🔄 كيف يعمل النظام؟</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row items-center gap-4">
              {[
                { icon: "🎙️", title: "سجّل صوتك", desc: "60 ثانية من القراءة الواضحة" },
                { icon: "🧠", title: "تحليل البصمة", desc: "الذكاء الاصطناعي يتعلم نبرتك" },
                { icon: "🎬", title: "استخدم في Edu-Studio", desc: "اختر صوتك في التعليق الصوتي" },
                { icon: "🔊", title: "درس بصوتك", desc: "فيديو تعليمي بصوتك الشخصي" },
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="text-center flex-1 min-w-[120px]">
                    <div className="text-3xl mb-2">{step.icon}</div>
                    <h4 className="font-bold text-sm">{step.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{step.desc}</p>
                  </div>
                  {i < 3 && (
                    <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
