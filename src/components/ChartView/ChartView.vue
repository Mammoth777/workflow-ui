<template>
  <div class="chart-view">
    <!-- 节点列表 -->
    <div class="work-space"
      :style="workFlowStyle"
      ref="workSpace"
      @dragenter="preventHandler"
      @dragover="preventHandler"
      @drop="dropHandler"
    >
      <!-- 怎么设计一个vue组件的插件?? -->
      <div class="plugins-layer">
        <plugin-layer :plugins="plugins"></plugin-layer>
      </div>
      <div class="draw-layer" ref="drawLayer">
        <DrawPart
          class="node-list-container"
          ref="chart"
        ></DrawPart>
      </div>
      <!-- 右键菜单 -->
      <vue-context ref="contextMenu" class="context-menu" v-if="contextMenuList.length">
        <template v-slot="child">
          <li class="context-item" v-for="menu in contextMenuList" :key="menu.label">
            <a class="context-item-link" @click.prevent="contextMenuItemClick(menu, child.data)" v-text="menu.label"></a>
          </li>
        </template>
      </vue-context>
    </div>
  </div>
</template>

<doc>
1. 所有的参数深克隆在这一层做完
</doc>

<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { FunctionalComponentOptions, VueConstructor, VNode } from "vue";
import { RecordPropsDefinition } from "vue/types/options";
import DrawPart, { NODE_TYPES } from "./DrawPart.vue";
import NodeItem, { createNode } from "./NodeItem";
import EdgeItem from "./EdgeItem";
import cloneDeep from "lodash/cloneDeep";
import isString from "lodash/isString";
import { INodeItem, IEdgeItem, IItem, ItemType, IWorkflowUI } from ".";
import { Connection, jsPlumbInstance } from "jsplumb";
import { nextMacroTask } from "./utils";
import PluginLayer from "./PluginLayer.vue";
// @ts-ignore 没有声明文件
import VueContext from "vue-context";
import "vue-context/dist/css/vue-context.css";

interface IChartData {
  nodes: INodeItem[];
  edges: IEdgeItem[];
}

interface IContextMenu {
  label: string;
  onClick: (nodeinfo: INodeItem) => void;
}

/**
 * 获取此节点的前置节点, (如有回环, 不会获取到本节点)
 * @param {string} nodeId 节点id
 * @param {Array} edges 连线数组 [ {sourceId, targetId} ]
 */
function getPreviousNodeIds(nodeId: string, edges: IEdgeItem[]) {
  const result: string[] = [];
  const originNodeId = nodeId;
  const findPrevNodeIds = (nId: string) => {
    const prevIds = edges.filter((edge) => edge.targetId === nId).map((v) => v.sourceId);
    prevIds.forEach((prevId) => {
      if (!result.includes(prevId) && prevId !== originNodeId) {
        result.push(prevId);
        findPrevNodeIds(prevId);
      }
    });
    return result;
  };
  findPrevNodeIds(nodeId);
  return result;
}

/**
 * 删除掉vm成员属性,
 * cloneDeep task
 */
function payloadInterception(payload: object) {
  return Object.entries(payload).reduce((newPayload: {[key: string]: any}, [key, value]) => {
    if (key !== 'vm') {
      newPayload[key] = value;
    }
    if (key === 'task') {
      newPayload[key] = cloneDeep(value);
    }
    return newPayload;
  }, {});
}

/**
 * 计算宽高位置
 */
function getSize(size: number | string): string {
  return typeof size === 'string' ? size : size + 'px';
}

const PLUGINS: Array<
  ( workSpaceDom: HTMLElement,
    chartViewVueInstance: Vue,
    jsplumbInstance: jsPlumbInstance) => VNode | void
  > = [];

@Component({
  components: {
    DrawPart,
    PluginLayer,
    VueContext
  },
})
export default class ChartView extends Vue implements IWorkflowUI {
  /**
   * 注册节点类型
   */
  public static registNodeTypeByRender<Props>(
    name: string,
    vmCfg: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
  ): void {
    return DrawPart.registNodeType(name, vmCfg);
  }

  /**
   * 通过SFC注册节点类型
   */
  public static registNodeType(componentName: string, SFC: VueConstructor, width?: number, height?: number) {
    if (!width || !height) {
      console.warn('width或height未传入, 请确保已经在组件内部固定了节点宽高');
    }
    const regist = DrawPart.registNodeType.bind(DrawPart);
    regist(componentName, {
      name: componentName,
      functional: true,
      render(h, ctx) {
        let style;
        if (width && height) {
          style = { width: `${width}px`, height: `${height}px` };
        }
        const data = {
          props: ctx.props as { [key: string]: any },
          style
        };
        return h(SFC, data);
      }
    });
  }

