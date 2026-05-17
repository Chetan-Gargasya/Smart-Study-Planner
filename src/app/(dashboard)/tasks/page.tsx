"use client"
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Search, Calendar, Tag, MoreHorizontal, X, Edit2, Trash2, CheckSquare, SortDesc } from 'lucide-react'

import { useStore } from '@/store/useStore'

export default function TasksPage() {
  const { tasks, addTask, updateTaskStatus, editTask } = useStore()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [newTaskStatus, setNewTaskStatus] = useState<'todo' | 'in-progress' | 'done'>('todo')
  const [newTaskTopics, setNewTaskTopics] = useState<any[]>([
    { title: '', startDate: '', dueDate: '', showDate: false },
    { title: '', startDate: '', dueDate: '', showDate: false },
    { title: '', startDate: '', dueDate: '', showDate: false }
  ])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPriority, setFilterPriority] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const todayDateStr = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 1);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  const openModal = (task?: any) => {
    if (task) {
      setEditingTask(task);
      setNewTaskTitle(task.title);
      setNewTaskPriority(task.priority || 'medium');
      setNewTaskStatus(task.status);
      
      let topics = task.topics ? task.topics.map((t: any) => ({ ...t, showDate: !!(t.startDate || t.dueDate) })) : [];
      if (topics.length < 3) {
        topics = [...topics, ...Array(3 - topics.length).fill(null).map(() => ({ title: '', startDate: '', dueDate: '', showDate: false }))];
      }
      setNewTaskTopics(topics);
    } else {
      setEditingTask(null);
      setNewTaskTitle('');
      setNewTaskPriority('medium');
      setNewTaskStatus('todo');
      setNewTaskTopics([
        { title: '', startDate: '', dueDate: '', showDate: false },
        { title: '', startDate: '', dueDate: '', showDate: false },
        { title: '', startDate: '', dueDate: '', showDate: false }
      ]);
    }
    setIsAddModalOpen(true);
  }

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingTask(null);
  }

  const handleSaveTask = () => {
    if (!newTaskTitle.trim()) return;
    const topicsArray = newTaskTopics
      .filter(t => t.title.trim())
      .map(t => ({
        title: t.title.trim(),
        startDate: t.showDate ? t.startDate : '',
        dueDate: t.showDate ? t.dueDate : '',
      }));
    
    if (editingTask) {
      editTask(editingTask.id, {
        title: newTaskTitle,
        status: newTaskStatus,
        priority: newTaskPriority,
        topics: topicsArray,
      });
    } else {
      addTask({
        id: Date.now().toString(),
        title: newTaskTitle,
        status: newTaskStatus,
        priority: newTaskPriority,
        topics: topicsArray,
      });
    }
    
    closeModal();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: 'todo' | 'in-progress' | 'done') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      updateTaskStatus(taskId, status);
    }
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = filterPriority === 'all' || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'priority-high') {
      const p: any = { high: 3, medium: 2, low: 1 };
      return (p[b.priority || 'low'] || 0) - (p[a.priority || 'low'] || 0);
    }
    if (sortBy === 'due-date') {
      const getEarliest = (task: any) => {
        if (!task.topics || task.topics.length === 0) return Number.MAX_SAFE_INTEGER;
        const dates = task.topics.map((t: any) => new Date(t.dueDate || t.startDate || '2100-01-01').getTime());
        return Math.min(...dates);
      };
      return getEarliest(a) - getEarliest(b);
    }
    if (sortBy === 'oldest') {
      return parseInt(a.id) - parseInt(b.id);
    }
    return parseInt(b.id) - parseInt(a.id);
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tasks & Assignments</h1>
          <p className="text-gray-400 mt-1">Manage your academic workload efficiently.</p>
        </div>
        <Button variant="premium" onClick={() => openModal()}>
          <Plus className="h-4 w-4 mr-2" /> Add Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full max-w-md">
          <CheckSquare className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-electric z-10" />
          <Input 
            placeholder="Search tasks..." 
            className="pl-10" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="relative min-w-[140px]">
            <select 
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="appearance-none h-10 w-full bg-transparent border border-white/10 text-white text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-electric [&>option]:bg-[#0a0a0b]"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
            <Tag className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="relative min-w-[140px]">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none h-10 w-full bg-transparent border border-white/10 text-white text-sm rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-1 focus:ring-brand-electric [&>option]:bg-[#0a0a0b]"
            >
              <option value="newest">Sort: Newest</option>
              <option value="oldest">Sort: Oldest</option>
              <option value="priority-high">Sort: Priority</option>
              <option value="due-date">Sort: Due Date</option>
            </select>
            <SortDesc className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Column */}
        <div 
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'todo')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gray-500"></span> To Do
            </h3>
            <span className="text-xs bg-white/10 px-2 py-1 rounded-full text-gray-400">{sortedTasks.filter(t => t.status === 'todo').length}</span>
          </div>
          {sortedTasks.filter(t => t.status === 'todo').map(task => (
            <TaskCard key={task.id} task={task} onEdit={() => openModal(task)} />
          ))}
          {sortedTasks.filter(t => t.status === 'todo').length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-white/10 rounded-xl">No tasks here</div>
          )}
        </div>

        {/* In Progress Column */}
        <div 
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'in-progress')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-brand-electric flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-electric animate-pulse"></span> In Progress
            </h3>
            <span className="text-xs bg-brand-electric/20 text-brand-electric px-2 py-1 rounded-full">{sortedTasks.filter(t => t.status === 'in-progress').length}</span>
          </div>
          {sortedTasks.filter(t => t.status === 'in-progress').map(task => (
            <TaskCard key={task.id} task={task} onEdit={() => openModal(task)} />
          ))}
          {sortedTasks.filter(t => t.status === 'in-progress').length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-white/10 rounded-xl">No tasks here</div>
          )}
        </div>

        {/* Done Column */}
        <div 
          className="space-y-4"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, 'done')}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-emerald-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Completed
            </h3>
            <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-1 rounded-full">{sortedTasks.filter(t => t.status === 'done').length}</span>
          </div>
          {sortedTasks.filter(t => t.status === 'done').map(task => (
            <TaskCard key={task.id} task={task} onEdit={() => openModal(task)} />
          ))}
          {sortedTasks.filter(t => t.status === 'done').length === 0 && (
            <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-white/10 rounded-xl">No tasks here</div>
          )}
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#0a0a0b] border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
                <button onClick={closeModal} className="text-gray-400 hover:text-white transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Task Title</label>
                  <Input 
                    placeholder="Enter task title..." 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-300">Topics / Tasks</label>
                    <button 
                      onClick={() => setNewTaskTopics([...newTaskTopics, { title: '', startDate: '', dueDate: '', showDate: false }])}
                      className="text-xs text-brand-electric hover:text-white transition-colors flex items-center"
                    >
                      <Plus className="h-3 w-3 mr-1" /> Add Topic
                    </button>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                    {newTaskTopics.map((topic, index) => (
                      <div key={index} className="flex flex-col gap-2 p-2 rounded-lg border border-white/5 bg-white/5">
                        <div className="flex gap-2 items-center">
                          <Input 
                            placeholder={`Topic ${index + 1}...`} 
                            value={topic.title}
                            onChange={(e) => {
                              const newTopics = [...newTaskTopics];
                              newTopics[index].title = e.target.value;
                              setNewTaskTopics(newTopics);
                            }}
                            className="bg-[#0a0a0b] border-transparent"
                          />
                          <button 
                            onClick={() => {
                              const newTopics = [...newTaskTopics];
                              newTopics[index].showDate = !newTopics[index].showDate;
                              setNewTaskTopics(newTopics);
                            }}
                            className={`p-2 rounded-md transition-colors ${topic.showDate ? 'bg-brand-electric text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                          >
                            <Calendar className="h-4 w-4" />
                          </button>
                          {newTaskTopics.length > 3 && (
                            <button 
                              onClick={() => {
                                const newTopics = [...newTaskTopics];
                                newTopics.splice(index, 1);
                                setNewTaskTopics(newTopics);
                              }}
                              className="text-gray-500 hover:text-red-500 p-2 hover:bg-white/10 rounded-md transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        {topic.showDate && (
                          <div className="flex gap-2 pt-1 border-t border-white/5">
                            <div className="w-1/2 space-y-1">
                              <label className="text-[10px] text-gray-400 px-1">Start Date</label>
                              <Input 
                                type="date"
                                value={topic.startDate}
                                min={todayDateStr}
                                max={maxDateStr}
                                onClick={(e) => {
                                  try {
                                    (e.target as HTMLInputElement).showPicker();
                                  } catch (err) {}
                                }}
                                onChange={(e) => {
                                  const newTopics = [...newTaskTopics];
                                  newTopics[index].startDate = e.target.value;
                                  setNewTaskTopics(newTopics);
                                }}
                                className="h-8 text-xs bg-[#0a0a0b] cursor-pointer"
                              />
                            </div>
                            <div className="w-1/2 space-y-1">
                              <label className="text-[10px] text-gray-400 px-1">Due Date</label>
                              <Input 
                                type="date"
                                value={topic.dueDate}
                                min={topic.startDate || todayDateStr}
                                max={maxDateStr}
                                onClick={(e) => {
                                  try {
                                    (e.target as HTMLInputElement).showPicker();
                                  } catch (err) {}
                                }}
                                onChange={(e) => {
                                  const newTopics = [...newTaskTopics];
                                  newTopics[index].dueDate = e.target.value;
                                  setNewTaskTopics(newTopics);
                                }}
                                className="h-8 text-xs bg-[#0a0a0b] cursor-pointer"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Status</label>
                    <select 
                      className="w-full flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      value={newTaskStatus}
                      onChange={(e) => setNewTaskStatus(e.target.value as 'todo' | 'in-progress' | 'done')}
                    >
                      <option value="todo" className="bg-[#0a0a0b]">To Do</option>
                      <option value="in-progress" className="bg-[#0a0a0b]">In Progress</option>
                      <option value="done" className="bg-[#0a0a0b]">Done</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Priority</label>
                    <select 
                      className="w-full flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-electric focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                    >
                      <option value="low" className="bg-[#0a0a0b]">Low</option>
                      <option value="medium" className="bg-[#0a0a0b]">Medium</option>
                      <option value="high" className="bg-[#0a0a0b]">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="outline" onClick={closeModal}>Cancel</Button>
                <Button variant="premium" onClick={handleSaveTask}>{editingTask ? 'Save Changes' : 'Create Task'}</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function TaskCard({ task, onEdit }: { task: any, onEdit: () => void }) {
  const { deleteTask } = useStore()

  return (
    <motion.div 
      layout 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }}
      draggable
      onDragStart={(e: any) => {
        e.dataTransfer.setData('taskId', task.id);
      }}
    >
      <Card className="cursor-grab active:cursor-grabbing hover:border-white/20 transition-all border-white/5 bg-[#0a0a0b]/80 group">
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-start">
            <p className="font-medium text-white">{task.title}</p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
              <button onClick={() => onEdit()} className="text-gray-500 hover:text-brand-electric p-1 transition-colors">
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteTask(task.id)} className="text-gray-500 hover:text-red-500 p-1 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-400">
            {task.topics && task.topics.length > 0 ? (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> {task.topics.length} {task.topics.length === 1 ? 'Topic' : 'Topics'}
              </span>
            ) : (
              <span className="flex items-center gap-1 opacity-50">
                <Tag className="h-3 w-3" /> No Topics
              </span>
            )}
            {task.status !== 'done' && task.priority && (
              <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'} className="text-[10px] px-1.5 py-0 capitalize">
                {task.priority}
              </Badge>
            )}
          </div>
          
          {task.topics && task.topics.length > 0 && (
            <div className="flex flex-col gap-1 w-full mt-2 pt-2 border-t border-white/5">
              {task.topics.map((topic: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 rounded px-2 py-1.5">
                  <span className="text-xs text-gray-300 truncate max-w-[120px]" title={topic.title}>{topic.title}</span>
                  {(topic.startDate || topic.dueDate) && (
                    <span className="text-[10px] text-gray-500 flex items-center gap-1 flex-shrink-0">
                      <Calendar className="h-3 w-3" />
                      {topic.startDate && topic.dueDate ? (
                        `${new Date(topic.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${new Date(topic.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      ) : topic.dueDate ? (
                        `Due: ${new Date(topic.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      ) : (
                        `Starts: ${new Date(topic.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
                      )}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
