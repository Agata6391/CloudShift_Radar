import { Card } from "../ui/Card";

interface BobReasoningCardProps {
  title: string;
  items: string[];
}

export function BobReasoningCard({ title, items }: BobReasoningCardProps) {
  return (
    <Card className="reasoning-card">
      <div className="section-heading">
        <span>Bob reasoning</span>
        <h3>{title}</h3>
      </div>
      <ul className="clean-list">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </Card>
  );
}
