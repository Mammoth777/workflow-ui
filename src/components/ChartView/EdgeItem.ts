import Item from './Item';
import { IEdgeItem, IDrawPartVm } from '.';
import cloneDeep from 'lodash/cloneDeep';
import { Connection } from 'jsplumb';
export default class EdgeItem extends Item implements IEdgeItem {
  public sourceId: string;
  public targetId: string;
  private connection: Connection;
  constructor(vm: IDrawPartVm, edgeInfo: IEdgeItem) {
    super(vm, edgeInfo);
    this.sourceId = edgeInfo.sourceId;
    this.targetId = edgeInfo.targetId;
    const cloneEdgeInfo = cloneDeep(edgeInfo);
    Object.assign(this, cloneEdgeInfo);
    // jsplumb连接
    const connection = this.connect(this.sourceId, this.targetId);
    // todo 对Connection的处理
    // @ts-ignore 🌟 有这个方法!
    connection.setData(this); // connection.getData()  ->  Edge实例对象
    this.connection = connection; // edge.connection   -> Connection对象
  }

  public updateTask(task: object) {
    this.task = cloneDeep(task);
  }

  /**
   * 设置当前连线是否已选择
   * @param {boolean}} flag 是否选择
   */
  public setSelected(flag: boolean) {
    this.selected = flag;
    if (flag) {
      // @ts-ignore
      this.connection.addClass('edge-selected');
      // @ts-ignore
      this.connection.setHover(true);
    } else {
      // @ts-ignore
      this.connection.removeClass('edge-selected');
    }
  }

  /**
   * 连接两个节点(本质是连接endpoint)
   * @param sourceId 来源节点id
   * @param targetId 目标节点id
   */
  private connect(sourceId: string, targetId: string) {
    return this.getJsplumbInstance().connect({
      uuids: [
        'out-' + sourceId,
        'in-' + targetId
      ]
    });
  }
}

export function createEdge(vm: IDrawPartVm, edgeInfo: IEdgeItem) {
  return new EdgeItem(vm, edgeInfo);
}

