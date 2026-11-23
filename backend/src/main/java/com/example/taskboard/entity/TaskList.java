package com.example.taskboard.entity;

import java.time.OffsetDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * lists テーブルの1行（リスト）。
 * クラス名を List にすると Java の java.util.List と紛らわしいので TaskList にしている。
 */
@Entity
@Table(name = "lists")
public class TaskList {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 20)
    private String title;

    /** リストの並び順（0始まり、左から） */
    @Column(nullable = false)
    private Integer position;

    /** 最後に変更した日時。作るときはデータベースの初期値（now()）が入るので、ここからは入れない（insertable = false） */
    @Column(name = "updated_at", insertable = false)
    private OffsetDateTime updatedAt;

    protected TaskList() {
        // JPA が使う
    }

    /** 新しいリストを作る（F-02）。id は保存したときにデータベースが決める。日時はデータベースの初期値（now()）が入る */
    public TaskList(String title, Integer position) {
        this.title = title;
        this.position = position;
    }

    /** 名前を変える（F-03） */
    public void rename(String title) {
        this.title = title;
        this.updatedAt = OffsetDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public Integer getPosition() {
        return position;
    }
}
