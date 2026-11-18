// タスク管理アプリ プロトタイプ
// 操作はできるが、保存はしない（再読み込みすると最初の状態に戻る）。
// ドラッグ&ドロップは、本番では SortableJS を使う予定。ここではブラウザ標準の機能で代わりに作っている。

(function () {
  'use strict';

  const LIST_MAX = 20;   // リスト名の上限（6.1 共通ルール）
  const CARD_MAX = 200;  // カードの上限

  // 優先度：保存する値 → 表示する文字
  const PRIORITY = { high: '高', medium: '中', low: '低' };
  const PRIORITY_RANK = { high: 0, medium: 1, low: 2 }; // 並べ替えで使う（なしは最後）

  // ===== 日付の道具 =====
  function pad(n) { return String(n).padStart(2, '0'); }
  function dateStr(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
  function daysFromToday(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return dateStr(d);
  }
  // "2026-11-25" → "11/25"（今年でなければ "2027/1/5"）
  function formatDue(s) {
    const [y, m, d] = s.split('-').map(Number);
    return y === new Date().getFullYear() ? `${m}/${d}` : `${y}/${m}/${d}`;
  }

  // ===== データ（7.2の図と同じサンプル。期限・優先度の例を足している） =====
  const board = {
    lists: [
      { id: 'l1', title: 'ToDo', cards: [
        { id: 'c1', text: '要件定義を書く', due: daysFromToday(0), priority: 'high' },
        { id: 'c2', text: '画面を作る', due: daysFromToday(5), priority: 'medium' }
      ] },
      { id: 'l2', title: '進行中', cards: [
        { id: 'c3', text: '環境を用意', due: daysFromToday(-1), priority: 'low' }
      ] },
      { id: 'l3', title: '完了', cards: [
        { id: 'c4', text: '課題を確認', due: null, priority: null }
      ] }
    ]
  };
  let nextId = 100;

  // ===== 画面の状態（どの入力欄・メニューが開いているか） =====
  const ui = {
    addingCardTo: null, addingList: false, editingCard: null, editingList: null,
    editingDue: null, priorityMenu: null, sortMenu: null
  };
  let openInput = null;   // 今開いている入力欄・メニュー（同時に開くのは1つだけ）
  let dragCardId = null;  // ドラッグ中のカード

  const boardEl = document.getElementById('board');
  const dropLine = el('div', 'drop-line');

  // ===== 小さな道具 =====
  function newId(prefix) {
    nextId += 1;
    return prefix + nextId;
  }

  // 要素を作る。文字は textContent で入れるので、HTMLとして解釈されない（NFR-07）
  function el(tag, className, text) {
    const e = document.createElement(tag);
    if (className) e.className = className;
    if (text != null) e.textContent = text;
    return e;
  }

  function findCard(cardId) {
    for (const list of board.lists) {
      const index = list.cards.findIndex(c => c.id === cardId);
      if (index >= 0) return { list, index };
    }
    return null;
  }

  // ボタンなどを押したときの共通処理：開いている入力欄を閉じてから操作し、描き直す
  function onClick(elem, fn) {
    elem.addEventListener('click', e => {
      e.stopPropagation();
      closeOpenInput();
      fn();
      render();
    });
    elem.addEventListener('dblclick', e => e.stopPropagation()); // カードの編集が始まらないように
  }

  // ===== 入力欄（Enterで確定、Escでやめる、外をクリックすると outside） =====
  function makeInput(value, max, placeholder, handlers) {
    const input = el('input', 'input');
    input.type = 'text';
    input.maxLength = max;  // 上限を超える文字は入らない
    input.value = value;
    input.placeholder = placeholder;

    input.addEventListener('keydown', e => {
      if (e.isComposing || e.keyCode === 229) return; // 日本語の変換を確定するEnterは無視する
      if (e.key === 'Enter') {
        e.preventDefault();
        if (handlers.enter(input.value.trim()) !== false) render();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handlers.esc();
        render();
      }
    });
    input.addEventListener('click', e => e.stopPropagation()); // 入力欄の中のクリックは「外」ではない

    openInput = { input, outside: handlers.outside };
    return input;
  }

  // 小さなメニュー（優先度・並べ替え）。項目を押すか、Esc・外のクリックで閉じる
  function makeMenu(items, close, extraClass) {
    const menu = el('div', 'menu' + (extraClass ? ' ' + extraClass : ''));
    menu.addEventListener('click', e => e.stopPropagation());
    menu.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        render();
      }
    });
    items.forEach(item => {
      const b = el('button', 'menu-item ' + (item.className || ''), item.label);
      if (item.current) b.classList.add('current');
      if (item.title) b.title = item.title;
      onClick(b, item.action);
      menu.appendChild(b);
    });
    openInput = { input: menu.querySelector('.current') || menu.firstChild, outside: close };
    return menu;
  }

  function closeOpenInput() {
    if (!openInput) return false;
    const o = openInput;
    openInput = null;
    o.outside(o.input.value != null ? o.input.value.trim() : '');
    return true;
  }

  // 入力欄の外（何もない所）をクリックしたとき
  document.addEventListener('click', () => {
    if (closeOpenInput()) render();
  });

  // ===== 描画：データから画面を作り直す =====
  function render() {
    openInput = null;
    boardEl.textContent = '';
    board.lists.forEach(list => boardEl.appendChild(renderList(list)));
    boardEl.appendChild(ui.addingList ? renderNewListForm() : renderAddListButton());
    if (openInput) {
      openInput.input.focus();
      if (openInput.input.type === 'date') {
        // 期限の入力欄を開いたら、すぐカレンダーも出す
        try { openInput.input.showPicker(); } catch (e) { /* 出せないブラウザでは入力欄だけ */ }
      }
    }
  }

  function renderList(list) {
    const section = el('section', 'list');
    section.dataset.listId = list.id;

    // --- リスト名・並べ替え・「×」 ---
    const header = el('div', 'list-header');
    if (ui.editingList === list.id) {
      // F-03：名前変更。空で確定したら元の名前に戻す
      header.appendChild(makeInput(list.title, LIST_MAX, 'リスト名', {
        enter: v => { if (v) list.title = v; ui.editingList = null; },
        esc: () => { ui.editingList = null; },
        outside: v => { if (v) list.title = v; ui.editingList = null; }
      }));
    } else {
      const title = el('button', 'list-title', list.title);
      title.title = 'クリックで名前を変更';
      onClick(title, () => { ui.editingList = list.id; });
      header.appendChild(title);
    }

    // 並べ替えボタン：押すとメニューが出る
    const sortOpen = ui.sortMenu === list.id;
    const sortBtn = el('button', 'icon-btn', '⇅');
    sortBtn.title = 'カードを並べ替え';
    onClick(sortBtn, () => { ui.sortMenu = sortOpen ? null : list.id; });
    header.appendChild(sortBtn);
    if (sortOpen) {
      const close = () => { ui.sortMenu = null; };
      // カードの印と同じ並び（期限 → 優先度）で横に並べる
      header.appendChild(makeMenu([
        { label: '期限', title: '期限が近い順に並べ替え', action: () => sortCards(list, 'due') },
        { label: '優先度', title: '優先度が高い順に並べ替え', action: () => sortCards(list, 'priority') }
      ], close, 'menu-row'));
    }

    const del = el('button', 'icon-btn', '×');
    del.title = 'リストを削除';
    onClick(del, () => deleteList(list));
    header.appendChild(del);
    section.appendChild(header);

    // --- カード ---
    const cardsEl = el('div', 'cards');
    list.cards.forEach(card => cardsEl.appendChild(renderCard(card)));
    section.appendChild(cardsEl);

    // --- 「+ カードを追加」 ---
    if (ui.addingCardTo === list.id) {
      // F-05：追加したあとも入力欄は開いたまま
      const input = makeInput('', CARD_MAX, 'カードの内容を入力', {
        enter: v => {
          if (!v) return false; // 空欄では追加しない
          list.cards.push({ id: newId('c'), text: v, due: null, priority: null });
        },
        esc: () => { ui.addingCardTo = null; },
        outside: () => { ui.addingCardTo = null; }
      });
      input.classList.add('input-new-card');
      section.appendChild(input);
      section.appendChild(el('p', 'hint', 'Enterで追加 ／ Escでやめる'));
    } else {
      const add = el('button', 'add-card', '+ カードを追加');
      onClick(add, () => { ui.addingCardTo = list.id; });
      section.appendChild(add);
    }

    // --- ドロップ先としての動き ---
    section.addEventListener('dragover', e => onDragOver(e, cardsEl));
    section.addEventListener('drop', e => onDrop(e, list, cardsEl));
    return section;
  }

  function renderCard(card) {
    if (ui.editingCard === card.id) {
      // F-06：編集。空で確定したら元の内容に戻す
      return makeInput(card.text, CARD_MAX, '', {
        enter: v => { if (v) card.text = v; ui.editingCard = null; },
        esc: () => { ui.editingCard = null; },
        outside: v => { if (v) card.text = v; ui.editingCard = null; }
      });
    }

    const cardEl = el('div', 'card');
    cardEl.draggable = true;
    cardEl.dataset.cardId = card.id;
    cardEl.appendChild(el('span', 'card-text', card.text));

    const meta = el('span', 'card-meta');
    meta.appendChild(renderDue(card));
    meta.appendChild(renderPriority(card));
    cardEl.appendChild(meta);

    // F-07：マウスを乗せると出る「×」で、確認なしで削除
    const del = el('button', 'card-delete', '×');
    del.title = 'カードを削除';
    onClick(del, () => {
      const found = findCard(card.id);
      if (found) found.list.cards.splice(found.index, 1);
    });
    cardEl.appendChild(del);

    if (ui.priorityMenu === card.id) {
      const close = () => { ui.priorityMenu = null; };
      const items = Object.keys(PRIORITY).map(key => ({
        label: PRIORITY[key], className: 'prio-' + key, current: card.priority === key,
        action: () => { card.priority = key; }
      }));
      items.push({ label: 'なし', current: !card.priority, action: () => { card.priority = null; } });
      cardEl.appendChild(makeMenu(items, close));
    }

    cardEl.addEventListener('dblclick', e => {
      e.stopPropagation();
      closeOpenInput();
      ui.editingCard = card.id;
      render();
    });
    cardEl.addEventListener('dragstart', e => onDragStart(e, cardEl, card.id));
    cardEl.addEventListener('dragend', onDragEnd);
    return cardEl;
  }

  // 期限：印をクリックすると日付の入力欄になり、カレンダーが出る
  function renderDue(card) {
    if (ui.editingDue === card.id) {
      const input = el('input', 'input input-date');
      input.type = 'date';
      input.value = card.due || '';
      let typed = false; // キーボードで打っている途中か
      const commit = () => { card.due = input.value || null; ui.editingDue = null; };

      input.addEventListener('keydown', e => {
        if (e.key === 'Enter') { e.preventDefault(); commit(); render(); }
        else if (e.key === 'Escape') { e.preventDefault(); ui.editingDue = null; render(); }
        else typed = true;
      });
      // カレンダーで日付をクリックしたら、すぐ確定する
      // （キーボードで打っている途中は、日の1桁目で確定しないよう、Enterか外のクリックを待つ）
      input.addEventListener('change', () => {
        if (!typed) { commit(); render(); }
      });
      input.addEventListener('click', e => e.stopPropagation());
      input.addEventListener('dblclick', e => e.stopPropagation());
      openInput = { input, outside: commit };
      return input;
    }

    let label = '期限';
    let cls = 'chip empty';
    if (card.due) {
      label = formatDue(card.due);
      const today = dateStr(new Date());
      cls = 'chip due' + (card.due < today ? ' overdue' : card.due === today ? ' today' : '');
    }
    const chip = el('button', cls, label);
    chip.title = card.due ? `期限：${card.due}（クリックで変更）` : '期限を設定';
    onClick(chip, () => { ui.editingDue = card.id; });
    return chip;
  }

  // 優先度：印をクリックするとメニューが出る
  function renderPriority(card) {
    const isOpen = ui.priorityMenu === card.id;
    const chip = card.priority
      ? el('button', 'chip prio-' + card.priority, PRIORITY[card.priority])
      : el('button', 'chip empty', '優先度');
    chip.title = '優先度を設定';
    onClick(chip, () => { ui.priorityMenu = isOpen ? null : card.id; });
    return chip;
  }

  // 並べ替え：押したときに1回だけ並べ替える。同じ順位のカードは今の順番のまま
  function sortCards(list, by) {
    const NONE = 99;
    const key = by === 'due'
      ? c => c.due || '9999-12-31'                                  // 期限なしは最後
      : c => (c.priority ? PRIORITY_RANK[c.priority] : NONE);        // 優先度なしは最後
    list.cards.sort((a, b) => {
      const ka = key(a), kb = key(b);
      return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
  }

  function renderAddListButton() {
    const btn = el('button', 'add-list', '+ リストを追加');
    onClick(btn, () => { ui.addingList = true; });
    return btn;
  }

  function renderNewListForm() {
    // F-02：一番最後に追加
    const box = el('div', 'list');
    box.addEventListener('click', e => e.stopPropagation());
    box.appendChild(makeInput('', LIST_MAX, 'リスト名を入力', {
      enter: v => {
        if (!v) return false;
        board.lists.push({ id: newId('l'), title: v, cards: [] });
        ui.addingList = false;
      },
      esc: () => { ui.addingList = false; },
      outside: () => { ui.addingList = false; }
    }));
    box.appendChild(el('p', 'hint', 'Enterで追加 ／ Escでやめる'));
    return box;
  }

  // F-04：カードが入っているときだけ確認する
  function deleteList(list) {
    const n = list.cards.length;
    if (n > 0 && !confirm(`『${list.title}』を削除しますか？中のカード${n}枚も削除されます`)) return;
    board.lists = board.lists.filter(l => l !== list);
  }

  // ===== ドラッグ&ドロップ（F-08・F-09） =====
  function onDragStart(e, cardEl, cardId) {
    closeOpenInput(); // 開いている入力欄はここで閉じる（画面の描き直しはドラッグが終わってから）
    dragCardId = cardId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', cardId);
    // つかんだ瞬間に半透明にすると、マウスについてくる絵まで薄くなるので、少し遅らせる
    requestAnimationFrame(() => cardEl.classList.add('dragging'));
  }

  // マウスの高さから、どのカードの前に置くかを決める（null なら一番下）
  function cardBelow(cardsEl, y) {
    const cards = cardsEl.querySelectorAll('.card:not(.dragging)');
    for (const c of cards) {
      const r = c.getBoundingClientRect();
      if (y < r.top + r.height / 2) return c;
    }
    return null;
  }

  function onDragOver(e, cardsEl) {
    if (!dragCardId) return;
    e.preventDefault(); // これで「ここに置ける」ことになる
    e.dataTransfer.dropEffect = 'move';
    const before = cardBelow(cardsEl, e.clientY);
    if (before) {
      if (dropLine.nextSibling !== before) cardsEl.insertBefore(dropLine, before);
    } else if (dropLine.parentNode !== cardsEl || dropLine.nextSibling) {
      cardsEl.appendChild(dropLine);
    }
  }

  // リストの外に出たら線を消す
  document.addEventListener('dragover', e => {
    if (dragCardId && !e.target.closest('.list[data-list-id]')) dropLine.remove();
  });

  function onDrop(e, list, cardsEl) {
    e.preventDefault();
    if (!dragCardId) return;
    const before = cardBelow(cardsEl, e.clientY);
    const from = findCard(dragCardId);
    if (!from) return;
    const moved = from.list.cards.splice(from.index, 1)[0];
    let index = list.cards.length;
    if (before) {
      const i = list.cards.findIndex(c => c.id === before.dataset.cardId);
      if (i >= 0) index = i;
    }
    list.cards.splice(index, 0, moved);
  }

  // リストの外で離したときは何も変えない＝元の位置に戻る
  function onDragEnd() {
    dragCardId = null;
    dropLine.remove();
    render();
  }

  render();
})();
