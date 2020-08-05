<template>
  <div id="app">
    <div class="op-container">
      <div class="type-list">
        拖动到绘图区👉
        <ul>
          <li
            v-for="(item, index) in ['DemoNode', 'FlowNode', 'Test'].map(v => ({nodeType: v, task: {taskType: 'Devops'}}))"
            :key="index"
            class="node-type-item"
            v-draggable-nodetype="item"
          >
            {{item.nodeType}}
          </li>
        </ul>
      </div>
      <ChartView
        width="800px"
        height="600px"
        ref="chart"
        @node-created="nodeCreated"
        @node-dblclick="nodeSelected"
        @node-deleted="nodeDeletedHandler"
        @edge-dblclick="edgeSelected"
        @edge-connected="edgeConnected"
        :contextMenuList="[
          { label: '删除', onClick: node => contextMenuClick(node, '删除') },
          { label: '编辑', onClick: node => contextMenuClick(node, '编辑') }
        ]"
      />
    </div>
    <div class="edit-item">
      <h2>修改{{currentEditingItem.itemType}}</h2>
      <div>
        <div>id: {{currentEditingItem.id}}</div>
        <div>node type: {{currentEditingItem.nodeType}}</div>
        <div>
          <hr />
          <h3>task</h3>
          <br />
          <p>
            title:
            <input type="text" v-model="currentEditingItem.task.title" />
          </p>
          <p>
            condition:
            <input type="text" v-model="currentEditingItem.task.condition" />
          </p>
          <p>
            status:
            <select v-model="currentEditingItem.task.status">
              <option value="未开始">未开始</option>
              <option value="执行中">执行中</option>
              <option value="执行失败">执行失败</option>
              <option value="执行成功">执行成功</option>
            </select>
          </p>
        </div>
      </div>
      <button
        @click="updateItem(currentEditingItem.itemType, currentEditingItem.id, currentEditingItem.task)"
      >update item</button>
      <button @click="deleteItem(currentEditingItem.itemType, currentEditingItem.id)">删除</button>
      <button @click="printPrevNodes(currentEditingItem.id)">打印前置节点</button>
    </div>
    <div style="display: flex;">
      <button @click="logData">get data</button>
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