  /**
   * 注册插件
   */
  public static registPlugins(
    plugins: typeof PLUGINS
  ): void {
    PLUGINS.push(...plugins);
  }

  /**
   * 获取绘图板组件对象实例
   */
  get drawPart(): Vue & DrawPart {
    return this.$refs.chart as Vue & DrawPart;
  }

  // 工作流dom样式
  get workFlowStyle() {
    return {
      width: getSize(this.width!),
      height: getSize(this.height!)
    };
  }

  @Prop({
    default: []
  })
  public contextMenuList!: IContextMenu[];

  // 工作流组件宽度
  @Prop({
    default: 800
  })
  public width!: string | number;
  // 工作流组件高度
  @Prop({
    default: 600
  })
  public height!: string | number;

  public plugins: VNode[] = [];
  /**
   * 初始化数据
   */
  public async initChart(data: IChartData): Promise<void> {
    const drawPart = this.drawPart;
    drawPart.jsplumbInstance.reset();
    drawPart.nodes = [];
    const nodes = cloneDeep(data.nodes);
    const edges = cloneDeep(data.edges);
    // 必须先初始化节点, 否则连线无效
    await drawPart.initNodes(nodes);
    await drawPart.initEdges(edges);
    drawPart.initJsplumbEvents();
    return Promise.resolve();
  }

  public setData(chartData: IChartData) {
    return this.initChart(chartData);
  }

  /**
   * 创建节点
   */
  public async createNode(nodeInfo: INodeItem) {
    const node = await createNode(this.drawPart, cloneDeep(nodeInfo));
    await nextMacroTask(); // spec 注意, 这里是不得已而为之, 否则会连线失败, 猜测是endpoint渲染顺序问题
    this.apiEmit("node-created", node);
  }

  /**
   * 删除节点/边
   */
  public deleteItem(itemType: ItemType, id: string) {
    const fnMap = {
      node: this.deleteNode,
      edge: this.deleteEdge
    };
    return fnMap[itemType](id);
  }

  /**
   * 更新节点/边
   */
  public updateItem(itemType: ItemType, id: string, task: object) {
    const fnMap = {
      node: this.updateNode,
      edge: this.updateEdge
    };
    return fnMap[itemType](id, task);
  }

  /**
   * 获取全部节点/连线数据
   */
  public getData() {
    const nodes = this.getNodes();
    const edges = this.getEdges();
    return {
      nodes: nodes.map(payloadInterception),
      edges: edges.map(payloadInterception)
    };
  }

  /**
   * 根据id查询节点
   */
  public getNodeById(id: string): INodeItem | void {
    const nodes = this.drawPart.nodes;
    return nodes.find((n) => n.id === id);
  }

  /**
   * 获取前置节点
   * @param {string} nodeId 根据id查询节点
   */
  public getPreviousNodes(nodeId: string) {
    const { nodes, edges } = this.getData();
    const currNode = nodes.find((node) => node.id === nodeId);
    if (!currNode) {
      throw new Error(`当前节点(id:${nodeId})不存在`);
    }
    const prevNodeIds = getPreviousNodeIds(nodeId, edges as IEdgeItem[]);
    return prevNodeIds.map(this.getNodeById);
  }

  /**
   * 右键菜单点击事件处理
   */
  public contextMenuItemClick(menu: IContextMenu, data: INodeItem) {
    menu.onClick(cloneDeep(data));
  }

  /**
   * 删除节点
   */
  private async deleteNode(id: string) {
    const drawPart = this.drawPart;
    // 1. 从jsplumb体系中删除此节点
    drawPart.jsplumbInstance.remove(id);
    // 2. 从本地数据中删除节点
    const index = drawPart.nodes.findIndex((currNode) => currNode.id === id);
    if (index === -1) {
      throw new Error(`没有id: ${id}为的节点`);
    }
    const node = drawPart.nodes[index];
    drawPart.nodes.splice(index, 1);
    await nextMacroTask();
    return node;
  }

  /**
   * 删除连线
   */
  private async deleteEdge(id: string) {
    const chart = this.drawPart.jsplumbInstance;
    // @ts-ignore
    const allConnections: Connection[] = chart.getConnections();
    // @ts-ignore
    const currConn = allConnections.filter((edge) => edge.getId() === id)[0];
    if (currConn) {
      chart.deleteConnection(currConn);
    } else {
      console.error('此id没有对应的edge');
    }
  }

