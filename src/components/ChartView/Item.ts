import { IItem, IDrawPart } from './index';
import { jsPlumbUtil } from 'jsplumb';
export default class Item implements IItem {
  public id: string;
  // 所有业务数据
  public task: object;
  // 当前连线/节点是否被选择
  public selected?: boolean = false;
  public vm: Vue & IDrawPart;
  constructor(vm: Vue & IDrawPart, itemInfo: IItem) {
    this.id = itemInfo.id || jsPlumbUtil.uuid();
    this.task = itemInfo.task || {};
    this.vm = vm;
  }

  protected getJsplumbInstance() {
    return this.vm.jsplumbInstance;
  }
}
