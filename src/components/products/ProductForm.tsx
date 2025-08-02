
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, Package, DollarSign, FileText, Hash, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect } from "react";
import type { Tables } from "@/types/database.types";

type Product = Tables<'products'>;

const formSchema = z.object({
  name: z.string().min(2, { message: "O nome do produto é obrigatório." }),
  description: z.string().optional(),
  price: z.coerce.number().min(0, { message: "O preço não pode ser negativo." }),
  category: z.string().optional(),
  sku: z.string().optional(),
  stock_quantity: z.coerce.number().int({ message: "A quantidade deve ser um número inteiro." }).optional().nullable(),
});

type ProductFormValues = z.infer<typeof formSchema>;

interface ProductFormProps {
  product?: Product | null;
  onSuccess?: () => void;
}

export function ProductForm({ product, onSuccess }: ProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClient();
  const isEditMode = !!product;

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      category: "",
      sku: "",
      stock_quantity: null,
    },
  });

  useEffect(() => {
    if (isEditMode && product) {
      form.reset({
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        category: product.category ?? "",
        sku: product.sku ?? "",
        stock_quantity: product.stock_quantity,
      });
    }
  }, [isEditMode, product, form]);

  async function onSubmit(values: ProductFormValues) {
    const productData = {
      ...values,
    };

    if (isEditMode && product) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', product.id);

      if (error) {
        toast({ title: "Erro ao atualizar produto", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Produto Atualizado!", description: `O produto "${values.name}" foi atualizado.` });
    } else {
      const { error } = await supabase.from('products').insert([productData]);

      if (error) {
        toast({ title: "Erro ao criar produto", description: error.message, variant: "destructive" });
        return;
      }
      toast({ title: "Produto Criado!", description: `O produto "${values.name}" foi adicionado.` });
    }
    
    if (onSuccess) {
      onSuccess();
    }
    router.refresh();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><Package className="mr-2 h-4 w-4" /> Nome do Produto/Serviço</FormLabel>
              <FormControl><Input placeholder="Ex: Instalação de Câmera Wi-Fi" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center"><FileText className="mr-2 h-4 w-4" /> Descrição</FormLabel>
              <FormControl><Textarea placeholder="Detalhes do produto ou serviço" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4" /> Preço (R$)</FormLabel>
                <FormControl><Input type="number" step="0.01" placeholder="0.00" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="stock_quantity"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4" /> Estoque (Opcional)</FormLabel>
                <FormControl><Input type="number" placeholder="Qtd. em estoque" {...field} onChange={e => field.onChange(e.target.value === '' ? null : e.target.valueAsNumber)} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><Layers className="mr-2 h-4 w-4" /> Categoria</FormLabel>
                <FormControl><Input placeholder="Ex: Segurança, Manutenção" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
                <FormItem>
                <FormLabel className="flex items-center"><Hash className="mr-2 h-4 w-4" /> SKU / Cód. Interno</FormLabel>
                <FormControl><Input placeholder="Código único" {...field} /></FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        
        <div className="pt-4 flex justify-end">
            <Button type="submit" className="w-full md:w-auto" disabled={form.formState.isSubmitting}>
              <Save className="mr-2 h-4 w-4" /> 
              {form.formState.isSubmitting ? 'Salvando...' : (isEditMode ? 'Salvar Alterações' : 'Criar Produto')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
