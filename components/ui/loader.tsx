export function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <span className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
    </div>
  );
}


