// src/components/CardMenu.tsx
interface Props {
  title: string;
  onClick: () => void;
}

export default function CardMenu({ title, onClick }: Props) {
  return (
    <div
      className="card h-100 shadow-sm border-0"
      style={{ cursor: "pointer" }}
      onClick={onClick}
    >
      <div className="card-body d-flex align-items-center justify-content-center text-center">
        <h5 className="card-title mb-0" style={{ fontSize: 15 }}>
          {title}
        </h5>
      </div>
    </div>
  );
}