  /**
   * 更新节点
   */
  private async updateNode(id: string, task: object) {
    const drawPart = this.drawPart;
    const currNode: NodeItem = drawPart.nodes.filter((node) => node.id === id)[0];
    if (currNode) {
      currNode.updateTask(cloneDeep(task));
    } else {
      console.error(`未获取到id为(${id})的节点`);
    }
    await nextMacroTask();
    this.apiEmit("node-updated", {
      id: currNode.id,
      nodeType: currNode.nodeType,
      selected: currNode.selected,
      task: currNode.task
    });
  }

  /**
   * 更新连线
   */
  private async updateEdge(id: string, task: object) {
    // @ts-ignore
    const allConnections: Connection[] = this.drawPart.jsplumbInstance.getConnections();
    const currEdge = allConnections
      // @ts-ignore
      .map((connection) => connection.getData())
      .filter((edge) => edge.id === id)[0];
    if (currEdge) {
      currEdge.updateTask(task);
    } else {
      console.error('此id没有对应的edge');
    }
  }

  /**
   * 获取全部节点
   */
  private getNodes(): INodeItem[] {
    return this.drawPart.nodes.map((node) => node);
  }

  /**
   * 获取全部连线
   */
  private getEdges(): IEdgeItem[] {
    // @ts-ignore
    const connections: Connection[] = this.drawPart.jsplumbInstance.getConnections();
    // @ts-ignore
    return connections.map((conn) => conn.getData());
  }

  // todo addEdge
  /**
   * 连接两个节点, 自动选择EndPoint
   * 之后要做完了节点的多个EndPoint配置再写这个
   */
  // public async addConnection(sourceId: string, targetId: string): Connection {
  // return
  // }

      // 节点drop事件处理
  private dropHandler(e: DragEvent) {
    e.preventDefault();
    //  1. 节点视图处理
    const nodeType = e.dataTransfer!.getData('nodeType');
    if (!isString(nodeType)) {
      throw new TypeError('获取节点类型失败');
    }
    // fix: 拖动画布后, 拖入节点不显示问题(e.toElement改变导致获取数据错误)
    const boundRect = this.drawPart.$el.getBoundingClientRect();
    const x = e.clientX - boundRect.x - 20;
    const y = e.clientY - boundRect.y - 20;
    const CURR_TYPES = Object.keys(NODE_TYPES);
    if (!CURR_TYPES.includes(nodeType)) {
      throw new Error(`${nodeType}节点类型未注册;\n\n当前已注册节点类型: [${CURR_TYPES.join(',')}]`);
    }
    // 2. 节点任务处理
    const task = e.dataTransfer!.getData('task');
    this.createNode({
      x,
      y,
      nodeType,
      task: JSON.parse(task)
    });
  }

  private preventHandler(e: Event) {
    // 注意: 此处阻止了以后, drop才会触发
    e.preventDefault();
  }

  /**
   * 触发事件, 用于给外部暴露的api事件, 所以我的方法名取的很好😁
   */
  @Provide()
  private apiEmit(eventName: string, payload?: any, originEvent?: Event): void {
    // done todo 这里originEvent先留着, 也许用得上, 果然用上了....
    // 参数拦截
    const params = payloadInterception(payload);
    // 触发外部事件
    this.$emit(eventName, params);
    // spec 右键菜单特殊处理
    if (eventName === 'node-contextmenu') {
      // @ts-ignore 这个插件目前没写声明文件
      this.$refs.contextMenu.open(originEvent, params);
    }
  }

  private mounted() {
    const vm = this;
    const dom = this.$refs.workSpace as HTMLElement;
    const jsplumbInstance = this.drawPart.jsplumbInstance;
    const pluginsVNodes = PLUGINS
      .map((plugin) => plugin.call(this, dom, vm, jsplumbInstance))
      .filter((vnode) => vnode);
    this.plugins.push(...pluginsVNodes as VNode[]);
  }
  private beforeDestroy() {
    this.$emit('hook:beforeDestory');
  }
}
</script>

<style lang="less" scoped>
@import url('./style/chartStyle.less');
.work-space {
  overflow: hidden;
  position: relative;
  .node-list-container {
    position: relative;
  }
  // 右键菜单
  .context-menu {
    min-width: 100px;
    font-size: 14px;
    .context-item {
      .context-item-link {
        padding: 4px 7px;
        cursor: pointer;
      }
    }
  }
}
</style>