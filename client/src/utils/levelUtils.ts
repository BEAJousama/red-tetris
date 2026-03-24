import { Crown, Frown, Medal, Shield, Swords, Trophy } from "lucide-react";
import type { LevelIconResult } from "./types";

export const getMotivationMessage = (level: number): string => {
  if (level <= 1)
    return "Every master was once a beginner. Good luck next time!";
  if (level <= 3)
    return "Not bad, soldier. Keep training and you'll go further.";
  if (level <= 5) return "Solid effort! You're getting the hang of it.";
  if (level <= 8) return "Impressive skills! You held your ground well.";
  if (level <= 12)
    return "Outstanding performance! You're a force to reckon with.";
  return "Legendary run! Few ever reach this far. Respect.";
};

export const getLevelIcon = (level: number): LevelIconResult => {
  if (level <= 1)
    return {
      icon: Frown,
      color: "text-red-600",
      btnColor: "bg-red-600",
      glow: "drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]",
      border: "border-red-600/30",
      title: "Recruit Down",
    };
  if (level <= 3)
    return {
      icon: Swords,
      color: "text-orange-500",
      btnColor: "bg-orange-500",
      glow: "drop-shadow-[0_0_15px_rgba(249,115,22,0.8)]",
      border: "border-orange-500/30",
      title: "Soldier Fallen",
    };
  if (level <= 5)
    return {
      icon: Shield,
      color: "text-yellow-500",
      btnColor: "bg-yellow-500",
      glow: "drop-shadow-[0_0_15px_rgba(234,179,8,0.8)]",
      border: "border-yellow-500/30",
      title: "Warrior Defeated",
    };
  if (level <= 8)
    return {
      icon: Medal,
      color: "text-blue-400",
      btnColor: "bg-blue-400",
      glow: "drop-shadow-[0_0_15px_rgba(96,165,250,0.8)]",
      border: "border-blue-400/30",
      title: "Commander Lost",
    };
  if (level <= 12)
    return {
      icon: Trophy,
      color: "text-purple-400",
      btnColor: "bg-purple-400",
      glow: "drop-shadow-[0_0_15px_rgba(192,132,252,0.8)]",
      border: "border-purple-400/30",
      title: "Elite Fallen",
    };
  return {
    icon: Crown,
    color: "text-amber-400",
    btnColor: "bg-amber-400",
    glow: "drop-shadow-[0_0_15px_rgba(251,191,36,0.8)]",
    border: "border-amber-400/30",
    title: "Legend Ends",
  };
};
