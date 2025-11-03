export function Progress({ value = 0 }: { value?: number }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800 overflow-hidden">
      <div
        className="h-full bg-blue-600 transition-all duration-500"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}


