package EventPlanning.example.Event.Planning.syetem.repository;

import EventPlanning.example.Event.Planning.syetem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

        /**
         * Finds users by their user IDs.
         *
         * @param userIds List of user IDs to search for.
         * @return List of users with matching IDs.
         */
        List<User> findByUserIdIn(List<String> userIds);

        /**
         * Finds a user by their user ID.
         *
         * @param userId The user ID to search for.
         * @return An Optional containing the user if found, or empty if not found.
         */
        Optional<User> findByUserId(String userId);

}
