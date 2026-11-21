package com.example.taskboard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * API-08 PUT /api/cards/{id}/position で送られてくるデータの形（移動・並べ替え・ステータスの変更）。
 * 例：{"listId": 2, "position": 0} … ID 2 のリストの、上から1番目（0始まり）に置く。
 * position がリストのカードの数より大きいときは、一番下に置く。
 */
public record MoveCardRequest(
        @NotNull(message = "移動先のリストを指定してください")
        Long listId,

        @NotNull(message = "移動先の位置を指定してください")
        @Min(value = 0, message = "移動先の位置は0以上にしてください")
        Integer position) {
}
