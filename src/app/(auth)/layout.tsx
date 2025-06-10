
import { APP_LOGO_URL } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8">
        <Image 
          src={APP_LOGO_URL} 
          alt="Venture XP Logo" 
          width={180} 
          height={40} 
          data-ai-hint="logo venture xp" 
          priority 
        />
      </div>
      <div className="w-full max-w-md">
        {children}
      </div>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Voltar para a <Link href="/" className="font-medium text-primary hover:underline">Página Inicial</Link>
      </p>
    </div>
  );
}
