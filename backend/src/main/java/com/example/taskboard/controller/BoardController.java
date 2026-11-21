package com.example.taskboard.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.taskboard.dto.BoardResponse;
import com.example.taskboard.service.BoardService;

/**
 * ボードについての API の受付。
 */
@RestController
@RequestMapping("/api")
public class BoardController {

    private final BoardService boardService;

    public BoardController(BoardService boardService) {
        this.boardService = boardService;
    }

    /** API-01：ボード全体を読み込む */
    @GetMapping("/board")
    public BoardResponse getBoard() {
        return boardService.getBoard();
    }
}
