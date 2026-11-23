package com.example.taskboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.BoardResponse.ListResponse;
import com.example.taskboard.dto.ListTitleRequest;
import com.example.taskboard.service.ListService;

import jakarta.validation.Valid;

/**
 * リストについての API の受付。
 */
@RestController
@RequestMapping("/api/lists")
public class ListController {

    private final ListService listService;

    public ListController(ListService listService) {
        this.listService = listService;
    }

    /**
     * API-02：リストを一番最後（右）に追加する。
     * 成功したら 201（Created：作成した）と、追加したリスト（カードは0枚）を返す。
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ListResponse createList(@Valid @RequestBody ListTitleRequest request) {
        return listService.createList(request);
    }

    /**
     * API-03：リストの名前を変える。
     * 成功したら 200 と、変えたあとのリスト（カードを並び順どおりに含む）を返す。
     */
    @PatchMapping("/{listId}")
    public ListResponse renameList(@PathVariable Long listId, @Valid @RequestBody ListTitleRequest request) {
        return listService.renameList(listId, request);
    }
}
