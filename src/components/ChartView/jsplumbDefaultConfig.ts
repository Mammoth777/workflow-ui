export default {
  MaxConnections: -1, // 最大连接数
  // Connector: ['StateMachine', { curviness: 5 }], // 连线类型, Bezier, Flowchart, StateMachine, Straight
  Connector: ['Bezier', { curviness: 55 }], // 连线类型, Bezier, Flowchart, StateMachine, Straight
  PaintStyle: { 'stroke': '#345', 'strokeWidth': 2, 'stroke-dasharray': [2, 2] }, // 连线样式
  HoverPaintStyle: { stroke: '#00abfb', strokeWidth: 5 }, // hover时连线样式
  // ConnectionsDetachable: false, // 鼠标拖动是否会断开连线
};
