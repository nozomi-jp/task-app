package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.taskboard.entity.TaskList;

/**
 * lists テーブルを読み書きする。
 * メソッド名から Spring Data JPA が SQL を作る（SELECT ... ORDER BY position）。
 */
public interface TaskListRepository extends JpaRepository<TaskList, Long> {

    /** すべてのリストを並び順（左から）に取り出す */
    List<TaskList> findAllByOrderByPositionAsc();

    /** 一番最後（右）のリストの並び順を調べる。リストが1つもなければ -1。新しいリストは、この次（+1）の位置に置く */
    @Query("select coalesce(max(l.position), -1) from TaskList l")
    int findMaxPosition();
}
