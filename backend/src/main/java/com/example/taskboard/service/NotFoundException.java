package com.example.taskboard.service;

/**
 * 指定されたリスト・カードがないときのエラー。API では 404 を返す（要件定義書 10章）。
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
