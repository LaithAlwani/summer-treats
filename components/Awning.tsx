// A striped awning band with a scalloped valance hanging below — the "stand".
export function Awning() {
  return (
    <div aria-hidden>
      <div className="awning h-3" />
      <div className="awning-scallop" />
    </div>
  );
}
