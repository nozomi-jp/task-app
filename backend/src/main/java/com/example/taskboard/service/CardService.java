package com.example.taskboard.service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.BoardResponse.ListResponse;
import com.example.taskboard.dto.CreateCardRequest;
import com.example.taskboard.dto.UpdateCardRequest;
import com.example.taskboard.entity.Card;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

/**
 * カードについての処理。
 */
@Service
public class CardService {

    /** 優先度の順位（小さいほど高い） */
    private static final Map<String, Integer> PRIORITY_RANK = Map.of("high", 0, "medium", 1, "low", 2);

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public CardService(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    /**
     * カードをリストの一番下に追加する（F-05、API-05）。
     * 「一番下の位置を調べる」と「保存する」を1つのトランザクションで行う。
     *
     * @throws NotFoundException リストがないとき
     */
    @Transactional
    public CardResponse createCard(Long listId, CreateCardRequest request) {
        requireListExists(listId);
        int position = cardRepository.findMaxPositionByListId(listId) + 1;
        Card card = new Card(listId, request.text(), blankToNull(request.description()), request.dueDate(),
                request.priority(), position);
        return CardResponse.from(cardRepository.save(card));
    }

    /**
     * カードの内容（タイトル・説明・期限・優先度）を更新する（詳細画面、API-06）。
     * トランザクションの中で変えたカードは、終わるときに自動でデータベースに保存される。
     *
     * @throws NotFoundException カードがないとき
     */
    @Transactional
    public CardResponse updateCard(Long cardId, UpdateCardRequest request) {
        Card card = findCard(cardId);
        card.updateContent(request.text(), blankToNull(request.description()), request.dueDate(),
                request.priority());
        return CardResponse.from(card);
    }

    /**
     * カードを、指定したリストの指定した位置へ移す（ステータスの変更・移動・並べ替え、API-08）。
     * 移動元と移動先のリストのカードについて、並び順（position）を 0 から振り直す。
     * 途中で失敗して並び順が中途半端にならないよう、まとめて1つのトランザクションで行う（要件定義書 9.4）。
     *
     * @param position 移動先のリストで上から何番目に置くか（0始まり）。カードの数より大きければ一番下
     * @throws NotFoundException カード・移動先のリストがないとき
     */
    @Transactional
    public CardResponse moveCard(Long cardId, Long targetListId, int position) {
        Card card = findCard(cardId);
        requireListExists(targetListId);
        Long sourceListId = card.getListId();

        // 移動先のリストのカード（動かすカード自身は除く）に、動かすカードを差し込む
        List<Card> targetCards = new ArrayList<>(cardRepository.findByListIdOrderByPositionAsc(targetListId));
        targetCards.removeIf(c -> c.getId().equals(cardId));
        int index = Math.min(position, targetCards.size());
        targetCards.add(index, card);

        card.moveTo(targetListId, index);
        renumber(targetCards);

        // 別のリストへ移したときは、移動元のリストに空いたすき間を詰める
        if (!sourceListId.equals(targetListId)) {
            renumber(cardRepository.findByListIdOrderByPositionAsc(sourceListId).stream()
                    .filter(c -> !c.getId().equals(cardId))
                    .toList());
        }
        return CardResponse.from(card);
    }

    /**
     * カードを削除する（F-07、API-07）。物理削除なので、データベースから行ごとなくなり、元に戻せない。
     * 残ったカードの並び順にすき間ができないよう、0 から振り直す。まとめて1つのトランザクションで行う。
     *
     * @throws NotFoundException カードがないとき
     */
    @Transactional
    public void deleteCard(Long cardId) {
        Card card = findCard(cardId);
        cardRepository.delete(card);
        renumber(cardRepository.findByListIdOrderByPositionAsc(card.getListId()).stream()
                .filter(c -> !c.getId().equals(cardId))
                .toList());
    }

    /**
     * リストの中のカードを、期限順または優先度順に並べ替えて、並び順を振り直す（F-13、API-09）。
     * 同じ順位のカードは今の順番のまま。期限・優先度がないカードは、どちらの向きでも一番下。
     *
     * @param by      dueDate（期限）か priority（優先度）
     * @param reverse false なら期限が近い順・優先度が高い順、true ならその反対
     * @throws NotFoundException リストがないとき
     */
    @Transactional
    public ListResponse sortCards(Long listId, String by, boolean reverse) {
        TaskList list = taskListRepository.findById(listId)
                .orElseThrow(() -> new NotFoundException("リストが見つかりません（ID " + listId + "）"));
        Comparator<Card> order = switch (by) {
            case "dueDate" -> Comparator.comparing(Card::getDueDate, noneLast(reverse));
            case "priority" -> Comparator.comparing(CardService::priorityRank, noneLast(reverse));
            default -> throw new IllegalArgumentException("並べ替えの種類が正しくありません：" + by);
        };
        List<Card> sorted = cardRepository.findByListIdOrderByPositionAsc(listId).stream().sorted(order).toList();
        renumber(sorted);
        return new ListResponse(list.getId(), list.getTitle(), sorted.stream().map(CardResponse::from).toList());
    }

    /** 「なし」（null）はいつも最後。それ以外を小さい順（reverse なら大きい順）に並べる比べ方 */
    private static <T extends Comparable<? super T>> Comparator<T> noneLast(boolean reverse) {
        return Comparator.nullsLast(reverse ? Comparator.<T>reverseOrder() : Comparator.<T>naturalOrder());
    }

    /** 優先度の順位。優先度がなければ null */
    private static Integer priorityRank(Card card) {
        return card.getPriority() == null ? null : PRIORITY_RANK.get(card.getPriority());
    }

    /** 並んでいる順に、並び順を 0, 1, 2, … と振り直す */
    private static void renumber(List<Card> cards) {
        for (int i = 0; i < cards.size(); i++) {
            cards.get(i).setPosition(i);
        }
    }

    private Card findCard(Long cardId) {
        return cardRepository.findById(cardId)
                .orElseThrow(() -> new NotFoundException("カードが見つかりません（ID " + cardId + "）"));
    }

    private void requireListExists(Long listId) {
        if (!taskListRepository.existsById(listId)) {
            throw new NotFoundException("リストが見つかりません（ID " + listId + "）");
        }
    }

    /** 空、または空白だけの説明は「説明なし」（null）として保存する */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
