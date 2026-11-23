package com.example.taskboard.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

/**
 * API-09 POST /api/lists/{id}/sort で送られてくるデータの形（F-13 並べ替え）。
 * 例：{"by": "dueDate", "reverse": false}
 *
 * @param by      何の順に並べるか。dueDate（期限）か priority（優先度）
 * @param reverse false（または省略）なら期限が近い順・優先度が高い順、true ならその反対
 */
public record SortCardsRequest(
        @NotNull(message = "並べ替えの種類を指定してください")
        @Pattern(regexp = "dueDate|priority", message = "並べ替えの種類は dueDate・priority のどちらかにしてください")
        String by,

        Boolean reverse) {
}
