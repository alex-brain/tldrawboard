import "./App.css";
import { Tldraw, createTLStore, defaultShapeUtils, throttle, TldrawImage } from "tldraw";
import "./index.css";
import "tldraw/tldraw.css";
import { useEffect, useLayoutEffect, useState } from "react";

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

  const localStorageArray = JSON.parse(localStorage.getItem("boards"));

  if (!localStorageArray) {
    localStorage.setItem("boards", JSON.stringify([]));
  }

  useEffect(() => {
		const TLBoardsArray = localStorageArray?.map((item) => ({
			id: item.id,
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
    };
    setBoards([...boards, newBoard]);

    const newBoardId = {
      id: newBoard.id,
    };
    localStorageArray.push(newBoardId);
    const updatedArray = JSON.stringify(localStorageArray);
    localStorage.setItem("boards", updatedArray);
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
          console.log(snapshot);
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
      console.log(board.store);
      // const snapshot = board.store.getSnapshot();
      // console.log('snapshot', snapshot)
      const cleanupFn = board.store.listen(
        throttle(() => {
          const snapshot = board.store.getSnapshot();
          localStorage.setItem(board.id, JSON.stringify(snapshot));
        }, 500)
      );

      return () => {
        cleanupFn();
      };
    });
    setLoadingState({ status: "ready" }); // Nothing persisted, continue with the empty store

  }, [boards, activeBoard]);
  
  console.log('boards', boards)

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
      {!activeBoard ? (
        <>
          <button onClick={addNewBoard}>Add new board</button>
          <div
            className="tldraw__container"
            style={{
              position: "fixed",
              zIndex: -1,
              inset: "30px 0 0",
              overflowY: "auto",
            }}
          >
            {boards?.map((board) => (
              <div key={board.id} className="tldraw__item">
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


/*

import { createContext, useContext, useState } from 'react'
import { Editor, Tldraw } from 'tldraw'
import 'tldraw/tldraw.css'

const FocusedEditorContext = createContext({})

export default function InlineExample() {
  const [focusedEditor, setFocusedEditor] = useState(null)
  return (
    <FocusedEditorContext.Provider value={{ focusedEditor, setFocusedEditor }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 32,
          paddingTop: 12,
          gap: 12,
        }}
      >
        <InlineEditor width={500} height={300} />
      </div>
    </FocusedEditorContext.Provider>
  )
}

function InlineEditor({ width, height }) {
  const { focusedEditor, setFocusedEditor } = useContext(FocusedEditorContext)

  const title = `${width} x ${height}`

  const handleMount = (editor) => {
    editor.updateInstanceState({ isDebugMode: false })
    const shapshot = editor.store.getSnapshot();
    console.log('shapshot', shapshot)
  }

  return (
    <div>
      <h2>{title}</h2>
      <div style={{ width, height }} onFocus={() => setFocusedEditor(title)}>
        <Tldraw onMount={handleMount} autoFocus={focusedEditor === title} />
      </div>
    </div>
  )
}
 */