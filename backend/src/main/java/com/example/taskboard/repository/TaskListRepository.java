package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.taskboard.entity.TaskList;

/**
 * lists テーブルを読み書きする。
 * メソッド名から Spring Data JPA が SQL を作る（SELECT ... ORDER BY position）。
 */
public interface TaskListRepository extends JpaRepository<TaskList, Long> {

    /** すべてのリストを並び順（左から）に取り出す */
    List<TaskList> findAllByOrderByPositionAsc();
}
