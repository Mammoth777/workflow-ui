<template>
  <div id="app">
    <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
    <!-- <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/> -->
    <ChartView ref="chart" @haha="testFn"></ChartView>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ChartView from "./components/ChartView/ChartView.vue";
import Demo from "./components/PresetNodes/Demo.vue";
// import HelloWorld from './components/HelloWorld.vue';

ChartView.registNodeTypeByRender("DemoNode", {
  name: "DemoNode",
  functional: true,
  props: {
    title: String,
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
          background: "#fff",
        },
      },
      [
        h("div", "组件类型: DemoNode"),
        h("div", "[prop]title: " + title),
        h("div", [
          h("span", "外部组件引用: "),
          h(Demo, {
            props: {
              compTitle: title,
            },
          }),
        ]),
      ]
    );
  },
});

@Component({
  components: {
    // HelloWorld,
    ChartView,
  },
})
export default class App extends Vue {
  public mounted() {
    const chart = this.$refs.chart as ChartView;
    chart.initData({
      nodes: [
        {
          id: '1',
          x: 10,
          y: 50,
          nodeType: "DemoNode",
          task: {
            title: "代码管理",
          },
        },
        {
          id: '2',
          x: 300,
          y: 52,
          nodeType: 'DemoNode',
          task: {
            title: '构建任务',
            status: '执行中'
          }
        },
        // {
        //   id: '3',
        //   x: 598,
        //   y: 49,
        //   nodeType: 'SimpleFlowNode',
        //   task: {
        //     title: '部署管理',
        //     status: '执行成功'
        //   }
        // },
        // {
        //   id: '4',
        //   x: 626,
        //   y: 252,
        //   nodeType: 'SimpleFlowNode',
        //   task: {
        //     title: '部署管理2',
        //     status: '执行失败'
        //   }
        // },
        // {
        //   id: 'c79c6f8f-8fce-4f99-92a9-94ff99c84d2a',
        //   x: 322,
        //   y: 282,
        //   nodeType: 'SimpleFlowNode',
        //   task: {}
        // }
      ],
      edges: [
        {
          sourceId: '1',
          targetId: '2',
          task: {}
        },
        // {
        //   sourceId: '2',
        //   targetId: '3',
        //   task: {
        //     condition: 'yes'
        //   }
        // },
        // {
        //   id: '_jsplumb_c_1593419365502',
        //   sourceId: '2',
        //   targetId: '4',
        //   task: {
        //     condition: 'no'
        //   }
        // },
        // {
        //   id: '_jsplumb_c_1593419365506',
        //   sourceId: '1',
        //   targetId: 'c79c6f8f-8fce-4f99-92a9-94ff99c84d2a',
        //   task: {}
        // },
        // {
        //   id: '_jsplumb_c_1593419365508',
        //   sourceId: 'c79c6f8f-8fce-4f99-92a9-94ff99c84d2a',
        //   targetId: '4',
        //   task: {}
        // }
      ],
    });
    setTimeout(() => {
      chart.addNode({
          id: '3',
          x: 60,
          y: 100,
          nodeType: "DemoNode",
          task: {
            title: "xx管理",
          },
        })
    }, 3000);
  }

  public testFn = () => {
    console.log('test');
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
