import React from 'react';
import fetch from 'node-fetch';
export default function GameBoard() {
  // The API only expects a board size of 4, but best to make it possible to change the board size in the future.
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
  const [gameResult, setGameResult] = React.useState(false);
  const [turn, setTurn] = React.useState(true);
  const [isInvalid, setInvalid] = React.useState(false);

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
      // add the latest move to the array of moves
      moves.push(columnId);

      // place the latest move on the game board
      gameBoard[columnId][columnCounts[columnId]++] = turn ? 'red' : 'blue';

      // increment running totals of squares occupied in winning combinations
      const player = turn ? red : blue;
      const rowId = columnCounts[columnId] - 1;
      player[rowId]++;
      player[columnId + boardSize]++;

      // first diagonal (ascending from lower left to upper right)
      if(rowId === columnId) player[boardSize*2]++;

      // second diagonal (descending from upper left to lower right)
      if(rowId === boardSize - 1 - columnId) player[(boardSize*2)+1]++;

      // Update component state
      turn ? setRed(player) : setBlue(player);
      setTurn(!turn);
      setColumnCounts(columnCounts);
      setGameBoard(gameBoard);
      setMoves(moves);
      setInvalid(false);
    } else {
      // The column is already full. Show the message
      setInvalid(true)
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
    setGameResult(false);
    setInvalid(false);
    setMoves([]);
  }

  const checkGameState = () => {
    for(var i=0; i<(boardSize * 2)+2; i++) {
        if(red[i] === boardSize) return "Red";
        if(blue[i] === boardSize) return "Blue";
    }
    // TODO: We can improve the logic on a draw by ending the game earlier than the last move
    return moves.length ===  boardSize * boardSize ? "Draw" : false;

  }


  React.useEffect(() => {
    // impossible to have a winner before turn 8
    if (moves.length >= boardSize * 2) {
      const gameState = checkGameState();
      if (gameState) {
         setGameResult(gameState);
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
              <p>Time for a new game of 98point6 Drop Token! Would you like to go first or second?</p>
              <button style={{...styles.button, marginRight: '20px'}} onClick={handleTurnChoice(true)}>First</button>
              <button style={styles.button} onClick={handleTurnChoice(false)}>Second</button>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <p>Good luck! Play until you get 4 in a row in any direction, or restart anytime.</p>
              <p><button style={styles.button} onClick={handleRestart}>Restart</button></p>
            </React.Fragment>)  
        }
      </div>
      {
        !isNewGame && (
          <React.Fragment>
             {
              isInvalid && (
                <p>Oops! That isn't a legal move. The column must be empty.</p>
              )
            }
            { !gameResult ? (
              <div>
                  {columnButtons.map( (button, i) => (<button key={i} style={{...styles.square, cursor: 'pointer'}} onClick={handleColumnSelect(i)}></button>) )}
              </div>
            ) : (
              <p>
                {
                  gameResult === 'Draw' ? 'The game is a Draw!' : `${gameResult} wins!`
                }
              </p>
            )
            }
           
            <div style={styles.board}>
              {
                gameBoard.map((row, i) => (
                  <div key={i} style={{display: 'flex', flexDirection: 'column-reverse'}}>
                    {
                      row.map((cell, ii )=> (
                        <div  key={`${i}${ii}`} style={{...styles.square, backgroundColor: cell } }></div>
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
const styles = {
  square: {
    height: '100px',
    width: '100px',
    border: '2px solid gray',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  board: {
    display: 'flex',
    justifyContent: 'center'
  },
  button: {
    margin: 0,
    border: 'none',
    overflow: 'visible',
    padding: '0 30px',
    verticalAlign: 'middle',
    fontSize: '14px',
    lineHeight: '38px',
    textAlign: 'center',
    textDecoration: 'none',
    textTransform: 'uppercase',
    backgroundColor: '#1e87f0',
    color: '#fff',
    border: '1px solid transparent',
  }
}