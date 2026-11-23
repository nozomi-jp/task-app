package com.example.taskboard;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

/**
 * API のテストの土台。
 * - つなぐデータベースは、いつも taskboard_test（properties に書くと、環境変数 SPRING_DATASOURCE_URL よりも優先される）。
 *   ふだんのデータベース taskboard を消さないように、違うデータベースなら、何もせずに止める
 * - テストの前に、カードを0枚、リストを「ToDo」「進行中」「完了」の3つに戻す
 * - サーバー（8080）は起動しない。MockMvc が、HTTP の依頼が来たのと同じように Controller を呼ぶ
 */
@SpringBootTest(properties = "spring.datasource.url=jdbc:postgresql://localhost:5432/" + ApiTestBase.TEST_DATABASE)
@AutoConfigureMockMvc
abstract class ApiTestBase {

    static final String TEST_DATABASE = "taskboard_test";

    @Autowired
    private MockMvc mvc;

    @Autowired
    private JdbcTemplate jdbc;

    /** 「ToDo」「進行中」「完了」の ID */
    protected long todo;
    protected long doing;
    protected long done;

    @BeforeEach
    void resetTestDatabase() {
        String database = jdbc.queryForObject("SELECT current_database()", String.class);
        if (!TEST_DATABASE.equals(database)) {
            throw new IllegalStateException("テスト専用のデータベースではないので止めました：" + database);
        }
        jdbc.update("DELETE FROM cards");
        jdbc.update("DELETE FROM lists");
        todo = insertList("ToDo", 0);
        doing = insertList("進行中", 1);
        done = insertList("完了", 2);
    }

    /** API を呼ぶ。body が null なら何も送らない */
    protected ResultActions call(HttpMethod method, String url, String body) throws Exception {
        var request = MockMvcRequestBuilders.request(method, url);
        if (body != null) {
            request.contentType(MediaType.APPLICATION_JSON).content(body);
        }
        return mvc.perform(request);
    }

    protected ResultActions get(String url) throws Exception {
        return call(HttpMethod.GET, url, null);
    }

    protected ResultActions post(String url, String body) throws Exception {
        return call(HttpMethod.POST, url, body);
    }

    protected ResultActions patch(String url, String body) throws Exception {
        return call(HttpMethod.PATCH, url, body);
    }

    protected ResultActions put(String url, String body) throws Exception {
        return call(HttpMethod.PUT, url, body);
    }

    protected ResultActions delete(String url) throws Exception {
        return call(HttpMethod.DELETE, url, null);
    }

    protected long insertList(String title, int position) {
        return jdbc.queryForObject("INSERT INTO lists (title, position) VALUES (?, ?) RETURNING id", Long.class, title,
                position);
    }

    /** カードを、リストの一番下に直接入れる（テストの準備） */
    protected long insertCard(long listId, String text) {
        return insertCard(listId, text, null, null);
    }

    protected long insertCard(long listId, String text, String dueDate, String priority) {
        return jdbc.queryForObject("""
                INSERT INTO cards (list_id, text, due_date, priority, position)
                VALUES (?, ?, ?::date, ?, (SELECT count(*) FROM cards WHERE list_id = ?))
                RETURNING id""", Long.class, listId, text, dueDate, priority, listId);
    }

    /** リストの中のカードのタイトル（並び順どおり）。並び順が 0, 1, 2, … でなければ、番号も付けて返す */
    protected List<String> cards(long listId) {
        return jdbc.query("SELECT text, position FROM cards WHERE list_id = ? ORDER BY position", (rs, row) -> {
            String text = rs.getString("text");
            return rs.getInt("position") == row ? text : text + "(position " + rs.getInt("position") + ")";
        }, listId);
    }

    /** リストの名前（並び順どおり）。並び順が 0, 1, 2, … でなければ、番号も付けて返す */
    protected List<String> lists() {
        return jdbc.query("SELECT title, position FROM lists ORDER BY position", (rs, row) -> {
            String title = rs.getString("title");
            return rs.getInt("position") == row ? title : title + "(position " + rs.getInt("position") + ")";
        });
    }

    /** カードの1つの列の値（文字にしたもの）。空なら null */
    protected String column(String table, long id, String column) {
        return jdbc.queryForObject("SELECT " + column + "::text FROM " + table + " WHERE id = ?", String.class, id);
    }

    protected int count(String table) {
        return jdbc.queryForObject("SELECT count(*) FROM " + table, Integer.class);
    }
}
