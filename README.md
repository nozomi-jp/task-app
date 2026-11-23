# タスク管理アプリ（task-app）

リストとカードでタスクを管理する、Trello 風のシンプルな Web アプリです。自分ひとりが、自分のパソコンの中だけで使います（ログイン・共有・インターネットへの公開はしません）。

ボードは1枚。「ToDo」「進行中」「完了」などのリストを横に並べ、その中にカード（タスク）を並べます。カードには期限と優先度を付けられます。

> 講座の課題として作っています。発注者と開発者を自分ひとりで兼ねています。

## いまできていること

| 部分 | 状態 |
| --- | --- |
| データベース（PostgreSQL） | ✅ Docker で動く。テーブル（`lists`・`cards`）と最初の3つのリストを自動で作る |
| バックエンド（API） | ✅ `GET /api/board` でボード全体を返す（検索）<br>✅ `POST /api/lists/{id}/cards` でカード（タイトル・説明・優先度・期限・ラベル）をリストの一番下に追加する（登録）。ルールに合わない値は 400、ないリストは 404<br>✅ `PATCH /api/cards/{id}` でカードの内容を、`PUT /api/cards/{id}/position` でカードの場所（ステータス・並び順）を変える（更新）<br>✅ `DELETE /api/cards/{id}` でカードを消す（削除。データベースから行ごとなくなる）<br>✅ `POST /api/lists/{id}/sort` でリストの中のカードを並べ替える |
| 画面 | ✅ ボードを表示する。期限・優先度の印に色が付く<br>✅ 「+ カードを追加」でダイアログを開き、タイトル・説明・優先度・期限日・ラベルを入力してカードを登録できる（「保存」かタイトルの欄で Enter）<br>✅ カードをクリックすると詳細画面が開き、内容・ステータス・優先度・期限を変えられる<br>✅ カードをつかんで、別のリストへ移したり（ステータスの更新）、同じリストの中で並べ替えたりできる<br>✅ カードにマウスを乗せると出る「×」で、カードを削除できる。左下の「元に戻す」か Ctrl + Z で戻せる<br>✅ リスト名の右の「期限 ⇅」「優先度 ⇅」で、カードを期限順・優先度順に並べ替えられる（もう一度押すと反対の順）<br>✅ 上の検索の欄（Ctrl + F）で、タイトル・説明からカードを探せる<br>✅ カードにラベル（6色）を付け、色の丸のボタンで絞り込める<br>保存に失敗したら右上に赤い字で理由を出す |
| リストの追加・名前変更・削除 | 作らない（今後の拡張案。[要件定義書 ⑦ の 19章](docs/requirements/07-plan.md)） |

全部で作る機能（13機能）と完成の基準は、[要件定義書](docs/requirements/README.md)にあります。

## 技術スタック

| 部分 | 使っているもの |
| --- | --- |
| 画面 | React 19.3 ＋ TypeScript 7.0、Vite 8.3（Node.js 26）、ドラッグ&ドロップは dnd-kit |
| バックエンド | Java 25 ＋ Spring Boot 4.1（Maven、Spring Data JPA、Flyway） |
| データベース | PostgreSQL 18（Docker Desktop で動かす） |

ライブラリごとのくわしい版と、選んだ理由は [要件定義書 ⑤ の 13章](docs/requirements/05-nfr-operations-tech.md) にあります。

```
ふだん使うとき
  ブラウザ ──→ バックエンド（Spring Boot） http://localhost:8080 ──→ PostgreSQL（Docker） 5432
                 ビルドした画面も一緒に配る

開発中
  ブラウザ ──→ 画面の開発サーバー（Vite） http://localhost:5173
                 │  /api で始まる依頼はバックエンドへ中継する
                 ↓
               バックエンド（Spring Boot） http://localhost:8080 ──→ PostgreSQL（Docker） 5432
```

## 最初の準備（1回だけ）

1. **ソフトを入れる**：JDK 25（Eclipse Temurin）、Node.js 26（LTS）、Docker Desktop、VS Code
2. **データベースのパスワードを決める**：自分で決めたパスワードを、Windows のユーザー環境変数 `TASKBOARD_DB_PASSWORD` に入れる。設定したら VS Code を開き直す。パスワードはファイルには書かない（Git に入れないため）
3. **データベースを作る**：リポジトリのフォルダで
   ```
   docker compose up -d
   ```
4. **画面のライブラリを入れて、ビルドする**（ブラウザ用の完成品を作る）：`frontend` フォルダで、1行ずつ
   ```
   npm.cmd install
   ```
   ```
   npm.cmd run build
   ```

