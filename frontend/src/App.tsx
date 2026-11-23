import { useCallback, useEffect, useReducer, useRef, useState } from 'react'
import { fetchBoard } from './api/boardApi.ts'
import { createCard, deleteCard, moveCard, updateCard } from './api/cardApi.ts'
import { sortCards } from './api/listApi.ts'
import Board from './components/Board.tsx'
import CardDialog from './components/CardDialog.tsx'
import SearchBox from './components/SearchBox.tsx'
import UndoToast from './components/UndoToast.tsx'
import { matchesSearch, parseWords } from './search.ts'
import { boardReducer, findCardPlace } from './state/boardReducer.ts'
import type { Card, CardFormValues, DeletedCard, NewCard, SaveResult, SortKey } from './types.ts'
import './App.css'

/** 1枚消してから、次の「×」を受け付けるまでの時間（ミリ秒） */
const DELETE_GUARD_MS = 500

/** 消した直後の「元に戻す」の知らせを出しておく時間（ミリ秒） */
const UNDO_TOAST_MS = 8000

/** 文字を入力しているところか（そこでの Ctrl + Z は、文字を戻す操作のままにする） */
function isTextField(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || target.matches('input, textarea, select'))
}

/** エラーの理由を取り出す */
function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

/** ボード画面全体（SC-01）。開いたときに API-01 でボードを読み込んで表示する */
export default function App() {
  const [board, dispatch] = useReducer(boardReducer, null) // 読み込んだボード。読み込み前は null
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // 右上に赤い字で出すメッセージ
  const [openCard, setOpenCard] = useState<{ card: Card; listId: number } | null>(null) // 詳細画面で開いているカード
  const [undoToast, setUndoToast] = useState<DeletedCard | null>(null) // 「元に戻す」の知らせを出しているカード
  const deletedCards = useRef<DeletedCard[]>([]) // 消したカード（最後が、いちばん新しく消したもの）。読み込み直すと空になる
  const dragging = useRef(false) // カードをつかんでいる間か
  const [query, setQuery] = useState('') // 検索の欄の文字
  const searchInput = useRef<HTMLInputElement>(null)

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

  /** 保存に失敗したとき：右上に赤い字で理由を出し、ボードを読み込み直す（7.2）。戻り値は、その理由 */
  const handleSaveError = useCallback(
    (error: unknown): string => {
      const message = `保存できませんでした（${reasonOf(error)}）`
      setErrorMessage(message)
      void reloadBoard()
      return message
    },
    [reloadBoard],
  )

  /** 検索中に増えたカードが検索に合わなければ、検索をやめる（隠れたままだと、増えたことがわからないため） */
  const showCard = useCallback((card: Card) => {
    setQuery((current) => (matchesSearch(card, parseWords(current)) ? current : ''))
  }, [])

  /**
   * カードを追加する（F-05）。API で保存できたら、返ってきたカードを画面に足す。
   * 戻り値は、保存の結果（失敗した理由は、ダイアログの中にも出す）。
   */
  const handleAddCard = useCallback(
    async (listId: number, newCard: NewCard): Promise<SaveResult> => {
      try {
        const card = await createCard(listId, newCard)
        dispatch({ type: 'cardAdded', listId, card })
        showCard(card)
        setErrorMessage(null)
        return null
      } catch (error) {
        return handleSaveError(error)
      }
    },
    [handleSaveError, showCard],
  )

  /**
   * 詳細画面の「保存」（F-06、API-06）。内容とステータスをまとめて更新する（片方だけ保存されることはない）。
   * 保存できたら、返ってきたカードで置き換え、ステータスが変わっていれば、そのリストの一番下へ移す。
   */
  const handleUpdateCard = useCallback(
    async (card: Card, currentListId: number, values: CardFormValues): Promise<SaveResult> => {
      try {
        const updated = await updateCard(card.id, values)
        dispatch({ type: 'cardUpdated', card: updated })
        if (values.listId !== currentListId) {
          // 位置は、リストのカードの枚数より大きければ一番下になる
          dispatch({ type: 'cardMoved', cardId: card.id, toListId: values.listId, toIndex: Number.MAX_SAFE_INTEGER })
        }
        setErrorMessage(null)
        return null
      } catch (error) {
        return handleSaveError(error)
      }
    },
    [handleSaveError],
  )

  /**
   * カードを削除する（F-07、API-07）。確認なし。データベースから消せたら、画面からも消す。
   * 失敗したら右上に赤い字で理由を出し、読み込み直す。
   * 消すと下のカードが詰まって上がってくるので、「×」をうっかりダブルクリックすると次のカードまで消えてしまう。
   * 続けて押された「×」は無視する。
   * 消したカードは、元に戻せるように、中身と場所を覚えておく（F-14）。
   */
  const lastDeleteAt = useRef(0)
  const handleDeleteCard = useCallback(
    async (cardId: number) => {
      const now = Date.now()
      if (now - lastDeleteAt.current < DELETE_GUARD_MS) return
      lastDeleteAt.current = now
      const card = board?.lists.flatMap((list) => list.cards).find((c) => c.id === cardId)
      const place = board && findCardPlace(board, cardId)
      try {
        await deleteCard(cardId)
        dispatch({ type: 'cardDeleted', cardId })
        setErrorMessage(null)
        if (card && place) {
          const deleted = { card, ...place }
          deletedCards.current.push(deleted)
          setUndoToast(deleted)
        }
      } catch (error) {
        handleSaveError(error)
      }
    },
    [board, handleSaveError],
  )

  /**
   * いちばん新しく消したカードを、元のリストの元の場所に戻す（F-14、API-05）。
   * データベースからは消えているので、同じ中身のカードを作り直す（id は新しくなる）。
   * 戻している途中・カードをつかんでいる間は、何もしない。失敗したときは覚えたままなので、もう一度試せる。
   */
  const undoing = useRef(false)
  const handleUndoDelete = useCallback(async () => {
    const last = deletedCards.current.at(-1)
    if (last === undefined || undoing.current || dragging.current) return
    undoing.current = true
    try {
      const card = await createCard(last.listId, last.card, last.index)
      dispatch({ type: 'cardAdded', listId: last.listId, card, index: last.index })
      deletedCards.current = deletedCards.current.filter((deleted) => deleted !== last)
      setUndoToast(null)
      showCard(card)
      setErrorMessage(null)
    } catch (error) {
      handleSaveError(error)
    } finally {
      undoing.current = false
    }
  }, [handleSaveError, showCard])

  // 「元に戻す」の知らせは、時間がたったら消す（消したカードは覚えたままなので、Ctrl + Z では戻せる）
  useEffect(() => {
    if (undoToast === null) return
    const timer = setTimeout(() => setUndoToast(null), UNDO_TOAST_MS)
    return () => clearTimeout(timer)
  }, [undoToast])

  // Ctrl + F で、検索の欄に移る。検索の欄にいるとき・ダイアログを開いているときは、ブラウザの検索のままにする
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'f') return
      const input = searchInput.current
      if (input === null || e.target === input || document.querySelector('dialog[open]') !== null) return
      e.preventDefault()
      if (dragging.current) return
      input.focus()
      input.select()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Ctrl + Z で、消したカードを戻す。入力欄・ダイアログの中では、ブラウザの「文字を戻す」のままにする
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.ctrlKey || e.shiftKey || e.altKey || e.key.toLowerCase() !== 'z') return
      if (e.repeat || isTextField(e.target) || document.querySelector('dialog[open]') !== null) return
      if (deletedCards.current.length === 0) return
      e.preventDefault()
      void handleUndoDelete()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleUndoDelete])

  /** リストの中のカードを並べ替える（F-13、API-09）。失敗したら右上に赤い字で理由を出し、読み込み直す */
  const handleSortCards = useCallback(
    async (listId: number, by: SortKey, reverse: boolean) => {
      try {
        dispatch({ type: 'listSorted', list: await sortCards(listId, by, reverse) })
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

  const words = parseWords(query)
  const found =
    board === null || words.length === 0
      ? null
      : board.lists.flatMap((list) => list.cards).filter((card) => matchesSearch(card, words)).length

  return (
    <>
      <header className="header">
        <h1 className="board-title">マイボード</h1>
        {board !== null && <SearchBox inputRef={searchInput} query={query} count={found} onChange={setQuery} />}
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
          searchWords={words}
          onAddCard={handleAddCard}
          onOpenCard={(card, listId) => setOpenCard({ card, listId })}
          onDeleteCard={handleDeleteCard}
          onSortCards={handleSortCards}
          onPreviewMove={(cardId, toListId, toIndex) => dispatch({ type: 'cardMoved', cardId, toListId, toIndex })}
          onRestore={(before) => dispatch({ type: 'loaded', board: before })}
          onCommitMove={handleCommitMove}
          onDraggingChange={(value) => {
            dragging.current = value
          }}
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
      {undoToast && <UndoToast cardText={undoToast.card.text} onUndo={() => void handleUndoDelete()} />}
    </>
  )
}
