<template>
  <div id="app">
    <div class="op-container">
      <div class="type-list">
          <div
            class="con"
            v-for="(item, index) in testNode"
            :key="index"
            v-draggable-nodetype="item">
            <i class="iconfont" v-html="item.icon"></i>
            <div class="name">{{item.name}}</div>
          </div>
      </div>
      <ChartView
        width="800px"
        height="600px"
        ref="chart"
        @node-created="nodeCreated"
        @node-dblclick="nodeSelected"
        @node-deleted="nodeDeleted"
        @edge-dblclick="edgeSelected"
        @edge-connected="edgeConnected"
        :contextMenuList="[
          { label: '删除', onClick: node => contextMenuClick(node, '删除') },
          { label: '编辑', onClick: node => contextMenuClick(node, '编辑') }
        ]"
      />
    <div class="edit-item" v-if="showEditBox">
      <div class="con">类型：{{currentEditingItem.itemType}}</div>
      <div class="con">id：{{currentEditingItem.id}}</div>
      <div class="con">节点类型: {{currentEditingItem.nodeType}}</div>
      <div class="con">标题:<input type="text" v-model="currentEditingItem.task.title"></div>
      <div class="con">状态:
        <select v-model="currentEditingItem.task.status">
          <option value="未开始">未开始</option>
          <option value="执行中">执行中</option>
          <option value="执行失败">执行失败</option>
          <option value="执行成功">执行成功</option>
        </select>
      </div>
      <button class="btn" @click="updateItem(currentEditingItem.itemType, currentEditingItem.id, currentEditingItem.task)">更新节点</button>
      <button class="btn" @click="printPrevNodes(currentEditingItem.id)">获取前置节点</button>
      <button class="btn" @click="getNodeById(currentEditingItem.id)">获取当前节点</button>
      <button class="btn" @click="deleteItem('node', currentEditingItem.id)">删除节点</button>
      <button class="btn" @click="showEditBox=!showEditBox">关闭弹窗</button>
    </div>
    </div>
     <div class="btnBox">
      <button class="btn" @click="getData">获取数据</button>
      <button class="btn" @click="changeData">更改数据</button>
      <button class="btn" @click="createNode">创建工具节点</button>
    </div>
  </div>
</template>

<script>
// @ts-nocheck
import { Component, Vue } from "vue-property-decorator";
import ChartView, { draggableNodetype } from "./components/ChartView/main.ts";
import Demo from "./components/PresetNodes/Demo.vue";
import FlowNode from "./components/PresetNodes/DefaultFlowNode.vue";
// import DragBG from './components/ChartView/plugins/draggableBackground';
// import HelloWorld from './components/HelloWorld.vue';
// 注册条件节点
ChartView.registNodeTypeByRender('Condition', {
  name: 'Condition',
  functional: true,
  props: {
    title: String
  },
  render(h) {
    return h('div', [
      h('i', {
        style: {
          width: '32px',
          height: '32px',
          fontSize: '32px'
        },
        attrs: {
          class: 'iconfont icon-tiaojian' // 如果是1那种写法,不能实时获取,获取的还是undefined
        }
      }
      )
    ]);
  }
});
// 注册控制节点
ChartView.registNodeTypeByRender('Control', {
  name: 'Control',
  functional: true,
  props: {
    title: String
  },
  render(h) {
    return h('div', [
      h('i', {
        style: {
          width: '32px',
          height: '32px',
          fontSize: '32px'
        },
        attrs: {
          class: 'iconfont icon-changyongtubiao_Farmshezhi' // 如果是1那种写法,不能实时获取,获取的还是undefined
        }
      }
      )
    ]);
  }
});
// 注册流程节点
ChartView.registNodeType("FlowNode", FlowNode);

// ChartView.registPlugins([
//   DragBG
// ]);

