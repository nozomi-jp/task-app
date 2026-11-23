package com.example.taskboard.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * API-06 PATCH /api/cards/{id} で送られてくるデータの形（詳細画面の「保存」）。
 * 例：{"text": "買い物", "description": null, "priority": "high", "dueDate": "2026-11-25", "label": "green",
 * "listId": 2}
 * 詳細画面は、内容の5つの項目とステータス（listId）をまとめて送る。description・priority・dueDate・label を null（または省略）にすると「なし」にする。
 * listId は、移す先のリスト。null（または省略）、今と同じリストなら、場所は変えない。
 * ルールは登録（CreateCardRequest）と同じ（要件定義書 6.1、NFR-22）。
 */
public record UpdateCardRequest(
        @NotBlank(message = "カードの内容を入力してください")
        @Size(max = 200, message = "カードは200文字以内で入力してください")
        @Pattern(regexp = "[^\\r\\n]*", message = "カードに改行は入れられません")
        String text,

        @Size(max = 1000, message = "説明は1000文字以内で入力してください")
        String description,

        @Pattern(regexp = "high|medium|low", message = "優先度は high・medium・low のどれかにしてください")
        String priority,

        LocalDate dueDate,

        @Pattern(regexp = "green|sky|blue|purple|pink|gray",
                message = "ラベルは green・sky・blue・purple・pink・gray のどれかにしてください")
        String label,

        Long listId) {
}
