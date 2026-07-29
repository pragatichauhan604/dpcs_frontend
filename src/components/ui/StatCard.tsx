import { ElementType } from "react";

type StatCardProps = {
  icon: ElementType;
  label: string;
  value: number | string;
  onClick?: () => void;
};

export function StatCard({ icon: Icon, label, value, onClick }: StatCardProps) {
  const content = (
    <>
      <Icon size={21} />
      <span>{label}</span>
      <strong>{value}</strong>
    </>
  );

  if (onClick) {
    return (
      <button type="button" className="stat-card clickable" onClick={onClick}>
        {content}
      </button>
    );
  }

  return (
    <article className="stat-card">
      {content}
    </article>
  );
}
