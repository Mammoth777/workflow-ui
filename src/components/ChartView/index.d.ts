import { jsPlumbInstance, Connection } from "jsplumb";
import { VNode } from "vue/types/umd";

export enum ItemType {
  node = 'node',
  edge = 'edge'
}


export interface IItem {
  id?: string
  task: {
    [key: string]: any
  }
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
  connection?: Connection
}


interface IDrawPart {
  nodes: INodeItem[]
  jsplumbInstance: jsPlumbInstance
  apiEmit: (evtName: string, payload?: any) => void
}
type IDrawPartVm = IDrawPart & Vue

type PLUGIN = (workSpaceDom: HTMLElement,
  chartViewVueInstance: Vue,
  jsplumbInstance: jsPlumbInstance) => VNode | void

export interface IWorkflowUI {
  deleteItem: (itemType: ItemType, id: string) => void;
}
