import Item from './Item';
import { IEdgeItem, IDrawPartVm, IItem } from '.';
import cloneDeep from 'lodash/cloneDeep';
import { Connection, OverlaySpec } from 'jsplumb';
export default class EdgeItem extends Item implements IEdgeItem {
  public sourceId: string;
  public targetId: string;
  public connection: Connection;
  constructor(vm: IDrawPartVm, edgeInfo: IEdgeItem) {
    super(vm, edgeInfo);
    this.sourceId = edgeInfo.sourceId;
    this.targetId = edgeInfo.targetId;
    // const cloneEdgeInfo = cloneDeep(edgeInfo);
    // Object.assign(this, cloneEdgeInfo);
    // jsplumb连接
    const connection = edgeInfo.connection || this.connect(this.sourceId, this.targetId);
    // todo 对Connection的处理
    // @ts-ignore 🌟 有这个方法!
    connection.setData(this); // connection.getData()  ->  Edge实例对象
    this.connection = connection; // edge.connection   -> Connection对象
    this.initOverlays(edgeInfo);
    // @ts-ignore
    connection.bind('dblclick', (e, originalEvent) => {
      originalEvent.stopPropagation();
      // this.selected = true
      this.setSelected(true);
      vm.apiEmit('edge-dblclick', this);
    });
  }

  /**
   * 设置connection overlay
   * @param {string} overlayId
   * @param {OverlaySpec} overlayCfg 参考Connection.addOverlay方法参数
   */
  public setOverLay(overlayId: string, overlayCfg: OverlaySpec) {
    const overlay = this.connection.getOverlay(overlayId);
    // 已存在此overlay
    if (overlay) {
      // @ts-ignore // overlay的声明文件就没写!!!!! 法克
      overlay.setLabel(overlayCfg[1].label || '');
    } else { // 不存在overlay
      // @ts-ignore
      overlayCfg[1].id = overlayCfg[1].id || overlayId;
      // @ts-ignore
      this.connection.addOverlay(overlayCfg);
    }
  }

  /**
   * 更新业务数据
   * @param task 业务数据对象
   */
  public updateTask(task: IItem["task"]) {
    this.task = cloneDeep(task);
    this.setCondition(task.condition);
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

  /**
   * 初始化 连线箭头 线上文字
   */
  private initOverlays(edgeInfo: IEdgeItem) {
    // 1. 箭头
    this.setOverLay('arrow', ['Arrow', { id: 'arrow', location: 0.95, width: 9, length: 12 }]);
    // 2. 设置*文案* 条件
    this.setCondition(edgeInfo.task.condition);
  }

  /**
   * 设置边的条件值
   * @param {string} condition 条件字符串
   */
  private setCondition(condition: string = '') {
    this.task.condition = condition;
    this.setOverLay('condition', ['Label', {
      id: 'condition',
      label: condition,
      location: 0.8,
      cssClass: 'wfui-condition-label'
    }]);
  }
}

export function createEdge(vm: IDrawPartVm, edgeInfo: IEdgeItem) {
  return new EdgeItem(vm, edgeInfo);
}

