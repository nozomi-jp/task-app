# 要件定義書 ⑤ 非機能要件・運用・技術選定

[← 目次・要約に戻る](README.md) ｜ 主に読む人：開発者

---

## 11. 非機能要件

機能以外の「どのくらいの品質で動くか」を決めます。分類は、現場でよく使われるIPAの「非機能要求グレード」を参考にしています。

### 11.1 一覧

| ID | 分類 | 要件 |
| --- | --- | --- |
| NFR-01 | 性能 | カードの追加・編集・削除・移動が、画面にすぐ反映される（目安：0.2秒以内。カード500枚の状態でも待たされない） |
| NFR-02 | 性能 | ページを開いてから1秒以内にボードが表示される |
| NFR-03 | 容量 | カード1,000枚まで保存できる |
| NFR-04 | 動作環境 | パソコン版の Google Chrome・Microsoft Edge の最新版で動く |
| NFR-05 | 動作環境 | 画面の幅1280px以上を基本とし、1024pxでも表示が崩れない |
| NFR-06 | 外部依存 | ライブラリ（React・dnd-kit など）はビルドしたファイルに含め、動かすときにCDNから読み込まない |
| NFR-07 | セキュリティ | 入力された文字はHTMLとして解釈させず、文字のまま表示する（XSS対策）。Reactの `{}` で表示し、`dangerouslySetInnerHTML` は使わない |
| NFR-08 | セキュリティ | データを自分のパソコンの外へ送信しない |
| NFR-09 | 使いやすさ | 説明書を読まなくても操作できる。Enterキーで確定、Escキーで取り消しができる |
| NFR-10 | 使いやすさ | キーボードで操作しているとき、今どこを操作しているか（フォーカス）が見える |
| NFR-11 | 安全性 | カードが入ったリストの削除など、影響の大きい操作の前に確認を出す |
| NFR-12 | 保守性 | 画面は「画面の部品（コンポーネント）」「データを変える処理」「APIを呼ぶ処理」を分けて書く。バックエンドは「受付（Controller）」「処理（Service）」「データベースの読み書き（Repository）」を分けて書く（13.5） |
| NFR-13 | 保守性 | 作業はすべて GitHub のイシューから始め、作業用のブランチで行い、プルリクエストで main にマージする。main へ直接 push しない。手順はリポジトリ直下の `CLAUDE.md`（開発ルール） |
| NFR-14 | 可用性 | 保存に失敗したときは、画面にメッセージを出す（7章） |
| NFR-18 | 起動方法 | PostgreSQL が動いていれば、コマンド1つでサーバーを起動でき、`http://localhost:8080` で開ける（12.2） |
| NFR-19 | データ保全 | データベースの制約（必須・文字数・CHECK・外部キー）で、ルールに合わないデータが入らないようにする（9.2） |
| NFR-20 | データ保全 | カードの移動・並べ替えによる並び順の更新は、1つのトランザクションで行う（9.4） |
| NFR-21 | セキュリティ | サーバーとデータベースは、自分のパソコンからの接続だけを受け付ける。同じWi-Fiにつながったほかの機器からは開けない（Spring Boot は `server.address=127.0.0.1`、PostgreSQL は `compose.yaml` で `127.0.0.1:5432` にだけ公開する） |
| NFR-22 | セキュリティ | 入力のチェック（文字数・空欄・日付・優先度の値）は、画面とバックエンドの両方で行う。画面のチェックは、APIを直接呼ばれると素通りされるため。バックエンドは Bean Validation（`@NotBlank`・`@Size` など）で行う |
| NFR-23 | セキュリティ | SQLは、入力された文字を直接つなげて組み立てず、プレースホルダ（値を入れる穴）を使う（SQLインジェクション対策）。Spring Data JPA を使い、自分でSQLを書くときもパラメータで値を渡す |
| NFR-24 | 運用 | 手順に沿って、データベースのバックアップと復元ができる（12.4） |
| NFR-25 | 運用 | エラーが起きたときは、サーバーの画面（ターミナル）に、いつ・何が起きたかを表示する（Spring Boot 標準のログ） |
| NFR-26 | 保守性 | データベースのパスワードやバックアップのファイルを、Gitに入れない（12.1） |
| NFR-28 | 保守性 | 使うライブラリの版を固定し、同じ手順でいつでも同じものを入れられるようにする（`package-lock.json`・`pom.xml`） |

※ NFR-15〜17・NFR-27（ブラウザ保存とフェーズ1に関するもの）は v2.0 で削除（欠番）。

