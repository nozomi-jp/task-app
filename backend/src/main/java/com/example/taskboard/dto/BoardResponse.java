package com.example.taskboard.dto;

import java.time.LocalDate;
import java.util.List;

/**
 * API-01 GET /api/board の返事の形（要件定義書 10章）。
 * record は「値を入れて運ぶだけの入れ物」。JSON に変換すると次の形になる。
 * {"lists": [{"id": 1, "title": "ToDo", "cards": [{"id": 10, "text": "...", "dueDate": null, "priority": null}]}]}
 */
public record BoardResponse(List<ListResponse> lists) {

    public record ListResponse(Long id, String title, List<CardResponse> cards) {
    }

    public record CardResponse(Long id, String text, LocalDate dueDate, String priority) {
    }
}
