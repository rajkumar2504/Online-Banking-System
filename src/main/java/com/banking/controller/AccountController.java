package com.banking.controller;

import com.banking.dto.AccountResponse;
import com.banking.dto.TransactionRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.TransferRequest;
import com.banking.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/account")
public class AccountController {

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/create")
    public ResponseEntity<AccountResponse> createAccount(Authentication authentication,
            @RequestBody Map<String, BigDecimal> request) {
        String email = authentication.getName();
        BigDecimal initialBalance = request.getOrDefault("initialBalance", BigDecimal.ZERO);
        return new ResponseEntity<>(accountService.createAccount(email, initialBalance), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccount(@PathVariable Long id) {
        return ResponseEntity.ok(accountService.getAccount(id));
    }

    @PostMapping("/deposit")
    public ResponseEntity<AccountResponse> deposit(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.deposit(request));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<AccountResponse> withdraw(@Valid @RequestBody TransactionRequest request) {
        return ResponseEntity.ok(accountService.withdraw(request));
    }

    @PostMapping("/transfer")
    public ResponseEntity<AccountResponse> transfer(@Valid @RequestBody TransferRequest request) {
        return ResponseEntity.ok(accountService.transfer(request));
    }

    @GetMapping("/transactions/{accountId}")
    public ResponseEntity<Page<TransactionResponse>> getTransactionHistory(
            @PathVariable Long accountId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(accountService.getTransactionHistory(accountId, page, size));
    }
}
