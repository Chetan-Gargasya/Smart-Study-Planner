import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { syncService } from '../lib/syncService'


export interface User {
  id?: string;
  name: string;
  email: string;
  profilePic?: string;
}

export interface RegisteredUser {
  name: string;
  email: string;
  password?: string;
}

export interface UserData {
  tasks: Task[];
  exams: Exam[];
  stats: Stats;
  weeklyData: WeeklyData[];
  notes: Note[];
  attendanceRecords: AttendanceRecord[];
  timetableSlots: TimetableSlot[];
  semesters: Semester[];
  goals: Goal[];
  lastVisitedPath?: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done';
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
  topics?: {
    title: string;
    startDate?: string;
    dueDate?: string;
    completed?: boolean;
  }[];
  startDate?: string;
  dueDate?: string;
}

export interface Exam {
  id: string;
  title: string;
  date: Date;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface Note {
  id: string;
  title: string;
  content: string;
  folderId?: string;
  updatedAt: Date;
  description?: string;
  subNotes?: { id: string; text: string; completed: boolean }[];
  savepoints?: { id: string; label: string; timestamp: string }[];
}

export interface AttendanceRecord {
  id: string;
  subject: string;
  attended: number;
  total: number;
  target: number;
}

export interface TimetableSlot {
  id: string;
  subject: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
}

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

export interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export interface Goal {
  id: string;
  title: string;
  progress: number;
  target: number;
  deadline?: Date;
  status: 'active' | 'completed';
}

export interface Stats {
  studyHours: number;
  tasksCompleted: number;
  attendance: number;
  streak: number;
}

export interface WeeklyData {
  name: string;
  hours: number;
  focus: number;
}

interface StoreState {
  user: User | null;
  tasks: Task[];
  exams: Exam[];
  stats: Stats;
  weeklyData: WeeklyData[];
  
  notes: Note[];
  attendanceRecords: AttendanceRecord[];
  timetableSlots: TimetableSlot[];
  semesters: Semester[];
  goals: Goal[];
  registeredUsers: RegisteredUser[];
  userDataByEmail: Record<string, UserData>;
  lastVisitedPath: string;

