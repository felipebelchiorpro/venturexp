
'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center p-4">
      <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
      <h2 className="text-2xl font-bold text-destructive mb-2">Oops! Algo deu errado.</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Encontramos um problema inesperado. Por favor, tente novamente ou, se o problema persistir, entre em contato com o suporte.
      </p>
      <p className="text-sm text-muted-foreground mb-4">Detalhes do erro: {error.message}</p>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
        variant="default"
      >
        Tentar novamente
      </Button>
    </div>
  );
}
