"use client";

import AlgebraScene from "./AlgebraScene";
import ArrayScene from "./ArrayScene";
import ChartScene from "./ChartScene";
import ComplexScene from "./ComplexScene";
import GeometryScene from "./GeometryScene";
import GraphScene from "./GraphScene";
import ParametricScene from "./ParametricScene";
import PhysicsScene from "./PhysicsScene";
import ProbabilityScene from "./ProbabilityScene";
import SetScene from "./SetScene";
import SolidScene from "./SolidScene";
import TapeScene from "./TapeScene";
import TreeScene from "./TreeScene";
import UnitCircleScene from "./UnitCircleScene";
import VectorScene from "./VectorScene";

/**
 * Routes the class 9–12 renderer names to the shared concept scenes. The
 * original bootstrap registry (number line, balance scale, …) stays in place;
 * this fills the renderer names used by the class 10 and class 11 packs.
 */
export default function ConceptRenderer(props) {
  const renderer = props.spec?.renderer ?? "";

  switch (renderer) {
    case "venn-set":
      return <SetScene {...props} />;
    case "algebra-stepper":
      return <AlgebraScene {...props} />;
    case "function-graph":
    case "coordinate-plane":
      return <GraphScene {...props} />;
    case "geometry-board":
    case "compass-construct":
      return <GeometryScene {...props} />;
    case "unit-circle":
      return <UnitCircleScene {...props} />;
    case "parametric-polar":
      return <ParametricScene {...props} />;
    case "array-grid":
      return <ArrayScene {...props} />;
    case "tape-diagram":
      return <TapeScene {...props} />;
    case "chart":
      return <ChartScene {...props} />;
    case "solid-3d":
      return <SolidScene {...props} />;
    case "tree-diagram":
      return <TreeScene {...props} />;
    case "complex-plane":
      return <ComplexScene {...props} />;
    case "vector-field":
      return <VectorScene {...props} />;
    case "physics-scene":
      return <PhysicsScene {...props} />;
    case "prob-sim":
      return <ProbabilityScene {...props} />;
    default:
      return <GeometryScene {...props} />;
  }
}