  setUser: (user: User | null) => void;
  registerUser: (user: RegisteredUser) => void;
  setLastVisitedPath: (path: string) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;
  editTask: (taskId: string, updatedTask: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskTopicCompleted: (taskId: string, topicTitle: string) => void;
  addExam: (exam: Exam) => void;
  updateStats: (newStats: Partial<Stats>) => void;
  
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  editNote: (id: string, updatedNote: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendance: (id: string, attended: number, total: number) => void;
  deleteAttendanceRecord: (id: string) => void;
  editAttendanceRecord: (id: string, updated: Partial<AttendanceRecord>) => void;
  
  addTimetableSlot: (slot: TimetableSlot) => void;
  deleteTimetableSlot: (id: string) => void;
  updateTimetableSlot: (id: string, updatedSlot: Partial<TimetableSlot>) => void;
  
  addSemester: (semester: Semester) => void;
  addCourse: (semesterId: string, course: Course) => void;
  
  addGoal: (goal: Goal) => void;
  updateGoalProgress: (id: string, progress: number) => void;

  resetData: () => void;
}

const initialStats: Stats = {
  studyHours: 0,
  tasksCompleted: 0,
  attendance: 0,
  streak: 0,
}

const initialWeeklyData: WeeklyData[] = [
  { name: 'Mon', hours: 0, focus: 0 },
  { name: 'Tue', hours: 0, focus: 0 },
  { name: 'Wed', hours: 0, focus: 0 },
  { name: 'Thu', hours: 0, focus: 0 },
  { name: 'Fri', hours: 0, focus: 0 },
  { name: 'Sat', hours: 0, focus: 0 },
  { name: 'Sun', hours: 0, focus: 0 },
]

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      user: null,
      tasks: [],
      exams: [],
      stats: initialStats,
      weeklyData: initialWeeklyData,
      notes: [],
      attendanceRecords: [],
      timetableSlots: [],
      semesters: [],
      goals: [],
      registeredUsers: [],
      userDataByEmail: {},
      lastVisitedPath: '/dashboard',

      setUser: (user) => {
        set((state) => {
          const updatedUserDataByEmail = { ...state.userDataByEmail };
          
          // 1. Save the previous user's data before logging out or switching
          if (state.user) {
            const prevEmail = state.user.email.toLowerCase();
            const existingData = state.userDataByEmail[prevEmail];
            
            // Defensive Lock: Only save if we have actual active content, OR if no data exists yet.
            // This prevents empty unhydrated states from wiping out valid user databases!
            const hasActiveContent = 
              state.tasks.length > 0 || 
              state.notes.length > 0 || 
              state.attendanceRecords.length > 0 || 
              state.timetableSlots.length > 0 || 
              state.semesters.length > 0 || 
              state.goals.length > 0;

            if (hasActiveContent || !existingData) {
              updatedUserDataByEmail[prevEmail] = {
                tasks: state.tasks,
                exams: state.exams,
                stats: state.stats,
                weeklyData: state.weeklyData,
                notes: state.notes,
                attendanceRecords: state.attendanceRecords,
                timetableSlots: state.timetableSlots,
                semesters: state.semesters,
                goals: state.goals,
                lastVisitedPath: state.lastVisitedPath
              };
            }
          }

          // 2. If new user is null, reset active states
          if (!user) {
            return {
              user: null,
              userDataByEmail: updatedUserDataByEmail,
              tasks: [],
              exams: [],
              stats: initialStats,
              weeklyData: initialWeeklyData,
              notes: [],
              attendanceRecords: [],
              timetableSlots: [],
              semesters: [],
              goals: [],
              lastVisitedPath: '/dashboard'
            };
          }

          // 3. Load user-specific data if it exists
          const newEmail = user.email.toLowerCase();
          const savedData = updatedUserDataByEmail[newEmail];

          // Synchronize edited profile details back into the registered users database
          const updatedRegisteredUsers = state.registeredUsers.map(u => 
            u.email.toLowerCase() === newEmail 
              ? { ...u, name: user.name, profilePic: user.profilePic } 
              : u
          );

          if (savedData) {
            return {
              user,
              registeredUsers: updatedRegisteredUsers,
              userDataByEmail: updatedUserDataByEmail,
              tasks: savedData.tasks || [],
              exams: savedData.exams || [],
              stats: savedData.stats || initialStats,
              weeklyData: savedData.weeklyData || initialWeeklyData,
              notes: savedData.notes || [],
              attendanceRecords: savedData.attendanceRecords || [],
              timetableSlots: savedData.timetableSlots || [],
              semesters: savedData.semesters || [],
              goals: savedData.goals || [],
              lastVisitedPath: savedData.lastVisitedPath || '/dashboard'
            };
          } else {
            return {
              user,
              registeredUsers: updatedRegisteredUsers,
              userDataByEmail: updatedUserDataByEmail,
              tasks: [],
              exams: [],
              stats: initialStats,
              weeklyData: initialWeeklyData,
              notes: [],
              attendanceRecords: [],
              timetableSlots: [],
              semesters: [],
              goals: [],
              lastVisitedPath: '/dashboard'
            };
          }
        });

        // 4. Trigger cloud sync from Supabase in the background if a user is logging in
        if (user) {
          const email = user.email;
          syncService.pullAllUserData(email).then((cloudData) => {
            if (cloudData) {
              set((state) => {
                const hasLocalData = state.tasks.length > 0 || state.notes.length > 0 || state.attendanceRecords.length > 0 || state.timetableSlots.length > 0 || state.semesters.length > 0 || state.goals.length > 0;
                const hasCloudData = cloudData.tasks.length > 0 || cloudData.notes.length > 0 || cloudData.attendanceRecords.length > 0 || cloudData.timetableSlots.length > 0 || cloudData.semesters.length > 0 || cloudData.goals.length > 0;

                if (hasLocalData && !hasCloudData) {
                  // Push local data to Supabase cloud to back it up!
                  syncService.pushAllUserData(email, {
                    tasks: state.tasks,
                    notes: state.notes,
                    attendanceRecords: state.attendanceRecords,
                    semesters: state.semesters,
                    goals: state.goals,
                    timetableSlots: state.timetableSlots
                  });
                  return {}; // Local data is already active and now backed up!
                }

                // Otherwise, load cloud data into active state
                return {
                  tasks: cloudData.tasks,
                  notes: cloudData.notes,
                  attendanceRecords: cloudData.attendanceRecords,
                  timetableSlots: cloudData.timetableSlots,
                  semesters: cloudData.semesters,
                  goals: cloudData.goals
                };
              });
            }
          }).catch(err => console.error("Error pulling user data from Supabase:", err));
        }
      },

      registerUser: (user) => set((state) => {
        const email = user.email.toLowerCase();
        if (!state.registeredUsers.find(u => u.email.toLowerCase() === email)) {
          return { registeredUsers: [...state.registeredUsers, { ...user, email }] }
        }
        return state;
      }),

      setLastVisitedPath: (path) => set({ lastVisitedPath: path }),
      
            addTask: (task) => set((state) => {
        if (state.user) {
          syncService.upsertTask(state.user.email, task);
        }
        return { tasks: [...state.tasks, task] };
      }),
      
            updateTaskStatus: (taskId, status) => set((state) => {
        const updatedTasks = state.tasks.map((t) => t.id === taskId ? { ...t, status } : t);
        const task = updatedTasks.find(t => t.id === taskId);
        if (state.user && task) {
          syncService.upsertTask(state.user.email, task);
        }
        return { tasks: updatedTasks };
      }),
      
            editTask: (taskId, updatedTask) => set((state) => {
        const updatedTasks = state.tasks.map((t) => t.id === taskId ? { ...t, ...updatedTask } : t);
        const task = updatedTasks.find(t => t.id === taskId);
        if (state.user && task) {
          syncService.upsertTask(state.user.email, task);
        }
        return { tasks: updatedTasks };
      }),
      
            deleteTask: (taskId) => set((state) => {
        if (state.user) {
          syncService.deleteTask(taskId);
        }
        return { tasks: state.tasks.filter((t) => t.id !== taskId) };
      }),

            toggleTaskTopicCompleted: (taskId, topicTitle) => set((state) => {
        const updatedTasks = state.tasks.map((t) => {
          if (t.id !== taskId) return t
          const updatedTopics = (t.topics || []).map((tp) => 
            tp.title === topicTitle ? { ...tp, completed: !tp.completed } : tp
          )
          return { ...t, topics: updatedTopics }
        });
        const task = updatedTasks.find(t => t.id === taskId);
        if (state.user && task) {
          syncService.upsertTask(state.user.email, task);
        }
        return { tasks: updatedTasks };
      }),

      addExam: (exam) => set((state) => ({ exams: [...state.exams, exam] })),
      
      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

            addNote: (note) => set((state) => {
        if (state.user) {
          syncService.upsertNote(state.user.email, note);
        }
        return { notes: [...state.notes, note] };
      }),
            updateNote: (id, content) => set((state) => {
        const updatedNotes = state.notes.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n);
        const note = updatedNotes.find(n => n.id === id);
        if (state.user && note) {
          syncService.upsertNote(state.user.email, note);
        }
        return { notes: updatedNotes };
      }),
            editNote: (id, updatedNote) => set((state) => {
        const updatedNotes = state.notes.map(n => n.id === id ? { ...n, ...updatedNote, updatedAt: new Date() } : n);
        const note = updatedNotes.find(n => n.id === id);
        if (state.user && note) {
          syncService.upsertNote(state.user.email, note);
        }
        return { notes: updatedNotes };
      }),
            deleteNote: (id) => set((state) => {
        if (state.user) {
          syncService.deleteNote(id);
        }
        return { notes: state.notes.filter(n => n.id !== id) };
      }),

