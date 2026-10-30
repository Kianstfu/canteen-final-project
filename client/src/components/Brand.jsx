// Ang logo/pamagat sa kaliwa ng navbar ng mga customer pages.
export default function Brand({ icon = '🍴', title = 'Canteen Order' }) {
  return (
    <span className="d-flex align-items-center gap-2 font-display fs-4 text-white">
      <span className="icon-badge">{icon}</span> {title}
    </span>
  );
}
