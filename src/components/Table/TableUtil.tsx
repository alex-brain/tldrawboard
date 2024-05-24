import {
  DefaultColorStyle,
  DefaultFontStyle,
  DefaultHorizontalAlignStyle,
  DefaultSizeStyle,
  DefaultVerticalAlignStyle,
  Geometry2d,
  Polygon2d,
  ShapePropsType,
  ShapeUtil,
  T,
  TLBaseShape,
  TLHandle,
  TLOnBeforeUpdateHandler,
  TLOnHandleDragHandler,
  TLOnResizeHandler,
  Vec,
  resizeBox,
  structuredClone,
  useDefaultColorTheme,
  vecModelValidator, HTMLContainer,
} from 'tldraw'
// @ts-ignore
import { getTableVertices, getTailIntersectionPoint } from './helpers.ts'

import './style.css';

// Copied from tldraw/tldraw
export const STROKE_SIZES = {
  s: 2,
  m: 3.5,
  l: 5,
  xl: 10,
}

// There's a guide at the bottom of this file!

// [1]

export const tableShapeProps = {
  w: T.number,
  h: T.number,
  size: DefaultSizeStyle,
  color: DefaultColorStyle,
  font: DefaultFontStyle,
  align: DefaultHorizontalAlignStyle,
  verticalAlign: DefaultVerticalAlignStyle,
  growY: T.positiveNumber,
  text: T.arrayOf(T.string), // Массив строк
  tail: vecModelValidator,
}

export type TableShapeProps = ShapePropsType<typeof tableShapeProps>
export type TableShape = TLBaseShape<'table', TableShapeProps>

export class TableUtil extends ShapeUtil<TableShape> {
  static override type = 'table' as const

  // [2]
  static override props = tableShapeProps

  override isAspectRatioLocked = (_shape: TableShape) => false

  override canResize = (_shape: TableShape) => true

  override canBind = (_shape: TableShape) => true

  override canEdit = () => true

  // [3]
  getDefaultProps(): TableShapeProps {
    return {
      w: 200,
      h: 130,
      color: 'black',
      size: 'm',
      font: 'draw',
      align: 'middle',
      verticalAlign: 'start',
      growY: 0,
      text: ['', '', '', ''],  // Массив строк с 4 пустыми значениями
      tail: { x: 0, y: 0 },
    }
  }

  getHeight(shape: TableShape) {
    return shape.props.h
  }

  getGeometry(shape: TableShape): Geometry2d {
    const tableGeometry = getTableVertices(shape)
    const body = new Polygon2d({
      points: tableGeometry,
      isFilled: true,
    })
    return body
  }

  // [4]
  override getHandles(shape: TableShape): TLHandle[] {
    const { tail, w } = shape.props

    return [
     /* {
        id: 'tail',
        type: 'vertex',
        index: ZERO_INDEX_KEY,
        // props.tail coordinates are normalized
        // but here we need them in shape space
        x: tail.x * w,
        y: tail.y * this.getHeight(shape),
      },*/
    ]
  }

  override onHandleDrag: TLOnHandleDragHandler<TableShape> = (shape, { handle }) => {
    return {
      ...shape,
      props: {
        tail: {
          x: handle.x / shape.props.w,
          y: handle.y / this.getHeight(shape),
        },
      },
    }
  }

  override onBeforeCreate = (next: TableShape) => {
    return this.getGrowY(next, next.props.growY)
  }

  // [5]
  override onBeforeUpdate: TLOnBeforeUpdateHandler<TableShape> | undefined = (
    prev: TableShape,
    shape: TableShape
  ) => {
    const { w, tail } = shape.props
    const fullHeight = this.getHeight(shape)

    const { segmentsIntersection, insideShape } = getTailIntersectionPoint(shape)

    const slantedLength = Math.hypot(w, fullHeight)
    const MIN_DISTANCE = slantedLength / 5
    const MAX_DISTANCE = slantedLength / 1.5

    const tailInShapeSpace = new Vec(tail.x * w, tail.y * fullHeight)

    const distanceToIntersection = tailInShapeSpace.dist(segmentsIntersection)
    const center = new Vec(w / 2, fullHeight / 2)
    const tailDirection = Vec.Sub(tailInShapeSpace, center).uni()

    let newPoint = tailInShapeSpace

    if (insideShape) {
      newPoint = Vec.Add(segmentsIntersection, tailDirection.mul(MIN_DISTANCE))
    } else {
      if (distanceToIntersection <= MIN_DISTANCE) {
        newPoint = Vec.Add(segmentsIntersection, tailDirection.mul(MIN_DISTANCE))
      } else if (distanceToIntersection >= MAX_DISTANCE) {
        newPoint = Vec.Add(segmentsIntersection, tailDirection.mul(MAX_DISTANCE))
      }
    }

    const next = structuredClone(shape)
    next.props.tail.x = newPoint.x / w
    next.props.tail.y = newPoint.y / fullHeight

    return this.getGrowY(next, prev.props.growY)
  }

