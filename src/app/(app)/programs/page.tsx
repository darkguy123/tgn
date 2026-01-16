'use client';

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Users, Award,
  ChevronRight, Star, Calendar, ArrowLeft,
  BookCheck, Circle, CheckCircle, GraduationCap, Video
} from "lucide-react";
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import placeholderImages from "@/lib/placeholder-images.json";
import type { Program } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const curriculumPrograms = [
    { id: 'cur1', title: 'TGN Mentorship Fundamentals', description: 'Core principles of effective mentorship.', status: 'completed' },
    { id: 'cur2', title: 'Ethical Mentoring Practices', description: 'Understand the boundaries and responsibilities.', status: 'completed' },
    { id: 'cur3', title: 'Advanced Communication Strategies', description: 'Learn to listen, question, and guide.', status: 'in_progress' },
    { id: 'cur4', title: 'Goal Setting & Achievement', description: 'Help mentees define and reach their goals.', status: 'not_started' },
    { id: 'cur5', title: 'TGN Platform & Tools Practicum', description: 'Master the tools for successful mentorship.', status: 'not_started' },
    { id: 'cur6', title: 'Final Evaluation', description: 'Peer and expert review of your mentorship skills.', status: 'not_started' },
]

const myLearningPrograms = [
    { ...curriculumPrograms[2], progress: 60, imageId: 'program-executive-communication' },
    { id: 'learn2', title: 'Business Strategy 101', progress: 45, imageId: 'program-business-strategy' },
]

const ProgramsPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

  const firestore = useFirestore();
  const programsCollectionRef = useMemoFirebase(() => query(collection(firestore, 'programs'), where('deactivatedAt', '==', null)), [firestore]);
  const { data: allPrograms, isLoading, error } = useCollection<Program>(programsCollectionRef);

  const programsByType = useMemo(() => {
    if (!allPrograms) return { free: [], paid: [], executive: [] };
    
    return allPrograms.reduce((acc, program) => {
      const typeKey = program.type.toLowerCase() as 'free' | 'paid' | 'executive';
      if (!acc[typeKey]) {
        acc[typeKey] = [];
      }
      acc[typeKey].push(program);
      return acc;
    }, { free: [], paid: [], executive: [] } as Record<'free' | 'paid' | 'executive', Program[]>);
  }, [allPrograms]);


  if (selectedProgram) {
    const img = getImage(selectedProgram.imageId);
    return (
      <div>
        <Button 
          variant="ghost" 
          onClick={() => setSelectedProgram(null)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Programs
        </Button>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                 {img && (
                    <div className="mb-4 overflow-hidden rounded-lg">
                        <Image
                            src={img.imageUrl}
                            alt={selectedProgram.title}
                            width={800}
                            height={450}
                            className="aspect-video w-full object-cover"
                            data-ai-hint={img.imageHint}
                        />
                    </div>
                )}
                <CardTitle className="text-2xl">{selectedProgram.title}</CardTitle>
                <CardDescription className="flex flex-wrap items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-accent fill-accent" /> {selectedProgram.rating.toFixed(1)}
                    </span>
                    <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" /> {selectedProgram.enrolled || 0} enrolled
                    </span>
                    <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {selectedProgram.duration}
                    </span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                    <TabsTrigger value="mentor">Mentor</TabsTrigger>
                    <TabsTrigger value="schedule">Schedule</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <p className="text-muted-foreground">
                      {selectedProgram.description}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold text-foreground">{selectedProgram.duration}</p>
                      </div>
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">Certification</p>
                        <p className="font-semibold text-foreground">{selectedProgram.certified ? "Yes" : "No"}</p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="curriculum" className="space-y-3">
                    {[
                      "Module 1: Foundation & Core Concepts",
                      "Module 2: Practical Application",
                      "Module 3: Advanced Strategies",
                      "Module 4: Case Studies & Analysis",
                      "Module 5: Final Project & Assessment",
                    ].map((module, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                          {i + 1}
                        </div>
                        <span className="text-foreground">{module}</span>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="mentor">
                    <div className="flex items-start gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
                        {selectedProgram.mentor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground">{selectedProgram.mentor}</p>
                        <p className="text-muted-foreground text-sm mb-2">Executive Mentor • 15+ years experience</p>
                        <p className="text-muted-foreground text-sm">
                          A distinguished leader with extensive experience in mentoring and developing 
                          future leaders across multiple industries.
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="schedule" className="space-y-3">
                    {[
                      { day: "Week 1-2", topic: "Foundation Sessions", time: "Tuesdays, 3:00 PM" },
                      { day: "Week 3-4", topic: "Practical Workshops", time: "Thursdays, 2:00 PM" },
                      { day: "Week 5-6", topic: "Advanced Topics", time: "Tuesdays, 3:00 PM" },
                      { day: "Week 7-8", topic: "Final Project Review", time: "Flexible" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-primary" />
                          <div>
                            <p className="font-medium text-foreground">{item.topic}</p>
                            <p className="text-sm text-muted-foreground">{item.day}</p>
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{item.time}</span>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground mt-2">
                      📝 Note: Replays available for 30 days after completion.
                    </p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="sticky top-24">
              <CardContent className="p-6">
                {selectedProgram.price ? (
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-foreground">${selectedProgram.price}</p>
                    <p className="text-sm text-muted-foreground">one-time payment</p>
                  </div>
                ) : (
                  <div className="text-center mb-4">
                    <p className="text-3xl font-bold text-accent">FREE</p>
                  </div>
                )}
                <Button variant="accent" className="w-full mb-3" size="lg">
                  Enroll Now
                </Button>
                {(selectedProgram.format === 'Live' || selectedProgram.format === 'Hybrid') && selectedProgram.googleMeetUrl && (
                  <Button asChild variant="default" className="w-full mb-3" size="lg">
                    <a href={selectedProgram.googleMeetUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
                        <Video className="mr-2 h-5 w-5" />
                        Join Live Session
                    </a>
                  </Button>
                )}
                {selectedProgram.certified && (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Award className="h-4 w-4 text-accent" />
                    Certification eligible
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }
  
  const renderSkeletons = () => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i} className="flex flex-col">
          <CardHeader className="p-0 relative">
            <Skeleton className="aspect-[3/2] w-full rounded-t-lg" />
          </CardHeader>
          <CardContent className="p-4 flex flex-col flex-1">
            <Skeleton className="h-5 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="space-y-3 my-4 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
            <div className="flex items-center justify-between mt-auto">
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-9 w-1/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );


  return (
    <div>
       <Tabs defaultValue="explore">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
            <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Programs & Mentorship</h1>
                <p className="text-muted-foreground">Explore curated learning paths designed by industry leaders.</p>
            </div>
            <TabsList>
                <TabsTrigger value="explore">Explore All</TabsTrigger>
                <TabsTrigger value="my-learning">My Learning</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>
        </div>
        
        <TabsContent value="explore">
            <Tabs defaultValue="free" className="space-y-6">
                <TabsList>
                <TabsTrigger value="free">Free</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="executive">Executive</TabsTrigger>
                </TabsList>
                
                {error && <p className="text-destructive">Failed to load programs.</p>}

                {Object.entries(programsByType).map(([key, programs]) => (
                <TabsContent key={key} value={key}>
                    {isLoading ? renderSkeletons() : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {programs.length === 0 && !isLoading && <p className="text-muted-foreground col-span-full">No {key} programs found.</p>}
                        {programs.map((program) => {
                        const img = getImage(program.imageId);
                        return (
                            <Card 
                                key={program.id} 
                                className="flex flex-col hover:shadow-card transition-all duration-300 cursor-pointer group"
                                onClick={() => setSelectedProgram(program)}
                            >
                                <CardHeader className="p-0 relative">
                                {img ? (
                                    <Image
                                        src={img.imageUrl}
                                        alt={program.title}
                                        width={600}
                                        height={400}
                                        className="aspect-[3/2] w-full object-cover rounded-t-lg"
                                        data-ai-hint={img.imageHint}
                                    />
                                ) : (
                                    <div className="aspect-[3/2] w-full object-cover rounded-t-lg bg-muted flex items-center justify-center">
                                        <p className="text-muted-foreground text-sm">No Image</p>
                                    </div>
                                )}
                                </CardHeader>
                                <CardContent className="p-4 flex flex-col flex-1">
                                    <CardTitle className="text-lg group-hover:text-primary transition-colors leading-tight">
                                    {program.title}
                                    </CardTitle>
                                    <CardDescription className="mt-1">with {program.mentor}</CardDescription>
                                    <div className="space-y-3 my-4 flex-1">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Clock className="h-4 w-4" /> {program.duration}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                        <Star className="h-4 w-4 text-accent fill-accent" /> {program.rating.toFixed(1)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="flex items-center gap-1.5 text-muted-foreground">
                                        <Users className="h-4 w-4" /> {program.enrolled || 0} enrolled
                                        </span>
                                        {program.certified && (
                                        <span className="flex items-center gap-1.5 text-accent font-medium">
                                            <Award className="h-4 w-4" /> Certified
                                        </span>
                                        )}
                                    </div>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        {program.price ? (
                                            <span className="text-xl font-bold text-foreground">${program.price}</span>
                                        ) : (
                                            <span className="text-xl font-bold text-accent">Free</span>
                                        )}
                                        <Button variant="accent" size="sm">
                                            View Program <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                        })}
                    </div>
                    )}
                </TabsContent>
                ))}
            </Tabs>
        </TabsContent>

        <TabsContent value="my-learning">
            <div className="grid md:grid-cols-2 gap-6">
                {myLearningPrograms.map((program) => {
                    const img = getImage(program.imageId);
                    return (
                        <Card key={program.id} className="flex flex-col sm:flex-row items-start gap-4 p-4">
                            {img && <Image src={img.imageUrl} alt={program.title} width={150} height={100} className="rounded-lg aspect-video object-cover w-full sm:w-[150px]" />}
                            <div className="flex-1 w-full">
                                <h3 className="font-semibold">{program.title}</h3>
                                <div className="flex justify-between items-center text-sm text-muted-foreground my-2">
                                    <span>Progress</span>
                                    <span className="font-semibold text-primary">{program.progress}%</span>
                                </div>
                                <div className="h-2 bg-muted rounded-full">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${program.progress}%`}} />
                                </div>
                                <Button variant="secondary" className="w-full mt-3">Continue Learning</Button>
                            </div>
                        </Card>
                    )
                })}
            </div>
        </TabsContent>

        <TabsContent value="curriculum">
             <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="text-primary" />
                        TGN Mentor Certification Path
                    </CardTitle>
                    <CardDescription>Complete all modules to earn your certification. This is a crucial step towards becoming a recognized mentor in our network.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    {curriculumPrograms.map((item, index) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg">
                            <div>
                                {item.status === 'completed' && <CheckCircle className="h-6 w-6 text-green-500" />}
                                {item.status === 'in_progress' && <Clock className="h-6 w-6 text-primary animate-pulse" />}
                                {item.status === 'not_started' && <Circle className="h-6 w-6 text-muted-foreground" />}
                            </div>
                            <div className="flex-1">
                                <h4 className={cn("font-medium", item.status === 'not_started' && 'text-muted-foreground')}>{item.title}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                            <Button 
                                variant={item.status === 'in_progress' ? 'default' : 'outline'}
                                size="sm"
                                disabled={item.status === 'completed'}
                            >
                                {item.status === 'completed' ? 'Completed' : 'Start Module'}
                            </Button>
                        </div>
                    ))}
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-muted-foreground">Once all modules are complete, you will be eligible for the final evaluation.</p>
                </CardFooter>
            </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default ProgramsPage;