export default {
  name: "App",
  components: {
    ChartView
  },
  directives: {
    draggableNodetype
  },
  data() {
    return {
      testNode: [
        {nodeType: 'Control', name: '控制', icon: '&#xe602;'},
        {nodeType: 'Condition', name: '条件', icon: '&#xe6d8;'},
        {nodeType: 'FlowNode', name: '流程节点', icon: '&#xe627;'},
      ],
      showEditBox: false,
      currentEditingItem: {
        itemType: "", // node, edge
        task: {}
      }
    };
  },
  methods: {
    // 删除
    nodeDeleted(node) {
      console.log('删除', node);
    },
    // 创建
    nodeCreated(node) {
      console.log('创建', node);
    },
    // 双击节点
    nodeSelected(node) {
      console.log('双击节点', node);
      this.showEditBox = true;
      this.currentEditingItem = Object.assign({ itemType: 'node' }, node);
    },
    // 双击边
    edgeSelected(edge) {
      console.log('双击边', edge);
      // this.currentEditingItem = Object.assign({ itemType: 'edge' }, edge)
    },
    // 边连线事件
    edgeConnected(info) {
      console.log('边连线', info);
      const { id } = info;
      this.$refs.chart.updateItem('edge', id, { condition: 'yes' });
    },
    // 实例下获取数据方法
    getData() {
      console.log('流程数据', this.$refs.chart.getData());
    },
    //  实例下更改数据方法
    changeData() {
      this.$refs.chart.setData({
        nodes: [
          {
            id: '1',
            x: 10,
            y: 50,
            nodeType: 'FlowNode',
            task: {
              title: '更改数据',
              status: '执行成功'
            }
          }
        ],
        edges: []
      });
    },
    // 实例下创建节点
    createNode() {
      this.$refs.chart.createNode({ nodeType: 'FlowNode', task: {
        title: '新创建',
        des: '新描述',
        status: '执行失败'
      } });

    },
    // 实例下更新节点方法
    updateItem(itemType, id, task) {
      this.$refs.chart.updateItem(itemType, id, task);
      this.showEditBox = false;
    },
    // 实例下前置方法
    printPrevNodes(currNodeId) {
      console.log('前置节点', this.$refs.chart.getPreviousNodes(currNodeId));
      this.showEditBox = false;
    },
    // 实例下通过Id获取节点方法
    getNodeById(currNodeId) {
      console.log('当前节点', this.$refs.chart.getNodeById(currNodeId));
      this.showEditBox = false;
    },
    // 实例下删除方法
    deleteItem(itemType, id) {
      this.$refs.chart.deleteItem(itemType, id);
      this.showEditBox = false;
    },
    // 右击菜单 nodeInfo节点 menuLabel菜单label(当前未更新)
    contextMenuClick(nodeInfo, menuLabel) {
      if (menuLabel === '删除') {
        this.$refs.chart.deleteItem('node', nodeInfo.id);
      } else if (menuLabel === '编辑') {
        this.showEditBox = true;
        this.currentEditingItem = Object.assign({ itemType: 'node' }, nodeInfo);
      }
    }
  },
  async mounted() {
    // 组件初始化数据
    this.$refs.chart
      .initChart({
        nodes: [
          {
            id: "1",
            x: 10,
            y: 50,
            nodeType: "FlowNode",
            task: {
              title: "初始节点",
              status: '执行成功'
            }
          },
          {
            id: "2",
            x: 250,
            y: 80,
            nodeType: "Condition",
            task: {}
          },
          {
            id: "3",
            x: 400,
            y: 52,
            nodeType: "FlowNode",
            task: {
              title: "流程A",
              status: '未开始'
            }
          },
          {
            id: "4",
            x: 400,
            y: 150,
            nodeType: "FlowNode",
            task: {
              title: "流程B",
              status: '执行中'
            }
          },
          {
            id: "5",
            x: 650,
            y: 80,
            nodeType: "Control",
            task: {}
          },
          {
            id: "6",
            x: 800,
            y: 80,
            nodeType: "FlowNode",
            task: {
              title: '结束节点',
              status: '执行失败'
            }
          }
        ],
        edges: [
          {
            id: "_jsplumb_c_1593419365488",
            sourceId: "1",
            targetId: "2",
            task: {}
          },
          {
            id: "_jsplumb_c_1593419365489",
            sourceId: "2",
            targetId: "3",
            task: {
              condition: "yes"
            }
          },
          {
            id: "_jsplumb_c_1593419365490",
            sourceId: "2",
            targetId: "4",
            task: {
              condition: "no"
            }
          },
          {
            id: "_jsplumb_c_1593419365491",
            sourceId: "3",
            targetId: "5",
            task: {}
          },
          {
            id: "_jsplumb_c_1593419365492",
            sourceId: "4",
            targetId: "5",
            task: {}
          },
          {
            id: "_jsplumb_c_1593419365493",
            sourceId: "5",
            targetId: "6",
            task: {}
          },
        ]
      });
  }
};
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
.type-list {
  width:300px;
  padding:15px;
  box-sizing: border-box;
  padding-right: 5px;
  border-right: 1px dashed #efefef;
  font-size: 14px;
  text-align: left;
  .con {
      width: 46%;
      text-align: center;
      margin: 5px 2%;
      border: 1px solid #efefef;
      border-radius: 5px;
      display: inline-block;
      box-sizing:border-box;
      cursor: move;
      .iconfont{
        font-size: #888;
        font-size: 30px;
        line-height: 60px;
      }
      .name{
        color: #666;
        font-size: 13px;
        line-height: 36px;
      }
      &:hover {
        background-color: #efefef;
      }
    }
}
.op-container {
  position: relative;
  width:1100px;
  border: 1px solid #efefef;
  border-radius: 5px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  li {
    &:hover {
      background-color: #ccc;
    }
  }
}
.edit-item {
  position: absolute;
  right: 0;
  top: 0;
  bottom:0;
  margin: auto;
  width: 22%;
  background-color: #fff;
  box-shadow: -5px 0px 18px rgba(0,0,0,0.1);
  z-index: 99;
  padding: 15px;
  box-sizing: border-box;
  text-align: left;
  .con{
    font-size: 12px;
    width: 100%;
    margin-bottom: 10px;
    text-align: left;
    input{
      width:80px;
      border: 1px solid #efefef;
      border-radius: 3px;
      height:25px;
      margin-left: 10px;
      padding-left: 8px;
      box-sizing: border-box;
    }
    select{
      margin-left: 10px;
      width:80px;
      border: 1px solid #efefef;
      border-radius: 3px;
      height:25px;
    }
  }
  .btn{
      height:25px;
      text-align: center;
      line-height: 25px;
      background: #11B4EB;
      font-size: 12px;
      color: #fff;
      border-radius: 3px;
      margin-right: 5px;
      margin-bottom: 5px;
      border: none;
  }
}
.btnBox{
  width:1100px;
  margin: 0 auto;
  text-align: left;
  margin-top: 20px;
  .btn{
    width:100px;
    height:35px;
    text-align: center;
    line-height: 35px;
    background: #11B4EB;
    color: #fff;
    border-radius: 3px;
    margin-right: 20px;
    border: none;
  }
}
</style>
