import React, {useRef, useState} from "react";
import Konva from "konva";
import {
  Stage,
  Layer,
  Image, Rect
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
const CONTAINER_HEIGHT = 450
const CONTAINER_WIDTH = 800
const SCROLL_PADDING = 10

// That should be equal
const SCROLL_HEIGHT = 10
const SCROLL_WIDTH = 10

export default function ImageFragment() {
  const [image] = useImage(ImageSrc)
  const stageRef = useRef<Konva.Stage>()
  const imageRef = useRef<Konva.Image>()
  const horizontalScrollRef = useRef<Konva.Rect>()
  const verticalScrollRef = useRef<Konva.Rect>()

  const [zoomPercent, setZoomPercent] = useState(100)

  function scaleImage(newScale: number, point: Point) {
    let stage = stageRef.current
    let image = imageRef.current

    let scale = image.scaleX()
    let pointerPosition = point

    let imageToPointerVector = p(
      (pointerPosition.x - image.x()) / scale,
      (pointerPosition.y - image.y()) / scale,
    );

    let newImagePosition = p(
      pointerPosition.x - imageToPointerVector.x * newScale,
      pointerPosition.y - imageToPointerVector.y * newScale,
    );

    if (newScale <= 1) {
      newScale = 1
      newImagePosition = p(0, 0)
    } else {
      newImagePosition = imagePositionGuard(
        newScale,
        newImagePosition,
        p(stage.width(), stage.height())
      )
    }

    setZoomPercent(Math.round(newScale * 100))

    // Redrawing
    image.scale(p(newScale, newScale))
    image.position(newImagePosition)

    // Redrawing scrolls
    redrawScrolls()

    stage.batchDraw();
  }

  function imagePositionGuard(scale: number, position: Point, size: Point): Point {
    let leftTop = position
    let rightTop = p(
      position.x + size.x * scale,
      position.y
    )

    let leftBottom = p(
      position.x,
      position.y + size.y * scale
    )
    let rightBottom = p(
      position.x + size.x * scale,
      position.y + size.y * scale
    )

    if (leftTop.x > 0 || leftBottom.x > 0)
      position.x = 0

    if (leftTop.y > 0 || rightTop.y > 0)
      position.y = 0

    if (rightTop.x < size.x || rightBottom.x < size.x)
      position.x = size.x - size.x * scale

    if (leftBottom.y < size.y || rightBottom.y < size.y)
      position.y = size.y - size.y * scale

    return position
  }

  function redrawScrolls() {
    let stage = stageRef.current
    let image = imageRef.current
    let horizontalScroll = horizontalScrollRef.current
    let verticalScroll = verticalScrollRef.current

    let imageScale = image.scaleX();
    let imagePosition = image.position()

    let horizontalCoefficient = stage.width() / (image.width() * imageScale)
    let verticalCoefficient = stage.height() / (image.height() * imageScale)

    if (horizontalCoefficient == 1)
      horizontalCoefficient = 0

    if (verticalCoefficient == 1)
      verticalCoefficient = 0

    let horizontalWidth = Math.max(horizontalCoefficient * stage.width() - SCROLL_PADDING * 2, 0)
    let horizontalX = Math.abs(imagePosition.x / imageScale) + SCROLL_PADDING

    let verticalHeight = Math.max(verticalCoefficient * stage.height() - SCROLL_PADDING * 2, 0)
    let verticalY = Math.abs(imagePosition.y / imageScale) + SCROLL_PADDING

    // Redrawing horizontal scroll
    horizontalScroll.width(horizontalWidth)
    horizontalScroll.x(horizontalX)

    // Redrawing vertical scroll
    verticalScroll.height(verticalHeight)
    verticalScroll.y(verticalY)

    stage.batchDraw()
  }

  function onWheel(e) {
    let stage = stageRef.current
    let image = imageRef.current

    let scale = image.scaleX()

    scaleImage(
      e.evt.deltaY < 0
        ? scale * SCALE_COEFFICIENT
        : scale / SCALE_COEFFICIENT,
      stage.getPointerPosition()
    )
  }

  function onScaleInButtonClick() {
    let stage = stageRef.current
    let image = imageRef.current

    let scale = image.scaleX()

    scaleImage(
      scale * SCALE_COEFFICIENT,
      p(stage.width() / 2, stage.height() / 2)
    )
  }

  function onScaleOutButtonClick() {
    let stage = stageRef.current
    let image = imageRef.current

    let scale = image.scaleX()

    scaleImage(
      scale / SCALE_COEFFICIENT,
      p(stage.width() / 2, stage.height() / 2)
    )
  }

  function onScroll() {
    let stage = stageRef.current
    let horizontalScroll = horizontalScrollRef.current
    let verticalScroll = verticalScrollRef.current

    let totalWidth = stage.width() - SCROLL_PADDING * 2 - horizontalScroll.width()
    let totalHeight = stage.height() - SCROLL_PADDING * 2 - verticalScroll.height()

    let deltaX = (horizontalScroll.x() - SCROLL_PADDING) / totalWidth
    let deltaY = (verticalScroll.y() - SCROLL_PADDING) / totalHeight

    moveImage(p(deltaX, deltaY))
    stage.batchDraw()
  }

  function moveImage(delta: Point) {
    let stage = stageRef.current
    let image = imageRef.current

    let scale = image.scaleX()

    let newPosition = p(
      -(image.width() * scale - stage.width()) * delta.x,
      -(image.height() * scale - stage.height()) * delta.y
    )

    // Redrawing image
    image.position(newPosition)

    stage.batchDraw()
  }

  function horizontalScrollDragBound(position: Point) {
    let stage = stageRef.current
    let scroll = horizontalScrollRef.current

    position.x = Math.max(
      Math.min(position.x, stage.width() - scroll.width() - SCROLL_PADDING),
      SCROLL_PADDING
    )
    position.y = stage.height() - SCROLL_PADDING - SCROLL_HEIGHT

    return position
  }

  function verticalScrollDragBound(position: Point) {
    let stage = stageRef.current
    let scroll = verticalScrollRef.current

    position.x = stage.width() - SCROLL_PADDING - SCROLL_WIDTH
    position.y = Math.max(
      Math.min(position.y, stage.height() - scroll.height() - SCROLL_PADDING),
      SCROLL_PADDING
    )

    return position
  }

  function onResetButtonClick() {
    let stage = stageRef.current
    let image = imageRef.current

    image.scale(p(1, 1))
    image.position(p(0, 0))

    redrawScrolls()
    stage.batchDraw()
  }

  return (
    <div className={Styles.Fragment}>
      <div className={Styles.Container}>
        <Stage ref={stageRef} className={Styles.Stage}
               onWheel={onWheel}
               width={CONTAINER_WIDTH}
               height={CONTAINER_HEIGHT}>
          <Layer>
            <Image ref={imageRef}
                   image={image}
                   width={CONTAINER_WIDTH}
                   height={CONTAINER_HEIGHT}/>

            <Rect ref={horizontalScrollRef}
                  x={SCROLL_PADDING}
                  y={CONTAINER_HEIGHT - SCROLL_PADDING - SCROLL_HEIGHT}
                  height={SCROLL_HEIGHT}
                  cornerRadius={SCROLL_HEIGHT / 2}
                  draggable={true}
                  fill="white"
                  opacity={0.5}
                  onDragMove={onScroll}
                  dragBoundFunc={horizontalScrollDragBound}/>

            <Rect ref={verticalScrollRef}
                  x={CONTAINER_WIDTH - SCROLL_PADDING - SCROLL_WIDTH}
                  y={SCROLL_PADDING}
                  width={SCROLL_WIDTH}
                  cornerRadius={SCROLL_WIDTH / 2}
                  draggable={true}
                  fill="white"
                  opacity={0.5}

                  onDragMove={onScroll}
                  dragBoundFunc={verticalScrollDragBound}/>
          </Layer>
        </Stage>

        <div className={classes(Styles.Controller, Styles.PercentageController)}>
          {zoomPercent}%
        </div>
        <div className={Styles.ZoomControllers}>
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
        <div className={classes(Styles.Controller, Styles.ResetController, "material-icons")}
             onClick={onResetButtonClick}>
          close
        </div>
      </div>
    </div>
  )
}