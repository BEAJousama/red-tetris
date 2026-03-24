import { Volume2, VolumeX } from "lucide-react";
import { playSoundOnChime } from "../audio/gameAudio";
import { useAppDispatch, useAppSelector } from "../hooks";
import { setSoundEnabled } from "../store/slices/settingsSlice";

const SoundToggle = () => {
  const enabled = useAppSelector((s) => s.settings.soundEnabled);
  const dispatch = useAppDispatch();

  return (
    <button
      type="button"
      onClick={() => {
        if (enabled) {
          dispatch(setSoundEnabled(false));
        } else {
          dispatch(setSoundEnabled(true));
          playSoundOnChime();
        }
      }}
      className="retro-button retro-focus pixel-text flex w-full min-w-0 items-center justify-center gap-2 px-3 py-2 text-[10px] font-bold"
      aria-pressed={enabled}
      aria-label={enabled ? "Mute sound effects" : "Enable sound effects"}
    >
      {enabled ? (
        <Volume2 size={16} className="shrink-0 text-[var(--accent)]" />
      ) : (
        <VolumeX size={16} className="shrink-0 text-[var(--muted)]" />
      )}
      <span className="text-[var(--foreground)]">
        {enabled ? "Sound on" : "Sound off"}
      </span>
    </button>
  );
};

export default SoundToggle;
