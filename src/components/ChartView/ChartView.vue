<template>
  <div class="chart-view">
    ChartView
    <div class="draw-layer">
      <DrawPart ref="chart"></DrawPart>
    </div>
    <div class="plugins-layer">plugins layer</div>
  </div>
</template>

<doc>
1. 所有的参数深克隆在这一层做完
</doc>

<script lang="ts">
import { Component, Prop, Vue, Provide } from "vue-property-decorator";
import { FunctionalComponentOptions, VueConstructor } from "vue";
import { RecordPropsDefinition } from "vue/types/options";
import DrawPart from "./DrawPart.vue";
import NodeItem, { createNode } from "./NodeItem";
import EdgeItem from "./EdgeItem";
import cloneDeep from "lodash/cloneDeep";
import { INodeItem, IEdgeItem, IItem } from ".";
import { Connection } from "jsplumb";
import { nextMacroTask } from "./utils";

interface IChartData {
  nodes: INodeItem[];
  edges: IEdgeItem[];
}

enum ItemType {
  node = 'node',
  edge = 'edge'
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

@Component({
  components: {
    DrawPart,
  },
})
export default class ChartView extends Vue {

  /**
   * 获取绘图板组件对象实例
   */
  get drawPart(): Vue & DrawPart {
    return this.$refs.chart as Vue & DrawPart;
  }

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
      console.warn('width或height未传入, 请确保已经在组件内部固定了节点宽高')
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
   * 初始化数据
   */
  public async initData(data: IChartData): Promise<void> {
    const nodes = cloneDeep(data.nodes);
    const edges = cloneDeep(data.edges);
    // 必须先初始化节点, 否则连线无效
    await this.drawPart.initNodes(nodes);
    await this.drawPart.initEdges(edges);
    this.drawPart.initJsplumbEvents();
    return Promise.resolve();
  }

  public async setData(chartData: IChartData) {
    const { nodes, edges } = chartData;
    return await this.initData({nodes, edges});
  }

  /**
   * 创建节点
   */
  public async addNode(nodeInfo: INodeItem) {
    const node = await createNode(this.drawPart, cloneDeep(nodeInfo));
    await nextMacroTask(); // spec 注意, 这里是不得已而为之, 否则会连线失败, 猜测是endpoint渲染顺序问题
    this.apiEmit("node-created", {
      id: node.id,
      nodeType: node.nodeType,
      selected: node.selected,
      task: node.task,
    });
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
      nodes: cloneDeep(nodes),
      edges: cloneDeep(edges)
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
    const prevNodeIds = getPreviousNodeIds(nodeId, edges);
    return prevNodeIds.map(this.getNodeById);
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
    // @ts-ignore
    const currConn = allConnections.filter((edge) => edge.getId() === id)[0];
    if (currConn) {
      // @ts-ignore
      const currEdge: EdgeItem = currConn.getData();
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

  /**
   * 触发事件, 用于给外部暴露的api事件, 所以我的方法名取的很好😁
   */
  @Provide()
  private apiEmit(eventName: string, payload?: any, originEvent?: Event): void {
    // todo 这里originEvent先留着, 也许用得上
    this.$emit(eventName, payload);
  }
}
</script>

<style lang="less" scoped>
</style>