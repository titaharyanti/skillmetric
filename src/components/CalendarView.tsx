import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  User,
  BookOpen,
  MapPin,
  Trash2,
  CheckCircle,
  AlertCircle,
  LogOut,
  Info,
  Mail,
  FileText,
  Layers,
  Send,
  Check,
  X,
  Search,
  Tag,
} from 'lucide-react';
import { Participant, TrainingProduct, TrainingSession, TrainingPlan, TrainingRequest } from '../types';
import {
  googleSignIn,
  googleSignOut,
  fetchGoogleEvents,
  createGoogleEvent,
  deleteGoogleEvent,
  GoogleCalendarEvent,
} from '../utils/googleCalendar';
import { User as FirebaseUser } from 'firebase/auth';

interface CalendarViewProps {
  participants: Participant[];
  products: TrainingProduct[];
  sessions: TrainingSession[];
  setSessions: React.Dispatch<React.SetStateAction<TrainingSession[]>>;
  trainingPlans: TrainingPlan[];
  setTrainingPlans: React.Dispatch<React.SetStateAction<TrainingPlan[]>>;
  trainingRequests: TrainingRequest[];
  setTrainingRequests: React.Dispatch<React.SetStateAction<TrainingRequest[]>>;
  isAdmin: boolean;
  handleRequireAdmin: (msg?: string, action?: () => void) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  participants,
  products,
  sessions,
  setSessions,
  trainingPlans,
  setTrainingPlans,
  trainingRequests,
  setTrainingRequests,
  isAdmin,
  handleRequireAdmin,
}) => {
  // Google Auth states
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleToken, setGoogleToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [googleEvents, setGoogleEvents] = useState<GoogleCalendarEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Month navigation
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(2026, 7, 1)); // Default to August 2026 as per local dates

  // Form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  
  const getDatesInRange = (startStr: string, endStr: string): string[] => {
    if (!startStr || !endStr) return [];
    const start = new Date(startStr);
    const end = new Date(endStr);
    if (start > end) return [];
    
    const dates: string[] = [];
    const curr = new Date(start);
    let limit = 0;
    while (curr <= end && limit < 30) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
      limit++;
    }
    return dates;
  };
  const [formParticipantId, setFormParticipantId] = useState('');
  const [formProductId, setFormProductId] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('11:00');
  const [formTrainerName, setFormTrainerName] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Enhanced form states for multi-select, division filtering, date types and trainers
  const [formTrainingType, setFormTrainingType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [dateMode, setDateMode] = useState<'single' | 'range'>('single');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [selectedTrainers, setSelectedTrainers] = useState<string[]>([]);
  const [searchParticipantText, setSearchParticipantText] = useState('');
  const [searchProductText, setSearchProductText] = useState('');
  const [formCompanyName, setFormCompanyName] = useState('');
  const [formTrainingTitle, setFormTrainingTitle] = useState('');
  const [formGuestEmails, setFormGuestEmails] = useState('');
  const [formDateTimes, setFormDateTimes] = useState<{[date: string]: {startTime: string, endTime: string}}>({});

  // Sub tab navigation: 'calendar' | 'plans' | 'requests'
  const [activeSubTab, setActiveSubTab] = useState<'calendar' | 'plans' | 'requests'>('calendar');

  // Plan creation form state
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planTitle, setPlanTitle] = useState('');
  const [planProductId, setPlanProductId] = useState('');
  const [planType, setPlanType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [planStartDate, setPlanStartDate] = useState('');
  const [planEndDate, setPlanEndDate] = useState('');
  const [planTrainer, setPlanTrainer] = useState('');
  const [planTargetAudience, setPlanTargetAudience] = useState('');
  const [planQuota, setPlanQuota] = useState(15);
  const [planDescription, setPlanDescription] = useState('');

  // Request creation form state
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [reqParticipantId, setReqParticipantId] = useState('');
  const [reqProductId, setReqProductId] = useState('');
  const [reqType, setReqType] = useState<'Internal' | 'Eksternal'>('Internal');
  const [reqDate, setReqDate] = useState('');
  const [reqReason, setReqReason] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ active: boolean; recipient: string; subject: string; body: string } | null>(null);

  // Selected event detail state
  const [selectedEvent, setSelectedEvent] = useState<{
    type: 'local' | 'google' | 'both';
    session?: TrainingSession;
    gEvent?: GoogleCalendarEvent;
  } | null>(null);

  // Auto load events if token changes
  useEffect(() => {
    if (googleToken) {
      loadGoogleEvents();
    } else {
      setGoogleEvents([]);
    }
  }, [googleToken, currentMonth]);

  const loadGoogleEvents = async () => {
    if (!googleToken) return;
    try {
      // Calculate start and end date of the visible calendar month +/- 15 days
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const timeMin = new Date(year, month - 1, 15).toISOString();
      const timeMax = new Date(year, month + 1, 15).toISOString();

      const events = await fetchGoogleEvents(googleToken, timeMin, timeMax);
      setGoogleEvents(events);
    } catch (err: any) {
      console.error('Gagal mengambil event Google Calendar:', err);
      setSyncMessage({
        type: 'error',
        text: 'Gagal mengambil event dari Google Calendar. Silakan sign-in ulang.',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthLoading(true);
    setSyncMessage(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setGoogleToken(result.accessToken);
        setSyncMessage({
          type: 'success',
          text: 'Berhasil terhubung dengan Google Calendar!',
        });
      }
    } catch (err: any) {
      console.error(err);
      setSyncMessage({
        type: 'error',
        text: 'Gagal menyambungkan Google Calendar: ' + (err.message || err),
      });
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleGoogleSignOut = async () => {
    setIsAuthLoading(true);
    try {
      await googleSignOut();
      setGoogleUser(null);
      setGoogleToken(null);
      setGoogleEvents([]);
      setSelectedEvent(null);
      setSyncMessage({
        type: 'success',
        text: 'Koneksi Google Calendar diputuskan.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Two-way synchronization logic
  const handleTwoWaySync = async () => {
    if (!googleToken) {
      setSyncMessage({ type: 'error', text: 'Koneksi ke Google Calendar diperlukan untuk sinkronisasi.' });
      return;
    }

    setIsSyncing(true);
    setSyncMessage(null);
    let syncedUpCount = 0;
    let syncedDownCount = 0;

    try {
      // 1. Fetch latest Google events
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth();
      const timeMin = new Date(year, month - 1, 1).toISOString();
      const timeMax = new Date(year, month + 1, 28).toISOString();
      const currentGEvents = await fetchGoogleEvents(googleToken, timeMin, timeMax);

      // Create lookup maps for fast matching
      const localWithGoogleId = sessions.filter((s) => s.googleEventId);
      const googleIdMap = new Map(localWithGoogleId.map((s) => [s.googleEventId, s]));
      const gEventIdMap = new Map(currentGEvents.map((e) => [e.id, e]));

      // 2. Upload missing local sessions to Google Calendar
      const updatedSessions = [...sessions];
      for (let i = 0; i < updatedSessions.length; i++) {
        const session = updatedSessions[i];
        if (!session.googleEventId) {
          const participant = participants.find((p) => p.id === session.participantId);
          const product = products.find((p) => p.id === session.productId);

          if (participant && product) {
            const summary = `[SkillMetric] Training ${product.name} - ${participant.name}`;
            const description = `Sesi Training SkillMetric\n\nPeserta: ${participant.name} (${participant.nip})\nProduk: ${product.name} (${product.code})\nTrainer: ${session.trainerName}\nEvaluasi: ${session.status} (Nilai: ${session.finalScore})`;

            // Construct ISO Start/End Times
            const dateStr = session.date; // YYYY-MM-DD
            const startISO = `${dateStr}T${session.startTime || '09:00'}:00`;
            const endISO = `${dateStr}T${session.endTime || '11:00'}:00`;

            const newEvent: GoogleCalendarEvent = {
              summary,
              description,
              start: { dateTime: startISO, timeZone: 'Asia/Jakarta' },
              end: { dateTime: endISO, timeZone: 'Asia/Jakarta' },
            };

            try {
              const createdEvent = await createGoogleEvent(googleToken, newEvent);
              if (createdEvent.id) {
                updatedSessions[i] = {
                  ...session,
                  googleEventId: createdEvent.id,
                };
                syncedUpCount++;
              }
            } catch (err) {
              console.error('Error uploading session:', err);
            }
          }
        }
      }

      // 3. Download training events from Google Calendar that aren't in SkillMetric yet
      const newImportedSessions: TrainingSession[] = [];
      for (const gEvent of currentGEvents) {
        const summary = gEvent.summary || '';
        // Look for Google events that have our prefix [SkillMetric]
        if (summary.startsWith('[SkillMetric]') && !googleIdMap.has(gEvent.id)) {
          // Attempt to parse information
          const description = gEvent.description || '';
          
          // Try to extract participant NIP or Name, and Product Code or Name from summary/description
          let foundParticipant = participants[0]; // fallback
          let foundProduct = products[0]; // fallback

          for (const p of participants) {
            if (
              description.includes(p.nip) ||
              description.toLowerCase().includes(p.name.toLowerCase()) ||
              summary.toLowerCase().includes(p.name.toLowerCase())
            ) {
              foundParticipant = p;
              break;
            }
          }

          for (const pr of products) {
            if (
              description.includes(pr.code) ||
              description.toLowerCase().includes(pr.name.toLowerCase()) ||
              summary.toLowerCase().includes(pr.name.toLowerCase())
            ) {
              foundProduct = pr;
              break;
            }
          }

          // Parse start and end time
          let eventDate = '2026-08-06';
          let startTime = '09:00';
          let endTime = '11:00';

          if (gEvent.start?.dateTime) {
            const dt = new Date(gEvent.start.dateTime);
            eventDate = dt.toISOString().split('T')[0];
            startTime = dt.toTimeString().split(' ')[0].substring(0, 5);
          } else if (gEvent.start?.date) {
            eventDate = gEvent.start.date;
          }

          if (gEvent.end?.dateTime) {
            const dt = new Date(gEvent.end.dateTime);
            endTime = dt.toTimeString().split(' ')[0].substring(0, 5);
          }

          // Map days in Indonesian
          const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
          const dayIndex = new Date(eventDate).getDay();
          const dayName = indonesianDays[dayIndex] || 'Senin';

          // Extract trainer name
          let trainerName = 'Asesor Utama';
          const trainerMatch = description.match(/Trainer:\s*(.*)/i);
          if (trainerMatch && trainerMatch[1]) {
            trainerName = trainerMatch[1].trim();
          }

          const defaultWeights = { teoriWeight: 30, praktekWeight: 40, rolePlayWeight: 30 };
          const newSessionId = `sess_sync_${gEvent.id}_${Date.now()}`;

          const syncSession: TrainingSession = {
            id: newSessionId,
            participantId: foundParticipant.id,
            productId: foundProduct.id,
            productCategory: foundProduct.category,
            trainingType: foundProduct.trainingType || 'Internal',
            targetAudience: foundProduct.targetAudience || 'Sales',
            date: eventDate,
            day: dayName,
            startTime,
            endTime,
            trainerName,
            preTestScore: 0,
            postTestScore: 0,
            teoriScore: 0,
            praktekScore: 0,
            rolePlayScore: 0,
            appliedWeights: defaultWeights,
            finalScore: 0,
            nGainScore: 0,
            nGainCategory: 'Rendah',
            kkmThreshold: foundProduct.defaultKKM,
            status: 'Belum Kompeten',
            qualitativeGrade: 'D (Perlu Remedial)',
            createdAt: new Date().toISOString(),
            googleEventId: gEvent.id,
          };

          newImportedSessions.push(syncSession);
          syncedDownCount++;
        }
      }

      // Merge and save sessions
      const mergedSessions = [...newImportedSessions, ...updatedSessions];
      setSessions(mergedSessions);
      setGoogleEvents(currentGEvents);

      setSyncMessage({
        type: 'success',
        text: `Sinkronisasi berhasil! Terunggah ke Google: ${syncedUpCount} sesi, Terunduh ke SkillMetric: ${syncedDownCount} sesi.`,
      });
    } catch (err: any) {
      console.error(err);
      setSyncMessage({
        type: 'error',
        text: 'Kesalahan saat sinkronisasi: ' + (err.message || err),
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Monthly Calendar Calculations
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday=0, Monday=1...
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Month labels in Indonesian
  const indonesianMonths = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
    setSelectedEvent(null);
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
    setSelectedEvent(null);
  };

  const getSessionsForDate = (dateString: string) => {
    return sessions.filter((s) => s.date === dateString);
  };

  const getGoogleEventsForDate = (dateString: string) => {
    return googleEvents.filter((e) => {
      if (e.start?.dateTime) {
        return e.start.dateTime.startsWith(dateString);
      }
      if (e.start?.date) {
        return e.start.date === dateString;
      }
      return false;
    });
  };

  const handleOpenAddModal = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    const resetFormFields = () => {
      setSelectedDay(date);
      setFormDate(formatted);
      setFormStartDate(formatted);
      setFormEndDate(formatted);
      setFormParticipantId(participants[0]?.id || '');
      setFormProductId(products[0]?.id || '');
      setFormTrainerName('');
      setFormNotes('');
      
      // Reset multi-selects and filters
      setFormTrainingType('Internal');
      setSelectedDivisions([]);
      setSelectedParticipants([]);
      setSelectedProducts([]);
      setDateMode('single');
      setSelectedTrainers([]);
      setSearchParticipantText('');
      setSearchProductText('');
      setFormCompanyName('');
      setFormTrainingTitle('');
      setFormGuestEmails('');
      setFormDateTimes({
        [formatted]: { startTime: '09:00', endTime: '11:00' }
      });
      setIsModalOpen(true);
    };

    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menjadwalkan sesi training baru.', resetFormFields);
      return;
    }
    resetFormFields();
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formTrainingType === 'Internal' && selectedParticipants.length === 0) {
      alert('Mohon pilih minimal satu karyawan/peserta untuk training internal.');
      return;
    }
    if (selectedProducts.length === 0) {
      alert('Mohon pilih minimal satu materi produk.');
      return;
    }

    const targetDates: string[] = [];
    if (dateMode === 'single') {
      if (!formDate) {
        alert('Mohon tentukan tanggal pelaksanaan.');
        return;
      }
      targetDates.push(formDate);
    } else {
      if (!formStartDate || !formEndDate) {
        alert('Mohon tentukan rentang tanggal pelaksanaan.');
        return;
      }
      if (new Date(formStartDate) > new Date(formEndDate)) {
        alert('Tanggal mulai tidak boleh melebihi tanggal selesai.');
        return;
      }

      let current = new Date(formStartDate);
      const end = new Date(formEndDate);
      let limit = 0;
      while (current <= end && limit < 30) {
        targetDates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
        limit++;
      }
    }

    // Validate times
    if (dateMode === 'single') {
      if (!formStartTime || !formEndTime) {
        alert('Mohon tentukan jam pelaksanaan.');
        return;
      }
    } else {
      for (const d of targetDates) {
        const dStartTime = formDateTimes[d]?.startTime;
        const dEndTime = formDateTimes[d]?.endTime;
        if (!dStartTime || !dEndTime) {
          alert(`Mohon tentukan jam pelaksanaan untuk tanggal ${d}.`);
          return;
        }
      }
    }

    if (formTrainingType === 'Eksternal' && !formCompanyName.trim()) {
      alert('Mohon tentukan nama perusahaan untuk training eksternal.');
      return;
    }

    if (!formTrainingTitle.trim()) {
      alert('Mohon tentukan nama / judul pelatihan.');
      return;
    }

    const trainerNames = selectedTrainers.join(', ') || 'Asesor Utama';
    const defaultWeights = { teoriWeight: 30, praktekWeight: 40, rolePlayWeight: 30 };
    const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

    const newSessionsList: TrainingSession[] = [];
    let googleSyncCount = 0;

    for (const d of targetDates) {
      const dayIndex = new Date(d).getDay();
      const dayName = indonesianDays[dayIndex] || 'Senin';
      
      const sessionStartTime = dateMode === 'single'
        ? formStartTime
        : (formDateTimes[d]?.startTime || '09:00');
      
      const sessionEndTime = dateMode === 'single'
        ? formEndTime
        : (formDateTimes[d]?.endTime || '11:00');

      const participantsToLoop = (formTrainingType === 'Eksternal' && selectedParticipants.length === 0)
        ? ['']
        : selectedParticipants;

      for (const pId of participantsToLoop) {
        for (const prodId of selectedProducts) {
          const participant = participants.find((p) => p.id === pId);
          const product = products.find((p) => p.id === prodId);

          if (!product) continue;
          if (formTrainingType === 'Internal' && !participant) continue;

          let createdGoogleEventId = '';

          // Google Calendar Sync
          if (googleToken) {
            const summary = formTrainingTitle.trim() || `[SkillMetric] Training ${product.name}${participant ? ` - ${participant.name}` : ''}`;
            const companySuffix = formTrainingType === 'Eksternal' && formCompanyName ? `\nPerusahaan: ${formCompanyName}` : '';
            const participantSuffix = participant ? `\nPeserta: ${participant.name} (${participant.nip})` : '\nPeserta: Eksternal / Tamu';
            const description = `Sesi Training SkillMetric\n\nJudul: ${formTrainingTitle.trim() || `Training ${product.name}`}${participantSuffix}${companySuffix}\nProduk: ${product.name} (${product.code})\nTrainer: ${trainerNames}\nKategori: ${formTrainingType}\nCatatan: ${formNotes}`;
            const startISO = `${d}T${sessionStartTime}:00`;
            const endISO = `${d}T${sessionEndTime}:00`;

            const attendeesList = formGuestEmails
              ? formGuestEmails.split(',').map(e => e.trim()).filter(e => e.includes('@')).map(email => ({ email }))
              : undefined;

            const newGEvent: GoogleCalendarEvent = {
              summary,
              description,
              start: { dateTime: startISO, timeZone: 'Asia/Jakarta' },
              end: { dateTime: endISO, timeZone: 'Asia/Jakarta' },
              attendees: attendeesList,
            };

            try {
              const resultG = await createGoogleEvent(googleToken, newGEvent);
              if (resultG.id) {
                createdGoogleEventId = resultG.id;
                googleSyncCount++;
              }
            } catch (err) {
              console.error('Gagal membuat event otomatis di Google Calendar:', err);
            }
          }

          const newSession: TrainingSession = {
            id: `sess_cal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            participantId: pId,
            productId: prodId,
            productCategory: product.category,
            trainingType: formTrainingType, // Selected Internal/Eksternal category
            companyName: formTrainingType === 'Eksternal' ? formCompanyName : undefined,
            trainingTitle: formTrainingTitle.trim() || `Training ${product.name}`,
            guestEmails: formGuestEmails.trim() || undefined,
            targetAudience: product.targetAudience || 'Sales',
            date: d,
            day: dayName,
            startTime: sessionStartTime,
            endTime: sessionEndTime,
            trainerName: trainerNames,
            preTestScore: 0,
            postTestScore: 0,
            teoriScore: 0,
            praktekScore: 0,
            rolePlayScore: 0,
            appliedWeights: defaultWeights,
            finalScore: 0,
            nGainScore: 0,
            nGainCategory: 'Rendah',
            kkmThreshold: product.defaultKKM,
            status: 'Belum Kompeten',
            qualitativeGrade: 'D (Perlu Remedial)',
            createdAt: new Date().toISOString(),
            googleEventId: createdGoogleEventId || undefined,
          };

          newSessionsList.push(newSession);
        }
      }
    }

    setSessions((prev) => [...newSessionsList, ...prev]);
    setIsModalOpen(false);

    if (googleToken) {
      loadGoogleEvents();
    }

    setSyncMessage({
      type: 'success',
      text: googleToken
        ? `Berhasil menyimpan ${newSessionsList.length} sesi (Tersinkronisasi ke Google Calendar: ${googleSyncCount} sesi).`
        : `Berhasil menjadwalkan ${newSessionsList.length} sesi training secara lokal!`,
    });
  };

  const handleDeleteSchedule = async (sessionToDelete: TrainingSession) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menghapus jadwal.');
      return;
    }

    if (!confirm('Apakah Anda yakin ingin menghapus jadwal training ini?')) {
      return;
    }

    // Delete from local
    setSessions((prev) => prev.filter((s) => s.id !== sessionToDelete.id));

    // Delete from Google Calendar if connected and has googleEventId
    if (googleToken && sessionToDelete.googleEventId) {
      try {
        await deleteGoogleEvent(googleToken, sessionToDelete.googleEventId);
        setSyncMessage({
          type: 'success',
          text: 'Jadwal training berhasil dihapus dari SkillMetric & Google Calendar!',
        });
      } catch (err) {
        console.error('Gagal menghapus event di Google Calendar:', err);
      }
    } else {
      setSyncMessage({
        type: 'success',
        text: 'Jadwal training lokal berhasil dihapus.',
      });
    }

    setSelectedEvent(null);
    if (googleToken) {
      loadGoogleEvents();
    }
  };

  // Plan Handlers
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planTitle || !planStartDate || !planEndDate) {
      alert('Mohon isi Judul, Tanggal Mulai, dan Tanggal Selesai.');
      return;
    }

    const newPlan: TrainingPlan = {
      id: `plan_${Date.now()}`,
      title: planTitle,
      productId: planProductId || 'none',
      type: planType,
      startDate: planStartDate,
      endDate: planEndDate,
      trainer: planTrainer || 'Trainer internal',
      targetAudience: planTargetAudience || 'Seluruh Sales/Teknisi',
      quota: planQuota,
      registeredCount: 0,
      status: 'Direncanakan',
      description: planDescription,
      createdAt: new Date().toISOString(),
    };

    setTrainingPlans((prev) => [newPlan, ...prev]);
    setIsPlanModalOpen(false);

    // Reset Form
    setPlanTitle('');
    setPlanProductId('');
    setPlanType('Internal');
    setPlanStartDate('');
    setPlanEndDate('');
    setPlanTrainer('');
    setPlanTargetAudience('');
    setPlanQuota(15);
    setPlanDescription('');

    setSyncMessage({
      type: 'success',
      text: 'Perencanaan training berhasil disimpan di database!',
    });
  };

  const handleDeletePlan = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menghapus perencanaan training.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus perencanaan training ini?')) {
      setTrainingPlans((prev) => prev.filter((p) => p.id !== id));
      setSyncMessage({
        type: 'success',
        text: 'Perencanaan training berhasil dihapus.',
      });
    }
  };

  // Request Handlers
  const handleSaveRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqParticipantId || !reqProductId || !reqDate || !reqReason) {
      alert('Mohon lengkapi seluruh kolom wajib pengajuan.');
      return;
    }

    const participant = participants.find((p) => p.id === reqParticipantId);
    const product = products.find((p) => p.id === reqProductId);

    if (!participant || !product) return;

    const newRequest: TrainingRequest = {
      id: `req_${Date.now()}`,
      participantId: reqParticipantId,
      productId: reqProductId,
      type: reqType,
      requestedDate: reqDate,
      reason: reqReason,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    setTrainingRequests((prev) => [newRequest, ...prev]);
    setIsRequestModalOpen(false);

    // Reset Form
    setReqParticipantId('');
    setReqProductId('');
    setReqType('Internal');
    setReqDate('');
    setReqReason('');

    // Trigger Admin Email Notification Simulation
    const adminEmail = 'titaharyanti.TH@gmail.com';
    const emailSubject = `[SkillMetric] Pengajuan Training Baru: ${product.name} - ${participant.name}`;
    const emailBody = `Halo Admin SkillMetric,

Karyawan berikut telah mengajukan request pelatihan training baru:

- Nama Karyawan: ${participant.name}
- NIP / Departemen: ${participant.nip} / ${participant.department}
- Materi Produk: [${product.category}] ${product.name} (${product.code})
- Tipe Training: ${reqType}
- Rencana Tanggal: ${reqDate}
- Alasan / Kebutuhan:
"${reqReason}"

Mohon segera login ke Dashboard SkillMetric untuk menyetujui atau menolak pengajuan ini.

Salam,
Sistem Otomasi SkillMetric`;

    // Save email info to trigger popup notification card
    setEmailStatus({
      active: true,
      recipient: adminEmail,
      subject: emailSubject,
      body: emailBody,
    });

    setSyncMessage({
      type: 'success',
      text: 'Pengajuan training berhasil disimpan dan dikirim ke Admin!',
    });
  };

  const handleApproveRequest = (request: TrainingRequest) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menyetujui pengajuan.');
      return;
    }

    // Update Request Status
    setTrainingRequests((prev) =>
      prev.map((r) => (r.id === request.id ? { ...r, status: 'Disetujui', adminNotes: 'Disetujui oleh Admin' } : r))
    );

    // Automatically schedule a real session on the requested date!
    const participant = participants.find((p) => p.id === request.participantId);
    const product = products.find((p) => p.id === request.productId);

    if (participant && product) {
      const defaultWeights = { teoriWeight: 30, praktekWeight: 40, rolePlayWeight: 30 };
      const indonesianDays = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const dayName = indonesianDays[new Date(request.requestedDate).getDay()] || 'Senin';

      const autoSession: TrainingSession = {
        id: `sess_req_auto_${Date.now()}`,
        participantId: request.participantId,
        productId: request.productId,
        productCategory: product.category,
        trainingType: request.type,
        targetAudience: participant.department,
        date: request.requestedDate,
        day: dayName,
        startTime: '09:00',
        endTime: '11:00',
        trainerName: 'Asesor Utama (Auto Assigned)',
        preTestScore: 0,
        postTestScore: 0,
        teoriScore: 0,
        praktekScore: 0,
        rolePlayScore: 0,
        appliedWeights: defaultWeights,
        finalScore: 0,
        nGainScore: 0,
        nGainCategory: 'Rendah',
        kkmThreshold: product.defaultKKM,
        status: 'Belum Kompeten',
        qualitativeGrade: 'D (Perlu Remedial)',
        createdAt: new Date().toISOString(),
      };

      setSessions((prev) => [autoSession, ...prev]);

      setSyncMessage({
        type: 'success',
        text: 'Pengajuan disetujui! Sesi training baru otomatis dijadwalkan di Kalender.',
      });
    }
  };

  const handleRejectRequest = (id: string, notes: string) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menolak pengajuan.');
      return;
    }

    setTrainingRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'Ditolak', adminNotes: notes || 'Tidak disetujui oleh Admin' } : r))
    );

    setSyncMessage({
      type: 'success',
      text: 'Pengajuan training telah ditolak.',
    });
  };

  const handleDeleteRequest = (id: string) => {
    if (!isAdmin) {
      handleRequireAdmin('Akses Admin diperlukan untuk menghapus pengajuan.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus arsip pengajuan ini?')) {
      setTrainingRequests((prev) => prev.filter((r) => r.id !== id));
      setSyncMessage({
        type: 'success',
        text: 'Arsip pengajuan berhasil dihapus.',
      });
    }
  };

  // Render month grid days
  const renderCalendarDays = () => {
    const days = [];
    const todayStr = new Date().toISOString().split('T')[0];

    // Blank cells before first day of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(
        <div
          key={`blank-${i}`}
          className="bg-slate-50/50 border border-slate-100 min-h-[95px] p-1.5"
        />
      );
    }

    // Actual month days
    for (let day = 1; day <= totalDays; day++) {
      const dayDate = new Date(year, month, day);
      const yearStr = dayDate.getFullYear();
      const monthStr = String(dayDate.getMonth() + 1).padStart(2, '0');
      const dateStr = String(dayDate.getDate()).padStart(2, '0');
      const formattedDate = `${yearStr}-${monthStr}-${dateStr}`;

      const localSess = getSessionsForDate(formattedDate);
      const googleEvs = getGoogleEventsForDate(formattedDate);
      const isToday = formattedDate === todayStr;

      days.push(
        <div
          key={`day-${day}`}
          onClick={() => handleOpenAddModal(dayDate)}
          className={`border border-slate-200 min-h-[105px] p-2 flex flex-col justify-between hover:bg-slate-50 transition-colors cursor-pointer relative group ${
            isToday ? 'bg-blue-50/60 border-blue-300' : 'bg-white'
          }`}
        >
          {/* Day number */}
          <div className="flex justify-between items-center">
            <span
              className={`text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center ${
                isToday
                  ? 'bg-blue-600 text-white shadow-2xs font-extrabold'
                  : 'text-slate-700'
              }`}
            >
              {day}
            </span>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-blue-600 font-bold flex items-center gap-0.5">
              <Plus className="w-3 h-3" /> Jadwal
            </span>
          </div>

          {/* Event Lists indicators */}
          <div className="mt-1.5 space-y-1 overflow-y-auto max-h-[70px] pr-0.5">
            {localSess.map((s) => {
              const part = participants.find((p) => p.id === s.participantId);
              const prod = products.find((p) => p.id === s.productId);
              return (
                <div
                  key={s.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent({ type: 'local', session: s });
                  }}
                  className="px-1.5 py-0.5 rounded-sm bg-blue-100 border-l-2 border-blue-600 text-[9px] font-semibold text-blue-900 truncate hover:bg-blue-200 transition-colors flex items-center justify-between"
                  title={`${prod?.name || 'Training'} - ${part?.name || 'Peserta'}`}
                >
                  <span className="truncate">
                    {s.startTime} | {prod?.name || 'Training'}
                  </span>
                  {s.googleEventId && (
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0 ml-1" title="Tersinkronisasi" />
                  )}
                </div>
              );
            })}

            {/* Render unique Google events that are NOT mapped locally */}
            {googleEvs.map((g) => {
              const isLocalSessLinked = localSess.some((s) => s.googleEventId === g.id);
              if (isLocalSessLinked) return null; // already shown above as sync dot

              return (
                <div
                  key={g.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEvent({ type: 'google', gEvent: g });
                  }}
                  className="px-1.5 py-0.5 rounded-sm bg-purple-100 border-l-2 border-purple-500 text-[9px] font-semibold text-purple-900 truncate hover:bg-purple-200 transition-colors"
                  title={g.summary}
                >
                  <span className="truncate">GCal | {g.summary.replace('[SkillMetric]', '').trim()}</span>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="space-y-6">
      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveSubTab('calendar')}
          className={`pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 px-1 relative -mb-[2px] cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'calendar'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Kalender Interaktif (GCal Sync)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('plans')}
          className={`pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 px-1 relative -mb-[2px] cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'plans'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Perencanaan & Jadwal Training</span>
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`pb-3 font-bold text-xs sm:text-sm transition-all border-b-2 px-1 relative -mb-[2px] cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'requests'
              ? 'border-blue-600 text-blue-600 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>Pengajuan Sesi (Karyawan)</span>
          {trainingRequests.filter((r) => r.status === 'Pending').length > 0 && (
            <span className="bg-red-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-full leading-none">
              {trainingRequests.filter((r) => r.status === 'Pending').length}
            </span>
          )}
        </button>
      </div>

      {/* Sync messages alert */}
      {syncMessage && (
        <div
          className={`px-4 py-3.5 rounded-xl border flex items-center justify-between gap-3 animate-none ${
            syncMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {syncMessage.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span className="text-xs font-semibold">{syncMessage.text}</span>
          </div>
          <button onClick={() => setSyncMessage(null)} className="text-slate-400 hover:text-slate-600 font-bold text-xs">
            ✕
          </button>
        </div>
      )}

      {/* TAB 1: CALENDAR INTERACTIVE VIEW */}
      {activeSubTab === 'calendar' && (
        <div className="space-y-6">
          {/* 1. Header Integration Control Bar */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Integrasi Kalender Training</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola jadwal dan singkronkan secara dua arah (Two-way Sync) dengan Google Calendar Anda.
                </p>
              </div>
            </div>

            {/* Integration Actions */}
            <div className="flex items-center gap-3 self-start md:self-auto">
              {googleUser ? (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2">
                    <div className="w-5 h-5 bg-gradient-to-tr from-emerald-500 to-green-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                      G
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-extrabold text-slate-400 leading-none">TERKONEKSI</p>
                      <p className="text-xs font-bold text-slate-700 max-w-[150px] truncate leading-normal">
                        {googleUser.email}
                      </p>
                    </div>
                    <button
                      onClick={handleGoogleSignOut}
                      className="ml-2 p-1 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                      title="Putuskan Koneksi Google Calendar"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleTwoWaySync}
                    disabled={isSyncing}
                    className="bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronisasi Dua Arah'}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isAuthLoading}
                  className="gsi-material-button w-full sm:w-auto"
                >
                  <div className="gsi-material-button-state"></div>
                  <div className="gsi-material-button-content-wrapper">
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: 'block' }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents">Koneksikan Google Calendar</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Calendar Grid Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Month Grid (3 cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Month Changer Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                  <span>
                    {indonesianMonths[month]} {year}
                  </span>
                </h3>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors"
                    title="Bulan Sebelumnya"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date(2026, 7, 1))}
                    className="px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-700 transition-colors"
                  >
                    Agustus 2026
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors"
                    title="Bulan Selanjutnya"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Weekday Titles */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/30">
                {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day) => (
                  <div
                    key={day}
                    className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 border-r border-slate-100 last:border-r-0"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Month Calendar Cells */}
              <div className="grid grid-cols-7 auto-rows-fr bg-slate-100/30 gap-px">
                {renderCalendarDays()}
              </div>
            </div>

            {/* Selected Event Details Sidebar (1 col) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                Rincian Kegiatan
              </h4>

              {selectedEvent ? (
                <div className="space-y-4 animate-none">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold mb-2">
                      {selectedEvent.type === 'local' ? (
                        <span className="bg-blue-50 border border-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                          SkillMetric Lokal
                        </span>
                      ) : (
                        <span className="bg-purple-50 border border-purple-200 text-purple-800 px-2 py-0.5 rounded-full">
                          Google Calendar
                        </span>
                      )}
                      {selectedEvent.session?.googleEventId && (
                        <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full">
                          Sinkron
                        </span>
                      )}
                    </div>

                    <h5 className="text-sm font-bold text-slate-900 leading-snug">
                      {selectedEvent.type === 'local'
                        ? products.find((p) => p.id === selectedEvent.session?.productId)?.name || 'Sesi Training'
                        : selectedEvent.gEvent?.summary.replace('[SkillMetric]', '').trim()}
                    </h5>
                  </div>

                  <div className="space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-start gap-2.5">
                      <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-800">Waktu Pelaksanaan</p>
                        <p className="text-[11px] text-slate-500">
                          {selectedEvent.type === 'local'
                            ? `${selectedEvent.session?.date} (${selectedEvent.session?.day})`
                            : selectedEvent.gEvent?.start?.dateTime
                            ? new Date(selectedEvent.gEvent.start.dateTime).toLocaleDateString('id-ID', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })
                            : selectedEvent.gEvent?.start?.date}
                        </p>
                        <p className="text-[11px] text-amber-600 font-bold mt-0.5">
                          {selectedEvent.type === 'local'
                            ? `${selectedEvent.session?.startTime} - ${selectedEvent.session?.endTime} WIB`
                            : selectedEvent.gEvent?.start?.dateTime
                            ? `${new Date(selectedEvent.gEvent.start.dateTime)
                                .toTimeString()
                                .split(' ')[0]
                                .substring(0, 5)} - ${new Date(selectedEvent.gEvent.end?.dateTime || '')
                                .toTimeString()
                                .split(' ')[0]
                                .substring(0, 5)} WIB`
                            : 'Sepanjang Hari'}
                        </p>
                      </div>
                    </div>

                    {selectedEvent.type === 'local' && selectedEvent.session && (
                      <>
                        {selectedEvent.session.trainingType && (
                          <div className="flex items-start gap-2.5">
                            <Tag className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">Kategori Training</p>
                              <p className="text-[11px] text-slate-500">
                                {selectedEvent.session.trainingType === 'Eksternal' ? 'Eksternal' : 'Internal'}
                                {selectedEvent.session.trainingType === 'Eksternal' && selectedEvent.session.companyName && (
                                  <span className="font-bold text-blue-600 block text-[10px]">
                                    Perusahaan: {selectedEvent.session.companyName}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-2.5">
                          <User className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Peserta Training</p>
                            <p className="text-[11px] text-slate-600 font-medium">
                              {participants.find((p) => p.id === selectedEvent.session?.participantId)?.name || 'Sesi Training'}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              NIP:{' '}
                              {participants.find((p) => p.id === selectedEvent.session?.participantId)?.nip || '-'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <BookOpen className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Trainer / Penguji</p>
                            <p className="text-[11px] text-slate-500">
                              {selectedEvent.session.trainerName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2.5">
                          <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-slate-800">Status Evaluasi</p>
                            <span
                              className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-sm mt-1 ${
                                selectedEvent.session.status === 'Kompeten'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {selectedEvent.session.status} (Nilai: {selectedEvent.session.finalScore})
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                    {selectedEvent.type === 'google' && selectedEvent.gEvent && (
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                        <p className="font-semibold text-slate-800">Deskripsi Google Calendar</p>
                        <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-line">
                          {selectedEvent.gEvent.description || 'Tidak ada deskripsi.'}
                        </p>
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                      {selectedEvent.type === 'local' && selectedEvent.session && (
                        <button
                          onClick={() => handleDeleteSchedule(selectedEvent.session!)}
                          className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-red-200"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus Jadwal</span>
                        </button>
                      )}

                      {selectedEvent.type === 'google' && selectedEvent.gEvent && (
                        <div className="w-full space-y-2">
                          <p className="text-[10px] text-slate-400 leading-normal">
                            Ingin mengimpor jadwal ini ke assessment SkillMetric?
                          </p>
                          <button
                            onClick={() => {
                              const dt = selectedEvent.gEvent?.start?.dateTime
                                ? new Date(selectedEvent.gEvent.start.dateTime)
                                : new Date();
                              const formattedDt = dt.toISOString().split('T')[0];
                              setSelectedDay(dt);
                              setFormDate(formattedDt);
                              setFormStartDate(formattedDt);
                              setFormEndDate(formattedDt);
                              setFormStartTime(
                                selectedEvent.gEvent?.start?.dateTime
                                  ? new Date(selectedEvent.gEvent.start.dateTime)
                                      .toTimeString()
                                      .split(' ')[0]
                                      .substring(0, 5)
                                  : '09:00'
                              );
                              setFormEndTime(
                                selectedEvent.gEvent?.end?.dateTime
                                  ? new Date(selectedEvent.gEvent.end.dateTime)
                                      .toTimeString()
                                      .split(' ')[0]
                                      .substring(0, 5)
                                  : '11:00'
                              );
                              setFormTrainerName('Google Advisor');
                              setFormNotes(selectedEvent.gEvent?.description || '');

                              // Initialize multi-select fields for Google Calendar imports
                              setFormTrainingType('Internal');
                              setSelectedDivisions([]);
                              setSelectedParticipants(participants[0] ? [participants[0].id] : []);
                              setSelectedProducts(products[0] ? [products[0].id] : []);
                              setDateMode('single');
                              setSelectedTrainers(['Google Advisor']);
                              setSearchParticipantText('');
                              setSearchProductText('');
                              setFormCompanyName('');
                              
                              const importedStartTime = selectedEvent.gEvent?.start?.dateTime
                                ? new Date(selectedEvent.gEvent.start.dateTime)
                                    .toTimeString()
                                    .split(' ')[0]
                                    .substring(0, 5)
                                : '09:00';
                              const importedEndTime = selectedEvent.gEvent?.end?.dateTime
                                ? new Date(selectedEvent.gEvent.end.dateTime)
                                    .toTimeString()
                                    .split(' ')[0]
                                    .substring(0, 5)
                                : '11:00';
                              
                              setFormDateTimes({
                                [formattedDt]: { startTime: importedStartTime, endTime: importedEndTime }
                              });
                              setIsModalOpen(true);
                            }}
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Impor ke SkillMetric</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10 space-y-2">
                  <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs text-slate-400">
                    Pilih salah satu jadwal di kalender untuk melihat rincian detail.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PLANS DASHBOARD (TABULAR TABLE) */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <span>Perencanaan & Program Jadwal Training</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Rencana strategis program pelatihan internal karyawan maupun penawaran demo produk eksternal.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={() => setIsPlanModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Buat Rencana Training</span>
              </button>
            )}
          </div>

          {/* Metric Bar (Mathematical, flat layout) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Program</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{trainingPlans.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Internal</span>
              <span className="text-2xl font-black text-slate-900 mt-1">
                {trainingPlans.filter((p) => p.type === 'Internal').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Eksternal</span>
              <span className="text-2xl font-black text-slate-900 mt-1">
                {trainingPlans.filter((p) => p.type === 'Eksternal').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Berjalan</span>
              <span className="text-2xl font-black text-amber-600 mt-1">
                {trainingPlans.filter((p) => p.status === 'Berjalan' || p.status === 'Direncanakan').length}
              </span>
            </div>
          </div>

          {/* Plans Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">Nama Pelatihan</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Periode Tanggal</th>
                    <th className="py-3 px-4">Trainer & Sasaran</th>
                    <th className="py-3 px-4">Kuota Peserta</th>
                    <th className="py-3 px-4">Status</th>
                    {isAdmin && <th className="py-3 px-4 text-right">Aksi</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainingPlans.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="py-12 text-center text-slate-400 font-medium">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        Belum ada perencanaan training yang tersimpan.
                      </td>
                    </tr>
                  ) : (
                    trainingPlans.map((plan) => {
                      const prod = products.find((p) => p.id === plan.productId);
                      return (
                        <tr key={plan.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-800">{plan.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 max-w-sm truncate">
                              {plan.description || 'Tidak ada deskripsi.'}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                plan.type === 'Internal'
                                  ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                  : 'bg-orange-50 border border-orange-200 text-orange-700'
                              }`}
                            >
                              {plan.type}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-600">
                            {plan.startDate} s/d {plan.endDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <p className="font-semibold text-slate-700">{plan.trainer}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">Sasaran: {plan.targetAudience}</p>
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            {plan.quota} Karyawan
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                plan.status === 'Selesai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : plan.status === 'Berjalan'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {plan.status}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => handleDeletePlan(plan.id)}
                                className="text-slate-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                title="Hapus Rencana"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: REQUEST TRAINING VIEW (PARTICIPANT REQUEST) */}
      {activeSubTab === 'requests' && (
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                <span>Pengajuan / Request Pelatihan Mandiri</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Karyawan dapat mengajukan pelatihan yang diinginkan secara mandiri. Notifikasi pengajuan akan diteruskan ke Email Admin secara langsung.
              </p>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Sesi Training</span>
            </button>
          </div>

          {/* Metric Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pengajuan</span>
              <span className="text-2xl font-black text-slate-900 mt-1">{trainingRequests.length}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Menunggu Approval</span>
              <span className="text-2xl font-black text-amber-600 mt-1">
                {trainingRequests.filter((r) => r.status === 'Pending').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Disetujui</span>
              <span className="text-2xl font-black text-emerald-600 mt-1">
                {trainingRequests.filter((r) => r.status === 'Disetujui').length}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ditolak</span>
              <span className="text-2xl font-black text-rose-600 mt-1">
                {trainingRequests.filter((r) => r.status === 'Ditolak').length}
              </span>
            </div>
          </div>

          {/* Request Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                    <th className="py-3 px-4">Nama Pengaju (Karyawan)</th>
                    <th className="py-3 px-4">Materi Pelatihan</th>
                    <th className="py-3 px-4">Tipe & Rencana Tanggal</th>
                    <th className="py-3 px-4">Alasan Kebutuhan</th>
                    <th className="py-3 px-4">Status Approval</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {trainingRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                        <Mail className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        Belum ada pengajuan training masuk.
                      </td>
                    </tr>
                  ) : (
                    trainingRequests.map((req) => {
                      const part = participants.find((p) => p.id === req.participantId);
                      const prod = products.find((p) => p.id === req.productId);
                      return (
                        <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-4">
                            {part ? (
                              <div>
                                <p className="font-bold text-slate-800">{part.name}</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  NIP: {part.nip} • {part.department}
                                </p>
                              </div>
                            ) : (
                              <div>
                                <p className="font-bold text-slate-700">Karyawan Umum</p>
                                <p className="text-[10px] text-slate-400 mt-0.5">ID: {req.participantId}</p>
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            {prod ? (
                              <div>
                                <p className="font-bold text-slate-800">{prod.name}</p>
                                <p className="text-[10px] text-slate-400">Kode: {prod.code} • [{prod.category}]</p>
                              </div>
                            ) : (
                              <span className="text-slate-400">Produk Tidak Diketahui</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="space-y-1">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  req.type === 'Internal'
                                    ? 'bg-blue-50 border border-blue-200 text-blue-700'
                                    : 'bg-orange-50 border border-orange-200 text-orange-700'
                                }`}
                              >
                                {req.type}
                              </span>
                              <p className="font-semibold text-slate-600">{req.requestedDate}</p>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 max-w-xs">
                            <p className="text-slate-600 line-clamp-2" title={req.reason}>
                              {req.reason}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold ${
                                req.status === 'Disetujui'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : req.status === 'Ditolak'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {req.status}
                            </span>
                            {req.adminNotes && (
                              <p className="text-[10px] text-slate-400 mt-1 italic">Catatan: {req.adminNotes}</p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {isAdmin && req.status === 'Pending' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleApproveRequest(req)}
                                  className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                                  title="Setujui & Jadwalkan Sesi"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Setujui</span>
                                </button>
                                <button
                                  onClick={() => {
                                    const note = prompt('Masukkan alasan penolakan (opsional):') || '';
                                    handleRejectRequest(req.id, note);
                                  }}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold px-2.5 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                                  title="Tolak Pengajuan"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  <span>Tolak</span>
                                </button>
                              </div>
                            ) : (
                              isAdmin && (
                                <button
                                  onClick={() => handleDeleteRequest(req.id)}
                                  className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Hapus Arsip"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: SCHEDULE ASSESSMENT CALENDAR MODAL (EXISTING) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-3xl p-6 space-y-4 animate-none max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5.5 h-5.5 text-blue-600" />
                <span>Rencana Penjadwalan Training Baru (Admin Mode)</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-5 text-xs text-slate-700">
              {/* Nama / Judul Pelatihan (Free Text) */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                  Nama / Judul Pelatihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTrainingTitle}
                  onChange={(e) => setFormTrainingTitle(e.target.value)}
                  placeholder="Contoh: Training Sertifikasi Kompetensi Sales Specialist"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm text-slate-800 shadow-3xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT COLUMN: BASIC SETUP, DATES, TIMES, TRAINERS */}
                <div className="space-y-4">
                  {/* Category of Training */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Kategori Training <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormTrainingType('Internal');
                          setSelectedDivisions([]);
                          setSelectedParticipants([]);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          formTrainingType === 'Internal'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Training Internal
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setFormTrainingType('Eksternal');
                          setSelectedDivisions([]);
                          setSelectedParticipants([]);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer text-center ${
                          formTrainingType === 'Eksternal'
                            ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Training Eksternal
                      </button>
                    </div>
                  </div>

                  {formTrainingType === 'Eksternal' && (
                    <div className="mb-4">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                        Nama Perusahaan / Klien <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formCompanyName}
                        onChange={(e) => setFormCompanyName(e.target.value)}
                        placeholder="Contoh: PT ABC Indonesia"
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        required
                      />
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Email Tamu (Guest Emails) <span className="text-slate-400 font-normal">(Opsional)</span>
                    </label>
                    <input
                      type="text"
                      value={formGuestEmails}
                      onChange={(e) => setFormGuestEmails(e.target.value)}
                      placeholder="Contoh: budi@gmail.com, rani@partner.com"
                      className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-slate-700"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Pisahkan dengan koma jika lebih dari satu. Otomatis disinkronkan ke Google Calendar.
                    </p>
                  </div>

                  {/* Date Mode and Inputs */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Tanggal Pelaksanaan <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <button
                        type="button"
                        onClick={() => setDateMode('single')}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                          dateMode === 'single'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Satu Tanggal (Single)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateMode('range')}
                        className={`py-1.5 px-3 rounded-lg text-[10px] font-bold border transition-all cursor-pointer text-center ${
                          dateMode === 'range'
                            ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        Rentang Tanggal (Range)
                      </button>
                    </div>

                    {dateMode === 'single' ? (
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        required
                      />
                    ) : (
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Tanggal Mulai</span>
                          <input
                            type="date"
                            value={formStartDate}
                            onChange={(e) => setFormStartDate(e.target.value)}
                            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[11px]"
                            required
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Tanggal Selesai</span>
                          <input
                            type="date"
                            value={formEndDate}
                            onChange={(e) => setFormEndDate(e.target.value)}
                            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[11px]"
                            required
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Start & End Time & Presets */}
                  {dateMode === 'single' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Jam Pelaksanaan <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-wrap gap-1 mb-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormStartTime('09:00');
                            setFormEndTime('11:00');
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9px] font-bold rounded text-slate-600 cursor-pointer"
                        >
                          09:00 - 11:00
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormStartTime('13:00');
                            setFormEndTime('15:00');
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9px] font-bold rounded text-slate-600 cursor-pointer"
                        >
                          13:00 - 15:00
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormStartTime('15:30');
                            setFormEndTime('17:30');
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9px] font-bold rounded text-slate-600 cursor-pointer"
                        >
                          15:30 - 17:30
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormStartTime('08:00');
                            setFormEndTime('17:00');
                          }}
                          className="px-2 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[9px] font-bold rounded text-slate-600 cursor-pointer"
                        >
                          08:00 - 17:00
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Jam Mulai</span>
                          <input
                            type="time"
                            value={formStartTime}
                            onChange={(e) => setFormStartTime(e.target.value)}
                            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[11px]"
                            required
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5 font-semibold">Jam Selesai</span>
                          <input
                            type="time"
                            value={formEndTime}
                            onChange={(e) => setFormEndTime(e.target.value)}
                            className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-md outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-[11px]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-[11px] font-bold text-slate-500">
                          Jam Pelaksanaan per Tanggal <span className="text-red-500">*</span>
                        </label>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-400 font-medium">Set semua ke:</span>
                          <button
                            type="button"
                            onClick={() => {
                              const dates = getDatesInRange(formStartDate, formEndDate);
                              const updated: typeof formDateTimes = {};
                              dates.forEach(d => {
                                updated[d] = { startTime: '09:00', endTime: '11:00' };
                              });
                              setFormDateTimes(updated);
                            }}
                            className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-[9px] font-bold rounded text-indigo-700 cursor-pointer"
                          >
                            09:00-11:00
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const dates = getDatesInRange(formStartDate, formEndDate);
                              const updated: typeof formDateTimes = {};
                              dates.forEach(d => {
                                updated[d] = { startTime: '13:00', endTime: '15:00' };
                              });
                              setFormDateTimes(updated);
                            }}
                            className="px-1.5 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-[9px] font-bold rounded text-indigo-700 cursor-pointer"
                          >
                            13:00-15:00
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2 bg-slate-50">
                        {getDatesInRange(formStartDate, formEndDate).length === 0 ? (
                          <p className="text-[10px] text-slate-400 text-center py-4">Tentukan tanggal mulai dan selesai terlebih dahulu.</p>
                        ) : (
                          getDatesInRange(formStartDate, formEndDate).map((d) => {
                            const dateObj = new Date(d);
                            const formattedLabel = dateObj.toLocaleDateString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            });
                            
                            const valStartTime = formDateTimes[d]?.startTime || '09:00';
                            const valEndTime = formDateTimes[d]?.endTime || '11:00';

                            return (
                              <div key={d} className="flex items-center justify-between gap-3 bg-white p-2 rounded-md border border-slate-100 shadow-3xs">
                                <span className="text-[10px] font-bold text-slate-700 w-24 truncate">{formattedLabel}</span>
                                <div className="flex items-center gap-1 flex-1">
                                  <input
                                    type="time"
                                    value={valStartTime}
                                    onChange={(e) => {
                                      setFormDateTimes(prev => ({
                                        ...prev,
                                        [d]: {
                                          startTime: e.target.value,
                                          endTime: prev[d]?.endTime || '11:00'
                                        }
                                      }));
                                    }}
                                    className="w-full py-1 px-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-[10px]"
                                    required
                                  />
                                  <span className="text-slate-400 text-[10px] font-bold">-</span>
                                  <input
                                    type="time"
                                    value={valEndTime}
                                    onChange={(e) => {
                                      setFormDateTimes(prev => ({
                                        ...prev,
                                        [d]: {
                                          startTime: prev[d]?.startTime || '09:00',
                                          endTime: e.target.value
                                        }
                                      }));
                                    }}
                                    className="w-full py-1 px-1.5 bg-slate-50 border border-slate-200 rounded outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-[10px]"
                                    required
                                  />
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {/* Trainers Selection List */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-bold text-slate-500">
                        Nama Trainer / Instruktur <span className="text-red-500">*</span>
                        {selectedTrainers.length > 0 && (
                          <span className="ml-1.5 text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-extrabold">
                            {selectedTrainers.length} Terpilih
                          </span>
                        )}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSelectedTrainers([])}
                        className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                      >
                        Reset Pilihan
                      </button>
                    </div>

                    <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 space-y-1.5 max-h-40 overflow-y-auto">
                      {[
                        'Asesor Tita Haryanti, S.T., M.T. (Group Product Trainer)',
                        'Sandy Azizi, S.T. (IoT Product Trainer)',
                        'Faturahman, S.M. (IoT Product Trainer)',
                        'Kristovel Lamrezeki Simanullang, S.T. (Hardware Technical Trainer)',
                        'Fakhri Syofwal, S.T. (Software & Platform Trainer)',
                      ].map((trainer) => {
                        const isChecked = selectedTrainers.includes(trainer);
                        // Calculate live status based on selected dates!
                        const statusInfo = (() => {
                          const datesToCheck: string[] = [];
                          if (dateMode === 'single') {
                            if (formDate) datesToCheck.push(formDate);
                          } else {
                            if (formStartDate && formEndDate) {
                              let curr = new Date(formStartDate);
                              const end = new Date(formEndDate);
                              let limit = 0;
                              while (curr <= end && limit < 30) {
                                datesToCheck.push(curr.toISOString().split('T')[0]);
                                curr.setDate(curr.getDate() + 1);
                                limit++;
                              }
                            }
                          }

                          if (datesToCheck.length === 0) {
                            return { isBusy: false, text: '📅 Tentukan tanggal' };
                          }

                          const busySessions = sessions.filter((s) =>
                            datesToCheck.includes(s.date) &&
                            s.trainerName &&
                            s.trainerName.toLowerCase().includes(trainer.toLowerCase())
                          );

                          if (busySessions.length > 0) {
                            const firstBusy = busySessions[0];
                            const busyProd = products.find((pr) => pr.id === firstBusy.productId);
                            const labelText = busyProd ? busyProd.name : 'Sesi Lain';
                            return {
                              isBusy: true,
                              text: `🔴 Sibuk: ${firstBusy.date === formDate ? '' : firstBusy.date + ' '}${firstBusy.startTime}-${firstBusy.endTime} (${labelText})`,
                            };
                          }

                          return { isBusy: false, text: '🟢 Tersedia' };
                        })();

                        return (
                          <label
                            key={trainer}
                            className={`flex items-start gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-semibold ${
                              isChecked ? 'bg-blue-50/60' : ''
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setSelectedTrainers((prev) =>
                                  isChecked ? prev.filter((t) => t !== trainer) : [...prev, trainer]
                                );
                              }}
                              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-slate-800 font-bold truncate leading-tight">{trainer}</p>
                              <p className={`text-[10px] font-semibold truncate mt-0.5 ${statusInfo.isBusy ? 'text-amber-600' : 'text-emerald-600'}`}>
                                {statusInfo.text}
                              </p>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: DIVISION FILTERS, MULTI-SELECT PARTICIPANTS, PRODUCTS */}
                <div className="space-y-4">
                  {/* Division multi-select filter */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5">
                      Filter Divisi Peserta (Multi-select)
                    </label>
                    <div className="flex flex-wrap gap-1">
                      {(formTrainingType === 'Internal'
                        ? [
                            'Sales Hardware',
                            'Sales Software',
                            'Sales Maritime',
                            'Telesales',
                            'Operation',
                            'Technician',
                            'Customer Success',
                            'Business Development',
                          ]
                        : [
                            'Calon Customer (Pitching)',
                            'Calon Customer (Demonstration)',
                            'Customer (Training)',
                          ]
                      ).map((dept) => {
                        const isSelected = selectedDivisions.includes(dept);
                        return (
                          <button
                            key={dept}
                            type="button"
                            onClick={() => {
                              setSelectedDivisions((prev) =>
                                isSelected ? prev.filter((d) => d !== dept) : [...prev, dept]
                              );
                            }}
                            className={`px-2 py-1 rounded-full text-[9px] font-bold border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {dept}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name of Employees / Participants Multi-select Checklist */}
                  <div>
                    {(() => {
                      const filteredParticipantsList = participants.filter((p) => {
                        const matchesDivision =
                          formTrainingType === 'Eksternal' ||
                          selectedDivisions.length === 0 ||
                          selectedDivisions.includes(p.department);
                        const matchesSearch =
                          searchParticipantText === '' ||
                          p.name.toLowerCase().includes(searchParticipantText.toLowerCase()) ||
                          p.nip.toLowerCase().includes(searchParticipantText.toLowerCase());
                        return matchesDivision && matchesSearch;
                      });

                      return (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-slate-500">
                              Pilih Karyawan / Peserta {formTrainingType === 'Internal' && <span className="text-red-500">*</span>}
                              {selectedParticipants.length > 0 && (
                                <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-extrabold">
                                  {selectedParticipants.length} Terpilih
                                </span>
                              )}
                            </label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const allFilteredIds = filteredParticipantsList.map((p) => p.id);
                                  setSelectedParticipants((prev) => {
                                    const otherSelected = prev.filter((id) => !allFilteredIds.includes(id));
                                    return [...otherSelected, ...allFilteredIds];
                                  });
                                }}
                                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                              >
                                Pilih Semua
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const allFilteredIds = filteredParticipantsList.map((p) => p.id);
                                  setSelectedParticipants((prev) => prev.filter((id) => !allFilteredIds.includes(id)));
                                }}
                                className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                              >
                                Hapus Semua
                              </button>
                            </div>
                          </div>

                          <div className="relative mb-2">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Cari nama karyawan / NIP..."
                              value={searchParticipantText}
                              onChange={(e) => setSearchParticipantText(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                            />
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 max-h-32 overflow-y-auto space-y-1">
                            {filteredParticipantsList.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-4">
                                Tidak ada karyawan yang cocok atau terdaftar dalam divisi terpilih.
                              </p>
                            ) : (
                              filteredParticipantsList.map((p) => {
                                const isChecked = selectedParticipants.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-start gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-semibold ${
                                      isChecked ? 'bg-blue-50/60' : ''
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setSelectedParticipants((prev) =>
                                          isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                                        );
                                      }}
                                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-slate-800 font-bold truncate">{p.name}</p>
                                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                        NIP: {p.nip} • <span className="text-blue-600 font-bold">{p.department}</span>
                                      </p>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>

                  {/* Product Materials Selection Checklist */}
                  <div>
                    {(() => {
                      const filteredProductsList = products.filter((p) => {
                        return (
                          searchProductText === '' ||
                          p.name.toLowerCase().includes(searchProductText.toLowerCase()) ||
                          p.code.toLowerCase().includes(searchProductText.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchProductText.toLowerCase())
                        );
                      });

                      return (
                        <>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-bold text-slate-500">
                              Pilih Materi Produk <span className="text-red-500">*</span>
                              {selectedProducts.length > 0 && (
                                <span className="ml-1.5 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-extrabold">
                                  {selectedProducts.length} Terpilih
                                </span>
                              )}
                            </label>
                            <div className="flex gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = filteredProductsList.map((p) => p.id);
                                  setSelectedProducts((prev) => {
                                    const otherSelected = prev.filter((id) => !allIds.includes(id));
                                    return [...otherSelected, ...allIds];
                                  });
                                }}
                                className="text-[10px] text-blue-600 hover:underline font-bold cursor-pointer"
                              >
                                Pilih Semua
                              </button>
                              <span className="text-slate-300">|</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const allIds = filteredProductsList.map((p) => p.id);
                                  setSelectedProducts((prev) => prev.filter((id) => !allIds.includes(id)));
                                }}
                                className="text-[10px] text-rose-600 hover:underline font-bold cursor-pointer"
                              >
                                Hapus Semua
                              </button>
                            </div>
                          </div>

                          <div className="relative mb-2">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                              <Search className="w-3.5 h-3.5" />
                            </span>
                            <input
                              type="text"
                              placeholder="Cari produk berdasarkan nama / kode..."
                              value={searchProductText}
                              onChange={(e) => setSearchProductText(e.target.value)}
                              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-blue-500 font-semibold text-slate-700"
                            />
                          </div>

                          <div className="border border-slate-200 rounded-lg p-2 bg-slate-50 max-h-32 overflow-y-auto space-y-1">
                            {filteredProductsList.length === 0 ? (
                              <p className="text-[10px] text-slate-400 text-center py-4">
                                Tidak ada materi produk yang terdaftar.
                              </p>
                            ) : (
                              filteredProductsList.map((p) => {
                                const isChecked = selectedProducts.includes(p.id);
                                return (
                                  <label
                                    key={p.id}
                                    className={`flex items-start gap-2 p-1.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer text-[11px] font-semibold ${
                                      isChecked ? 'bg-blue-50/60' : ''
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => {
                                        setSelectedProducts((prev) =>
                                          isChecked ? prev.filter((id) => id !== p.id) : [...prev, p.id]
                                        );
                                      }}
                                      className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-slate-800 font-bold truncate">{p.name}</p>
                                      <p className="text-[10px] text-slate-500 mt-0.5">
                                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold mr-1.5 ${
                                          p.category === 'Software'
                                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                        }`}>
                                          {p.category}
                                        </span>
                                        Code: {p.code}
                                      </p>
                                    </div>
                                  </label>
                                );
                              })
                            )}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              {/* Remarks / Additional Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Catatan Tambahan (Opsional)</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="Informasi tambahan terkait program training, lokasi, atau persiapan materi..."
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold h-14 resize-none text-[11px]"
                />
              </div>

              {googleToken && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-[10px] text-emerald-800 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>
                    Google Calendar Terhubung! Sistem akan mengotomatiskan sync schedule ke platform Google Anda.
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Semua Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATING TRAINING PLAN (ADMIN) */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-none max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Buat Perencanaan Program Training Baru</span>
              </h3>
              <button
                onClick={() => setIsPlanModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4 text-xs text-slate-700">
              {/* Plan Title */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Nama / Judul Pelatihan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={planTitle}
                  onChange={(e) => setPlanTitle(e.target.value)}
                  placeholder="Contoh: Pelatihan Standardisasi Hardware IoT Gateway"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Product Reference */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Referensi Produk <span className="text-red-500">*</span>
                </label>
                <select
                  value={planProductId}
                  onChange={(e) => setPlanProductId(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                >
                  <option value="">Pilih Referensi Produk...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Option */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Kategori Pelatihan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setPlanType('Internal')}
                    className={`py-2 px-3 font-bold rounded-lg border cursor-pointer text-center transition-colors ${
                      planType === 'Internal'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Internal (Karyawan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPlanType('Eksternal')}
                    className={`py-2 px-3 font-bold rounded-lg border cursor-pointer text-center transition-colors ${
                      planType === 'Eksternal'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Eksternal (Demo/Customer)
                  </button>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Tanggal Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={planStartDate}
                    onChange={(e) => setPlanStartDate(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Tanggal Selesai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={planEndDate}
                    onChange={(e) => setPlanEndDate(e.target.value)}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    required
                  />
                </div>
              </div>

              {/* Trainer & Target Audience */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Trainer / Pemateri</label>
                  <input
                    type="text"
                    value={planTrainer}
                    onChange={(e) => setPlanTrainer(e.target.value)}
                    placeholder="Nama Trainer"
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Kuota Peserta</label>
                  <input
                    type="number"
                    value={planQuota}
                    onChange={(e) => setPlanQuota(Number(e.target.value))}
                    className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    min={1}
                  />
                </div>
              </div>

              {/* Target Audience */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Sasaran Peserta / Target</label>
                <input
                  type="text"
                  value={planTargetAudience}
                  onChange={(e) => setPlanTargetAudience(e.target.value)}
                  placeholder="Contoh: Sales Hardware, Teknisi Lapangan"
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">Deskripsi / Sasaran Program</label>
                <textarea
                  value={planDescription}
                  onChange={(e) => setPlanDescription(e.target.value)}
                  placeholder="Jelaskan secara singkat mengenai perencanaan training ini..."
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold h-16 resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Simpan Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CREATING TRAINING REQUEST (PARTICIPANT) */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-4 animate-none max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                <span>Pengajuan Pelatihan Mandiri (Request Training)</span>
              </h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRequest} className="space-y-4 text-xs text-slate-700">
              {/* Participant Selection */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Nama Karyawan / Pemohon <span className="text-red-500">*</span>
                </label>
                <select
                  value={reqParticipantId}
                  onChange={(e) => setReqParticipantId(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                >
                  <option value="">Pilih Karyawan...</option>
                  {participants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.nip} - {p.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Reference */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Materi Produk Pelatihan <span className="text-red-500">*</span>
                </label>
                <select
                  value={reqProductId}
                  onChange={(e) => setReqProductId(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                >
                  <option value="">Pilih Materi Produk...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      [{p.category}] {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Type Option */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Kategori Pelatihan <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    type="button"
                    onClick={() => setReqType('Internal')}
                    className={`py-2 px-3 font-bold rounded-lg border cursor-pointer text-center transition-colors ${
                      reqType === 'Internal'
                        ? 'bg-blue-50 border-blue-500 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Internal (Karyawan)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReqType('Eksternal')}
                    className={`py-2 px-3 font-bold rounded-lg border cursor-pointer text-center transition-colors ${
                      reqType === 'Eksternal'
                        ? 'bg-orange-50 border-orange-500 text-orange-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Eksternal (Pitching/Demo)
                  </button>
                </div>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Tanggal Usulan Pelaksanaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={reqDate}
                  onChange={(e) => setReqDate(e.target.value)}
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  required
                />
              </div>

              {/* Reason / Alasan */}
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1">
                  Alasan Kebutuhan & Hasil yang Diharapkan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Jelaskan mengapa Anda memerlukan pelatihan ini dan hubungannya dengan tugas harian Anda..."
                  className="w-full py-2 px-3 bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-semibold h-24 resize-none"
                  required
                />
              </div>

              {/* Auto email note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-[10px] text-blue-800 flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Informasi Otomasi:</strong> Menyimpan pengajuan ini akan mengirimkan notifikasi ringkasan langsung ke email Admin utama <strong>titaharyanti.TH@gmail.com</strong> secara real-time.
                </span>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold shadow-xs cursor-pointer transition-colors"
                >
                  Kirim Pengajuan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: EMAIL NOTIFICATION SIMULATION DISPATCH REPORT */}
      {emailStatus && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg p-6 space-y-4 animate-none">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-extrabold text-blue-700 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                <span>Otomasi Notifikasi Email Terkirim</span>
              </h3>
              <button
                onClick={() => setEmailStatus(null)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4.5 space-y-3">
                <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Metode Pengiriman: Google Workspace Secure Proxy</p>
                <div className="grid grid-cols-5 gap-1 border-t border-blue-100 pt-2 text-[11px]">
                  <span className="font-bold text-slate-500 col-span-1">Penerima:</span>
                  <span className="text-slate-800 col-span-4 font-semibold">{emailStatus.recipient}</span>
                </div>
                <div className="grid grid-cols-5 gap-1 text-[11px]">
                  <span className="font-bold text-slate-500 col-span-1">Subjek:</span>
                  <span className="text-slate-800 col-span-4 font-bold">{emailStatus.subject}</span>
                </div>
                <div className="border-t border-blue-100 pt-2">
                  <p className="font-bold text-slate-500 mb-1 text-[11px]">Isi Email:</p>
                  <pre className="bg-white border border-slate-200 rounded-lg p-3 text-[10px] font-mono whitespace-pre-wrap text-slate-600 max-h-48 overflow-y-auto">
                    {emailStatus.body}
                  </pre>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Notifikasi email otomatis telah diantrekan di sistem pengiriman. Anda juga dapat mengirimkannya secara manual menggunakan aplikasi email default Anda:
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-3">
              <button
                onClick={() => setEmailStatus(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-colors"
              >
                Tutup Simulasi
              </button>
              <a
                href={`mailto:${emailStatus.recipient}?subject=${encodeURIComponent(emailStatus.subject)}&body=${encodeURIComponent(emailStatus.body)}`}
                onClick={() => setEmailStatus(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Lewat Email Client Saya</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
