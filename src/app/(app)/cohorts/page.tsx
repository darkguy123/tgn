'use client';

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Calendar, CheckSquare, Video, MessageSquare,
  Clock, Play, FileText, Award
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, limit, query } from "firebase/firestore";
import type { TGNMember } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import placeholderImages from "@/lib/placeholder-images.json";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const CohortsPage = () => {
  const firestore = useFirestore();

  // Let's fetch some users to act as the accountability group
  const membersQuery = useMemoFirebase(() => query(collection(firestore, 'users'), limit(4)), [firestore]);
  const { data: accountabilityGroup, isLoading: isGroupLoading } = useCollection<TGNMember>(membersQuery);

  const getImage = (imageId?: string) => {
    if (!imageId) return null;
    return placeholderImages.placeholderImages.find((p) => p.id === imageId);
  };
  
  const getName = (member: TGNMember) => {
    return member.name || member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

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
            <CardContent className="space-y-4 text-center text-muted-foreground py-10">
                No sessions scheduled.
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
            <CardContent className="space-y-3 text-center text-muted-foreground py-10">
                No tasks assigned.
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
              {isGroupLoading ? (
                 <div className="grid md:grid-cols-2 gap-4">
                  {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {accountabilityGroup?.map((member, i) => {
                    const name = getName(member);
                    const avatarImg = getImage(member.imageId);
                    return (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                         <Avatar className="h-12 w-12">
                            <AvatarImage src={avatarImg?.imageUrl} />
                            <AvatarFallback className="bg-primary text-primary-foreground font-bold">{name.charAt(0)}</AvatarFallback>
                         </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{name}</p>
                          <p className="text-sm text-muted-foreground">{i === 0 ? 'Accountability Partner' : 'Group Member'}</p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/chat/${member.id}`}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Message
                        </Link>
                      </Button>
                    </div>
                  )})}
                </div>
              )}
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
            <CardContent className="space-y-4 text-center text-muted-foreground py-10">
                No active breakout rooms.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default CohortsPage;
