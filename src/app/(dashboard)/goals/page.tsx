"use client"
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Target, Plus, Trophy } from 'lucide-react'
import { useStore } from '@/store/useStore'

export default function GoalsPage() {
  const { goals, addGoal, updateGoalProgress } = useStore()
  const [title, setTitle] = useState('')
  const [target, setTarget] = useState('')

  const handleAdd = () => {
    if(title && target) {
      addGoal({
        id: Date.now().toString(),
        title,
        progress: 0,
        target: Number(target),
        status: 'active'
      })
      setTitle(''); setTarget('')
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Milestones & Goals</h1>
          <p className="text-gray-400 mt-1">Track your long-term academic objectives.</p>
        </div>
      </div>

      <Card className="bg-white/5 border-white/10">
        <CardContent className="flex gap-2 p-4 items-center">
          <Input placeholder="Goal title (e.g. Complete 50 Leetcode Problems)" className="flex-1" value={title} onChange={e=>setTitle(e.target.value)}/>
          <Input type="number" placeholder="Target count" className="w-32" value={target} onChange={e=>setTarget(e.target.value)}/>
          <Button variant="premium" onClick={handleAdd}><Plus className="h-4 w-4"/></Button>
        </CardContent>
      </Card>

      {goals.length === 0 ? (
        <Card className="border-dashed border-white/20 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Trophy className="h-12 w-12 mb-4 opacity-20" />
            <p>No goals set. Aim high!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {goals.map(goal => {
            const pct = Math.min(100, (goal.progress / goal.target) * 100)
            return (
              <Card key={goal.id} premium className={goal.status === 'completed' ? 'border-emerald-500/50 opacity-80' : ''}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                      {goal.status === 'completed' && <Trophy className="h-5 w-5 text-emerald-500" />}
                      {goal.title}
                    </h3>
                    <div className="text-sm font-bold text-gray-400">
                      {goal.progress} / {goal.target}
                    </div>
                  </div>
                  
                  <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                    <div 
                      className={`h-3 rounded-full transition-all duration-500 ${goal.status === 'completed' ? 'bg-emerald-500' : 'bg-brand-electric'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {goal.status !== 'completed' && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => updateGoalProgress(goal.id, goal.progress + 1)}>
                        +1 Progress
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => updateGoalProgress(goal.id, goal.progress + 5)}>
                        +5 Progress
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
