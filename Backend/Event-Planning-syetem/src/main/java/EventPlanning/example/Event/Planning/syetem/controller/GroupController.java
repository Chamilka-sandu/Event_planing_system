package EventPlanning.example.Event.Planning.syetem.controller;

import EventPlanning.example.Event.Planning.syetem.model.Group;
import EventPlanning.example.Event.Planning.syetem.model.User;
import EventPlanning.example.Event.Planning.syetem.service.GroupService;
import EventPlanning.example.Event.Planning.syetem.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    @Autowired
    private GroupService groupService;

    @Autowired
    private UserService userService;

    // Create a new group
    @PostMapping

    public ResponseEntity<?> createGroup(@RequestBody Group group) {
        try {
            List<User> members = userService.getUsersByIds(
                    group.getGroupMembers().stream()
                            .map(User::getUserId)
                            .collect(Collectors.toList())
            );
            group.setGroupMembers(members);
            Group createdGroup = groupService.saveGroup(group);
            return ResponseEntity.status(201).body(createdGroup);
        } catch (IllegalStateException e) {
            return ResponseEntity.status(400).body("Group code already exists");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(null);
        }
    }



    // Get all groups
    @GetMapping
    public ResponseEntity<List<Group>> getAllGroups() {
        try {
            List<Group> groups = groupService.getAllGroups();
            if (groups.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(groups, HttpStatus.OK);
        } catch (Exception e) {
            // Log the exception for debugging
            // logger.error("Error fetching groups", e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Get a group by ID
    @GetMapping("/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable("id") Long id) {
        try {
            Optional<Group> group = groupService.getGroupById(id);
            return group.map(g -> new ResponseEntity<>(g, HttpStatus.OK))
                    .orElseGet(() -> new ResponseEntity<>(HttpStatus.NOT_FOUND));
        } catch (Exception e) {
            // Log the exception for debugging
            // logger.error("Error fetching group by ID", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }



    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGroup(@PathVariable Long id) {
        try {
            groupService.deleteGroup(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable Long id, @RequestBody Group groupDetails) {
        Group updatedGroup = groupService.editGroup(id, groupDetails);
        return ResponseEntity.ok(updatedGroup);
    }
}