### 11.2 開き方

| 開き方 | アドレス | 使う場面 |
| --- | --- | --- |
| Spring Boot から開く | `http://localhost:8080` | ふだん使うとき・受入テスト |
| Vite の開発サーバーから開く | `http://localhost:5173` | 開発中だけ（8.2） |

どちらで開いても、データは同じデータベースにあるので、同じボードが表示されます。

### 11.3 データが消える・見えなくなる場合

| 場合 | 結果 |
| --- | --- |
| 複数のタブで同時に操作した | 後から保存した内容が残り、先に保存した内容は失われることがある |
| データベースが壊れた、Docker のデータ置き場（ボリューム `taskboard-pgdata`）を消した、Docker Desktop を入れ直した | 消える。バックアップから戻す（12.4）。コンテナを消すだけ（`docker compose down`）なら消えない |

ブラウザのデータを消しても、別のブラウザで開いても、データベースにあるデータは消えません。

## 12. 運用

### 12.1 最初の準備（1回だけ）

| 順番 | やること | 内容 |
| --- | --- | --- |
| 1 | ソフトを入れる | JDK 25（Eclipse Temurin）、Node.js（LTS版）、Docker Desktop。版はQ-05で決める。データベースの中身を見るときは pgAdmin も使う（13.3） |
| 2 | パスワードを決める | データベースの `taskboard` ユーザーのパスワードを自分で決め、Windows のユーザー環境変数 `TASKBOARD_DB_PASSWORD` に入れる。`compose.yaml` と `application.properties` には `${TASKBOARD_DB_PASSWORD}` とだけ書き、パスワードそのものは書かない（NFR-26）。設定したら VS Code を開き直す |
| 3 | データベースを作る | リポジトリのフォルダで `docker compose up -d`。初回は PostgreSQL のイメージをダウンロードし、ユーザー `taskboard` とデータベース `taskboard` を自動で作る |
| 4 | 画面をビルドする | `frontend` フォルダで `npm install`、`npm run build`。できたファイルは `backend/src/main/resources/static/` に入る（Gitには入れない） |

テーブルは、サーバーを最初に起動したときに Flyway が自動で作ります（9.3）。

### 12.2 起動

1. ターミナルを開き、`backend` フォルダに移動する
2. `.\mvnw.cmd spring-boot:run` を入力する
3. 「Started TaskboardApplication」の表示を確認し、ブラウザで `http://localhost:8080` を開く

データベースは、Docker Desktop が起動すると一緒に動き出す設定（`restart: unless-stopped`）なので、ふだんは起動の操作はいりません。動いていないときは、リポジトリのフォルダで `docker compose up -d` を入力します。

Docker Desktop は、Windows にサインインすると自動で起動するように設定しておきます（Docker Desktop の Settings → General → 「Start Docker Desktop when you sign in to your computer」）。

画面のプログラムを変えたときは、起動の前に 12.1 の4（ビルド）をやり直します。

### 12.3 停止

- ターミナルで Ctrl+C を押す
- 保存は操作のたびに終わっているので、止める前に何かをする必要はない
- データベース（Docker）は止めなくてよい。止めたいときは、リポジトリのフォルダで `docker compose stop`

### 12.4 バックアップと復元

| 項目 | 内容 |
| --- | --- |
| いつ | 月に1回、およびテーブルの形を変える作業（新しいマイグレーションの追加）の前 |
| どうやって | リポジトリのフォルダで `docker compose exec -T db pg_dump -U taskboard -d taskboard -F c > 保存先\taskboard-年月日.dump`（コンテナの中の PostgreSQL 付属のコマンドで、データベース全体を1つのファイルに書き出す）。PowerShell ではなくコマンドプロンプトか Git Bash で実行する（PowerShell の `>` はファイルの中身を変えてしまうため） |
| 保存先 | アプリのフォルダとは別のフォルダ（例：`ドキュメント\taskboard-backup`）。Gitには入れない |
| 何世代残すか | 直近3回分。それより古いものは削除する |
| 復元 | サーバーを止め、`docker compose exec -T db pg_restore -U taskboard -d taskboard --clean < バックアップのファイル` で戻し、サーバーを起動する（バックアップと同じく、コマンドプロンプトか Git Bash で実行する） |

### 12.5 障害時の対応

