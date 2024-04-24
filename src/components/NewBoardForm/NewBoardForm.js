import React from "react";
import "./NewBoardForm.css";
import Modal from "../Modal/Modal";

const NewBoardForm = ({
  isOpen,
  newBoardTitle,
  newBoardDescription,
  setIsNewBoardTitle,
  setIsNewBoardDescription,
  onClose,
  addNewBoard,
}) => {
  return (
    <Modal isOpen={isOpen}>
      <div className="new_board">
        <h1 className="new_board__title">Новая доска</h1>
        <div className="new_board__item">
          <label className="new_board__label">Имя доски</label>
          <input
            className="new_board__input"
            type="text"
            placeholder="Введите имя доски"
            value={newBoardTitle}
            onChange={(e) => setIsNewBoardTitle(e.target.value)}
          />
        </div>
        <div className="new_board__item">
          <label className="new_board__label">Описание доски</label>
          <input
            className="new_board__input"
            type="text"
            placeholder="Введите описание доски"
            value={newBoardDescription}
            onChange={(e) => setIsNewBoardDescription(e.target.value)}
          />
        </div>
        <div className="new_board__item">
          <div className="new_board__buttons">
            <div
              className="new_board__button add"
              onClick={
                newBoardTitle && newBoardDescription ? addNewBoard : null
              }
            >
              Сохранить
            </div>
            <div className="new_board__button" onClick={onClose}>
              Отмена
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NewBoardForm;
