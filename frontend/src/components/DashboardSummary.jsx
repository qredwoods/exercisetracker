import { useState, useRef, useMemo, useEffect } from "react";
import { FiEdit3, FiAward } from "react-icons/fi";
import { computePRs, getAdaptiveCount, getCountVariants, getGreeting } from "../utils/pr";

// Purpose might be encrypted ciphertext on session restore (no data key available).
// Ciphertext format: "base64iv.base64ciphertext" — no spaces, single dot, both sides are base64.
// Normal purpose text like "Feel strong." has spaces. Check for the AES-GCM pattern specifically.
const CIPHERTEXT_PATTERN = /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/;

function getVisiblePurpose(rawPurpose) {
  if (!rawPurpose) return "";
  if (CIPHERTEXT_PATTERN.test(rawPurpose)) return ""; // encrypted, can't display
  return rawPurpose;
}

const DashboardSummary = ({
  exercises,
  user,
  onPurposeChange,
  onPRClick,
}) => {
  const prData = useMemo(() => computePRs(exercises), [exercises]);
  const adaptiveCount = useMemo(() => getAdaptiveCount(exercises), [exercises]);
  const countVariants = useMemo(() => getCountVariants(exercises), [exercises]);
  const greeting = useMemo(() => getGreeting(exercises), [exercises]);
  const [activeCountKey, setActiveCountKey] = useState(adaptiveCount.key);

  useEffect(() => {
    setActiveCountKey(adaptiveCount.key);
  }, [adaptiveCount.key]);

  if (!greeting) return null; // no exercises — welcome message handles this

  const activeCount =
    countVariants.find((variant) => variant.key === activeCountKey) ?? adaptiveCount;
  const canCycleCount = countVariants.length > 1;

  const cycleHeroCard = () => {
    if (!canCycleCount) return;

    const currentIndex = countVariants.findIndex(
      (variant) => variant.key === activeCount.key,
    );
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % countVariants.length;
    setActiveCountKey(countVariants[nextIndex].key);
  };

  const handleHeroKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      cycleHeroCard();
    }
  };

  return (
    <div className="dashboard">
      <p className="dashboard-greeting">{greeting}</p>
      <div className="dashboard-cards">
        <div
          className={`dashboard-card dashboard-card--hero${canCycleCount ? " dashboard-card--clickable dashboard-card--hero-toggle" : ""}`}
          onClick={cycleHeroCard}
          onKeyDown={handleHeroKeyDown}
          role={canCycleCount ? "button" : undefined}
          tabIndex={canCycleCount ? 0 : undefined}
          aria-label={canCycleCount ? `Toggle exercise totals, currently showing ${activeCount.periodLabel}` : undefined}
        >
          <span className="dashboard-card-title">{activeCount.periodLabel}</span>
          <span className="dashboard-card-value">{activeCount.count}</span>
          <span className="dashboard-card-label dashboard-card-label--hero">
            {activeCount.title.toLowerCase()}
          </span>
        </div>
        <PurposeCard
          purpose={getVisiblePurpose(user?.purpose)}
          onPurposeChange={onPurposeChange}
        />
        <PRCard
          latestPR={prData.latestPR}
          onPRClick={onPRClick}
        />
      </div>
    </div>
  );
};

const PurposeCard = ({ purpose, onPurposeChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(purpose);
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(purpose);
  }, [purpose]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const save = () => {
    setEditing(false);
    const trimmed = draft.trim();
    if (trimmed !== purpose) {
      onPurposeChange(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") save();
    if (e.key === "Escape") {
      setDraft(purpose);
      setEditing(false);
    }
  };

  if (editing) {
    return (
      <div className="dashboard-card">
        <span className="dashboard-card-title">Your Purpose</span>
        <input
          ref={inputRef}
          className="purpose-input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={handleKeyDown}
          maxLength={100}
          placeholder="your goal here"
        />
        {draft.length >= 60 && (
          <span className="purpose-counter">{draft.length}/100</span>
        )}
      </div>
    );
  }

  if (!purpose) {
    return (
      <div
        className="dashboard-card dashboard-card--clickable"
        onClick={() => setEditing(true)}
      >
        <span className="dashboard-card-title">Your Purpose</span>
        <span className="purpose-prompt">Set your purpose</span>
      </div>
    );
  }

  return (
    <div
      className="dashboard-card dashboard-card--clickable"
      onClick={() => setEditing(true)}
    >
      <span className="dashboard-card-title">Your Purpose</span>
      <span className="purpose-text">{purpose}</span>
      <FiEdit3 className="purpose-edit-icon" />
    </div>
  );
};

const PRCard = ({ latestPR, onPRClick }) => {
  if (!latestPR) {
    return (
      <div className="dashboard-card">
        <span className="dashboard-card-title">Latest PR</span>
        <span className="pr-card-empty">Log a workout to see your PR</span>
      </div>
    );
  }

  const { exercise, value } = latestPR;
  const isBodyweight = exercise.unit === "bodyweight";
  const display = isBodyweight ? `${value} reps` : `${value} ${exercise.unit}`;

  return (
    <div
      className="dashboard-card dashboard-card--clickable"
      onClick={() => onPRClick(exercise)}
    >
      <span className="dashboard-card-title">Latest PR</span>
      <FiAward className="pr-card-icon" />
      <span className="pr-card-name">{exercise.name}</span>
      <span className="pr-card-value">{display}</span>
    </div>
  );
};

export default DashboardSummary;
