package com.example.taskboard.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * API-05 POST /api/lists/{id}/cards で送られてくるデータの形。
 * 例：{"text": "買い物", "description": "牛乳と卵", "priority": "medium", "dueDate": "2026-11-25", "label": "green"}
 * text 以外は省略してよい（null）。
 * position は、リストの上から何番目に入れるか（0始まり）。省略すると一番下。消したカードを元の場所に戻すときに使う（F-14）。
 * 入力のルール（要件定義書 6.1）は画面でもチェックするが、API を直接呼ばれても守れるように、ここでもチェックする（NFR-22）。
 * dueDate に存在しない日付（2026-02-30 など）が来たときは、JSON を読む段階で 400 になる。
 */
public record CreateCardRequest(
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

        @Min(value = 0, message = "カードの位置は0以上にしてください")
        Integer position) {
}