            addAttendanceRecord: (record) => set((state) => {
        if (state.user) {
          syncService.upsertAttendance(state.user.email, record);
        }
        return { attendanceRecords: [...state.attendanceRecords, record] };
      }),
            updateAttendance: (id, attended, total) => set((state) => {
        const updatedRecords = state.attendanceRecords.map(a => a.id === id ? { ...a, attended, total } : a);
        const record = updatedRecords.find(a => a.id === id);
        if (state.user && record) {
          syncService.upsertAttendance(state.user.email, record);
        }
        return { attendanceRecords: updatedRecords };
      }),
            deleteAttendanceRecord: (id) => set((state) => {
        if (state.user) {
          syncService.deleteAttendance(id);
        }
        return { attendanceRecords: state.attendanceRecords.filter(a => a.id !== id) };
      }),
            editAttendanceRecord: (id, updated) => set((state) => {
        const updatedRecords = state.attendanceRecords.map(a => a.id === id ? { ...a, ...updated } : a);
        const record = updatedRecords.find(a => a.id === id);
        if (state.user && record) {
          syncService.upsertAttendance(state.user.email, record);
        }
        return { attendanceRecords: updatedRecords };
      }),

            addTimetableSlot: (slot) => set((state) => {
        const hasRecord = state.attendanceRecords.some(r => r.subject.toLowerCase() === slot.subject.toLowerCase());
        const newRecord = {
          id: Date.now().toString() + Math.random().toString(),
          subject: slot.subject,
          attended: 0,
          total: 0,
          target: 75
        };
        const updatedRecords = hasRecord 
          ? state.attendanceRecords 
          : [...state.attendanceRecords, newRecord];
        
        if (state.user) {
          syncService.upsertTimetableSlot(state.user.email, slot);
          if (!hasRecord) {
            syncService.upsertAttendance(state.user.email, newRecord);
          }
        }
        return {
          timetableSlots: [...state.timetableSlots, slot],
          attendanceRecords: updatedRecords
        }
      }),
            deleteTimetableSlot: (id) => set((state) => {
        if (state.user) {
          syncService.deleteTimetableSlot(id);
        }
        return { timetableSlots: state.timetableSlots.filter(s => s.id !== id) };
      }),
            updateTimetableSlot: (id, updatedSlot) => set((state) => {
        const updatedSlots = state.timetableSlots.map(s => s.id === id ? { ...s, ...updatedSlot } : s);
        const updatedRecords = [...state.attendanceRecords];
        let newRecord = null;
        if (updatedSlot.subject) {
          const hasRecord = updatedRecords.some(r => r.subject.toLowerCase() === updatedSlot.subject!.toLowerCase());
          if (!hasRecord) {
            newRecord = {
              id: Date.now().toString() + Math.random().toString(),
              subject: updatedSlot.subject,
              attended: 0,
              total: 0,
              target: 75
            };
            updatedRecords.push(newRecord);
          }
        }

        const slot = updatedSlots.find(s => s.id === id);
        if (state.user && slot) {
          syncService.upsertTimetableSlot(state.user.email, slot);
          if (newRecord) {
            syncService.upsertAttendance(state.user.email, newRecord);
          }
        }
        return {
          timetableSlots: updatedSlots,
          attendanceRecords: updatedRecords
        }
      }),

