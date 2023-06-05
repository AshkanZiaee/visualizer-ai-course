import React, {Component} from 'react';
import Node from './Node/Node';
import {bfs} from '../bfs';
import {dfs} from '../PathfindingAlgorithms/dfs';
import {astar} from '../PathfindingAlgorithms/astar';
import {recursiveDivision} from '../MazeAlgorithms/recursiveDivision';

import './PathfindingVisualizer.css';

const getRandomInteger = (min, max) => {
  max = max + 1;
  return Math.floor(Math.random() * (max - min)) + min;
};
export function getNodesInShortestPathOrder(finishNode) {
  const nodesInShortestPathOrder = [];
  let currentNode = finishNode;
  while (currentNode !== null) {
    nodesInShortestPathOrder.unshift(currentNode);
    currentNode = currentNode.previousNode;
  }
  return nodesInShortestPathOrder;
}
// Parameters
var TIME_INTERVAL = 25;
var HEIGHT = 20;
var WIDTH = 30;
var START_NODE_ROW = -1;
var START_NODE_COL = -1;
var FINISH_NODE_ROW = -1;
var FINISH_NODE_COL = -1;
var stopAnimating = false;
var pause = false;

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      isPlaceStart: false,
      isPlaceEnd: false,
      isPlaceWeight: false,
      isPlaceWall: false,
      startPresent: false,
      endPresent: false,
      isMousePressed: false,
    };
  }
  componentDidMount() {
    stopAnimating = false;
    pause = false;
    const grid = getInitialGrid();
    this.setState({grid: grid});
  }
  placeStartNode() {
    this.setState({isPlaceStart: true});
  }
  placeEndNode() {
    this.setState({isPlaceEnd: true});
  }
  placeWallNode() {
    this.setState({isPlaceWall: true});
  }
  placeWeightNode() {
    this.setState({isPlaceWeight: true});
  }

  handleMouseClick(row, col) {
    console.log('A cell is clicked');
    const {
      isPlaceStart,
      isPlaceEnd,
      endPresent,
      startPresent,
      isMousePressed,
      isPlaceWeight,
      isPlaceWall,
    } = this.state;
    let newGrid = null;
    if (isMousePressed) {
      console.log('Back to normal state');
      this.setState({
        isMousePressed: false,
        isPlaceWall: false,
        isPlaceWeight: false,
      });
      return;
    } else if (isPlaceWall) {
      newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({isMousePressed: true});
    } else if (isPlaceWeight) {
      newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
      this.setState({isMousePressed: true});
    } else if (isPlaceStart) {
      const isSameNode = row == START_NODE_ROW && col == START_NODE_COL;
      if (!isSameNode && startPresent) {
        console.log('Start Node already present');
        return;
      }

      newGrid = getNewGridWithStartToggled(this.state.grid, row, col);
      START_NODE_ROW = row;
      START_NODE_COL = col;
      if (isSameNode) {
        this.setState({startPresent: false});
      } else {
        this.setState({startPresent: true});
      }
    } else if (isPlaceEnd) {
      const isSameNode = row == FINISH_NODE_ROW && col == FINISH_NODE_COL;
      if (!isSameNode && endPresent) {
        console.log('End Node already present');
        return;
      }

      newGrid = getNewGridWithEndToggled(this.state.grid, row, col);
      FINISH_NODE_ROW = row;
      FINISH_NODE_COL = col;
      if (isSameNode) {
        this.setState({endPresent: false});
      } else {
        this.setState({endPresent: true});
      }
    }

    if (newGrid === null) {
      console.log('Error in handling mouse click');
      return;
    }
    this.setState({grid: newGrid, isPlaceStart: false, isPlaceEnd: false});
  }

  handleMouseEnter(row, col) {
    const {
      isPlaceStart,
      isPlaceEnd,
      isMousePressed,
      isPlaceWeight,
      isPlaceWall,
      startPresent,
      endPresent,
    } = this.state;
    if (isPlaceEnd || isPlaceStart) {
      console.log('Placing start or end node.Cant drag');
      return;
    }
    if (!isMousePressed) {
      console.log('Mouse is not being dragged');
      return;
    }
    if (startPresent && row == START_NODE_ROW && col == START_NODE_COL) {
      console.log('start present on that cell.cant place wall');
      return;
    }
    if (endPresent && row == FINISH_NODE_ROW && col == FINISH_NODE_COL) {
      console.log('end present on that cell.cant place wall');
      return;
    }
    let newGrid = null;
    if (isPlaceWall) {
      newGrid = getNewGridWithWallToggled(this.state.grid, row, col);
      this.setState({grid: newGrid});
    } else if (isPlaceWeight) {
      newGrid = getNewGridWithWeightToggled(this.state.grid, row, col);
      this.setState({grid: newGrid});
    }
  }

  clearBoard() {
    const grid = getInitialGrid();
    for (let row = 0; row < grid.length; ++row) {
      for (let col = 0; col < grid[0].length; ++col) {
        document.getElementById(`node-${row}-${col}`).className = 'node';
      }
    }
    this.setState({
      grid: grid,
      isPlaceStart: false,
      isPlaceEnd: false,
      isPlaceWeight: false,
      isPlaceWall: false,
      startPresent: false,
      endPresent: false,
      isMousePressed: false,
    });
    this.enableExceptClearboard();
    START_NODE_ROW = -1;
    START_NODE_COL = -1;
    FINISH_NODE_ROW = -1;
    FINISH_NODE_COL = -1;
    stopAnimating = false;
    pause = false;
  }

  getPrevBoard() {
    const grid = this.refreshBoardForPathfinding(this.state.grid);
    for (const row of grid) {
      for (const node of row) {
        let flag = false;
        if (node.isStart === true) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-start';
          flag = true;
        }
        if (node.isEnd === true) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-finish';
          flag = true;
        }
        if (node.isWall === true) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-wall';
          flag = true;
        }
        if (node.isWeight == true) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-weight';
          flag = true;
        }
        // Rest other nodes which were visualized as visited & shortest path nodes
        if (flag === false) {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node';
        }
      }
    }
    this.setState({grid});
    this.enableExceptClearboard();
  }

  handleAlgorithmsDropdown(index) {
    let algorithmsContainer =
      document.getElementsByClassName('dropdown-container')[index].style;
    if (algorithmsContainer.display === 'block') {
      algorithmsContainer.display = 'block';
    } else {
      algorithmsContainer.display = 'block';
    }
  }

  handleEachAlgorithmDropdown(algo) {
    let diagonal = document.getElementById(algo + '_d').style;
    let noDiagonal = document.getElementById(algo + '_nd').style;
    if (diagonal.display === 'block') {
    } else {
      diagonal.display = 'block';
    }
    if (noDiagonal.display === 'block') {
    } else {
      noDiagonal.display = 'block';
    }
  }

  // Util functions
  disableExceptClearboard() {
    // Disable start & end node
    const startNode = document.getElementById('start_node');
    startNode.disabled = true;
    startNode.style.background = 'white';
    const endNode = document.getElementById('end_node');
    endNode.disabled = true;
    endNode.style.background = 'white';

    // Disable all algorithms buttons

    // Disable internal algorithm button

    document.getElementById('astar_d').disabled = true;
    document.getElementById('astar_nd').disabled = true;

    // Disable clear button
  }
  enableExceptClearboard() {
    // Enable start & end node
    const startNode = document.getElementById('start_node');
    startNode.disabled = false;
    const endNode = document.getElementById('end_node');
    endNode.disabled = false;
    endNode.style.background = '#111';

    // Enable all algorithms buttons
    document.getElementsByClassName('dropdown-btn')[0].style.background =
      '#111';
    const visualizeButtons = document.getElementsByClassName('visualize');
    for (const button of visualizeButtons) {
      button.disabled = false;
    }

    document.getElementById('bfs_d').disabled = false;
    document.getElementById('bfs_nd').disabled = false;

    document.getElementById('astar_d').disabled = false;
    document.getElementById('astar_nd').disabled = false;

    document.getElementById('clear').disabled = false;
  }

  render() {
    const {grid} = this.state;

    return (
      <>
        <div className="sidenav">
          <button id="start_node" onClick={() => this.placeStartNode()}>
            Start Node
          </button>
          <button id="end_node" onClick={() => this.placeEndNode()}>
            End Node
          </button>
          <button
            id="weight_node"
            onClick={() => this.placeWeightNode()}
            title="Click on any cell and then keep moving to create weights. Click again to stop"></button>

          <button onClick={() => this.handleAlgorithmsDropdown(0)}></button>

          <button className="visualize" onClick={() => this.visualizeRBFS()}>
            Visualize RBFS Algorithm
          </button>
          <button
            className="visualize"
            onClick={() => this.handleEachAlgorithmDropdown('astar')}>
            Visualize A* Search Algorithm
          </button>
          <button id="astar_d" onClick={() => this.visualizeAStar(true)}>
            Diagonal Movement Allowed
          </button>
          <button id="astar_nd" onClick={() => this.visualizeAStar(false)}>
            No Diagonal Movement Allowed
          </button>
        </div>

        <div className="grid main">
          <h2 id="neighborFValue" style={{position: 'absolute'}}></h2>
          <h2 id="f-value " style={{position: 'absolute', margin: '10px'}}></h2>
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx}>
                {row.map((node, nodeIdx) => {
                  const {row, col, isEnd, isStart, isWall, isWeight} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      isEnd={isEnd}
                      isStart={isStart}
                      isWall={isWall}
                      isWeight={isWeight}
                      onMouseClick={(row, col) =>
                        this.handleMouseClick(row, col)
                      }
                      onMouseEnter={(row, col) =>
                        this.handleMouseEnter(row, col)
                      }
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </>
    );
  }

  refreshBoardForPathfinding(currGrid) {
    const grid = currGrid.slice();
    for (const row of grid) {
      for (const node of row) {
        node.distance = Infinity;
        node.isVisited = false;
      }
    }
    return grid;
  }
  visualizeDijkstra(diagonal) {
    if (START_NODE_ROW == -1 || START_NODE_COL == -1) {
      alert("start node isn't selected");
      return;
    }
    if (FINISH_NODE_ROW == -1 || FINISH_NODE_COL == -1) {
      alert("end node isn't selected");
    }

    this.disableExceptClearboard();
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    grid = this.refreshBoardForPathfinding(grid);
    // const visitedNodesInOrder = dijkstra(grid, startNode, finishNode, diagonal);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateVisitedNodes(
      // visitedNodesInOrder,
      nodesInShortestPathOrder,
      startNode,
      finishNode,
    );
  }
  visualizeBFS(diagonal) {
    if (START_NODE_ROW == -1 || START_NODE_COL == -1) {
      alert("start node isn't selected");
      return;
    }
    if (FINISH_NODE_ROW == -1 || FINISH_NODE_COL == -1) {
      alert("end node isn't selected");
    }

    this.disableExceptClearboard();
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    grid = this.refreshBoardForPathfinding(grid);
    const visitedNodesInOrder = bfs(grid, startNode, finishNode, diagonal);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateVisitedNodes(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      startNode,
      finishNode,
    );
  }
  visualizeDFS(diagonal) {
    if (START_NODE_ROW == -1 || START_NODE_COL == -1) {
      alert("start node isn't selected");
      return;
    }
    if (FINISH_NODE_ROW == -1 || FINISH_NODE_COL == -1) {
      alert("end node isn't selected");
    }
    document.getElementsByClassName('info')[0].innerHTML =
      "Depth First Search Algorithm is <strong>unweighted</strong> algorithm and <strong>doesn't</strong> guarentees shortest path";
    this.disableExceptClearboard();
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    grid = this.refreshBoardForPathfinding(grid);
    const visitedNodesInOrder = dfs(grid, startNode, finishNode, diagonal);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateVisitedNodes(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      startNode,
      finishNode,
    );
  }
  visualizeAStar(diagonal) {
    console.log('diagonal', diagonal);
    if (START_NODE_ROW === -1 || START_NODE_COL === -1) {
      alert("start node isn't selected");
      return;
    }
    if (FINISH_NODE_ROW === -1 || FINISH_NODE_COL === -1) {
      alert("end node isn't selected");
    }

    this.disableExceptClearboard();
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    grid = this.refreshBoardForPathfinding(grid);
    const visitedNodesInOrder = astar(grid, startNode, finishNode, diagonal);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateVisitedNodes(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      startNode,
      finishNode,
    );
  }
  visualizeRBFS() {
    if (START_NODE_ROW == -1 || START_NODE_COL == -1) {
      alert("start node isn't selected");
      return;
    }
    if (FINISH_NODE_ROW == -1 || FINISH_NODE_COL == -1) {
      alert("end node isn't selected");
    }

    this.disableExceptClearboard();
    let {grid} = this.state;
    const startNode = grid[START_NODE_ROW][START_NODE_COL];
    const finishNode = grid[FINISH_NODE_ROW][FINISH_NODE_COL];
    const visitedNodesInOrder = bfs(grid, startNode, finishNode, false);
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateVisitedNodes(
      visitedNodesInOrder,
      nodesInShortestPathOrder,
      startNode,
      finishNode,
    );
  }
  animateVisitedNodes(
    visitedNodesInOrder,
    nodesInShortestPathOrder,
    startNode,
    finishNode,
  ) {
    let i = 1;
    let animatingShortestPath = this.animateShortestPath;
    let enableExceptClearboard = this.enableExceptClearboard;
    function animate() {
      if (stopAnimating) {
        enableExceptClearboard();
        return;
      }

      if (i == visitedNodesInOrder.length - 1) {
        animatingShortestPath(nodesInShortestPathOrder, enableExceptClearboard);
        return;
      }

      const node = visitedNodesInOrder[i];
      if (
        !(node.row === START_NODE_ROW && node.col === START_NODE_COL) ||
        (node.row === FINISH_NODE_ROW && node.col === FINISH_NODE_COL)
      ) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-visited';
      }
      i++;
      requestAnimationFrame(animate);
    }
    animate();
  }

  animateShortestPath(nodesInShortestPathOrder, enableExceptClearboard) {
    const firstNodeInShortestPath = nodesInShortestPathOrder[0];
    if (
      !(
        firstNodeInShortestPath.row === START_NODE_ROW &&
        firstNodeInShortestPath.col === START_NODE_COL
      )
    ) {
      alert('No Shortest Path');
      return;
    }
    const node = nodesInShortestPathOrder[0];
    document.getElementById(`node-${node.row}-${node.col}`).className =
      'node node-shortest-path node-start';

    let i = 1;
    function animate() {
      if (stopAnimating) {
        enableExceptClearboard();
        return;
      }
      const node = nodesInShortestPathOrder[i];
      if (i == nodesInShortestPathOrder.length - 1) {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path node-finish';
        return;
      } else {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-shortest-path';
      }
      i++;

      requestAnimationFrame(animate);
    }
    animate();
  }

  refreshBoardForMaze(currGrid) {
    let grid = currGrid.slice();
    for (const row of grid) {
      for (const node of row) {
        node.isVisited = false;
        node.isWall = false;
      }
    }
    return grid;
  }

  visualizeRecursiveDivision() {
    let {grid} = this.state;
    const visitedNodesInOrder = recursiveDivision(grid);
    this.animateMaze(visitedNodesInOrder);
  }

  animateMaze(visitedNodesInOrder) {
    let i = 1;
    let enableExceptClearboard = this.enableExceptClearboard;
    function animate() {
      if (stopAnimating) {
        enableExceptClearboard();
        return;
      }

      const node = visitedNodesInOrder[i];
      document.getElementById(`node-${node.row}-${node.col}`).className =
        'node node-wall';
      i++;
      requestAnimationFrame(animate);
    }
    animate();
  }
}

const getInitialGrid = () => {
  const grid = [];
  for (let row = 0; row <= HEIGHT; row++) {
    const currentRow = [];
    for (let col = 0; col <= WIDTH; col++) {
      currentRow.push(createNode(col, row));
    }
    grid.push(currentRow);
  }
  return grid;
};

const createNode = (col, row) => {
  return {
    col,
    row,
    isStart: false,
    isEnd: false,
    distance: Infinity,
    isVisited: false,
    isWall: false,
    isWeight: false,
    previousNode: null,
    side_neighbor: [], // Add this
    diagonal_neighbor: [], // And this
  };
};

const getNewGridWithWallToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWall: !node.isWall,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithStartToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isStart: !node.isStart,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithEndToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isEnd: !node.isEnd,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};

const getNewGridWithWeightToggled = (grid, row, col) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  const newNode = {
    ...node,
    isWeight: !node.isWeight,
  };
  newGrid[row][col] = newNode;
  return newGrid;
};
