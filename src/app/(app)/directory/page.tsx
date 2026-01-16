
"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
  Globe,
  ChevronDown,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  globalRegions,
  countries,
  sectors,
  mentorTypes,
} from "@/lib/data";
import placeholderImages from "@/lib/placeholder-images.json";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { TGNMember } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const DirectoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    country: "All Countries",
    sector: "All Sectors",
    mentorType: "All Types",
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const firestore = useFirestore();
  const membersRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: members, isLoading, error } = useCollection<TGNMember>(membersRef);

  const getImage = (imageId?: string) => {
    if (!imageId) return null;
    return placeholderImages.placeholderImages.find((p) => p.id === imageId);
  };
  
  const getNameFromEmail = (email: string) => {
    return email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  const filteredMembers = members?.filter((member) => {
    const name = getNameFromEmail(member.email);
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

      {/* Global Activity Map */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Global Activity Map
          </CardTitle>
          <CardDescription>
            Visualizing our member hubs and activity clusters across the globe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-[16/8] w-full rounded-lg overflow-hidden bg-muted">
            <Image
              src={getImage("world-map-dots")?.imageUrl ?? ""}
              alt="World map with activity clusters"
              fill
              className="object-cover"
              data-ai-hint="world map"
            />
            <div className="absolute inset-0 bg-black/20" />

            {/* Region Data Points */}
            {[
              { region: globalRegions[0], pos: "top-[55%] left-[50%]" }, // Africa
              { region: globalRegions[1], pos: "top-[30%] left-[20%]" }, // North America
              { region: globalRegions[2], pos: "top-[25%] left-[48%]" }, // Europe
              { region: globalRegions[3], pos: "top-[40%] left-[75%]" }, // Asia Pacific
              { region: globalRegions[4], pos: "top-[70%] left-[30%]" }, // Latin America
            ].map(({ region, pos }) => (
              <TooltipProvider key={region.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-accent border-2 border-accent-foreground shadow-lg animate-pulse",
                        pos
                      )}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-bold">{region.name}</p>
                    <p>{region.members.toLocaleString()} members</p>
                    <p>{region.hubs} hubs</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading && Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="p-4 space-y-4"><div className="flex items-start gap-3 mb-4"><Skeleton className="h-12 w-12 rounded-full" /><div className="flex-1 space-y-2"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-4 w-1/2" /></div></div><Skeleton className="h-4 w-5/6" /><Skeleton className="h-4 w-3/4" /><div className="flex gap-2 pt-2"><Skeleton className="h-9 w-1/2" /><Skeleton className="h-9 w-1/2" /></div></CardContent></Card>
        ))}
        {filteredMembers?.map((member) => {
          const img = getImage(member.imageId);
          const name = getNameFromEmail(member.email);
          return (
            <Card
              key={member.id}
              className="hover:shadow-card transition-all duration-300 group"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                   <Avatar className="h-12 w-12 rounded-full">
                     <AvatarImage src={img?.imageUrl} alt={name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                      {name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {name}
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
                  <Button asChild variant="outline" size="sm" className="flex-1">
                    <Link href={`/chat/${member.id}`}>
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Connect
                    </Link>
                  </Button>
                  <Button asChild variant="accent" size="sm" className="flex-1 transition-all hover:-translate-y-0.5 hover:shadow-accent">
                    <Link href={`/profile/${member.id}`}>View Profile</Link>
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
    