| 症状 | 確認すること | 対応 |
| --- | --- | --- |
| ブラウザに「このサイトにアクセスできません」 | サーバーを起動したか | 起動する（12.2） |
| 画面に赤い文字「保存できませんでした」 | ターミナルにエラーが出ていないか | エラー内容を読む。サーバーが止まっていれば起動し直す |
| 起動時に「Port 8080 was already in use」、画面の起動時に「Port 5173 is already in use」 | 8080番・5173番をほかのアプリが使っていないか（前に起動したサーバーが残っていないか） | 前に起動したターミナルで Ctrl + C を押すか、リポジトリのフォルダで `./.claude/skills/start-servers/scripts/free-port.ps1 -Port 8080`（または `5173`）を実行して、使っているプロセスを止める。**別のポートで起動してはいけない**（12.6） |
| 起動時に「Connection refused」など、データベースにつながらないエラー | Docker Desktop が起動しているか。`docker compose ps` で `db` が `healthy` か | Docker Desktop を起動する。`db` がなければ `docker compose up -d` |
| `docker compose up -d` で「port is already allocated」 | 5432番をほかのアプリが使っていないか（Windows 版 PostgreSQL のサービス `postgresql-x64-18` が動いていないか） | そのアプリ・サービスを止める |
| 起動時に「password authentication failed」 | 環境変数 `TASKBOARD_DB_PASSWORD` が正しいか | 設定し直し、VS Code を開き直す。データベースを最初に作ったあとにパスワードを変えた場合は、データベース側のパスワードは変わらないので注意 |
| 画面が真っ白、または古い画面のまま | 画面をビルドしたか | 12.1 の4をやり直す |
| データがおかしい・消えた | pgAdmin で `lists`・`cards` テーブルの中身を見る | バックアップから戻す（12.4） |

### 12.6 開発中の起動

開発中は、ターミナルを2つ使います（8.2）。

1. ターミナル1：`backend` フォルダで `.\mvnw.cmd spring-boot:run`
2. ターミナル2：`frontend` フォルダで `npm.cmd run dev`（PowerShell では `npm` だとスクリプトの実行が止められるため `npm.cmd` と打つ）
3. ブラウザで `http://localhost:5173` を開く

ポートは必ず、バックエンド **8080**、画面 **5173** を使う。ふさがっているときは、使っているプロセスを止めてから同じポートで起動する（12.5）。別のポートで一時的に起動するのも禁止（発注者の指示、v2.5）。画面の開発サーバーは `strictPort` の設定で、5173 がふさがっていると別のポートへ逃げずにエラーで止まる。

## 13. 技術選定

v2.0で、発注者から次の指定がありました。

- バックエンドは Java と Spring Boot
- フロントエンドは React（Next.js は対象外）
- データベースは PostgreSQL
- それ以外は、上の言語・フレームワークに合わせて選ぶ

それ以外の技術の評価のものさしは、①指定の技術と組み合わせて使うのが一般的か（資料が多いか）、②手軽に動かせるか（入れるものが少ないか）、③作る手間、の3つです。

### 13.1 画面（フロントエンド）

| 領域 | 候補 | 採用 | 理由 |
| --- | --- | --- | --- |
| 画面作り | React | **React**（指定） | 発注者の指定。Next.js は使わない |
| 言語 | JavaScript ／ TypeScript | TypeScript | v2.6 で JavaScript から変更（発注者の判断）。講座の先生のプロジェクトが TypeScript なので、先生の画面や説明と見比べやすくするため。型を書いておくと、名前の書き間違いなどを動かす前に見つけられる。画面のファイルが少ないうちに切り替えた。最初（v2.0〜v2.5）は「覚えることを減らす」ために JavaScript を選んでいた |
| ビルドツール | Vite ／ Create React App ／ webpack を自分で設定 | Vite | ①Next.js を使わずにReactで作るときの定番。Create React App は開発が終わっている。③webpack は設定が多い |
| ドラッグ&ドロップ | dnd-kit ／ @hello-pangea/dnd ／ SortableJS（react-sortablejs） | dnd-kit | ①React向けで広く使われ、リストをまたぐ移動と並べ替え（F-08・F-09）の例が多い。ライセンスはMIT。SortableJS は画面を直接書き換えるため、Reactと組み合わせると食い違いが起きやすい |
| データの持ち方 | React標準（useState・useReducer） ／ Redux ／ Zustand | React標準 | ③画面が1つで、データもボード1枚だけなので、追加のライブラリはいらない。useReducer で「データを変える処理」をまとめる（NFR-12） |
| APIの呼び出し | fetch ／ axios ／ TanStack Query | fetch | ②ブラウザ標準で、何も入れなくてよい。呼び出しは `api` フォルダにまとめる |
| 見た目 | 素のCSS（CSS Modules） ／ Tailwind CSS ／ MUI | CSS Modules | ①Vite で設定なしに使える。②画面プロトタイプ（`prototype/style.css`）をほぼそのまま使える。部品ごとにCSSを分けられ、名前がぶつからない |
| 実行環境 | Node.js（LTS版） | Node.js（LTS版） | Vite・npm を動かすのに必要。ビルドしたあと、ふだん使うときは不要 |

