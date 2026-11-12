"use client";

/**
 * Bolt — the math companion robot from companion.html, rebuilt as a React SVG.
 * `emotion` drives the face (idle | happy | sad | confused | think) and
 * `talking` animates the mouth while the companion is speaking/answering.
 */
export default function CompanionRobot({
  emotion = "idle",
  talking = false,
  walking = false,
  className = "",
}) {
  return (
    <span
      className={`companion-robot ${walking ? "walking" : ""} ${className}`.trim()}
      data-emo={emotion}
      data-talk={talking ? "on" : "off"}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 120" className="companion-robot-svg">
        <ellipse cx="50" cy="116" rx="26" ry="4" fill="rgba(0,0,0,.18)" />
        <g className="cr-bob">
          <g className="cr-tilt">
            <rect
              x="28"
              y="72"
              width="44"
              height="32"
              rx="13"
              fill="var(--bot)"
              stroke="var(--botline)"
              strokeWidth="3"
            />
            <circle
              cx="50"
              cy="88"
              r="6"
              fill="var(--glow)"
              stroke="var(--botline)"
              strokeWidth="2"
            />
            <circle cx="38" cy="108" r="7" fill="var(--botline)" />
            <circle cx="62" cy="108" r="7" fill="var(--botline)" />

            <rect
              x="15"
              y="76"
              width="11"
              height="22"
              rx="5.5"
              fill="var(--bot)"
              stroke="var(--botline)"
              strokeWidth="3"
            />

            <line
              x1="50"
              y1="20"
              x2="50"
              y2="9"
              stroke="var(--botline)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle
              className="cr-bulb"
              cx="50"
              cy="7"
              r="4.5"
              fill="var(--glow)"
              stroke="var(--botline)"
              strokeWidth="2"
            />
            <circle cx="12" cy="44" r="5" fill="var(--botline)" />
            <circle cx="88" cy="44" r="5" fill="var(--botline)" />
            <rect
              x="15"
              y="20"
              width="70"
              height="50"
              rx="20"
              fill="var(--bot)"
              stroke="var(--botline)"
              strokeWidth="3"
            />
            <rect
              x="22"
              y="27"
              width="56"
              height="36"
              rx="14"
              fill="var(--screen)"
            />

            <g className="cr-look">
              <g className="cr-eyes-n">
                <ellipse
                  className="cr-eye"
                  cx="38"
                  cy="43"
                  rx="5"
                  ry="6.5"
                  fill="var(--glow)"
                />
                <ellipse
                  className="cr-eye"
                  cx="62"
                  cy="43"
                  rx="5"
                  ry="6.5"
                  fill="var(--glow)"
                />
              </g>
              <g
                className="cr-eyes-h"
                fill="none"
                stroke="var(--glow)"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <path d="M33 46q5-9 10 0" />
                <path d="M57 46q5-9 10 0" />
              </g>
              <g
                className="cr-eyes-s"
                fill="none"
                stroke="var(--glow)"
                strokeWidth="3.5"
                strokeLinecap="round"
              >
                <path d="M33 41q5 7 10 3" />
                <path d="M57 44q5 4 10-3" />
              </g>
            </g>

            <circle
              className="cr-cheek"
              cx="29"
              cy="53"
              r="4"
              fill="var(--blush)"
              opacity=".8"
            />
            <circle
              className="cr-cheek"
              cx="71"
              cy="53"
              r="4"
              fill="var(--blush)"
              opacity=".8"
            />

            <path
              className="cr-m-smile"
              d="M42 53q8 7 16 0"
              fill="none"
              stroke="var(--glow)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <ellipse
              className="cr-m-open"
              cx="50"
              cy="54"
              rx="5.5"
              ry="5"
              fill="var(--glow)"
            />
            <path
              className="cr-m-flat"
              d="M44 55h12"
              stroke="var(--glow)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <path
              className="cr-m-sad"
              d="M42 58q8-7 16 0"
              fill="none"
              stroke="var(--glow)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <text
              className="cr-q"
              x="70"
              y="14"
              fontSize="22"
              fontWeight="800"
              fill="var(--accent)"
            >
              ?
            </text>

            <g className="cr-arm">
              <rect
                x="71"
                y="74"
                width="11"
                height="24"
                rx="5.5"
                fill="var(--bot)"
                stroke="var(--botline)"
                strokeWidth="3"
              />
              <circle cx="76.5" cy="99" r="5" fill="var(--accent)" />
            </g>
          </g>
        </g>
      </svg>
    </span>
  );
}
