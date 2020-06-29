import React from 'react';
import fetch from 'node-fetch';
export default function GameBoard() {
  const boardSize = 4;
  const opponentURL = 'https://w0ayb2ph1k.execute-api.us-west-2.amazonaws.com/production?moves=';
  const blankBoard = new Array(boardSize).fill().map(() => new Array(boardSize).fill(""));
  const initialColumnCounts = new Array(boardSize).fill(0)
  const columnButtons = new Array(boardSize).fill();
      // Each player has a fixed number of winning combinations based on the grid size
    // 4 rows (0-3), 4 cols(4-7), 2 diagonals (8-9)
  const winningCountsRed = new Array((boardSize * 2) + 2).fill(0);
  const winningCountsBlue = new Array((boardSize * 2) + 2).fill(0);

  const [red, setRed] = React.useState(winningCountsRed);
  const [blue, setBlue] = React.useState(winningCountsBlue);
  const [columnCounts, setColumnCounts] = React.useState(initialColumnCounts);
  const [moves, setMoves] = React.useState([]);
  const [gameBoard, setGameBoard] = React.useState(blankBoard);
  const [isNewGame, setNewGame] = React.useState(true);
  const [isGameOver, setGameOver] = React.useState(false);
  const [turn, setTurn] = React.useState(true);

  async function getNextMove() {
    try {
      const getURL = `${opponentURL}${JSON.stringify(moves)}`;
      const response = await fetch(getURL);
      const nextSet = await response.json();
      const [nextMove] = nextSet.slice(-1)
      placeMove(nextMove);
    } catch(e) {
      console.log(e)
    }
  }
  const placeMove = (columnId) => {
    if (columnCounts[columnId] < boardSize) {
      moves.push(columnId);
      gameBoard[columnId][columnCounts[columnId]++] = turn ? 'red' : 'blue';
      // add move to winning combinations count
      const player = turn ? red : blue;
      const rowId = columnCounts[columnId] - 1;
      player[rowId]++;
      player[columnId + boardSize]++;
      // first diagonal (ascending from lower right to upper left)
      if(rowId === columnId) player[boardSize*2]++;
      // second diagonal (descending from upper left to lower right)
      if(rowId === boardSize - 1 - columnId) player[(boardSize*2)+1]++;

      // Update component state
      turn ? setRed(player) : setBlue(player);
      setTurn(!turn);
      setColumnCounts(columnCounts);
      setGameBoard(gameBoard);
      setMoves(moves);
    } else {
      console.log("illegal move");
    }
  }

  const handleColumnSelect = (columnId) => () => {
    placeMove(columnId);   
  }
  
  const handleTurnChoice = (isFirst) => () => {
    setTurn(isFirst);
    setNewGame(false);
  }

  const handleRestart = () => {
    setNewGame(true);
    setGameBoard(blankBoard);
    setColumnCounts(initialColumnCounts);
    setRed(winningCountsRed);
    setBlue(winningCountsBlue);
    setGameOver(false);
  }

  const checkGameState = () => {
    for(var i=0; i<boardSize+2; i++) {
        if(red[i] === boardSize) return "Red";
        if(blue[i] === boardSize) return "Blue";
    }
    // We can improve the logic on a draw by ending the game when only a draw is mathmatically possible
    return moves.length ===  boardSize * boardSize ? "Draw" : false;

  }


  React.useEffect(() => {
    // impossible to have a winner before turn 8
    if (moves.length >= boardSize * 2) {
      const gameState = checkGameState();
      if (gameState) {
         setGameOver(gameState);
         return;
      }
    }
    if(!turn && !isNewGame) {
      getNextMove();
    }
  }, [turn, moves]);

  return (
    <div>
      <div>
        {
          isNewGame ? (
            <React.Fragment>
              <p>Time for a new game! Would you like to go first or second?</p>
              <button onClick={handleTurnChoice(true)}>First</button>
              <button onClick={handleTurnChoice(false)}>Second</button>
            </React.Fragment>
          ) : (<p>Good luck! Play until you get 4 in a row in any direction, or <button onClick={handleRestart}>Restart</button> anytime.</p>)
        }
      </div>
      {
        !isNewGame && (
          <React.Fragment>
            { !isGameOver ? (
              <div>
                  {columnButtons.map( (button, i) => (<button key={i} onClick={handleColumnSelect(i)}>Choose me</button>) )}
              </div>
            ) : (
              <div>
                The game has ended {isGameOver}
              </div>
            )
            }
            <div style={{display: 'flex'}}>
              {
                gameBoard.map((row, i) => (
                  <div key={i} style={{display: 'flex', flexDirection: 'column-reverse'}}>
                    {
                      row.map((cell, ii )=> (
                        <div  key={`${i}${ii}`} style={{padding: '15px', backgroundColor: 'red'}}>{cell}square</div>
                      ))
                    }
                  </div>
                ))
              }
            </div>
          </React.Fragment>
        )
      }
    </div>
  )
}