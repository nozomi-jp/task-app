package com.example.taskboard.controller;

import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import com.example.taskboard.service.NotFoundException;

/**
 * API のエラーの返し方を1か所でそろえる（要件定義書 10章）。
 * どのエラーも {"error": "理由"} の形で返し、画面はこの理由をそのまま表示する。
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(ApiExceptionHandler.class);

    /** 400：送られたデータがルールに合わない（空欄、201文字など） */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleInvalid(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(error -> error.getDefaultMessage())
                .orElse("送られたデータがルールに合いません");
        return Map.of("error", message);
    }

    /** 400：JSON の形になっていない、URL の ID が数でない */
    @ExceptionHandler({ HttpMessageNotReadableException.class, MethodArgumentTypeMismatchException.class })
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public Map<String, String> handleUnreadable(Exception e) {
        return Map.of("error", "送られたデータの形が正しくありません");
    }

    /** 404：指定したリスト・カードがない */
    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public Map<String, String> handleNotFound(NotFoundException e) {
        return Map.of("error", e.getMessage());
    }

    /**
     * そのほかのエラー。
     * 存在しない URL（404）や、対応していないメソッド（405）のように Spring が番号を知っているエラーは、その番号で返す。
     * それ以外は 500（予期しないエラー）。中身はログ（ターミナル）に出し、画面には詳しく見せない（NFR-25）。
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleOther(Exception e) {
        if (e instanceof ErrorResponse errorResponse) {
            HttpStatusCode status = errorResponse.getStatusCode();
            return ResponseEntity.status(status).body(Map.of("error", "リクエストを受け付けられません（" + status.value() + "）"));
        }
        log.error("予期しないエラーが起きました", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "サーバーで予期しないエラーが起きました"));
    }
}
