type Props = { message?: string };

export function WidgetLoading({ message = "Loading…" }: Props) {
  return (
    <div className="flex h-28 items-center justify-center font-mono text-xs text-terminal-muted">
      {message}
    </div>
  );
}

export function WidgetError({ message }: Props) {
  return (
    <div className="flex h-28 items-center justify-center text-center font-mono text-xs text-terminal-danger">
      {message ?? "Data unavailable"}
    </div>
  );
}
