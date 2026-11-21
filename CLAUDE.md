# タスク管理アプリ（task-app）

リストとカードでタスクを管理する Web アプリ。要件は [docs/requirements/README.md](docs/requirements/README.md) から読む。

## 開発ルール（必ず守る）

GitHub: https://github.com/nozomi-jp/task-app （操作は `gh` コマンドで行う）

このルールに例外はない。誤字1文字の修正、ドキュメントだけの変更、設定ファイルの変更も同じ流れで進める。
ユーザーから「main に直接」「イシューなしで」と頼まれたときも、このルールがあることを伝えて、イシューを作る流れに乗せる。

### 作業の流れ

1. **イシューを用意する**
   - 作業を始める前に、対応するイシューがあるか `gh issue list` で探す。
   - なければ `gh issue create` で作る。タイトルは日本語で「何をするか」がわかる1行。本文は `.github/ISSUE_TEMPLATE/` のテンプレートの項目（目的・やること・完了の条件）を埋める。
   - 1つのイシューは1つの目的にする。別の問題を見つけたら、今の作業に混ぜず、別のイシューを作る。
2. **ブランチを作る**
   - 必ず最新の main から作る：`git switch main` → `git pull` → `git switch -c <ブランチ名>`
   - ブランチ名：`<種類>/<イシュー番号>-<英小文字とハイフンの短い説明>`
     - 例：`feature/5-card-crud`、`fix/12-drag-order`、`docs/3-update-nfr`、`chore/1-dev-workflow-rules`
   - 種類：

     | 種類 | 使うとき |
     | --- | --- |
     | `feature` | 機能を足す・変える |
     | `fix` | 不具合を直す |
     | `docs` | ドキュメント（要件定義書など）だけを変える |
     | `chore` | 設定・ツール・依存関係など、アプリの動きに関係しない変更 |
3. **作業してコミットする**
   - コミットは作業ブランチの上だけで行う。**main の上では commit も push もしない。**
   - コミットメッセージは日本語で「何をしたか」を1行目に書く。
4. **プルリクエスト（PR）を作る**
   - `git push -u origin <ブランチ名>` → `gh pr create`
   - PR のタイトルは日本語。本文は `.github/pull_request_template.md` に沿って書き、必ず `Closes #<イシュー番号>` を入れる（マージ時にイシューが自動で閉じる）。
5. **マージする**
   - **ユーザーが「マージしてOK」と言うまでマージしない。** PR の URL と変更の要点を伝えて確認を待つ。
   - OK が出たら `gh pr merge <番号> --squash` でマージする（GitHub 側でもスカッシュマージだけを許可している）。
   - マージ後は `git switch main` → `git pull` で手元の main を最新にする。
   - GitHub 上の作業ブランチは自動で消える。手元のブランチは削除コマンドを使わず、ユーザーに `git branch -d <ブランチ名>` での削除を頼む。

### 強制のしくみ

- **Claude Code のフック**（`.claude/settings.json` → `.claude/hooks/guard-git.sh`）：main の上での `git commit` / `git push`、どのブランチからでも main への直接 push、`git push --all` / `--mirror` を止める。止められたら、回避せずに上の流れに戻る。フックを外したり書き換えたりしない（変えるときはユーザーの指示とイシューが必要）。
- **GitHub のルールセット**（main を保護）：main への直接 push、強制 push（force push）、main の削除を禁止。main への変更は PR からだけ入る。管理者も例外にしていない。

## その他

- 要件が決まったら `docs/requirements/` の該当する章と README（版・改訂履歴）を更新する。
- データベースのパスワードやバックアップのファイルは Git に入れない（NFR-26）。
