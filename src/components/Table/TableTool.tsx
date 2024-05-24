import { BaseBoxShapeTool } from 'tldraw'

export class TableTool extends BaseBoxShapeTool {
  static override id = 'table'
  static override initial = 'idle'
  override shapeType = 'table'
}