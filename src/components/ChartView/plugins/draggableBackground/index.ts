import { jsPlumbInstance } from 'jsplumb';
import { VNode } from 'vue/types/umd';
import DraggableBg from './DraggableBg.vue';

export default function(
  workSpace: HTMLElement,
  chartViewVm: Vue,
  jsplumbInstance: jsPlumbInstance
): VNode | void {
  // 当前在mounted hook中
  const h = chartViewVm.$createElement;
  // 1. 生成背景
  const bgComp = h(DraggableBg, {
    props: {
      chartViewVm,
      workSpace
    }
  });
  return bgComp;
  // const bgDom = document.createElement('div');
  // bgDom.setAttribute('style', `
  //   width: 10000px;
  //   height: 10000px;
  //   position: absolute;
  //   left: -5000px;
  //   top: -5000px;
  //   background-image: linear-gradient(#eee 1px, transparent 0), linear-gradient(90deg, #eee 1px, transparent 0);
  //   background-size: 30px 30px;
  // `);
  // workSpace.insertBefore(bgDom, workSpace.firstElementChild);

  // 2. 视图拖动绑定
  // const drawLayerDom = chartViewVm.$refs.drawLayer as HTMLElement;
  // drawLayerDom.style.position = 'relative';
  // const mousemove = mousemoveHandler.bind(null, bgDom, drawLayerDom);
  // workSpace.addEventListener('mousedown', mousedownHandler);
  // workSpace.addEventListener('mousemove', mousemove);
  // document.body.addEventListener('mouseup', mouseupHandler);
  // // 3. 视图拖动解绑
  // chartViewVm.$on('hook:beforeDestory', () => {
  //   console.log('hook beforeDestory');
  //   workSpace.removeEventListener('mousedown', mousedownHandler);
  //   workSpace.removeEventListener('mousemove', mousemove);
  //   document.body.removeEventListener('mouseup', mouseupHandler);
  // });
}
