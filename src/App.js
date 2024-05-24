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
import { SpeechBubbleTool } from './components/SpeechBubble/SpeechBubbleTool.tsx'
import { SpeechBubbleUtil } from './components/SpeechBubble/SpeechBubbleUtil.tsx'
import { components, customAssetUrls, uiOverrides } from './ui-overrides.tsx'
import './customhandless.css'
import NewBoardForm from "./components/NewBoardForm/NewBoardForm";
import {TableUtil} from "./components/Table/TableUtil.tsx";
import {TableTool} from "./components/Table/TableTool.tsx";

const shapeUtils = [SpeechBubbleUtil, TableUtil]
const tools = [SpeechBubbleTool, TableTool]

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
  const [isOpenRenameModal, setIsOpenRenameModal] = useState(false);
  const [newBoardTitle, setIsNewBoardTitle] = useState("");
  const [newBoardDescription, setIsNewBoardDescription] = useState("");
  const [openedBoardId, setOpenedBoardId] = useState(null);

  const localStorageArray = JSON.parse(localStorage.getItem("boards"));

  if (!localStorageArray) {
    localStorage.setItem("boards", JSON.stringify([]));
  }

  useEffect(() => {
    const TLBoardsArray = localStorageArray?.map((item) => ({
      ...item,
      store: createTLStore({ shapeUtils: [ ...defaultShapeUtils, SpeechBubbleUtil, TableUtil ] }),
    }));

    setBoards([...TLBoardsArray]);
  }, []);

  const addNewBoard = () => {
    const newBoard = {
      id: "board-" + uuidv4(),
      store: createTLStore({ shapeUtils: [ ...defaultShapeUtils, SpeechBubbleUtil, TableUtil ] }),
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

  const deleteBoard = (id) => {
    const newBoards = boards.filter((board) => board.id !== id);
    setBoards(newBoards);

    const newBoardsArray = localStorageArray.filter((item) => item.id !== id);
    const updatedArray = JSON.stringify(newBoardsArray);
    localStorage.setItem("boards", updatedArray);

    if (localStorage.getItem(id)) {
      localStorage.removeItem(id.toString());
    }
  };

  const updateBoard = (id) => {
    const updatedBoards = boards.map((board) => {
      if (board.id === id) {
        return {
          ...board,
          boardName: newBoardTitle,
          boardDescription: newBoardDescription,
        };
      }

      return board;
    });

    setBoards(updatedBoards);

    const updatedBoardsArray = localStorageArray.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          boardName: newBoardTitle,
          boardDescription: newBoardDescription,
        };
      }
      return item;
    });

    const updatedArray = JSON.stringify(updatedBoardsArray);
    localStorage.setItem("boards", updatedArray);

    setOpenedBoardId(null);
    setIsOpenRenameModal(false);
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
        title={"Новая доска"}
        isOpen={isOpenModal}
        onClose={() => setIsOpenModal(false)}
        onEnter={addNewBoard}
        newBoardTitle={newBoardTitle}
        newBoardDescription={newBoardDescription}
        setIsNewBoardTitle={setIsNewBoardTitle}
        setIsNewBoardDescription={setIsNewBoardDescription}
      />
      <NewBoardForm
        title={"Переименование доски"}
        isOpen={isOpenRenameModal}
        onClose={() => setIsOpenRenameModal(false)}
        onEnter={() => updateBoard(openedBoardId)}
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
                <div className="tldraw__board_header">
                  <h1
                    className="tldraw__title"
                    onClick={() => {
                      setIsOpenRenameModal(true);
                      setIsNewBoardTitle(board.boardName);
                      setIsNewBoardDescription(board.boardDescription);
                      setOpenedBoardId(board.id);
                    }}
                  >
                    {board.boardName}
                  </h1>
                  <div
                    className="tldraw__board_close"
                    onClick={() => deleteBoard(board.id)}
                  ></div>
                </div>
                <p
                  className="tldraw__description"
                  onClick={() => {
                    setIsOpenRenameModal(true);
                    setIsNewBoardTitle(board.boardName);
                    setIsNewBoardDescription(board.boardDescription);
                    setOpenedBoardId(board.id);
                  }}
                >
                  {board.boardDescription}
                </p>
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
                    shapeUtils={shapeUtils}
                    tools={tools}
                    overrides={uiOverrides}
                    components={components}
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
            style={{ position: "absolute", zIndex: -1 }}
            store={activeBoard.store}
            shapeUtils={shapeUtils}
            assetUrls={customAssetUrls}
            tools={tools}
            overrides={uiOverrides}
            components={components}
          />
        </div>
      )}
    </div>
  );
}

export default App;
