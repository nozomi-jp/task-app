package com.example.taskboard.controller;

import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 動作確認用のAPI。
 * ブラウザで http://localhost:8080/api/hello を開くと、JSONが返ってくる。
 * ボードのAPI（API-01〜09）ができたら削除する。
 */
@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public Map<String, String> hello() {
        return Map.of("message", "Hello, Taskboard!");
    }
}
