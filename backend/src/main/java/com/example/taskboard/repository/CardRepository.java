package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.taskboard.entity.Card;

/**
 * cards テーブルを読み書きする。
 */
public interface CardRepository extends JpaRepository<Card, Long> {

    /** すべてのカードを、リストごと・並び順（上から）に取り出す */
    List<Card> findAllByOrderByListIdAscPositionAsc();
}
