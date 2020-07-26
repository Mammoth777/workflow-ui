import { IItem, IDrawPartVm } from './index';
import { jsPlumbUtil } from 'jsplumb';
export default abstract class Item implements IItem {
  public id: string;
  // 所有业务数据
  public task: object;
  // 当前连线/节点是否被选择
  public selected?: boolean = false;
  public vm: IDrawPartVm;

  constructor(vm: IDrawPartVm, itemInfo: IItem) {
    this.id = itemInfo.id || jsPlumbUtil.uuid();
    this.task = itemInfo.task || {};
    this.vm = vm;
  }

  public abstract updateTask(task: object): void;
  public abstract setSelected(flag: boolean, element: Element): void;

  protected getJsplumbInstance() {
    return this.vm.jsplumbInstance;
  }
}
