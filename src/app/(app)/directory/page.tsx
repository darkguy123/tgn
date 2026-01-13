"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { members, sectors, countries } from "@/lib/data";
import type { Member } from "@/lib/data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle2, Map as MapIcon } from "lucide-react";
import Image from "next/image";
import placeholderImages from "@/lib/placeholder-images.json";

export default function DirectoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const getImage = (imageId: string) => {
    return placeholderImages.placeholderImages.find(p => p.id === imageId);
  }

  const filteredMembers = useMemo(() => {
    return members.filter((member: Member) => {
      const searchMatch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.sector.toLowerCase().includes(searchTerm.toLowerCase());
      const countryMatch =
        countryFilter === "all" || member.country === countryFilter;
      const sectorMatch =
        sectorFilter === "all" || member.sector === sectorFilter;
      const roleMatch = roleFilter === "all" || member.role === roleFilter;

      return searchMatch && countryMatch && sectorMatch && roleMatch;
    });
  }, [searchTerm, countryFilter, sectorFilter, roleFilter]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Member Directory</h1>
        <p className="text-muted-foreground">
          Find and connect with members across the globe.
        </p>
      </header>
      <Tabs defaultValue="directory">
        <TabsList>
          <TabsTrigger value="directory">Directory</TabsTrigger>
          <TabsTrigger value="map">Global Map</TabsTrigger>
        </TabsList>
        <TabsContent value="directory">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Input
                  placeholder="Search by name or sector..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-sm"
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:ml-auto">
                   <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="Mentor">Mentor</SelectItem>
                      <SelectItem value="Mentee">Mentee</SelectItem>
                      <SelectItem value="Affiliate">Affiliate</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={countryFilter} onValueChange={setCountryFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Country" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {countries.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger><SelectValue placeholder="Filter by Sector" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {sectors.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>TGN ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const img = getImage(member.imageId);
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={img?.imageUrl} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {member.name}
                          </div>
                        </TableCell>
                        <TableCell>{member.tgnId}</TableCell>
                        <TableCell>{member.location}</TableCell>
                        <TableCell>{member.sector}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{member.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {member.isVerified ? (
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not Verified</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="map">
          <Card>
            <CardHeader>
              <CardTitle>Global Member Map</CardTitle>
              <CardDescription>
                Visualizing our network's hubs and activity clusters.
              </CardDescription>
            </CardHeader>
            <CardContent className="aspect-[16/9] flex items-center justify-center bg-muted/50 rounded-lg">
              <div className="text-center text-muted-foreground">
                <MapIcon className="mx-auto h-12 w-12" />
                <p className="mt-2 font-medium">Map View Coming Soon</p>
                <p className="text-sm">Interactive global map functionality will be available here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
