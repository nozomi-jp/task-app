package com.example.taskboard.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.taskboard.dto.BoardResponse.ListResponse;
import com.example.taskboard.dto.ListTitleRequest;
import com.example.taskboard.entity.TaskList;
import com.example.taskboard.repository.TaskListRepository;

/**
 * リストについての処理。
 */
@Service
public class ListService {

    private final TaskListRepository taskListRepository;

    public ListService(TaskListRepository taskListRepository) {
        this.taskListRepository = taskListRepository;
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
}
