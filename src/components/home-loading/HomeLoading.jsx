"use client";

import styles from "./HomeLoading.module.css";

const TARGET = process.env.NEXT_PUBLIC_HOME_LOADING_TARGET;
const selectedTarget = ["1", "2", "3"].includes(TARGET) ? TARGET : "1";

function DiamondRings() {
  return (
    <div className={styles.ringLoader} aria-hidden="true">
      {Array.from({ length: 15 }, (_, index) => (
        <span
          className={styles.diamondRing}
          key={index}
          style={{ "--ring-index": index }}
        />
      ))}
    </div>
  );
}

function ComicCube() {
  return (
    <div className={styles.container} aria-hidden="true">
      <div className={styles.actionRays} />
      <div className={styles.popBurst}>
        <div className={styles.word} />
      </div>
      <div className={styles.stage}>
        <div className={styles.cube}>
          {[
            ["01", "Start", "f-1"],
            ["02", "Action", "f-2"],
            ["03", "Zoom", "f-3"],
            ["04", "Wait", "f-4"],
            ["05", "Boom", "f-5"],
            ["06", "Loading", "f-6"],
          ].map(([number, label, face]) => (
            <div className={`${styles.face} ${styles[face]}`} key={number}>
              <span className={styles.panelNum}>{number}</span>
              <span className={styles.panelLabel}>{label}</span>
            </div>
          ))}
        </div>
        <div className={styles.shadowFloor} />
      </div>
    </div>
  );
}

function FallingCloud() {
  return (
    <div className={styles.cloudLoader} aria-hidden="true">
      <div className={styles.cloud} />
      <div className={styles.parachute}>
        <span />
        <span />
        <span />
        <i />
      </div>
      <div className={styles.fallingDrops}>
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

export default function HomeLoading() {
  return (
    <div className={styles.loadingStage} role="status" aria-label="Loading home content">
      <span className={styles.srOnly}>Loading home content</span>
      {selectedTarget === "1" ? <ComicCube /> : null}
      {selectedTarget === "2" ? <DiamondRings /> : null}
      {selectedTarget === "3" ? <FallingCloud /> : null}
    </div>
  );
}
