package com.example.taskboard.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.BoardResponse.CardResponse;
import com.example.taskboard.dto.CreateCardRequest;
import com.example.taskboard.dto.MoveCardRequest;
import com.example.taskboard.dto.UpdateCardRequest;
import com.example.taskboard.service.CardService;

import jakarta.validation.Valid;

/**
 * カードについての API の受付。
 * 検索は GET、登録は POST、更新は PATCH（中身の一部を変える）・PUT（位置を置き換える）を使う。
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

    /**
     * API-06：カードの内容（タイトル・説明・期限・優先度）を更新する（詳細画面の「保存」）。
     * 成功したら 200 と、更新したあとのカードを返す。
     */
    @PatchMapping("/cards/{cardId}")
    public CardResponse updateCard(@PathVariable Long cardId, @Valid @RequestBody UpdateCardRequest request) {
        return cardService.updateCard(cardId, request);
    }

    /**
     * API-08：カードを別のリスト・別の位置へ移す（ステータスの変更、ドラッグ＆ドロップの移動・並べ替え）。
     * 成功したら 200 と、移したあとのカードを返す。
     */
    @PutMapping("/cards/{cardId}/position")
    public CardResponse moveCard(@PathVariable Long cardId, @Valid @RequestBody MoveCardRequest request) {
        return cardService.moveCard(cardId, request.listId(), request.position());
    }
}
