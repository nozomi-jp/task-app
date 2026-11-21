-- カードに「説明」を足す（要件定義書 v2.9、F-05 のダイアログで入力する）
-- ないときは空（NULL）。今あるカードは説明なし（NULL）のまま残る。
-- 空文字は入れず、説明がないときは NULL にする（CHECK 制約）。改行は入れてよい。

ALTER TABLE cards
    ADD COLUMN description varchar(1000) CHECK (description <> '');
