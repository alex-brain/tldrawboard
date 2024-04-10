import { useState } from 'react'
import { Box, Tldraw, TldrawImage } from 'tldraw'
import 'tldraw/tldraw.css'
import initialSnapshot from './snapshot.json'

// There's a guide at the bottom of this file!

export default function App() {
  const [editor, setEditor] = useState()
  const [snapshot, setSnapshot] = useState(initialSnapshot)
  const [currentPageId, setCurrentPageId] = useState()
  const [showBackground, setShowBackground] = useState(true)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [viewportPageBounds, setViewportPageBounds] = useState(new Box(0, 0, 600, 400))
  const [isEditing, setIsEditing] = useState(false)
  const [format, setFormat] = useState('svg')

  return (
    <div style={{ padding: 30 }}>
      <div style={{ position: 'fixed', inset: 0 }}>
        {isEditing ? (
          <Tldraw
            snapshot={snapshot}
            onMount={(editor) => {
              setEditor(editor)
              editor.updateInstanceState({ isDebugMode: false })
              editor.user.updateUserPreferences({ isDarkMode })
              if (currentPageId) {
                editor.setCurrentPage(currentPageId)
              }
              if (viewportPageBounds) {
                editor.zoomToBounds(viewportPageBounds, { inset: 0 })
              }
            }}
          />
        ) : (
          <div key={1} className="board-list">
            <div className="board-item" onClick={() => {
              if (isEditing) {
                if (!editor) return
                setIsDarkMode(editor.user.getIsDarkMode())
                setShowBackground(editor.getInstanceState().exportBackground)
                setViewportPageBounds(editor.getViewportPageBounds())
                setCurrentPageId(editor.getCurrentPageId())
                setSnapshot(editor.store.getSnapshot())
                setIsEditing(false)
              } else {
                setIsEditing(true)
              }
            }}>
              <TldrawImage
                //[1]
                snapshot={snapshot}
                // [2]
                pageId={currentPageId}
                // [3]
                background={showBackground}
                darkMode={isDarkMode}
                bounds={viewportPageBounds}
                padding={0}
                 scale={1}
                format={format}
              />
            </div>
            <div key={2} className="board-item" onClick={() => {
              if (isEditing) {
                if (!editor) return
                setIsDarkMode(editor.user.getIsDarkMode())
                setShowBackground(editor.getInstanceState().exportBackground)
                setViewportPageBounds(editor.getViewportPageBounds())
                setCurrentPageId(editor.getCurrentPageId())
                setSnapshot(editor.store.getSnapshot())
                setIsEditing(false)
              } else {
                setIsEditing(true)
              }
            }}>
              <TldrawImage
                //[1]
                snapshot={snapshot}
                // [2]
                pageId={currentPageId}
                // [3]
                background={showBackground}
                darkMode={isDarkMode}
                bounds={viewportPageBounds}
                padding={0}
                scale={1}
                format={format}
              />
            </div>
            <div key={3} className="board-item" onClick={() => {
              if (isEditing) {
                if (!editor) return
                setIsDarkMode(editor.user.getIsDarkMode())
                setShowBackground(editor.getInstanceState().exportBackground)
                setViewportPageBounds(editor.getViewportPageBounds())
                setCurrentPageId(editor.getCurrentPageId())
                setSnapshot(editor.store.getSnapshot())
                setIsEditing(false)
              } else {
                setIsEditing(true)
              }
            }}>
              <TldrawImage
                //[1]
                snapshot={snapshot}
                // [2]
                pageId={currentPageId}
                // [3]
                background={showBackground}
                darkMode={isDarkMode}
                bounds={viewportPageBounds}
                padding={0}
                scale={1}
                format={format}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/*

This example shows how to use the `TldrawImage` component to display a snapshot
as an image. The example also allows you to toggle between editing the snapshot
and viewing it.

[1] Pass your snapshot to the `snapshot` prop of the `TldrawImage` component.

[2] You can specify which page to display by using the `pageId` prop. By
    default, the first page is shown.

[3] You can customize the appearance of the image by passing other props to the
        `TldrawImage` component. For example, you can toggle the background, set
        the dark mode, and specify the viewport bounds.
 */
