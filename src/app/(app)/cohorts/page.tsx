'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Calendar, CheckSquare, Video, MessageSquare,
  Clock, Play, FileText, Award
} from "lucide-react";

const COHORT_SESSIONS = [
  { id: 1, title: "Week 4: Leadership Essentials", date: "Today, 3:00 PM", type: "Live", status: "upcoming" },
  { id: 2, title: "Week 3: Strategic Thinking", date: "Jan 3, 2026", type: "Recorded", status: "completed" },
  { id: 3, title: "Week 2: Communication Skills", date: "Dec 27, 2025", type: "Recorded", status: "completed" },
  { id: 4, title: "Week 1: Foundation & Intro", date: "Dec 20, 2025", type: "Recorded", status: "completed" },
];

const TASKS = [
  { id: 1, title: "Complete leadership assessment", due: "Jan 8", completed: false },
  { id: 2, title: "Submit case study analysis", due: "Jan 10", completed: false },
  { id: 3, title: "Peer feedback review", due: "Jan 5", completed: true },
  { id: 4, title: "Weekly reflection journal", due: "Jan 6", completed: true },
];

const ACCOUNTABILITY_GROUP = [
  { name: "Maria Santos", role: "Accountability Partner", avatar: "M" },
  { name: "David Kim", role: "Group Member", avatar: "D" },
  { name: "Elena Rodriguez", role: "Group Member", avatar: "E" },
  { name: "James Chen", role: "Group Member", avatar: "J" },
];

const BREAKOUT_ROOMS = [
  { id: 1, name: "Strategy Discussion", participants: 4, active: true },
  { id: 2, name: "Case Study Review", participants: 3, active: true },
  { id: 3, name: "Q&A with Mentor", participants: 6, active: false },
];

const CohortsPage = () => {
  const [tasks, setTasks] = useState(TASKS);

  const toggleTask = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Cohort</h1>
        <p className="text-muted-foreground">Leadership Excellence Program - Cohort 12</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">24</p>
                <p className="text-sm text-muted-foreground">Cohort Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">Week 4</p>
                <p className="text-sm text-muted-foreground">of 8 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">75%</p>
                <p className="text-sm text-muted-foreground">Tasks Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Award className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions" className="space-y-6">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="group">Accountability Group</TabsTrigger>
          <TabsTrigger value="breakout">Breakout Rooms</TabsTrigger>
        </TabsList>

        {/* Sessions Tab */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Sessions</CardTitle>
              <CardDescription>Live sessions and recorded content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {COHORT_SESSIONS.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${
                      session.status === 'upcoming' ? 'bg-accent/20' : 'bg-muted'
                    }`}>
                      {session.status === 'upcoming' ? (
                        <Video className="h-6 w-6 text-accent" />
                      ) : (
                        <Play className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{session.title}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {session.date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      session.type === 'Live' 
                        ? 'bg-accent/20 text-accent' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {session.type}
                    </span>
                    <Button variant={session.status === 'upcoming' ? 'accent' : 'outline'} size="sm">
                      {session.status === 'upcoming' ? 'Join Session' : 'Watch Replay'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Tasks & Assignments</CardTitle>
              <CardDescription>Track your progress</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleTask(task.id)}
                      className={`h-6 w-6 rounded border-2 flex items-center justify-center transition-colors ${
                        task.completed 
                          ? 'bg-accent border-accent text-white' 
                          : 'border-border hover:border-primary'
                      }`}
                    >
                      {task.completed && <CheckSquare className="h-4 w-4" />}
                    </button>
                    <div>
                      <p className={`font-medium ${task.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                        {task.title}
                      </p>
                      <p className="text-sm text-muted-foreground">Due: {task.due}</p>
                    </div>
                  </div>
                  {!task.completed && (
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-1" /> Submit
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Accountability Group Tab */}
        <TabsContent value="group">
          <Card>
            <CardHeader>
              <CardTitle>Accountability Group</CardTitle>
              <CardDescription>Your support network</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {ACCOUNTABILITY_GROUP.map((member, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Breakout Rooms Tab */}
        <TabsContent value="breakout">
          <Card>
            <CardHeader>
              <CardTitle>Breakout Rooms</CardTitle>
              <CardDescription>Join focused discussions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {BREAKOUT_ROOMS.map((room) => (
                <div 
                  key={room.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${room.active ? 'bg-green-500' : 'bg-muted-foreground'}`} />
                    <div>
                      <p className="font-medium text-foreground">{room.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {room.participants} participants • {room.active ? 'Active' : 'Ended'}
                      </p>
                    </div>
                  </div>
                  <Button variant={room.active ? 'accent' : 'outline'} size="sm" disabled={!room.active}>
                    {room.active ? 'Join Room' : 'Ended'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default CohortsPage;
