import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  name: string;
  email: string;
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
  addExam: (exam: Exam) => void;
  updateStats: (newStats: Partial<Stats>) => void;
  
  addNote: (note: Note) => void;
  updateNote: (id: string, content: string) => void;
  
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
    (set) => ({
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

      setUser: (user) => set((state) => {
        const updatedUserDataByEmail = { ...state.userDataByEmail };
        
        // 1. Save the previous user's data before logging out or switching
        if (state.user) {
          const prevEmail = state.user.email.toLowerCase();
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

        if (savedData) {
          return {
            user,
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
      }),

      registerUser: (user) => set((state) => {
        const email = user.email.toLowerCase();
        if (!state.registeredUsers.find(u => u.email.toLowerCase() === email)) {
          return { registeredUsers: [...state.registeredUsers, { ...user, email }] }
        }
        return state;
      }),

      setLastVisitedPath: (path) => set({ lastVisitedPath: path }),
      
      addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
      
      updateTaskStatus: (taskId, status) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, status } : t)
      })),
      
      editTask: (taskId, updatedTask) => set((state) => ({
        tasks: state.tasks.map((t) => t.id === taskId ? { ...t, ...updatedTask } : t)
      })),
      
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== taskId)
      })),

      addExam: (exam) => set((state) => ({ exams: [...state.exams, exam] })),
      
      updateStats: (newStats) => set((state) => ({
        stats: { ...state.stats, ...newStats }
      })),

      addNote: (note) => set((state) => ({ notes: [...state.notes, note] })),
      updateNote: (id, content) => set((state) => ({
        notes: state.notes.map(n => n.id === id ? { ...n, content, updatedAt: new Date() } : n)
      })),

      addAttendanceRecord: (record) => set((state) => ({ attendanceRecords: [...state.attendanceRecords, record] })),
      updateAttendance: (id, attended, total) => set((state) => ({
        attendanceRecords: state.attendanceRecords.map(a => a.id === id ? { ...a, attended, total } : a)
      })),
      deleteAttendanceRecord: (id) => set((state) => ({
        attendanceRecords: state.attendanceRecords.filter(a => a.id !== id)
      })),
      editAttendanceRecord: (id, updated) => set((state) => ({
        attendanceRecords: state.attendanceRecords.map(a => a.id === id ? { ...a, ...updated } : a)
      })),

      addTimetableSlot: (slot) => set((state) => {
        const hasRecord = state.attendanceRecords.some(r => r.subject.toLowerCase() === slot.subject.toLowerCase());
        const updatedRecords = hasRecord 
          ? state.attendanceRecords 
          : [...state.attendanceRecords, {
              id: Date.now().toString() + Math.random().toString(),
              subject: slot.subject,
              attended: 0,
              total: 0,
              target: 75
            }];
        return {
          timetableSlots: [...state.timetableSlots, slot],
          attendanceRecords: updatedRecords
        }
      }),
      deleteTimetableSlot: (id) => set((state) => ({
        timetableSlots: state.timetableSlots.filter(s => s.id !== id)
      })),
      updateTimetableSlot: (id, updatedSlot) => set((state) => {
        const updatedSlots = state.timetableSlots.map(s => s.id === id ? { ...s, ...updatedSlot } : s);
        const updatedRecords = [...state.attendanceRecords];
        if (updatedSlot.subject) {
          const hasRecord = updatedRecords.some(r => r.subject.toLowerCase() === updatedSlot.subject!.toLowerCase());
          if (!hasRecord) {
            updatedRecords.push({
              id: Date.now().toString() + Math.random().toString(),
              subject: updatedSlot.subject,
              attended: 0,
              total: 0,
              target: 75
            });
          }
        }
        return {
          timetableSlots: updatedSlots,
          attendanceRecords: updatedRecords
        }
      }),

      addSemester: (semester) => set((state) => ({ semesters: [...state.semesters, semester] })),
      addCourse: (semesterId, course) => set((state) => ({
        semesters: state.semesters.map(s => s.id === semesterId ? { ...s, courses: [...s.courses, course] } : s)
      })),

      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      updateGoalProgress: (id, progress) => set((state) => ({
        goals: state.goals.map(g => g.id === id ? { ...g, progress, status: progress >= g.target ? 'completed' : 'active' } : g)
      })),

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
    }
  )
)
