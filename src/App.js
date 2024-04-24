import "./App.css";
import {
  Tldraw,
  createTLStore,
  defaultShapeUtils,
  throttle,
  TldrawImage,
} from "tldraw";
import "./index.css";
import "tldraw/tldraw.css";
import { useEffect, useLayoutEffect, useState } from "react";
import Modal from "./components/Modal/Modal";
import NewBoardForm from "./components/NewBoardForm/NewBoardForm";

function App() {
  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        var r = (Math.random() * 16) | 0,
          v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  const [boards, setBoards] = useState([]);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [newBoardTitle, setIsNewBoardTitle] = useState("");
  const [newBoardDescription, setIsNewBoardDescription] = useState("");

  const localStorageArray = JSON.parse(localStorage.getItem("boards"));

  if (!localStorageArray) {
    localStorage.setItem("boards", JSON.stringify([]));
  }

  useEffect(() => {
    const TLBoardsArray = localStorageArray?.map((item) => ({
      id: item.id,
      boardName: item.boardName,
      boardDescription: item.boardDescription,
      store: createTLStore({ shapeUtils: defaultShapeUtils }),
      loadingState: { status: "loading" },
    }));

    setBoards([...boards, ...TLBoardsArray]);
  }, []);

  const addNewBoard = () => {
    const newBoard = {
      id: "board-" + uuidv4(),
      store: createTLStore({ shapeUtils: defaultShapeUtils }),
      loadingState: { status: "loading" },
      boardName: newBoardTitle,
      boardDescription: newBoardDescription,
    };
    setBoards([...boards, newBoard]);

    const newBoardItem = {
      id: newBoard.id,
      boardName: newBoardTitle,
      boardDescription: newBoardDescription,
    };
    localStorageArray.push(newBoardItem);
    const updatedArray = JSON.stringify(localStorageArray);
    localStorage.setItem("boards", updatedArray);

    setIsOpenModal(false);
    setIsNewBoardTitle("");
    setIsNewBoardDescription("");
  };

  const [activeBoard, setActiveBoard] = useState(null);

  const [store] = useState(() =>
    createTLStore({ shapeUtils: defaultShapeUtils })
  );
  const [loadingState, setLoadingState] = useState({
    status: "loading",
  });
  useLayoutEffect(() => {
    setLoadingState({ status: "loading" });

    // Get persisted data from local storage
    boards?.forEach((board) => {
      const persistedSnapshot = localStorage.getItem(board.id);

      if (persistedSnapshot) {
        try {
          const snapshot = JSON.parse(persistedSnapshot);
          board.store.loadSnapshot(snapshot);
          board.snapshot = snapshot;
          setLoadingState({ status: "ready" });
        } catch (error) {
          setLoadingState({ status: "error", error: error.message }); // Something went wrong
        }
      } else {
        setLoadingState({ status: "ready" }); // Nothing persisted, continue with the empty store
      }

      // Each time the store changes, run the (debounced) persist function
      const cleanupFn = board.store.listen(
        throttle(() => {
          const snapshot = board.store.getSnapshot();
          const newBoard = {
            id: board.id,
            boardName: board.boardName,
            boardDescription: board.boardDescription,
            ...snapshot,
          };
          localStorage.setItem(board.id, JSON.stringify(newBoard));
        }, 500)
      );

      return () => {
        cleanupFn();
      };
    });
    setLoadingState({ status: "ready" }); // Nothing persisted, continue with the empty store
  }, [boards, activeBoard]);

  if (loadingState.status === "loading") {
    return (
      <div className="tldraw__editor">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (loadingState.status === "error") {
    return (
      <div className="tldraw__editor">
        <h2>Error!</h2>
        <p>{loadingState.error}</p>
      </div>
    );
  }

  return (
    <div className="App">
      <NewBoardForm
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        addNewBoard={addNewBoard}
        newBoardTitle={newBoardTitle}
        newBoardDescription={newBoardDescription}
        setIsNewBoardTitle={setIsNewBoardTitle}
        setIsNewBoardDescription={setIsNewBoardDescription}
      />
      {!activeBoard ? (
        <>
          <div
            className="tldraw__container"
            style={{
              position: "fixed",
              zIndex: -1,
              inset: "30px 0 0",
              overflowY: "auto",
            }}
          >
            <div className="tldraw__button_item">
              <div
                onClick={() => setIsOpenModal(true)}
                className="tldraw__button_item_content"
              >
                Добавить новую доску
              </div>
            </div>

            {boards?.map((board) => (
              <div key={board.id} className="tldraw__board_container">
                <h1 className="tldraw__title">{board.boardName}</h1>
                <p className="tldraw__description">{board.boardDescription}</p>
                <div className="tldraw__item">
                  <div
                    className="tldraw__item_cover"
                    onClick={() => {
                      setActiveBoard(board);
                    }}
                  />

                  <TldrawImage
                    store={board.store}
                    snapshot={board.snapshot}
                    className="tldraw__board disabled"
                    hideUi
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            inset: 0,
            overflowY: "scroll",
          }}
        >
          <p style={{ cursor: "pointer" }} onClick={() => setActiveBoard(null)}>
            {`<<`} Назад
          </p>
          <Tldraw
            store={activeBoard.store}
            style={{ position: "absolute", zIndex: -1 }}
          />
        </div>
      )}
    </div>
  );
}

export default App;
