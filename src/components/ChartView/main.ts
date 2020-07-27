import ChartView from './ChartView.vue';
import DraggableNodeType from './DraggableNodeType';
import DraggableBG from "./plugins/draggableBackground";
import ZoomControl from "./plugins/zoomControl";

// @ts-ignore
ChartView.registPlugins([DraggableBG, ZoomControl]);

export const draggableNodetype = DraggableNodeType;
export default ChartView;
