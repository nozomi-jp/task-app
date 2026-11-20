-- リストとカードのテーブルを作る（要件定義書 9.2）

CREATE TABLE lists (
    id         bigint      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title      varchar(20) NOT NULL CHECK (title <> ''),
    position   integer     NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE cards (
    id         bigint       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    -- リストを削除すると、中のカードも一緒に削除する（F-04）
    list_id    bigint       NOT NULL REFERENCES lists (id) ON DELETE CASCADE,
    text       varchar(200) NOT NULL CHECK (text <> ''),
    due_date   date,
    priority   varchar(6)   CHECK (priority IN ('high', 'medium', 'low')),
    position   integer      NOT NULL,
    created_at timestamptz  NOT NULL DEFAULT now(),
    updated_at timestamptz  NOT NULL DEFAULT now()
);

-- あるリストのカードを並び順に取り出す処理を速くする
CREATE INDEX idx_cards_list_id_position ON cards (list_id, position);
