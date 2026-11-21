package com.example.taskboard.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.taskboard.entity.Card;

/**
 * cards テーブルを読み書きする。
 */
public interface CardRepository extends JpaRepository<Card, Long> {

    /** すべてのカードを、リストごと・並び順（上から）に取り出す */
    List<Card> findAllByOrderByListIdAscPositionAsc();

    /**
     * あるリストの中で、いちばん下のカードの並び順を調べる。カードが1枚もなければ -1。
     * 新しいカードは、この次（+1）の位置に置く。
     * 値はプレースホルダ（:listId）で渡すので、SQL インジェクションの心配はない（NFR-23）。
     */
    @Query("select coalesce(max(c.position), -1) from Card c where c.listId = :listId")
    int findMaxPositionByListId(@Param("listId") Long listId);
}