ChartView.registNodeTypeByRender("DemoNode", {
  name: "DemoNode",
  functional: true,
  props: {
    title: String
  },
  render(h, ctx) {
    const { title } = ctx.props;
    return h(
      "div",
      {
        style: {
          width: "200px",
          height: "80px",
          border: "1px solid #000",
          background: "#fff"
        }
      },
      [
        h("div", "组件类型: DemoNode"),
        h("div", "[prop]title: " + title),
        h("div", [
          h("span", "外部组件引用: "),
          h(Demo, {
            props: {
              compTitle: title
            }
          })
        ])
      ]
    );
  }
});

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
      currentEditingItem: {
        itemType: "", // node, edge
        task: {}
      }
    };
  },
  methods: {
    nodeDeletedHandler(node) {
      console.log("节点被删除了", node);
    },
    nodeCreated(node) {
      console.log(node, "created");
    },
    nodeSelected(node) {
      console.log(node, "node dblclicked");
      this.currentEditingItem = Object.assign({ itemType: "node" }, node);
      // more ...
    },
    edgeSelected(edge) {
      console.log(edge, "edge clicked");
      this.currentEditingItem = Object.assign({ itemType: "edge" }, edge);
      // more ...
    },
    updateItem(itemType, id, task) {
      // currentEditingItem.id, currentEditingItem.task
      this.$refs.chart.updateItem(itemType, id, task);
    },
    deleteItem(itemType, id) {
      this.$refs.chart.deleteItem(itemType, id);
    },
    contextMenuClick(nodeInfo, menuLabel) {
      console.log(`右键菜单触发: ${menuLabel} --> ${nodeInfo.id}`, nodeInfo);
      if (menuLabel === "删除") {
        this.$refs.chart.deleteItem("node", nodeInfo.id);
      }
    },
    printPrevNodes(currNodeId) {
      const nodes = this.$refs.chart.getPreviousNodes(currNodeId);
      console.log(nodes);
    },
    edgeConnected(info) {
      console.log(info, "edge connected");
      // eslint-disable-next-line no-unused-vars
      const { sourceId, id } = info;
      // eslint-disable-next-line no-unused-vars
      const chart = this.$refs.chart;
      // const node = chart.getNodeById(sourceId)
      // if (node.nodeType === 'SwitchNode') {
      // setTimeout(() => {
      // chart.updateItem('edge', id, { condition: 'yes' })
      // }, 0)
      // }
    },
    logData() {
      const data = this.$refs.chart.getData();
      console.log(data, 'data');
    }
  },
  async mounted() {
    this.$refs.chart
      .initChart({
        nodes: [
          {
            id: "1",
            x: 10,
            y: 50,
            nodeType: "FlowNode",
            task: {
              title: "代码管理"
            }
          },
          {
            id: "2",
            x: 300,
            y: 52,
            nodeType: "FlowNode",
            task: {
              title: "构建任务",
              status: "执行中"
            }
          },
          {
            id: "3",
            x: 598,
            y: 49,
            nodeType: "FlowNode",
            task: {
              title: "部署管理",
              status: "执行成功"
            }
          },
          {
            id: "4",
            x: 626,
            y: 252,
            nodeType: "FlowNode",
            task: {
              title: "部署管理2",
              status: "执行失败"
            }
          },
          {
            id: "c79c6f8f-8fce-4f99-92a9-94ff99c84d2a",
            x: 322,
            y: 282,
            nodeType: "FlowNode",
            task: {}
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
            id: "_jsplumb_c_1593419365498",
            sourceId: "2",
            targetId: "3",
            task: {
              condition: "yes"
            }
          },
          {
            id: "_jsplumb_c_1593419365502",
            sourceId: "2",
            targetId: "4",
            task: {
              condition: "no"
            }
          },
          {
            id: "_jsplumb_c_1593419365506",
            sourceId: "1",
            targetId: "c79c6f8f-8fce-4f99-92a9-94ff99c84d2a",
            task: {}
          },
          {
            id: "_jsplumb_c_1593419365508",
            sourceId: "c79c6f8f-8fce-4f99-92a9-94ff99c84d2a",
            targetId: "4",
            task: {}
          }
        ]
      })
      .then(() => {
        console.log("chart init done");
        this.$refs.chart.createNode({
          nodeType: "FlowNode",
          x: 10,
          y: 300,
          task: {}
        });
        setTimeout(() => {
          // alert('change')
          // return
          // eslint-disable-next-line no-unreachable
          // this.$refs.chart.setData({
          //   nodes: [
          //     {
          //       id: '1',
          //       x: 64,
          //       y: 86,
          //       nodeType: 'FlowNode',
          //       task: {
          //         title: '代码管理'
          //       }
          //     },
          //     {
          //       id: '2',
          //       x: 332,
          //       y: 68,
          //       nodeType: 'FlowNode',
          //       task: {
          //         title: '构建任务',
          //         status: '执行中'
          //       }
          //     },
          //     {
          //       id: '3',
          //       x: 598,
          //       y: 49,
          //       nodeType: 'FlowNode',
          //       task: {
          //         title: '部署管理',
          //         status: '执行成功'
          //       }
          //     }
          //   ],
          //   edges: [
          //     {
          //       id: '_jsplumb_c_1594877574079',
          //       sourceId: '1',
          //       targetId: '2',
          //       task: {}
          //     },
          //     {
          //       id: '_jsplumb_c_1594877574084',
          //       sourceId: '2',
          //       targetId: '3',
          //       task: {
          //         condition: 'yes'
          //       }
          //     }
          //   ]
          // })
        }, 3000);
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
  padding-right: 5px;
  border-right: 1px dashed #4c4c4b;
}
.op-container {
  display: flex;
  li {
    &:hover {
      background-color: #ccc;
    }
  }
}
.edit-item {
  position: fixed;
  right: 0;
  top: 0;
  width: 22%;
  height: 100vh;
  background-color: #fff;
  box-shadow: 0 0 10px 10px #ccc;
}
</style>
