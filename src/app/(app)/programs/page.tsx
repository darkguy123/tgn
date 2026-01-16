'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Clock, Users, Award,
  ChevronRight, Star, Calendar, ArrowLeft
} from "lucide-react";
import { programs as PROGRAMS_BY_TYPE } from "@/lib/data";
import placeholderImages from "@/lib/placeholder-images.json";
import type { Program } from "@/lib/types";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

const ProgramsPage = () => {
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const router = useRouter();

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
                    <Users className="h-4 w-4" /> {selectedProgram.enrolled} enrolled
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

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Programs & Mentorship</h1>
        <p className="text-muted-foreground">Explore curated learning paths designed by industry leaders.</p>
      </div>

      <Tabs defaultValue="free" className="space-y-6">
        <TabsList>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="executive">Executive</TabsTrigger>
        </TabsList>

        {Object.entries(PROGRAMS_BY_TYPE).map(([key, programs]) => (
          <TabsContent key={key} value={key}>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => {
                const img = getImage(program.imageId);
                return (
                    <Card 
                      key={program.id} 
                      className="flex flex-col hover:shadow-card transition-all duration-300 cursor-pointer group"
                      onClick={() => setSelectedProgram(program)}
                    >
                      <CardHeader className="p-0 relative">
                        {img && (
                            <Image
                                src={img.imageUrl}
                                alt={program.title}
                                width={600}
                                height={400}
                                className="aspect-[3/2] w-full object-cover rounded-t-lg"
                                data-ai-hint={img.imageHint}
                            />
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
                                <Users className="h-4 w-4" /> {program.enrolled} enrolled
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ProgramsPage;
