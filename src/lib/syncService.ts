import { supabase } from './supabase'
import { Task, Note, AttendanceRecord, Semester, Goal, TimetableSlot } from '@/store/useStore'

export const syncService = {
  // --- Profiles Auth ---
  async getUserProfile(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email.toLowerCase())
      .single()
    if (error) return null
    return data
  },

  async getUserProfileById(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return null
    return data
  },

  async saveUserProfile(id: string, email: string, name: string, profilePic?: string) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id,
        email: email.toLowerCase(),
        name,
        profile_pic: profilePic || '',
        is_deleted: false
      })
      .select()
      .single()
    return { data, error }
  },

  // --- Pull Data from Cloud ---
  async pullAllUserData(email: string) {
    const cleanedEmail = email.toLowerCase()
    
    const [tasksRes, notesRes, attendanceRes, semestersRes, goalsRes, timetableRes] = await Promise.all([
      supabase.from('tasks').select('*').eq('email', cleanedEmail),
      supabase.from('notes').select('*').eq('email', cleanedEmail),
      supabase.from('attendance').select('*').eq('email', cleanedEmail),
      supabase.from('semesters').select('*').eq('email', cleanedEmail),
      supabase.from('goals').select('*').eq('email', cleanedEmail),
      supabase.from('timetable').select('*').eq('email', cleanedEmail)
    ])

    return {
      tasks: (tasksRes.data || []).map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        priority: t.priority,
        tags: t.tags,
        topics: t.topics,
        startDate: t.start_date,
        dueDate: t.due_date
      })) as Task[],
      notes: (notesRes.data || []).map(n => ({
        id: n.id,
        title: n.title,
        content: n.content,
        folderId: n.subject,
        description: n.description,
        subNotes: n.sub_notes,
        savepoints: n.savepoints,
        updatedAt: new Date(n.updated_at)
      })) as Note[],
      attendanceRecords: (attendanceRes.data || []).map(a => ({
        id: a.id,
        subject: a.subject,
        attended: a.attended,
        total: a.total,
        target: a.target
      })) as AttendanceRecord[],
      semesters: (semestersRes.data || []).map(s => ({
        id: s.id,
        name: s.name,
        courses: s.courses
      })) as Semester[],
      goals: (goalsRes.data || []).map(g => ({
        id: g.id,
        title: g.title,
        progress: g.progress,
        target: g.target,
        deadline: g.deadline ? new Date(g.deadline) : undefined,
        status: g.status
      })) as Goal[],
      timetableSlots: (timetableRes.data || []).map(s => ({
        id: s.id,
        subject: s.subject,
        day: s.day,
        startTime: s.start_time,
        endTime: s.end_time
      })) as TimetableSlot[]
    }
  },

  // --- Push All Local Data to Cloud ---
  async pushAllUserData(email: string, data: {
    tasks: Task[];
    notes: Note[];
    attendanceRecords: AttendanceRecord[];
    semesters: Semester[];
    goals: Goal[];
    timetableSlots: TimetableSlot[];
  }) {
    const cleanedEmail = email.toLowerCase()

    // 1. Wipe all old database rows for this email to prevent duplicate or orphan items
    await Promise.all([
      supabase.from('tasks').delete().eq('email', cleanedEmail),
      supabase.from('notes').delete().eq('email', cleanedEmail),
      supabase.from('attendance').delete().eq('email', cleanedEmail),
      supabase.from('semesters').delete().eq('email', cleanedEmail),
      supabase.from('goals').delete().eq('email', cleanedEmail),
      supabase.from('timetable').delete().eq('email', cleanedEmail),
    ])

    // 2. Insert the fresh local dataset cleanly in parallel
    await Promise.all([
      data.tasks.length > 0 ? supabase.from('tasks').insert(
        data.tasks.map(t => ({
          id: t.id,
          email: cleanedEmail,
          title: t.title,
          status: t.status,
          priority: t.priority,
          tags: t.tags || [],
          topics: t.topics || [],
          start_date: t.startDate || null,
          due_date: t.dueDate || null
        }))
      ) : Promise.resolve(),

      data.notes.length > 0 ? supabase.from('notes').insert(
        data.notes.map(n => ({
          id: n.id,
          email: cleanedEmail,
          title: n.title,
          content: n.content,
          subject: n.folderId || 'General Study',
          description: n.description || '',
          sub_notes: n.subNotes || [],
          savepoints: n.savepoints || [],
          updated_at: new Date(n.updatedAt || new Date()).toISOString()
        }))
      ) : Promise.resolve(),

      data.attendanceRecords.length > 0 ? supabase.from('attendance').insert(
        data.attendanceRecords.map(a => ({
          id: a.id,
          email: cleanedEmail,
          subject: a.subject,
          attended: a.attended,
          total: a.total,
          target: a.target
        }))
      ) : Promise.resolve(),

      data.semesters.length > 0 ? supabase.from('semesters').insert(
        data.semesters.map(s => ({
          id: s.id,
          email: cleanedEmail,
          name: s.name,
          courses: s.courses || []
        }))
      ) : Promise.resolve(),

      data.goals.length > 0 ? supabase.from('goals').insert(
        data.goals.map(g => ({
          id: g.id,
          email: cleanedEmail,
          title: g.title,
          progress: g.progress,
          target: g.target,
          deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
          status: g.status
        }))
      ) : Promise.resolve(),

      data.timetableSlots.length > 0 ? supabase.from('timetable').insert(
        data.timetableSlots.map(s => ({
          id: s.id,
          email: cleanedEmail,
          subject: s.subject,
          day: s.day,
          start_time: s.startTime,
          end_time: s.endTime
        }))
      ) : Promise.resolve()
    ])
  },

  // --- Individual Sync Actions ---
  
  // Tasks
  async upsertTask(email: string, t: Task) {
    await supabase.from('tasks').upsert({
      id: t.id,
      email: email.toLowerCase(),
      title: t.title,
      status: t.status,
      priority: t.priority,
      tags: t.tags || [],
      topics: t.topics || [],
      start_date: t.startDate || null,
      due_date: t.dueDate || null
    })
  },
  async deleteTask(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
  },

  // Notes
  async upsertNote(email: string, n: Note) {
    await supabase.from('notes').upsert({
      id: n.id,
      email: email.toLowerCase(),
      title: n.title,
      content: n.content,
      subject: n.folderId || 'General Study',
      description: n.description || '',
      sub_notes: n.subNotes || [],
      savepoints: n.savepoints || [],
      updated_at: new Date().toISOString()
    })
  },
  async deleteNote(id: string) {
    await supabase.from('notes').delete().eq('id', id)
  },

  // Attendance
  async upsertAttendance(email: string, a: AttendanceRecord) {
    await supabase.from('attendance').upsert({
      id: a.id,
      email: email.toLowerCase(),
      subject: a.subject,
      attended: a.attended,
      total: a.total,
      target: a.target
    })
  },
  async deleteAttendance(id: string) {
    await supabase.from('attendance').delete().eq('id', id)
  },

  // Semesters
  async upsertSemester(email: string, s: Semester) {
    await supabase.from('semesters').upsert({
      id: s.id,
      email: email.toLowerCase(),
      name: s.name,
      courses: s.courses || []
    })
  },
  async deleteSemester(id: string) {
    await supabase.from('semesters').delete().eq('id', id)
  },

  // Goals
  async upsertGoal(email: string, g: Goal) {
    await supabase.from('goals').upsert({
      id: g.id,
      email: email.toLowerCase(),
      title: g.title,
      progress: g.progress,
      target: g.target,
      deadline: g.deadline ? new Date(g.deadline).toISOString() : null,
      status: g.status
    })
  },
  async deleteGoal(id: string) {
    await supabase.from('goals').delete().eq('id', id)
  },

  // Timetable Slots
  async upsertTimetableSlot(email: string, s: TimetableSlot) {
    await supabase.from('timetable').upsert({
      id: s.id,
      email: email.toLowerCase(),
      subject: s.subject,
      day: s.day,
      start_time: s.startTime,
      end_time: s.endTime
    })
  },
  async deleteTimetableSlot(id: string) {
    await supabase.from('timetable').delete().eq('id', id)
  },

  // Permanent Profile & Data Deletion
  async deleteUserProfile(userId: string) {
    await supabase
      .from('profiles')
      .update({ is_deleted: true })
      .eq('id', userId)
  }
}
