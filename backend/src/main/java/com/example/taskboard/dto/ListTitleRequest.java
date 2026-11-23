package com.example.taskboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * API-02 POST /api/lists・API-03 PATCH /api/lists/{id} で送られてくるデータの形（リストの名前）。
 * 例：{"title": "保留"}
 * 入力のルール（要件定義書 6.1）は画面でもチェックするが、API を直接呼ばれても守れるように、ここでもチェックする（NFR-22）。
 */
public record ListTitleRequest(
        @NotBlank(message = "リスト名を入力してください")
        @Size(max = 20, message = "リスト名は20文字以内で入力してください")
        @Pattern(regexp = "[^\\r\\n]*", message = "リスト名に改行は入れられません")
        String title) {
}