### 13.2 バックエンド

| 領域 | 候補 | 採用 | 理由 |
| --- | --- | --- | --- |
| 言語・フレームワーク | Java ＋ Spring Boot | **Java ＋ Spring Boot**（指定） | 発注者の指定 |
| Javaの版 | 17 ／ 21 ／ 25（いずれも長期サポート版） | 25 | 発注者の方針「安定版の最新を使う」に合わせ、最新の長期サポート版にする。出てから1年以上たっていて安定しており、Spring Boot 4.1.2 で使える。JDK は無料の Eclipse Temurin を使う（比べた版は13.4） |
| ビルドツール | Maven ／ Gradle | Maven | ①Spring Boot の資料・現場で多い。設定（`pom.xml`）の書き方が決まっていて読みやすい。Maven Wrapper（`mvnw`）を使うので、Maven自体を入れなくてよい |
| データベースの読み書き | Spring Data JPA ／ MyBatis ／ JdbcClient（SQLを直接書く） | Spring Data JPA | ①Spring Boot 標準で資料が多い。③簡単な読み書きはSQLを書かずに済む。並べ替えなど複雑な処理だけ、必要に応じてクエリを書く |
| テーブルの作成・変更 | Flyway ／ Liquibase ／ 手でSQLを実行 | Flyway | ①Spring Boot が標準で対応。SQLファイルをそのまま書けるので、テーブル定義（9.2）と見比べやすい。「最初の1回だけ初期データを入れる」（9.3）が自然にできる |
| 入力チェック | Bean Validation ／ 自分で書く | Bean Validation | ①Spring Boot 標準。`@Size(max = 200)` のように、ルールを項目の横に書ける（NFR-22） |
| データの受け渡しの形 | Java の record ／ 普通のクラス ＋ Lombok | record | ③短く書ける。Lombok は便利だが、見えないところでコードが作られ、学習中は分かりにくい |
| 画面の配り方 | Spring Boot が配る ／ 画面用に別のサーバーを立てる | Spring Boot が配る | ②起動するのが1つで済み、オリジンが同じになる（8.1） |
| 画面とバックエンドのやりとり | REST API（JSON） ／ GraphQL | REST API（JSON） | ①最も一般的で、学習資料が多い。ブラウザ標準の `fetch` で呼べる |

### 13.3 データベース・その他

| 領域 | 候補 | 採用 | 理由 |
| --- | --- | --- | --- |
| データベース | PostgreSQL | **PostgreSQL**（指定） | 発注者の指定 |
| PostgreSQL の動かし方 | Windows版インストーラー ／ Docker（Docker Compose） | Docker | 発注者の指示（v2.1で変更）。①講座・現場で一般的。②設定が `compose.yaml` 1つにまとまり、Gitで管理できる。作り直しもコマンド1つでできる。v2.0では Windows 版を選んで入れたが、サービスは止めて自動で動かない設定にした（pgAdmin を使うため、アンインストールはしない） |
| データベースの中身を見るツール | pgAdmin ／ psql ／ VS Code の拡張機能 | pgAdmin | ②Windows 版 PostgreSQL と一緒にすでに入っている。`localhost:5432` の `taskboard` に接続すると、Docker のデータベースの中身を画面で見られる（AT-35など） |
| テスト | 手動（受入テスト表） ／ 自動テスト | 手動 | 機能が少なく、画面操作が中心のため。自動テスト（JUnit・Vitest）は今後の学習課題（19章） |
| 書き方・バグの自動チェック | 画面：oxlint ／ ESLint。バックエンド：Checkstyle・SpotBugs ／ PMD ／ なし | 画面は oxlint、バックエンドは Checkstyle（書き方）と SpotBugs（バグになりやすい書き方） | 講座の先生の指示（v2.15）。oxlint は Vite のひな型に入っている。Checkstyle と SpotBugs は Java で広く使われ、役割が違うので両方使う。最初はゆるめの設定にする。動かし方：画面は `frontend` で `npm.cmd run lint`、バックエンドは `backend` で `.\mvnw.cmd compile checkstyle:check spotbugs:check` |
| バージョン管理 | Git ／ なし | Git ＋ GitHub（イシュー・ブランチ・プルリクエスト） | 変更の記録と、壊したときに戻すため。v2.2で、イシューとブランチで作業を分け、main はプルリクエストからしか変えられないようにした（GitHub のルールセットで main を保護、Claude Code のフックで main への commit・push を止める） |
| エディタ | VS Code | VS Code | 学習中のエディタ。Java の拡張機能（Extension Pack for Java・Spring Boot Extension Pack）を入れる |
| ER図 | Mermaid ／ 作図ツール | Mermaid | 文字で書けるので、要件定義書と一緒にGitで管理できる。GitHubではそのまま図として表示される（VS Codeでは拡張機能が必要） |

