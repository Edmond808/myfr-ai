"use client";

export function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob--azure" />
      <div className="ambient-blob ambient-blob--teal" />
      <div className="ambient-blob ambient-blob--amber" />
      <div className="ambient-horizon" />
    </div>
  );
}
