'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

const ImpactPage = () => {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Impact Overview</h1>
        <p className="text-muted-foreground">Track your contribution and network growth.</p>
      </div>

      <Card className="flex flex-col items-center justify-center text-center py-20">
          <CardHeader>
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                <BarChart3 className="h-10 w-10 text-primary" />
            </div>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
                We're currently building out this feature to give you detailed <br />
                insights into your impact on the network. Check back soon!
            </CardDescription>
          </CardHeader>
      </Card>
    </>
  );
};

export default ImpactPage;
