package com.example.taskboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** カードの API（API-05〜09）のテスト */
class CardApiTest extends ApiTestBase {

    // ----- API-05 登録 -----

    @Test
    @DisplayName("登録：一番下に追加され、送った内容が保存される（201）")
    void createCard() throws Exception {
        insertCard(todo, "先にあるカード");
        post("/api/lists/" + todo + "/cards", """
                {"text": "買い物", "description": "牛乳\\n卵", "priority": "high", "dueDate": "2026-11-25", "label": "green"}""")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.text").value("買い物"))
                .andExpect(jsonPath("$.description").value("牛乳\n卵"))
                .andExpect(jsonPath("$.priority").value("high"))
                .andExpect(jsonPath("$.dueDate").value("2026-11-25"))
                .andExpect(jsonPath("$.label").value("green"));
        assertThat(cards(todo)).containsExactly("先にあるカード", "買い物");
    }

    @Test
    @DisplayName("登録：タイトルだけでよい。空白だけの説明は、説明なしになる")
    void createCardWithTitleOnly() throws Exception {
        post("/api/lists/" + todo + "/cards", """
                {"text": "a", "description": "  "}""")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value(nullValue()))
                .andExpect(jsonPath("$.priority").value(nullValue()))
                .andExpect(jsonPath("$.dueDate").value(nullValue()))
                .andExpect(jsonPath("$.label").value(nullValue()));
    }

    @Test
    @DisplayName("登録：位置を送ると、その場所に入る（元に戻す）。大きすぎれば一番下")
    void createCardAtPosition() throws Exception {
        insertCard(todo, "a");
        insertCard(todo, "b");
        post("/api/lists/" + todo + "/cards", "{\"text\": \"x\", \"position\": 1}").andExpect(status().isCreated());
        post("/api/lists/" + todo + "/cards", "{\"text\": \"y\", \"position\": 99}").andExpect(status().isCreated());
        assertThat(cards(todo)).containsExactly("a", "x", "b", "y");
    }

    @ParameterizedTest(name = "{0}")
    @ValueSource(strings = {
        "{}",
        "{\"text\": \"\"}",
        "{\"text\": \"   \"}",
        "{\"text\": \"a\\nb\"}",
        "{\"text\": \"a\", \"priority\": \"urgent\"}",
        "{\"text\": \"a\", \"dueDate\": \"2026-02-30\"}",
        "{\"text\": \"a\", \"label\": \"red\"}",
        "{\"text\": \"a\", \"position\": -1}",
        "JSON ではない"
    })
    @DisplayName("登録：ルールに合わないデータは 400 で、入らない")
    void createInvalidCard(String body) throws Exception {
        post("/api/lists/" + todo + "/cards", body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").isNotEmpty());
        assertThat(count("cards")).isZero();
    }

    @Test
    @DisplayName("登録：タイトルは200文字、説明は1000文字まで")
    void createCardLength() throws Exception {
        String url = "/api/lists/" + todo + "/cards";
        String ok = "{\"text\": \"%s\", \"description\": \"%s\"}".formatted("あ".repeat(200), "あ".repeat(1000));
        post(url, ok).andExpect(status().isCreated());
        post(url, "{\"text\": \"%s\"}".formatted("あ".repeat(201))).andExpect(status().isBadRequest());
        post(url, "{\"text\": \"a\", \"description\": \"%s\"}".formatted("あ".repeat(1001)))
                .andExpect(status().isBadRequest());
        assertThat(count("cards")).isEqualTo(1);
    }

    @Test
    @DisplayName("登録：ないリストは 404")
    void createCardInMissingList() throws Exception {
        post("/api/lists/99999999/cards", "{\"text\": \"a\"}").andExpect(status().isNotFound());
        assertThat(count("cards")).isZero();
    }

    @Test
    @DisplayName("登録：SQL のような文字も、文字のまま保存される（NFR-23）")
    void createCardWithSql() throws Exception {
        post("/api/lists/" + todo + "/cards", "{\"text\": \"'); DROP TABLE cards; --\"}").andExpect(status().isCreated());
        assertThat(cards(todo)).containsExactly("'); DROP TABLE cards; --");
    }

    // ----- API-06 更新 -----

    @Test
    @DisplayName("更新：内容が変わり、updated_at が新しくなる。場所はそのまま")
    void updateCard() throws Exception {
        long id = insertCard(todo, "a", "2026-11-01", "low");
        insertCard(todo, "b");
        String before = column("cards", id, "updated_at");
        patch("/api/cards/" + id, "{\"text\": \"A\", \"label\": \"pink\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.text").value("A"))
                .andExpect(jsonPath("$.label").value("pink"))
                .andExpect(jsonPath("$.priority").value(nullValue()))
                .andExpect(jsonPath("$.dueDate").value(nullValue()));
        assertThat(cards(todo)).containsExactly("A", "b");
        assertThat(column("cards", id, "updated_at")).isNotEqualTo(before);
    }

    @Test
    @DisplayName("更新：ステータスを変えると、そのリストの一番下へ移る")
    void updateCardAndMove() throws Exception {
        long id = insertCard(todo, "a");
        insertCard(todo, "b");
        insertCard(doing, "c");
        patch("/api/cards/" + id, "{\"text\": \"A\", \"listId\": %d}".formatted(doing)).andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("b");
        assertThat(cards(doing)).containsExactly("c", "A");
    }

    @Test
    @DisplayName("更新：移す先のリストがなければ 404 で、内容も変わらない（片方だけ保存されない）")
    void updateCardToMissingList() throws Exception {
        long id = insertCard(todo, "a");
        patch("/api/cards/" + id, "{\"text\": \"A\", \"listId\": 99999999}").andExpect(status().isNotFound());
        assertThat(cards(todo)).containsExactly("a");
    }

    @Test
    @DisplayName("更新：ルールに合わなければ 400、ないカードは 404")
    void updateInvalidCard() throws Exception {
        long id = insertCard(todo, "a");
        patch("/api/cards/" + id, "{\"text\": \" \"}").andExpect(status().isBadRequest());
        patch("/api/cards/" + id, "{\"text\": \"A\", \"label\": \"GREEN\"}").andExpect(status().isBadRequest());
        patch("/api/cards/99999999", "{\"text\": \"A\"}").andExpect(status().isNotFound());
        assertThat(cards(todo)).containsExactly("a");
    }

    // ----- API-07 削除 -----

    @Test
    @DisplayName("削除：行ごとなくなり、残りの並び順が詰まる（204）。もう一度消すと 404")
    void deleteCard() throws Exception {
        insertCard(todo, "a");
        long id = insertCard(todo, "b");
        insertCard(todo, "c");
        delete("/api/cards/" + id).andExpect(status().isNoContent());
        assertThat(cards(todo)).containsExactly("a", "c");
        delete("/api/cards/" + id).andExpect(status().isNotFound());
    }

    // ----- API-08 移動 -----

    @Test
    @DisplayName("移動：別のリストの間に入り、両方の並び順が詰まる")
    void moveCardToAnotherList() throws Exception {
        insertCard(todo, "a");
        long id = insertCard(todo, "b");
        insertCard(todo, "c");
        insertCard(doing, "d");
        insertCard(doing, "e");
        put("/api/cards/" + id + "/position", "{\"listId\": %d, \"position\": 1}".formatted(doing))
                .andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("a", "c");
        assertThat(cards(doing)).containsExactly("d", "b", "e");
    }

    @Test
    @DisplayName("移動：同じリストの中で並べ替える。空のリストにも入る。大きすぎる位置は一番下")
    void moveCardInSameList() throws Exception {
        insertCard(todo, "a");
        insertCard(todo, "b");
        long id = insertCard(todo, "c");
        String url = "/api/cards/" + id + "/position";
        put(url, "{\"listId\": %d, \"position\": 0}".formatted(todo)).andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("c", "a", "b");
        put(url, "{\"listId\": %d, \"position\": 99}".formatted(todo)).andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("a", "b", "c");
        put(url, "{\"listId\": %d, \"position\": 0}".formatted(done)).andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("a", "b");
        assertThat(cards(done)).containsExactly("c");
    }

    @Test
    @DisplayName("移動：位置なし・マイナスは 400、ないリスト・カードは 404 で、動かない")
    void moveInvalidCard() throws Exception {
        long id = insertCard(todo, "a");
        String url = "/api/cards/" + id + "/position";
        put(url, "{\"listId\": %d}".formatted(doing)).andExpect(status().isBadRequest());
        put(url, "{\"listId\": %d, \"position\": -1}".formatted(doing)).andExpect(status().isBadRequest());
        put(url, "{\"listId\": 99999999, \"position\": 0}").andExpect(status().isNotFound());
        put("/api/cards/99999999/position", "{\"listId\": %d, \"position\": 0}".formatted(doing))
                .andExpect(status().isNotFound());
        assertThat(cards(todo)).containsExactly("a");
    }

    // ----- API-09 並べ替え -----

    @Test
    @DisplayName("並べ替え：期限。なしはどちらの向きでも一番下、同じ期限は今の順番のまま")
    void sortByDueDate() throws Exception {
        insertCard(todo, "30日a", "2026-11-30", null);
        insertCard(todo, "なし", null, null);
        insertCard(todo, "20日", "2026-11-20", null);
        insertCard(todo, "30日b", "2026-11-30", null);
        post("/api/lists/" + todo + "/sort", "{\"by\": \"dueDate\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.cards[0].text").value("20日"));
        assertThat(cards(todo)).containsExactly("20日", "30日a", "30日b", "なし");
        post("/api/lists/" + todo + "/sort", "{\"by\": \"dueDate\", \"reverse\": true}").andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("30日a", "30日b", "20日", "なし");
    }

    @Test
    @DisplayName("並べ替え：優先度。ほかのリストは変わらない")
    void sortByPriority() throws Exception {
        insertCard(todo, "低", null, "low");
        insertCard(todo, "なし", null, null);
        insertCard(todo, "高", null, "high");
        insertCard(todo, "中", null, "medium");
        insertCard(doing, "x", null, "low");
        insertCard(doing, "y", null, "high");
        post("/api/lists/" + todo + "/sort", "{\"by\": \"priority\"}").andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("高", "中", "低", "なし");
        post("/api/lists/" + todo + "/sort", "{\"by\": \"priority\", \"reverse\": true}").andExpect(status().isOk());
        assertThat(cards(todo)).containsExactly("低", "中", "高", "なし");
        assertThat(cards(doing)).containsExactly("x", "y");
    }

    @Test
    @DisplayName("並べ替え：おかしな種類は 400、ないリストは 404")
    void sortInvalid() throws Exception {
        post("/api/lists/" + todo + "/sort", "{\"by\": \"title\"}").andExpect(status().isBadRequest());
        post("/api/lists/" + todo + "/sort", "{}").andExpect(status().isBadRequest());
        post("/api/lists/99999999/sort", "{\"by\": \"dueDate\"}").andExpect(status().isNotFound());
    }
}
