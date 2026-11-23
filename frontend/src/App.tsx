import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { fetchBoard } from './api/boardApi.ts'
import { createCard, deleteCard, moveCard, updateCard } from './api/cardApi.ts'
import Board from './components/Board.tsx'
import CardDialog from './components/CardDialog.tsx'
import { boardReducer } from './state/boardReducer.ts'
import type { Card, CardFormValues, NewCard } from './types.ts'
import './App.css'

/** 1枚消してから、次の「×」を受け付けるまでの時間（ミリ秒） */
const DELETE_GUARD_MS = 500

/** エラーの理由を取り出す */
function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** ボード画面全体（SC-01）。開いたときに API-01 でボードを読み込んで表示する */
export default function App() {
  const [board, dispatch] = useReducer(boardReducer, null) // 読み込んだボード。読み込み前は null
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // 右上に赤い字で出すメッセージ
  const [openCard, setOpenCard] = useState<{ card: Card; listId: number } | null>(null) // 詳細画面で開いているカード

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

  /** ボードを読み込み直して、データベースの本当の状態を表示する。失敗したら今の表示のまま */
  const reloadBoard = useCallback(async () => {
    try {
      dispatch({ type: 'loaded', board: await fetchBoard() })
    } catch {
      // 読み込み直しにも失敗したら、今の表示のままにする（メッセージは保存の失敗を出したまま）
    }
  }, [])

  /** 保存に失敗したとき：右上に赤い字で理由を出し、ボードを読み込み直す（7.2）。戻り値は false */
  const handleSaveError = useCallback(
    (error: unknown): false => {
      setErrorMessage(`保存できませんでした（${reasonOf(error)}）`)
      void reloadBoard()
      return false
    },
    [reloadBoard],
  )

  /**
   * カードを追加する（F-05）。API で保存できたら、返ってきたカードを画面に足す。
   * 戻り値は、保存できたかどうか（ダイアログを閉じるかどうかに使う）。
   */
  const handleAddCard = useCallback(
    async (listId: number, newCard: NewCard): Promise<boolean> => {
      try {
        const card = await createCard(listId, newCard)
        dispatch({ type: 'cardAdded', listId, card })
        setErrorMessage(null)
        return true
      } catch (error) {
        return handleSaveError(error)
      }
    },
    [handleSaveError],
  )

  /**
   * 詳細画面の「保存」（F-06）。内容を更新し（API-06）、ステータスが変わっていれば、そのリストの一番下へ移す（API-08）。
   * 内容だけなら、返ってきたカードで置き換える。移したときは、並び順が変わるのでボードを読み込み直す。
   */
  const handleUpdateCard = useCallback(
    async (card: Card, currentListId: number, values: CardFormValues): Promise<boolean> => {
      try {
        const { listId, ...update } = values
        const updated = await updateCard(card.id, update)
        if (listId === currentListId) {
          dispatch({ type: 'cardUpdated', card: updated })
        } else {
          // 移動先のリストのカードの枚数＝一番下の位置（0始まり）
          const bottom = board?.lists.find((list) => list.id === listId)?.cards.length ?? 0
          await moveCard(card.id, listId, bottom)
          await reloadBoard()
        }
        setErrorMessage(null)
        return true
      } catch (error) {
        return handleSaveError(error)
      }
    },
    [board, handleSaveError, reloadBoard],
  )

  /**
   * カードを削除する（F-07、API-07）。確認なし。データベースから消せたら、画面からも消す。
   * 失敗したら右上に赤い字で理由を出し、読み込み直す。
   * 消すと下のカードが詰まって上がってくるので、「×」をうっかりダブルクリックすると次のカードまで消えてしまう。
   * 元に戻せない操作なので、続けて押された「×」は無視する。
   */
  const lastDeleteAt = useRef(0)
  const handleDeleteCard = useCallback(
    async (cardId: number) => {
      const now = Date.now()
      if (now - lastDeleteAt.current < DELETE_GUARD_MS) return
      lastDeleteAt.current = now
      try {
        await deleteCard(cardId)
        dispatch({ type: 'cardDeleted', cardId })
        setErrorMessage(null)
      } catch (error) {
        handleSaveError(error)
      }
    },
    [handleSaveError],
  )

  /**
   * ドラッグ＆ドロップで置いた場所を保存する（F-08・F-09、API-08）。
   * 画面ではもう動かしてあるので、保存できたらそのまま。失敗したら赤い字で理由を出し、読み込み直して元の状態に戻す。
   */
  const handleCommitMove = useCallback(
    async (cardId: number, listId: number, position: number) => {
      try {
        await moveCard(cardId, listId, position)
        setErrorMessage(null)
      } catch (error) {
        handleSaveError(error)
      }
    },
    [handleSaveError],
  )

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
        <Board
          board={board}
          onAddCard={handleAddCard}
          onOpenCard={(card, listId) => setOpenCard({ card, listId })}
          onDeleteCard={handleDeleteCard}
          onPreviewMove={(cardId, toListId, toIndex) => dispatch({ type: 'cardMoved', cardId, toListId, toIndex })}
          onRestore={(before) => dispatch({ type: 'loaded', board: before })}
          onCommitMove={handleCommitMove}
        />
      )}
      {openCard && board && (
        <CardDialog
          // 開くカードが変わったら、入力欄を作り直して、そのカードの値から始める
          key={openCard.card.id}
          heading="タスクの詳細"
          initial={{ ...openCard.card, listId: openCard.listId }}
          allowNoPriority
          lists={board.lists.map(({ id, title }) => ({ id, title }))}
          onSave={(values) => handleUpdateCard(openCard.card, openCard.listId, values)}
          onClose={() => setOpenCard(null)}
        />
      )}
    </>
  )
}
