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
import { Component, Prop, Vue, Provide } from 'vue-property-decorator';
import { FunctionalComponentOptions } from 'vue';
import { RecordPropsDefinition } from 'vue/types/options';
import DrawPart from './DrawPart.vue';
import NodeItem, { createNode } from './NodeItem';
import EdgeItem from './EdgeItem';
import _ from 'lodash';
import { INodeItem, IEdgeItem } from '.';
import { Connection } from 'jsplumb';

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
    const nodes = _.cloneDeep(data.nodes);
    const edges = _.cloneDeep(data.edges);
    // 必须先初始化节点, 否则连线无效
    await this.drawPart.initNodes(nodes);
    this.drawPart.initEdges(edges);
    return Promise.resolve();
  }

  /**
   * 获取绘图板组件对象实例
   */
  get drawPart(): Vue & DrawPart {
    return this.$refs.chart as (Vue & DrawPart);
  }

  /**
   * 创建节点
   */
  public async addNode(nodeInfo: INodeItem) {
    const node = createNode(this.drawPart, nodeInfo);
    this.drawPart.nodes.push(node); // 不能自动识别真的好难啊
  }

  // todo addEdge
  /**
   * 连接两个节点, 自动选择EndPoint
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