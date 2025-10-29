import { Metadata } from "next";
import { BulkProductImporter } from "@/components/admin/BulkProductImporter";

export const metadata: Metadata = {
  title: "Import en masse par URLs - Admin",
  description: "Importer plusieurs produits AliExpress en collant une liste d'URLs",
};

export default function BulkUrlsImportPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Import en masse par URLs</h1>
        <p className="text-muted-foreground mt-2">
          Importez plusieurs produits en collant une liste d'URLs AliExpress (une par ligne)
        </p>
      </div>
      
      <BulkProductImporter />
    </div>
  );
}