テーブルは、バックエンドを最初に起動したときに自動で作られます。

## 起動と停止（ふだん使うとき）

使うターミナルは1つです。VS Code の上のメニュー → **ターミナル → 新しいターミナル** で開きます。

```
cd backend
```
```
.mvnw.cmd spring-boot:run
```

`Started TaskboardApplication` と出たら、ブラウザで http://localhost:8080 を開きます。止めるときは **Ctrl + C**（`Y` → Enter も）。

画面のプログラムを変えたときは、`frontend` フォルダで `npm.cmd run build` をしてから、バックエンドを起動し直します。

## 起動と停止（開発中）

画面を書き換えるとすぐ反映される、開発用の動かし方です。

ターミナルを2つ使います。VS Code の上のメニュー → **ターミナル → 新しいターミナル** で開きます。

**ターミナル1：バックエンド**

```
cd backend
```
```
.\mvnw.cmd spring-boot:run
```

`Started TaskboardApplication` と出たら起動できています。

**ターミナル2：画面**

```
cd frontend
```
```
npm.cmd run dev
```

`Local: http://localhost:5173/` と出たら、ブラウザで http://localhost:5173 を開きます。

**止めるとき**：それぞれのターミナルで **Ctrl + C**（バックエンドは `Y` → Enter も）。データベース（Docker）は止めなくて大丈夫です。

### 注意

- **PowerShell では `npm` ではなく `npm.cmd` と打ちます。** Windows の PowerShell は、最初の設定だと `npm` を止めてしまうためです
- **ポートは必ずバックエンド 8080、画面 5173 を使います。** 「Port 8080（または 5173）is already in use」と出たら、前に起動したサーバーが残っています。そのターミナルで Ctrl + C を押してから、もう一度起動してください。別のポートで起動してはいけません
- データベースのデータを見たいときは、pgAdmin で `localhost:5432` の `taskboard` に接続します
- テストデータ（カード6件）を入れたいときは [backend/db/test-data.sql](backend/db/test-data.sql) の先頭の手順に従います（今あるカードは消えます）

困ったときは [要件定義書 ⑤ の 12.5「障害時の対応」](docs/requirements/05-nfr-operations-tech.md) を見てください。

## 自動チェック（書き方・バグ）

| 部分 | フォルダ | コマンド |
| --- | --- | --- |
| 画面（oxlint） | `frontend` | `npm.cmd run lint` |
| バックエンド（Checkstyle・SpotBugs） | `backend` | `.\mvnw.cmd compile checkstyle:check spotbugs:check` |

## フォルダの構成

```
（リポジトリ）
├── README.md            このファイル
├── CLAUDE.md            Claude Code が守る開発ルール
├── compose.yaml         データベース（PostgreSQL）を Docker で動かす設定
├── docs/requirements/   要件定義書
├── prototype/           画面の試作品（見た目の参考。アプリ本体では使わない）
├── frontend/            画面（React ＋ TypeScript）
│   └── src/             App.tsx（ボード画面全体）、components/（部品）、api/（API を呼ぶ処理）、types.ts（データの形）
├── backend/             バックエンド（Spring Boot）
│   ├── db/test-data.sql 動作確認用のテストデータ
│   └── src/main/        controller/・service/・repository/・entity/・dto/、resources/db/migration/（テーブルを作る SQL）
├── .claude/             Claude Code の設定（フック・スキル）
└── .github/             イシュー・プルリクエストのテンプレート
```

## 文書

| 文書 | 内容 |
| --- | --- |
| [要件定義書](docs/requirements/README.md) | 何を作るか、画面・API・データベースの設計、運用、技術の選定、受入テスト、開発の計画 |
| [CLAUDE.md](CLAUDE.md) | 開発ルール（イシュー → ブランチ → プルリクエスト、サーバーのポートの決まり） |
| [frontend/README.md](frontend/README.md) | 画面のコマンドとファイルの説明 |
| [.claude/skills/start-servers/SKILL.md](.claude/skills/start-servers/SKILL.md) | サーバーを決まったポートで起動して確認する手順（Claude Code のスキル） |

## 開発の進め方

1. 作業は GitHub の**イシュー**から始める
2. 最新の main から**ブランチ**を作る（例：`feature/5-card-crud`）
3. 作業してコミットし、**プルリクエスト**を出す
4. 発注者が確認して「マージしてOK」と言ったら、main にマージする

main へ直接 push することはできません（GitHub の設定と Claude Code のフックで止めています）。くわしくは [CLAUDE.md](CLAUDE.md) にあります。
