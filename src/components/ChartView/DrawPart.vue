<template>
  <div class="draw-part" ref="container">
    <div class="node-item"
      v-for="node in nodes"
      :key="node.id"
      :class="['node-item', node.selected ? 'selected' : 'not-selected']"
      :style="{
        left: node.x + 'px',
        top: node.y + 'px'
      }"
      :id="node.id"
    >
      <component
        v-bind:is="node.nodeType"
        v-bind="node.task"
      ></component>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { FunctionalComponentOptions } from 'vue'
import { RecordPropsDefinition } from 'vue/types/options'
import { jsPlumb, jsPlumbInstance } from 'jsplumb';
import NodeItem, { createNode } from './NodeItem';
import EdgeItem from './EdgeItem';
import defaultConfig from './jsplumbDefaultConfig';
import _ from 'lodash';
import { IDrawPart, INodeItem, IEdgeItem } from './index'

const NODE_TYPES:{[name:string]: FunctionalComponentOptions} = {}

@Component({})
export default class DrawPart extends Vue implements IDrawPart {
  /**
   * 注册节点类型
   * 注意: 渲染后的节点必须固定宽高
   */
  public static registNodeType<Props> (name:string, vmCfg:FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>):void {
    if (NODE_TYPES[name]) {
      throw new Error(`此组件(${name})已存在, 请勿重复注册.`)
    } else {
      vmCfg.name = name
      NODE_TYPES[name] = vmCfg
      this.component(name, vmCfg)
      console.log(NODE_TYPES, '已注册组件')
    }
  }

  nodes: INodeItem[] = []

  public jsplumbInstance: jsPlumbInstance = jsPlumb.getInstance();

  public initNodes (nodes: INodeItem[]):Promise<void> {
    this.nodes = nodes.map(info => createNode(this, info))
    return Promise.resolve()
  }

  public initEdges (edges: IEdgeItem[]):Promise<void> {
    // 初始化连线
    return Promise.resolve()
  }

  mounted () {
    const chart = this.jsplumbInstance
    // 1. 导入默认配置
    chart.importDefaults(defaultConfig);
    // 2. 设置container
    const container = this.$refs.container as HTMLElement
    chart.setContainer(container)
  }
}

</script>

<style lang="less" scoped>
.draw-part {
  width: 800px;
  height: 600px;
  background-color: #ccc;
  position: relative;
  .node-item {
    position: absolute;
    cursor: default;
  }
}
</style>