### 13.4 使う版（Q-05）

方針：**安定版の最新**を使う。長期サポート版（LTS）がある Java・Node.js は、LTS の中から最新を選ぶ（発注者の方針）。

**比べた版**（2026-11-19 時点）

| ソフト | 版の候補 | 選んだ版 | 理由 |
| --- | --- | --- | --- |
| Java | LTS：8（2014年）／ 11（2018年）／ 17（2021年）／ 21（2023年）／ **25（2025年）**。LTSでない 26・27 は候補から外す | 25 | 最新のLTS。17 は Spring Boot 4 で使える最も古い版、21 は1つ前のLTS |
| Spring Boot | 4.0.9 ／ **4.1.2**（4.2.0 は試験版の RC2） | 4.1.2 | 最新の安定版。試験版（RC・SNAPSHOT）は使わない |
| Node.js | LTS：20（Iron）／ 22（Jod）／ 24（Krypton）／ **26（Lithium）** | 26 | 最新のLTS（2026-11-21 に 26.13.1 で確定） |
| React | 最新の安定版 19.3.1 | 19.3.1 | React には LTS の仕組みがないので、最新の安定版を使う（2026-11-21 に確定） |
| Vite | 最新の安定版 8.3.8 | 8.3.8 | 同上 |
| TypeScript | 最新の安定版 7.0.2 | 7.0.2 | 同上（v2.6 で JavaScript から切り替えたときに追加） |

**決まった版**

| ソフト・ライブラリ | 版 | 決めた日 |
| --- | --- | --- |
| JDK（Eclipse Temurin） | 25.0.5 | 2026-11-19 |
| Spring Boot | 4.1.2 | 2026-11-19 |
| Maven（Maven Wrapper で自動で入る） | 3.10.1 | 2026-11-19 |
| Spring Framework（Spring Boot が選ぶ） | 7.0.10 | 2026-11-21 |
| Spring Data JPA（Spring Boot が選ぶ） | 4.1.2 | 2026-11-21 |
| Hibernate ORM（JPA の中身。Spring Boot が選ぶ） | 7.4.13.Final | 2026-11-21 |
| Hibernate Validator（入力チェック。Spring Boot が選ぶ） | 9.1.5.Final | 2026-11-21 |
| Flyway（テーブルを作る道具。Spring Boot が選ぶ） | 12.4.0（flyway-core・flyway-database-postgresql） | 2026-11-21 |
| PostgreSQL JDBC ドライバー（Java から PostgreSQL につなぐ部品。Spring Boot が選ぶ） | 42.7.14 | 2026-11-21 |
| HikariCP（データベースへの接続をまとめて管理する部品。Spring Boot が選ぶ） | 7.0.2 | 2026-11-21 |
| Tomcat（Spring Boot の中で動く Web サーバー。Spring Boot が選ぶ） | 11.0.27 | 2026-11-21 |
| Jackson（JSON に変換する部品。Spring Boot が選ぶ） | 3.1.7 | 2026-11-21 |
| PostgreSQL（Docker イメージ `postgres:18.7`） | 18.7（今サポートされている 15〜18 のうち最新） | 2026-11-20 |
| Docker Desktop | 29.9.3（Docker Compose v5.7.0） | 2026-11-20 |
| Node.js（LTS） | 26.13.1（npm 11.20.0） | 2026-11-21 |
| React | 19.3.1 | 2026-11-21 |
| React DOM（React の画面をブラウザに表示する部分） | 19.3.1（React と同じ版にする） | 2026-11-21 |
| Vite | 8.3.8（ひな型は create-vite 9.3.4。v2.6 で TypeScript 版（react-ts）の形に合わせた） | 2026-11-21 |
| @vitejs/plugin-react（Vite で React を使うための部品） | 6.3.0 | 2026-11-21 |
| TypeScript | 7.0.2 | 2026-11-21 |
| @types/react・@types/react-dom（React の型の説明書） | 19.3.0 | 2026-11-21 |
| @types/node（Node.js の型の説明書） | 26.6.6（Node.js 26 に合わせた。ひな型の指定は 24 系） | 2026-11-21 |
| oxlint（書き方のチェック） | 1.94.0（Vite のひな型が ESLint の代わりに入れるもの） | 2026-11-21 |
| Checkstyle（Java の書き方のチェック） | 14.4.0（maven-checkstyle-plugin 3.6.0） | 2026-11-23 |
| SpotBugs（Java のバグのチェック） | 4.10.5（spotbugs-maven-plugin 4.10.5.0） | 2026-11-23 |
| dnd-kit（ドラッグ&ドロップ） | @dnd-kit/core 6.3.1、@dnd-kit/sortable 10.0.0、@dnd-kit/utilities 3.2.2（安定版の最新。0.x の試験版 @dnd-kit/react は使わない） | 2026-11-22 |

