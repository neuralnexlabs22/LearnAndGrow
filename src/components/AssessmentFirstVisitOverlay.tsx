"use client";

import { useState, useEffect } from "react";
import { AssessmentQuizModal } from "./AssessmentQuizModal";

const SEEN_INTRO_KEY = "learn_and_grow_assessment_intro_dismissed";

export function AssessmentFirstVisitOverlay() {
  const [isOpen, setIsOpen] = useState(false);
  const [forceStart, setForceStart] = useState(false);

  useEffect(() => {
    // Check if user has already seen or dismissed the intro in this session
    try {
      const hasSeen = sessionStorage.getItem(SEEN_INTRO_KEY) || localStorage.getItem(SEEN_INTRO_KEY);
      if (!hasSeen) {
        // First visit: present prominent assessment intro before regular course landing content
        setIsOpen(true);
        setForceStart(false);
      }
    } catch (err) {
      // fallback
      setIsOpen(true);
    }

    // Global listener for opening assessment from buttons across the site
    const handleOpenAssessment = (e: any) => {
      setForceStart(Boolean(e.detail?.forceStart));
      setIsOpen(true);
    };

    window.addEventListener("open-free-assessment", handleOpenAssessment);
    return () => {
      window.removeEventListener("open-free-assessment", handleOpenAssessment);
    };
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    try {
      sessionStorage.setItem(SEEN_INTRO_KEY, "true");
      localStorage.setItem(SEEN_INTRO_KEY, "true");
    } catch (err) {
      // ignore
    }
  };

  return (
    <AssessmentQuizModal
      isOpen={isOpen}
      onClose={handleClose}
      forceStart={forceStart}
    />
  );
}

/**
 * Helper to programmatically open the free assessment from any button
 */
export function openFreeAssessment(forceStartQuestions = false) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("open-free-assessment", {
        detail: { forceStart: forceStartQuestions },
      })
    );
  }
}
