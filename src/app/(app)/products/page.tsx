
"use client";

import { PageHeader } from "@/components/PageHeader";
import { ProductList } from "@/components/products/ProductList";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { ProductForm } from "@/components/products/ProductForm";
import { useState } from "react";

export const dynamic = 'force-dynamic';

export default function ProductsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catálogo de Produtos e Serviços"
        description="Gerencie os itens que podem ser adicionados às Ordens de Serviço."
        actions={
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Novo Produto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Produto/Serviço</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para cadastrar um novo item no seu catálogo.
                </DialogDescription>
              </DialogHeader>
              <ProductForm onSuccess={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        }
      />
      <ProductList />
    </div>
  );
}