  component(shape: TableShape) {
    const {
      id,
      type,
      props: { color, font, size, align, text },
    } = shape
    const vertices = getTableVertices(shape)
    const { w, h } = shape.props;
    const pathData = 'M' + vertices[0] + 'L' + vertices.slice(1) + 'Z'
    const isSelected = shape.id === this.editor.getOnlySelectedShapeId()
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useDefaultColorTheme()
    let isDragging = false;

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target instanceof HTMLInputElement) return;
      isDragging = true;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (isDragging) {
        e.stopPropagation();
        e.preventDefault();
      }
    };

    return (
      <HTMLContainer
        style={{
          height: shape.props.h,
          width: shape.props.w,
          // [a] This is where we allow pointer events on our shape
          pointerEvents: 'all',
          overflow: 'hidden',
        }}

      >
        <div className="table-container">
          <div className="table-line">
            <div className="table-block">
              <input
                type="text"
                value={shape.props.text[0]}
                onChange={(e) =>
                  this.editor.updateShape<TableShape>({
                    id: shape.id,
                    type: 'table',
                    props: { text: [...text.slice(0, 0), e.currentTarget.value, ...text.slice(1)] },
                  })
                }
              />
            </div>
            <div className="table-block">
              <input
                type="text"
                value={shape.props.text[1]}
                onChange={(e) =>
                  this.editor.updateShape<TableShape>({
                    id: shape.id,
                    type: 'table',
                    props: { text: [...text.slice(0, 1), e.currentTarget.value, ...text.slice(2)] },
                  })
                }
              />
            </div>
          </div>
          <div className="table-line">
            <div className="table-block">
              <input
                type="text"
                value={shape.props.text[2]}
                onChange={(e) =>
                  this.editor.updateShape<TableShape>({
                    id: shape.id,
                    type: 'table',
                    props: { text: [...text.slice(0, 2), e.currentTarget.value, ...text.slice(3)] },
                  })
                }
              />
            </div>
            <div className="table-block">
              <input
                type="text"
                value={shape.props.text[3]}
                onChange={(e) =>
                  this.editor.updateShape<TableShape>({
                    id: shape.id,
                    type: 'table',
                    props: { text: [...text.slice(0, 3), e.currentTarget.value] },
                  })
                }
              />
            </div>
          </div>
        </div>
      </HTMLContainer>
    )
  }

  indicator(shape: TableShape) {
    const vertices = getTableVertices(shape)
    const pathData = 'M' + vertices[0] + 'L' + vertices.slice(1) + 'Z'
    return <path d={pathData} />
  }

  override onResize: TLOnResizeHandler<TableShape> = (shape, info) => {
    const resized = resizeBox(shape, info)
    const next = structuredClone(info.initialShape)
    next.x = resized.x
    next.y = resized.y
    next.props.w = resized.props.w
    next.props.h = resized.props.h
    return next
  }

  getGrowY(shape: TableShape, prevGrowY = 0) {
    const PADDING = 17
    /*const nextTextSize = this.editor.textMeasure.measureText(shape.props.text[0], {
      ...TEXT_PROPS,
      fontFamily: FONT_FAMILIES[shape.props.font],
      fontSize: LABEL_FONT_SIZES[shape.props.size],
      maxWidth: shape.props.w - PADDING * 2,
    })*/

    // const nextHeight = nextTextSize.h + PADDING * 2

    let growY = 0

/*    if (nextHeight > shape.props.h) {
      growY = nextHeight - shape.props.h
    } else {
      if (prevGrowY) {
        growY = 0
      }
    }*/

    return {
      ...shape,
      props: {
        ...shape.props,
        growY,
      },
    }
  }
}