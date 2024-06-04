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
  vecModelValidator,
  HTMLContainer,
  stopEventPropagation,
} from "tldraw";
// @ts-ignore
import { getTableVertices, getTailIntersectionPoint } from "./helpers.ts";

import "./style.css";
import TableCells from "./TableCells.js";

// Copied from tldraw/tldraw
export const STROKE_SIZES = {
  s: 2,
  m: 3.5,
  l: 5,
  xl: 10,
};

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
  // fieldCells: T.arrayOf(T.any), // Массив строк
  tail: vecModelValidator,
  isCreateTable: T.boolean,
  data: T.optional(
    T.nullable(
      T.object({
        rows: T.number,
        cols: T.number,
      })
    )
  ),
  hovered: T.optional(
    T.nullable(
      T.object({
        row: T.any,
        col: T.any,
      })
    )
  ),
};

// @ts-ignore
export type TableShapeProps = ShapePropsType<typeof tableShapeProps>;
export type TableShape = TLBaseShape<"table", TableShapeProps>;

export class TableUtil extends ShapeUtil<TableShape> {
  static override type = "table" as const;

  // [2]
  static override props = tableShapeProps;

  override isAspectRatioLocked = (_shape: TableShape) => false;

  override canResize = (_shape: TableShape) => true;

  override canBind = (_shape: TableShape) => true;

  override canEdit = () => true;

  // [3]
  getDefaultProps(): TableShapeProps {
    return {
      w: 356,
      h: 254,
      // @ts-ignore
      color: "black",
      // @ts-ignore
      size: "m",
      // @ts-ignore
      font: "draw",
      // @ts-ignore
      align: "middle",
      // @ts-ignore
      verticalAlign: "start",
      growY: 0,
      text: ["", "", "", ""], // Массив строк с 4 пустыми значениями
      tail: { x: 0, y: 0 },
      isCreateTable: false,
      data: {
        rows: 0,
        cols: 0,
      },
      hovered: {
        row: 0,
        col: 0,
      },
      // fieldCells: [],
    };
  }

  getHeight(shape: TableShape) {
    return shape.props.h;
  }

  getGeometry(shape: TableShape): Geometry2d {
    const tableGeometry = getTableVertices(shape);
    const body = new Polygon2d({
      points: tableGeometry,
      isFilled: true,
    });
    // console.log('123'); here!!!!!
    // console.log(shape.props);

    return body;
  }

