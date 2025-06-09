
import { APP_ICON, APP_NAME } from "@/lib/constants";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const AppLogoIcon = APP_ICON;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center space-x-2 text-primary">
        <AppLogoIcon className="h-10 w-10" />
        <h1 className="text-3xl font-bold font-headline">{APP_NAME}</h1>
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
