package com.example.taskboard.entity;

import java.time.LocalDate;

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

    /** どのリストに入っているか（lists.id） */
    @Column(name = "list_id", nullable = false)
    private Long listId;

    @Column(nullable = false, length = 200)
    private String text;

    /** 期限。なければ null */
    @Column(name = "due_date")
    private LocalDate dueDate;

    /** 優先度（high / medium / low）。なければ null */
    @Column(length = 6)
    private String priority;

    /** リストの中での並び順（0始まり、上から） */
    @Column(nullable = false)
    private Integer position;

    protected Card() {
        // JPA が使う
    }

    /**
     * 新しいカードを作る（F-05）。期限と優先度は付けない。
     * id は保存したときにデータベースが決める。created_at・updated_at はデータベースの初期値（now()）が入る。
     */
    public Card(Long listId, String text, Integer position) {
        this.listId = listId;
        this.text = text;
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
