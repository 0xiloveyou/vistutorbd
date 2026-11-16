"use client";

import styles from "./HomeLoading.module.css";

const CONCEPTS = ["+", "π", "△", "x²"];

export default function HomeLoading() {
  return (
    <div className={styles.loadingStage} role="status" aria-label="Preparing a visual math lesson">
      <span className={styles.srOnly}>Preparing a visual math lesson</span>

      <div className={styles.lessonScene} aria-hidden="true">
        <div className={`${styles.orbit} ${styles.orbitWide}`}>
          <span className={`${styles.concept} ${styles.conceptOne}`}>{CONCEPTS[0]}</span>
          <span className={`${styles.concept} ${styles.conceptThree}`}>{CONCEPTS[2]}</span>
        </div>
        <div className={`${styles.orbit} ${styles.orbitTall}`}>
          <span className={`${styles.concept} ${styles.conceptTwo}`}>{CONCEPTS[1]}</span>
          <span className={`${styles.concept} ${styles.conceptFour}`}>{CONCEPTS[3]}</span>
        </div>

        <div className={styles.lessonCore}>
          <div className={styles.book}>
            <div className={`${styles.page} ${styles.pageLeft}`}>
              <i />
              <i />
              <i />
            </div>
            <div className={`${styles.page} ${styles.pageRight}`}>
              <b>△</b>
              <i />
              <i />
            </div>
          </div>
          <span className={styles.coreSpark} />
        </div>
      </div>

      <div className={styles.loadingMessage}>
        <strong>Making math visible</strong>
        <span>Preparing your visual lesson</span>
        <div className={styles.progressTrack}>
          <span />
        </div>
      </div>
    </div>
  );
}
