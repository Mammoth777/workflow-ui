<template>
  <div class="chart-view">
    ChartView
    <div class="draw-layer">
      <DrawPart ref="chart"></DrawPart>
    </div>
    <div class="plugins-layer">
      plugins layer
    </div>
  </div>
</template>

<doc>
1. 所有的参数深克隆在这一层做完
</doc>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FunctionalComponentOptions } from 'vue'
import { RecordPropsDefinition } from 'vue/types/options'
import DrawPart from './DrawPart.vue';
import NodeItem from './NodeItem';
import EdgeItem from './EdgeItem';
import _ from 'lodash';
import { INodeItem, IEdgeItem } from '.';

interface IChartData {
  nodes: INodeItem[]
  edges: IEdgeItem[]
}

@Component({
  components: {
    DrawPart
  }
})
export default class ChartView extends Vue {
  public static registNodeTypeByRender<Props> (name:string, vmCfg:FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>):void {
    return DrawPart.registNodeType(name, vmCfg)
  }
  public initData (data: IChartData): Promise<void>{
    const _nodes = _.cloneDeep(data.nodes);
    const _edges = _.cloneDeep(data.edges);
    (this.$refs.chart as DrawPart).initNodes(_nodes);
    (this.$refs.chart as DrawPart).initEdges(_edges);
    return Promise.resolve();
  }
}

</script>

<style lang="less" scoped>

</style>