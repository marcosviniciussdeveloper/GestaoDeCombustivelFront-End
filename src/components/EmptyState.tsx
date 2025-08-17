// src/components/EmptyState.tsx

interface EmptyStateProps {
  icon: string;
  title: string;
  message: string;
}

export const EmptyState = ({ icon, title, message }: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <i className={icon}></i>
      </div>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
};
