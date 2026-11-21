package com.example.taskboard.entity;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * cards テーブルの1行（カード＝タスク）。
 */
@Entity
@Table(name = "cards")
public class Card {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** どのリストに入っているか（lists.id）。リスト＝ステータス（ToDo・進行中・完了など） */
    @Column(name = "list_id", nullable = false)
    private Long listId;

    @Column(nullable = false, length = 200)
    private String text;

    /** 説明。なければ null（改行を含んでよい） */
    @Column(length = 1000)
    private String description;

    /** 期限。なければ null */
    @Column(name = "due_date")
    private LocalDate dueDate;

    /** 優先度（high / medium / low）。なければ null */
    @Column(length = 6)
    private String priority;

    /** リストの中での並び順（0始まり、上から） */
    @Column(nullable = false)
    private Integer position;

    /**
     * 最後に変更した日時。作るときはデータベースの初期値（now()）が入るので、ここからは入れない（insertable = false）。
     * 内容を変えたり移動したりしたときに、今の日時にする。
     */
    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    protected Card() {
        // JPA が使う
    }

    /**
     * 新しいカードを作る（F-05）。説明・期限・優先度は null でもよい。
     * id は保存したときにデータベースが決める。created_at・updated_at はデータベースの初期値（now()）が入る。
     */
    public Card(Long listId, String text, String description, LocalDate dueDate, String priority, Integer position) {
        this.listId = listId;
        this.text = text;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.position = position;
    }

    /** 内容（タイトル・説明・期限・優先度）を書き換える（F-06・F-11・F-12）。null の項目は「なし」にする */
    public void updateContent(String text, String description, LocalDate dueDate, String priority) {
        this.text = text;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.updatedAt = OffsetDateTime.now();
    }

    /** 入っているリストと、リストの中の並び順を変える（移動・並べ替え） */
    public void moveTo(Long listId, int position) {
        if (!listId.equals(this.listId)) {
            this.updatedAt = OffsetDateTime.now();
        }
        this.listId = listId;
        this.position = position;
    }

    /** 並び順だけを振り直す（ほかのカードが移動して、詰めたり空けたりするとき） */
    public void setPosition(int position) {
        this.position = position;
    }

    public Long getId() {
        return id;
    }

    public Long getListId() {
        return listId;
    }

    public String getText() {
        return text;
    }

    public String getDescription() {
        return description;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public String getPriority() {
        return priority;
    }

    public Integer getPosition() {
        return position;
    }
}
