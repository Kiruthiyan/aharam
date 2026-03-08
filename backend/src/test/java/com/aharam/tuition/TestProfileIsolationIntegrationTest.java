package com.aharam.tuition;

import com.aharam.tuition.support.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class TestProfileIsolationIntegrationTest extends IntegrationTestBase {

    @Autowired
    private Environment environment;

    @Test
    void shouldLoadIsolatedTestProfileConfiguration() {
        assertThat(Arrays.asList(environment.getActiveProfiles())).contains("test");
        assertThat(environment.getProperty("spring.datasource.url")).contains("jdbc:postgresql://");
        assertThat(environment.getProperty("spring.datasource.url")).doesNotContain("aharam_db");
        assertThat(environment.getProperty("notification.provider")).isEqualTo("mock");
    }
}
