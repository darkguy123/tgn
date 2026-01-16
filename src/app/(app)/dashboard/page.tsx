
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Calendar,
  Wallet,
  Share2,
  Star,
  Heart,
  Bell,
  ChevronRight,
  Play,
  Clock,
  TrendingUp,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";

const Dashboard = () => {
  const { user } = useUser();
  const userName = user?.displayName?.split(" ")[0] || "Member";
  const router = useRouter();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Welcome, {userName}
        </h1>
        <p className="text-muted-foreground">Here's your journey at a glance.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-primary to-blue-800 text-primary-foreground border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-foreground/80 text-sm">
                  Badge Level
                </p>
                <p className="text-2xl font-bold">★ 3</p>
              </div>
              <Star className="h-8 w-8 text-yellow-300" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Courses</p>
                <p className="text-2xl font-bold text-foreground">4</p>
              </div>
              <BookOpen className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Mentors</p>
                <p className="text-2xl font-bold text-foreground">2</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Wallet</p>
                <p className="text-2xl font-bold text-foreground">$250</p>
              </div>
              <Wallet className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">My Courses</CardTitle>
                <CardDescription>
                  View progress • Resume learning
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/marketplace")}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    title: "Leadership Fundamentals",
                    progress: 75,
                    mentor: "Dr. Sarah Chen",
                  },
                  {
                    title: "Business Strategy 101",
                    progress: 45,
                    mentor: "Michael Okonkwo",
                  },
                ].map((course, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {course.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        with {course.mentor}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-purple-500">
                        {course.progress}%
                      </p>
                      <div className="w-16 h-1.5 bg-muted rounded-full mt-1">
                        <div
                          className="h-full bg-purple-500 rounded-full transition-all"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
                <CardDescription>View schedule • Join live</CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("#")}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    title: "Weekly Mentor Check-in",
                    time: "Today, 3:00 PM",
                    type: "1-on-1",
                  },
                  {
                    title: "Cohort Workshop: Pitching",
                    time: "Tomorrow, 10:00 AM",
                    type: "Group",
                  },
                  {
                    title: "Leadership Masterclass",
                    time: "Jan 8, 2:00 PM",
                    type: "Webinar",
                  },
                ].map((session, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {session.title}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {session.time}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                      {session.type}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-lg">Community Feed</CardTitle>
                <CardDescription>
                  Posts • Updates • Celebrations
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("#")}
              >
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    author: "Maria Santos",
                    role: "Mentee",
                    content:
                      "Just completed my first certification module! 🎉 Thank you to my mentor for the guidance.",
                    likes: 24,
                    time: "2h ago",
                  },
                  {
                    author: "David Kim",
                    role: "Mentor",
                    content:
                      "Excited to announce our new cohort starting next week. Applications open!",
                    likes: 42,
                    time: "5h ago",
                  },
                ].map((post, i) => (
                  <div key={i} className="p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                        {post.author[0]}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {post.author}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.role} • {post.time}
                        </p>
                      </div>
                    </div>
                    <p className="text-foreground mb-3">{post.content}</p>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <button className="flex items-center gap-1 hover:text-purple-500 transition-colors">
                        <Heart className="h-4 w-4" /> {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-primary transition-colors">
                        <MessageSquare className="h-4 w-4" /> Reply
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recommended for You</CardTitle>
              <CardDescription>
                Mentors • Programs • Opportunities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Dr. James Okafor", type: "Mentor", match: "98%" },
                { name: "Executive Leadership", type: "Program", match: "95%" },
                { name: "Tech Innovators Hub", type: "Community", match: "92%" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    {item.type === "Mentor" && (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                    {item.type === "Program" && (
                      <GraduationCap className="h-5 w-5 text-primary" />
                    )}
                    {item.type === "Community" && (
                      <Users className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground text-sm">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.type}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-purple-500">
                    {item.match}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                Certification Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Overall Progress
                  </span>
                  <span className="font-medium text-foreground">65%</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div className="h-full w-[65%] bg-purple-500 rounded-full" />
                </div>
                <div className="space-y-2 pt-2">
                  {[
                    { label: "Programs completed", value: "3/5", done: true },
                    { label: "Activity duration", value: "45 hrs", done: true },
                    {
                      label: "Assessment status",
                      value: "Pending",
                      done: false,
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <span
                        className={cn(
                          "font-medium",
                          item.done ? "text-purple-500" : "text-foreground"
                        )}
                      >
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => router.push("/certification")}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Share2 className="h-5 w-5" />
                Referral Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-4">
                <p className="text-3xl font-bold text-purple-500">$125</p>
                <p className="text-sm text-muted-foreground">Total earnings</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span>7-level referral preview</span>
              </div>
              <Button variant="outline" className="w-full">
                View Downline
              </Button>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-500" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  🏆 Mentor of the Month
                </p>
                <p className="text-xs text-muted-foreground">
                  Dr. Amara Obi - Africa Region
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  🌟 Mentee of the Month
                </p>
                <p className="text-xs text-muted-foreground">
                  Carlos Rivera - LATAM Region
                </p>
              </div>
              <div className="p-3 bg-card rounded-lg border border-border">
                <p className="font-medium text-foreground text-sm">
                  📅 Global Summit 2026
                </p>
                <p className="text-xs text-muted-foreground">
                  Registration opens Feb 1
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

    