import Header from "@/components/layout/Header";
import CategoryMenu from "@/components/layout/CategoryMenu";
import Footer from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ElectronicsPage() {
  return (
    <div className="min-h-screen bg-jomiastore-background">
      <Header />
      <CategoryMenu />
      <div className="container py-16 text-center">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-10">
            <h1 className="text-2xl font-bold mb-4">Électronique</h1>
            <p className="text-gray-600 mb-6">
              Cette page a été remplacée par la page dynamique de catégorie.
            </p>
            <Link href="/category/electronique">
              <Button className="bg-jomiastore-primary hover:bg-blue-700">Voir la catégorie</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}