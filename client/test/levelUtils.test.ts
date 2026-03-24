import { Crown, Frown, Medal, Shield, Swords, Trophy } from "lucide-react";
import { describe, expect, it } from "vitest";
import { getLevelIcon, getMotivationMessage } from "../src/utils/levelUtils";

describe("getMotivationMessage", () => {
  it("returns a string", () => {
    expect(typeof getMotivationMessage(1)).toBe("string");
  });

  it("level 1 → beginner message", () => {
    expect(getMotivationMessage(1)).toBe(
      "Every master was once a beginner. Good luck next time!",
    );
  });

  it("level 0 → beginner message", () => {
    expect(getMotivationMessage(0)).toBe(
      "Every master was once a beginner. Good luck next time!",
    );
  });

  it("level 2 → soldier message", () => {
    expect(getMotivationMessage(2)).toBe(
      "Not bad, soldier. Keep training and you'll go further.",
    );
  });

  it("level 3 → soldier message", () => {
    expect(getMotivationMessage(3)).toBe(
      "Not bad, soldier. Keep training and you'll go further.",
    );
  });

  it("level 4 → solid effort message", () => {
    expect(getMotivationMessage(4)).toBe(
      "Solid effort! You're getting the hang of it.",
    );
  });

  it("level 5 → solid effort message", () => {
    expect(getMotivationMessage(5)).toBe(
      "Solid effort! You're getting the hang of it.",
    );
  });

  it("level 6 → impressive message", () => {
    expect(getMotivationMessage(6)).toBe(
      "Impressive skills! You held your ground well.",
    );
  });

  it("level 8 → impressive message", () => {
    expect(getMotivationMessage(8)).toBe(
      "Impressive skills! You held your ground well.",
    );
  });

  it("level 9 → outstanding message", () => {
    expect(getMotivationMessage(9)).toBe(
      "Outstanding performance! You're a force to reckon with.",
    );
  });

  it("level 12 → outstanding message", () => {
    expect(getMotivationMessage(12)).toBe(
      "Outstanding performance! You're a force to reckon with.",
    );
  });

  it("level 13 → legendary message", () => {
    expect(getMotivationMessage(13)).toBe(
      "Legendary run! Few ever reach this far. Respect.",
    );
  });

  it("level 100 → legendary message", () => {
    expect(getMotivationMessage(100)).toBe(
      "Legendary run! Few ever reach this far. Respect.",
    );
  });
});

describe("getLevelIcon", () => {
  it("returns an object with correct shape", () => {
    const result = getLevelIcon(1);
    expect(typeof result.icon).toBe("object");
    expect(typeof result.color).toBe("string");
    expect(typeof result.btnColor).toBe("string");
    expect(typeof result.glow).toBe("string");
    expect(typeof result.border).toBe("string");
    expect(typeof result.title).toBe("string");
  });

  it("level 0 → Recruit Down", () => {
    expect(getLevelIcon(0)).toEqual({
      icon: Frown,
      color: "text-red-600",
      btnColor: "bg-red-600",
      glow: "drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]",
      border: "border-red-600/30",
      title: "Recruit Down",
    });
  });

  it("level 1 → Recruit Down", () => {
    expect(getLevelIcon(1)).toEqual({
      icon: Frown,
      color: "text-red-600",
      btnColor: "bg-red-600",
      glow: "drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]",
      border: "border-red-600/30",
      title: "Recruit Down",
    });
  });

  it("level 2 → Soldier Fallen", () => {
    expect(getLevelIcon(2)).toEqual({
      icon: Swords,
      color: "text-orange-500",
      btnColor: "bg-orange-500",
      glow: "drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]",
      border: "border-orange-500/30",
      title: "Soldier Fallen",
    });
  });

  it("level 3 → Soldier Fallen", () => {
    expect(getLevelIcon(3)).toEqual({
      icon: Swords,
      color: "text-orange-500",
      btnColor: "bg-orange-500",
      glow: "drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]",
      border: "border-orange-500/30",
      title: "Soldier Fallen",
    });
  });

  it("level 4 → Warrior Defeated", () => {
    expect(getLevelIcon(4)).toEqual({
      icon: Shield,
      color: "text-yellow-500",
      btnColor: "bg-yellow-500",
      glow: "drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]",
      border: "border-yellow-500/30",
      title: "Warrior Defeated",
    });
  });

  it("level 5 → Warrior Defeated", () => {
    expect(getLevelIcon(5)).toEqual({
      icon: Shield,
      color: "text-yellow-500",
      btnColor: "bg-yellow-500",
      glow: "drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]",
      border: "border-yellow-500/30",
      title: "Warrior Defeated",
    });
  });

  it("level 6 → Commander Lost", () => {
    expect(getLevelIcon(6)).toEqual({
      icon: Medal,
      color: "text-blue-400",
      btnColor: "bg-blue-400",
      glow: "drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]",
      border: "border-blue-400/30",
      title: "Commander Lost",
    });
  });

  it("level 8 → Commander Lost", () => {
    expect(getLevelIcon(8)).toEqual({
      icon: Medal,
      color: "text-blue-400",
      btnColor: "bg-blue-400",
      glow: "drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]",
      border: "border-blue-400/30",
      title: "Commander Lost",
    });
  });

  it("level 9 → Elite Fallen", () => {
    expect(getLevelIcon(9)).toEqual({
      icon: Trophy,
      color: "text-purple-400",
      btnColor: "bg-purple-400",
      glow: "drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]",
      border: "border-purple-400/30",
      title: "Elite Fallen",
    });
  });

  it("level 12 → Elite Fallen", () => {
    expect(getLevelIcon(12)).toEqual({
      icon: Trophy,
      color: "text-purple-400",
      btnColor: "bg-purple-400",
      glow: "drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]",
      border: "border-purple-400/30",
      title: "Elite Fallen",
    });
  });

  it("level 13 → Legend Ends", () => {
    expect(getLevelIcon(13)).toEqual({
      icon: Crown,
      color: "text-amber-400",
      btnColor: "bg-amber-400",
      glow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
      border: "border-amber-400/30",
      title: "Legend Ends",
    });
  });

  it("level 100 → Legend Ends", () => {
    expect(getLevelIcon(100)).toEqual({
      icon: Crown,
      color: "text-amber-400",
      btnColor: "bg-amber-400",
      glow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
      border: "border-amber-400/30",
      title: "Legend Ends",
    });
  });
});
