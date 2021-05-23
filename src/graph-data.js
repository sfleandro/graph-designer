export async function loadGraph(dataUrl) {
  const response = await fetch(dataUrl);
  const data = await response.json();
  const nodeLookup = {};
  const graph = {};

  graph.nodes = data.nodes.map((x, i) => {
    const node = {
      ...x,
      id: x.id || x.label,
      index: i,
      width: 50,
      height: 50,
    };
    nodeLookup[node.id] = node;
    return node;
  });

  graph.links = data.links.map((x) => {
    const link = {
      source: nodeLookup[x.source].index,
      target: nodeLookup[x.target].index,
    };
    return link;
  });

  graph.groups = data.groups.map((x) => {
    const group = {
      leaves: x.members.map((id) => nodeLookup[id].index),
      style: x.style,
      padding: x.padding,
    };
    return group;
  });
  graph.constraints = [];
  return graph;
}
