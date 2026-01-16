import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { programs } from "@/lib/data";
import placeholderImages from "@/lib/placeholder-images.json";
import { Badge } from "@/components/ui/badge";
import { BarChart2 } from "lucide-react";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function ProgramsPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programs</h1>
          <p className="text-muted-foreground">
            Explore free, paid, and executive learning opportunities.
          </p>
        </div>
        <Button>Suggest a Program</Button>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => {
          const img = getImage(program.imageId);
          return (
            <Card key={program.id} className="flex flex-col overflow-hidden group">
              <CardHeader className="p-0 relative">
                {img && (
                  <Image
                    src={img.imageUrl}
                    alt={program.name}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint={img.imageHint}
                  />
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    <Badge variant={program.type === 'Executive' ? 'destructive' : program.type === 'Paid' ? 'default' : 'secondary'}>
                        {program.type}
                    </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <CardTitle className="text-lg mb-1">{program.name}</CardTitle>
                <p className="text-sm text-muted-foreground mb-3">by {program.mentor}</p>
                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{program.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-4">
                  <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> {program.format}</span>
                </div>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <div className="w-full flex items-center justify-between">
                    <p className="text-2xl font-semibold">
                      {program.price ? `$${program.price}` : 'Free'}
                    </p>
                    <Button>View Program</Button>
                </div>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
