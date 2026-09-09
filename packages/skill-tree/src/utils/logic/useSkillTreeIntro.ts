import { useState, useEffect } from "react";
import { SkillTreeMemoryStoreAPI } from "../../types/SkillTreeMemoryStoreAPI";

const noop = () => {};

export function useSkillTreeIntro(memoryStoreAPI?: SkillTreeMemoryStoreAPI) {
  const hasSeenIntro = memoryStoreAPI?.hasSeenSkillTreeIntro ?? false;
  const setHasSeenIntro = memoryStoreAPI?.setHasSeenSkillTreeIntro ?? noop;
  const hasHydrated = memoryStoreAPI?.hasHydrated !== false;

  const [showIntro, setShowIntro] = useState(false);

  // Show once, on the first ever visit to a skill tree. Wait for the persisted
  // store to rehydrate, otherwise returning users see it again on every load.
  useEffect(() => {
    if (!hasHydrated || hasSeenIntro) return;
    setShowIntro(true);
    setHasSeenIntro(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated, hasSeenIntro]);

  return { showIntro, setShowIntro, openIntro: () => setShowIntro(true) };
}
