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
import { FunctionalComponentOptions } from "vue";
import { RecordPropsDefinition } from "vue/types/options";
import DrawPart from "./DrawPart.vue";
import NodeItem, { createNode } from "./NodeItem";
import EdgeItem from "./EdgeItem";
import cloneDeep from "lodash/cloneDeep";
import { INodeItem, IEdgeItem } from ".";
import { Connection } from "jsplumb";
import { nextMacroTask } from "./utils";

interface IChartData {
  nodes: INodeItem[];
  edges: IEdgeItem[];
}

@Component({
  components: {
    DrawPart,
  },
})
export default class ChartView extends Vue {
  public static registNodeTypeByRender<Props>(
    name: string,
    vmCfg: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
  ): void {
    return DrawPart.registNodeType(name, vmCfg);
  }
  public async initData(data: IChartData): Promise<void> {
    const nodes = cloneDeep(data.nodes);
    const edges = cloneDeep(data.edges);
    // 必须先初始化节点, 否则连线无效
    await this.drawPart.initNodes(nodes);
    this.drawPart.initEdges(edges);
    return Promise.resolve();
  }

  /**
   * 获取绘图板组件对象实例
   */
  get drawPart(): Vue & DrawPart {
    return this.$refs.chart as Vue & DrawPart;
  }

  /**
   * 创建节点
   */
  public async addNode(nodeInfo: INodeItem) {
    const node = createNode(this.drawPart, cloneDeep(nodeInfo));
    this.drawPart.nodes.push(node); // 不能自动识别真的好难啊
    await nextMacroTask();
    this.apiEmit("node-created", {
      id: node.id,
      nodeType: node.nodeType,
      selected: node.selected,
      task: node.task,
    });
  }

  /**
   * 更新节点
   */
  public async updateNode(id: string, task: object) {
    const drawPart = this.drawPart;
    const currNode = drawPart.nodes.filter((node) => node.id === id)[0];
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
   * 删除节点
   */
  public async deleteNode(id: string) {
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