<template>
  <div class="draw-part" ref="container" @click="itemBlurHandler">
    <div
      class="node-item"
      v-for="node in nodes"
      :key="node.id"
      :style="{
        left: node.x + 'px',
        top: node.y + 'px'
      }"
      :id="node.id"
      :data-nodetype="node.nodeType"
      @dblclick="nodeDblclickHandler($event, node)"
    >
      <component
        v-bind:is="node.nodeType"
        v-bind="node.task"
      ></component>
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
import { nextMacroTask } from './utils';

/**
 * 找到带有data-nodetype的节点的子节点
 * 即 用户传入的节点的最外层dom
 */
function findNodeElement(element: HTMLElement): HTMLElement | void {
  const parentElement = element.parentElement;
  if (!parentElement || element.tagName === 'BODY') {
    return;
  }
  if (parentElement.dataset.nodetype) {
    return element;
  } else {
    return findNodeElement(element.parentElement as HTMLElement);
  }
}

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

  public nodes: NodeItem[] = [];

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
  public async initNodes(nodes: INodeItem[]): Promise<void> {
    return new Promise((resolve) => {
      this.jsplumbInstance.ready(async () => {
        nodes.map((info) => createNode(this, info));
        await nextMacroTask(); // spec 注意, 这里是不得已而为之, 否则会连线失败, 猜测是endpoint渲染顺序问题
        resolve();
      });
    });
  }

  /**
   * 3. 初始化连线
   */
  public async initEdges(edges: IEdgeItem[]): Promise<void> {
    return new Promise((resolve) => {
      this.jsplumbInstance.ready(() => {
        edges.forEach((edge) => createEdge(this, edge));
      });
    });
  }

  /**
   * 初始化jsplumb事件
   */
  public initJsplumbEvents() {
    const chart = this.jsplumbInstance;
    const vm = this;
    // 避免两个节点中重复拉线 😄拖动生成连线callback
    chart.bind('beforeDrop', (params) => {
        // @ts-ignore
        const { dropEndpoint, connection } = params;
        if (!dropEndpoint) {
          throw Error('drop在作为Target的节点上了吗? check it');
        }
        // 已存在相同连线
        const connExist = dropEndpoint.connections.some((conn: IEdgeItem) =>
          (conn.targetId === connection.targetId && conn.sourceId === connection.sourceId)
        );
        if (connExist) {
          return false;
        } else {
        // 3.2 给每个新连线生成默认值
          createEdge(vm, {...connection, task: {}});
          // console.log(connection, connection.getData(), 'before drop')
          return true;
        }
      });
      // 连线事件处理
    chart.bind('connection', async (info, originalEvent) => {
        console.log('connection event');
        await nextMacroTask();
        vm.apiEmit('edge-connected', {
          // @ts-ignore
          id: info.connection.getId(),
          task: {},
          sourceId: info.sourceId,
          targetId: info.targetId
        });
      });
  }

  // 全局失焦处理
  private itemBlurHandler() {
    this.nodes.forEach((node) => {
      // 有dom属性的, 必定被选择过, 否则未选过, 无需判断
      if (node.dom) {
        node.setSelected(false, node.dom);
      }
    });
    // @ts-ignore
    this.jsplumbInstance.getConnections().forEach((conn) => {
      const edge = conn.getData();
      edge.setSelected(false);
    });
  }

  /**
   * 节点双击选择事件
   * 会给节点增加 'node-selected' class
   */
  private nodeDblclickHandler(event: MouseEvent, node: NodeItem) {
    event.stopPropagation();
    this.itemBlurHandler();
    const nodeElement = node.dom || findNodeElement(event.target as HTMLElement);
    if (nodeElement) {
      node.setSelected(true, nodeElement);
      this.apiEmit('node-dblclick', node);
    }
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