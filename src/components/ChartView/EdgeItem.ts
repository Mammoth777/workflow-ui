import Item from './Item';
import { IEdgeItem } from '.';
import _ from 'lodash';
export default class EdgeItem extends Item implements IEdgeItem {
  public sourceId: string;
  public targetId: string;
  constructor(vm: Vue, nodeInfo: IEdgeItem) {
    super(vm, nodeInfo);
    this.sourceId = nodeInfo.sourceId;
    this.targetId = nodeInfo.targetId;
    const cloneNodeInfo = _.cloneDeep(nodeInfo);
    Object.assign(this, cloneNodeInfo);
  }
}
