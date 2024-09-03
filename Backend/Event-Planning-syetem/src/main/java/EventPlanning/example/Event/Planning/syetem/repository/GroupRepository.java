package EventPlanning.example.Event.Planning.syetem.repository;


import EventPlanning.example.Event.Planning.syetem.model.Group;
import EventPlanning.example.Event.Planning.syetem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroupRepository extends JpaRepository<Group, Long> {

    List<Group> findByGroupCodeIn(List<String> groupCode);
    boolean existsByGroupCode(String groupCode);


}
