package com.banking.service;

import com.banking.dto.AccountResponse;
import com.banking.dto.TransactionRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.TransferRequest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;

public interface AccountService {
    AccountResponse createAccount(String email, BigDecimal initialBalance);

    AccountResponse getAccount(Long id);

    AccountResponse deposit(TransactionRequest request);

    AccountResponse withdraw(TransactionRequest request);

    AccountResponse transfer(TransferRequest request);

    Page<TransactionResponse> getTransactionHistory(Long accountId, int page, int size);
}