            addSemester: (semester) => set((state) => {
        if (state.user) {
          syncService.upsertSemester(state.user.email, semester);
        }
        return { semesters: [...state.semesters, semester] };
      }),
            addCourse: (semesterId, course) => set((state) => {
        const updatedSemesters = state.semesters.map(s => s.id === semesterId ? { ...s, courses: [...s.courses, course] } : s);
        const semester = updatedSemesters.find(s => s.id === semesterId);
        if (state.user && semester) {
          syncService.upsertSemester(state.user.email, semester);
        }
        return { semesters: updatedSemesters };
      }),

            addGoal: (goal) => set((state) => {
        if (state.user) {
          syncService.upsertGoal(state.user.email, goal);
        }
        return { goals: [...state.goals, goal] };
      }),
            updateGoalProgress: (id, progress) => set((state) => {
        const updatedGoals = state.goals.map(g => g.id === id ? { ...g, progress, status: (progress >= g.target ? 'completed' : 'active') as 'completed' | 'active' } : g);
        const goal = updatedGoals.find(g => g.id === id);
        if (state.user && goal) {
          syncService.upsertGoal(state.user.email, goal);
        }
        return { goals: updatedGoals };
      }),

      resetData: () => set({
        tasks: [],
        exams: [],
        stats: initialStats,
        weeklyData: initialWeeklyData,
        notes: [],
        attendanceRecords: [],
        timetableSlots: [],
        semesters: [],
        goals: [],
      })
    }),
    {
      name: 'smart-study-storage',
      partialize: (state) => ({
        user: state.user,
        tasks: state.tasks,
        exams: state.exams,
        stats: state.stats,
        weeklyData: state.weeklyData,
        notes: state.notes,
        attendanceRecords: state.attendanceRecords,
        timetableSlots: state.timetableSlots,
        semesters: state.semesters,
        goals: state.goals,
        registeredUsers: state.registeredUsers,
        userDataByEmail: state.userDataByEmail,
        lastVisitedPath: state.lastVisitedPath,
      }),
    }
  )
)
