import Item from './Item';
import cloneDeep from 'lodash/cloneDeep';
import { INodeItem, IDrawPartVm } from '.';
import { Endpoint } from 'jsplumb';
export default class NodeItem extends Item implements INodeItem {
  public x: number;
  public y: number;
  public nodeType: string;
  public dom?: HTMLElement; // 只要选择过此节点, 就会被记录, 在节点blur时, 可以只遍历这些被选择过的, 使其取消选择即可
  public endPoints: Endpoint[] = []; // 每个节点的连接点

  constructor(vm: IDrawPartVm, nodeInfo: INodeItem) {
    super(vm, nodeInfo);
    // 1. 节点基本参数
    this.x = nodeInfo.x;
    this.y = nodeInfo.y;
    this.nodeType = nodeInfo.nodeType;
    // 2. 初始化图形
    setTimeout(() => {
      // 2.1 设置图形参数
      this.setDefaultCfg();
      // 2.2 设置节点可拖动
      this.setDraggable();
    }, 0);
    const cloneNodeInfo = cloneDeep(nodeInfo);
    Object.assign(this, cloneNodeInfo);
  }

  /**
   * 更新业务数据
   * @param task 任务
   */
  public updateTask(task: object) {
    this.task = cloneDeep(task);
  }

  public setSelected(flag: boolean, dom: HTMLElement) {
    this.dom = dom;
    this.vm.$set(this, 'selected', flag);
    if (flag) {
      dom.classList.add('node-selected');
    } else {
      dom.classList.remove('node-selected');
    }
  }

  /**
   * 设置节点默认jsplumb配置
   */
  private setDefaultCfg(): void {
    // 设置默认连线样式及overlays
    const common = {
      allowLoopback: false, // 不可回环
    };
    const chart = this.getJsplumbInstance();
    // todo 这里可以从外部传入设置
    // **添加起始点**
    const outPoint = chart.addEndpoint(this.id, {
      uuid: 'out-' + this.id,
      isSource: true,
      // @ts-ignore 有!
      anchors: [
        // 'Right', 'Top', 'Left', 'Bottom'
        'Right',
      ],
      endpoint: ['Dot', {
        radius: 6,
        cssClass: 'end-point',
        hoverClass: 'end-point-hover'
      }]
    }, common);
    // **添加结束点**
    const inPoint = chart.addEndpoint(this.id, {
      uuid: 'in-' + this.id,
      isTarget: true,
      // @ts-ignore 有!
      anchors: [
        // 'Left', 'Top', 'Right', 'Bottom'
        'Left',
      ],
      endpoint: ['Rectangle', {
        width: 10,
        height: 10,
        cssClass: 'end-point',
        hoverClass: 'end-point-hover',
      }],
    }, common);
  }

  /**
   * 设置节点可拖动
   */
  private setDraggable(): void {
    const chart = this.getJsplumbInstance();
    chart.draggable(this.id, {
      // grid: [4, 4],
      // start: e => {
      //   console.log('start')
      // },
      // 节点拖动结束位置记录
      stop: (e: { pos: [number, number] }) => {
        const [x, y] = e.pos;
        this.x = x;
        this.y = y;
      },
    });
  }
}

export function createNode(vm: IDrawPartVm, nodeInfo: INodeItem): NodeItem {
  const node = new NodeItem(vm, nodeInfo);
  vm.nodes.push(node);
  return node;
}