「Spring Boot が選ぶ」と書いたものは、`pom.xml` で版を指定していない。Spring Boot 4.1.2 が、一緒に動くことを確かめた版を自動で選ぶ（Spring Boot の版を上げると、これらも一緒に上がる）。今の版は `backend` フォルダで `.\mvnw.cmd dependency:list` を実行すると確かめられる。画面のライブラリの版は `frontend` フォルダで `npm.cmd ls` で確かめられる。

### 13.5 ファイル構成

```
（リポジトリ）
├── compose.yaml                 データベース（PostgreSQL）を Docker で動かす設定
├── docs/requirements/           要件定義書
├── prototype/                   画面プロトタイプ（見た目の参考。アプリ本体では使わない）
├── frontend/                    画面（React）
│   ├── package.json             使うライブラリの一覧
│   ├── package-lock.json        ライブラリの版の固定（NFR-28）
│   ├── vite.config.ts           開発中に /api をバックエンドへ中継する設定、ポート（5173）、ビルド先の設定
│   ├── tsconfig*.json           TypeScript の型チェックの設定（3つ。Vite のひな型のまま）
│   ├── .oxlintrc.json           書き方のチェック（oxlint）の設定
│   ├── index.html
│   └── src/
│       ├── main.tsx             入口
│       ├── types.ts             APIでやりとりするデータの形（型）
│       ├── App.tsx              ボード画面全体
│       ├── components/          画面の部品（Board・ListColumn・Card・CardDialog など）
│       ├── state/               データを変える処理（useReducer）
│       └── api/                 APIを呼ぶ処理
└── backend/                     バックエンド（Spring Boot）
    ├── pom.xml                  使うライブラリの一覧と版（NFR-28）
    ├── mvnw / mvnw.cmd          Maven Wrapper
    ├── checkstyle.xml           書き方のチェック（Checkstyle）の設定
    ├── spotbugs-exclude.xml     バグのチェック（SpotBugs）で例外にするものと、その理由
    ├── db/test-data.sql         動作確認用のテストデータ（手で入れる。Flyway では入れない。入れ方はファイルの先頭）
    └── src/main/
        ├── java/…/taskboard/
        │   ├── controller/      受付：URLとメソッドごとの入口（API-01〜09）
        │   ├── service/         処理：並び順の振り直し・並べ替えなど（トランザクション）
        │   ├── repository/      データベースの読み書き
        │   ├── entity/          テーブルと対応するクラス
        │   └── dto/             APIで受け渡すデータの形（record）
        └── resources/
            ├── application.properties   ポート・接続先などの設定（パスワードは書かない）
            ├── db/migration/            Flyway のSQLファイル（9.3）
            └── static/                  ビルドした画面（Gitに入れない）
```

`.gitignore` には、`frontend/node_modules/`・`frontend/dist/`・`backend/target/`・`backend/src/main/resources/static/` と、バックアップのファイル（`*.dump`）を入れます。

---

[← 前：④ システム設計](04-system-design.md) ｜ [目次](README.md) ｜ [次：⑥ 受入基準とテスト →](06-acceptance.md)
