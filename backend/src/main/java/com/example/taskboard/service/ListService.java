package com.example.taskboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.BoardResponse.ListResponse;
import com.example.taskboard.dto.ListTitleRequest;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.repository.CardRepository;
import com.example.taskboard.repository.TaskListRepository;

/**
 * リストについての処理。
 */
@Service
public class ListService {

    private final TaskListRepository taskListRepository;
    private final CardRepository cardRepository;

    public ListService(TaskListRepository taskListRepository, CardRepository cardRepository) {
        this.taskListRepository = taskListRepository;
        this.cardRepository = cardRepository;
    }

    /**
     * リストを一番最後（右）に追加する（F-02、API-02）。
     * 「一番最後の位置を調べる」と「保存する」を1つのトランザクションで行う。
     */
    @Transactional
    public ListResponse createList(ListTitleRequest request) {
        int position = taskListRepository.findMaxPosition() + 1;
        TaskList list = taskListRepository.save(new TaskList(request.title(), position));
        return new ListResponse(list.getId(), list.getTitle(), List.of());
    }

    /**
     * リストの名前を変える（F-03、API-03）。中のカードと場所は変わらない。
     *
     * @throws NotFoundException リストがないとき
     */
    @Transactional
    public ListResponse renameList(Long listId, ListTitleRequest request) {
        TaskList list = findList(listId);
        list.rename(request.title());
        List<CardResponse> cards = cardRepository.findByListIdOrderByPositionAsc(listId).stream()
                .map(CardResponse::from)
                .toList();
        return new ListResponse(list.getId(), list.getTitle(), cards);
    }

    /**
     * リストを削除する（F-04、API-04）。物理削除。中のカードも、データベースが一緒に消す（ON DELETE CASCADE）。
     * 残ったリストの並び順にすき間ができないよう、0 から振り直す。まとめて1つのトランザクションで行う。
     *
     * @throws NotFoundException リストがないとき
     */
    @Transactional
    public void deleteList(Long listId) {
        TaskList list = findList(listId);
        taskListRepository.delete(list);
        List<TaskList> rest = taskListRepository.findAllByOrderByPositionAsc().stream()
                .filter(l -> !l.getId().equals(listId))
                .toList();
        for (int i = 0; i < rest.size(); i++) {
            rest.get(i).setPosition(i);
        }
    }

    private TaskList findList(Long listId) {
        return taskListRepository.findById(listId)
                .orElseThrow(() -> new NotFoundException("リストが見つかりません（ID " + listId + "）"));
    }
}
