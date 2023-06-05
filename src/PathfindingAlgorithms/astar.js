export function astar(
  grid,
  startNode,
  finishNode,
  diagonal,
  updateNeighborFValue,
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
  if (diagonal === true) getDiagonalNeighbors(allNodes, grid);
  const open_list = [startNode];
  startNode.g = 0;
  startNode.f = startNode.h;

  while (open_list.length !== 0) {
    const current = nodeWithLeast_f(open_list);
    if (current === null) {
      console.log('Error: A* = Unable to retrieve node with least f value');
      return visitedNodesInOrder;
    }
    visitedNodesInOrder.push(current);
    if (current.row === finishNode.row && current.col === finishNode.col) {
      return visitedNodesInOrder;
    }
    const index = open_list.indexOf(current);
    if (index > -1) {
      open_list.splice(index, 1);
    }

    for (const neighbor of current.side_neighbor) {
      let edge_wt = 1;
      if (neighbor.isWeight) edge_wt *= 10;
      const g_temp = current.g + edge_wt;
      if (g_temp < neighbor.g) {
        neighbor.previousNode = current;
        neighbor.g = g_temp;
        neighbor.f = neighbor.g + neighbor.h;
        // updateNeighborFValue(neighbor);
        if (!isNeighborInOpenSet(neighbor, open_list)) {
          open_list.push(neighbor);
        }
      }
    }

    if (diagonal === true) {
      for (const neighbor of current.diagonal_neighbor) {
        let edge_wt = 1.2;
        if (neighbor.isWeight) edge_wt *= 10;
        const g_temp = current.g + edge_wt;
        if (g_temp < neighbor.g) {
          neighbor.previousNode = current;
          neighbor.g = g_temp;
          neighbor.f = neighbor.g + neighbor.h;
          // updateNeighborFValue(neighbor);
          if (!isNeighborInOpenSet(neighbor, open_list)) {
            open_list.push(neighbor);
          }
        }
      }
    }
  }

  return visitedNodesInOrder;
}

function isNeighborInOpenSet(node, open_list) {
  for (const eachNode of open_list) {
    if (node.row === eachNode.row && node.col === eachNode.col) return true;
  }
  return false;
}

function nodeWithLeast_f(open_list) {
  let closestNode = null;
  let minDistance = Infinity;
  for (const node of open_list) {
    if (node.isWall) continue;
    if (node.f < minDistance) {
      closestNode = node;
      minDistance = node.f;
    }
  }
  return closestNode;
}

function heuristic(node, finishNode) {
  return (
    Math.abs(node.row - finishNode.row) + Math.abs(node.col - finishNode.col)
  );
}

function getAllNodes(grid) {
  const nodes = [];
  for (const row of grid) {
    for (const node of row) {
      nodes.push(node);
    }
  }
  return nodes;
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
function updateNeighborFValue(neighbor) {
  // Create a new <h2> element for the neighbor node's F value
  const fValueElement = document.createElement('h2');
  fValueElement.innerText = `F: ${neighbor.f}`;

  // Append the <h2> element to the neighbor node's HTML element
  const neighborElement = document.getElementById(
    `node-${neighbor.row}-${neighbor.col}`,
  );
  neighborElement.appendChild(fValueElement);
}
