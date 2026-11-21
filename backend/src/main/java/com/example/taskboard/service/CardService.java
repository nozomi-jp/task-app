package com.example.taskboard.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.CreateCardRequest;
import com.example.taskboard.entity.Card;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

/**
 * カードについての処理。
 */
@Service
public class CardService {

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
        if (!taskListRepository.existsById(listId)) {
            throw new NotFoundException("リストが見つかりません（ID " + listId + "）");
        }
        int position = cardRepository.findMaxPositionByListId(listId) + 1;
        Card card = new Card(listId, request.text(), blankToNull(request.description()), request.dueDate(),
                request.priority(), position);
        return CardResponse.from(cardRepository.save(card));
    }

    /** 空、または空白だけの説明は「説明なし」（null）として保存する */
    private static String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }
}
