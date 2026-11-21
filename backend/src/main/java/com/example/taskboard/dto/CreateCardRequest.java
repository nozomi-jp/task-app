package com.example.taskboard.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * API-05 POST /api/lists/{id}/cards で送られてくるデータの形。例：{"text": "買い物"}
 * 入力のルール（要件定義書 6.1）は画面でもチェックするが、API を直接呼ばれても守れるように、ここでもチェックする（NFR-22）。
 */
public record CreateCardRequest(
        @NotBlank(message = "カードの内容を入力してください")
        @Size(max = 200, message = "カードは200文字以内で入力してください")
        @Pattern(regexp = "[^\\r\\n]*", message = "カードに改行は入れられません")
        String text) {
}
