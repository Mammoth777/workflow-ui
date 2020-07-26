import { jsPlumbInstance } from "jsplumb";

export interface IItem {
  id?: string
  task: object
  selected?: boolean
  // updateTask: (task: object) => void
}

export interface INodeItem extends IItem {
  x: number
  y: number
  nodeType: string
}

export interface IEdgeItem extends IItem {
  sourceId: string
  targetId: string
}


interface IDrawPart {
  nodes: INodeItem[]
  jsplumbInstance: jsPlumbInstance
}
type IDrawPartVm = IDrawPart & Vue
