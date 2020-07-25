import Item from './Item';
import { IEdgeItem } from '.';
import _ from 'lodash';
export default class EdgeItem extends Item implements IEdgeItem {
  public sourceId: string;
  public targetId: string;
  constructor(vm: Vue, edgeInfo: IEdgeItem) {
    super(vm, edgeInfo);
    this.sourceId = edgeInfo.sourceId;
    this.targetId = edgeInfo.targetId;
    const cloneEdgeInfo = _.cloneDeep(edgeInfo);
    Object.assign(this, cloneEdgeInfo);
    // jsplumb连接
    const connection = this.connect(this.sourceId, this.targetId);
    // todo 对Connection的处理
  }

  private connect(sourceId: string, targetId: string) {
    return this.getJsplumbInstance().connect({
      uuids: [
        'out-' + sourceId,
        'in-' + targetId
      ]
    });
  }
}

export function createEdge(vm: Vue, edgeInfo: IEdgeItem) {
  return new EdgeItem(vm, edgeInfo);
}

