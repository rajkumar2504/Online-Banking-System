package com.banking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OnlineBankingSystemApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void registersAndLogsInUser() throws Exception {
        String email = uniqueEmail("login");

        register(email, "password123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", "password123"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"));
    }

    @Test
    void preventsUsersFromAccessingOrMutatingAccountsTheyDoNotOwn() throws Exception {
        String ownerToken = registerLoginAndCreateToken("owner");
        String otherToken = registerLoginAndCreateToken("other");
        long ownerAccountId = createAccount(ownerToken, new BigDecimal("500.00"));

        mockMvc.perform(get("/api/account/{id}", ownerAccountId)
                        .header("Authorization", bearer(otherToken)))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/account/withdraw")
                        .header("Authorization", bearer(otherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("accountId", ownerAccountId, "amount", new BigDecimal("50.00")))))
                .andExpect(status().isNotFound());

        mockMvc.perform(post("/api/account/deposit")
                        .header("Authorization", bearer(otherToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("accountId", ownerAccountId, "amount", new BigDecimal("50.00")))))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/account/transactions/{accountId}", ownerAccountId)
                        .header("Authorization", bearer(otherToken)))
                .andExpect(status().isNotFound());
    }

    @Test
    void rejectsWithdrawalsWhenBalanceIsInsufficient() throws Exception {
        String token = registerLoginAndCreateToken("balance");
        long accountId = createAccount(token, new BigDecimal("25.00"));

        mockMvc.perform(post("/api/account/withdraw")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("accountId", accountId, "amount", new BigDecimal("30.00")))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Insufficient balance for withdrawal"));
    }

    @Test
    void transfersMoneyAndShowsTransactionHistoryForOwner() throws Exception {
        String sourceToken = registerLoginAndCreateToken("source");
        String targetToken = registerLoginAndCreateToken("target");
        long sourceAccountId = createAccount(sourceToken, new BigDecimal("1000.00"));
        long targetAccountId = createAccount(targetToken, new BigDecimal("100.00"));

        mockMvc.perform(post("/api/account/transfer")
                        .header("Authorization", bearer(sourceToken))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "fromAccountId", sourceAccountId,
                                "toAccountId", targetAccountId,
                                "amount", new BigDecimal("250.00")))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(sourceAccountId))
                .andExpect(jsonPath("$.balance").value(750.00));

        mockMvc.perform(get("/api/account/{id}", targetAccountId)
                        .header("Authorization", bearer(targetToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(350.00));

        mockMvc.perform(get("/api/account/transactions/{accountId}", sourceAccountId)
                        .header("Authorization", bearer(sourceToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].type").value("TRANSFER"))
                .andExpect(jsonPath("$.content[0].amount").value(250.00))
                .andExpect(jsonPath("$.content[0].targetAccountId").value(targetAccountId));
    }

    private String registerLoginAndCreateToken(String prefix) throws Exception {
        String email = uniqueEmail(prefix);
        register(email, "password123");
        return login(email, "password123");
    }

    private void register(String email, String password) throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "name", "Test User",
                                "email", email,
                                "password", password))))
                .andExpect(status().isCreated());
    }

    private String login(String email, String password) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("email", email, "password", password))))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.get("accessToken").asText();
    }

    private long createAccount(String token, BigDecimal initialBalance) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/account/create")
                        .header("Authorization", bearer(token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of("initialBalance", initialBalance))))
                .andExpect(status().isCreated())
                .andReturn();

        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(response.get("id").asLong()).isPositive();
        return response.get("id").asLong();
    }

    private String json(Object value) throws Exception {
        return objectMapper.writeValueAsString(value);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private String uniqueEmail(String prefix) {
        return prefix + "-" + UUID.randomUUID() + "@example.com";
    }
}
