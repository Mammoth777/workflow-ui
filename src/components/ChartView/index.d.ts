import { jsPlumbInstance } from "jsplumb";

export interface IItem {
  id: string
  task: object
  selected?: boolean
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

export interface IDrawPart extends Vue {
  nodes: INodeItem[]
  jsplumbInstance: jsPlumbInstance
}
