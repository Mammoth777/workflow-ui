<template>
  <div class="draggable-bg"
    :style="{ backgroundPosition }"
  ></div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class DraggableBg extends Vue {

  @Prop()
  private chartViewVm!: Vue;

  @Prop()
  private nodeListWrapper!: HTMLElement;

  private dragView = {
    isDragging: false,
    startX: 0,
    startY: 0
  };

  private nodeListStyle = {
    left: '0px',
    top: '0px'
  };

  private drawLayerDom!: HTMLElement;

  private backgroundPosition = '';

  // 1. 开始拖动
  public mousedownHandler(event: MouseEvent) {
    this.dragView = {
      isDragging: true,
      startX: event.x,
      startY: event.y
    };
  }

  // 2. 拖动中
  public mousemoveHandler(event: MouseEvent) {
    if (this.dragView.isDragging) {
      const deltaX = event.x - this.dragView.startX;
      const deltaY = event.y - this.dragView.startY;
      this.dragView.startX = event.x;
      this.dragView.startY = event.y;
      this.moveHandler(deltaX, deltaY);
    }
  }

  // 3. 拖动结束
  public mouseupHandler(event: MouseEvent) {
    this.dragView.isDragging = false;
  }

  // 视图移动处理器
  public moveHandler(x: number, y: number) {
    const { left, top } = this.nodeListStyle;
    const leftStr = this.nodeListStyle.left = parseFloat(left) + x + 'px';
    const topStr = this.nodeListStyle.top = parseFloat(top) + y + 'px';
    // 背景拖动
    this.backgroundPosition = `left ${leftStr} top ${topStr}`;
    // 画布拖动
    this.drawLayerDom.style.left = leftStr;
    this.drawLayerDom.style.top = topStr;
  }

  private mounted() {
    // 2. 视图拖动绑定
    const drawLayerDom = this.drawLayerDom = this.chartViewVm.$refs.drawLayer as HTMLElement;
    drawLayerDom.style.position = 'relative';

    this.nodeListWrapper.addEventListener('mousedown', this.mousedownHandler);
    this.nodeListWrapper.addEventListener('mousemove', this.mousemoveHandler);
    document.body.addEventListener('mouseup', this.mouseupHandler);
  }

  private beforeDestory() {
    console.log('hook beforeDestory');
    this.nodeListWrapper.removeEventListener('mousedown', this.mousedownHandler);
    this.nodeListWrapper.removeEventListener('mousemove', this.mousemoveHandler);
    document.body.removeEventListener('mouseup', this.mouseupHandler);
  }
}
</script>

<style lang="less" scoped>
.draggable-bg {
  width: 10000px;
  height: 10000px;
  position: absolute;
  left: -5000px;
  top: -5000px;
  background-image: linear-gradient(#eee 1px, transparent 0), linear-gradient(90deg, #eee 1px, transparent 0);
  background-size: 30px 30px;
}
</style>