import { useCallback, useEffect, useReducer, useState } from 'react'
import { fetchBoard } from './api/boardApi.ts'
import { createCard } from './api/cardApi.ts'
import Board from './components/Board.tsx'
import { boardReducer } from './state/boardReducer.ts'
import './App.css'

/** エラーの理由を取り出す */
function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** ボード画面全体（SC-01）。開いたときに API-01 でボードを読み込んで表示する */
export default function App() {
  const [board, dispatch] = useReducer(boardReducer, null) // 読み込んだボード。読み込み前は null
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // 右上に赤い字で出すメッセージ

  // 画面を開いたときに1回だけ読み込む
  useEffect(() => {
    let ignore = false // 画面が閉じたあとに結果が届いても使わないための目印
    fetchBoard()
      .then((data) => {
        if (!ignore) dispatch({ type: 'loaded', board: data })
      })
      .catch((error: unknown) => {
        if (!ignore) setErrorMessage(`読み込めませんでした（${reasonOf(error)}）`)
      })
    return () => {
      ignore = true
    }
  }, [])

  /**
   * カードを追加する（F-05）。API で保存できたら、返ってきたカードを画面に足す。
   * 失敗したら右上に赤い字で理由を出し、ボードを読み込み直して、データベースの本当の状態を表示する（7.2）。
   * 戻り値は、保存できたかどうか（入力欄を空にするかどうかに使う）。
   */
  const handleAddCard = useCallback(async (listId: number, text: string): Promise<boolean> => {
    try {
      const card = await createCard(listId, text)
      dispatch({ type: 'cardAdded', listId, card })
      setErrorMessage(null)
      return true
    } catch (error) {
      setErrorMessage(`保存できませんでした（${reasonOf(error)}）`)
      fetchBoard()
        .then((data) => dispatch({ type: 'loaded', board: data }))
        .catch(() => {
          // 読み込み直しにも失敗したら、今の表示のままにする（メッセージは保存の失敗を出したまま）
        })
      return false
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
        <Board board={board} onAddCard={handleAddCard} />
      )}
    </>
  )
}
