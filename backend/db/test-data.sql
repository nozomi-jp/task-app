-- 動作確認用のテストデータ（カード）
-- Flyway では実行しない（アプリを起動しても入らない）。必要なときに手で入れる。
--
-- 入れ方（リポジトリのフォルダで、コマンドプロンプトか Git Bash で実行する。
--         PowerShell では「<」が使えないため）：
--   docker compose exec -T db psql -U taskboard -d taskboard -f - < backend/db/test-data.sql
--
-- 注意：最初に cards テーブルのカードを全部消してから入れ直す。
--       何度実行しても同じ状態になるが、自分で作ったカードも消える。

BEGIN;

DELETE FROM cards;

-- リストの ID は環境によって違うことがあるので、リスト名から探す。
-- 並び順（position）が正しく使われているか確かめるため、わざと順番を入れ替えて入れている。
-- 説明（description）は v2.9 で足した列。あるカードとないカードを混ぜている。
INSERT INTO cards (list_id, text, description, due_date, priority, position) VALUES
    ((SELECT id FROM lists WHERE title = 'ToDo'),  '画面を作る',            NULL,                               NULL,         NULL,     2),
    ((SELECT id FROM lists WHERE title = 'ToDo'),  '要件定義を書く',        '機能・画面・APIを決める',          '2026-11-25', 'high',   0),
    ((SELECT id FROM lists WHERE title = 'ToDo'),  'テストデータを考える',  NULL,                               '2026-11-28', 'low',    1),
    ((SELECT id FROM lists WHERE title = '進行中'), '読み取りAPIを作る',     'GET /api/board でボード全体を返す', '2026-11-22', 'medium', 1),
    ((SELECT id FROM lists WHERE title = '進行中'), 'PostgreSQL の環境構築', E'Docker で動かす\ncompose.yaml に設定を書く', NULL, 'high', 0),
    ((SELECT id FROM lists WHERE title = '完了'),  'GitHub の開発ルールを決める', NULL,                         '2026-11-21', NULL,     0);

COMMIT;

-- 入ったか確かめる
SELECT l.title AS list, c.position, c.text, replace(c.description, E'\n', ' / ') AS description, c.due_date, c.priority
FROM cards c JOIN lists l ON l.id = c.list_id
ORDER BY l.position, c.position;
