-- カードに「ラベル（色）」を足す（要件定義書 v2.26、F-16）
-- 1枚に1色。ないときは空（NULL）。今あるカードはラベルなし（NULL）のまま残る。

ALTER TABLE cards
    ADD COLUMN label varchar(6) CHECK (label IN ('green', 'sky', 'blue', 'purple', 'pink', 'gray'));
