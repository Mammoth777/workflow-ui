<template>
  <div class="draw-part" ref="container">
    <div
      class="node-item"
      v-for="node in nodes"
      :key="node.id"
      :class="['node-item', node.selected ? 'selected' : 'not-selected']"
      :style="{
        left: node.x + 'px',
        top: node.y + 'px'
      }"
      :id="node.id"
    >
      <component v-bind:is="node.nodeType" v-bind="node.task"></component>
    </div>
  </div>
</template>

<script lang="ts">

/**
 * 0. 注册自定义节点
 * 1. 初始化jsplumb
 * 2. 初始化节点
 * 3. 初始化连线
 */

import { Component, Prop, Vue, Inject } from 'vue-property-decorator';
import { FunctionalComponentOptions } from 'vue';
import { RecordPropsDefinition } from 'vue/types/options';
import { jsPlumb, jsPlumbInstance } from 'jsplumb';
import NodeItem, { createNode } from './NodeItem';
import EdgeItem, { createEdge } from './EdgeItem';
import defaultConfig from './jsplumbDefaultConfig';
import _ from 'lodash';
import { IDrawPart, INodeItem, IEdgeItem } from './index';

const NODE_TYPES: { [name: string]: FunctionalComponentOptions } = {};

@Component({})
export default class DrawPart extends Vue implements IDrawPart {
  /**
   * 0. 注册节点类型
   * 注意: 渲染后的节点必须固定宽高
   */
  public static registNodeType<Props>(
    name: string,
    vmCfg: FunctionalComponentOptions<Props, RecordPropsDefinition<Props>>
  ): void {
    if (NODE_TYPES[name]) {
      throw new Error(`此组件(${name})已存在, 请勿重复注册.`);
    } else {
      vmCfg.name = name;
      NODE_TYPES[name] = vmCfg;
      this.component(name, vmCfg);
      console.log(NODE_TYPES, '当前已注册组件');
    }
  }

  public nodes: INodeItem[] = [];

  public jsplumbInstance: jsPlumbInstance = jsPlumb.getInstance();

  @Inject('apiEmit') private apiEmit!: (evtName: string, payload?: any) => void;

  /**
   * 1. 初始化jsplumb
   */
  public mounted() {
    const chart = this.jsplumbInstance;
    // 1. 导入默认配置
    chart.importDefaults(defaultConfig);
    // 2. 设置container
    const container = this.$refs.container as HTMLElement;
    chart.setContainer(container);
  }

  /**
   * 2. 初始化节点
   */
  public initNodes(nodes: INodeItem[]): Promise<void> {
    return new Promise((resolve) => {
      this.jsplumbInstance.ready(() => {
        this.nodes = nodes.map((info) => createNode(this, info));
        // spec 注意⚠️: 此处把节点初始化完毕推迟一个宏任务, 否则会导致连线失败
        // 问题原因不明, 猜测是endpoint渲染顺序问题
        setTimeout(() => {
          resolve();
        }, 0);
      });
    });
  }

  /**
   * 3. 初始化连线
   */
  public initEdges(edges: IEdgeItem[]): Promise<void> {
    return new Promise((resolve) => {
      this.jsplumbInstance.ready(() => {
        edges.forEach((edge) => createEdge(this, edge));
      });
    });
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