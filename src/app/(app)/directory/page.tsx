
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Search,
  Filter,
  MapPin,
  Users,
  ChevronDown,
  Briefcase,
  CheckCircle2,
  Send,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  countries,
  sectors,
  mentorTypes,
} from "@/lib/data";
import { useCollection, useFirestore, useMemoFirebase, useUser, errorEmitter, FirestorePermissionError } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import type { TGNMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const DirectoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    country: "All Countries",
    sector: "All Sectors",
    mentorType: "All Types",
  });
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  
  const firestore = useFirestore();
  const { user: currentUser } = useUser();
  const membersRef = useMemoFirebase(() => (firestore ? collection(firestore, 'users') : null), [firestore]);
  const { data: members, isLoading, error } = useCollection<TGNMember>(membersRef);
  const { toast } = useToast();

  const handleConnect = (recipientId: string) => {
    if (!currentUser || !firestore) {
      toast({
        variant: "destructive",
        title: "Not Signed In",
        description: "You must be signed in to connect with members.",
      });
      return;
    }
    if (currentUser.uid === recipientId) {
      toast({
        variant: "destructive",
        title: "Cannot Connect With Yourself",
        description: "You cannot send a connection request to yourself.",
      });
      return;
    }
    
    const friendRequestsCollection = collection(firestore, 'friend_requests');
    const dataToSave = {
        senderId: currentUser.uid,
        recipientId: recipientId,
        status: 'pending' as const,
        createdAt: serverTimestamp(),
    };

    addDoc(friendRequestsCollection, dataToSave)
        .then(() => {
            toast({
                title: "Request Sent!",
                description: "Your connection request has been sent.",
            });
        })
        .catch((error) => {
            console.error("Error sending connection request:", error);
            const permissionError = new FirestorePermissionError({
                path: friendRequestsCollection.path,
                operation: 'create',
                requestResourceData: dataToSave
            });
            errorEmitter.emit('permission-error', permissionError);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to send connection request. Please try again.',
            });
        });
  };


  const getName = (member: TGNMember) => {
    return member.name || member.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const filteredMembers = members?.filter((member) => {
    // Don't show the current user in the directory
    if (currentUser && member.id === currentUser.uid) {
        return false;
    }
    const name = getName(member);
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry =
      selectedFilters.country === "All Countries" ||
      member.locationCountry === selectedFilters.country;
    const matchesSector =
      selectedFilters.sector === "All Sectors" ||
      member.sectorPreferences?.includes(selectedFilters.sector);
    const matchesMentorType =
      selectedFilters.mentorType === "All Types" ||
      member.role === selectedFilters.mentorType;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesSector &&
      matchesMentorType
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
          Member Directory
        </h1>
        <p className="text-muted-foreground">Search and connect globally.</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search members by name or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showFilters && "rotate-180"
              )}
            />
          </Button>
        </div>

        {showFilters && (
          <Card className="animate-fade-in">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Country
                  </label>
                  <Select
                    value={selectedFilters.country}
                    onValueChange={(value) =>
                      setSelectedFilters((prev) => ({ ...prev, country: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Countries">All Countries</SelectItem>
                      {countries.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Sector
                  </label>
                  <Select
                    value={selectedFilters.sector}
                    onValueChange={(value) =>
                      setSelectedFilters((prev) => ({ ...prev, sector: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All Sectors">All Sectors</SelectItem>
                      {sectors.map((s) => (
                        <SelectItem key={s.name} value={s.name}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Role
                  </label>
                  <Select
                    value={selectedFilters.mentorType}
                    onValueChange={(value) =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        mentorType: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Role" />
                    </SelectTrigger>
                    <SelectContent>
                      {mentorTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-4"><div className="flex items-start gap-3 mb-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-3/4" /><div className="flex gap-2 pt-2"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-9 w-1/2" /></div></CardContent></Card>
        ))}
        {filteredMembers?.map((member) => {
          const name = getName(member);
          return (
            <Card
              key={member.id}
              className="hover:shadow-card transition-all duration-300 group"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                   <Avatar className="h-12 w-12 rounded-full">
                     <AvatarImage src={member.avatarUrl} alt={name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate flex items-center gap-2">
                        {name}
                        {member.isVerifiedMentor && (
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger>
                                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Verified Mentor</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        )}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">{member.role.replace('-', ' ')}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {member.locationCountry}
                  </div>
                  {member.sectorPreferences && member.sectorPreferences.length > 0 && (
                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        {member.sectorPreferences[0]}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleConnect(member.id)}>
                      <Send className="h-4 w-4 mr-1" />
                      Connect
                  </Button>
                  <Button asChild variant="accent" size="sm" className="flex-1 transition-all hover:-translate-y-0.5 hover:shadow-accent">
                    <Link href={`/profile/${member.tgnMemberId}`}>View Profile</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && filteredMembers?.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No members found matching your criteria.
          </p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-12 col-span-full">
            <p className="text-destructive">Failed to load members.</p>
        </div>
      )}
    </div>
  );
};

export default DirectoryPage;
