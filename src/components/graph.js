import { GraphRendererD3 } from "./graph-renderer-d3.js";
import { cola } from "../dependencies.js";

export default {
  name: "Graph",
  props: {
    graph: Object,
    layoutOptions: Object,
    graphStructureUpdatesCount: Number,
    onSelectNode: Function,
  },
  template: `
    <div v-once id="graph-main"></div>
  `,
  mounted() {
    const { graph } = this;

    let needsUpdate = false;
    let layout;

    this.initializeLayout = () => {
      const { layoutType, minSeparation, linkDistance } = this.layoutOptions;
      layout = new cola.Layout()
        .nodes(graph.nodes)
        .links(graph.links)
        .groups(graph.groups)
        .convergenceThreshold(0.05)
        .size([1000, 1000])
        .jaccardLinkLengths(linkDistance)
        .avoidOverlaps(true)
        .on(cola.EventType.start, () => {
          needsUpdate = true;
        })
        .on(cola.EventType.end, () => {
          needsUpdate = false;
        });

      if (layoutType === "flow-x") {
        layout.flowLayout("x", minSeparation);
      }
      if (layoutType === "flow-y") {
        layout.flowLayout("y", minSeparation);
      }

      layout.kick = () => {};
      layout.start(0, 0, 30);
      layout.tick();
    };

    this.restartLayout = () => {
      graph.nodes.forEach((node) => {
        // eslint-disable-next-line no-bitwise
        node.fixed |= 2;
      });

      this.initializeLayout();

      graph.nodes.forEach((node) => {
        // eslint-disable-next-line no-bitwise
        node.fixed &= ~6;
      });
    };

    this.initializeLayout();

    const render = new GraphRendererD3({
      graph,
      onUpdate: () => {
        needsUpdate = true;
        layout.resume();
      },
      onNodeClick: (node) => {
        this.graph.selectedNodeId = node.id;
        this.onSelectNode(node);
        needsUpdate = true;
      },
      onBgClick: () => {
        this.graph.selectedNodeId = undefined;
        this.onSelectNode(undefined);
        needsUpdate = true;
      },
    });

    render.update();

    setInterval(() => {
      if (needsUpdate) {
        layout.tick();
        render.update();
      }
    }, 20);

    this.$watch("layoutOptions", this.restartLayout, { deep: true });
    this.$watch("graphStructureUpdatesCount", () => {
      render.destroyElements();
      render.setupElements();
      this.restartLayout();
      render.update();
    });
  },
};
