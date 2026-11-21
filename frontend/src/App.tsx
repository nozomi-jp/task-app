import { useEffect, useState } from 'react'
import { fetchBoard } from './api/boardApi.ts'
import Board from './components/Board.tsx'
import type { Board as BoardData } from './types.ts'
import './App.css'

/** ボード画面全体（SC-01）。開いたときに API-01 でボードを読み込んで表示する */
export default function App() {
  const [board, setBoard] = useState<BoardData | null>(null) // 読み込んだボード。読み込み前は null
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // 読み込みに失敗したときのメッセージ

  // 画面を開いたときに1回だけ読み込む
  useEffect(() => {
    let ignore = false // 画面が閉じたあとに結果が届いても使わないための目印
    fetchBoard()
      .then((data) => {
        if (!ignore) setBoard(data)
      })
      .catch((error: unknown) => {
        if (ignore) return
        const reason = error instanceof Error ? error.message : String(error)
        setErrorMessage(`読み込めませんでした（${reason}）`)
      })
    return () => {
      ignore = true
    }
  }, [])

  return (
    <>
      <header className="header">
        <h1 className="board-title">マイボード</h1>
        {errorMessage ? (
          <span className="save-status error" role="alert">
            {errorMessage}
          </span>
        ) : (
          <span className="save-status">変更は自動保存</span>
        )}
      </header>
      {board === null ? (
        !errorMessage && <p className="loading">読み込み中…</p>
      ) : (
        <Board board={board} />
      )}
    </>
  )
}
