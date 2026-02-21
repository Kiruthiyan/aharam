package com.aharam.tuition;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EntityScan(basePackages = "com.aharam.tuition.entity")
@EnableJpaRepositories(basePackages = "com.aharam.tuition.repository")
public class TuitionManagementApplication {

	public static void main(String[] args) {
		SpringApplication.run(TuitionManagementApplication.class, args);
	}

}
