import { ElementType } from "react";

type StatCardProps = {
  icon: ElementType;
  label: string;
  value: number | string;
};

export function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <article className="stat-card">
      <Icon size={21} />
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
