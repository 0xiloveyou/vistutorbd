import PlaceholderRenderer from "./PlaceholderRenderer";
import ObjectCountingRenderer from "./ObjectCountingRenderer";
import FingerHandsRenderer from "./FingerHandsRenderer";
import NumberGridRenderer from "./NumberGridRenderer";
import NumberLineRenderer from "./NumberLineRenderer";
import ShapeCanvasRenderer from "./ShapeCanvasRenderer";
import StorySceneRenderer from "./StorySceneRenderer";
import BalanceScaleRenderer from "./BalanceScaleRenderer";
import ClockRenderer from "./ClockRenderer";
import MoneyShopRenderer from "./MoneyShopRenderer";
import ConceptRenderer from "./scene/ConceptRenderer";

/**
 * Renderer registry. Each renderer receives one frame and draws it.
 * Renderers are lazy-loadable later (SVG / Canvas / Three.js) without changing
 * the player contract.
 */
export const RENDERERS = {
  placeholder: PlaceholderRenderer,
  "object-counting": ObjectCountingRenderer,
  "finger-hands": FingerHandsRenderer,
  "number-grid": NumberGridRenderer,
  "number-line": NumberLineRenderer,
  "shape-canvas": ShapeCanvasRenderer,
  "story-scene": StorySceneRenderer,
  "balance-scale": BalanceScaleRenderer,
  clock: ClockRenderer,
  "money-shop": MoneyShopRenderer,

  // Class 9–12 concept scenes.
  "venn-set": ConceptRenderer,
  "algebra-stepper": ConceptRenderer,
  "function-graph": ConceptRenderer,
  "coordinate-plane": ConceptRenderer,
  "geometry-board": ConceptRenderer,
  "compass-construct": ConceptRenderer,
  "unit-circle": ConceptRenderer,
  "parametric-polar": ConceptRenderer,
  "array-grid": ConceptRenderer,
  "tape-diagram": ConceptRenderer,
  chart: ConceptRenderer,
  "solid-3d": ConceptRenderer,
  "tree-diagram": ConceptRenderer,
  "complex-plane": ConceptRenderer,
  "vector-field": ConceptRenderer,
  "physics-scene": ConceptRenderer,
  "prob-sim": ConceptRenderer,
};

export function getRenderer(name) {
  return RENDERERS[name] ?? PlaceholderRenderer;
}