  // [4]
  override getHandles(shape: TableShape): TLHandle[] {
    const { tail, w } = shape.props;

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
    ];
  }

  override onHandleDrag: TLOnHandleDragHandler<TableShape> = (
    shape,
    { handle }
  ) => {
    return {
      ...shape,
      props: {
        tail: {
          x: handle.x / shape.props.w,
          y: handle.y / this.getHeight(shape),
        },
      },
    };
  };

  override onBeforeCreate = (next: TableShape) => {
    return this.getGrowY(next, next.props.growY);
  };

  // [5]
  override onBeforeUpdate: TLOnBeforeUpdateHandler<TableShape> | undefined = (
    prev: TableShape,
    shape: TableShape
  ) => {
    const { w, tail } = shape.props;
    const fullHeight = this.getHeight(shape);

    const { segmentsIntersection, insideShape } =
      getTailIntersectionPoint(shape);

    const slantedLength = Math.hypot(w, fullHeight);
    const MIN_DISTANCE = slantedLength / 5;
    const MAX_DISTANCE = slantedLength / 1.5;

    const tailInShapeSpace = new Vec(tail.x * w, tail.y * fullHeight);

    const distanceToIntersection = tailInShapeSpace.dist(segmentsIntersection);
    const center = new Vec(w / 2, fullHeight / 2);
    const tailDirection = Vec.Sub(tailInShapeSpace, center).uni();

    let newPoint = tailInShapeSpace;

    if (insideShape) {
      newPoint = Vec.Add(segmentsIntersection, tailDirection.mul(MIN_DISTANCE));
    } else {
      if (distanceToIntersection <= MIN_DISTANCE) {
        newPoint = Vec.Add(
          segmentsIntersection,
          tailDirection.mul(MIN_DISTANCE)
        );
      } else if (distanceToIntersection >= MAX_DISTANCE) {
        newPoint = Vec.Add(
          segmentsIntersection,
          tailDirection.mul(MAX_DISTANCE)
        );
      }
    }

    const next = structuredClone(shape);
    next.props.tail.x = newPoint.x / w;
    next.props.tail.y = newPoint.y / fullHeight;

    return this.getGrowY(next, prev.props.growY);
  };

  component(shape: TableShape) {
    const {
      id,
      type,
      props: { color, font, size, align, text },
    } = shape;
    const vertices = getTableVertices(shape);
    const { w, h } = shape.props;
    const pathData = "M" + vertices[0] + "L" + vertices.slice(1) + "Z";
    const isSelected = shape.id === this.editor.getOnlySelectedShapeId();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const theme = useDefaultColorTheme();
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
    const isEditing = this.editor.getEditingShapeId() === shape.id;

    return (
      <HTMLContainer
        id={shape.id}
        style={{
          height: shape.props.h,
          width: shape.props.w,
          pointerEvents: "all",
          overflow: "hidden",
        }}
      >
        {shape.props.data.rows > 0 && shape.props.data.cols > 0 ? (
          <div className="table-container">
            {Array.from({ length: shape.props.data.rows }, (_, rowIndex) => (
              <div key={rowIndex} className="table-line">
                {Array.from(
                  { length: shape.props.data.cols },
                  (_, colIndex) => (
                    <div key={colIndex} className="table-block">
                      <input
                        type="text"
                        value={
                          shape.props.text[
                            rowIndex * shape.props.data.cols + colIndex
                          ]
                        }
                        onChange={(e) => {
                          const updatedText = [...shape.props.text];
                          updatedText[
                            rowIndex * shape.props.data.cols + colIndex
                          ] = e.currentTarget.value;
                          this.editor.updateShape<TableShape>({
                            id: shape.id,
                            type: "table",
                            props: {
                              text: updatedText,
                            },
                          });
                        }}
                      />
                    </div>
                  )
                )}
              </div>
            ))}
          </div>
        ) : (
          <TableCells
            onHover={(row, col) => {
              return this.editor.updateShape<TableShape>({
                id: shape.id,
                type: "table",
                props: {
                  hovered: { row, col },
                },
              });
            }}
            onClick={(rows, cols) => {
              this.editor.updateShape<TableShape>({
                id: shape.id,
                type: "table",
                props: {
                  data: {
                    rows,
                    cols,
                  },
                },
              });
            }}
            // fieldCells={[shape.props.hovered.row, shape.props.hovered.col]}
          />
        )}
      </HTMLContainer>
    );
  }

  indicator(shape: TableShape) {
    const vertices = getTableVertices(shape);
    const pathData = "M" + vertices[0] + "L" + vertices.slice(1) + "Z";
    return <path d={pathData} />;
  }

  override onResize: TLOnResizeHandler<TableShape> = (shape, info) => {
    const resized = resizeBox(shape, info);
    const next = structuredClone(info.initialShape);
    next.x = resized.x;
    next.y = resized.y;
    next.props.w = resized.props.w;
    next.props.h = resized.props.h;
    return next;
  };

  getGrowY(shape: TableShape, prevGrowY = 0) {
    const PADDING = 17;
    /*const nextTextSize = this.editor.textMeasure.measureText(shape.props.text[0], {
      ...TEXT_PROPS,
      fontFamily: FONT_FAMILIES[shape.props.font],
      fontSize: LABEL_FONT_SIZES[shape.props.size],
      maxWidth: shape.props.w - PADDING * 2,
    })*/

    // const nextHeight = nextTextSize.h + PADDING * 2

    let growY = 0;

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
    };
  }
}
