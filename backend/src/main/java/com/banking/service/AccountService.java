package com.banking.service;

import com.banking.dto.AccountResponse;
import com.banking.dto.TransactionRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.TransferRequest;
import org.springframework.data.domain.Page;

import java.math.BigDecimal;
import java.util.List;

public interface AccountService {
    AccountResponse createAccount(String email, BigDecimal initialBalance);

    AccountResponse getAccount(String email, Long id);

    List<AccountResponse> getMyAccounts(String email);

    AccountResponse deposit(String email, TransactionRequest request);

    AccountResponse withdraw(String email, TransactionRequest request);

    AccountResponse transfer(String email, TransferRequest request);

    Page<TransactionResponse> getTransactionHistory(String email, Long accountId, int page, int size);
}
