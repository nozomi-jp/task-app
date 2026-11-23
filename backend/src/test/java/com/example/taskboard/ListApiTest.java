package com.example.taskboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/** ボードとリストの API（API-01〜04）のテスト */
class ListApiTest extends ApiTestBase {

    // ----- API-01 ボード -----

    @Test
    @DisplayName("ボード：リストもカードも、並び順どおりに返る")
    void getBoard() throws Exception {
        insertCard(doing, "b", "2026-11-25", "high");
        insertCard(doing, "c");
        insertCard(todo, "a");
        get("/api/board")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lists.length()").value(3))
                .andExpect(jsonPath("$.lists[0].title").value("ToDo"))
                .andExpect(jsonPath("$.lists[0].cards[0].text").value("a"))
                .andExpect(jsonPath("$.lists[1].cards[0].text").value("b"))
                .andExpect(jsonPath("$.lists[1].cards[0].dueDate").value("2026-11-25"))
                .andExpect(jsonPath("$.lists[1].cards[0].priority").value("high"))
                .andExpect(jsonPath("$.lists[1].cards[1].text").value("c"))
                .andExpect(jsonPath("$.lists[2].cards.length()").value(0));
    }

    // ----- API-02 追加 -----

    @Test
    @DisplayName("追加：一番最後に追加される（201）。同じ名前でもよい")
    void createList() throws Exception {
        post("/api/lists", "{\"title\": \"保留\"}")
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.title").value("保留"))
                .andExpect(jsonPath("$.cards.length()").value(0));
        post("/api/lists", "{\"title\": \"保留\"}").andExpect(status().isCreated());
        assertThat(lists()).containsExactly("ToDo", "進行中", "完了", "保留", "保留");
    }

    @ParameterizedTest(name = "{0}")
    @ValueSource(strings = {
        "{}",
        "{\"title\": \"\"}",
        "{\"title\": \"  \"}",
        "{\"title\": \"a\\nb\"}",
        "{\"title\": \"あいうえおあいうえおあいうえおあいうえおあ\"}"
    })
    @DisplayName("追加・名前変更：ルールに合わない名前（21文字など）は 400 で、変わらない")
    void invalidTitle(String body) throws Exception {
        post("/api/lists", body).andExpect(status().isBadRequest()).andExpect(jsonPath("$.error").isNotEmpty());
        patch("/api/lists/" + todo, body).andExpect(status().isBadRequest());
        assertThat(lists()).containsExactly("ToDo", "進行中", "完了");
    }

    @Test
    @DisplayName("追加：20文字は入る")
    void createListWithLongestTitle() throws Exception {
        post("/api/lists", "{\"title\": \"%s\"}".formatted("あ".repeat(20))).andExpect(status().isCreated());
    }

    // ----- API-03 名前変更 -----

    @Test
    @DisplayName("名前変更：名前だけが変わり、カードと場所はそのまま。updated_at が新しくなる")
    void renameList() throws Exception {
        insertCard(doing, "a");
        String before = column("lists", doing, "updated_at");
        patch("/api/lists/" + doing, "{\"title\": \"作業中\"}")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("作業中"))
                .andExpect(jsonPath("$.cards[0].text").value("a"));
        assertThat(lists()).containsExactly("ToDo", "作業中", "完了");
        assertThat(cards(doing)).containsExactly("a");
        assertThat(column("lists", doing, "updated_at")).isNotEqualTo(before);
    }

    @Test
    @DisplayName("名前変更：ないリストは 404")
    void renameMissingList() throws Exception {
        patch("/api/lists/99999999", "{\"title\": \"a\"}").andExpect(status().isNotFound());
    }

    // ----- API-04 削除 -----

    @Test
    @DisplayName("削除：リストと中のカードが消え、ほかは残って並び順が詰まる（204）。もう一度消すと 404")
    void deleteList() throws Exception {
        insertCard(todo, "a");
        insertCard(doing, "b");
        insertCard(doing, "c");
        delete("/api/lists/" + doing).andExpect(status().isNoContent());
        assertThat(lists()).containsExactly("ToDo", "完了");
        assertThat(cards(todo)).containsExactly("a");
        assertThat(count("cards")).isEqualTo(1);
        delete("/api/lists/" + doing).andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("削除：全部消しても、またリストを追加できる")
    void deleteAllLists() throws Exception {
        delete("/api/lists/" + todo).andExpect(status().isNoContent());
        delete("/api/lists/" + doing).andExpect(status().isNoContent());
        delete("/api/lists/" + done).andExpect(status().isNoContent());
        get("/api/board").andExpect(status().isOk()).andExpect(jsonPath("$.lists.length()").value(0));
        post("/api/lists", "{\"title\": \"また作る\"}").andExpect(status().isCreated());
        assertThat(lists()).containsExactly("また作る");
    }

    // ----- そのほか -----

    @Test
    @DisplayName("URL の ID が数でなければ 400、対応していないメソッドは 405")
    void invalidRequest() throws Exception {
        delete("/api/lists/abc").andExpect(status().isBadRequest());
        put("/api/board", "{}").andExpect(status().isMethodNotAllowed());
    }
}
