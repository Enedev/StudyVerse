import { Info } from 'lucide-react';

type PreviewNoticeProps = {
  children: string;
};

export function PreviewNotice({ children }: PreviewNoticeProps) {
  return (
    <div className="border-border/70 bg-secondary/45 text-secondary-foreground flex items-start gap-3 rounded-xl border px-4 py-3 text-xs leading-relaxed">
      <Info className="mt-0.5 size-4 shrink-0" />
      <p>
        <strong>Interface preview.</strong> {children}
      </p>
    </div>
  );
}
