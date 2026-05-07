package com.banking.service.impl;

import com.banking.dto.AccountResponse;
import com.banking.dto.TransactionRequest;
import com.banking.dto.TransactionResponse;
import com.banking.dto.TransferRequest;
import com.banking.exception.InsufficientBalanceException;
import com.banking.exception.ResourceNotFoundException;
import com.banking.model.Account;
import com.banking.model.Transaction;
import com.banking.model.TransactionType;
import com.banking.model.User;
import com.banking.repository.AccountRepository;
import com.banking.repository.TransactionRepository;
import com.banking.repository.UserRepository;
import com.banking.service.AccountService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AccountServiceImpl(AccountRepository accountRepository, UserRepository userRepository,
            TransactionRepository transactionRepository) {
        this.accountRepository = accountRepository;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional
    public AccountResponse createAccount(String email, BigDecimal initialBalance) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (initialBalance.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Initial balance cannot be negative");
        }

        Account account = Account.builder()
                .accountNumber(generateAccountNumber())
                .balance(initialBalance)
                .user(user)
                .build();

        account = accountRepository.save(account);

        if (initialBalance.compareTo(BigDecimal.ZERO) > 0) {
            saveTransaction(account, TransactionType.DEPOSIT, initialBalance, null);
        }

        return mapToAccountResponse(account);
    }

    @Override
    public AccountResponse getAccount(String email, Long id) {
        Account account = getOwnedAccountById(id, email);
        return mapToAccountResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse deposit(String email, TransactionRequest request) {
        Account account = getOwnedAccountById(request.getAccountId(), email);

        account.setBalance(account.getBalance().add(request.getAmount()));
        accountRepository.save(account);

        saveTransaction(account, TransactionType.DEPOSIT, request.getAmount(), null);

        return mapToAccountResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse withdraw(String email, TransactionRequest request) {
        Account account = getOwnedAccountById(request.getAccountId(), email);

        if (account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));
        accountRepository.save(account);

        saveTransaction(account, TransactionType.WITHDRAWAL, request.getAmount(), null);

        return mapToAccountResponse(account);
    }

    @Override
    @Transactional
    public AccountResponse transfer(String email, TransferRequest request) {
        Account fromAccount = getOwnedAccountById(request.getFromAccountId(), email);
        Account toAccount = getAccountById(request.getToAccountId());

        if (fromAccount.getId().equals(toAccount.getId())) {
            throw new IllegalArgumentException("Cannot transfer to the same account");
        }

        if (fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Insufficient balance for transfer");
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        saveTransaction(fromAccount, TransactionType.TRANSFER, request.getAmount(), toAccount.getId());
        saveTransaction(toAccount, TransactionType.DEPOSIT, request.getAmount(), fromAccount.getId());

        return mapToAccountResponse(fromAccount);
    }

    @Override
    public Page<TransactionResponse> getTransactionHistory(String email, Long accountId, int page, int size) {
        getOwnedAccountById(accountId, email);
        Pageable pageable = PageRequest.of(page, size);
        Page<Transaction> transactions = transactionRepository.findByAccountIdOrderByTimestampDesc(accountId, pageable);
        return transactions.map(this::mapToTransactionResponse);
    }

    private Account getAccountById(Long id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }

    private Account getOwnedAccountById(Long id, String email) {
        return accountRepository.findByIdAndUserEmail(id, email)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found with ID: " + id));
    }

    private String generateAccountNumber() {
        return "AC" + UUID.randomUUID().toString().replaceAll("-", "").substring(0, 10).toUpperCase();
    }

    private void saveTransaction(Account account, TransactionType type, BigDecimal amount, Long targetAccountId) {
        Transaction transaction = Transaction.builder()
                .account(account)
                .type(type)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .targetAccountId(targetAccountId)
                .build();
        transactionRepository.save(transaction);
    }

    private AccountResponse mapToAccountResponse(Account account) {
        return AccountResponse.builder()
                .id(account.getId())
                .accountNumber(account.getAccountNumber())
                .balance(account.getBalance())
                .userName(account.getUser().getName())
                .build();
    }

    private TransactionResponse mapToTransactionResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .type(transaction.getType())
                .amount(transaction.getAmount())
                .timestamp(transaction.getTimestamp())
                .accountNumber(transaction.getAccount().getAccountNumber())
                .targetAccountId(transaction.getTargetAccountId())
                .build();
    }
}
