"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  ArrowDown01,
  ArrowDownAZ,
  ArrowUp01,
  ArrowUpAZ,
  ChevronDown,
} from "lucide-react";
import {
  DEFAULT_PENDING_SORT,
  PENDING_SORT_OPTIONS,
  getPendingSortOption,
} from "@/helpers/movieSortHelpers";
import styles from "@/styles/components.module.scss";

export const MOVIE_SORT_ICONS = {
  "year-asc": ArrowUp01,
  "year-desc": ArrowDown01,
  "title-asc": ArrowUpAZ,
  "title-desc": ArrowDownAZ,
  "rating-asc": ArrowUp01,
  "rating-desc": ArrowDown01,
};

export default function MovieSortDropdown({
  value = DEFAULT_PENDING_SORT,
  onChange,
  options = PENDING_SORT_OPTIONS,
  sortIcons = MOVIE_SORT_ICONS,
  getOption = getPendingSortOption,
  compact = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const listboxId = useId();
  const selected = getOption(value);
  const SelectedIcon = sortIcons[selected.value] ?? ArrowDown01;

  useEffect(() => {
    if (!isOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange?.(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      className={`${styles.sortDropdown} ${compact ? styles.sortDropdownCompact : ""}`.trim()}
      ref={containerRef}
    >
      {!compact && (
        <span className={`sectionLabel ${styles.sortDropdownLegend}`}>
          Ordenar por
        </span>
      )}
      {compact ? (
        <div className={styles.sortDropdownCompactRow}>
          <span className={`sectionLabel ${styles.sortDropdownCompactLegend}`}>
            ORDEN
          </span>
          <button
            type="button"
            className={styles.sortDropdownTrigger}
            onClick={() => setIsOpen((open) => !open)}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-label={`Ordenar por: ${selected.label}`}
          >
            <span className={styles.sortDropdownTriggerMain}>
              <SelectedIcon
                className={styles.sortDropdownOptionIcon}
                size={14}
                strokeWidth={1.75}
                aria-hidden="true"
              />
              <span className={styles.sortDropdownValue}>{selected.label}</span>
            </span>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className={`${styles.sortDropdownChevron} ${isOpen ? styles.sortDropdownChevronOpen : ""}`}
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          className={styles.sortDropdownTrigger}
          onClick={() => setIsOpen((open) => !open)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
        >
          <span className={styles.sortDropdownTriggerMain}>
            <SelectedIcon
              className={styles.sortDropdownOptionIcon}
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className={styles.sortDropdownValue}>{selected.label}</span>
          </span>
          <ChevronDown
            size={18}
            strokeWidth={1.75}
            aria-hidden="true"
            className={`${styles.sortDropdownChevron} ${isOpen ? styles.sortDropdownChevronOpen : ""}`}
          />
        </button>
      )}

      {isOpen && (
        <ul
          id={listboxId}
          className={styles.sortDropdownMenu}
          role="listbox"
          aria-label="Ordenar por"
        >
          {options.map((option) => {
            const OptionIcon = sortIcons[option.value];
            const isSelected = option.value === value;

            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`${styles.sortDropdownOption} ${isSelected ? styles.sortDropdownOptionSelected : ""}`}
                  onClick={() => handleSelect(option.value)}
                >
                  <OptionIcon size={16} strokeWidth={1.75} aria-hidden="true" />
                  <span>{option.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
