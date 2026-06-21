// Comquent-Logo (Markenzeichen der Comquent GmbH). Die Wortmarke ist orange auf
// transparentem Grund und funktioniert sowohl auf hellen als auch auf navy Flaechen.
export function Logo({ className = '', height = 28 }: { className?: string; height?: number }) {
  return (
    <img
      src="./assets/comquent-logo.webp"
      alt="Comquent GmbH — Industrial DevOps"
      height={height}
      style={{ height }}
      className={`w-auto ${className}`}
      decoding="async"
    />
  );
}
