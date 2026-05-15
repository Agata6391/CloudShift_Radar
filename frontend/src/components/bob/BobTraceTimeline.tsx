interface BobTraceTimelineProps {
  items: string[];
}

export function BobTraceTimeline({ items }: BobTraceTimelineProps) {
  return (
    <ol className="trace-timeline">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{item}</p>
        </li>
      ))}
    </ol>
  );
}
