package com.example.taskboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.CreateCardRequest;
import com.example.taskboard.service.CardService;

import jakarta.validation.Valid;

/**
 * カードについての API の受付。
 */
@RestController
@RequestMapping("/api")
public class CardController {

    private final CardService cardService;

    public CardController(CardService cardService) {
        this.cardService = cardService;
    }

    /**
     * API-05：カードをリストの一番下に追加する。
     * 登録（新しく作る）なので POST を使い、成功したら 201（Created：作成した）と、追加したカードを返す。
     * {@code @Valid} で CreateCardRequest のチェック（タイトルの空欄・200文字・改行、説明の1000文字、優先度の値）を行い、
     * 違反していれば 400 になる。
     */
    @PostMapping("/lists/{listId}/cards")
    @ResponseStatus(HttpStatus.CREATED)
    public CardResponse createCard(@PathVariable Long listId, @Valid @RequestBody CreateCardRequest request) {
        return cardService.createCard(listId, request);
    }
}
