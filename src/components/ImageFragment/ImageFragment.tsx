import React, {useRef} from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image
} from "react-konva";
import useImage from "use-image";

import ImageSrc from "assets/image.jpg"
import Styles from "./ImageFragment.css"
import {classes} from "src/utils";

interface Point {
  x: number,
  y: number
}

const SCALE_COEFFICIENT = 1.1

export default function ImageFragment() {
  const [image] = useImage(ImageSrc)
  const containerRef = useRef<HTMLDivElement>()
  const stageRef = useRef<Konva.Stage>();

  function redrawImage(zoom: boolean, coefficient: number, point: Point) {
    let stage = stageRef.current;
    let container = containerRef.current;

    let scale = stage.scaleX();
    let pointerPosition = point;

    let stageToPointerVector = {
      x: (pointerPosition.x - stage.x()) / scale,
      y: (pointerPosition.y - stage.y()) / scale,
    };

    let newScale = zoom
      ? scale * coefficient
      : scale / coefficient;

    let newStagePosition = {
      x: pointerPosition.x - stageToPointerVector.x * newScale,
      y: pointerPosition.y - stageToPointerVector.y * newScale,
    };

    // If image smaller than box
    if (newScale <= 1) {
      newScale = 1
      newStagePosition = {x: 0, y: 0}
    } else {
      let leftTop = {
        x: newStagePosition.x,
        y: newStagePosition.y
      }

      let rightTop = {
        x: newStagePosition.x + stage.width() * newScale,
        y: newStagePosition.y
      }

      let leftBottom = {
        x: newStagePosition.x,
        y: newStagePosition.y + stage.height() * newScale
      }

      let rightBottom = {
        x: newStagePosition.x + stage.width() * newScale,
        y: newStagePosition.y + stage.height() * newScale
      }

      if (leftTop.x > 0 || leftBottom.x > 0) {
        newStagePosition.x = 0
      }

      if (leftTop.y > 0 || rightTop.y > 0) {
        newStagePosition.y = 0
      }

      if (rightTop.x < container.clientWidth || rightBottom.x < container.clientWidth) {
        newStagePosition.x = container.clientWidth - stage.width() * newScale
      }

      if (leftBottom.y < container.clientHeight || rightBottom.y < container.clientHeight) {
        newStagePosition.y = container.clientHeight - stage.height() * newScale
      }
    }

    // Redrawing
    stage.scale({x: newScale, y: newScale});
    stage.position(newStagePosition);

    stage.batchDraw();
  }

  function onWheel(e) {
    redrawImage(
      e.evt.deltaY < 0,
      SCALE_COEFFICIENT,
      stageRef.current.getPointerPosition()
    )
  }

  function onScaleInButtonClick() {
    redrawImage(
      true,
      SCALE_COEFFICIENT,
      {
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2
      }
    )
  }

  function onScaleOutButtonClick() {
    redrawImage(
      false,
      SCALE_COEFFICIENT,
      {
        x: containerRef.current.clientWidth / 2,
        y: containerRef.current.clientHeight / 2
      }
    )
  }

  return (
    <div className={Styles.Fragment}>
      <div ref={containerRef}
           className={Styles.Container}>
        <Stage ref={stageRef} className={Styles.Stage}
               onWheel={onWheel}
               width={800}
               height={450}>
          <Layer>
            <Image image={image}
                   width={800}
                   height={450}/>
          </Layer>
        </Stage>
        <div className={Styles.Controllers}>
          <div className={classes("material-icons", Styles.Controller)}
               onClick={onScaleInButtonClick}>
            add
          </div>
          <div style={{marginTop: 20}}
               className={classes("material-icons", Styles.Controller)}
               onClick={onScaleOutButtonClick}>
            remove
          </div>
        </div>
      </div>
    </div>
  )
}