function getDiagonalNeighbors(allNodes, grid) {
  for (const node of allNodes) {
    const {row, col} = node;
    if (row > 0 && col > 0) node.diagonal_neighbor.push(grid[row - 1][col - 1]);
    if (row > 0 && col < grid[0].length - 1)
      node.diagonal_neighbor.push(grid[row - 1][col + 1]);
    if (row < grid.length - 1 && col > 0)
      node.diagonal_neighbor.push(grid[row + 1][col - 1]);
    if (row < grid.length - 1 && col < grid[0].length - 1)
      node.diagonal_neighbor.push(grid[row + 1][col + 1]);
  }
}

function getSideNeighbors(allNodes, grid) {
  for (const node of allNodes) {
    const {row, col} = node;
    if (row > 0) node.side_neighbor.push(grid[row - 1][col]);
    if (row < grid.length - 1) node.side_neighbor.push(grid[row + 1][col]);
    if (col > 0) node.side_neighbor.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) node.side_neighbor.push(grid[row][col + 1]);
  }
}
function getAllNodes(grid) {
  const nodes = [];
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const node = grid[row][col];
      node.side_neighbor = [];
      node.diagonal_neighbor = [];
      nodes.push(node);
    }
  }
  return nodes;
}

function heuristic(node, finishNode) {
  return (
    Math.abs(node.row - finishNode.row) + Math.abs(node.col - finishNode.col)
  );
}

export function rbfs(
  grid,
  startNode,
  finishNode,
  limit = Infinity,
  diagonal = false,
) {
  const visitedNodesInOrder = [];
  const allNodes = getAllNodes(grid);

  for (const node of allNodes) {
    node.f = Infinity;
    node.g = Infinity;
    node.h = heuristic(node, finishNode);
    node.side_neighbor = [];
    node.diagonal_neighbor = [];
  }

  getSideNeighbors(allNodes, grid);
  if (diagonal) getDiagonalNeighbors(allNodes, grid);

  startNode.g = 0;
  startNode.f = startNode.h;

  const result = recursiveSearch(startNode, finishNode, limit);
  if (result.path) {
    return visitedNodesInOrder;
  } else {
    return [];
  }

  function recursiveSearch(node, goal, limit) {
    visitedNodesInOrder.push(node);

    if (node === goal) {
      return {path: [node], cost: node.g};
    }

    let successors = getSuccessors(node);

    if (!successors.length) {
      return {path: null, cost: Infinity};
    }

    for (let s of successors) {
      s.g = node.g + cost(node, s);
      s.f = Math.max(s.g + heuristic(s, goal), node.f);
    }

    while (true) {
      successors.sort((a, b) => a.f - b.f);
      let best = successors[0];
      if (best.f > limit) {
        return {path: null, cost: best.f};
      }

      let alternative = successors[1]?.f || Infinity;
      let result = recursiveSearch(best, goal, Math.min(limit, alternative));

      if (result.path) {
        return result;
      }

      best.f = result.cost;
    }
  }

  function getSuccessors(node) {
    let successors = [];
    let neighbors = diagonal
      ? [...node.side_neighbor, ...node.diagonal_neighbor]
      : [...node.side_neighbor];

    for (let neighbor of neighbors) {
      if (!neighbor.isWall && !visitedNodesInOrder.includes(neighbor)) {
        successors.push(neighbor);
      }
    }

    return successors;
  }

  function cost(nodeA, nodeB) {
    return 1;
  }
}
