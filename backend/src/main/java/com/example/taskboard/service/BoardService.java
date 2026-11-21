package com.example.taskboard.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.BoardResponse;
import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.BoardResponse.ListResponse;
import com.example.taskboard.entity.Card;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

/**
 * ボード（リストとカード）についての処理。
 */
@Service
public class BoardService {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public BoardService(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    /**
     * ボード全体を読み込む（API-01）。リストもカードも並び順どおりに並べる。
     * データベースへの問い合わせは2回だけ（リスト全部・カード全部）。
     * リストごとにカードを問い合わせると、リストの数だけ問い合わせが増えて遅くなるため。
     */
    @Transactional(readOnly = true)
    public BoardResponse getBoard() {
        // カードを「リストのID → そのリストのカード（並び順どおり）」に振り分ける
        Map<Long, List<CardResponse>> cardsByListId = cardRepository.findAllByOrderByListIdAscPositionAsc()
                .stream()
                .collect(Collectors.groupingBy(
                        Card::getListId,
                        Collectors.mapping(
                                card -> new CardResponse(card.getId(), card.getText(), card.getDueDate(),
                                        card.getPriority()),
                                Collectors.toList())));

        List<ListResponse> lists = taskListRepository.findAllByOrderByPositionAsc()
                .stream()
                .map(list -> new ListResponse(
                        list.getId(),
                        list.getTitle(),
                        cardsByListId.getOrDefault(list.getId(), List.of())))
                .toList();

        return new BoardResponse(lists);
    }
}
