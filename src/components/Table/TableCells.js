import React, { useState } from 'react';
import './TableCells.css';

const Cell = ({ row, col, handleMouseEnter, isFilled, onHover, onClick }) => {
  return (
    <div
      className={`cell ${isFilled ? 'filled' : ''}`}
      data-row={row}
      data-col={col}
      onMouseEnter={() => {
        handleMouseEnter(row, col)
      }}
      onMouseDown={() => {
        onClick(row, col)
      }}
    ></div>
  );
};

const Row = ({ row, handleMouseEnter, filledCells, onHover, onClick }) => {
  const renderCells = () => {
    const cells = [];
    for (let col = 1; col <= 10; col++) {
      const isFilled = filledCells.some(cell => cell.row === row && cell.col === col);
      cells.push(
        <Cell
          key={`${row}-${col}`}
          row={row}
          col={col}
          handleMouseEnter={handleMouseEnter}
          isFilled={isFilled}
          onHover={onHover}
          onClick={onClick}
        />
      );
    }
    return cells;
  };

  return (
    <div className="row" data-row={row}>
      {renderCells()}
    </div>
  );
};

const Grid = ({ onHover, onClick  }) => {
  const [filledCells, setFilledCells] = useState([]); // 
// console.log(filledCells);
  const handleMouseEnter = (row, col) => {
    const newFilledCells = [];
    for (let r = 1; r <= row; r++) {
      for (let c = 1; c <= col; c++) {
        newFilledCells.push({ row: r, col: c });
      }
    }
    // onHover(row, col);
    setFilledCells(newFilledCells);
  };

  const renderRows = () => {
    const rows = [];
    for (let row = 1; row <= 7; row++) {
      rows.push(
        <Row
          key={`row-${row}`}
          row={row}
          handleMouseEnter={handleMouseEnter}
          filledCells={filledCells}
          onHover={onHover}
          onClick={onClick}
        />
      );
    }
    return rows;
  };

  return (
    <div className="grid-container">
      {renderRows()}
    </div>
  );
};

const TableCells = ({ onHover, onClick  }) =>{
  return (
  <div className="TableCells">
    <Grid onHover={onHover} onClick={onClick}  />
  </div>
)};

export default TableCells;