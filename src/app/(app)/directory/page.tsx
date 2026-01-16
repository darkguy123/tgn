
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
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
  Search,
  Filter,
  MapPin,
  Star,
  Users,
  Globe,
  ChevronDown,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  members,
  globalRegions,
  countries,
  sectors,
  badgeLevels,
  mentorTypes,
} from "@/lib/data";
import placeholderImages from "@/lib/placeholder-images.json";

const DirectoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState({
    country: "All Countries",
    sector: "All Sectors",
    badgeLevel: "All Levels",
    mentorType: "All Types",
  });
  const [showFilters, setShowFilters] = useState(false);

  const getImage = (imageId: string) => {
    return placeholderImages.placeholderImages.find((p) => p.id === imageId);
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCountry =
      selectedFilters.country === "All Countries" ||
      member.country === selectedFilters.country;
    const matchesSector =
      selectedFilters.sector === "All Sectors" ||
      member.sector === selectedFilters.sector;
    const matchesBadge =
      selectedFilters.badgeLevel === "All Levels" ||
      `★ ${member.badge}` === selectedFilters.badgeLevel;
    const matchesMentorType =
      selectedFilters.mentorType === "All Types" ||
      member.role === selectedFilters.mentorType;

    return (
      matchesSearch &&
      matchesCountry &&
      matchesSector &&
      matchesBadge &&
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
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Badge Level
                  </label>
                  <Select
                    value={selectedFilters.badgeLevel}
                    onValueChange={(value) =>
                      setSelectedFilters((prev) => ({
                        ...prev,
                        badgeLevel: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by Badge Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {badgeLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Mentor Type
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
                      <SelectValue placeholder="Filter by Mentor Type" />
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
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Showing hubs and active regions.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {globalRegions.map((region) => (
              <div
                key={region.name}
                className="p-4 bg-muted/50 rounded-lg text-center"
              >
                <p className="font-semibold text-foreground">{region.name}</p>
                <p className="text-2xl font-bold text-primary">
                  {(region.members / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-muted-foreground">
                  {region.hubs} hubs
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Members Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMembers.map((member) => {
          const img = getImage(member.imageId);
          return (
            <Card
              key={member.id}
              className="hover:shadow-card transition-all duration-300 group"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-4">
                   <Avatar className="h-12 w-12 rounded-full">
                     <AvatarImage src={img?.imageUrl} alt={member.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold text-lg">
                      {member.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {member.country}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Star className="h-4 w-4 text-accent" />
                    Badge Level {member.badge}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {member.connections} connections
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Connect
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

      {filteredMembers.length === 0 && (
        <div className="text-center py-12 col-span-full">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            No members found matching your criteria.
          </p>
        </div>
      )}
    </div>
  );
};

export default DirectoryPage;
    