package de.naresea.art_library_backend.model.repository;

import de.naresea.art_library_backend.model.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);
}
