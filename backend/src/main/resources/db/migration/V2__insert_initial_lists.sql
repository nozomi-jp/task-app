-- 最初の3つのリスト（要件定義書 9.3）
-- Flyway はこのファイルを最初の1回しか実行しないので、
-- リストを全部消して再起動しても、勝手に復活しない

INSERT INTO lists (title, position) VALUES
    ('ToDo', 0),
    ('進行中', 1),
    ('完了', 2);
