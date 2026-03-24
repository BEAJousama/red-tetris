const Cell = ({ colorClass }: { colorClass: string }) => {
  const isEmpty = colorClass === "bg-zinc-950/80" || colorClass === "bg-black/40";
  const isGhost = colorClass.startsWith("ghost:");
  const isPenalty = colorClass === "penalty";

  // console.log(isGhost, colorClass);

  if (isGhost) {
    const hex = colorClass
      .replace("ghost:", "")
      .replace("bg-[", "")
      .replace("]", "");
    return (
      <div
        className="aspect-square bg-black/40"
        style={{ border: `2px solid ${hex}80` }}
      />
    );
  }

  if (isPenalty) {
    return (
      <div className="aspect-square border border-[color:color-mix(in_oklab,var(--foreground)_40%,transparent)] bg-[color:color-mix(in_oklab,var(--muted)_55%,black)]" />
    );
  }

  return (
    <div
      className={`aspect-square ${colorClass}`}
      style={
        !isEmpty
          ? { boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.25)" }
          : undefined
      }
    />
  );
};

export default Cell;
