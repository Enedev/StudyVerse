import type { PropsWithChildren, ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type AuthCardProps = PropsWithChildren<{
  title: string;
  description: string;
  footer?: ReactNode;
}>;

export function AuthCard({
  title,
  description,
  footer,
  children,
}: AuthCardProps) {
  return (
    <Card className="w-full max-w-md border-border/80 bg-card/85 shadow-book backdrop-blur">
      <CardHeader className="space-y-2 p-7 pb-5">
        <CardTitle className="font-serif text-3xl font-medium">
          {title}
        </CardTitle>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
      </CardHeader>
      <CardContent className="px-7 pb-7">
        {children}
        {footer && (
          <div className="text-muted-foreground mt-6 border-t pt-5 text-center text-sm">
            {footer}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
