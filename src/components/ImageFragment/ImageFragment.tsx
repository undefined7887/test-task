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

function p(x: number, y: number) {
  return {x, y}
}

const SCALE_COEFFICIENT = 1.1

export default function ImageFragment() {
  const [image] = useImage(ImageSrc)
  const containerRef = useRef<HTMLDivElement>()
  const stageRef = useRef<Konva.Stage>();

  function redrawImage(zoom: boolean, coefficient: number, point: Point) {
    let stage = stageRef.current;

    let width = containerRef.current.clientWidth;
    let height = containerRef.current.clientHeight;

    let scale = stage.scaleX();
    let pointerPosition = point;

    let stageToPointerVector = p(
      (pointerPosition.x - stage.x()) / scale,
      (pointerPosition.y - stage.y()) / scale,
    );

    let newScale = zoom
      ? scale * coefficient
      : scale / coefficient;

    let newStagePosition = p(
      pointerPosition.x - stageToPointerVector.x * newScale,
      pointerPosition.y - stageToPointerVector.y * newScale,
    );

    if (newScale <= 1) {
      newScale = 1
      newStagePosition = p(0, 0)
    } else {
      newStagePosition = imagePositionGuard(
        p(width, height),
        newScale,
        newStagePosition
      )
    }

    // Redrawing
    stage.scale(p(newScale, newScale));
    stage.position(newStagePosition);

    console.log("redraw", newScale, newStagePosition)

    stage.batchDraw();
  }

  function imagePositionGuard(size: Point, scale: number, stagePosition: Point): Point {
    let leftTop = p(
      stagePosition.x,
      stagePosition.y
    )
    let rightTop = p(
      stagePosition.x + size.x * scale,
      stagePosition.y
    )

    let leftBottom = p(
      stagePosition.x,
      stagePosition.y + size.y * scale
    )
    let rightBottom = p(
      stagePosition.x + size.x * scale,
      stagePosition.y + size.y * scale
    )

    if (leftTop.x > 0 || leftBottom.x > 0)
      stagePosition.x = 0

    if (leftTop.y > 0 || rightTop.y > 0)
      stagePosition.y = 0

    if (rightTop.x < size.x || rightBottom.x < size.x)
      stagePosition.x = size.x - size.x * scale

    if (leftBottom.y < size.y || rightBottom.y < size.y)
      stagePosition.y = size.y - size.y * scale

    return stagePosition
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