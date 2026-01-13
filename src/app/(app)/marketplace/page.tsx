import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { products } from "@/lib/data";
import placeholderImages from "@/lib/placeholder-images.json";
import { Badge } from "@/components/ui/badge";

const getImage = (imageId: string) => {
  return placeholderImages.placeholderImages.find((p) => p.id === imageId);
};

export default function MarketplacePage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
            <p className="text-muted-foreground">
                Books, courses, and tools from our expert members.
            </p>
        </div>
        <Button>Sell Your Product</Button>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const img = getImage(product.imageId);
          return (
            <Card key={product.id} className="flex flex-col overflow-hidden">
              <CardHeader className="p-0 relative">
                {img && (
                  <Image
                    src={img.imageUrl}
                    alt={product.title}
                    width={600}
                    height={400}
                    className="aspect-[3/2] w-full object-cover"
                    data-ai-hint={img.imageHint}
                  />
                )}
                 <Badge className="absolute top-2 right-2" variant={product.type === 'Book' ? 'secondary' : 'default'}>{product.type}</Badge>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col">
                <CardTitle className="text-lg mb-1">{product.title}</CardTitle>
                <p className="text-sm text-muted-foreground">by {product.author}</p>
                <p className="text-2xl font-semibold mt-auto pt-4">
                  ${product.price.toFixed(2)}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button className="w-full">View Details</Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
