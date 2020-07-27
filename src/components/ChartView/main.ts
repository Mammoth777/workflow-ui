import ChartView from './ChartView.vue';
import DraggableNodeType from './DraggableNodeType';
import DraggableBG from "./plugins/draggableBackground";
// @ts-ignore
ChartView.registPlugins([DraggableBG]);
console.log(DraggableBG, 'draggable bg');

export const draggableNodetype = DraggableNodeType;
export default ChartView;
